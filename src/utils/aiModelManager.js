/**
 * AI Model Manager - Handles local LLM download, caching, and text generation
 * Uses Transformers.js for browser-native inference
 */

let modelPipeline = null;
let isInitializing = false;
let initializationError = null;

const MODEL_NAME = 'Xenova/Phi-2';
const MODEL_CACHE_KEY = 'nexus_ai_model_initialized';
const AI_CHOICE_KEY = 'nexus_ai_download_choice';

// Event emitter for progress updates
const listeners = new Set();

function emit(eventName, data) {
    listeners.forEach(callback => {
        try {
            callback(eventName, data);
        } catch (err) {
            console.error('[AIModelManager] Listener error:', err);
        }
    });
}

export function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * Get user's AI download preference
 * @returns {'now' | 'later' | 'never' | null}
 */
export function getAIDownloadChoice() {
    return localStorage.getItem(AI_CHOICE_KEY);
}

/**
 * Set user's AI download preference
 */
export function setAIDownloadChoice(choice) {
    localStorage.setItem(AI_CHOICE_KEY, choice);
    emit('choice-updated', { choice });
}

/**
 * Check if AI model is ready to use
 */
export function isAIReady() {
    return modelPipeline !== null && localStorage.getItem(MODEL_CACHE_KEY) === 'true';
}

/**
 * Check if AI is currently initializing
 */
export function isAIInitializing() {
    return isInitializing;
}

/**
 * Get initialization error if any
 */
export function getInitializationError() {
    return initializationError;
}

/**
 * Initialize the AI model
 * Downloads model on first run, uses cache on subsequent runs
 */
export async function initializeAI() {
    if (modelPipeline) {
        return modelPipeline;
    }

    if (isInitializing) {
        // Wait for existing initialization
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (!isInitializing) {
                    clearInterval(checkInterval);
                    if (modelPipeline) {
                        resolve(modelPipeline);
                    } else {
                        reject(initializationError || new Error('Initialization failed'));
                    }
                }
            }, 100);
        });
    }

    isInitializing = true;
    initializationError = null;
    emit('status', { status: 'downloading', progress: 0 });

    try {
        // Dynamically import to avoid loading if user chose "never"
        const { pipeline } = await import('@xenova/transformers');

        emit('status', { status: 'downloading', progress: 10 });

        // Create text generation pipeline
        // This will download the model on first run and cache it
        modelPipeline = await pipeline('text-generation', MODEL_NAME, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    emit('status', {
                        status: 'downloading',
                        progress: percent,
                        loaded: progress.loaded,
                        total: progress.total
                    });
                }
            }
        });

        localStorage.setItem(MODEL_CACHE_KEY, 'true');
        emit('status', { status: 'ready', progress: 100 });
        isInitializing = false;

        return modelPipeline;
    } catch (error) {
        console.error('[AIModelManager] Failed to initialize:', error);
        initializationError = error;
        isInitializing = false;
        emit('status', { status: 'error', error: error.message });
        throw error;
    }
}

/**
 * Generate natural text from structured intent
 * Falls back gracefully if model isn't ready
 * 
 * @param {Object} intent - Structured intent from your AI logic
 * @param {string} intent.topic - Main topic/context
 * @param {string[]} intent.points - Key points to convey
 * @param {string} intent.personality - Personality mode
 * @param {string} [intent.fallback] - Fallback text if generation fails
 * @returns {Promise<string>} - Natural language response
 */
export async function naturalizeText(intent) {
    const {
        topic = 'general assistance',
        points = [],
        personality = 'adaptive',
        content = '',
        userMessage = '',
        fallback = ''
    } = intent || {};

    const safeFallback = fallback || content || points.join(' ') || '';

    // If model isn't ready, return fallback immediately
    if (!modelPipeline) {
        console.warn('[AIModelManager] Model not ready, using fallback');
        return safeFallback;
    }

    try {
        // Construct prompt for the model
        const prompt = content
            ? `You are RAZONET, a ${personality} Nexus AI assistant. Rewrite the draft into a direct, helpful response.

User message:
${userMessage || 'N/A'}

Draft response:
${content}

Rules:
- Keep the same meaning.
- Remove repetitive template phrasing.
- Keep it practical and specific.

Final response:`
            : `You are a ${personality} AI assistant. Convert this structured information into natural, conversational text:

Topic: ${topic}
Key points:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Natural response:`;

        const result = await modelPipeline(prompt, {
            max_new_tokens: 150,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
        });

        if (result && result[0] && result[0].generated_text) {
            // Extract only the new generated part (after the prompt)
            const fullText = result[0].generated_text;
            const delimiter = content ? 'Final response:' : 'Natural response:';
            const responseStart = fullText.indexOf(delimiter);
            if (responseStart !== -1) {
                return fullText.slice(responseStart + delimiter.length).trim();
            }

            return fullText.trim();
        }

        return safeFallback;
    } catch (error) {
        console.error('[AIModelManager] Generation failed:', error);
        return safeFallback;
    }
}

/**
 * Generate response directly from a free-form prompt.
 * Falls back to an empty string on failure so callers can decide alternate strategy.
 */
export async function generateFromPrompt(prompt, options = {}) {
    if (!prompt || typeof prompt !== 'string') {
        return '';
    }

    if (!modelPipeline) {
        const choice = getAIDownloadChoice();
        if (choice !== 'never') {
            try {
                await initializeAI();
            } catch (error) {
                console.warn('[AIModelManager] Auto-initialize failed for direct generation:', error);
            }
        }
    }

    if (!modelPipeline) {
        return '';
    }

    try {
        const result = await modelPipeline(prompt, {
            max_new_tokens: options.maxNewTokens ?? 220,
            temperature: options.temperature ?? 0.7,
            do_sample: options.doSample ?? true,
            top_p: options.topP ?? 0.9,
        });

        if (!result || !result[0] || !result[0].generated_text) {
            return '';
        }

        const generated = result[0].generated_text;
        if (generated.startsWith(prompt)) {
            return generated.slice(prompt.length).trim();
        }

        return generated.trim();
    } catch (error) {
        console.error('[AIModelManager] Direct generation failed:', error);
        return '';
    }
}

/**
 * Clear model cache (for settings/debugging)
 */
export function clearAICache() {
    localStorage.removeItem(MODEL_CACHE_KEY);
    localStorage.removeItem(AI_CHOICE_KEY);
    modelPipeline = null;
    emit('status', { status: 'uninitialized' });
}

/**
 * Get current AI status for UI
 */
export function getAIStatus() {
    if (initializationError) {
        return { status: 'error', error: initializationError.message };
    }
    if (isInitializing) {
        return { status: 'downloading' };
    }
    if (modelPipeline) {
        return { status: 'ready' };
    }

    const choice = getAIDownloadChoice();
    if (choice === 'never') {
        return { status: 'disabled' };
    }
    if (choice === 'later') {
        return { status: 'postponed' };
    }

    return { status: 'uninitialized' };
}

// Auto-initialize if user previously chose "now" and app restarts
if (getAIDownloadChoice() === 'now' && !localStorage.getItem(MODEL_CACHE_KEY)) {
    // Model was chosen but not fully downloaded, resume download
    initializeAI().catch(err => {
        console.warn('[AIModelManager] Auto-initialization failed:', err);
    });
}
