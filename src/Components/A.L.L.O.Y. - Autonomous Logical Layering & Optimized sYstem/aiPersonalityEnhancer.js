/**
 * AI Personality Enhancer - Emojis, Kaomojis, and Natural Responses
 * Makes AI feel more personal, considerate, and less robotic
 */

// Extensive emoji library organized by context
const EMOJIS = {
  greetings: ['👋', '👋', '🙋‍♂️', '🙋‍♀️', '💁', '🎉', '✨'],
  positive: ['😊', '😄', '🙌', '👍', '✅', '⭐', '🌟', '💫', '🎯', '🔥'],
  thinking: ['🤔', '💭', '🧠', '💡', '🔍', '📝'],
  helping: ['🤝', '💪', '🦾', '🛠️', '⚡', '🚀'],
  learning: ['📚', '📖', '🎓', '✏️', '📝', '🧑‍🎓'],
  coding: ['💻', '⌨️', '🖥️', '🔧', '⚙️', '🛠️', '👨‍💻', '👩‍💻'],
  math: ['➕', '➖', '✖️', '➗', '🔢', '📊', '📈', '📐', '🧮'],
  music: ['🎵', '🎶', '🎧', '🎸', '🎹', '🎤', '🎼'],
  games: ['🎮', '🕹️', '🎯', '🏆', '🥇', '👾', '🎲'],
  time: ['⏰', '⏳', '⌛', '🕐', '📅', '🗓️'],
  food: ['🍕', '🍔', '🍟', '🌮', '🍜', '🍰', '🍩', '☕', '🍵'],
  celebration: ['🎉', '🎊', '🥳', '🎈', '🎆', '✨', '💫', '🌟'],
  warning: ['⚠️', '⛔', '❗', '❌', '🚫', '⚡'],
  love: ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜'],
  nature: ['🌱', '🌿', '🍃', '🌸', '🌺', '🌻', '🌼', '🌷', '🦋'],
  weather: ['☀️', '🌙', '⭐', '🌟', '⚡', '❄️', '🌈', '☁️'],
};

// Safe kaomoji library (AIs can also generate their own contextually!)
// Using only basic ASCII and safe Unicode to avoid Babel parsing issues
const KAOMOJI = {
  happy: [':)', ':D', '^_^', '(^_^)', 'ヽ(´▽`)/'],
  excited: ['\\(^o^)/', ':D', '(^O^)', '(*^▽^*)'],
  thinking: ['(-_-)', '(._. )', 'hmm...', '(・・?)'],
  confused: ['(・・)?', '(@_@)', '(? ?)'],
  love: ['<3', '(♥‿♥)', '(◕‿◕)'],
  shy: ['(,,>_<,,)', '(*ﾉωﾉ)', '(>_<)'],
  sad: ['(T_T)', '(;_;)', '(╥_╥)'],
  angry: ['(╯°□°)╯', '>:(', '(ノಠ益ಠ)ノ'],
  cool: ['(⌐■_■)', 'B)', '8-)'],
  surprised: ['(o_o)', 'O_O', '(°o°)'],
  determined: ['(ง •_•)ง', '>:)', '(•_•)7'],
  sleepy: ['(-_-) zzZ', '(=_=)', 'zzZ'],
  dancing: ['♪♪', '~(˘▾˘~)', '(~˘▾˘)~'],
  shrug: ['¯\\_(ツ)_/¯', '┐(´д`)┌', '╮(￣_￣)╭'],
};

/**
 * Select random emoji from category
 */
