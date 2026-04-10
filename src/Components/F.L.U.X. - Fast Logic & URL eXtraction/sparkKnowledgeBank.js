/**
 * S.P.A.R.K Knowledge Bank
 * Specialty: Runtime Specialist (Lightweight & Fast)
 * 
 * S.P.A.R.K focuses on immediate runtime issues - what's broken RIGHT NOW
 * and how to quickly identify and fix it. Emergency responder mindset.
 * Quick pattern matching without deep architectural analysis.
 */

export const sparkKnowledge = {

    // ═══════════════════════════════════════════════════════════════
    // JAVASCRIPT RUNTIME ERRORS
    // ═══════════════════════════════════════════════════════════════

    runtimeErrors: {
        nullPointer: {
            pattern: "Cannot read property 'X' of null",
            meaning: "Trying to access a property on something that doesn't exist",
            quickCheck: "Variable is null when code expects an object",
            commonCauses: [
                "Element not found in DOM",
                "API returned null instead of data",
                "Timing issue - accessed before initialization"
            ]
        },

        undefined: {
            pattern: "Cannot read property 'X' of undefined",
            meaning: "Variable was never assigned a value",
            quickCheck: "Variable declared but not initialized",
            commonCauses: [
                "Function didn't return expected value",
                "Typo in variable name",
                "Async operation not complete yet"
            ]
        },

        syntaxError: {
            pattern: "Unexpected token",
            meaning: "Code has invalid JavaScript syntax",
            quickCheck: "Look at line number - usually missing bracket or comma",
            commonCauses: [
                "Missing closing bracket/parenthesis",
                "Trailing comma in object",
                "Invalid JSON format"
            ]
        },

        typeError: {
            pattern: "X is not a function",
            meaning: "Trying to call something that isn't a function",
            quickCheck: "Variable is wrong type or function name typo",
            commonCauses: [
                "Function name typo",
                "Variable shadowing function name",
                "API changed and method removed"
            ]
        },

        referenceError: {
            pattern: "X is not defined",
            meaning: "Variable/function doesn't exist in scope",
            quickCheck: "Name typo or script didn't load",
            commonCauses: [
                "Script failed to load",
                "Typo in variable name",
                "Wrong scope (trying to access local from outside)"
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CONSOLE LOG INTERPRETATION
    // ═══════════════════════════════════════════════════════════════

    consolePatterns: {
        errorLevels: {
            error: "Critical - something broke",
            warning: "Non-critical but might cause issues later",
            info: "Status updates - usually not problems",
            debug: "Detailed info for developers"
        },

        stackTrace: {
            what: "Shows chain of function calls leading to error",
            readFrom: "Bottom to top shows code execution path",
            mostImportant: "Top line is where error actually occurred",
            lineNumbers: "Click to see exact code location"
        },

        repeatingErrors: {
            pattern: "Same error multiple times",
            meaning: "Error in loop or recurring operation",
            concern: "Can indicate infinite loop or persistent state issue"
        },

        cascadingErrors: {
            pattern: "Multiple different errors in sequence",
            meaning: "First error caused subsequent failures",
            approach: "Fix the FIRST error, others might resolve automatically"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // QUICK DEBUGGING TECHNIQUES
    // ═══════════════════════════════════════════════════════════════

    quickDebugging: {
        isolateError: {
            step1: "Note exact error message and line number",
            step2: "Check what changed recently (new mod, etc.)",
            step3: "Try reproducing in safe mode",
            step4: "Binary search - disable half of mods, narrow down"
        },

        timingIssues: {
            symptom: "Intermittent errors or 'undefined' that shouldn't be",
            likely: "Code running before something is ready",
            quickFix: "Check if adding small delay helps (indicates timing)",
            properFix: "Need to wait for initialization event"
        },

        memoryLeaks: {
            symptom: "Performance degrades over time",
            quickCheck: "Does refresh fix it temporarily?",
            likely: "Event listeners not cleaned up or objects not released",
            quickFix: "Refresh page as workaround",
            properFix: "Need to find what's accumulating"
        },

        conflictDetection: {
            approach: "Disable mods one by one",
            efficient: "Binary search - disable half, test, narrow down",
            confirm: "Re-enable suspected mod and verify error returns",
            twoModConflict: "If need both mods, try changing load order"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // IMMEDIATE FIXES
    // ═══════════════════════════════════════════════════════════════

    immediateFixes: {
        clearCache: {
            when: "Stale data or 'object already exists' errors",
            how: "Settings > Advanced > Clear Mod Cache",
            effect: "Forces fresh load of all mod data",
            tradeoff: "Slower initial load after clearing"
        },

        hardRefresh: {
            when: "Resources seem outdated or not loading",
            how: "Ctrl+Shift+R (or Cmd+Shift+R on Mac)",
            effect: "Bypasses browser cache for fresh assets",
            quick: "Try this first for weird issues"
        },

        safeMode: {
            when: "Can't identify which mod causes issue",
            how: "Settings > Advanced > Safe Mode",
            effect: "Loads without any mods/extensions",
            diagnostic: "If works in safe mode = mod issue, if not = core issue"
        },

        disableRecent: {
            when: "Issue started after adding something",
            how: "Disable most recently added mod/extension",
            effect: "Usually the newest change is the culprit",
            common: "Most issues are from new additions"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PERFORMANCE QUICK CHECKS
    // ═══════════════════════════════════════════════════════════════

    performancePatterns: {
        highCPU: {
            symptom: "Browser tab using lots of CPU",
            likelyCauses: [
                "Animation loop running unnecessarily",
                "Polling operation too frequent",
                "Heavy computation in mod"
            ],
            quickCheck: "Does disabling visual mods help?"
        },

        highMemory: {
            symptom: "Tab memory usage grows over time",
            likelyCauses: [
                "Memory leak in mod",
                "Large assets not being cleaned up",
                "Too many objects cached"
            ],
            quickCheck: "Does memory reset after refresh?"
        },

        slowLoading: {
            symptom: "Takes long time to start",
            likelyCauses: [
                "Too many mods enabled",
                "Large mod assets",
                "Network issues loading CDN resources"
            ],
            quickCheck: "Check network tab for slow requests"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // NETWORK ISSUES
    // ═══════════════════════════════════════════════════════════════

    networkPatterns: {
        corsError: {
            pattern: "blocked by CORS policy",
            meaning: "Browser blocking external resource load",
            quickCheck: "Resource from different domain than Nexus",
            limitation: "Can't fix from user side - needs server config"
        },

        404Error: {
            pattern: "Failed to load resource: 404",
            meaning: "File not found at expected URL",
            quickCheck: "URL might be wrong or resource moved/deleted",
            commonCause: "CDN link in mod is broken or outdated"
    },

    timeoutError: {
        pattern: "net::ERR_TIMED_OUT",
        meaning: "Request took too long and gave up",
        quickCheck: "Network slow or server not responding",
        retry: "Often works on second try"
    }
  },

// ═══════════════════════════════════════════════════════════════
// SURFACE-LEVEL UNDERSTANDING
// ═══════════════════════════════════════════════════════════════

basicUnderstanding: {
    userPsychology: "Users usually try the most obvious thing first before asking for help",

        designPatterns: "Know they exist (like MVC, observer) but not deeply familiar",

            modArchitecture: "Understand mods have init/run phases but not deep internal workings",

                uxImplications: "Can recognize when error affects user experience but I.R.I.S better at predicting user impact"
}
};

export default sparkKnowledge;
