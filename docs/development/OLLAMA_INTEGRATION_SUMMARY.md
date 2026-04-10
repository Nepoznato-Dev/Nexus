# 🦙 Ollama Integration + First Time Setup Updates

## Summary

You now have a complete Ollama integration in Nexus with three quality tiers that users can choose from:

- ⚡ **Fast** - Ultra-quick responses (50-80 tokens/sec), 4GB models
- ⚙️ **Balanced** - Best for most use (RECOMMENDED) - 20-40 tokens/sec, 3.8GB
- ✨ **Quality** - Highest quality responses - 5-15 tokens/sec, 26GB

## What's New

### 1. **First Time Setup Wizard (Step 6 - NEW)**

When users launch Nexus for the first time, they now see:

- Step 1: Performance Monitoring (FPS counter)
- Step 2: Account Setup (Username/Password)
- Step 3: Dashboard Colors (Theme selection)
- Step 4: AI Features (Download llama2 locally?)
- Step 5: AI Personality (Adaptive/Kind/Moody/etc)
- **Step 6: Ollama Models (NEW!)** ← Choose Fast/Balanced/Quality

### 2. **Files Created/Updated**

#### Core Ollama Integration

- `src/Components/AI/ollamaModels.js` - Model profiles (Fast/Balanced/Quality)
- `src/Components/AI/ollamaAPI.js` - API wrapper & connection handling
- `src/Components/AI/OllamaSettings.jsx` - UI component for Settings page

#### Documentation

- `docs/OLLAMA_SETUP_GUIDE.md` - Complete setup guide with troubleshooting
- `scripts/setup/ollama-quick-setup.sh` - Bash script for quick installation

#### Updated

- `src/Components/UI/FirstTimeSetup.js` - Added Step 6 for Ollama selection

## Installation Instructions for Users

### Quick Setup (Copy & Paste)

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Pull models
ollama pull neural-chat  # Fast (⚡)
ollama pull llama2       # Balanced (⚙️) - RECOMMENDED
# ollama pull dolphin-mixtral  # Quality (✨) - 26GB warning
```

### Or run the script

```bash
bash scripts/setup/ollama-quick-setup.sh
```

## How It Works

### 1. **First Time Setup**

- User sees Step 6 asking to choose: Fast/Balanced/Quality
- Selection is saved to: `settings.aiTools.ollamaQualityTier`
- App shows tips on which model to pull

### 2. **User Can Change Later**

- Settings → AI Tools → Ollama Models
- Uses `OllamaSettings.jsx` component
- Shows connection status and installed models

### 3. **AI Responses Use Selected Model**

- When generating responses, app:
  1. Checks if Ollama is available (on localhost:11434)
  2. Gets selected quality tier from settings
  3. Uses recommended model: neural-chat / llama2 / dolphin-mixtral
  4. Falls back to template responses if Ollama is down

## Available Models

| Tier | Model | Size | Speed | Quality | Best For |
|------|-------|------|-------|---------|----------|
| ⚡ Fast | neural-chat | 4.1GB | 50-80 tok/s | 3/10 | Quick answers |
| ⚙️ Balanced | llama2 | 3.8GB | 20-40 tok/s | 6/10 | Most tasks ⭐ |
| ✨ Quality | dolphin-mixtral | 26GB | 5-15 tok/s | 8/10 | Analysis/code |

## Code Integration Examples

### Using Ollama in Components

```javascript
import { generateOllamaResponse, isOllamaAvailable } from '../AI/ollamaAPI.js';

// Check if Ollama is available
const available = await isOllamaAvailable();

// Generate response
const result = await generateOllamaResponse("What is AI?");
if (result.success) {
  console.log(result.response); // AI response
  console.log(result.tier);     // 'fast', 'balanced', 'quality'
  console.log(result.stats);    // token counts, timing
}
```

### Using Chat Mode

```javascript
import { generateOllamaChat } from '../AI/ollamaAPI.js';

const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there! How can I help?' },
  { role: 'user', content: 'What is Ollama?' }
];

const result = await generateOllamaChat(messages);
```

### Adding Ollama Settings to Settings Page

```javascript
import OllamaSettings from '../AI/OllamaSettings.jsx';

// In your Settings component:
<div className="section">
  <OllamaSettings />
</div>
```

## Fallback Behavior

If Ollama is not available:

1. App detects connection failure (3 second timeout)
2. Falls back to template-based responses
3. Shows user a friendly message: "⚠️ Ollama Not Connected"
4. Suggests: Start Ollama, pull model, restart Nexus
5. No errors or crashes - seamless degradation

## Testing Ollama Connection

```bash
# Check if Ollama is running:
curl http://localhost:11434/api/tags

# Should return something like:
# {"models":[{"name":"llama2:latest","size":3800000000}]}

# Test generation:
curl http://localhost:11434/api/generate \
  -d '{"model":"llama2","prompt":"Hello"}'
```

## Performance Tuning

### Make it faster

```bash
# Use GPU (NVIDIA):
export OLLAMA_CUDA_VISIBLE_DEVICES=0
ollama serve

# Or Metal on Apple Silicon (automatic)
```

### Make it use less memory

```bash
# Use fast tier (4GB models instead of 26GB)
# App automatically handles this based on selection
```

## Future Enhancements

Potential improvements:

- [ ] Allow custom Ollama models
- [ ] Model fine-tuning support
- [ ] Streaming responses
- [ ] Multi-model comparison mode
- [ ] Benchmark tool (compare speeds/quality)
- [ ] Automatic model downloading on setup

## Files Location Reference

```
src/Components/
├── AI/
│   ├── ollamaModels.js        ← Model profiles
│   ├── ollamaAPI.js           ← API wrapper
│   └── OllamaSettings.jsx      ← Settings UI
└── UI/
    └── FirstTimeSetup.js      ← Updated with Step 6

docs/
└── OLLAMA_SETUP_GUIDE.md      ← User guide

/scripts/setup/ollama-quick-setup.sh          ← Quick install script
```

## User Quick-Start Summary

When users open Nexus:

1. **First Time Setup** appears automatically
2. They go through Steps 1-5 as before
3. **NEW - Step 6**: Choose response quality (Fast/Balanced/Quality)
4. See helpful instructions for pulling models
5. Are directed to setup guide if needed
6. Can change this later in Settings → AI Tools → Ollama

---

**That's it!** Users now have full control over their local AI model performance vs quality, with seamless fallback to templates if Ollama isn't available.
