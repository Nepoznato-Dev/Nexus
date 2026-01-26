# Nexus Archive - v1.1+ Features & Legacy Code

This folder stores components, features, and code that will be implemented in future versions (1.1+) or have been replaced in 1.0.0.

## Archive Contents

### AI System (v1.1+)
**Status:** Archived for future implementation
**Reason:** Keeping 1.0.0 lean; full AI rolls out in v1.1

- **AIChat.v1.js** - Original simple AI chat with personality sliders
  - Features: Auto-adapting personality, professionalism/mentorship scales, basic responses
  - Dependencies: PersonalityControl.js, aiKnowledgeBase.js, AIChat.css
  - To restore: Copy to `src/Components/AI/AIChat.js` when ready

- **AI Knowledge Base Files** (to be created)
  - aiKnowledgeBase.js - Response generation logic
  - PersonalityControl.js - UI for personality adjustment
  - aiRouter.js - Question routing and categorization

### Future Implementations

Files/features scheduled for upcoming releases:

#### v1.1 Features
- [ ] Advanced AI system with caching
- [ ] Multi-language support
- [ ] Image recognition prep
- [ ] Better chat UI with emoji/image support

#### v1.2 Features
- [ ] Per-page browser mode
- [ ] Advanced widget system enhancements
- [ ] Movie site integration prep

#### v2.0+ Features
- [ ] Phone/tablet optimization
- [ ] System-level integration
- [ ] Deep performance monitoring

---

## How to Use This Archive

### Restore a Feature
```bash
# Example: Restore AI Chat for v1.1
cp archive/AIChat.v1.js src/Components/AI/AIChat.js
```

### Add New Archived Code
1. Move file/folder to `archive/`
2. Add entry to this README with:
   - **Filename/Folder**
   - **Status** (archived, deferred, etc.)
   - **Reason** (why it's not in 1.0.0)
   - **Target version** (when to restore)
   - **Dependencies** (what else it needs)

### Archive Naming Convention
- `<ComponentName>.v<VERSION>.js` for versioned components
- `<FeatureName>-DEFERRED.md` for deferred features with documentation
- Keep full path structure if complex (e.g., `AI/AIChat.v1.js`)

---

## 1.0.0 Decisions (Why things were archived)

### Why AI was archived
- Keeps 1.0.0 focused on core UX (loading, auth, roles)
- AI system complex enough to warrant full testing cycle
- v1.1 planned as "AI & Chat enhancement" release
- Existing simple AI can be toggled off in settings

### What made it into 1.0.0
- ✅ Settings consolidation
- ✅ Simplified login (access code only)
- ✅ Enhanced role system
- ✅ Persistent widgets
- ✅ Basic loading screens
- ✅ Seasonal backgrounds

### What's next (1.0.1 patches)
- Bug fixes from user testing
- Performance tuning
- Settings UI refinement

---

## Contact/Notes
Last updated: January 26, 2026
Maintained by: Development team
Version: 1.0.0 planning phase
