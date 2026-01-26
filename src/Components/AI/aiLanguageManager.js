/**
 * AI Language Manager - Multilingual support for AI responses
 * Supports: English, Spanish, French, German, Russian, Chinese, Japanese, Arabic, Hindi, Bengali, Portuguese, Italian
 */

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English', rtl: false },
  es: { name: 'Spanish', native: 'Español', rtl: false },
  fr: { name: 'French', native: 'Français', rtl: false },
  de: { name: 'German', native: 'Deutsch', rtl: false },
  ru: { name: 'Russian', native: 'Русский', rtl: false },
  zh: { name: 'Chinese', native: '中文', rtl: false },
  ja: { name: 'Japanese', native: '日本語', rtl: false },
  ar: { name: 'Arabic', native: 'العربية', rtl: true },
  hi: { name: 'Hindi', native: 'हिन्दी', rtl: false },
  bn: { name: 'Bengali', native: 'বাংলা', rtl: false },
  pt: { name: 'Portuguese', native: 'Português', rtl: false },
  it: { name: 'Italian', native: 'Italiano', rtl: false },
  ko: { name: 'Korean', native: '한국어', rtl: false },
  tr: { name: 'Turkish', native: 'Türkçe', rtl: false },
  pl: { name: 'Polish', native: 'Polski', rtl: false },
  nl: { name: 'Dutch', native: 'Nederlands', rtl: false },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt', rtl: false },
};

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS = {
  es: /\b(hola|gracias|por favor|ayuda|necesito|cómo|qué|buenos días)\b/i,
  fr: /\b(bonjour|merci|s'il vous plaît|aide|besoin|comment|quoi|salut)\b/i,
  de: /\b(hallo|danke|bitte|hilfe|brauche|wie|was|guten tag)\b/i,
  ru: /\b(привет|спасибо|пожалуйста|помощь|нужно|как|что)\b/i,
  zh: /[\u4e00-\u9fff]/,
  ja: /[\u3040-\u309f\u30a0-\u30ff]/,
  ar: /[\u0600-\u06ff]/,
  hi: /[\u0900-\u097f]/,
  bn: /[\u0980-\u09ff]/,
  pt: /\b(olá|obrigado|por favor|ajuda|preciso|como|o que)\b/i,
  it: /\b(ciao|grazie|per favore|aiuto|bisogno|come|cosa)\b/i,
  ko: /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/,
  tr: /\b(merhaba|teşekkürler|lütfen|yardım|nasıl|ne)\b/i,
  pl: /\b(cześć|dziękuję|proszę|pomoc|potrzebuję|jak|co)\b/i,
  nl: /\b(hallo|dank je|alstublieft|hulp|nodig|hoe|wat)\b/i,
  vi: /\b(xin chào|cảm ơn|làm ơn|giúp|cần|như thế nào|gì)\b/i,
};

/**
 * Common translations for AI responses
 */
export const TRANSLATIONS = {
  greetings: {
    en: "Hey there! I'm Nexus AI. I can help with studying, writing, coding, math, and Nexus features. What's on your mind?",
    es: "¡Hola! Soy Nexus AI. Puedo ayudarte con estudios, escritura, programación, matemáticas y funciones de Nexus. ¿En qué puedo ayudarte?",
    fr: "Salut! Je suis Nexus AI. Je peux vous aider avec vos études, l'écriture, la programmation, les mathématiques et les fonctionnalités de Nexus. Comment puis-je vous aider?",
    de: "Hallo! Ich bin Nexus AI. Ich kann dir beim Lernen, Schreiben, Programmieren, Mathematik und Nexus-Funktionen helfen. Wie kann ich dir helfen?",
    ru: "Привет! Я Nexus AI. Я могу помочь с учебой, написанием текстов, программированием, математикой и функциями Nexus. Чем могу помочь?",
    zh: "你好！我是 Nexus AI。我可以帮助学习、写作、编程、数学和 Nexus 功能。有什么我能帮你的吗？",
    ja: "こんにちは！Nexus AIです。勉強、執筆、プログラミング、数学、Nexus機能をお手伝いできます。何かお困りですか？",
    ar: "مرحباً! أنا Nexus AI. يمكنني المساعدة في الدراسة والكتابة والبرمجة والرياضيات وميزات Nexus. كيف يمكنني مساعدتك؟",
    hi: "नमस्ते! मैं Nexus AI हूं। मैं अध्ययन, लेखन, कोडिंग, गणित और Nexus सुविधाओं में मदद कर सकता हूं। मैं आपकी कैसे मदद कर सकता हूं?",
    bn: "হ্যালো! আমি Nexus AI। আমি পড়াশোনা, লেখা, কোডিং, গণিত এবং Nexus বৈশিষ্ট্যগুলিতে সাহায্য করতে পারি। আমি কীভাবে সাহায্য করতে পারি?",
    pt: "Olá! Sou o Nexus AI. Posso ajudar com estudos, escrita, programação, matemática e recursos do Nexus. Como posso ajudá-lo?",
    it: "Ciao! Sono Nexus AI. Posso aiutarti con lo studio, la scrittura, la programmazione, la matematica e le funzionalità di Nexus. Come posso aiutarti?",
  },
  
  thinking: {
    en: "Thinking...",
    es: "Pensando...",
    fr: "Je réfléchis...",
    de: "Ich denke nach...",
    ru: "Думаю...",
    zh: "思考中...",
    ja: "考え中...",
    ar: "أفكر...",
    hi: "सोच रहा हूं...",
    bn: "চিন্তা করছি...",
    pt: "Pensando...",
    it: "Pensando...",
  },
  
  error: {
    en: "Sorry, I encountered an error. Can you rephrase that?",
    es: "Lo siento, encontré un error. ¿Puedes reformular eso?",
    fr: "Désolé, j'ai rencontré une erreur. Peux-tu reformuler?",
    de: "Entschuldigung, ich habe einen Fehler festgestellt. Kannst du das umformulieren?",
    ru: "Извините, произошла ошибка. Можете перефразировать?",
    zh: "抱歉，遇到错误。你能重新表述吗？",
    ja: "申し訳ありませんが、エラーが発生しました。言い換えていただけますか？",
    ar: "عذراً، واجهت خطأ. هل يمكنك إعادة صياغة ذلك؟",
    hi: "क्षमा करें, मुझे एक त्रुटि मिली। क्या आप इसे दोबारा कह सकते हैं?",
    bn: "দুঃখিত, আমি একটি ত্রুটি পেয়েছি। আপনি কি এটি পুনরায় বলতে পারেন?",
    pt: "Desculpe, encontrei um erro. Você pode reformular isso?",
    it: "Scusa, ho riscontrato un errore. Puoi riformulare?",
  },
  
  help: {
    en: "I can help you with:",
    es: "Puedo ayudarte con:",
    fr: "Je peux vous aider avec:",
    de: "Ich kann dir helfen mit:",
    ru: "Я могу помочь вам с:",
    zh: "我可以帮助您：",
    ja: "お手伝いできること：",
    ar: "يمكنني مساعدتك في:",
    hi: "मैं आपकी मदद कर सकता हूं:",
    bn: "আমি আপনাকে সাহায্য করতে পারি:",
    pt: "Posso ajudá-lo com:",
    it: "Posso aiutarti con:",
  },
  
  categories: {
    study: {
      en: "Study tips and techniques",
      es: "Consejos y técnicas de estudio",
      fr: "Conseils et techniques d'étude",
      de: "Lerntipps und -techniken",
      ru: "Советы и методы обучения",
      zh: "学习技巧和方法",
      ja: "学習のヒントとテクニック",
      ar: "نصائيات وتقنيات الدراسة",
      hi: "अध्ययन युक्तियाँ और तकनीकें",
      bn: "অধ্যয়ন টিপস এবং কৌশল",
      pt: "Dicas e técnicas de estudo",
      it: "Suggerimenti e tecniche di studio",
    },
    writing: {
      en: "Writing help",
      es: "Ayuda con escritura",
      fr: "Aide à l'écriture",
      de: "Schreibhilfe",
      ru: "Помощь с письмом",
      zh: "写作帮助",
      ja: "ライティングのヘルプ",
      ar: "المساعدة في الكتابة",
      hi: "लेखन सहायता",
      bn: "লেখার সাহায্য",
      pt: "Ajuda com escrita",
      it: "Aiuto nella scrittura",
    },
    math: {
      en: "Math basics",
      es: "Matemáticas básicas",
      fr: "Mathématiques de base",
      de: "Mathe-Grundlagen",
      ru: "Основы математики",
      zh: "数学基础",
      ja: "数学の基本",
      ar: "أساسيات الرياضيات",
      hi: "गणित की मूल बातें",
      bn: "গণিতের মূল বিষয়",
      pt: "Noções básicas de matemática",
      it: "Nozioni di matematica",
    },
    coding: {
      en: "Coding basics",
      es: "Programación básica",
      fr: "Bases de programmation",
      de: "Programmier-Grundlagen",
      ru: "Основы программирования",
      zh: "编程基础",
      ja: "プログラミングの基本",
      ar: "أساسيات البرمجة",
      hi: "कोडिंग की मूल बातें",
      bn: "কোডিং এর মূল বিষয়",
      pt: "Noções básicas de programação",
      it: "Nozioni di programmazione",
    },
  },
};

/**
 * Detect language from text
 */
export const detectLanguage = (text) => {
  // Check each language pattern
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Default to English
  return 'en';
};

/**
 * Get translation for a key
 */
export const translate = (key, lang = 'en', category = null) => {
  if (category) {
    return TRANSLATIONS[category]?.[key]?.[lang] || TRANSLATIONS[category]?.[key]?.en || key;
  }
  
  return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.en || key;
};

/**
 * Get current language preference
 */
export const getCurrentLanguage = () => {
  return localStorage.getItem('nexus_language') || 'en';
};

/**
 * Set language preference
 */
export const setLanguage = (lang) => {
  if (!SUPPORTED_LANGUAGES[lang]) {
    return { success: false, error: `Unsupported language: ${lang}` };
  }
  
  localStorage.setItem('nexus_language', lang);
  
  return { 
    success: true, 
    message: `Language set to ${SUPPORTED_LANGUAGES[lang].native}`,
    lang 
  };
};

/**
 * Auto-detect and set language from user message
 */
export const autoDetectLanguage = (message) => {
  const detected = detectLanguage(message);
  const current = getCurrentLanguage();
  
  // Only auto-switch if confidence is high (not English by default)
  if (detected !== 'en' && detected !== current) {
    setLanguage(detected);
    return {
      detected,
      switched: true,
      message: `🌍 Detected ${SUPPORTED_LANGUAGES[detected].native}, switching language`
    };
  }
  
  return { detected: current, switched: false };
};

/**
 * Translate AI response to target language
 * For now uses template translations, can be enhanced with API
 */
export const translateResponse = (response, targetLang = 'en') => {
  if (targetLang === 'en') return response;
  
  // Check if it's a template response
  for (const [key, translations] of Object.entries(TRANSLATIONS)) {
    if (typeof translations === 'object' && translations.en === response) {
      return translations[targetLang] || response;
    }
  }
  
  // For dynamic responses, would use translation API here
  // For now, return as-is (English) with a note
  return response;
};

/**
 * Get language-specific personality traits
 */
export const getLanguagePersonality = (lang) => {
  const personalities = {
    en: { formality: 0.5, emoji: '😊👍✨' },
    es: { formality: 0.6, emoji: '😊👏🌟' },
    fr: { formality: 0.7, emoji: '😊👌✨' },
    de: { formality: 0.8, emoji: '😊👍⭐' },
    ru: { formality: 0.7, emoji: '😊👍🌟' },
    zh: { formality: 0.7, emoji: '😊👏✨' },
    ja: { formality: 0.9, emoji: '😊🙏✨' },
    ar: { formality: 0.8, emoji: '😊👏🌟' },
    hi: { formality: 0.7, emoji: '😊🙏✨' },
    bn: { formality: 0.7, emoji: '😊🙏🌟' },
    pt: { formality: 0.6, emoji: '😊👏✨' },
    it: { formality: 0.6, emoji: '😊👌🌟' },
  };
  
  return personalities[lang] || personalities.en;
};

/**
 * Format response for RTL languages
 */
export const formatForRTL = (text, lang) => {
  if (SUPPORTED_LANGUAGES[lang]?.rtl) {
    return `\u202B${text}\u202C`; // RLE and PDF markers
  }
  return text;
};

export default {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  translate,
  getCurrentLanguage,
  setLanguage,
  autoDetectLanguage,
  translateResponse,
  getLanguagePersonality,
  formatForRTL,
};
