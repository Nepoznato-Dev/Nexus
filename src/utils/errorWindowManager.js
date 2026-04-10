/**
 * Global Error Window Manager
 * Allows any component to trigger error windows at the desktop level
 */

let errorWindowTrigger = null;

export function registerErrorWindowTrigger(triggerFn) {
    errorWindowTrigger = triggerFn;
}

export function showErrorWindow(errorData) {
    if (errorWindowTrigger) {
        errorWindowTrigger(errorData);
    } else {
        console.error('Error window trigger not registered:', errorData);
    }
}

export function showGenerationError(message, retryAction) {
    showErrorWindow({
        type: 'generation_failed',
        message: message || 'Response generation system encountered an error',
        retryAction
    });
}

export function showStorageError(message, retryAction) {
    showErrorWindow({
        type: 'storage_failed',
        message: message || 'Data storage system encountered an error',
        retryAction
    });
}

export function showNetworkError(message, retryAction) {
    showErrorWindow({
        type: 'network',
        message: message || 'Network connection encountered an error',
        retryAction
    });
}

export function show404Error(message, retryAction) {
    showErrorWindow({
        type: '404',
        message,
        retryAction
    });
}

export function show403Error(message, retryAction) {
    showErrorWindow({
        type: '403',
        message,
        retryAction
    });
}

export function show500Error(message, retryAction) {
    showErrorWindow({
        type: '500',
        message,
        retryAction
    });
}

// Expose to console for testing
if (typeof window !== 'undefined') {
    window.testErrorWindow = {
        generation: (msg) => showGenerationError(msg || 'Test generation error', () => console.log('Retry clicked')),
        storage: (msg) => showStorageError(msg || 'Test storage error', () => console.log('Retry clicked')),
        network: (msg) => showNetworkError(msg || 'Test network error', () => console.log('Retry clicked')),
        error404: (msg) => show404Error(msg, () => console.log('Retry clicked')),
        error403: (msg) => show403Error(msg, () => console.log('Retry clicked')),
        error500: (msg) => show500Error(msg, () => console.log('Retry clicked'))
    };
}
