# 🔧 Ollama + Nexus Troubleshooting Guide

## Connection Issues

### ❌ "Ollama Not Connected" message in Nexus

**Problem**: Nexus shows "⚠️ Ollama Not Running" in AI Settings

**Solutions**:

```bash
# 1. Check if Ollama is actually running:
curl http://localhost:11434/api/tags
# If: Connection refused → Ollama isn't running

# 2. Start Ollama:
ollama serve    # macOS/Linux
# Or start the Ollama app on macOS

# 3. Verify it's listening:
lsof -i :11434   # macOS/Linux
netstat -ano | findstr :11434  # Windows

# 4. Reload Nexus in browser
```

### ❌ "Connection refused" or timeout

**Problem**: Browser console shows `fetch error` or timeout

**Causes**:

- Ollama service not running
- Firewall blocking port 11434
- Port 11434 already in use by another app

**Fixes**:

```bash
# Check what's using port 11434:
lsof -i :11434  # macOS/Linux
# If something else is there, kill it:
kill -9 <PID>

# Try different port:
OLLAMA_HOST=127.0.0.1:11435 ollama serve
# Then in Nexus settings, update the URL
```

## Model Issues

### ❌ Model doesn't load / "Model not found"

**Problem**: Nexus tries to use a model that's not installed

**Solutions**:

```bash
# 1. List available models:
ollama list

# 2. If preferred model isn't listed, pull it:
ollama pull llama2          # Balanced (RECOMMENDED)
ollama pull neural-chat     # Fast
ollama pull dolphin-mixtral # Quality

# 3. Verify model was installed:
ollama show llama2
```

### ⚠️ Model keeps failing after installation

**Problem**: Model installed but Nexus still shows errors

**Try clearing cache**:

```bash
# Remove and reinstall:
ollama rm llama2
ollama pull llama2

# Check model file integrity:
ollama show llama2

# Restart Ollama:
^C  # Stop current process
ollama serve  # Start fresh
```

## Performance Issues

### 🐌 Responses are very slow

**Problem**: Generating responses takes 30+ seconds per short message

**Root causes**:

1. **Wrong model for your hardware** - Using quality tier on low-end PC
2. **Only CPU, no GPU** - Model running on CPU is slow
3. **Not enough RAM** - System swapping to disk
4. **Model still loading** - First run is always slower

**Solutions**:

```bash
# 1. Switch to faster tier (in Nexus Settings):
# Change from Quality/Balanced → Fast tier

# 2. Check resource usage:
top    # macOS/Linux - is Ollama using CPU?
ps aux | grep ollama

# 3. Use GPU if available:
# NVIDIA:
export OLLAMA_CUDA_VISIBLE_DEVICES=0
ollama serve

# Apple Silicon (Metal):
# Already automatic, just works!

# 4. Reduce context size (edit ~/.ollama/modelfile):
# PARAMETER num_ctx 512  (default is higher)
```

### 💾 "Out of memory" or crashes

**Problem**: Ollama crashes with OOM error

**Causes**:

- Model too large for available RAM
- Too many requests at once
- System doesn't have enough swap space

**Solutions**:

```bash
# 1. Switch to smaller tier:
# Quality (26GB) → Balanced (3.8GB) or Fast (4.1GB)

# 2. Check available RAM:
# macOS:
vm_stat
# Linux:
free -h
# Windows:
Get-ComputerInfo | select CsTotalPhysicalMemory

# Need 6GB+ for balanced, 4GB+ for fast

# 3. Use format parameter to reduce model size:
ollama pull llama2:7b-q4_0  # Quantized, smaller

# 4. Increase system RAM or swap space
```

## Quality Issues

### ❓ Responses seem bad / generic

**Problem**: Model generates boring or irrelevant responses

**Reasons**:

- Using fast tier (neural-chat) which sacrifices quality
- Model needs better prompt formatting
- Topic outside model's training data

**Solutions**:

```bash
# 1. Try balanced or quality tier for better results:
# Settings → Ollama Models → Select "⚙️ Balanced" or "✨ Quality"

# 2. Ask more specific questions:
❌ "What is AI?"
✅ "Explain machine learning algorithms with examples"

# 3. Test model directly:
ollama run llama2  # Interactive chat mode to test
```

