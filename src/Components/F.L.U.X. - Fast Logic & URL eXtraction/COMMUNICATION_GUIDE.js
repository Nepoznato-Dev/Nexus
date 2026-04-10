/**
 * S.P.A.R.K ↔ I.R.I.S Communication Guide
 * 
 * How the two AIs talk to each other during collaborative diagnostics
 */

// ═══════════════════════════════════════════════════════════════════
// THE COMMUNICATION FLOW
// ═══════════════════════════════════════════════════════════════════

/**
 * INITIALIZATION PHASE:
 * 
 * 1. runParallelDiagnostics() starts
 * 2. irisSignalReceiver.initialize() - I.R.I.S starts listening
 * 3. Signal handlers registered for:
 *    - PERFORMANCE_STABLE: I.R.I.S can check system status
 *    - CRITICAL_ISSUE: Wake up if something urgent
 *    - QUESTION: S.P.A.R.K asking for perspective
 *    - FINDING: New discovery from S.P.A.R.K
 * 4. sparkPerformanceMonitor starts in background
 *    - Checks CPU/memory every 500ms
 *    - Monitors for 10 seconds of stability
 */

// ═══════════════════════════════════════════════════════════════════
// DURING ANALYSIS
// ═══════════════════════════════════════════════════════════════════

/**
 * S.P.A.R.K can send signals to I.R.I.S:
 * 
 * sparkIRISChannel.performanceStable(metrics)
 * └─> Signals when system performance has calmed down
 *     I.R.I.S receives: PERFORMANCE_STABLE event
 * 
 * sparkIRISChannel.criticalIssue(issue)
 * └─> Urgent signal for something critical
 *     I.R.I.S receives: CRITICAL_ISSUE event
 * 
 * sparkIRISChannel.performanceDegraded(metrics)
 * └─> Warning that things are slowing down
 *     I.R.I.S receives: PERFORMANCE_DEGRADED event
 * 
 * sparkIRISChannel.askForHelp(question)
 * └─> S.P.A.R.K needs I.R.I.S's deeper perspective
 *     I.R.I.S receives: QUESTION event
 * 
 * sparkIRISChannel.interestingFinding(finding)
 * └─> S.P.A.R.K found something worth noting
 *     I.R.I.S receives: FINDING event
 */

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE: THE PERFORMANCE MONITORING LOOP
// ═══════════════════════════════════════════════════════════════════

/**
 * Timeline:
 * 
 * T+0s:    I.R.I.S starts heavy analysis
 * T+0.5s:  S.P.A.R.K performance monitor check #1
 *          CPU: 60%, Memory: 75% - Too high, reset timer
 * 
 * T+1s:    S.P.A.R.K performance monitor check #2
 *          CPU: 55%, Memory: 70% - High, continue
 * 
 * T+5s:    I.R.I.S finishes initial analysis
 *          S.P.A.R.K monitor check #10
 *          CPU: 25%, Memory: 40% - In range!
 * 
 * T+5.5s:  Stability timer started
 * 
 * T+15s:   S.P.A.R.K monitor check #20
 *          Metric has been stable for 10+ seconds!
 *          → sparkIRISChannel.performanceStable() called
 *          → I.R.I.S receives PERFORMANCE_STABLE signal
 *          → Knows it can continue without worrying about load
 */

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE: S.P.A.R.K ASKING FOR HELP
// ═══════════════════════════════════════════════════════════════════

/**
 * During dialogue turn:
 * 
 * S.P.A.R.K notices: "Console shows 3 webpack errors in different files"
 * 
 * S.P.A.R.K can signal:
 *   sparkIRISChannel.askForHelp({
 *     observation: "Found webpack errors in 3 separate files",
 *     question: "Is this a shared dependency issue or coincidence?"
 *   })
 * 
 * I.R.I.S receives QUESTION event and handler processes it:
 *   irisSignalReceiver.on('QUESTION', (message) => {
 *     // Can log it, count it, or use for adaptive behavior
 *     console.log('S.P.A.R.K asking:', message.data.question);
 *   })
 */

// ═══════════════════════════════════════════════════════════════════
// CLEANUP PHASE
// ═══════════════════════════════════════════════════════════════════

/**
 * When diagnostics complete:
 * 
 * 1. perfMonitor.stopMonitoring()
 *    └─> S.P.A.R.K stops watching performance
 * 
 * 2. irisSignalReceiver.clear()
 *    └─> I.R.I.S stops listening to signals
 * 
 * 3. sparkIRISChannel.clear()
 *    └─> Communication channel closes
 */

// ═══════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════

/**
 * From collaborativeDiagnostics.js:
 * 
 * // Initialize receiver
 * irisSignalReceiver.initialize();
 * 
 * // Handle specific signal types
 * irisSignalReceiver.on('PERFORMANCE_STABLE', (message) => {
 *   console.log('System ready for next phase');
 * });
 * 
 * irisSignalReceiver.on('CRITICAL_ISSUE', (message) => {
 *   console.log('Alert:', message.data.issue);
 * });
 * 
 * // Send signals from S.P.A.R.K
 * sparkIRISChannel.performanceStable({ memory: 35, cpu: 28 });
 * sparkIRISChannel.askForHelp('What causes cascading errors like this?');
 * sparkIRISChannel.interestingFinding('Three errors at same line number');
 */

// ═══════════════════════════════════════════════════════════════════
// WHY THIS DESIGN?
// ═══════════════════════════════════════════════════════════════════

/**
 * ✓ Natural communication: Two AIs talking, not just thinking
 * ✓ Performance aware: S.P.A.R.K monitors, I.R.I.S responds
 * ✓ Extensible: Easy to add new signal types
 * ✓ Clean separation: Each AI has clear responsibilities
 * ✓ Asynchronous: Doesn't block diagnostics
 * ✓ Conversational: Feels like real collaboration
 * 
 * The channel allows:
 * - S.P.A.R.K to notice things I.R.I.S might miss
 * - I.R.I.S to understand system state from S.P.A.R.K monitoring
 * - Both to have a back-and-forth beyond just written dialogue
 * - Natural handoffs and context sharing
 */

export const communicationGuide = {
    version: '1.0',
    description: 'S.P.A.R.K ↔ I.R.I.S bi-directional communication system',
    signals: [
        'PERFORMANCE_STABLE',
        'CRITICAL_ISSUE',
        'PERFORMANCE_DEGRADED',
        'QUESTION',
        'FINDING'
    ]
};

export default communicationGuide;
