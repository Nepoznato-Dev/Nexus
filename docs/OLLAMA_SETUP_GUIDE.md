# 🚀 Ollama Setup Guide - Fast, Balanced, Quality

This guide walks you through setting up Ollama with Nexus for local AI responses.

## What is Ollama?

Ollama is a lightweight tool that lets you run large language models locally on your machine. Unlike cloud APIs, everything stays on your computer:

- ✅ **No internet needed** after initial setup
- ✅ **No API keys** required
- ✅ **Privacy first** - your data never leaves your device
- ✅ **Free** - no subscription costs

## Installation

### Option 1: macOS (Easiest)

```bash
# Download from: https://ollama.ai/download/mac
# Or use Homebrew:
brew install ollama
```

### Option 2: Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Option 3: Windows (WSL2 recommended)

```bash
# Download from https://ollama.ai/download/windows
# Or use WSL2 Ubuntu terminal:
curl -fsSL https://ollama.ai/install.sh | sh
```

## 🔥 Quick Setup (Copy & Paste)

### Step 1: Start Ollama Service

```bash
# macOS:
open /Applications/Ollama.app

# Linux/Windows WSL:
ollama serve
```

This starts the Ollama server on `localhost:11434`

### Step 2: Pull Models (Choose ONE)

**⚡ Fast (Instant Responses)**

```bash
ollama pull neural-chat
# ~4.1GB - Great for quick summaries and simple questions
```

**⚙️ Balanced (Recommended)**

```bash
ollama pull llama2
# ~3.8GB - Perfect for most tasks, good speed & quality balance
```

**✨ Quality (Best Responses)**

```bash
ollama pull dolphin-mixtral
# ~26GB - Excellent quality but needs patience
# Alternative (smaller): ollama pull zephyr (~4.8GB)
```

### Step 3: Test Connection

```bash
# Should return list of installed models:
curl http://localhost:11434/api/tags

# Or test a model:
curl http://localhost:11434/api/generate -d '{"model":"llama2","prompt":"Hello world"}'
```

## 📊 Model Comparison

| Tier | Model | Size | Speed | Quality | Best For |
|------|-------|------|-------|---------|----------|
| ⚡ Fast | neural-chat | 4.1GB | 50-80 tok/s | ⭐⭐⭐ | Quick answers, definitions |
| ⚙️ Balanced | llama2 | 3.8GB | 20-40 tok/s | ⭐⭐⭐⭐⭐⭐ | **Most use cases** |
| ✨ Quality | dolphin-mixtral | 26GB | 5-15 tok/s | ⭐⭐⭐⭐⭐⭐⭐⭐ | Complex analysis, code |

## 🎯 Performance Tips

### Make it Faster

```bash
# Use GPU acceleration (NVIDIA CUDA):
# Export OLLAMA_CUDA_VISIBLE_DEVICES=0
# ollama serve

# Or use Metal on Apple Silicon:
# Automatic - just works!
```

### Free Up Space

```bash
# List all models:
ollama list

# Remove a model:
ollama rm neural-chat
```

### Keep in Background

```bash
# macOS:
brew services start ollama

# Linux (systemd):
sudo systemctl enable ollama
sudo systemctl start ollama
```

## 🔗 Integration with Nexus

1. **During First Time Setup**: Choose your preferred tier (Fast/Balanced/Quality)
2. **Automatic Detection**: Nexus will detect Ollama on localhost:11434
3. **Fallback**: Missing models? Nexus uses template responses automatically
4. **Change Later**: Go to Settings → AI Tools → Ollama Model

## ⚠️ Troubleshooting

### "Connection refused"

```bash
# Check if Ollama is running:
lsof -i :11434  # macOS/Linux
netstat -ano | findstr :11434  # Windows

# Start it:
ollama serve
```

### Model fails to load

```bash
# Try removing and re-pulling:
ollama rm llama2
ollama pull llama2
```

### Running out of memory

```bash
# Reduce context size in Nexus Settings
# Or use a smaller model (neural-chat instead of dolphin-mixtral)
```

### GPU not being used

```bash
# Check available GPU:
nvidia-smi  # NVIDIA
metal ...   # Apple Silicon

# Enable in ~/.bashrc or equivalent:
export OLLAMA_GPU=1
```

## 📚 Advanced Usage

### Run Multiple Models

```bash
# Each model is independent:
ollama pull neural-chat neural-chat:8bit llama2
```

### Customize Model Parameters

Create `Modelfile`:

```dockerfile
FROM llama2

# Increase context window
PARAMETER num_ctx 4096

# Adjust temperature for creativity
PARAMETER temperature 0.7
```

Then:

```bash
ollama create mymodel -f Modelfile
```

### Use API Directly

```bash
# Generate text:
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'

# Chat endpoint:
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 🌐 Browser Access from Other Devices

To access Ollama from another computer on your network:

```bash
# On Ollama machine, edit where it runs:
# Set OLLAMA_HOST=0.0.0.0:11434
# Then access from: http://<your-machine-ip>:11434
```

## 📖 More Information

- **Official Docs**: <https://github.com/ollama/ollama>
- **Model Library**: <https://ollama.ai/library>
- **API Docs**: <https://github.com/ollama/ollama/blob/main/docs/api.md>

---

**Questions?** Check Nexus Settings → Help & Documentation or open an issue on GitHub!
