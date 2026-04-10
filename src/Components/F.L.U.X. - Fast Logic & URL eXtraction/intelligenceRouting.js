const TIER_CONFIG = {
    turbo: { minB: 8, maxB: 12, contextWords: 10000, cores: 1 },
    lite: { minB: 12, maxB: 24, contextWords: 18000, cores: 1.5 },
    plus: { minB: 30, maxB: 55, contextWords: 40000, cores: 2 },
    pro: { minB: 40, maxB: 120, contextWords: 85000, cores: 3 },
};

const TIER_ORDER = ['turbo', 'lite', 'plus', 'pro'];

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function normalizeDeviceProfile(profile = {}) {
    return {
        deviceClass: String(profile.deviceClass || 'medium').toLowerCase(),
        vramFreeGB: Number(profile.vramFreeGB || 0),
        cpuLoad: Number(profile.cpuLoad || 0),
    };
}

function parseFluxTags(rawTags) {
    if (!Array.isArray(rawTags)) return [];
    return rawTags
        .map((tag) => String(tag || '').trim().toLowerCase())
        .filter(Boolean);
}

export function scoreComplexity(userMessage, profile, context = {}) {
    const lower = String(userMessage || '').toLowerCase();
    const lenScore = clamp(Math.round(lower.length / 25), 0, 30);
    const questionScore = /\?/.test(lower) ? 8 : 0;
    const domainScore = [
        /architecture|distributed|consensus|compiler|bytecode|concurrency|deadlock|race condition/.test(lower) ? 20 : 0,
        /math|proof|calculus|linear algebra|statistics|probability|equation/.test(lower) ? 15 : 0,
        /refactor|pipeline|system|design|workflow|optimization/.test(lower) ? 12 : 0,
    ].reduce((a, b) => a + b, 0);
    const contextScore = clamp(Math.round((context.attachments?.length || 0) * 4), 0, 20) + (context.webContext ? 8 : 0);
    const riskScore = /must|critical|production|legal|medical|financial|security/.test(lower) ? 20 : 0;

    return clamp(lenScore + questionScore + domainScore + contextScore + riskScore, 0, 100);
}

export function chooseTier({ complexityScore, requestedMode, fluxTags }) {
    const tags = parseFluxTags(fluxTags);

    if (requestedMode && TIER_ORDER.includes(requestedMode)) {
        return requestedMode;
    }

    if (tags.includes('high-strain') || tags.includes('logic-trap') || tags.includes('high-code-density')) {
        return complexityScore > 70 ? 'pro' : 'plus';
    }

    if (complexityScore <= 25) return 'turbo';
    if (complexityScore <= 45) return 'lite';
    if (complexityScore <= 70) return 'plus';
    return 'pro';
}

function applyQuantizationClamp(targetB, tier, deviceProfile) {
    const config = TIER_CONFIG[tier] || TIER_CONFIG.lite;
    const minB = config.minB;
    const maxB = config.maxB;
    const vram = deviceProfile.vramFreeGB;

    if (vram >= 20) {
        return { modelB: clamp(targetB, minB, maxB), quantization: 'q5' };
    }
    if (vram >= 12) {
        return { modelB: clamp(targetB, minB, maxB), quantization: 'q4' };
    }
    if (vram >= 8) {
        return { modelB: clamp(targetB, minB, maxB), quantization: 'q3' };
    }

    // Prefer quantizing rather than tier downgrade; keep tier floor.
    return { modelB: minB, quantization: 'q2' };
}

export function resolveIntelligenceRoute({ userMessage, requestedMode, context = {}, fluxTags = [], deviceProfile = {} }) {
    const normalizedDevice = normalizeDeviceProfile(deviceProfile);
    const complexityScore = scoreComplexity(userMessage, null, context);
    const tier = chooseTier({ complexityScore, requestedMode, fluxTags });
    const config = TIER_CONFIG[tier] || TIER_CONFIG.lite;

    const targetBase = tier === 'turbo' ? 8 : tier === 'lite' ? 18 : tier === 'plus' ? 50 : 70;
    const scaledTarget = Math.round(targetBase + (complexityScore - 50) * 0.2);
    const { modelB, quantization } = applyQuantizationClamp(scaledTarget, tier, normalizedDevice);

    let coreCount = config.cores;
    if (tier === 'pro') {
        if (complexityScore > 85) coreCount = 5;
        else if (complexityScore > 75) coreCount = 4;
        else coreCount = 3;
    }

    const requiresDualMerge = tier === 'plus' || tier === 'pro';

    return {
        tier,
        modelB,
        quantization,
        coreCount,
        contextWords: config.contextWords,
        complexityScore,
        requiresDualMerge,
        clamps: {
            floorB: config.minB,
            ceilingB: config.maxB,
        },
    };
}
