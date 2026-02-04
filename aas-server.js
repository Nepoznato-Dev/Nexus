/**
 * AAS Local Test Server - Run the thinking AI locally
 * Usage: node aas-server.js
 * Then visit http://localhost:3001
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { initializeAASSession, processMessage } from './src/Components/I.R.I.S (Formally known as AAS)/aiIntegration.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const MOD_CACHE_DIR = path.join(__dirname, 'private', 'mods-cache');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/mods-cache', express.static(MOD_CACHE_DIR));

// Store active sessions
const sessions = new Map();

function sanitizeFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Download and cache mod files server-side for injection workflows
 */
app.post('/api/mods/download', async (req, res) => {
  try {
    const { fileUrl, fileName } = req.body || {};

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'fileUrl is required' });
    }

    await fs.mkdir(MOD_CACHE_DIR, { recursive: true });

    let resolvedName = fileName;
    if (!resolvedName) {
      try {
        const url = new URL(fileUrl);
        resolvedName = path.basename(url.pathname);
      } catch {
        resolvedName = `mod-${Date.now()}.jar`;
      }
    }

    resolvedName = sanitizeFileName(resolvedName);
    if (!resolvedName.toLowerCase().endsWith('.jar')) {
      resolvedName = `${resolvedName}.jar`;
    }

    const targetPath = path.join(MOD_CACHE_DIR, resolvedName);

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: `Download failed: ${response.status}`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(targetPath, buffer);

    return res.json({
      success: true,
      fileName: resolvedName,
      filePath: targetPath,
      publicUrl: `/mods-cache/${resolvedName}`,
      size: buffer.length
    });
  } catch (error) {
    console.error('Mod cache download error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Local response generator (works without APIs)
 */
function generateLocalResponse(question, history = []) {
  const lower = question.toLowerCase();

  // Learning advice
  if (/learn|study|understand|tutorial|master/.test(lower)) {
    return `Learning works best when you do these 5 things:

1. **Learn by doing** - Code immediately, don't watch tutorials for hours
2. **Build something real** - A project you care about (not "hello world")
3. **Practice daily** - 30 minutes every day beats 5 hours once a month
4. **Teach what you learn** - Explain it to someone else (forces understanding)
5. **Embrace struggling** - If it's easy, you're not learning

The biggest mistake people make: Tutorial hell. Endless videos, no projects.

What would you actually want to build?`;
  }

  // Career/work
  if (/job|career|interview|salary|work|boss|manager/.test(lower)) {
    return `Career growth breaks down into these components:

1. **Skills** - Learn something new each quarter
2. **Visibility** - Let people know what you're doing
3. **Network** - Build relationships continuously
4. **Negotiate** - Know your market value, ask for it
5. **Move on** - After 3-5 years, change jobs for growth

Real talk: Most people stay too long in one place hoping for a raise.

What's actually blocking your growth right now?`;
  }

  // Technical help
  if (/code|debug|error|function|bug|javascript|python|react|node/.test(lower)) {
    return `Debugging approach (this works for almost everything):

1. **Read the error** - It's telling you exactly what's wrong
2. **Reproduce it** - Make it happen in the simplest possible way
3. **Isolate** - Remove code until it works, then add back one piece
4. **Debug step-by-step** - Don't guess, trace through logically
5. **Research** - Someone has solved this before (Google it)

Common mistakes:
- Skipping the error message
- Adding random console.logs everywhere
- Not testing your fix thoroughly
- Copying code without understanding it

What's the specific error you're seeing?`;
  }

  // Time/productivity
  if (/time|busy|schedule|procrastinate|deadline|rush/.test(lower)) {
    return `Time problems usually aren't about time, they're about priorities.

Real solutions:
1. **Do less** - Cut 50% of your commitments ruthlessly
2. **Automate** - 1 hour setup saves 40 hours/year
3. **Delegate** - You don't have to do everything
4. **Batch** - Group similar tasks (emails, calls, deep work separately)
5. **Decide fast** - Don't overthink; pick one option by tomorrow

The pattern: People say yes to everything instead of focusing.

If you could say no to one thing this week, what would it be?`;
  }

  // Decision making
  if (/decide|choice|option|should i|confused|stuck|torn/.test(lower)) {
    return `When you're stuck between options, try this:

1. **Question the premise** - Do I have to choose between these two?
2. **Find the handbrake** - What if I did something unexpected instead?
3. **Look at consequences** - What's the worst that happens? Can I fix it?
4. **Set a deadline** - Decide by tomorrow, not next month
5. **Test it** - Do the thing for 1 week, you'll know if it's wrong

Example: "Should I keep my job or quit?"
- Handbrake: Can I do both? Part-time job + side project?
- Or: Take unpaid leave to test freelancing first?

What's the decision you're actually stuck on?`;
  }

  // Default
  return `I'm here to help with anything on your mind. I can:
- Help you learn coding or skills
- Talk through career decisions
- Debug problems and code
- Help with time management
- Discuss decisions you're stuck on
- Or just think through anything with you

What's on your mind?`;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Initialize a new session
 */
app.post('/api/session/start', async (req, res) => {
  try {
    const { sessionId, preferences } = req.body;
    const id = sessionId || 'session-' + Date.now();

    const session = await initializeAASSession(id, {
      personality: preferences?.personality || 'mentor',
      professionalism: preferences?.professionalism || 0.5,
      mentorship: preferences?.mentorship || 0.8,
      showThinking: preferences?.showThinking !== false,
    });

    sessions.set(id, session);

    res.json({
      success: true,
      sessionId: id,
      message: 'Session initialized'
    });
  } catch (error) {
    console.error('Session init error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a message to the AI
 */
app.post('/api/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    const session = sessions.get(sessionId);

    const result = await processMessage(message, session, {
      generateLocal: generateLocalResponse,
      apiKeys: {
        google: process.env.REACT_APP_GOOGLE_API_KEY,
        openai: process.env.REACT_APP_OPENAI_API_KEY
      }
    });

    res.json({
      success: true,
      response: result.response,
      thinking: result.thinking,
      metadata: result.metadata,
      topics: result.metadata?.userContext?.topics || [],
      confidence: result.metadata?.confidence
    });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get conversation history
 */
app.get('/api/session/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;

  if (!sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const session = sessions.get(sessionId);
  res.json({
    success: true,
    history: session.conversationHistory || []
  });
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'AAS is running',
    sessions: sessions.size,
    apis: {
      google: !!process.env.REACT_APP_GOOGLE_API_KEY ? 'configured' : 'missing',
      openai: !!process.env.REACT_APP_OPENAI_API_KEY ? 'configured' : 'not set'
    }
  });
});

/**
 * Serve the test HTML
 */
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'aas-test.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🧠 AAS TEST SERVER - Your Thinking AI is Ready 🧠       ║
║                                                                ║
║  Server: http://localhost:${PORT}                               ║
║  Test UI: http://localhost:${PORT}/test                         ║
║                                                                ║
║  API Health: http://localhost:${PORT}/api/health               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Next steps:
  1. Open http://localhost:${PORT}/test in your browser
  2. Ask the AI a question
  3. Watch it think in real-time
  4. All responses are saved to memory

Troubleshooting:
  - If "Missing API key" appears, set: REACT_APP_GOOGLE_API_KEY=your-key
  - The AI still works in fallback mode without APIs
  - Check http://localhost:${PORT}/api/health for status
  `);
});

export default app;
