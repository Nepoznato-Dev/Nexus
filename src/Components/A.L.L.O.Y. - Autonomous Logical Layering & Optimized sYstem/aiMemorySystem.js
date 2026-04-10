/**
 * AI Memory System - Full conversation history, user profiling, and data tracking
 * Tracks: conversations, user preferences, behavior patterns, personality traits
 */

const DB_NAME = 'NexusAIMemory';
const DB_VERSION = 1;
const CONVERSATION_STORE = 'conversations';
const USER_PROFILE_STORE = 'userProfile';
const MEMORY_STORE = 'memories';

/**
 * Initialize IndexedDB for AI memory
 */
function initMemoryDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // Conversations store - full chat history
      if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
        const conversationStore = db.createObjectStore(CONVERSATION_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
        conversationStore.createIndex('conversationId', 'conversationId', { unique: false });
      }

      // User profile store - preferences, behavior, personality
      if (!db.objectStoreNames.contains(USER_PROFILE_STORE)) {
        db.createObjectStore(USER_PROFILE_STORE, { keyPath: 'key' });
      }

      // Memories store - important facts, preferences, context
      if (!db.objectStoreNames.contains(MEMORY_STORE)) {
        const memoryStore = db.createObjectStore(MEMORY_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        memoryStore.createIndex('category', 'category', { unique: false });
        memoryStore.createIndex('importance', 'importance', { unique: false });
      }
    };
  });
}

/**
 * Save a message to conversation history
 */
export async function saveMessage(message, conversationId = 'default') {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CONVERSATION_STORE], 'readwrite');
    const store = tx.objectStore(CONVERSATION_STORE);

    const record = {
      ...message,
      conversationId,
      timestamp: Date.now(),
    };

    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all conversations
 */
export async function getAllConversations() {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CONVERSATION_STORE], 'readonly');
    const store = tx.objectStore(CONVERSATION_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const messages = request.result;
      // Group by conversationId
      const conversations = {};
      messages.forEach((msg) => {
        const convId = msg.conversationId || 'default';
        if (!conversations[convId]) {
          conversations[convId] = [];
        }
        conversations[convId].push(msg);
      });
      resolve(conversations);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId = 'default') {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CONVERSATION_STORE], 'readonly');
    const store = tx.objectStore(CONVERSATION_STORE);
    const index = store.index('conversationId');
    const request = index.getAll(conversationId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get recent messages for context (last N messages)
 */
export async function getRecentMessages(conversationId = 'default', count = 10) {
  const messages = await getConversation(conversationId);
  return messages.slice(-count);
}

/**
 * Save user profile data
 */
export async function saveUserProfile(key, value) {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_PROFILE_STORE], 'readwrite');
    const store = tx.objectStore(USER_PROFILE_STORE);

    const record = {
      key,
      value,
      updated: Date.now(),
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get user profile data
 */
export async function getUserProfile(key) {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_PROFILE_STORE], 'readonly');
    const store = tx.objectStore(USER_PROFILE_STORE);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get full user profile
 */
export async function getFullUserProfile() {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_PROFILE_STORE], 'readonly');
    const store = tx.objectStore(USER_PROFILE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const profile = {};
      request.result.forEach((item) => {
        profile[item.key] = item.value;
      });
      resolve(profile);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a memory (important fact/preference)
 */
export async function saveMemory(text, category = 'general', importance = 5) {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MEMORY_STORE], 'readwrite');
    const store = tx.objectStore(MEMORY_STORE);

    const record = {
      text,
      category, // 'preference', 'fact', 'goal', 'habit', 'interest'
      importance, // 1-10
      timestamp: Date.now(),
    };

    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get memories by category
 */