### 📝 Responses have artifacts / nonsense text

**Problem**: Model generates corrupted text or repeats

**Try**:

```bash
# 1. Reduce temperature (less randomness):
# Model might need retuning
# Edit ~/.ollama/modelfile:
PARAMETER temperature 0.3

# 2. Check model file:
ollama show llama2

# 3. Reinstall:
ollama rm llama2
ollama pull llama2
```

## Nexus-Specific Issues

### ❌ First Time Setup Step 6 doesn't appear

**Problem**: Setup wizard only has 5 steps, no Ollama selection

**Causes**:

- Old browser cache
- Setup was completed before update

**Fixes**:

```bash
# 1. Hard refresh browser:
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)

# 2. Clear Nexus data and restart setup:
# Go to: public/clear-setup-debug.html
# Click: "🗑️ Clear ALL Data (Factory Reset)"
# Reload app → Setup should reappear with Step 6

# 3. Check browser console for errors:
F12 → Console tab → Look for red errors
```

### ⚙️ Ollama Settings page won't load

**Problem**: Settings → AI Tools crash or blank

**Try**:

```bash
# 1. Verify storage is working:
# Open DevTools Console, paste:
const db = await indexedDB.open('NexusDB', 1);
console.log('DB OK');

# 2. Check if Ollama API wrapper is loaded:
# Console:
import('./Components/AI/ollamaAPI.js')
  .then(m => console.log('✅ API loaded', m))
  .catch(e => console.error('❌ Failed to load', e))

# 3. Restart Nexus dev server:
npm start
```

## Testing & Debugging

### 📊 Verify Ollama works locally

```bash
# 1. Check if Ollama responds:
curl http://localhost:11434/api/tags

# Expected output:
# {"models":[{"name":"llama2:latest","size":3800000000}]}

# 2. Test model generation:
curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "What is 2+2?",
    "stream": false
  }'

# 3. Check response time:
time curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama2","prompt":"test","stream":false}'
# Should complete within 5-30 seconds depending on model
```

### 🔍 Check browser connection

```javascript
// Open DevTools Console (F12) and run:

// Test if Ollama is accessible from browser:
fetch('http://localhost:11434/api/tags')
  .then(r => r.json())
  .then(data => console.log('✅ Ollama OK:', data))
  .catch(e => console.error('❌ Connection failed:', e))

// Test model quality:
fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama2',
    prompt: 'Explain quantum computing briefly',
    stream: false
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ Response:', data.response))
  .catch(e => console.error('❌ Failed:', e))
```

## Platform-Specific Issues

### macOS - App won't start

```bash
# Check logs:
tail -f ~/.ollama/logs/server.log

# Reset app:
rm -rf ~/.ollama

# Make sure it downloaded properly:
ls -la /Applications/Ollama.app

# Reinstall:
# Download from ollama.ai/download/mac
```

### Linux - Permission denied

```bash
# Add user to sudo group:
sudo usermod -aG sudo $USER
newgrp sudo

# Or run with sudo:
sudo ollama serve

# (But this isn't recommended - prefer user permissions)
```

### Windows WSL - Can't find ollama

```bash
# Make sure WSL2 is installed:
wsl --list --verbose

# Install Ollama in WSL:
curl -fsSL https://ollama.ai/install.sh | sh

# Start with proper shell:
wsl  # Enter WSL
ollama serve
```

## Getting Help

1. **Check the setup guide**: `docs/OLLAMA_SETUP_GUIDE.md`
2. **Check this file**: `docs/OLLAMA_TROUBLESHOOTING.md`
3. **Test manually**: Use curl commands above
4. **Check browser console**: F12 → Console for errors
5. **Look at Ollama logs**: `~/.ollama/logs/server.log`

---

**Still stuck?** Open an issue on GitHub with:

- Your OS and hardware (CPU, RAM, GPU)
- Output of: `ollama list`, `curl http://localhost:11434/api/tags`
- Browser console errors (F12 → Console)
- Relevant Ollama logs (last 10 lines)
