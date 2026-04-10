# Nexus Development & Release Workflow

## 📋 Versioning Strategy

### Semantic Versioning with Intent

- **MAJOR (X.0.0)** = Big new feature/system (AI, mobile, cloud sync, etc.)
- **MINOR (1.X.0)** = Small new features, improvements
- **PATCH (1.0.X)** = Bug fixes only

### Release Cycle

```
v1.0.0 (STABLE - Current Release)
  │
  ├─ Development folder for v2.0.0 (PROTECTED)
  │  └─ AAS (Advanced AI System) EXPERIMENTAL/
  │
  ├─ Bug fixes & minor improvements → v1.0.1, 1.0.2, etc.
  │
  └─ When v2.0.0 ready → Release
       │
       ├─ Development folder for v3.0.0 (NEW PROTECTED FOLDER)
       │
       └─ Repeat cycle...
```

---

## 📦 Current Release: v1.0.0

### What's Included

- ✅ Privacy-first student hub
- ✅ Dashboard, browser, games, music, videos
- ✅ Study tools (notes, flashcards, timer, calculator)
- ✅ Settings, widgets, backgrounds
- ✅ Admin dashboard, analytics
- ✅ Local-only data storage
- ✅ Fully documented

### What's NOT Included (reserved for v2.0.0)

- ❌ AI Assistant (in development)
- ❌ Personality controls
- ❌ Multi-model routing
- ❌ Advanced API integrations

---

## 🚀 Development Workflow

### Step 1: Release Current Version

```bash
# Tag release
git tag -a v1.0.0 -m "Nexus 1.0.0: Privacy-first student hub"
git push origin v1.0.0

# Deploy to production/publish
```

### Step 2: Create Protected Development Folder for Next Major

```
Current structure:
├── src/                      ← Active code (v1.0.0)
├── AAS (Advanced AI System)/ ← Protected folder (v2.0.0 in development)
│   ├── AIChat.js
│   ├── AIDropdown.js
│   └── ... (18 files)
└── package.json              ← stays at v1.0.0
```

**Key principle:** Development folder is NEVER imported or used in current code.

### Step 3: Bug Fixes & Minor Improvements (v1.0.x)

```javascript
// Fix in src/Components/Dashboard/DashboardTile.js
// Creates v1.0.1

// Update package.json only when releasing:
"version": "1.0.1"

// Tag and push
git tag -a v1.0.1 -m "Fix: Dashboard tile layout"
git push origin v1.0.1
```

### Step 4: Develop Next Major Feature (v2.0.0)

```
Work ONLY in protected folder:
├── AAS (Advanced AI System)/  ← All v2.0.0 work here
│   ├── AIChat.js
│   ├── AIDropdown.js
│   ├── aiRouter.js
│   └── ...

src/ code remains UNCHANGED
Users on v1.0.0 not affected
```

### Step 5: Release Next Major (v2.0.0)

```javascript
// When ready:

// 1. Integrate AAS into src/
//    - Copy AAS files to src/Components/AAS/
//    - Update imports in Layout.js
//    - Add AIDropdown state management

// 2. Update version
//    "version": "2.0.0"

// 3. Create new protected folder for v3.0.0
//    └── NEXT_FEATURE_FOR_v3.0.0/

// 4. Release
//    git tag -a v2.0.0 -m "Nexus 2.0.0: Advanced AI System"
//    git push origin v2.0.0
```

### Step 6: Repeat

```
v2.0.0 (STABLE - New release)
  │
  ├─ NEXT_FEATURE_FOR_v3.0.0/ (PROTECTED)
  │
  ├─ v2.0.1, 2.0.2 (bug fixes)
  │
  └─ v3.0.0 (release when ready)
```

---

## 📁 Folder Organization

### Active (In src/)

**These folders are actively used by the current release:**

```
src/
├── Components/
│   ├── AI/                    ← Simple AI (v1.0.0)
│   ├── Dashboard/
│   ├── Study/
│   ├── Games/
│   └── ... (all active components)
├── PagesDisplay/
├── Layout.js                  ← Main layout (v1.0.0)
└── App.js
```

