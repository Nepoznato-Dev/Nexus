# 🗺️ Nexus I.R.I.S. Enhancement Roadmap

> Co-designed with ChatGPT 5.2 | Prioritized Feature Backlog | Implementation Guide

---

## 🎯 Strategic Goals

1. **Safety First**: Control, undo, and audit every AI action
2. **Portability**: Export/import user data, settings, and layouts
3. **Customization**: Full UI overlay system with drag-and-drop editor
4. **Trustworthiness**: Source validation, evidence binding, conflict detection
5. **Polish**: Premium UX with smart defaults and command palette

---

## 📊 Feature Categories & Priority

### Phase 1: 🧱 Core Backbone (Safety & Control) - **HIGH PRIORITY**

*Build the foundation for safe AI integration*

#### 1. Feature Flags / Kill Switches
**Status**: Not Started  
**Priority**: Critical  
**Complexity**: Low  
**Dependencies**: None  
**Est. Lines**: 150-200

**Purpose**: Toggle AI features on/off at runtime without redeploying

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisFeatureFlags.js
export const FEATURE_FLAGS = {
  COMMON_SENSE_ENABLED: true,
  PROACTIVE_SUGGESTIONS_ENABLED: true,
  SELF_AWARENESS_ENABLED: true,
  SEARCH_SOLVER_ENABLED: true,
  DASHBOARD_INTEGRATION_ENABLED: true,
  AUTO_SAVE_ENABLED: true,
  THINKING_DISPLAY_ENABLED: false,
};

export function isFeatureEnabled(flagName) {
  // Load from clientStorage if override exists
  // Fall back to FEATURE_FLAGS default
}

export function setFeatureFlag(flagName, enabled) {
  // Save to clientStorage
  // Trigger UI update
  // Log change to audit
}
```

**Storage**: ClientStorage.featureFlags (IndexedDB)  
**API**: 
- `isFeatureEnabled(flagName)` → boolean
- `setFeatureFlag(flagName, enabled)` → {success, previous, current}
- `getAllFeatureFlags()` → {flagName: boolean}
- `resetToDefaults()` → {restored: []}

**UI Integration**:
- Settings > Advanced > Feature Flags toggles
- Shows current state + revert to defaults button
- Logs all flag changes to audit trail

---

#### 2. Undo / Keep Bar (GitHub-style)
**Status**: Not Started  
**Priority**: Critical  
**Complexity**: Medium  
**Dependencies**: Action Registry (Phase 1 #7)  
**Est. Lines**: 300-400

**Purpose**: Undo/redo stack for AI and user actions with visual timeline

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisUndoManager.js
export class UndoManager {
  constructor(maxStackSize = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxStackSize;
  }

  recordAction(action) {
    // Action: {id, type, description, timestamp, forward, reverse, metadata}
    // forward: () => performs action
    // reverse: () => undoes action
  }

  undo() → {success, action, stackSize}
  redo() → {success, action, stackSize}
  getHistory() → [{id, type, description, timestamp, canUndo, canRedo}]
  setCheckpoint(label) → {checkpointId}
  revertToCheckpoint(checkpointId) → {success, actionCount}
}
```

**UI Component**: Keep Bar (sticky bottom UI)
- Shows: "5 changes" with timeline
- Hover to see list
- Click to undo/redo
- Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z
- "Clear history" button
- Visual indicator: yellow for unsaved, green for saved

**Integration Points**:
- Every dashboard change → `recordAction()`
- Every AI edit → `recordAction()`
- Settings changes → `recordAction()`
- On app close: Save undo stack to IndexedDB (persist for session)

---

#### 3. Patch-Based Change System (forward + reverse)
**Status**: Not Started  
**Priority**: High  
**Complexity**: High  
**Dependencies**: Undo Manager (Phase 1 #2)  
**Est. Lines**: 400-500

**Purpose**: Track all changes as reversible patches (like Git diff)

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisPatchSystem.js
export class PatchEntry {
  constructor(source, target, description) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.source = 'AI' | 'USER' | 'SYSTEM';
    this.description = description;
    this.forward = () => applies patch forward;
    this.reverse = () => reverts patch;
    this.metadata = {
      aiModel: 'gpt-4',
      confidence: 0.85,
      reasoning: 'Why AI made this change',
    };
  }
}

