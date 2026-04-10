/**
 * S.P.A.R.K to RAZONET Wake Signal
 * 
 * Communication channel for S.P.A.R.K to notify RAZONET when:
 * - Performance is stable
 * - System ready for heavy operations
 * - Something needs RAZONET's attention
 */

export const sparkIRISChannel = {
    listeners: [],

    /**
     * Register a listener for S.P.A.R.K signals
     */
    onSignal(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    },

    /**
    * Send signal from S.P.A.R.K to RAZONET
     */
    signal(signalType, data) {
        const message = {
            from: 'S.P.A.R.K',
            to: 'RAZONET',
            type: signalType,
            timestamp: Date.now(),
            data: data
        };

        console.log(`S.P.A.R.K -> RAZONET: ${signalType}`, data);

        this.listeners.forEach(callback => {
            try {
                callback(message);
            } catch (e) {
                console.error('Error in RAZONET signal listener:', e);
            }
        });
    },

    /**
     * S.P.A.R.K signals that performance is stable
     */
    performanceStable(metrics) {
        this.signal('PERFORMANCE_STABLE', {
            message: 'System performance has stabilized for 10 seconds',
            metrics: metrics,
            recommendation: 'Ready for heavy diagnostics'
        });
    },

    /**
     * S.P.A.R.K signals critical issue detected
     */
    criticalIssue(issue) {
        this.signal('CRITICAL_ISSUE', {
            message: 'S.P.A.R.K detected something critical',
            issue: issue,
            urgency: 'high'
        });
    },

    /**
     * S.P.A.R.K signals performance degradation
     */
    performanceDegraded(metrics) {
        this.signal('PERFORMANCE_DEGRADED', {
            message: 'System performance has degraded',
            metrics: metrics,
            recommendation: 'Consider reducing workload'
        });
    },

    /**
    * S.P.A.R.K has a question for RAZONET
     */
    askForHelp(question) {
        this.signal('QUESTION', {
            message: 'S.P.A.R.K needs RAZONET perspective',
            question: question
        });
    },

    /**
     * S.P.A.R.K found something interesting
     */
    interestingFinding(finding) {
        this.signal('FINDING', {
            message: 'S.P.A.R.K found something',
            finding: finding,
            priority: 'normal'
        });
    },

    /**
     * Clear all listeners (for cleanup)
     */
    clear() {
        this.listeners = [];
    }
};

/**
 * RAZONET receives signals from S.P.A.R.K
 */
export const irisSignalReceiver = {
    handlers: {},

    /**
     * Register handler for specific signal type
     */
    on(signalType, handler) {
        if (!this.handlers[signalType]) {
            this.handlers[signalType] = [];
        }
        this.handlers[signalType].push(handler);

        return () => {
            this.handlers[signalType] = this.handlers[signalType].filter(h => h !== handler);
        };
    },

    /**
     * Process incoming signal
     */
    receive(message) {
        if (this.handlers[message.type]) {
            this.handlers[message.type].forEach(handler => {
                try {
                    handler(message);
                } catch (e) {
                    console.error('Error in signal handler:', e);
                }
            });
        }
    },

    /**
     * Set up listeners for S.P.A.R.K signals
     */
    initialize() {
        console.log('RAZONET: Signal receiver initialized');

        // Listen for all S.P.A.R.K signals
        sparkIRISChannel.onSignal((message) => {
            this.receive(message);
        });
    },

    /**
     * Clear all handlers
     */
    clear() {
        this.handlers = {};
    }
};

export default { sparkIRISChannel, irisSignalReceiver };
