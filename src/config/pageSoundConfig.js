// Page Background Music Configuration
// Maps each page/component to its actual sounds from the Sounds folder

const pageSoundConfig = {
  // Splash Screens & Loading
  'loading': {
    url: '/Sounds/Windows/Windows-95/startup.mp3',
    volume: 0.3,
    loop: true,
    fadeIn: 1000,
    fadeOut: 500,
    description: 'Windows 95 startup sound'
  },

  // Main Pages
  'dashboard': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'landing': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Utilities & Tools
  'calculator': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'whiteboard': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'unit-converter': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Gaming
  'games': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'minecraft': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Study & Learning
  'study-tools': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'flashcards': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'pomodoro': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Settings & Admin
  'settings': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'admin-dashboard': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Media & Entertainment
  'music': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'videos': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'browser': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Backgrounds & Aesthetic
  'backgrounds': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Social & Auth
  'auth': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  'social': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // OS Sounds
  'windows-sounds': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No music configured'
  },

  // Silence/No Music
  'none': {
    url: null,
    volume: 0,
    loop: false,
    fadeIn: 0,
    fadeOut: 0,
    description: 'No background music'
  }
};

export default pageSoundConfig;
