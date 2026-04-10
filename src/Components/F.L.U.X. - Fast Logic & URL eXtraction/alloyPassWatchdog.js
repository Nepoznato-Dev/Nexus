export const DEFAULT_PASS_TIMEOUT_MS = 22000;
export const DEFAULT_MAX_RETRIES = 1;

export function createAlloyPassWatchdog(options = {}) {
    const timeoutMs = Number(options.timeoutMs || DEFAULT_PASS_TIMEOUT_MS);
    const maxRetries = Number(options.maxRetries ?? DEFAULT_MAX_RETRIES);

    function beginAttempt({ attemptIndex, prompt }) {
        const now = Date.now();
        return {
            startedAt: now,
            lastProgressAt: now,
            passes: [],
            attemptIndex,
            prompt: String(prompt || ''),
        };
    }

    function markPass(attemptState, passName) {
        attemptState.passes.push({
            name: String(passName || 'unknown'),
            completedAt: Date.now(),
        });
        attemptState.lastProgressAt = Date.now();
    }

    async function runPass(attemptState, passName, passTask) {
        const name = String(passName || 'unnamed-pass');
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                const error = new Error(`Pass '${name}' timed out after ${timeoutMs}ms`);
                error.code = 'ALLOY_PASS_TIMEOUT';
                error.passName = name;
                reject(error);
            }, timeoutMs);
        });

        const result = await Promise.race([Promise.resolve().then(passTask), timeoutPromise]);
        markPass(attemptState, name);
        return result;
    }

    function canRetry(attemptIndex) {
        return Number(attemptIndex) < maxRetries;
    }

    function buildRetryPrompt(originalPrompt) {
        return `@Agent Try again\n${String(originalPrompt || '').trim()}`;
    }

    function getFinalFailureMessage() {
        return 'ALLOY refused to connect.';
    }

    function getAttemptSummary(attemptState) {
        return {
            attemptIndex: attemptState.attemptIndex,
            passCount: Array.isArray(attemptState.passes) ? attemptState.passes.length : 0,
            elapsedMs: Date.now() - Number(attemptState.startedAt || Date.now()),
        };
    }

    return {
        beginAttempt,
        markPass,
        runPass,
        canRetry,
        buildRetryPrompt,
        getFinalFailureMessage,
        getAttemptSummary,
    };
}
