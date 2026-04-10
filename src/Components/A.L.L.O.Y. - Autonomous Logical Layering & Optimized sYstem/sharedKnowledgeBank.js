/**
 * Shared Knowledge Bank
 * 
 * Knowledge that both S.P.A.R.K and I.R.I.S have access to.
 * This represents common ground - the foundational understanding
 * both AIs share about Nexus, its features, and basic operations.
 */

export const sharedKnowledge = {

    // ═══════════════════════════════════════════════════════════════
    // NEXUS CORE FEATURES
    // ═══════════════════════════════════════════════════════════════

    nexusFeatures: {
        extensions: {
            description: "User-created enhancements that add functionality",
            examples: ["Custom UI panels", "New game modes", "Enhanced analytics"],
            location: "Extensions panel in sidebar",
            canConflict: true
        },

        mods: {
            description: "Modifications to game behavior and appearance",
            types: ["Visual mods", "Gameplay mods", "Audio mods", "Content mods"],
            location: "Mods panel in sidebar",
            loadOrder: "Matters for compatibility",
            canConflict: true
        },

        themes: {
            description: "Visual appearance customization for Nexus UI",
            scope: "Affects UI only, not game content",
            location: "Settings > Appearance",
            canConflict: false
        },

        games: {
            description: "Integrated games and emulators",
            types: ["Flash games", "HTML5 games", "Emulated games", "Web games"],
            location: "Games panel",
            requiresCDN: "Some games load external resources"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS SYSTEM
    // ═══════════════════════════════════════════════════════════════

    settings: {
        general: {
            autoSave: "Automatically saves progress and state",
            notifications: "Controls system notification behavior",
            startupMode: "What loads when Nexus starts"
        },

        advanced: {
            modCaching: "Stores mod data for faster loading (can cause stale data issues)",
            debugMode: "Enables verbose console logging",
            performanceMode: "Trades features for speed",
            developerTools: "Exposes internal APIs and debugging tools"
        },

        appearance: {
            theme: "Visual theme selection",
            customCSS: "User-injected styling",
            animations: "UI animation toggles",
            compactMode: "Reduces spacing and element size"
        },

        privacy: {
            analytics: "Usage data collection toggle",
            crashReports: "Automatic error reporting",
            localStorage: "Persistent data storage toggle"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // USER WORKFLOWS
    // ═══════════════════════════════════════════════════════════════

    commonWorkflows: {
        installMod: [
            "Navigate to Mods panel",
            "Click 'Add Mod' or import file",
            "Mod appears in list",
            "Toggle to enable/disable"
        ],

        troubleshootIssue: [
            "Check console for errors (F12)",
            "Review recently enabled mods/extensions",
            "Try disabling mods one by one",
            "Check if issue persists in safe mode"
        ],

        reportBug: [
            "Enable debug mode in settings",
            "Reproduce the issue",
            "Copy console logs",
            "Include mod list and Nexus version"
        ],

        optimizePerformance: [
            "Enable performance mode",
            "Disable unnecessary mods",
            "Clear mod cache",
            "Reduce visual effects"
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // BASIC TROUBLESHOOTING
    // ═══════════════════════════════════════════════════════════════

    basicTroubleshooting: {
        firstSteps: [
            "Check console for obvious errors",
            "Verify the issue is reproducible",
            "Note what changed recently (new mod, update, etc.)",
            "Check if issue occurs in safe mode"
        ],

        commonIssues: {
            gameWontLoad: "Often mod conflicts or resource loading failures",
            slowPerformance: "Too many active mods or memory leaks",
            crashOnStartup: "Usually initialization errors or corrupted cache",
            missingFeatures: "Might be disabled in settings or extension not loaded",
            visualGlitches: "Theme conflicts or CSS injection issues"
        },

        safeMode: {
            what: "Loads Nexus with all mods/extensions disabled",
            when: "Use to isolate whether issue is from user content or core",
            how: "Settings > Advanced > Enable Safe Mode, then restart"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DATA STORAGE
    // ═══════════════════════════════════════════════════════════════

    dataStorage: {
        localStorage: {
            what: "Browser's persistent storage",
            stores: ["User preferences", "Mod data", "Game saves", "Cache"],
            limits: "Usually 5-10MB depending on browser",
            canCorrupt: true
        },

        sessionStorage: {
            what: "Temporary storage cleared on tab close",
            stores: ["Temporary state", "Session tokens"],
            safer: "Less prone to corruption"
        },

        cache: {
            modCache: "Stores mod metadata and assets",
            gameCache: "Stores game resources",
            canStale: "May hold outdated data causing issues"
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // COMMON TERMINOLOGY
    // ═══════════════════════════════════════════════════════════════

    terminology: {
        "load order": "Sequence in which mods initialize (affects compatibility)",
        "conflicting mods": "Mods that try to modify the same thing",
        "mod loader": "System that manages mod initialization",
        "extension API": "Interface for extensions to interact with Nexus",
        "safe mode": "Loads Nexus without user content",
        "debug mode": "Verbose logging for troubleshooting",
        "CDN": "Content Delivery Network - external resource host",
        "CORS": "Cross-Origin Resource Sharing - security policy for external resources"
    }
};

export default sharedKnowledge;
