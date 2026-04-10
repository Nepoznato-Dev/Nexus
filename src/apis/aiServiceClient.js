const PY_CORE_BASE = (window?.NEXUS_AI_PROXY_BASE || '/api/ai').replace(/\/$/, '');

async function postJSON(path, payload = {}) {
    const response = await fetch(`${PY_CORE_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`AI service request failed (${response.status})`);
    }

    return response.json();
}

async function postJSONWithFallback(primaryPath, fallbackPath, payload = {}) {
    try {
        return await postJSON(primaryPath, payload);
    } catch (error) {
        // If the new route is unavailable, keep legacy compatibility.
        if (fallbackPath) {
            return postJSON(fallbackPath, payload);
        }
        throw error;
    }
}

export async function checkAICoreHealth() {
    const response = await fetch(`${PY_CORE_BASE}/health`);
    if (!response.ok) return { success: false };
    return response.json();
}

export async function askSpark(payload) {
    return postJSON('/spark-ask', payload);
}

export async function askRazonet(payload) {
    return postJSONWithFallback('/razonet-chat', '/iris-chat', payload);
}

export async function askIris(payload) {
    return askRazonet(payload);
}

export async function evaluateAIPerformance(payload) {
    return postJSON('/performance-eval', payload);
}

export async function generateKnowledgeResponse(payload) {
    return postJSON('/knowledge-generate', payload);
}

export default {
    checkAICoreHealth,
    askSpark,
    askRazonet,
    askIris,
    evaluateAIPerformance,
    generateKnowledgeResponse,
};
