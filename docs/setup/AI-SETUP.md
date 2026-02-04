# AI Helper Setup Guide

The AI Helper in Nexus can now generate real responses using AI APIs instead of just template responses!

## 🎯 How It Works

By default, the AI Helper uses **template responses** - pre-written educational responses that guide you without giving direct answers. But if you configure an AI API, it will use real AI models to generate custom responses!

## 🔑 Setting Up Real AI

### Step 1: Choose Your AI Provider

Go to **Settings > AI Tools** and select an AI provider:

- **None** - Uses template responses (default, no API key needed)
- **OpenAI** - GPT-3.5, GPT-4, or GPT-4 Turbo
- **Anthropic** - Claude 3 Sonnet or Opus
- **Google** - Gemini Pro

### Step 2: Get an API Key

Depending on your provider:

- **OpenAI**: Get your API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Requires a credit card on file
  - GPT-3.5-turbo is very cheap (~$0.002 per 1K tokens)
  
- **Anthropic**: Get your API key from [console.anthropic.com](https://console.anthropic.com)
  - Requires a credit card on file
  - Claude 3 Sonnet is mid-range pricing
  
- **Google**: Get your API key from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
  - Free tier available!
  - Gemini Pro is free for now

### Step 3: Enter Your API Key

1. Go to **Settings > AI Tools**
2. Select your AI Provider
3. Paste your API key in the **API Key** field
4. Choose a model (GPT-3.5 is fastest and cheapest)
5. Save settings

### Step 4: Enable AI Tools

Make sure **AI Assistant** is toggled ON in Settings > AI Tools

## 💡 Using the AI Helper

1. Open the **Study Tools** page
2. Find the **AI Helper** card
3. Choose a mode:
   - **Explain** - Get concepts explained clearly
   - **Solve** - Get step-by-step problem-solving guidance (won't give answers)
   - **Summarize** - Get concise summaries
   - **Code** - Get programming help

4. Type your question and press Enter!

## 🔒 Privacy & Security

- Your API key is **stored locally** in your browser only
- It's never sent to Nexus servers (because there are none!)
- API calls go directly from your browser to the AI provider
- Your questions and responses are handled by your chosen AI provider according to their privacy policy

## ⚠️ Fallback Behavior

If the AI API fails (network error, rate limit, invalid key, etc.):
- You'll see a red error message
- The system will automatically fall back to template responses
- The error message disappears after 3 seconds

## 💰 Cost Considerations

**OpenAI GPT-3.5 Turbo** (Recommended for students):
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- Average question + answer: ~500 tokens = $0.001 (one-tenth of a cent!)
- 1000 questions ≈ $1

**Anthropic Claude 3 Sonnet**:
- More expensive but very smart
- ~$3 per 1M input tokens

**Google Gemini Pro**:
- Currently FREE with generous limits
- Great for students!

## 🎨 AI Personality

The AI adapts to your chosen personality mode:
- **Adaptive** - Matches your communication style
- **Kind** - Always encouraging and supportive
- **Moody** - Witty and sarcastic (fun!)
- **Professional** - Direct and efficient
- **Mentor** - Educational and detailed
- **Chill** - Relaxed and friendly

## 🚀 Tips

1. **Start with Google Gemini** if you want free AI
2. **Use GPT-3.5** if you want cheap, fast responses
3. **Try Claude** for more creative/nuanced responses
4. **Keep template mode** if you want to learn without AI (it still works great!)
5. The AI is designed to **guide you**, not do your homework!

## 🐛 Troubleshooting

**"AI unavailable: API Error: 401"**
- Your API key is invalid or expired
- Check your key in Settings

**"AI unavailable: API Error: 429"**
- You hit the rate limit
- Wait a moment and try again
- Consider upgrading your API plan

**"AI unavailable: Failed to fetch"**
- Network connection issue
- Check your internet connection
- The AI will fall back to templates

**No response at all**
- Make sure AI Tools is enabled in Settings
- Check that you've entered an API key
- Try refreshing the page

---

Enjoy your new AI-powered study assistant! 🎓✨
