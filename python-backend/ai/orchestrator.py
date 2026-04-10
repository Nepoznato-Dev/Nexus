from typing import Dict, List

from .flux_ingest import derive_flux_tags, scrub_web_context
from .router import resolve_route
from .retrieval import select_chunks
from .stm_scheduler import schedule_modules
from .providers.ollama_provider import generate_with_ollama
from .branch_merge import run_branch_workers, merge_branch_outputs
from .capability_registry import build_capability_registry
from .runtime_guard import evaluate_runtime_policy
from .use_case_router import route_use_case
from .use_case_contracts import apply_use_case_contract
from .stage_processors import (
    analyze_context,
    apply_common_sense,
    apply_personality,
    score_self_awareness,
    apply_self_awareness,
    apply_proactive_help,
    build_memory_artifact,
    render_thought_trace,
)


def _build_prompt(message: str, route: Dict, modules: List[Dict], chunks: List[Dict]) -> str:
    stm_lines = [f"{m['id']} {m['title']}: {m['note']}" for m in modules]
    chunk_lines = [f"{c['id']} (score {c['score']:.2f}): {c['text'][:200]}" for c in chunks]

    parts = [
        "You are A.L.L.O.Y, a local-first reasoning system.",
        f"Route tier: {route['tier']} | model {route['model_size_b']}B {route['quantization']} | cores {route['cores']}",
        "Output rules: direct answer first, no generic capability list, no template scaffolding.",
    ]

    if stm_lines:
        parts.append("Active modules:\n" + "\n".join(stm_lines))
    if chunk_lines:
        parts.append("Retrieved evidence chunks:\n" + "\n".join(chunk_lines))

    parts.append(f"User message:\n{message}")
    parts.append("Answer:")
    return "\n\n".join(parts)


