# Minecraft Browser Port Progress

Last updated: 2026-04-06

## Current Status

### Pipeline Status
- Targeted compile for cii/class_1947 is stable and passing in strict target-only mode.
- Phased gate scripts are in place:
  - scripts/minecraft-browser/run-dev-gates.sh
  - scripts/minecraft-browser/run-all-phases.sh
  - scripts/minecraft-browser/create-teavm-bootstrap.sh
- Baseline gates now default to MC_BASELINE_TARGETS=cii to avoid bib transitive dependency noise.
- Broad target hardening remains available via MC_BASELINE_TARGETS='bib cii'.

### What Is Confirmed Working
- prepare-classpath for 1.12.2
- decompile-minecraft for 1.12.2
- prepare-source-overlay with sanitizer rules for class_1947
- compile-overlay-slice
- compile-overlay-targets for cii

### What Is Not Yet Confirmed
- Full TeaVM success for 1.12.2 pipeline
- Browser runtime boot to menu
- Input/render loop playability

## Key Fixes Already Implemented

### class_1947 stabilization
- Removed unresolved placeholder usages and replaced with compile-safe behavior.
- Added enum shim where needed for missing renamed type references.
- Removed direct transitive pulls for strict target compile safety.
- Replaced platform enum references with OS-name checks in file open path.

### Overlay persistence
- Added prepare-source-overlay normalizations to prevent class_1947 regressions on regen.
- Added recurring rewrites for known decompiler artifacts:
  - U+2603 replacement
  - do(...) keyword collisions
  - class_1947 target-specific placeholder and dependency rewrites

### Gate and orchestration scripts
- Added repeatable phases and logs:
  - build/minecraft-browser/1.12.2/dev-gates.log
  - build/minecraft-browser/1.12.2/dev-gates.summary
  - build/minecraft-browser/1.12.2/playable-phases.log
  - build/minecraft-browser/1.12.2/playable-phases.summary

## Resume Commands

### Standard phased run
```bash
npm run mc:phases:1122
```

### Baseline only
```bash
npm run mc:gates:baseline:1122
```

### Broad baseline hardening (bib + cii)
```bash
npm run mc:gates:baseline:1122:broad
```

### TeaVM and isolate
```bash
npm run mc:gates:teavm:1122
npm run mc:gates:isolate:1122
```

### Runtime bootstrap generation
```bash
npm run mc:bootstrap:1122
```

## Root Cleanup and Reorganization Log

This section tracks non-functional structural cleanup (docs/tools/data/root declutter).

### 2026-04-06
- Created this progress file.
- Approved staged cleanup policy:
  - Move to archive/trash-candidates first for deletions.
  - Then hard-delete after validation.
- Approved immediate removals:
  - ChatGPT FULL conversation.txt
  - empty Game Engine's (PORTS)/
- Executed root declutter migrations:
  - API-SYSTEM-UPDATE.md -> docs/development/API-SYSTEM-UPDATE.md
  - CODEBASE_AUDIT.md -> docs/development/CODEBASE_AUDIT.md
  - RELEASE_PLAN_1.0.0.md -> docs/versions/RELEASE_PLAN_1.0.0.md
  - IRIS_IMPLEMENTATION_SUMMARY.md -> docs/development/IRIS_IMPLEMENTATION_SUMMARY.md
  - IRIS_QUICKSTART.md -> docs/IRIS_QUICKSTART.md
  - OLLAMA_INTEGRATION_SUMMARY.md -> docs/development/OLLAMA_INTEGRATION_SUMMARY.md
  - OLLAMA_FILES_MANIFEST.md -> docs/development/OLLAMA_FILES_MANIFEST.md
  - TRANSFORMER_IMPLEMENTATION.md -> docs/development/TRANSFORMER_IMPLEMENTATION.md
  - OLLAMA_QUICK_REFERENCE.sh -> scripts/setup/OLLAMA_QUICK_REFERENCE.sh
  - ollama-quick-setup.sh -> scripts/setup/ollama-quick-setup.sh
  - GAMES_LIBRARY_FEATURES.md -> docs/games/GAMES_LIBRARY_FEATURES.md
  - GAME_DESCRIPTIONS_AND_ICONS_README.md -> docs/games/GAME_DESCRIPTIONS_AND_ICONS_README.md
  - GAME_ICONS_GUIDE.md -> docs/games/GAME_ICONS_GUIDE.md
  - USING_REAL_GAME_ICONS.md -> docs/games/USING_REAL_GAME_ICONS.md
  - IRIS_TRANSFORMER_INTEGRATION.md -> docs/development/IRIS_TRANSFORMER_INTEGRATION.md
- Executed immediate deletion:
  - ChatGPT FULL conversation.txt
- Executed additional root declutter migrations:
  - check-diff.sh -> scripts/maintenance/check-diff.sh
  - copy-icons.sh -> scripts/games/copy-icons.sh
  - download-game-icons.js -> scripts/games/download-game-icons.js
  - extract-found-icons.js -> scripts/games/extract-found-icons.js
  - extract-game-icons.js -> scripts/games/extract-game-icons.js
  - extract-icon-urls.js -> scripts/games/extract-icon-urls.js
  - setup-eaglercraft.sh -> scripts/setup/setup-eaglercraft.sh
  - Gemini_I.R.I.S_features.txt -> docs/features/Gemini_I.R.I.S_features.txt
  - Nexus_Feature.txt -> docs/features/Nexus_Feature.txt
  - NEW_GAMES_BATCH_1.json -> data/games/NEW_GAMES_BATCH_1.json
- Added compatibility wrappers for script path normalization:
  - scripts/games/auto-generate-manifest.js
  - scripts/games/add-game-descriptions.py
  - scripts/games/update-game-descriptions.js
- Kept root originals for compatibility (temporary):
  - auto-generate-manifest.js
  - add-game-descriptions.py
  - update-game-descriptions.js

### Protected Paths (kept at root)
- MinecraftVersions
- minecraft-browser-port
- Minecraft_FULLcode
- native-launch-helper
- src
- public
- build
- scripts
- package.json

Reason: these paths are consumed by build/runtime scripts or launcher code with root-relative assumptions.

## Next Work Items

1. Complete TeaVM gate and isolate first blocker family.
2. Patch first blocker cluster and persist into overlay-prep where recurring.
3. Validate runtime bootstrap and browser boot diagnostics.