// Patch storage: IndexedDB patchLog
// Query: getPatchesBetween(timestamp1, timestamp2)
// Query: getPatchesBySource('AI' | 'USER')
// Query: getPatchDescription(patchId)
```

**Patch Types**:
1. Settings change: `{oldValue, newValue, path}`
2. Layout edit: `{oldLayout, newLayout, elementId}`
3. Widget add/remove: `{type, position, config}`
4. Dashboard state: `{oldState, newState}`
5. AI action: `{oldResponse, newResponse, reasoning}`

**Audit Trail**:
```javascript
export class PatchAudit {
  getPatchHistory(limit = 100) → {patches, totalCount}
  exportPatchLog(startTime, endTime) → JSON
  importPatchLog(json) → {applied, skipped}
  diffStates(timestamp1, timestamp2) → {changes[]}
}
```

---

#### 4. Snapshots + Restore Points
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Feature Flags, Undo Manager  
**Est. Lines**: 250-350

**Purpose**: Before any risky AI edit, save full app state snapshot

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisSnapshots.js
export class SnapshotManager {
  // Auto-snapshots BEFORE any AI change
  // Manual snapshots: "Save State" button
  
  createSnapshot(label, autoTriggered = false) → {
    id: string,
    timestamp: number,
    label: string,
    size: bytes,
    includesMemory: boolean,
  }

  // Snapshot contents:
  // - Full dashboard state
  // - All settings
  // - Conversation state
  // - User profile (optional)
  // - Undo/redo stack (optional)
  
  listSnapshots(limit = 20) → [{snapshot}]
  restoreSnapshot(snapshotId) → {success, restored: {}}
  deleteSnapshot(snapshotId) → {success}
  diffSnapshots(id1, id2) → {changes: []}
  
  // Auto-cleanup: Keep last 10 snapshots + snapshots < 7 days
  // Manual cleanup: User can delete
}
```

**Storage Strategy**:
- Small snapshots: IndexedDB (< 5MB)
- Large snapshots: Offer download as JSON
- Memory-heavy snapshots: Option to exclude conversation history

**UI Integration**:
- "Snapshots" panel in Settings
- Timeline view with labels
- Auto-snapshot indicators (green dot = before AI change)
- Quick restore buttons
- "Diff with current" to preview what changes

---

#### 5. Safe Mode Boot
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Medium  
**Dependencies**: Feature Flags  
**Est. Lines**: 200-300

**Purpose**: Start Nexus with overlay/UI disabled to diagnose issues

**Implementation Plan**:
```javascript
// Activation: 
// - URL param: ?safeMode=true
// - Or: Hold Shift during page load (3 second window)
// - Or: Special key combo: Alt+Shift+S

// Safe Mode disables:
// - I.R.I.S. AI system (all modules)
// - Overlays and custom UI
// - Plugins/extensions
// - Auto-save
// - Dark mode (reset to light)

// Safe Mode shows:
// - Minimal dashboard
// - Settings only
// - Error console if JS errors
// - "Exit Safe Mode" button at top

// Logging:
// - Log "Entered Safe Mode" with browser/OS info
// - Background: Check for JS errors
// - On exit: Report findings to user

export function initSafeMode() {
  // Suppress all non-critical modules
  // Disable feature flags
  // Show diagnostic panel
  // Listen for errors
}
```

---

#### 6. Permissions + Confirmations for Risky Actions
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Feature Flags, Snapshots  
**Est. Lines**: 300-400

**Purpose**: Require user confirmation before destructive AI or system actions

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisPermissions.js
export const RISK_LEVELS = {
  LOW: 'no confirmation needed',
  MEDIUM: 'one-click confirm',
  HIGH: 'confirm + wait 2s',
  CRITICAL: 'confirm + password',
};

export const RISKY_ACTIONS = {
  DELETE_CONVERSATION: 'CRITICAL',
  RESET_ALL_SETTINGS: 'CRITICAL',
  CLEAR_ALL_MEMORY: 'CRITICAL',
  AI_BULK_EDIT_LAYOUT: 'HIGH',
  AI_DELETE_WIDGET: 'MEDIUM',
  AI_MODIFY_SETTINGS: 'MEDIUM',
  EXPORT_WITH_SECRETS: 'HIGH',
  IMPORT_UNKNOWN_SOURCE: 'HIGH',
};