function randomEmoji(category) {
  const options = EMOJIS[category] || EMOJIS.positive;
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Select random kaomoji from category
 */
function randomKaomoji(category) {
  const options = KAOMOJI[category] || KAOMOJI.happy;
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Detect message sentiment/context for appropriate emojis
 */
function detectContext(message) {
  const lower = message.toLowerCase();

  if (/hello|hi |hey|greetings|good morning|good evening/.test(lower)) return 'greetings';
  if (/thank|thanks|appreciate|awesome|great|perfect|amazing/.test(lower)) return 'positive';
  if (/code|programming|javascript|python|html|css/.test(lower)) return 'coding';
  if (/math|calculate|equation|solve|algebra/.test(lower)) return 'math';
  if (/study|learn|school|homework|notes/.test(lower)) return 'learning';
  if (/music|song|playlist|spotify/.test(lower)) return 'music';
  if (/game|play|minecraft|chess/.test(lower)) return 'games';
  if (/time|clock|schedule|calendar/.test(lower)) return 'time';
  if (/love|heart|cute/.test(lower)) return 'love';
  if (/sad|depressed|down|unhappy/.test(lower)) return 'sad';
  if (/confused|don't understand|unclear/.test(lower)) return 'confused';
  if (/excited|yeah|yay|woo/.test(lower)) return 'excited';
  if (/tired|sleepy|exhausted/.test(lower)) return 'sleepy';
  if (/angry|mad|frustrated/.test(lower)) return 'angry';
  if (/help|assist|support/.test(lower)) return 'helping';
  if (/think|wonder|curious/.test(lower)) return 'thinking';
  if (/celebrate|party|congrats|achievement/.test(lower)) return 'celebration';

  return 'positive'; // default
}

/**
 * Add personality-appropriate emojis to response
 */
export function addEmojis(response, context, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  // High professionalism = fewer/no emojis
  if (personality.professionalism > 0.7) {
    return response; // Keep professional, no emojis
  }

  const emojiChance = 1 - personality.professionalism;
  const detectedContext = detectContext(context);

  let enhanced = response;

  // Add opening emoji (70% chance if not too professional)
  if (Math.random() < emojiChance * 0.7) {
    const openingEmoji = randomEmoji(detectedContext);
    enhanced = `${openingEmoji} ${enhanced}`;
  }

  // Add celebratory emoji for achievements/success
  if (/success|perfect|correct|great job|well done/.test(response.toLowerCase())) {
    enhanced += ` ${randomEmoji('celebration')}`;
  }

  // Add thinking emoji for explanations
  if (/think|consider|remember|note that/.test(response.toLowerCase())) {
    enhanced = enhanced.replace(/think|consider|remember/i, (match) => `${match} ${randomEmoji('thinking')}`);
  }

  return enhanced;
}

/**
 * Add kaomoji for extra personality (low professionalism only)
 */
export function addKaomoji(response, context, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  // Only add kaomoji if very casual (low professionalism)
  if (personality.professionalism > 0.4) {
    return response;
  }

  const detectedContext = detectContext(context);

  // Map context to kaomoji category
  const kaomojiMap = {
    greetings: 'happy',
    positive: 'happy',
    celebration: 'excited',
    confused: 'confused',
    thinking: 'thinking',
    sad: 'sad',
    angry: 'angry',
    love: 'love',
    sleepy: 'sleepy',
    excited: 'excited',
  };

  const kaomojiCategory = kaomojiMap[detectedContext] || 'happy';

  // 40% chance to add kaomoji at the end
  if (Math.random() < 0.4) {
    return `${response} ${randomKaomoji(kaomojiCategory)}`;
  }

  return response;
}

/**
 * Make response more natural and conversational
 */
export function makeNatural(response, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  let natural = response;

  // Replace formal language with casual alternatives (if low professionalism)
  if (personality.professionalism < 0.4) {
    natural = natural
      .replace(/Therefore,/g, 'So,')
      .replace(/However,/g, 'But,')
      .replace(/Additionally,/g, 'Also,')
      .replace(/Furthermore,/g, 'Plus,')
      .replace(/In conclusion,/g, 'Bottom line:')
      .replace(/It is recommended/g, 'I\'d say')
      .replace(/You should consider/g, 'You might wanna')
      .replace(/I would suggest/g, 'I\'d say try')
      .replace(/Please note/g, 'Just FYI')
      .replace(/Kindly/g, 'Just')
      .replace(/Utilize/g, 'Use')
      .replace(/Commence/g, 'Start')
      .replace(/Terminate/g, 'Stop');
  }

  // Add conversational fillers (if very casual)
  if (personality.professionalism < 0.3 && Math.random() < 0.3) {
    const fillers = ['You know, ', 'So like, ', 'Honestly, ', 'I mean, ', 'Real talk, ', 'No cap, '];
    if (!natural.match(/^(You know|So like|Honestly|I mean|Real talk|No cap)/)) {
      natural = fillers[Math.floor(Math.random() * fillers.length)] + natural;
    }
  }

  return natural;
}

/**
 * Add encouraging/supportive language (if high mentorship)
 */
export function addEncouragement(response, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  if (personality.mentorship < 0.6) {
    return response;
  }

  const encouragements = [
    'You\'ve got this! 💪',
    'You\'re doing great!',
    'Keep up the good work!',
    'I believe in you!',
    'You\'re on the right track!',
    'Great question!',
    'Smart thinking!',
  ];

  // 50% chance to add encouragement
  if (Math.random() < 0.5) {
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `${response}\n\n${encouragement}`;
  }

  return response;
}

/**
 * Full personality enhancement pipeline
 */
export function enhanceWithPersonality(response, userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  let enhanced = response;

  // Make more natural
  enhanced = makeNatural(enhanced, personality);

  // Add emojis
  enhanced = addEmojis(enhanced, userMessage, personality);

  // Add kaomoji (if very casual)
  enhanced = addKaomoji(enhanced, userMessage, personality);

  // Add encouragement (if high mentorship)
  enhanced = addEncouragement(enhanced, personality);

  return enhanced;
}

/**
 * Generate personalized greeting based on time of day and personality
 */
export function getPersonalizedGreeting(userName = null, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  const hour = new Date().getHours();
  const name = userName || 'there';

  let greeting = '';
  let timeEmoji = '';

  if (hour < 5) {
    greeting = `Working late, ${name}?`;
    timeEmoji = '🌙';
  } else if (hour < 12) {
    greeting = `Good morning, ${name}!`;
    timeEmoji = '☀️';
  } else if (hour < 17) {
    greeting = `Good afternoon, ${name}!`;
    timeEmoji = '🌤️';
  } else if (hour < 21) {
    greeting = `Good evening, ${name}!`;
    timeEmoji = '🌆';
  } else {
    greeting = `Still going strong, ${name}?`;
    timeEmoji = '🌙';
  }

  if (personality.professionalism < 0.4) {
    const casual = [`Hey ${name}! `, `Yo ${name}! `, `What's up ${name}? `, `Hey hey ${name}! `];
    greeting = casual[Math.floor(Math.random() * casual.length)] + randomKaomoji('happy');
  } else {
    greeting = `${timeEmoji} ${greeting}`;
  }

  const intro = personality.professionalism > 0.6 ? "I'm here to help." : "What can I do for ya?";

  return `${greeting} ${intro}`;
}

export default {
  randomEmoji,
  randomKaomoji,
  addEmojis,
  addKaomoji,
  makeNatural,
  addEncouragement,
  enhanceWithPersonality,
  getPersonalizedGreeting,
  detectContext,
};