export async function getMemories(category = null, minImportance = 0) {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MEMORY_STORE], 'readonly');
    const store = tx.objectStore(MEMORY_STORE);

    let request;
    if (category) {
      const index = store.index('category');
      request = index.getAll(category);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      const filtered = request.result.filter((m) => m.importance >= minImportance);
      resolve(filtered.sort((a, b) => b.importance - a.importance));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Analyze user behavior from conversation history
 */
export async function analyzeUserBehavior(conversationId = 'default') {
  const messages = await getConversation(conversationId);

  const userMessages = messages.filter((m) => m.role === 'user');

  const analysis = {
    totalMessages: userMessages.length,
    avgMessageLength: 0,
    commonTopics: {},
    timeOfDayPattern: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    emotionalTone: { positive: 0, neutral: 0, negative: 0 },
    questionTypes: { how: 0, what: 0, why: 0, when: 0, where: 0 },
  };

  userMessages.forEach((msg) => {
    const text = msg.text.toLowerCase();

    // Message length
    analysis.avgMessageLength += text.length;

    // Time of day
    const hour = new Date(msg.timestamp).getHours();
    if (hour >= 5 && hour < 12) analysis.timeOfDayPattern.morning++;
    else if (hour >= 12 && hour < 17) analysis.timeOfDayPattern.afternoon++;
    else if (hour >= 17 && hour < 21) analysis.timeOfDayPattern.evening++;
    else analysis.timeOfDayPattern.night++;

    // Emotional tone (simple keyword analysis)
    const positive = ['good', 'great', 'awesome', 'thanks', 'love', 'perfect', 'yes', '😊', '👍', '❤️'];
    const negative = ['bad', 'hate', 'wrong', 'no', 'problem', 'issue', 'error', '😞', '👎', '😡'];

    if (positive.some((w) => text.includes(w))) analysis.emotionalTone.positive++;
    else if (negative.some((w) => text.includes(w))) analysis.emotionalTone.negative++;
    else analysis.emotionalTone.neutral++;

    // Question types
    if (text.startsWith('how')) analysis.questionTypes.how++;
    if (text.startsWith('what')) analysis.questionTypes.what++;
    if (text.startsWith('why')) analysis.questionTypes.why++;
    if (text.startsWith('when')) analysis.questionTypes.when++;
    if (text.startsWith('where')) analysis.questionTypes.where++;

    // Extract topics (simple keyword extraction)
    const topicKeywords = ['code', 'math', 'study', 'game', 'music', 'video', 'browser', 'settings'];
    topicKeywords.forEach((topic) => {
      if (text.includes(topic)) {
        analysis.commonTopics[topic] = (analysis.commonTopics[topic] || 0) + 1;
      }
    });
  });

  if (userMessages.length > 0) {
    analysis.avgMessageLength = Math.round(analysis.avgMessageLength / userMessages.length);
  }

  return analysis;
}

/**
 * Get personalized greeting based on user profile
 */
export async function getPersonalizedGreeting() {
  const profile = await getFullUserProfile();
  const userName = profile.name || 'there';
  const favoriteEmoji = profile.favoriteEmoji || '👋';
  const lastInteraction = profile.lastInteraction || 0;

  const hoursSinceLastVisit = (Date.now() - lastInteraction) / (1000 * 60 * 60);

  if (hoursSinceLastVisit > 24) {
    return `${favoriteEmoji} Welcome back, ${userName}! It's been a while. What can I help with today?`;
  } else if (hoursSinceLastVisit > 1) {
    return `${favoriteEmoji} Hey ${userName}! Good to see you again. What's on your mind?`;
  } else {
    return `${favoriteEmoji} Hey ${userName}! Still here? Let's keep going!`;
  }
}

/**
 * Clear all AI memory (reset)
 */
export async function clearAllMemory() {
  const db = await initMemoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CONVERSATION_STORE, USER_PROFILE_STORE, MEMORY_STORE], 'readwrite');

    tx.objectStore(CONVERSATION_STORE).clear();
    tx.objectStore(USER_PROFILE_STORE).clear();
    tx.objectStore(MEMORY_STORE).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export default {
  saveMessage,
  getAllConversations,
  getConversation,
  getRecentMessages,
  saveUserProfile,
  getUserProfile,
  getFullUserProfile,
  saveMemory,
  getMemories,
  analyzeUserBehavior,
  getPersonalizedGreeting,
  clearAllMemory,
};
