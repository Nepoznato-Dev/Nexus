// Simple event emitter for settings changes
class SettingsEmitter {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(settings) {
    // Notify all internal listeners
    this.listeners.forEach(callback => {
      try {
        callback(settings);
      } catch (err) {
        console.error('Settings listener error:', err);
      }
    });

    // Also dispatch a global window event for cross-component communication
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexus:settings-changed', {
        detail: settings
      }));
    }
  }
}

export const settingsEmitter = new SettingsEmitter();
