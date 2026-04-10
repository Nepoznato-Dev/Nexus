import { storage } from '../Storage/clientStorage.js';

const MAX_FEEDBACK_ITEMS = 250;

const DEFAULT_PROFILE = {
    version: 1,
    updatedAt: null,
    preferences: {
        preferredName: '',
        communicationStyle: 'balanced',
        verbosity: 'balanced'
    },
    stats: {
        totalRatings: 0,
        averageRating: 0,
        totalReadTimeMs: 0,
        deletedForLearning: 0
    },
    feedback: [],
    memories: []
};

function cloneDefaultProfile() {
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toIsoNow() {
    return new Date().toISOString();
}

function safeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeProfile(profile) {
    const normalized = profile && typeof profile === 'object' ? profile : cloneDefaultProfile();
    normalized.version = 1;
    normalized.updatedAt = normalized.updatedAt || toIsoNow();

    normalized.preferences = {
        preferredName: safeString(normalized.preferences?.preferredName),
        communicationStyle: normalized.preferences?.communicationStyle || 'balanced',
        verbosity: normalized.preferences?.verbosity || 'balanced'
    };

    normalized.stats = {
        totalRatings: Number(normalized.stats?.totalRatings || 0),
        averageRating: Number(normalized.stats?.averageRating || 0),
        totalReadTimeMs: Number(normalized.stats?.totalReadTimeMs || 0),
        deletedForLearning: Number(normalized.stats?.deletedForLearning || 0)
    };

    normalized.feedback = Array.isArray(normalized.feedback) ? normalized.feedback : [];
    normalized.memories = Array.isArray(normalized.memories) ? normalized.memories : [];

    return normalized;
}

async function loadSettings() {
    return (await storage.loadSettings()) || {};
}

async function saveProfile(profile) {
    const settings = await loadSettings();
    settings.aiLearning = normalizeProfile(profile);
    settings.aiLearning.updatedAt = toIsoNow();
    await storage.saveSettings(settings);
    return settings.aiLearning;
}

function recomputeStats(profile) {
    const rated = profile.feedback.filter((item) => Number(item.rating) > 0);
    const totalRatings = rated.length;
    const averageRating = totalRatings > 0
        ? rated.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalRatings
        : 0;

    const totalReadTimeMs = profile.feedback.reduce((sum, item) => {
        const readTime = Number(item.readTimeMs || 0);
        return sum + (readTime > 0 ? readTime : 0);
    }, 0);

    const deletedForLearning = profile.feedback.filter((item) => item.deletedForLearning).length;

    profile.stats.totalRatings = totalRatings;
    profile.stats.averageRating = Number(averageRating.toFixed(2));
    profile.stats.totalReadTimeMs = totalReadTimeMs;
    profile.stats.deletedForLearning = deletedForLearning;
}

function inferCategoryFromPrompt(prompt = '') {
    const lower = prompt.toLowerCase();

    if (/minecraft|forge|fabric|mod/.test(lower)) return 'minecraft';
    if (/code|debug|javascript|python|function|error/.test(lower)) return 'coding';
    if (/math|equation|fraction|percent|algebra/.test(lower)) return 'math';
    if (/essay|write|grammar|tone|outline/.test(lower)) return 'writing';
    if (/study|recall|pomodoro|notes|memor/.test(lower)) return 'study';
    if (/theme|nexus|widget|privacy|notification|performance/.test(lower)) return 'nexus';

    return 'general';
}

function estimateReadTimeMs(startTimestamp, fallbackTimestamp = Date.now()) {
    if (!startTimestamp) return 0;
    const value = Math.max(0, fallbackTimestamp - startTimestamp);
    return clamp(value, 0, 1000 * 60 * 20); // cap at 20 minutes per message
}

function makeMemoryId(prefix = 'mem') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadLearningProfile() {
    const settings = await loadSettings();
    const profile = normalizeProfile(settings.aiLearning || cloneDefaultProfile());
    return profile;
}

export async function rememberPreference(key, value, source = 'user') {
    const cleanKey = safeString(key);
    const cleanValue = safeString(value);
    if (!cleanKey || !cleanValue) return null;

    const profile = await loadLearningProfile();
    profile.preferences[cleanKey] = cleanValue;

    const existing = profile.memories.find((item) => item.type === 'preference' && item.key === cleanKey && !item.deletedAt);
    if (existing) {
        existing.value = cleanValue;
        existing.source = source;
        existing.updatedAt = toIsoNow();
    } else {
        profile.memories.unshift({
            id: makeMemoryId('pref'),
            type: 'preference',
            key: cleanKey,
            value: cleanValue,
            source,
            createdAt: toIsoNow(),
            updatedAt: toIsoNow(),
            deletedAt: null
        });
    }

    await saveProfile(profile);
    return profile;
}

export async function removeMemory(memoryId) {
    const profile = await loadLearningProfile();
    const memory = profile.memories.find((item) => item.id === memoryId && !item.deletedAt);
    if (!memory) return profile;

    memory.deletedAt = toIsoNow();

    if (memory.type === 'preference' && memory.key && profile.preferences[memory.key] === memory.value) {
        profile.preferences[memory.key] = '';
    }

    await saveProfile(profile);
    return profile;
}

export async function recordFeedback({ messageId, prompt, response, rating = 0, readTimeMs = 0, deletedForLearning = false }) {
    const profile = await loadLearningProfile();

    const normalizedRating = clamp(Number(rating || 0), 0, 5);
    const normalizedReadTime = clamp(Number(readTimeMs || 0), 0, 1000 * 60 * 20);

    const existingIndex = profile.feedback.findIndex((item) => item.messageId === messageId);
    const record = {
        id: existingIndex >= 0 ? profile.feedback[existingIndex].id : makeMemoryId('fb'),
        messageId,
        prompt: safeString(prompt),
        responsePreview: safeString(response).slice(0, 220),
        rating: normalizedRating,
        readTimeMs: normalizedReadTime,
        deletedForLearning: Boolean(deletedForLearning),
        category: inferCategoryFromPrompt(prompt),
        updatedAt: toIsoNow(),
        createdAt: existingIndex >= 0 ? profile.feedback[existingIndex].createdAt : toIsoNow()
    };

    if (existingIndex >= 0) {
        profile.feedback[existingIndex] = record;
    } else {
        profile.feedback.unshift(record);
    }

    if (profile.feedback.length > MAX_FEEDBACK_ITEMS) {
        profile.feedback = profile.feedback.slice(0, MAX_FEEDBACK_ITEMS);
    }

    recomputeStats(profile);

    if (deletedForLearning && messageId) {
        profile.memories.unshift({
            id: makeMemoryId('forget'),
            type: 'forget',
            key: 'messageId',
            value: String(messageId),
            source: 'user',
            createdAt: toIsoNow(),
            updatedAt: toIsoNow(),
            deletedAt: null
        });
    }

    await saveProfile(profile);
    return profile;
}

export function deriveAdaptivePersonality(basePersonality, profile) {
    const professionalism = Number(basePersonality?.professionalism ?? 0.5);
    const mentorship = Number(basePersonality?.mentorship ?? 0.5);

    const adapted = { professionalism, mentorship };
    const normalizedProfile = normalizeProfile(profile || cloneDefaultProfile());

    if (normalizedProfile.preferences.communicationStyle === 'casual') {
        adapted.professionalism -= 0.12;
    } else if (normalizedProfile.preferences.communicationStyle === 'formal') {
        adapted.professionalism += 0.12;
    }

    if (normalizedProfile.preferences.verbosity === 'concise') {
        adapted.mentorship -= 0.1;
    } else if (normalizedProfile.preferences.verbosity === 'detailed') {
        adapted.mentorship += 0.1;
    }

    if (normalizedProfile.stats.averageRating >= 4.2) {
        adapted.mentorship += 0.05;
    } else if (normalizedProfile.stats.averageRating > 0 && normalizedProfile.stats.averageRating <= 2.2) {
        adapted.mentorship -= 0.05;
    }

    return {
        professionalism: clamp(Number(adapted.professionalism.toFixed(2)), 0, 1),
        mentorship: clamp(Number(adapted.mentorship.toFixed(2)), 0, 1)
    };
}

export function applyLearnedPersonalization(responseText, profile) {
    const text = safeString(responseText);
    if (!text) return responseText;

    const preferredName = safeString(profile?.preferences?.preferredName);
    if (!preferredName) return responseText;

    if (/^(hi|hello|hey)([!,.\s]|$)/i.test(text)) {
        return text.replace(/^(hi|hello|hey)/i, (greeting) => `${greeting}, ${preferredName}`);
    }

    return responseText;
}

export function parsePreferenceFromUserMessage(userMessage) {
    const input = safeString(userMessage);
    if (!input) return null;

    const callMeMatch = input.match(/\bcall me\s+([A-Za-z][A-Za-z\s'\-]{1,40})/i);
    if (callMeMatch) {
        return { type: 'set', key: 'preferredName', value: safeString(callMeMatch[1]) };
    }

    const myNameIsMatch = input.match(/\bmy name is\s+([A-Za-z][A-Za-z\s'\-]{1,40})/i);
    if (myNameIsMatch) {
        return { type: 'set', key: 'preferredName', value: safeString(myNameIsMatch[1]) };
    }

    const dontCallMeMatch = input.match(/\b(?:don't|do not|stop)\s+call(?:ing)?\s+me\s+([A-Za-z][A-Za-z\s'\-]{1,40})/i);
    if (dontCallMeMatch) {
        return { type: 'clear', key: 'preferredName' };
    }

    const beMoreFormal = /\b(be|sound|write)\s+(more\s+)?formal\b/i.test(input);
    if (beMoreFormal) return { type: 'set', key: 'communicationStyle', value: 'formal' };

    const beMoreCasual = /\b(be|sound|write)\s+(more\s+)?casual\b/i.test(input);
    if (beMoreCasual) return { type: 'set', key: 'communicationStyle', value: 'casual' };

    const beConcise = /\b(be|keep|make)\s+(it\s+)?(short|concise|brief)\b/i.test(input);
    if (beConcise) return { type: 'set', key: 'verbosity', value: 'concise' };

    const beDetailed = /\b(be|give|make)\s+(it\s+)?(detailed|longer|more detail)\b/i.test(input);
    if (beDetailed) return { type: 'set', key: 'verbosity', value: 'detailed' };

    return null;
}

export async function applyPreferenceFromMessage(userMessage) {
    const parsed = parsePreferenceFromUserMessage(userMessage);
    if (!parsed) return null;

    if (parsed.type === 'clear') {
        const profile = await loadLearningProfile();
        profile.preferences[parsed.key] = '';
        profile.memories.unshift({
            id: makeMemoryId('pref'),
            type: 'preference',
            key: parsed.key,
            value: '',
            source: 'user',
            createdAt: toIsoNow(),
            updatedAt: toIsoNow(),
            deletedAt: null
        });
        await saveProfile(profile);
        return profile;
    }

    return rememberPreference(parsed.key, parsed.value, 'user');
}

export function getLearningSummary(profile) {
    const normalizedProfile = normalizeProfile(profile || cloneDefaultProfile());

    const topCategories = {};
    for (const item of normalizedProfile.feedback) {
        if (!topCategories[item.category]) {
            topCategories[item.category] = { total: 0, ratingSum: 0, count: 0 };
        }
        topCategories[item.category].total += 1;
        if (item.rating > 0) {
            topCategories[item.category].ratingSum += item.rating;
            topCategories[item.category].count += 1;
        }
    }

    const categorySummary = Object.entries(topCategories)
        .map(([category, data]) => ({
            category,
            interactions: data.total,
            averageRating: data.count > 0 ? Number((data.ratingSum / data.count).toFixed(2)) : 0
        }))
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5);

    return {
        preferredName: normalizedProfile.preferences.preferredName,
        communicationStyle: normalizedProfile.preferences.communicationStyle,
        verbosity: normalizedProfile.preferences.verbosity,
        totalRatings: normalizedProfile.stats.totalRatings,
        averageRating: normalizedProfile.stats.averageRating,
        deletedForLearning: normalizedProfile.stats.deletedForLearning,
        totalReadTimeMinutes: Number((normalizedProfile.stats.totalReadTimeMs / 60000).toFixed(1)),
        categorySummary,
        recentMemories: normalizedProfile.memories.filter((item) => !item.deletedAt).slice(0, 10)
    };
}

export function getReadTimeForFeedback(messageTimestamp, now = Date.now()) {
    return estimateReadTimeMs(messageTimestamp, now);
}
