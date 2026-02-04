# Version Management Quick Reference

## 📋 Workflow at a Glance

### Current Setup (v1.0.0)
```
PRODUCTION: src/           ← Users run this
STAGING:    AAS/           ← Develop v2.0.0 here
```

### Release a Bug Fix (v1.0.1)
```bash
# In src/ (production code):
1. Fix bug
2. Test: npm start
3. Update package.json: "version": "1.0.1"
4. Commit: git commit -m "fix: bug description"
5. Tag: git tag -a v1.0.1 -m "Bug fix"
6. Push: git push origin v1.0.1
7. Deploy: npm run build + deploy build/
```

### Develop Next Major (v2.0.0)
```bash
# In AAS folder (protected):
1. Add features
2. Don't change src/
3. Don't import in Layout.js
4. Commit to AAS only
5. Wait for v1.0.0 users stable
```

### Release Major Feature (v2.0.0)
```bash
# When AAS ready:
1. Copy: AAS/* → src/Components/AAS/
2. Update src/Layout.js (add AIDropdown import)
3. Test: npm start
4. Update package.json: "version": "2.0.0"
5. Create new folder: NEXT_FEATURE_FOR_v3.0.0/
6. Commit everything
7. Tag: git tag -a v2.0.0
8. Push: git push origin v2.0.0
9. Deploy: npm run build + deploy
```

---

## 🗂️ Protected Folder Naming Convention

Use this pattern for future major versions:

```
├── src/                          ← Always active production
├── AAS (Advanced AI...)          ← v2.0.0 (in progress)
├── NEXT_FEATURE_FOR_v3.0.0/      ← v3.0.0 (when v2.0.0 ready)
├── FUTURE_FEATURE_FOR_v4.0.0/    ← v4.0.0 (when v3.0.0 ready)
└── ...
```

### Naming Pattern
- **Active:** Always `src/`
- **Protected:** `[FEATURE_NAME]_FOR_v[MAJOR].0.0/`

Examples:
- `AAS (Advanced AI System) EXPERIMENTAL/` ← v2.0.0
- `MOBILE_CLIENT_FOR_v3.0.0/` ← v3.0.0
- `CLOUD_SYNC_FOR_v4.0.0/` ← v4.0.0

---

## 🎯 Version Bump Checklist

### Before Any Release (vX.Y.Z)

```bash
# 1. Update version in package.json
nano package.json
# Change: "version": "X.Y.Z"

# 2. Test build
npm run build
# Should succeed without errors

# 3. Test dev
npm start
# Should run without errors

# 4. Commit version change
git add package.json
git commit -m "chore: bump version to X.Y.Z"

# 5. Create release tag
git tag -a vX.Y.Z -m "Release notes here"

# 6. Push tag (this triggers release)
git push origin vX.Y.Z

# 7. Deploy build
npm run build
# Deploy build/ folder to hosting
```

---

## 📊 Version Examples

### Bug Fixes (Patch)
```
v1.0.0 → v1.0.1: Fixed dashboard layout
v1.0.1 → v1.0.2: Fixed music player pause
v1.0.2 → v1.0.3: Fixed settings save bug
```

### New Features (Minor)
```
v1.0.3 → v1.1.0: Added notification system
v1.1.0 → v1.2.0: Added keyboard shortcuts
```

### Major Features (Major)
```
v1.2.5 → v2.0.0: Added AI system (AAS)
v2.1.3 → v3.0.0: Added mobile client
```

---

## 🚨 Important Rules

### ✅ DO
- ✅ Use protected folders for future versions
- ✅ Test before tagging release
- ✅ Update package.json version before release
- ✅ Tag releases with semantic versions
- ✅ Push tags to trigger release

### ❌ DON'T
- ❌ Import protected folders into src/
- ❌ Modify protected folders without intending that version
- ❌ Tag release without testing
- ❌ Skip version update in package.json
- ❌ Merge protected folder to main until release time

---

## 🔗 Key Files

| File | Purpose | Updated When |
|------|---------|--------------|
| `package.json` | Version source of truth | Every major release |
| `DEVELOPMENT_WORKFLOW.md` | Process guide | Rarely changes |
| `v1.0.0_RELEASE_CHECKLIST.md` | Release template | Every release |
| `Protected folders` | Future features | Active development |

---

## 💭 Decision Tree

```
Bug found in production (v1.0.0)?
├─ YES → Fix in src/, bump to v1.0.1, release
└─ NO → Continue

Want to add small feature?
├─ YES → Add in src/, bump to v1.1.0, release
└─ NO → Continue

Want to add major feature?
├─ YES → Use protected folder (v2.0.0), don't touch src/
└─ NO → Continue

Protected folder ready to release?
├─ YES → Copy to src/, bump to v2.0.0, create new protected folder
└─ NO → Continue developing
```

---

## 🎓 Examples in Practice

### Scenario 1: Bug Fix
```
Current: v1.0.0 in production
Issue: Dashboard crashes when adding card

Action:
$ git checkout -b fix/dashboard-crash
$ nano src/Components/Dashboard/DashboardTile.js  # Fix bug
$ npm start  # Test fix
$ git commit -m "fix: prevent crash when adding card"
$ git checkout main
$ git merge fix/dashboard-crash
$ nano package.json  # Change to 1.0.1
$ git commit -m "chore: bump to v1.0.1"
$ git tag -a v1.0.1 -m "Fix dashboard crash"
$ git push origin v1.0.1
$ npm run build && deploy
```

### Scenario 2: Major Feature Ready
```
Current: v1.0.5 in production, v2.0.0 ready in AAS/

Action:
$ cp -r "AAS (Advanced AI...)"/* src/Components/AAS/
$ nano src/Layout.js  # Add AIDropdown import
$ npm run build  # Test integration
$ npm start  # Smoke test
$ nano package.json  # Change to 2.0.0
$ mkdir NEXT_FEATURE_FOR_v3.0.0  # New protected folder
$ git add -A
$ git commit -m "feat: add advanced AI system (v2.0.0)"
$ git tag -a v2.0.0 -m "Major: Advanced AI System

Features:
- ChatGPT-style UI
- Multi-model support
- Personality controls"
$ git push origin v2.0.0
$ npm run build && deploy
```

### Scenario 3: Parallel Development
```
Current: v1.0.0 released, users on it
Development: AAS (v2.0.0) and bug fixes (v1.0.1)

Timeline:
Day 1: Release v1.0.0
Day 2: Bug report → Fix in src/ → Release v1.0.1
Day 3-7: Develop v2.0.0 in AAS/ folder (doesn't affect v1.0.1 users)
Day 8: Bug report → Fix in src/ → Release v1.0.2
Day 9-15: Continue v2.0.0 development
Day 16: v2.0.0 ready → Copy to src/ → Release v2.0.0
       Create v3.0.0 protected folder
Day 17+: Bug fixes for v2.0.0 (v2.0.1, etc.)
         Development of v3.0.0 in protected folder
```

---

## 🎯 Summary

**Your Release Workflow:**
1. Code in protected folders for future versions
2. Fix bugs in src/ for current version
3. Always update package.json before releasing
4. Always tag releases with semantic versioning
5. Always test before pushing tags
6. Repeat forever

**Everyone wins:**
- ✅ Users get stable releases
- ✅ You develop features without breaking production
- ✅ Clear versioning for feature tracking
- ✅ Easy rollback if needed

---

**Last Updated:** January 27, 2026  
**Status:** Ready to use
