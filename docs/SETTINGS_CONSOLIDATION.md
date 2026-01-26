# Settings Consolidation Plan for 1.0.0

## Current Redundancies Identified

### 1. Motion/Animation Controls (MERGE)
**Current state:**
- `theme.blur` - Blur effect
- `background.blur` - Background blur
- `motion.animations` - Animation level
- `accessibility.photosensitiveMode` - Related to motion

**Consolidated to:**
```javascript
motion: {
  animationLevel: 'full',  // 'full' | 'reduced' | 'none'
  enableBlur: true,        // Single blur control (affects theme + background)
  enableParticles: true,   // Enable/disable background particles
  photosensitive: false    // Disable rapid flashing for sensitive users
}
```

### 2. Transparency & Contrast (MERGE)
**Current state:**
- `theme.transparency` - Global transparency
- `theme.contrast` - Contrast level
- `accessibility.reducedTransparency` - Related transparency
- `background.opacity` - Background opacity

**Consolidated to:**
```javascript
visual: {
  transparency: 'normal',     // 'normal' | 'reduced' | 'high'
  contrast: 'normal',         // 'normal' | 'high' | 'maximum'
  brightness: 1,              // 0.7 - 1.3 scale
  colorblindMode: 'none'      // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
}
```

### 3. Focus & Navigation (MERGE)
**Current state:**
- `accessibility.focusMode` - Focus on one task
- `accessibility.focusIndicators` - Show focus highlights
- `input.contextMenus` - Enable context menus
- `layout.density` - Layout spacing

**Consolidated to:**
```javascript
focus: {
  focusMode: false,           // Lock to single page
  highlightFocus: true,       // Show focus indicators
  simplifyUI: false,          // Hide non-essential elements
  reduceMotion: false,        // Prefers-reduced-motion
  expandTouchTargets: false   // Larger buttons for accessibility
}
```

### 4. Audio/Notifications (MERGE)
**Current state:**
- `accessibility.soundEffects` - Sound on/off
- `accessibility.alertTones` - Alert sounds
- `accessibility.reducedSound` - Lower sound
- `accessibility.screenReaderAnnouncements` - Screen reader text

**Consolidated to:**
```javascript
audio: {
  soundEffects: false,        // UI sound effects
  alertTones: true,           // Alert/notification sounds
  deviceVolumeAware: true,    // Auto-adjust volume based on device
  screenReaderMode: false     // Optimize for screen readers
}
```

### 5. Text & Reading (MERGE)
**Current state:**
- `accessibility.dyslexiaFont` - Special font
- `accessibility.readingRuler` - Reading guide
- `accessibility.lineHeight` - Line spacing
- `accessibility.largeText` - Font size
- `accessibility.bionicReading` - Bionic reading mode
- `accessibility.plainLanguage` - Simple language

**Consolidated to:**
```javascript
text: {
  fontSize: 'normal',         // 'small' | 'normal' | 'large' | 'xlarge'
  lineHeight: 'normal',       // 1 - 2.0 scale
  dyslexiaFont: false,        // Use dyslexia-friendly font
  bionicReading: false,       // Bold word starts
  plainLanguage: false,       // Simplify language
  readingGuide: false         // Show reading ruler
}
```

### 6. Input & Interaction (KEEP BUT SIMPLIFY)
**Current state:**
- `input.holdToConfirm` - Confirm by holding
- `input.contextMenus` - Context menus
- `input.scrollSpeed` - Scroll sensitivity
- `accessibility.clickAssist` - Click assist
- `accessibility.stickyKeys` - Sticky keys
- `accessibility.oneHandedMode` - One-handed UI

**Consolidated to:**
```javascript
input: {
  holdToConfirm: false,       // Hold for destructive actions
  contextMenus: true,         // Right-click menus
  scrollSensitivity: 1,       // 0.5 - 2.0
  stickyKeys: false,          // Modifier key stickiness
  oneHandedMode: false,       // Optimize for left/right hand
  extraConfirmations: true    // Confirmation dialogs
}
```

### 7. Performance (KEEP)
**No changes needed - already consolidated:**
```javascript
performance: {
  targetFPS: 60,
  ramLimit: 1024,
  animationScale: 1,
  widgetLimit: 3,
  adaptivePerf: true,
  showFPS: false
}
```

### 8. Break Reminders (KEEP - Too Specific)
**Current state:**
- `accessibility.breakReminders` - Enable reminders
- `accessibility.breakInterval` - Minutes between reminders

**Keep as-is** (not redundant with other settings)

### 9. Panic Mode (KEEP - Too Specific)
**Current state:**
- `accessibility.panicButton` - Enable panic key
- `accessibility.panicSite` - Decoy site URL
- `accessibility.panicReturnTimeout` - Return timer

