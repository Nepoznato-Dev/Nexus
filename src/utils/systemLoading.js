let activeLoadingOperations = 0;

function applyLoadingState() {
    if (typeof window === 'undefined' || typeof window.setSystemLoading !== 'function') {
        return;
    }

    window.setSystemLoading(activeLoadingOperations > 0);
}

export function beginSystemLoading() {
    activeLoadingOperations += 1;
    applyLoadingState();
}

export function endSystemLoading() {
    activeLoadingOperations = Math.max(0, activeLoadingOperations - 1);
    applyLoadingState();
}

export async function withSystemLoading(work) {
    beginSystemLoading();
    try {
        if (typeof work === 'function') {
            return await work();
        }
        return await work;
    } finally {
        endSystemLoading();
    }
}

export function getSystemLoadingCount() {
    return activeLoadingOperations;
}

// Optional debugging helpers in browser console.
if (typeof window !== 'undefined') {
    window.withSystemLoading = withSystemLoading;
    window.getSystemLoadingCount = getSystemLoadingCount;
}
