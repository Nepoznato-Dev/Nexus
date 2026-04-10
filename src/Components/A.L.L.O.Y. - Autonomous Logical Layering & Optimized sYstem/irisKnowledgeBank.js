/**
 * I.R.I.S Knowledge Bank
 * Specialty: Architecture & Systems Specialist (Deep Understanding)
 * 
 * I.R.I.S focuses on WHY things break, not just that they broke.
 * Deep understanding of system architecture, mod ecosystem internals,
 * integration patterns, and holistic system behavior.
 * Sees the bigger picture and underlying causes.
 */

export const irisKnowledge = {

    // ═══════════════════════════════════════════════════════════════
    // NEXUS SYSTEM ARCHITECTURE
    // ═══════════════════════════════════════════════════════════════

    systemArchitecture: {
        coreComponents: {
            layout: {
                role: "Main orchestrator - renders UI and coordinates systems",
                responsibilities: ["State management", "Component lifecycle", "Event routing"],
                dependencies: "Hub for all other components",
                criticalPath: "If Layout breaks, entire system fails"
            },

            modLoader: {
                role: "Manages mod lifecycle and dependency injection",
                phases: ["Discovery", "Validation", "Load order resolution", "Initialization", "Runtime"],
                dependencies: "Depends on localStorage for persistence, Extension API for hooks",
                criticalPath: "Early initialization - failures cascade"
            },

            extensionSystem: {
                role: "Provides API for user-created functionality",
                architecture: "Event-driven with hook system",
                sandboxing: "Limited - extensions have wide access",
                dependencies: "Core APIs, mod data accessor, settings system",
                riskProfile: "High - poorly written extensions can break core"
            },

            gameIntegration: {
                role: "Bridge between Nexus UI and game content",
                boundary: "iframe sandboxing for games, postMessage for communication",
                challenges: ["Cross-origin restrictions", "Resource loading", "State synchronization"],
                dependencies: "CDN for game assets, iframe API, message bus"
            },

            stateManagement: {
                role: "Maintains application state across sessions",
                storage: "localStorage for persistence, React state for runtime",
                syncChallenges: "localStorage can desync from runtime state",
                corruptionRisk: "Manual edits or failed writes can corrupt state"
            }
        },

        dataFlow: {
            initialization: [
                "Layout mounts → reads localStorage",
                "Settings loaded → applied to state",
                "Mod loader discovers mods → validates → sorts by load order",
                "Extensions registered → hooks attached",
                "UI renders with loaded state",
                "Mods initialize in sequence",
                "Game integrations load lazily"
            ],

            runtime: [
                "User action → event fired",
                "Layout routes event to appropriate component",
                "Component updates state",
                "State change triggers re-render",
                "localStorage synced if persistence needed",
                "Mods notified via hooks if relevant"
            ],

            shutdown: [
                "State serialized to localStorage",
                "Mod cleanup handlers called",
                "Event listeners removed",
                "Resources released"
            ]
        },

        criticalDependencies: {
            localStorage: {
                what: "Primary persistence mechanism",
                failures: "Quota exceeded, access denied, corruption",
                impact: "State loss, initialization failures, crashes",
                mitigation: "Fallback to sessionStorage or memory-only mode"
            },

            react: {
                what: "UI rendering library",
                failures: "Render errors, infinite loops, state inconsistency",
                impact: "White screen, unresponsive UI, memory leaks",
                mitigation: "Error boundaries catch render failures"
            },

            cdnResources: {
                what: "External game assets and libraries",
                failures: "Network errors, CORS issues, 404s",
                impact: "Games won't load, features missing",
                mitigation: "Graceful degradation with fallbacks"
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // MOD ECOSYSTEM DEEP DIVE
    // ═══════════════════════════════════════════════════════════════

    modEcosystem: {
        modLifecycle: {
            discovery: {
                how: "Scan localStorage for mod entries",
                validation: "Check required fields (id, version, entryPoint)",
                rejection: "Invalid mods skipped with console warning"
            },

            dependencyResolution: {
                how: "Build dependency graph from mod manifests",
                loadOrder: "Topological sort ensures dependencies load first",
                conflicts: "Detect cycles and incompatible versions",
                failure: "Circular dependencies prevent loading entire chain"
            },

            initialization: {
                when: "After DOM ready, before game loads",
                sequence: "Dependencies first, then dependents",
                context: "Mods receive API object with hooks and utilities",
                failure: "Init error prevents mod from running but doesn't stop others"
            },

            runtime: {
                hooks: "Mods can attach to lifecycle events (onGameLoad, onSettingsChange, etc.)",
                communication: "Mods can expose APIs for other mods",
                isolation: "No true sandboxing - mods share global scope",
                conflicts: "Multiple mods can override same functionality"
            },

            cleanup: {
                when: "Mod disabled or Nexus shutdown",
                required: "Mods should remove listeners and release resources",
                reality: "Many mods don't clean up properly",
                impact: "Memory leaks, zombie listeners, stale state"
            }
        },

        modTypes: {
            visual: {
                what: "UI modifications and themes",
                mechanism: "CSS injection or DOM manipulation",
                risks: "Can break layout if selectors too broad",
                conflicts: "Multiple visual mods often clash on same elements"
            },

            gameplay: {
                what: "Game behavior modifications",
                mechanism: "Hook into game events and modify data/logic",
                risks: "Can corrupt save data or create impossible states",
                conflicts: "Multiple mods changing same game variable"
            },

            content: {
                what: "Add new games, levels, assets",
                mechanism: "Register new content via API",
                risks: "Large assets can slow loading",
                conflicts: "Rare - usually additive"
            },

            utility: {
                what: "Tools and helpers (debug, analytics, etc.)",
                mechanism: "Add UI panels or background processes",
                risks: "Background processes can affect performance",
                conflicts: "UI panels can overlap"
            }
        },

        modInteractions: {
            directDependency: {
                pattern: "Mod B requires Mod A",
                handling: "Load order ensures A initializes before B",
                failure: "If A fails, B should gracefully degrade"
            },

            implicitDependency: {
                pattern: "Mod B assumes Mod A's changes but doesn't declare it",
                handling: "No system enforcement",
                failure: "B breaks if A not present or loads in wrong order"
            },

            conflictingOverrides: {
                pattern: "Mod A and B both override same function",
                handling: "Last one wins (determined by load order)",
                issue: "First mod's functionality lost unless chaining used"
            },

            resourceContention: {
                pattern: "Both mods want exclusive access to same resource",
                handling: "No locking mechanism - race condition",
                issue: "Unpredictable behavior depending on timing"
            },

            stateCorruption: {
                pattern: "Mod writes invalid data to shared state",
                handling: "No validation on state writes",
                issue: "Corrupts state for all mods using that data"
            }
        },

        modCompatibility: {
            versionMismatch: {
                what: "Mod built for different Nexus version",
                detection: "Check mod manifest targetVersion against running version",
                risk: "API changes may break mod functionality",
                handling: "Warning shown but mod still loads (best-effort)"
            },

            loaderIncompatibility: {
                what: "Mod expects different loader version",
                detection: "Loader version in manifest vs actual loader",
                risk: "Init signature changes can prevent loading",
                handling: "Should block load and show error"
            },

            peerConflicts: {
                what: "Known incompatible mod combinations",
                detection: "Mod can declare incompatibleWith list",
                risk: "Both mods load but conflict at runtime",
                handling: "Warning shown, user must choose one"
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DATA STRUCTURES & STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    dataStructures: {
        modSnapshot: {
            purpose: "Captures state of all mods at a point in time",
            structure: {
                mods: "Array of mod objects with id, version, enabled status",
                timestamp: "When snapshot taken",
                nexusVersion: "Nexus version at time of snapshot"
            },
            uses: ["Rollback after failed updates", "Debugging", "Known-good state restoration"],
            storage: "localStorage key: 'nexus_last_known_good_mods'"
        },

        modCache: {
            purpose: "Speeds up mod loading by caching parsed data",
            structure: "Map of mod id → cached metadata and assets",
            invalidation: "Should invalidate on mod update or version change",
            corruption: "Stale data if invalidation fails",
            storage: "localStorage key: 'nexus_mods_cache'"
        },

        settingsObject: {
            purpose: "User preferences across all categories",
            structure: "Nested object with category → setting → value",
            defaults: "Merged with saved settings to handle new settings",
            migration: "Old setting keys need migration on schema changes",
            storage: "localStorage key: 'nexus_settings'"
        },

        gameState: {
            purpose: "Active game state and save data",
            structure: "Varies by game - usually object with progress/inventory/stats",
            persistence: "Saved to localStorage per-game",
            corruption: "Mod bugs can write invalid state",
            recovery: "No automatic rollback - user loses progress if corrupted"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INTEGRATION PATTERNS
    // ═══════════════════════════════════════════════════════════════

    integrationPatterns: {
        gameToNexus: {
            mechanism: "postMessage from iframe to parent",
            dataFlow: "Game events → Nexus event bus → mods notified",
            challenges: ["Serialization limits", "Origin validation", "Message ordering"],
            failures: "Messages lost if not properly awaited"
        },

        nexusToGame: {
            mechanism: "postMessage from parent to iframe",
            dataFlow: "Nexus state changes → game notified via message",
            challenges: ["Game must listen", "Timing - game might not be ready"],
            failures: "Message sent before game listener attached"
        },

        modToCore: {
            mechanism: "API object passed to mod init function",
            dataFlow: "Mod calls API methods → core handles request",
            isolation: "API provides controlled access to core",
            bypass: "Mods can still access window globals directly"
        },

        modToMod: {
            mechanism: "Shared namespace or event bus",
            dataFlow: "Mod A publishes API → Mod B imports and calls",
            challenges: ["No versioning", "No contracts", "Breaking changes"],
            failures: "API changes break dependent mods"
        },

        cdnResourceLoading: {
            mechanism: "Dynamic script/asset loading from external CDN",
            dataFlow: "Game/mod requests resource → fetch/load → CORS check → parse",
            challenges: ["CORS policies", "Network reliability", "CDN availability"],
            failures: ["404 if resource moved", "CORS if misconfigured", "Timeout on slow networks"],
            mitigation: "Fallback URLs, local caching, graceful degradation"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PATTERN RECOGNITION
    // ═══════════════════════════════════════════════════════════════

    patternRecognition: {
        timingIssues: {
            indicators: [
                "Errors that disappear on retry",
                "Intermittent 'undefined' errors",
                "Race condition symptoms",
                "Works in slow mode but fails in normal mode"
            ],
            rootCause: "Code executing before dependencies ready",
            systemImplications: "Initialization order problem or missing await"
        },

        staleDataPatterns: {
            indicators: [
                "Changes not persisting",
                "Old values reappearing",
                "Settings reverting",
                "'Already exists' errors"
            ],
            rootCause: "Cache not invalidated or localStorage out of sync",
            systemImplications: "State management layer has sync issues"
        },

        cascadingFailures: {
            indicators: [
                "One error triggers many others",
                "Error flood in console",
                "System progressively degrading"
            ],
            rootCause: "Critical dependency failed early",
            systemImplications: "Error boundaries not catching upstream failures"
        },

        memoryLeakPatterns: {
            indicators: [
                "Performance degrades over time",
                "Memory usage grows continuously",
                "Eventually browser freezes",
                "Refresh temporarily fixes"
            ],
            rootCause: "Resources not released or listeners not removed",
            systemImplications: "Mod cleanup not being called or implemented"
        },

        conflictPatterns: {
            indicators: [
                "Issue disappears when mods disabled",
                "Different behavior based on load order",
                "Functionality X stops working when mod Y enabled"
            ],
            rootCause: "Multiple mods modifying same resource",
            systemImplications: "Need better mod isolation or conflict detection"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // USER PSYCHOLOGY & BEHAVIOR
    // ═══════════════════════════════════════════════════════════════

    userPsychology: {
        troubleshootingBehavior: {
            typical: [
                "Try the obvious fix first (refresh, restart)",
                "Blame most recent change",
                "Disable/re-enable hoping it 'resets'",
                "Google exact error message",
                "Ask for help when frustrated"
            ],

            patterns: {
                repeatSameAction: "User thinks 'maybe it'll work this time'",
                assumeCorruption: "Users often jump to 'need to reinstall'",
                overlookSimple: "Miss obvious solutions when stressed",
                skipReadingErrors: "Don't actually read full error message"
            }
        },

        errorReporting: {
            challenges: [
                "Users describe symptoms not root cause",
                "Incomplete reproduction steps",
                "Forget to mention recent changes",
                "Describe what they wanted not what happened"
            ],

            interpretation: {
                "it's broken": "Something specific isn't working - need more detail",
                "nothing works": "Usually one thing broke and cascaded",
                "it worked before": "Recent change caused regression",
                "sometimes works": "Timing or state-dependent issue"
            }
        },

        modUsageBehavior: {
            patterns: {
                addMany: "Users enable multiple mods at once then surprised by conflicts",
                noBackup: "Don't save known-good state before experimenting",
                ignoreWarnings: "Click past incompatibility warnings",
                updateAll: "Update everything at once, can't isolate what broke"
            },

            expectations: {
                justWorks: "Expect mods to be plug-and-play",
                noConflicts: "Don't anticipate incompatibilities",
                instantFix: "Expect problems to resolve immediately",
                noTradeoffs: "Want all features without performance cost"
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // HISTORICAL PATTERNS
    // ═══════════════════════════════════════════════════════════════

    historicalPatterns: {
        recurringIssues: {
            modLoadOrder: "Consistently causes problems when users have many mods",
            cacheCorruption: "Periodic issue after updates or crashes",
            integrationTiming: "Games loading before Nexus ready",
            cdnOutages: "External dependencies sometimes unavailable"
        },

        updateRegressions: {
            pattern: "New Nexus version breaks previously working mods",
            cause: "API changes without deprecation period",
            mitigation: "Known-good state rollback, compatibility shims"
        },

        userAdoption: {
            pattern: "Features users don't know about remain unused",
            examples: ["Safe mode", "Mod snapshots", "Debug mode"],
            implication: "Users struggle with issues that existing features solve"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SURFACE-LEVEL TECHNICAL UNDERSTANDING
    // ═══════════════════════════════════════════════════════════════

    technicalFamiliarity: {
        javascript: "Can read and understand code logic, not expert in syntax quirks",

        debugging: "Know concepts (breakpoints, watches, call stacks) but S.P.A.R.K better at execution",

        errorCodes: "Recognize common error patterns but rely on S.P.A.R.K for specific interpretation",

        performanceProfiling: "Understand concepts but S.P.A.R.K handles technical profiling"
    }
};

export default irisKnowledge;
