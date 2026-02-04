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
 * Language detection: 15+ languages via regex (character sets + common phrases).
 * Spanish: hola, gracias, cómo; French: bonjour, merci, comment; German: hallo, danke, wie;
 * Russian: Cyrillic; Chinese/Japanese/Korean: CJK ranges; Arabic: Arabic script + RTL.
 */
const LANGUAGE_PATTERNS = [
  { lang: 'zh', pattern: /[\u4e00-\u9fff]/, confidence: 0.95 },
  { lang: 'ja', pattern: /[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/, confidence: 0.95 },
  { lang: 'ko', pattern: /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/, confidence: 0.95 },
  { lang: 'ar', pattern: /[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff]/, confidence: 0.95 },
  { lang: 'ru', pattern: /[\u0400-\u04ff]/, confidence: 0.9 },
  { lang: 'hi', pattern: /[\u0900-\u097f]/, confidence: 0.9 },
  { lang: 'bn', pattern: /[\u0980-\u09ff]/, confidence: 0.9 },
  { lang: 'es', pattern: /\b(hola|gracias|cómo|qué|por favor|ayuda|necesito|buenos días)\b/i, confidence: 0.85 },
  { lang: 'fr', pattern: /\b(bonjour|merci|comment|quoi|aide|besoin|salut)\b/i, confidence: 0.85 },
  { lang: 'de', pattern: /\b(hallo|danke|wie|was|bitte|hilfe|brauche|guten tag)\b/i, confidence: 0.85 },
  { lang: 'pt', pattern: /\b(olá|obrigado|como|o que|ajuda|preciso|por favor)\b/i, confidence: 0.85 },
  { lang: 'it', pattern: /\b(ciao|grazie|come|cosa|aiuto|bisogno|per favore)\b/i, confidence: 0.85 },
  { lang: 'tr', pattern: /\b(merhaba|teşekkürler|lütfen|yardım|nasıl|ne)\b/i, confidence: 0.85 },
  { lang: 'pl', pattern: /\b(cześć|dziękuję|proszę|pomoc|potrzebuję|jak|co)\b/i, confidence: 0.85 },
  { lang: 'nl', pattern: /\b(hallo|dank je|alstublieft|hulp|nodig|hoe|wat)\b/i, confidence: 0.85 },
  { lang: 'vi', pattern: /\b(xin chào|cảm ơn|làm ơn|giúp|cần|như thế nào|gì)\b/i, confidence: 0.85 },
];

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
    ko: "안녕하세요! Nexus AI입니다. 공부, 글쓰기, 코딩, 수학, Nexus 기능을 도와드릴 수 있어요. 무엇이든 물어보세요!",
    tr: "Merhaba! Ben Nexus AI. Çalışma, yazma, kodlama, matematik ve Nexus özellikleri konusunda yardımcı olabilirim. Neye ihtiyacınız var?",
    pl: "Cześć! Jestem Nexus AI. Pomogę w nauce, pisaniu, kodowaniu, matematyce i funkcjach Nexus. W czym mogę pomóc?",
    nl: "Hallo! Ik ben Nexus AI. Ik kan helpen met studeren, schrijven, programmeren, wiskunde en Nexus-functies. Waar kan ik mee helpen?",
    vi: "Xin chào! Tôi là Nexus AI. Tôi có thể giúp về học tập, viết, lập trình, toán và tính năng Nexus. Bạn cần gì?",
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
    ko: "생각 중...",
    tr: "Düşünüyorum...",
    pl: "Myślę...",
    nl: "Denken...",
    vi: "Đang suy nghĩ...",
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
    ko: "죄송합니다. 오류가 발생했습니다. 다시 말씀해 주시겠어요?",
    tr: "Üzgünüm, bir hata oluştu. Tekrar ifade edebilir misiniz?",
    pl: "Przepraszam, wystąpił błąd. Czy możesz to przeformułować?",
    nl: "Sorry, er is een fout opgetreden. Kun je dat herformuleren?",
    vi: "Xin lỗi, đã có lỗi. Bạn có thể diễn đạt lại không?",
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
    ko: "다음과 같은 도움을 드릴 수 있어요:",
    tr: "Şunlarda yardımcı olabilirim:",
    pl: "Mogę pomóc w:",
    nl: "Ik kan helpen met:",
    vi: "Tôi có thể giúp về:",
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
      ko: "공부 팁과 기법",
      tr: "Çalışma ipuçları ve teknikleri",
      pl: "Wskazówki i techniki nauki",
      nl: "Studietips en -technieken",
      vi: "Mẹo và kỹ thuật học tập",
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
      ko: "글쓰기 도움",
      tr: "Yazı yazma yardımı",
      pl: "Pomoc w pisaniu",
      nl: "Hulp bij schrijven",
      vi: "Trợ giúp viết",
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
      ko: "수학 기초",
      tr: "Temel matematik",
      pl: "Podstawy matematyki",
      nl: "Wiskunde-basis",
      vi: "Toán cơ bản",
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
      ko: "코딩 기초",
      tr: "Temel programlama",
      pl: "Podstawy programowania",
      nl: "Programmeerbasics",
      vi: "Lập trình cơ bản",
    },
  },
};

/**
 * Detect language from text. Returns { detected, confidence }.
 * Auto-switches preference when non-English detected (high confidence).
 */
export const detectLanguage = (text) => {
  if (!text || !String(text).trim()) return { detected: 'en', confidence: 0 };
  const t = String(text).trim();
  for (const { lang, pattern, confidence } of LANGUAGE_PATTERNS) {
    if (pattern.test(t)) return { detected: lang, confidence };
  }
  return { detected: 'en', confidence: 0 };
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
 * Auto-detect and set language from user message.
 * Auto-switches when non-English detected with sufficient confidence.
 */
export const autoDetectLanguage = (message) => {
  const { detected, confidence } = detectLanguage(message);
  const current = getCurrentLanguage();
  if (detected !== 'en' && confidence >= 0.8 && detected !== current) {
    setLanguage(detected);
    return {
      detected,
      confidence,
      switched: true,
      message: `🌍 Detected ${SUPPORTED_LANGUAGES[detected].native}, switching language`,
    };
  }
  return { detected: detected === 'en' ? current : detected, confidence, switched: false };
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
 * Language-specific formality defaults (Japanese=0.9, Spanish=0.6, etc.)
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
    ko: { formality: 0.8, emoji: '😊🙏✨' },
    tr: { formality: 0.6, emoji: '😊👍🌟' },
    pl: { formality: 0.7, emoji: '😊👍✨' },
    nl: { formality: 0.7, emoji: '😊👌✨' },
    vi: { formality: 0.6, emoji: '😊👏✨' },
  };
  return personalities[lang] || personalities.en;
};

/**
 * RTL formatting markers for Arabic (and other RTL scripts).
 * Uses Unicode RLE (U+202B) and PDF (U+202C).
 */
export const formatForRTL = (text, lang) => {
  if (SUPPORTED_LANGUAGES[lang]?.rtl) {
    return `\u202B${text}\u202C`;
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
