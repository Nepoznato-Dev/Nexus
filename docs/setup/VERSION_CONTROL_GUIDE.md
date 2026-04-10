# Version Control System - Implementation Guide

## 🎯 Overview

The version control system allows users to select which version of Nexus they want to use, and the app dynamically enables/disables features based on that selection.

**Key principle:** Single codebase, conditional feature loading

---

## 🔧 How It Works

### 1. User sets version in Settings

```
Settings → Nexus Version → Select v2.0.0 → Switch Version
```

### 2. Version saved to localStorage

```javascript
// Stored via clientStorage.saveSettings()
{
  nexusVersion: "2.0.0"
}
```

### 3. App checks version on load

```javascript
// VersionContext reads from localStorage
const { currentVersion, isFeatureEnabled } = useVersion();
// currentVersion = "2.0.0"
```

### 4. Features enable/disable based on version

```javascript
{isFeatureEnabled('advancedAI') && <AIDropdown ... />}
// With v2.0.0: true → renders
// With v1.0.0: false → doesn't render
```

---

## 📋 Configuration

### versionConfig.json

Defines all versions and their features:

```json
{
  "versions": [
    {
      "version": "1.0.0",
      "name": "Nexus Classic",
      "features": {
        "simpleAI": true,
        "advancedAI": false,
        "aiDropdown": false
      }
    },
    {
      "version": "2.0.0",
      "name": "Nexus AI",
      "features": {
        "simpleAI": false,
        "advancedAI": true,
        "aiDropdown": true
      }
    }
  ]
}
```

### Add New Feature

1. Add to ALL versions in versionConfig.json:

```json
{
  "newFeature": true  // v1.0.0
}
```

1. In new versions set to:

```json
{
  "newFeature": true   // v2.0.0 (or false to disable)
}
```

---

## 💻 Using in Components

### Option 1: useVersion Hook

```javascript
import { useVersion } from '../contexts/VersionContext.js';

export default function Layout() {
  const { isFeatureEnabled, currentVersion } = useVersion();

  return (
    <div>
      <h2>Running v{currentVersion}</h2>

      {/* Feature only in v2.0.0+ */}
      {isFeatureEnabled('advancedAI') && (
        <AIDropdown ... />
      )}

      {/* Feature only in v1.0.0 */}
      {isFeatureEnabled('simpleAI') && (
        <SimpleAI ... />
      )}
    </div>
  );
}
```

### Option 2: FeatureGate Component

```javascript
import { FeatureGate } from '../contexts/VersionContext.js';

export default function Dashboard() {
  return (
    <div>
      <FeatureGate feature="advancedAI">
        <AIDropdown ... />
      </FeatureGate>

      <FeatureGate 
        feature="newFeature"
        fallback={<OldComponent ... />}
      >
        <NewComponent ... />
      </FeatureGate>
    </div>
  );
}
```

### Option 3: Conditional Logic

```javascript
import { useVersion } from '../contexts/VersionContext.js';

export default function AIChat() {
  const { isFeatureEnabled, currentVersion } = useVersion();

  if (currentVersion === '1.0.0') {
    // Simple AI only
    return <SimpleAI />;
  } else if (currentVersion >= '2.0.0') {
    // Advanced AI with all features
    return <AdvancedAI />;
  }
}
```

---

## 🚀 Setup Instructions

### 1. Wrap App with VersionProvider

In `src/App.js`:

```javascript
import { VersionProvider } from './contexts/VersionContext.js';

function App() {
  return (
    <VersionProvider>
      {/* Your existing app */}
    </VersionProvider>
  );
}
```

### 2. Add Version Selector to Settings

In your Settings page component:

```javascript
import VersionSelector from '../Settings/VersionSelector.js';

export default function Settings() {
  return (
    <div className="settings-page">
      <VersionSelector />
      {/* Other settings... */}
    </div>
  );
}
```

### 3. Update Components with Feature Gates

Find components that should differ by version and add gates:

**For Simple AI vs Advanced AI:**

```javascript
// src/Layout.js

{isFeatureEnabled('simpleAI') && (
  <button onClick={() => navigate('/study-tools')}>
    Simple AI
  </button>
)}

{isFeatureEnabled('advancedAI') && (
  <AIDropdown isOpen={aiDropdownOpen} onClose={() => setAiDropdownOpen(false)} />
)}
```