async def run_ai_turn(payload: Dict) -> Dict:
    message = str(payload.get("message") or "").strip()
    user_name = str(payload.get("userName") or "Friend")
    context = payload.get("context") or {}

    stage_artifacts: Dict = {}

    # Stage 1: Context analysis
    context_profile = analyze_context(message, context.get("conversation") or [])
    stage_artifacts["contextAnalysis"] = context_profile

    site_state = payload.get("siteState") or context.get("siteState") or {}

    web_scrub = scrub_web_context(str(context.get("webContext") or ""))
    flux_tags = payload.get("fluxTags") or derive_flux_tags(message, web_scrub["cleaned"])
    requested_mode = payload.get("mode")
    use_case = route_use_case(message, context, flux_tags)
    stage_artifacts["useCaseRouting"] = use_case

    device_profile = payload.get("deviceProfile") or {}
    device_profile["attachmentsCount"] = len(context.get("attachments") or [])
    device_profile["hasWebContext"] = bool(web_scrub["cleaned"])

    route_decision = resolve_route(
        message=message,
        requested_mode=requested_mode,
        flux_tags=flux_tags,
        device_profile=device_profile,
    )

    route = {
        "tier": route_decision.tier,
        "complexity_score": route_decision.complexity_score,
        "model_size_b": route_decision.model_size_b,
        "quantization": route_decision.quantization,
        "cores": route_decision.cores,
        "context_words": route_decision.context_words,
        "requiresDualMerge": route_decision.requires_dual_merge,
        "clamps": route_decision.clamps,
    }
    stage_artifacts["complexityRouting"] = route

    tool_state = payload.get("toolState") or {}
    capability_registry = build_capability_registry(site_state, tool_state)

    # Stage 2: Runtime guard and degradation policy
    runtime_policy = evaluate_runtime_policy(site_state, tool_state)
    stage_artifacts["runtimeGuard"] = runtime_policy
    stage_artifacts["capabilityRegistry"] = capability_registry

    effective_tool_state = dict(tool_state)
    if not runtime_policy.get("allowDeepResearch"):
        effective_tool_state["deepResearch"] = False
        effective_tool_state["thinkLonger"] = False

    user_requires_proof = bool(payload.get("requireProof"))

    modules = schedule_modules(
        message,
        route,
        flux_tags,
        effective_tool_state,
        user_requires_proof,
        capability_registry=capability_registry,
        use_case=str(use_case.get("useCase") or "general-assistance"),
    )
    retrieval = select_chunks(message, context.get("sources") or [], route["tier"])

    # Stage 3: Base response generation
    prompt = _build_prompt(message, route, modules, retrieval["chunks"])
    generated = await generate_with_ollama(prompt, route["tier"])

    if generated.get("ok") and generated.get("text"):
        working_response = generated["text"]
        source = "ollama"
    else:
        working_response = "I could not generate a model-backed response right now. Please retry."
        source = "model-unavailable"

    stage_artifacts["baseResponse"] = {
        "source": source,
        "model": generated.get("model"),
        "hasText": bool(working_response),
    }

    # Optional branch fan-out + merge stage for higher tiers.
    branch_merge_enabled = bool(
        runtime_policy.get("allowBranchMerge")
        and (route.get("requiresDualMerge") or effective_tool_state.get("deepResearch") or effective_tool_state.get("thinkLonger"))
    )
    if branch_merge_enabled:
        branch_result = await run_branch_workers(
            message=message,
            route=route,
            modules=modules,
            chunks=retrieval.get("chunks") or [],
        )
        merged = merge_branch_outputs(working_response, branch_result)
        working_response = merged["text"]

        stage_artifacts["branchMerge"] = {
            "enabled": True,
            "parallelCount": branch_result.get("parallelCount", 0),
            "branchCount": len(branch_result.get("branches") or []),
            "acceptedBranchIds": merged.get("acceptedBranchIds") or [],
            "contradictionCount": merged.get("contradictionCount", 0),
            "proofMap": merged.get("proofMap") or [],
        }

        module_map = {str(m.get("id") or ""): m for m in modules}
        for proof in merged.get("proofMap") or []:
            branch_id = str(proof.get("branchId") or "")
            if branch_id and branch_id in module_map:
                module = module_map[branch_id]
                artifacts = module.get("artifacts") or {}
                artifacts["logicProof"] = proof.get("kept") or []
                module["artifacts"] = artifacts

    # Stage 4: Common-sense pass (transforms the draft)
    common_sense = apply_common_sense(working_response, message)
    working_response = common_sense["response"]
    stage_artifacts["commonSense"] = {
        "insightCount": len(common_sense.get("insights") or []),
        "insights": common_sense.get("insights") or [],
    }

    # Stage 5: Personality pass (transforms the draft)
    personality = apply_personality(working_response, context_profile)
    working_response = personality["response"]
    stage_artifacts["personality"] = personality.get("style") or {}

    # Stage 6: Self-awareness pass (scores then transforms the draft)
    awareness = score_self_awareness(
        question=message,
        answer=working_response,
        retrieval_count=len(retrieval.get("chunks") or []),
        complexity_score=route["complexity_score"],
        previous_profile=context.get("selfAwarenessProfile") or {},
        approved_features=context.get("selfAwarenessApprovals") or [],
    )
    self_aware = apply_self_awareness(working_response, awareness)
    working_response = self_aware["response"]
    stage_artifacts["selfAwareness"] = {
        "confidence": awareness.get("confidence"),
        "isUncertain": awareness.get("isUncertain"),
        "caveat": awareness.get("caveat"),
        "statement": awareness.get("statement") or {},
        "profile": self_aware.get("profile") or {},
        "governance": {
            "approvalRequired": bool((self_aware.get("profile") or {}).get("approvalRequired")),
            "pendingApprovalFeatures": (self_aware.get("profile") or {}).get("pendingApprovalFeatures") or [],
        },
    }

    # Stage 7: Proactive help pass (transforms the draft)
    proactive = apply_proactive_help(working_response, context_profile)
    working_response = proactive["response"]
    stage_artifacts["proactiveHelp"] = {
        "suggestion": proactive.get("suggestion") or "",
        "enabled": bool(proactive.get("suggestion")),
    }

    # Use-case contract pass for specialized outputs (code-writing, mod-log-analysis).
    contract_result = apply_use_case_contract(
        use_case=str(use_case.get("useCase") or "general-assistance"),
        message=message,
        response=working_response,
        evidence=retrieval.get("chunks") or [],
    )
    working_response = contract_result["output"]
    stage_artifacts["useCaseContract"] = {
        "applied": bool(contract_result.get("applied")),
        "useCase": contract_result.get("useCase"),
        "contract": contract_result.get("contract"),
    }

    # Stage 8: Memory artifact (structured record prepared for persistence layer)
    memory_artifact = build_memory_artifact(
        user_message=message,
        final_response=working_response,
        context_profile=context_profile,
        confidence=int(awareness.get("confidence") or 50),
        self_awareness_profile=self_aware.get("profile") or {},
    )
    stage_artifacts["memorySave"] = {
        "prepared": True,
        "topics": memory_artifact.get("topics") or [],
    }

    thought_trace = render_thought_trace(stage_artifacts)

    full_stage_order = [
        "contextAnalysis",
        "runtimeGuard",
        "complexityRouting",
        "baseResponse",
        "branchMerge",
        "commonSense",
        "personality",
        "selfAwareness",
        "proactiveHelp",
        "memorySave",
    ]
    effective_stage_order = [s for s in full_stage_order if s != "branchMerge" or branch_merge_enabled]

    transparency = {
        "responseSource": source,
        "mode": route["tier"],
        "runtime": runtime_policy,
        "capabilityRegistry": capability_registry,
        "routing": {
            "tier": route["tier"],
            "modelB": route["model_size_b"],
            "quantization": route["quantization"],
            "coreCount": route["cores"],
            "contextWords": route["context_words"],
            "clamps": route["clamps"],
            "complexityScore": route["complexity_score"],
        },
        "useCaseRouting": use_case,
        "activeTools": ["F.L.U.X"] if flux_tags else [],
        "activeModules": modules,
        "stageOrder": effective_stage_order,
        "stageArtifacts": stage_artifacts,
        "thoughtTrace": thought_trace,
        "outputContract": "Direct answer first; evidence-grounded claims; no template scaffolding.",
        "useCaseContract": stage_artifacts.get("useCaseContract"),
    }

    return {
        "response": working_response,
        "source": "SPARK" if route["tier"] in {"turbo", "lite"} else "IRIS",
        "confidence": int(awareness.get("confidence") or 50),
        "metadata": {
            "route": route,
            "runtimePolicy": runtime_policy,
            "capabilityRegistry": capability_registry,
            "useCaseRouting": use_case,
            "fluxTags": flux_tags,
            "retrieval": {
                "strategy": retrieval["strategy"],
                "chunkCount": len(retrieval["chunks"]),
            },
            "contextProfile": context_profile,
            "memoryArtifact": memory_artifact,
            "pipeline": {
                "stageOrder": effective_stage_order,
                "stageArtifacts": stage_artifacts,
                "thoughtTrace": thought_trace,
            },
            "userName": user_name,
        },
        "transparencyReport": transparency,
    }