export async function requestPermission(action, metadata) {
  const risk = RISKY_ACTIONS[action];
  
  if (risk === 'LOW') return {granted: true};
  
  if (risk === 'CRITICAL') {
    // Show modal with countdown + password
    // Only allow if password + confirm
  }
  
  if (risk === 'HIGH') {
    // Show modal with 2s countdown
    // Only allow if user clicks before timeout
  }
  
  return {granted: boolean};
}
```

**UI Components**:
- Modal with action description + consequence
- Countdown timer (for HIGH/CRITICAL)
- Password input (for CRITICAL)
- "Why is this risky?" expandable section
- "More info" link to docs

---

#### 7. Action Registry (whitelisted actions only)
**Status**: Not Started  
**Priority**: Critical  
**Complexity**: Medium  
**Dependencies**: None  
**Est. Lines**: 250-350

**Purpose**: Central registry of all allowed AI/system actions (whitelist approach)

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisActionRegistry.js
export const ACTION_REGISTRY = {
  'dashboard.setTheme': {
    description: 'Change dashboard theme',
    handler: changeTheme,
    riskLevel: 'LOW',
    parameters: {theme: 'string'},
    reversible: true,
  },
  
  'widget.add': {
    description: 'Add widget to dashboard',
    handler: addWidget,
    riskLevel: 'MEDIUM',
    parameters: {widgetType: 'string', position: 'object'},
    reversible: true,
  },
  
  'ai.suggest': {
    description: 'I.R.I.S. suggests next action',
    handler: aiSuggest,
    riskLevel: 'LOW',
    parameters: {context: 'string'},
    reversible: false,
  },
  
  'memory.clearAll': {
    description: 'Delete all conversation history',
    handler: clearMemory,
    riskLevel: 'CRITICAL',
    parameters: {},
    reversible: true, // via snapshot
  },
};

export async function executeAction(actionName, parameters, source = 'USER') {
  const action = ACTION_REGISTRY[actionName];
  
  if (!action) throw new Error(`Unknown action: ${actionName}`);
  if (!userHasPermission(actionName)) throw new Error('Permission denied');
  
  const permitted = await requestPermission(actionName, parameters);
  if (!permitted.granted) throw new Error('User denied');
  
  const result = await action.handler(parameters);
  
  recordAction({
    name: actionName,
    parameters,
    source,
    result,
    timestamp: Date.now(),
  });
  
  return result;
}

export function getAvailableActions(filter = null) {
  // UI: Show user what actions are available
}
```

**Integration**:
- Every I.R.I.S. suggestion must be in registry
- Every button click must map to registry action
- No AI code execution outside registry
- Audit log: Every action with source + parameters

---