**Keep as-is** (separate concern)

### 10. Other Specific Settings (KEEP)
- `theme.mode` - Dark/light/auto
- `theme.background` - Background color
- `theme.accent` - Accent color
- `theme.text` - Text color
- `background.type` - Background style
- `background.particleCount` - Particle density
- `background.speed` - Animation speed
- `games.*` - Game-specific settings
- `widgets.*` - Widget configuration
- `browser.*` - Browser defaults
- `aiTools.*` - AI configuration

---

## New Consolidated Settings Schema

```javascript
const CONSOLIDATED_SETTINGS = {
  // Identity & Display
  theme: {
    mode: 'dark',                   // 'dark' | 'light' | 'auto'
    primaryColor: '#00f0ff',        // Accent color
    primaryBackground: '#0a0a0f'    // Background color
  },
  
  // Background & Animation
  motion: {
    animationLevel: 'full',         // 'full' | 'reduced' | 'none'
    enableBlur: true,               // Blur effects
    enableParticles: true,          // Background particles
    particleCount: 50,              // 20-100
    particleSpeed: 0.5,             // 0.1-2.0
    photosensitive: false           // Disable rapid flashing
  },
  
  // Visual Adjustments
  visual: {
    transparency: 'normal',         // 'normal' | 'reduced' | 'high'
    contrast: 'normal',             // 'normal' | 'high' | 'maximum'
    brightness: 1,                  // 0.7-1.3
    colorblindMode: 'none'          // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  },
  
  // Text & Reading
  text: {
    fontSize: 'normal',             // 'small' | 'normal' | 'large' | 'xlarge'
    lineHeight: 1,                  // 1-2.0
    dyslexiaFont: false,            // Dyslexia-friendly font
    bionicReading: false,           // Bold word starts
    plainLanguage: false,           // Simplify language
    readingGuide: false             // Show reading ruler
  },
  
  // Focus & Navigation
  focus: {
    focusMode: false,               // Single-task mode
    highlightFocus: true,           // Show focus indicators
    simplifyUI: false,              // Hide non-essentials
    expandTouchTargets: false       // Larger clickable areas
  },
  
  // Audio & Sound
  audio: {
    soundEffects: false,            // UI sounds
    alertTones: true,               // Notification sounds
    deviceVolumeAware: true,        // Auto-adjust to device volume
    screenReaderMode: false         // Optimize for screen readers
  },
  
  // Input & Interaction
  input: {
    holdToConfirm: false,           // Hold to confirm destructive actions
    contextMenus: true,             // Right-click menus
    scrollSensitivity: 1,           // 0.5-2.0
    stickyKeys: false,              // Sticky modifier keys
    oneHandedMode: false,           // One-handed UI layout
    extraConfirmations: true        // Extra confirmation dialogs
  },
  
  // Performance
  performance: {
    targetFPS: 60,
    ramLimit: 1024,
    animationScale: 1,
    widgetLimit: 3,
    adaptivePerf: true,
    showFPS: false
  },
  
  // Breaks & Wellness
  wellness: {
    breakReminders: false,
    breakInterval: 25              // Minutes
  },
  
  // Safety & Stealth
  safety: {
    panicButton: true,
    panicSite: 'classroom',
    panicReturnTimeout: 60          // Seconds
  },
  
  // Games
  games: {
    fullscreenOnLaunch: true,
    escToClose: true,
    lazyLoadStrength: 'medium'
  },
  
  // Widgets
  widgets: {
    enabled: true,
    spotify: true,
    youtube: true,
    tiktok: false,
    autoDisable: true,
    dockInSidebar: true
  },
  
  // Browser
  browser: {
    openLinksIn: 'nexus',
    searchEngine: 'startpage'
  },
  
  // AI Tools (deprecated for 1.0, archived)
  aiTools: {
    enabled: false,
    autoSuggest: true,
    personality: 'adaptive',
    apiProvider: 'none'
  }
};
```

---

## Migration Path

1. **Keep old settings structure** during transition for backward compatibility
2. **Add migration function** to map old → new schema
3. **Update Settings.js** to use new categories
4. **Test all existing settings** still work
5. **Deprecate** old settings structure in v1.0.1

---

## Implementation Checklist

- [ ] Update `useSettings.js` with new schema
- [ ] Create migration function for old → new settings
- [ ] Refactor `Settings.js` page to use new categories
- [ ] Update `clientStorage.js` to handle new format
- [ ] Test import/export with old + new formats
- [ ] Update documentation
- [ ] Test on low-end device (performance impact)

---

**Status:** Planning phase
**Target:** Complete before Settings page redesign
**Priority:** HIGH - Foundation for other UX improvements