---

## 📝 Adding a New Version

### Step 1: Update versionConfig.json

```json
{
  "version": "1.1.0",
  "name": "Classic Plus",
  "releaseDate": "2026-03-15",
  "status": "stable",
  "features": {
    "dashboard": true,
    "newDashboard": true,  // NEW in v1.1.0
    "simpleAI": true,
    "advancedAI": false
  }
}
```

### Step 2: Implement Feature

```javascript
// Create new component or feature
// Create conditional gates in existing components

{isFeatureEnabled('newDashboard') && (
  <NewDashboardLayout />
)}
{!isFeatureEnabled('newDashboard') && (
  <OldDashboardLayout />
)}
```

### Step 3: Test

```
1. Set version to "1.1.0" in Settings
2. Verify new features appear
3. Set version to "1.0.0"
4. Verify new features disappear
```

---

## 🎯 Feature Matrix Example

Current feature breakdown:

| Feature | v1.0.0 | v1.0.1 | v1.1.0 | v2.0.0 |
|---------|--------|--------|--------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Simple AI | ✓ | ✓ | ✓ | ✗ |
| Advanced AI | ✗ | ✗ | ✗ | ✓ |
| AI Dropdown | ✗ | ✗ | ✗ | ✓ |
| New Dashboard | ✗ | ✗ | ✓ | ✓ |
| Response Caching | ✗ | ✗ | ✗ | ✓ |
| Quality Warnings | ✗ | ✗ | ✗ | ✓ |

---

## 🔍 Debugging

### Check Current Version

```javascript
const { currentVersion, currentFeatures } = useVersion();
console.log('Current version:', currentVersion);
console.log('Features:', currentFeatures);
```

### Verify Feature Gate

```javascript
const { isFeatureEnabled } = useVersion();
console.log('AI Dropdown enabled?', isFeatureEnabled('aiDropdown'));
```

### Check localStorage

```javascript
// In browser console
localStorage.getItem('nexus_settings')
// Should contain: "nexusVersion": "2.0.0"
```

---

## ⚡ Performance Notes

- Version check happens once on app load
- Feature gates are instant (boolean checks)
- No performance impact from version system
- Only loaded code is executed (other features ignored)

---

## 🔐 Security

- Version stored in localStorage (user-side only)
- No server-side version management needed
- Users can only select from available versions
- API keys/sensitive data unaffected by version

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `src/versionConfig.json` | Version & feature definitions |
| `src/contexts/VersionContext.js` | Version logic & hooks |
| `src/Components/Settings/VersionSelector.js` | Settings UI |
| `src/Components/Settings/VersionSelector.css` | Styling |

---

## 🎓 Complete Example

### Before (All features always active)

```javascript
// AIDropdown always imported and shown
import AIDropdown from './AAS/AIDropdown.js';

export default function Layout() {
  return (
    <div>
      <AIDropdown isOpen={aiDropdownOpen} />
    </div>
  );
}
```

### After (Features gated by version)

```javascript
import { useVersion } from './contexts/VersionContext.js';
import AIDropdown from './AAS/AIDropdown.js';
import SimpleAIButton from './Components/AI/SimpleAIButton.js';

export default function Layout() {
  const { isFeatureEnabled } = useVersion();

  return (
    <div>
      {isFeatureEnabled('simpleAI') && (
        <SimpleAIButton />
      )}

      {isFeatureEnabled('advancedAI') && (
        <AIDropdown isOpen={aiDropdownOpen} />
      )}
    </div>
  );
}
```

---

## ✅ Rollout Checklist

- [ ] Add VersionProvider to App.js
- [ ] Add VersionSelector to Settings page
- [ ] Wrap AI-related components with feature gates
- [ ] Test switching versions in Settings
- [ ] Verify old features disappear in v1.0.0
- [ ] Verify new features appear in v2.0.0
- [ ] Test each version in browser
- [ ] Check localStorage persistence
- [ ] Document any custom feature gates

---

**Created:** January 27, 2026  
**Status:** Ready for implementation
