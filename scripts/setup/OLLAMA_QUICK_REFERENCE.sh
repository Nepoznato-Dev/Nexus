#!/bin/bash
# 🦙 Ollama + Nexus Quick Reference Card

echo "================================"
echo "🦙 OLLAMA + NEXUS SETUP"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}## STEP 1: Start Ollama${NC}"
echo "Run in terminal 1:"
echo "  ollama serve"
echo ""

echo -e "${BLUE}## STEP 2: Pull Models${NC}"
echo "Run in terminal 2 (choose ONE or ALL):"
echo ""
echo -e "${GREEN}⚡ FAST (4.1GB - Ultra Quick)${NC}"
echo "  ollama pull neural-chat"
echo ""
echo -e "${GREEN}⚙️  BALANCED (3.8GB - RECOMMENDED)${NC}"
echo "  ollama pull llama2"
echo ""
echo -e "${GREEN}✨ QUALITY (26GB - Best Output)${NC}"
echo "  ollama pull dolphin-mixtral"
echo ""

echo -e "${BLUE}## STEP 3: Verify Installation${NC}"
echo "Check that Ollama is responding:"
echo "  curl http://localhost:11434/api/tags"
echo ""

echo -e "${BLUE}## STEP 4: Start Nexus${NC}"
echo "Open http://localhost:3000"
echo "→ First Time Setup, Step 6 → Choose your tier"
echo ""

echo -e "${YELLOW}## MODEL COMPARISON${NC}"
echo "┌──────────┬──────────┬──────────┬──────────┬──────────┐"
echo "│ Speed    │ Balanced │ Quality  │ Size     │ Use For  │"
echo "├──────────┼──────────┼──────────┼──────────┼──────────┤"
echo "│ ⚡ 50-80 │ ⚙️ 20-40 │ ✨ 5-15  │ Tokens/s │          │"
echo "│ 3/10 Q   │ 6/10 Q   │ 8/10 Q   │ Quality  │          │"
echo "│ 4.1GB    │ 3.8GB    │ 26GB     │ Size     │          │"
echo "│ Quick    │ General  │ Complex  │ Best For │          │"
echo "└──────────┴──────────┴──────────┴──────────┴──────────┘"
echo ""

echo -e "${YELLOW}## USEFUL COMMANDS${NC}"
echo "List your models:"
echo "  ollama list"
echo ""
echo "Test a model:"
echo "  ollama run llama2"
echo ""
echo "Remove a model (to save space):"
echo "  ollama rm neural-chat"
echo ""
echo "Check Ollama is running:"
echo "  curl http://localhost:11434/api/tags"
echo ""

echo -e "${YELLOW}## TROUBLESHOOTING${NC}"
echo "Ollama not responding?"
echo "  1. Check it's running: lsof -i :11434"
echo "  2. Restart: press Ctrl+C, then 'ollama serve' again"
echo "  3. Check logs: tail -f ~/.ollama/logs/server.log"
echo ""
echo "Model too slow?"
echo "  → Switch to ⚡ Fast tier in Nexus Settings"
echo ""
echo "Out of memory?"
echo "  → Use smaller model (Fast or Balanced instead of Quality)"
echo ""

echo -e "${GREEN}✅ Setup complete! Open http://localhost:3000${NC}"