### Protected (Development Folders)

**These are for future releases - NEVER imported into active code:**

```
AAS (Advanced AI System)/     ← For v2.0.0 (18 files, ready)
NEXT_FEATURE_FOR_v3.0.0/      ← For v3.0.0 (create when v2.0.0 ready)
FUTURE_FEATURE_FOR_v4.0.0/    ← For v4.0.0 (create when v3.0.0 ready)
```

### Archive

```
archive/                       ← Old code, migrations, backups
```

---

## ✅ Pre-Release Checklist

### Before v1.0.0 Release

- [x] All features working
- [x] No console errors
- [x] .env.local protected in .gitignore
- [x] API keys configured (for future use)
- [x] Documentation complete
- [x] No imports from protected folders
- [ ] Final smoke test
- [ ] Tag release

### Before v2.0.0 Release (Future)

- [ ] Copy AAS files to src/Components/AAS/
- [ ] Update imports in Layout.js
- [ ] Test AI dropdown functionality
- [ ] Run npm build (no errors)
- [ ] Run npm test
- [ ] Update README with AI features
- [ ] Test with real API keys
- [ ] Create new protected folder for v3.0.0
- [ ] Tag release

---

## 📝 Git Workflow

### For Bug Fixes (v1.0.x)

```bash
git checkout -b bugfix/issue-name
# Fix bug
git add .
git commit -m "fix: description"
git push origin bugfix/issue-name
# Create PR, merge to main
git tag -a v1.0.1 -m "Fix: description"
git push origin v1.0.1
```

### For Next Major (v2.0.0)

```bash
# Work ONLY in AAS folder
git add AAS/
git commit -m "feat(AAS): add new AI feature"
git push origin Nexus-Main

# Don't tag until ready to release v2.0.0
```

### Release Tags

```bash
# Check existing tags
git tag

# Create new release tag
git tag -a v1.0.0 -m "Nexus 1.0.0 release notes"
git push origin v1.0.0

# See tag details
git show v1.0.0
```

---

## 📋 Version Roadmap

### ✅ v1.0.0 (Current - Jan 27, 2026)

- Privacy-first student hub
- Core features complete
- Status: **READY TO RELEASE**

### 🔄 v2.0.0 (In Development)

- Advanced AI System (AAS)
- ChatGPT-style UI
- Multi-model routing
- Personality controls
- Status: **90% ready, in protected folder**
- Location: `AAS (Advanced AI System) EXPERIMENTAL/`

### 📋 v3.0.0 (Planned)

- Feature TBD
- Status: Not started
- Location: Will be `NEXT_FEATURE_FOR_v3.0.0/`

### 📋 v4.0.0 (Planned)

- Feature TBD
- Status: Not started

---

## 💡 Key Principles

1. **Separation of Concerns**
   - Active code in src/ (tested, stable)
   - Development in protected folders (untested, changing)

2. **No Interference**
   - Future features never imported into current code
   - Users only get what's released
   - Development won't crash production

3. **Clear Versions**
   - Every release is a discrete milestone
   - Easy to refer to: "Add that feature from v2"
   - Easy to revert: "Ship v1.0.0 while fixing v2"

4. **Parallel Development**
   - Work on v2.0.0 while users use v1.0.0
   - Fix v1.0 bugs while developing v2.0
   - No blocking

5. **Easy Rollback**
   - Old code stays available in git
   - Each version tagged and documented
   - Can deploy any version anytime

---

## 🎯 Immediate Next Steps

### Now (v1.0.0 Release)

1. Final smoke test
2. Tag release: `git tag -a v1.0.0`
3. Deploy/publish

### After v1.0.0

1. Start collecting feature requests for v2.0.0+
2. Plan bug fix schedule for v1.0.x
3. Continue AAS development in protected folder
4. Document v2.0.0 timeline

---

## 📞 Questions?

This workflow ensures:

- ✅ Stable releases never affected by development
- ✅ Clear versioning and roadmap
- ✅ Easy to manage multiple versions
- ✅ Professional release process
- ✅ Room to grow (v3, v4, v5...)
