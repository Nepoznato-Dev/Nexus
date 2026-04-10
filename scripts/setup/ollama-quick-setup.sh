#!/bin/bash
# Ollama Quick Setup - Copy and paste these commands

# 1. Start Ollama (run in one terminal)
echo "Starting Ollama service..."
ollama serve &

# Give it a moment to start
sleep 2

# 2. Pull models (run in another terminal)
echo "Pulling Ollama models..."

# ⚡ Fast model
echo "Pulling fast model (neural-chat)..."
ollama pull neural-chat

# ⚙️ Balanced model (RECOMMENDED)
echo "Pulling balanced model (llama2)..."
ollama pull llama2

# ✨ Quality model (warning: 26GB)
echo "Pulling quality model (dolphin-mixtral)..."
echo "⚠️ This is 26GB - choose another if you don't have space"
# ollama pull dolphin-mixtral

# 3. Test connection
echo "Testing Ollama connection..."
curl http://localhost:11434/api/tags

echo ""
echo "✅ Setup complete!"
echo "Models ready: $(ollama list | grep -v NAME | wc -l) installed"
echo ""
echo "Next: Open Nexus and select your preferred model quality tier in First Time Setup"