#### 8. I.R.I.S. Action Binding (button → action binding)
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Action Registry (Phase 1 #7)  
**Est. Lines**: 200-300

**Purpose**: Bind UI elements to actions without code copying

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisActionBinding.js

// In UI components:
<NexusButton 
  action="dashboard.setTheme"
  parameters={{theme: 'dark'}}
  onExecute={(result) => console.log(result)}
/>

// Or programmatic:
export function bindAction(elementId, actionName, parameters) {
  const element = document.getElementById(elementId);
  element.addEventListener('click', async () => {
    await executeAction(actionName, parameters, 'USER');
  });
}

// Or I.R.I.S. teaches binding:
// "Click button, tell IRIS what should happen"
// IRIS generates binding config automatically
```

**Benefits**:
- No code duplication
- Central audit trail
- Easy to change behavior without code
- AI can suggest actions safely

---

#### 9. Conflict Handling (if user edits after IRIS edits)
**Status**: Not Started  
**Priority**: High  
**Complexity**: High  
**Dependencies**: Patch System, Undo Manager  
**Est. Lines**: 350-450

**Purpose**: Detect and resolve conflicts when user and AI edit same element

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisConflictResolution.js

export const CONFLICT_STRATEGIES = {
  'LAST_WRITE_WINS': 'User edit overwrites AI (default)',
  'USER_FIRST': 'User changes take priority',
  'AI_FIRST': 'AI changes take priority',
  'MERGE': 'Try to merge changes',
  'MANUAL': 'Show diff, ask user',
};

export async function detectConflict(element, aiEdit, userEdit) {
  // Compare patches on same element
  // Check timestamps
  // Determine if changes conflict or can merge
  
  // Example: AI changes color, user changes size = NO CONFLICT
  // Example: AI changes color to blue, user changes to red = CONFLICT
}

export async function resolveConflict(conflict, strategy = 'MANUAL') {
  if (strategy === 'LAST_WRITE_WINS') {
    // Keep user edit, discard AI edit
    return {resolution: 'userWins', applied: userEdit};
  }
  
  if (strategy === 'MERGE') {
    // Apply non-conflicting parts of both
    return {resolution: 'merged', applied: mergedEdit};
  }
  
  if (strategy === 'MANUAL') {
    // Show UI: "AI suggested [X], you changed [Y], which?"
    // Wait for user choice
    return {resolution: 'manual', userChoice: ...};
  }
}
```

**UI for Conflict Display**:
```
⚠️ Conflict Detected
AI wanted to change: Color to Blue
You changed: Color to Red

[Keep Your Change] [Use AI Suggestion] [Merge Both] [Show Diff]
```

---

#### 10. Performance Degradation Ladder (anti-thrash + hysteresis)
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: High  
**Dependencies**: Feature Flags  
**Est. Lines**: 300-400

**Purpose**: Detect when app is thrashing and gracefully degrade performance

**Implementation Plan**:
```javascript
// src/Components/I.R.I.S./irisPerformanceMonitoring.js

export class PerformanceLadder {
  // Levels:
  // Level 5 (NORMAL): Full features
  // Level 4: Disable automatic suggestions
  // Level 3: Disable real-time AI analysis
  // Level 2: Switch to local responses only
  // Level 1: Minimal mode (dashboard only)
  // Level 0: Safe mode (diagnostics)
  
  // Triggers (with hysteresis):
  // - CPU > 70% for 3s → degrade
  // - Memory > 500MB → degrade
  // - DNS/API failures > 3 → degrade
  // - FPS < 20 → degrade
  
  // Recovery (hysteresis prevents flip-flopping):
  // - CPU < 40% for 10s → upgrade
  // - Memory < 300MB → upgrade
  // - APIs stable for 30s → upgrade
  // - FPS > 50 → upgrade
  
  getCurrentLevel() → 0-5
  
  onDegradation(fromLevel, toLevel) {
    // Disable features
    // Notify user: "Performance mode: [Level 2/5]"
    // Log event
  }
  
  onRecovery(fromLevel, toLevel) {
    // Re-enable features
    // Notify user (optional)
  }
}
```

**Metrics to Monitor**:
- FPS (via requestAnimationFrame)
- Memory (via performance.memory if available)
- CPU (via performance metrics)
- Network (via fetch/XHR timing)
- TypedArray churn (garbage collection pressure)

---

---

### Phase 2: 🎛️ Import / Export System - **MEDIUM PRIORITY**

*Make Nexus portable and shareable*

#### 1. Profile Pack Format (versioned JSON sections)
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: None  
**Est. Lines**: 300-400

**Purpose**: All user data in portable versioned JSON format

**Implementation Plan**:
```javascript
// Nexus Profile Pack v1.0 format
{
  version: "1.0.0",
  exportDate: ISO8601,
  exportedFrom: {browser, os, nexusVersion},
  
  sections: {
    metadata: {
      profileName: "My Setup",
      description: "Work machine",
      theme: "dark",
    },
    
    settings: {
      aiTools: {...},
      personality: {...},
      appearance: {...},
      // Versioned schema, migrations available
    },
    
    layout: {
      dashboard: {...},
      widgets: [...],
      customUI: {...},
    },
    
    memory: {
      conversations: [...], // Optional
      userProfile: {...},
    },
    
    metadata: {
      checksum: "sha256...",
      compressed: boolean,
      encrypted: boolean,
    },
  },
}
```

**Migrations**:
```javascript
// v1.0 → v1.1 (hypothetical)
export const MIGRATIONS = {
  '1.0': { // from 1.0
    '1.1': (pack) => {
      // Transform pack from v1.0 to v1.1
      pack.settings.newField = 'defaultValue';
      return pack;
    },
  },
};
```

---

#### 2. Selective Export
**Status**: Not Started  
**Priority**: High  
**Complexity**: Low  
**Dependencies**: Profile Pack Format (Phase 2 #1)  
**Est. Lines**: 150-200

**Purpose**: Choose what to export (Settings / UI / Widgets / Memory)

**Implementation Plan**:
```javascript
// UI Checkboxes in Export Modal:
// ☑ Settings (AI Tools, Personality, etc)
// ☑ Dashboard Layout (widgets, positions)
// ☑ Custom UI (overlays, customizations)
// ☐ Conversation Memory (unchecked by default)
// ☐ User Profile (unchecked by default)
// ☐ Undo/Redo History (unchecked by default)

export async function exportProfile(selections) {
  // selections = {settings: true, layout: true, memory: false, ...}
  const pack = {version: "1.0.0", sections: {}};
  
  if (selections.settings) pack.sections.settings = await getSettings();
  if (selections.layout) pack.sections.layout = await getLayout();
  if (selections.memory) pack.sections.memory = await getMemory();
  // ... etc
  
  return pack;
}
```

---

#### 3. Selective Import + Preview
**Status**: Not Started  
**Priority**: High  
**Complexity**: Low  
**Dependencies**: Selective Export  
**Est. Lines**: 200-250

**Purpose**: Load profile pack, choose what to import, see preview first

**Implementation Plan**:
```javascript
// Step 1: Load pack
const pack = await loadPackFile(file);

// Step 2: Validate version + migrations
const migratedPack = await migrateIfNeeded(pack);

// Step 3: Show preview
// "Importing from: [date] [browser]"
// "This will change:"
// - Settings: AI provider, personality (show diff)
// - Layout: 5 widgets, 2 custom panels (show preview)
// - NOT changing: Conversations, user profile

// Step 4: User confirms sections to import
// Step 5: Apply changes atomically (all or nothing)
```

---

#### 4. Memory Capsule Export
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Medium  
**Dependencies**: Profile Pack Format  
**Est. Lines**: 250-300

**Purpose**: Export conversation memory in bounded, anonymized way

**Implementation Plan**:
```javascript
// Memory Capsule: Selected conversations + metadata
// But NOT raw logs (too large)
// Instead: Summarized + sample messages

export async function createMemoryCapsule(options = {}) {
  const capsule = {
    conversationCount: 145,
    dateRange: {start, end},
    topTopics: ['JavaScript', 'React', 'Design', ...],
    topicFrequencies: {...},
    averageResponseLength: 450,
    sampleConversations: [
      {topic: 'React hooks', messageCount: 12, summary: '...'}, // Not full log
    ],
    userPersonalitySnapshot: {
      preferredPace: 'fast',
      expertiseLevel: 'intermediate',
      mainFocus: 'frontend-dev',
    },
  };
  
  return capsule;
}
```

**Benefits**:
- User can share learning patterns without privacy risk
- Good for sharing "my Nexus journey"
- Much smaller than full logs
- Can be anonymized

---

#### 5. Hard Size Caps
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Low  
**Dependencies**: None  
**Est. Lines**: 150-200

**Purpose**: Never let exports exceed reasonable size (1MB, 10MB, configurable)

**Implementation Plan**:
```javascript
export const EXPORT_SIZE_LIMITS = {
  SETTINGS_ONLY: '50KB',
  LAYOUT_ONLY: '500KB',
  FULL_PACK: '10MB', // Compressed
  MEMORY_CAPSULE: '2MB',
};

export async function exportProfile(selections, maxSize = '10MB') {
  const pack = await buildPack(selections);
  const compressed = gzip(JSON.stringify(pack)); // GZIP by default
  const size = compressed.byteLength;
  
  if (size > parseBytes(maxSize)) {
    throw new Error(
      `Export too large: ${size}B > ${maxSize}. ` +
      `Try excluding: Conversations, User Profile`
    );
  }
  
  return {data: compressed, size, recommendedExclusions: [...]};
}
```

---

#### 6. No Secrets by Default
**Status**: Not Started  
**Priority**: Critical  
**Complexity**: Low  
**Dependencies**: Profile Pack Format  
**Est. Lines**: 100-150

**Purpose**: Strip API keys, passwords, tokens from exports automatically

**Implementation Plan**:
```javascript
export const SECRET_FIELDS = [
  'apiKey',
  'apiSecret',
  'token',
  'password',
  'secretKey',
  'refreshToken',
  'sessionId',
];

export function stripSecrets(obj) {
  // Recursively walk object
  // Replace any SECRET_FIELDS with "[REDACTED]"
  // Return sanitized copy
  
  return sanitized;
}

// On export:
if (!options.includeSecrets) {
  pack.sections.settings = stripSecrets(pack.sections.settings);
  // Mark: "⚠️ Secrets redacted from this export"
}
```

---

#### 7. Optional Encrypted Secrets Export
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: No Secrets by Default  
**Est. Lines**: 200-250

**Purpose**: Optionally encrypt and include secrets with user passphrase

**Implementation Plan**:
```javascript
// User chooses: "Include sensitive data (encrypted)"
// → Prompted for passphrase
// → Secrets encrypted with AES-256-GCM
// → Passphrase + salt never stored
// → On import: Ask for passphrase to decrypt

export async function encryptSecrets(secrets, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  
  const encrypted = await encryptAES256(secrets, key);
  
  return {
    encrypted,
    salt: base64(salt),
    algorithm: 'AES-256-GCM',
    iterations: 100000, // PBKDF2
  };
}

export async function decryptSecrets(encryptedData, passphrase) {
  const salt = base64decode(encryptedData.salt);
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  
  return await decryptAES256(encryptedData.encrypted, key);
}
```

---

#### 8. Migrations for Old Pack Versions
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Medium  
**Dependencies**: Profile Pack Format  
**Est. Lines**: 200-300

**Purpose**: Accept old profile packs, auto-upgrade to latest version

**Implementation Plan**:
```javascript
// Versioned migrations
export const PACK_MIGRATIONS = {
  '1.0.0': {
    '1.1.0': (pack) => {
      // Migration logic
      return pack;
    },
  },
  '1.1.0': {
    '1.2.0': (pack) => {
      // Migration logic
      return pack;
    },
  },
};

export async function migratePackToVersion(pack, targetVersion) {
  let current = pack;
  let currentVersion = pack.version;
  
  while (currentVersion !== targetVersion) {
    const route = PACK_MIGRATIONS[currentVersion]?.[targetVersion];
    if (!route) {
      throw new Error(`No migration path from ${currentVersion} to ${targetVersion}`);
    }
    current = route(current);
    currentVersion = getNextVersion(currentVersion);
  }
  
  return current;
}
```

---

#### 9. Layout Presets via Import
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Low  
**Dependencies**: Selective Import  
**Est. Lines**: 100-150

**Purpose**: Import layout as new preset, not overwrite current

**Implementation Plan**:
```javascript
// On import, ask:
// ○ Overwrite current layout ("Replace what I have")
// ○ Create new preset ("Save as variant")
// ○ Merge with current ("Add new widgets")

export async function importLayout(pack, mode = 'overwrite') {
  if (mode === 'newPreset') {
    const name = await promptUser('Name this layout preset:');
    return await saveLayoutPreset(pack.sections.layout, name);
  }
  
  if (mode === 'merge') {
    // Add imported widgets without removing current
    return await mergeLayouts(getCurrentLayout(), pack.sections.layout);
  }
  
  if (mode === 'overwrite') {
    return await setLayout(pack.sections.layout);
  }
}
```

---

---

### Phase 3: 🧩 UI Customization System - **MEDIUM PRIORITY**

*FancyMenu-style overlay system*

#### 1. Overlay System (base page + user overlay merge)
**Status**: Not Started  
**Priority**: High  
**Complexity**: High  
**Dependencies**: None (but benefits from Action Binding)  
**Est. Lines**: 500-700

**Purpose**: Layer user-created UI on top of base Nexus without modifying underlying code

**Implementation Plan**:
```javascript
// src/Components/UI/OverlayRenderer.js
export class OverlayRenderer {
  // Base: Official Nexus UI
  // Overlay: User customizations (buttons, panels, etc)
  // Merge: Combine with z-index management
  
  constructor(baseDOM) {
    this.baseDOM = baseDOM;
    this.overlayLayer = createOverlayContainer();
    this.elements = []; // {id, type, config, element}
  }
  
  addElement(config) {
    // config: {type, x, y, label, action, color, icon, ...}
    const element = this.createElement(config);
    this.overlayLayer.appendChild(element);
    this.elements.push({id: config.id, config, element});
  }
  
  removeElement(id) {}
  updateElement(id, newConfig) {}
  
  render() {
    // Draw all overlay elements
    // Handle z-index
    // Handle responsiveness
  }
  
  export() → JSON {
    // Export overlay definition
  }
  
  import(json) {
    // Load overlay definition
  }
}
```

**Storage**: IndexedDB `customUI.overlayDefinition`  
**File Format**: JSON with element array

---

#### 2. Element Types: text / image / panel / button / hotspot
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Overlay System  
**Est. Lines**: 400-500

**Purpose**: Rich element types for customization

```javascript
// Element types:

// TEXT
{type: 'text', text: 'Hello World', fontSize: 14, color: '#fff', ...}

// IMAGE
{type: 'image', src: 'url...', width: 100, height: 100, opacity: 0.8, ...}

// PANEL
{type: 'panel', width: 300, height: 200, background: '#222', border: '1px solid #666', children: [...], ...}

// BUTTON
{type: 'button', label: 'Action', action: 'dashboard.setTheme', color: 'blue', icon: 'settings', ...}

// HOTSPOT (invisible clickable area)
{type: 'hotspot', width: 50, height: 50, action: 'ai.suggest', tooltip: 'Click for suggestions', ...}

// SLIDER
{type: 'slider', min: 0, max: 100, value: 50, onChange: (value) => {}, ...}

// DROPDOWN
{type: 'dropdown', options: [...], selected: 0, onChange: ...}
```

---

#### 3. Anchors + Responsive Positions (%, breakpoints)
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Element Types  
**Est. Lines**: 300-400

**Purpose**: Elements scale and reposition based on screen size

**Implementation Plan**:
```javascript
// Positioning modes:

// ABSOLUTE (fixed pixel)
{type: 'button', x: 100, y: 50, positioned: 'absolute', ...}

// RELATIVE (% of viewport)
{type: 'panel', x: '50%', y: '25%', positioned: 'relative', ...}

// ANCHORED (to screen edge/element)
{type: 'button', anchor: 'top-right', offsetX: 10, offsetY: 10, ...}

// RESPONSIVE (different for breakpoints)
{
  type: 'panel',
  responsive: {
    'xs': {x: '10%', y: '20%', width: '80%'}, // Mobile
    'sm': {x: '20%', y: '30%', width: '60%'}, // Tablet
    'md': {x: '30%', y: '40%', width: '50%'}, // Small screen
    'lg': {x: '40%', y: '50%', width: '40%'}, // Desktop
  },
}
```

---

#### 4. Layers Panel (z-index, lock, hide)
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Low  
**Dependencies**: Element Types  
**Est. Lines**: 200-250

**Purpose**: Manage element stacking and visibility

**Implementation Plan**:
```
Layers
─────────────────────
[ ] 🔓 Button #1        ↑
[ ] 🔓 Panel Main       ↑↓
[✓] 🔓 Logo            ↓
    🔓 Image Background (locked)
    ⊗ Hidden Text (hidden)

[↑↓] Move | [Delete] | [Rename]
```

---

#### 5. Snap to Grid + Guides + Align Tools
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Medium  
**Dependencies**: Element Types  
**Est. Lines**: 300-400

**Purpose**: Help align elements perfectly during editing

**Implementation Plan**:
```javascript
// Snap to grid (16px by default)
export function snapToGrid(value, gridSize = 16) {
  return Math.round(value / gridSize) * gridSize;
}

// Guides (visual help lines)
export class GuideSystem {
  getVerticalGuides() → [x positions of potential alignment]
  getHorizontalGuides() → [y positions of potential alignment]
  drawGuidesOnCanvas()
}

// Align tools
export const ALIGN_OPTIONS = {
  'align-left': 'x = min(x)',
  'align-center': 'x = avg(x)',
  'align-right': 'x = max(x) - width',
  'distribute-x': 'Equal spacing horizontally',
  'distribute-y': 'Equal spacing vertically',
};
```

---

#### 6. Editor Mode vs Preview Mode
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: All above  
**Est. Lines**: 250-350

**Purpose**: Toggle between editing and viewing overlay

**Implementation Plan**:
```javascript
export enum UIMode {
  VIEW = 'Viewing overlay normally',
  EDIT = 'Editing overlay (showing handles, grid, etc)',
  TEACH = 'Teaching mode (recording actions)',
}

// Editor mode shows:
// - Selection handles (resize, rotate)
// - Z-order indicators
// - Bounding boxes
// - Grid
// - Guides
// - Ruler units
// - Undo/redo
// - Properties panel

// Preview mode shows:
// - Normal rendering
// - Interactions work
// - No editing UI
```

---

#### 7. Protected Regions (overlay can't hijack nav / critical UI)
**Status**: Not Started  
**Priority**: Critical  
**Complexity**: Medium  
**Dependencies**: Overlay System  
**Est. Lines**: 200-300

**Purpose**: Prevent user from accidentally covering critical UI

**Implementation Plan**:
```javascript
// Register protected zones
export const PROTECTED_ZONES = [
  {id: 'navbar', rect: {x: 0, y: 0, w: '100%', h: 50}},
  {id: 'settings-button', rect: {x: 'right-50', y: 10, w: 40, h: 40}},
  {id: 'console', rect: {x: 0, y: 'bottom-200', w: '100%', h: 200}},
];

export function canPlaceElement(element, position) {
  for (let zone of PROTECTED_ZONES) {
    if (rectsOverlap(position, zone.rect)) {
      return false;
    }
  }
  return true;
}

// On editor: Show protected zones as semi-transparent red overlay
// Prevent dragging elements into protected zones
// Show tooltip: "This area is protected from overlay elements"
```

---

#### 8. Action Inspector ("what does this do?")
**Status**: Not Started  
**Priority**: Medium  
**Complexity**: Low  
**Dependencies**: Action Registry  
**Est. Lines**: 150-200

**Purpose**: Hover button to see what action it triggers

**Implementation Plan**:
```javascript
// On click/hover of overlay button:
// Show tooltip:
// "Action: dashboard.setTheme"
// "Description: Change dashboard theme"
// "Bound to: Click"
// "Will affect: Dashboard appearance"
// "Last triggered: 2 minutes ago"
```

---

#### 9. Teach Mode (click element → tell IRIS what it should do)
**Status**: Not Started  
**Priority**: High  
**Complexity**: High  
**Dependencies**: Action Binding, IRIS integration  
**Est. Lines**: 400-500

**Purpose**: Natural language UI customization training

**Implementation Plan**:
```javascript
// User: Clicks "Teach Mode"
// I.R.I.S: "Click an element on the page to teach me"

// User: Clicks a dashboard setting
// I.R.I.S: "What should this element do?"
// User: Types "Show me my study progress"

// I.R.I.S:
// - Parses request
// - Searches action registry for matching action
// - If not found: "I don't have that action yet, but I can..."
// - Suggests 3 closest actions or "Create new action"

// Then:
// - Generates UI patch (JSON)
// - Shows preview: "I'll add this button here, does that look right?"
// - On confirm: Saves patch to custom UI

export async function teachMode(userNaturalLanguage) {
  const intent = await aiParseIntent(userNaturalLanguage);
  const matchedActions = findActionsMatching(intent);
  
  if (matchedActions.length > 0) {
    return {suggestion: matchedActions[0], alternatives: matchedActions.slice(1)};
  }
  
  return {suggestion: null, message: "I don't have that action, but I can..."};
}
```

---

#### 10. IRIS Generates JSON Patches + Preview Apply
**Status**: Not Started  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: Teach Mode  
**Est. Lines**: 250-300

**Purpose**: I.R.I.S. proposes UI changes in JSON format before applying

**Implementation Plan**:
```javascript
// I.R.I.S generates patch like:
{
  type: 'addElement',
  element: {
    id: 'study-progress-btn',
    type: 'button',
    label: 'Study Progress',
    action: 'dashboard.toggleWidget',
    parameters: {widgetType: 'StudyStats'},
    anchor: 'top-right',
    offsetX: -10,
    offsetY: 10,
    color: 'blue',
    icon: 'bar-chart',
  },
  reasoning: 'Your study sessions are tracked in the Study widget, I added quick access',
  confidence: 0.87,
}

// User sees:
// "I suggest adding a Study button here (87% confident)"
// [Preview] [Apply] [Modify] [Decline]

// On [Preview]: Shows overlay with button in place
// On [Apply]: Adds to custom UI
// On [Modify]: "Edit this button's properties"
// On [Decline]: "OK, store as rejected suggestion"
```

---

---

### Phase 4: 🌐 Web + Correctness Hardening - **LOWER PRIORITY**

*When I.R.I.S. browses the web*

#### 1-5. Web Hardening Features
(Similar detailed plans for each)

- **Injection Firewall**: Prevent webpage JavaScript from controlling I.R.I.S. tools
- **Evidence/Claim Binding**: All facts stored with source links
- **Source Ranking**: Multi-factor assessment of source reliability
- **2-Source Rule**: Hard claims require corroboration
- **Disagreement Handling**: Sources conflict → qualified statements

*Details: 400-500 lines EA, Medium-High complexity, Medium priority*

---

---

### Phase 5: ✨ QoL Polish - **LOW-MEDIUM PRIORITY**

*Premium UX touches*

#### 1. Universal Command Bar (Ctrl/⌘K)
**Status**: Not Started  
**Priority**: Low  
**Complexity**: Medium  
**Dependencies**: Action Registry  
**Est. Lines**: 300-400

**Purpose**: Search and execute any action from keyboard

**Implementation Plan**:
```
Ctrl+K → Command Palette
─────────────────────────────────────
🔍 [Type command...]

Recent:
- Theme: Dark Mode
- Add Widget: Notes
- Export Profile

Actions:
- Dashboard: Set Theme
- Dashboard: Toggle Sidebar
- Settings: Reset All
- AI: Regenerate Response
- Help: Keyboard Shortcuts
```

---

#### 2-5. More QoL Features
(Brief outlines)

- **Inline AI Actions**: Explain/Fix/Summarize on page
- **Smart Defaults**: Auto-set verbosity/personality based on usage
- **"Do this again" Memory**: Repeat action → offer default
- **Change Summary**: "What changed this session"
- **Layout Sharing**: Export "layout only" as shareable codes

---

---

## 📋 Implementation Sequence

### Recommended Order (dependencies-first):

1. **Feature Flags** (Phase 1 #1) - Foundation
2. **Action Registry** (Phase 1 #7) - Central to everything else
3. **Permissions + Confirmations** (Phase 1 #6) - Safety first
4. **Undo Manager** (Phase 1 #2) - User trust
5. **Snapshots** (Phase 1 #4) - Backup before AI changes
6. **Safe Mode Boot** (Phase 1 #5) - Diagnostics
7. **Patch System** (Phase 1 #3) - Tracking
8. **Conflict Handling** (Phase 1 #9) - Edge cases
9. **Action Binding** (Phase 1 #8) - UI integration
10. **Performance Ladder** (Phase 1 #10) - Stability

### Then Phase 2 (Export/Import):
11. Profile Pack Format
12. Selective Export/Import
... etc

---

## 🎯 Success Metrics

When complete, users should be able to:

1. ✅ Undo any action (including AI suggestions)
2. ✅ See before/after of every change
3. ✅ Disable individual AI features
4. ✅ Export settings and share with others
5. ✅ Customize UI without touching code
6. ✅ Teach I.R.I.S. new behaviors via natural language
7. ✅ Trust that critical UI can't be accidentally covered
8. ✅ Know exactly what changed in their session
9. ✅ Have app gracefully degrade if it's struggling
10. ✅ Never be forced to confirm safe actions twice

---

## 📞 Questions & Decisions

**To clarify before implementing:**

1. **Performance Ladder**: Acceptable to disable AI suggestions if app slows?
2. **Safe Mode**: Should it collect diagnostics automatically or passively?
3. **Conflict Resolution**: Default strategy = "Last Write Wins"?
4. **Export Size**: Hard cap at 10MB or user can choose?
5. **Teach Mode**: Only for custom buttons or all overlay elements?
6. **Feature Flags**: User-facing UI or admin-only?

---

**Version**: 1.0  
**Last Updated**: 2026-02-05  
**Co-designed with**: ChatGPT 5.2 & Nexus Team  
**Status**: Ready for Phase 1 Implementation
