import unittest
from unittest.mock import AsyncMock, patch
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.orchestrator import run_ai_turn


class PipelineContractTests(unittest.IsolatedAsyncioTestCase):
    async def test_stage_order_without_branch_merge(self):
        payload = {
            "message": "Help me learn JavaScript basics.",
            "mode": "turbo",
            "toolState": {
                "deepResearch": False,
                "thinkLonger": False,
            },
            "context": {
                "sources": [],
            },
            "fluxTags": [],
            "deviceProfile": {
                "vramFreeGB": 8,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Start with variables, functions, and loops.", "model": "mock"})):
            result = await run_ai_turn(payload)

        stage_order = result["transparencyReport"]["stageOrder"]
        self.assertEqual(
            stage_order,
            [
                "contextAnalysis",
                "runtimeGuard",
                "complexityRouting",
                "baseResponse",
                "commonSense",
                "personality",
                "selfAwareness",
                "proactiveHelp",
                "memorySave",
            ],
        )
        self.assertNotIn("branchMerge", result["transparencyReport"]["stageArtifacts"])
        self.assertTrue(result["transparencyReport"]["thoughtTrace"])
        self.assertIn("capabilityRegistry", result["transparencyReport"])
        self.assertIn("python", result["transparencyReport"]["capabilityRegistry"]["activeOwners"])
        self.assertIn("useCaseRouting", result["transparencyReport"])

    async def test_stage_order_with_branch_merge(self):
        payload = {
            "message": "Design a robust JavaScript learning architecture with verification.",
            "mode": "pro",
            "toolState": {
                "deepResearch": True,
                "thinkLonger": True,
            },
            "context": {
                "sources": ["Source A", "Source B"],
            },
            "fluxTags": ["high-code-density"],
            "deviceProfile": {
                "vramFreeGB": 12,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Base draft answer.", "model": "mock"})), \
             patch("ai.orchestrator.run_branch_workers", new=AsyncMock(return_value={
                 "enabled": True,
                 "parallelCount": 2,
                 "branches": [
                     {"id": "S2", "title": "Auditor", "ok": True, "text": "Add checkpoints.", "score": 80},
                     {"id": "S4", "title": "Architect", "ok": True, "text": "Use modules.", "score": 78},
                 ],
             })), \
             patch("ai.orchestrator.merge_branch_outputs", return_value={
                 "merged": True,
                 "text": "Merged answer with checkpoints and modules.",
                 "acceptedBranchIds": ["S2", "S4"],
                 "contradictionCount": 1,
                 "proofMap": [
                     {"branchId": "S2", "kept": ["Add checkpoints."]},
                     {"branchId": "S4", "kept": ["Use modules."]},
                 ],
             }):
            result = await run_ai_turn(payload)

        stage_order = result["transparencyReport"]["stageOrder"]
        self.assertIn("branchMerge", stage_order)

        artifacts = result["transparencyReport"]["stageArtifacts"]
        self.assertIn("branchMerge", artifacts)
        self.assertEqual(artifacts["branchMerge"]["acceptedBranchIds"], ["S2", "S4"])
        self.assertEqual(artifacts["branchMerge"]["contradictionCount"], 1)
        self.assertTrue(any("Branch merge:" in line for line in result["transparencyReport"]["thoughtTrace"]))

    async def test_runtime_guard_disables_branch_merge_under_pressure(self):
        payload = {
            "message": "Design a robust JavaScript learning architecture with verification.",
            "mode": "pro",
            "toolState": {
                "deepResearch": True,
                "thinkLonger": True,
            },
            "context": {
                "sources": ["Source A", "Source B"],
            },
            "siteState": {
                "fps": 20,
                "longTaskCount": 40,
                "heapUsedMB": 950,
                "rttMs": 620,
            },
            "fluxTags": ["high-code-density"],
            "deviceProfile": {
                "vramFreeGB": 12,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Base draft answer.", "model": "mock"})), \
             patch("ai.orchestrator.run_branch_workers", new=AsyncMock(return_value={
                 "enabled": True,
                 "parallelCount": 2,
                 "branches": [],
             })) as branch_workers_mock:
            result = await run_ai_turn(payload)

        stage_order = result["transparencyReport"]["stageOrder"]
        self.assertNotIn("branchMerge", stage_order)
        self.assertNotIn("branchMerge", result["transparencyReport"]["stageArtifacts"])
        self.assertEqual(branch_workers_mock.await_count, 0)
        self.assertGreaterEqual(result["transparencyReport"]["runtime"]["degradationLevel"], 3)

    async def test_runtime_guard_accepts_nested_capability_payload(self):
        payload = {
            "message": "Design a robust JavaScript learning architecture with verification.",
            "mode": "pro",
            "toolState": {
                "deepResearch": True,
                "thinkLonger": True,
            },
            "context": {
                "sources": ["Source A", "Source B"],
            },
            "siteState": {
                "schemaVersion": "alloy.capability.v1",
                "source": "browser-js",
                "runtime": {
                    "performance": {
                        "fpsAverage": 28,
                        "longTaskRate": 18,
                        "heapUsedMB": 880,
                        "rttMs": 540,
                        "health": "degraded",
                    }
                },
                "capabilities": {
                    "owner": "javascript",
                    "collector": "alloyPerformanceMonitor",
                },
            },
            "fluxTags": ["high-code-density"],
            "deviceProfile": {
                "vramFreeGB": 12,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Base draft answer.", "model": "mock"})), \
             patch("ai.orchestrator.run_branch_workers", new=AsyncMock(return_value={
                 "enabled": True,
                 "parallelCount": 2,
                 "branches": [],
             })) as branch_workers_mock:
            result = await run_ai_turn(payload)

        runtime = result["transparencyReport"]["runtime"]
        self.assertNotIn("branchMerge", result["transparencyReport"]["stageOrder"])
        self.assertEqual(branch_workers_mock.await_count, 0)
        self.assertGreaterEqual(runtime["degradationLevel"], 3)
        self.assertEqual(runtime["telemetryContract"]["schemaVersion"], "alloy.capability.v1")
        self.assertEqual(runtime["telemetryContract"]["source"], "browser-js")
        self.assertIn("javascript", result["transparencyReport"]["capabilityRegistry"]["activeOwners"])

    async def test_ui_pressure_signal_can_disable_branch_merge(self):
        payload = {
            "message": "Design a robust JavaScript learning architecture with verification.",
            "mode": "pro",
            "toolState": {
                "deepResearch": True,
                "thinkLonger": True,
            },
            "context": {
                "sources": ["Source A", "Source B"],
            },
            "siteState": {
                "schemaVersion": "alloy.capability.v1",
                "source": "browser-js",
                "runtime": {
                    "performance": {
                        "fpsAverage": 55,
                        "longTaskRate": 2,
                        "heapUsedMB": 300,
                        "rttMs": 90,
                        "health": "stable",
                    },
                    "ui": {
                        "interactionLatencyMs": 185,
                        "eventLoopLagMs": 115,
                        "uiPressure": "degraded",
                    },
                },
                "capabilities": {
                    "owner": "javascript",
                    "collector": "alloyPerformanceMonitor",
                    "canThrottleUIWork": True,
                },
            },
            "fluxTags": ["high-code-density"],
            "deviceProfile": {
                "vramFreeGB": 12,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Base draft answer.", "model": "mock"})), \
             patch("ai.orchestrator.run_branch_workers", new=AsyncMock(return_value={
                 "enabled": True,
                 "parallelCount": 2,
                 "branches": [],
             })) as branch_workers_mock:
            result = await run_ai_turn(payload)

        runtime = result["transparencyReport"]["runtime"]
        self.assertNotIn("branchMerge", result["transparencyReport"]["stageOrder"])
        self.assertEqual(branch_workers_mock.await_count, 0)
        self.assertGreaterEqual(runtime["degradationLevel"], 3)
        self.assertIn("ui-pressure-degraded", runtime["reasons"])
        self.assertEqual(runtime["metrics"]["uiPressure"], "degraded")

    async def test_use_case_routing_detects_mod_log_analysis(self):
        payload = {
            "message": "Read this mod log and find the crash cause from stack trace entries.",
            "mode": "plus",
            "toolState": {
                "deepResearch": False,
                "thinkLonger": False,
            },
            "context": {
                "sources": ["mod.log", "stack trace output"],
            },
            "siteState": {
                "schemaVersion": "alloy.capability.v1",
                "source": "browser-js",
                "runtime": {
                    "performance": {
                        "fpsAverage": 60,
                        "longTaskRate": 1,
                        "heapUsedMB": 260,
                        "rttMs": 50,
                        "health": "stable",
                    },
                    "ui": {
                        "interactionLatencyMs": 15,
                        "eventLoopLagMs": 10,
                        "uiPressure": "stable",
                    },
                },
                "capabilities": {
                    "owner": "javascript",
                    "collector": "alloyPerformanceMonitor",
                },
            },
            "fluxTags": [],
            "deviceProfile": {
                "vramFreeGB": 8,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "Base draft answer.", "model": "mock"})):
            result = await run_ai_turn(payload)

        use_case = result["transparencyReport"]["useCaseRouting"]
        module_ids = [m.get("id") for m in result["transparencyReport"]["activeModules"]]
        self.assertEqual(use_case["useCase"], "mod-log-analysis")
        self.assertIn("S3", module_ids)
        self.assertIn("S2", module_ids)

    async def test_self_awareness_feature_requires_approval(self):
        payload = {
            "message": "Is this the latest approach and can I trust it immediately?",
            "mode": "turbo",
            "toolState": {
                "deepResearch": False,
                "thinkLonger": False,
            },
            "context": {
                "sources": [],
            },
            "fluxTags": [],
            "deviceProfile": {
                "vramFreeGB": 8,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "This might be right.", "model": "mock"})):
            result = await run_ai_turn(payload)

        profile = result["transparencyReport"]["stageArtifacts"]["selfAwareness"]["profile"]
        pending = profile.get("pendingApprovalFeatures") or []
        self.assertTrue(profile.get("approvalRequired"))
        self.assertTrue(len(pending) >= 1)
        self.assertNotIn("source_verification_gate", profile.get("activeFeatures") or [])

    async def test_self_awareness_feature_activates_after_approval(self):
        payload = {
            "message": "Is this the latest approach and can I trust it immediately?",
            "mode": "turbo",
            "toolState": {
                "deepResearch": False,
                "thinkLonger": False,
            },
            "context": {
                "sources": [],
                "selfAwarenessApprovals": [
                    "source_verification_gate",
                    "verification_first_reasoning",
                    "hedge_detection",
                    "uncertainty_disclosure",
                ],
            },
            "fluxTags": [],
            "deviceProfile": {
                "vramFreeGB": 8,
            },
        }

        with patch("ai.orchestrator.generate_with_ollama", new=AsyncMock(return_value={"ok": True, "text": "This might be right.", "model": "mock"})):
            result = await run_ai_turn(payload)

        profile = result["transparencyReport"]["stageArtifacts"]["selfAwareness"]["profile"]
        self.assertIn("source_verification_gate", profile.get("activeFeatures") or [])
        self.assertIn("verification_first_reasoning", profile.get("activeFeatures") or [])
        self.assertFalse(profile.get("approvalRequired"))


if __name__ == "__main__":
    unittest.main()
