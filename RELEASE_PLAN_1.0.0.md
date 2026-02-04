# Nexus 1.0.0 Release Plan

## Phase 1: About:blank Deployment Testing ✅ CURRENT
**Goal:** Verify the app runs properly inside about:blank sandboxed environment

### Testing Checklist
- [ ] **Launcher Test**
  - [ ] Open `about-blank-launcher.html` in browser
  - [ ] Click "Launch in about:blank" button
  - [ ] Verify new about:blank window opens
  - [ ] Verify app loads inside iframe

- [ ] **Core Functionality**
  - [ ] Dashboard loads without errors
  - [ ] Navigation works (sidebar, routing)
  - [ ] Settings persist
  - [ ] Storage (session/local) works
  - [ ] Keyboard shortcuts function

- [ ] **About:blank Specific**
  - [ ] No "about:blank enforcement" errors
  - [ ] Iframe sandbox restrictions don't break features
  - [ ] Cross-origin requests work (APIs, external content)
  - [ ] Popup blocking doesn't interfere

- [ ] **Media Features**
  - [ ] AI Chat works (S.P.A.R.K)
  - [ ] Music player functional
  - [ ] Video embeds work
  - [ ] Games load properly

- [ ] **Performance**
  - [ ] No console errors
  - [ ] FPS monitor shows stable performance
  - [ ] No memory leaks detected

### Entry Point
**File:** `/about-blank-launcher.html`
**Usage:** Users bookmark this file, click button to launch app in about:blank

---

## Phase 2: Polish & Release (After about:blank confirmed working)
**Goal:** Polish 1.0.0 for public release

### Polish Tasks
- [ ] Fill in placeholder mod IDs (modProfiles.js)
- [ ] Verify all API endpoints
- [ ] Update version in package.json to 1.0.0
- [ ] Review and finalize documentation
- [ ] Performance optimization pass
- [ ] Accessibility audit
- [ ] Security review

### Release Process
1. Update version to 1.0.0
2. Generate production build: `npm run build`
3. Tag release in git
4. Deploy to hosting
5. Update README with about:blank launch instructions

---

## Phase 3: Archive Cleanup (Post 1.0.0 Release)
**Goal:** Remove archive file content while preserving folder structure

### Archive Contents to Remove
```
/archive/
  ├── AIChat.v1.js              → DELETE
  ├── AI-advanced/              → DELETE (contents)
  ├── old-docs/                 → DELETE (contents)
  ├── old-ideas/                → DELETE (contents)
  ├── game-data/                → DELETE (contents)
  ├── manifests/                → DELETE (contents)
  ├── scripts/                  → DELETE (contents)
  ├── html-demos/               → DELETE (contents)
  ├── v2.0.0-development/       → KEEP (future branch reference)
  └── README.md                 → UPDATE (cleanup notes)
```

**Folder Structure Preserved:** `/archive/` remains as archive directory for future use

---

## Current Status

| Phase | Status | Priority |
|-------|--------|----------|
| Phase 1: About:blank Testing | 🔄 IN PROGRESS | 🔴 HIGH |
| Phase 2: Polish & Release | ⏳ PENDING | 🟡 MEDIUM |
| Phase 3: Archive Cleanup | ⏳ PENDING | 🟢 LOW |

---

## Key Files for Testing

| File | Purpose | Location |
|------|---------|----------|
| Launcher | Main entry point | `/about-blank-launcher.html` |
| App | React app | `/src/App.js` |
| Layout | Main layout (cleaned) | `/src/Layout.js` |
| Utilities | openInAboutBlank function | `/src/utils.js` |
| Build | Compiled app to iframe | `/build/index.html` |

---

## Placeholder Items (Keep for now)
- Mod IDs in `modProfiles.js` (12 entries with `'XXXX'`)
- Archive folder contents (delete files in Phase 3)
- Development comments in code

---

## Next Action
**Start Phase 1:** Test about:blank deployment
1. Deploy `/about-blank-launcher.html` somewhere accessible
2. Click button and verify app launches in about:blank
3. Test core features to ensure sandbox doesn't break functionality
4. Report any issues found

Once Phase 1 is confirmed working → Move to Phase 2 (polish) → Then Phase 3 (cleanup)
