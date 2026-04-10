/**
 * irisCrashAnalyzer.js - IRIS Crash Log Analyzer
 * Heuristically parses Minecraft crash logs and suggests fixes.
 */

const MOD_ID_PATTERNS = [
  /Mod ID:\s*([a-zA-Z0-9_-]+)/i,
  /Mod File:\s*.*?\\([a-zA-Z0-9_-]+)-[0-9].*?\.jar/i,
  /modid\s*=\s*([a-zA-Z0-9_-]+)/i,
  /--\s*([a-zA-Z0-9_-]+)\s*--/i
];

const ERROR_SIGNATURES = [
  { pattern: /NoClassDefFoundError|ClassNotFoundException/i, type: 'missing_dependency', suggestion: 'Missing dependency or wrong loader version.' },
  { pattern: /MixinApplyError|MixinTransformerError/i, type: 'mixin_conflict', suggestion: 'Mod conflict or incompatible versions.' },
  { pattern: /OutOfMemoryError|Java heap space/i, type: 'out_of_memory', suggestion: 'Increase RAM or remove heavy mods.' },
  { pattern: /DuplicateMod/i, type: 'duplicate_mod', suggestion: 'Remove duplicate mods or older versions.' },
  { pattern: /ModResolutionException|Failed to resolve mod/i, type: 'mod_resolution', suggestion: 'One or more required mods are missing.' },
  { pattern: /Incompatible mod set|IncompatibleClassChangeError/i, type: 'incompatible_mods', suggestion: 'Update or remove incompatible mods.' },
  { pattern: /InvalidModException|Invalid or corrupted mod file/i, type: 'corrupt_mod', suggestion: 'Re-download the mod file.' }
];

const LOADER_HINTS = [
  { pattern: /Fabric Loader|fabric/i, loader: 'fabric' },
  { pattern: /Forge Mod Loader|forge/i, loader: 'forge' },
  { pattern: /Quilt Loader|quilt/i, loader: 'quilt' }
];

function extractModIds(text) {
  const found = new Set();
  MOD_ID_PATTERNS.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) found.add(match[1]);
    }
  });

  // Also pull common mod ids from stack trace lines
  const jarMatches = text.matchAll(/([a-zA-Z0-9_-]+)\.[a-zA-Z0-9_.-]+\(.*?\.jar\)/g);
  for (const match of jarMatches) {
    if (match[1]) found.add(match[1]);
  }

  return Array.from(found);
}

function detectErrorSignatures(text) {
  const results = [];
  ERROR_SIGNATURES.forEach((signature) => {
    if (signature.pattern.test(text)) {
      results.push(signature);
    }
  });
  return results;
}

function detectLoader(text) {
  for (const hint of LOADER_HINTS) {
    if (hint.pattern.test(text)) return hint.loader;
  }
  return 'unknown';
}

export function analyzeCrashLog(logText = '') {
  if (!logText.trim()) {
    return {
      summary: 'No crash log provided.',
      errorType: 'unknown',
      loader: 'unknown',
      suspectedMods: [],
      suggestions: ['Paste a full crash log to get analysis.']
    };
  }

  const loader = detectLoader(logText);
  const suspectedMods = extractModIds(logText);
  const signatures = detectErrorSignatures(logText);

  const errorType = signatures[0]?.type || 'unknown';
  const suggestions = signatures.length
    ? signatures.map((sig) => sig.suggestion)
    : ['Check the last 20 lines for the failing mod.'];

  if (loader !== 'unknown') {
    suggestions.push(`Verify you are using the correct ${loader} loader version.`);
  }

  if (suspectedMods.length > 0) {
    suggestions.push(`Temporarily remove: ${suspectedMods.slice(0, 5).join(', ')}.`);
  }

  return {
    summary: signatures.length
      ? `Detected ${signatures.map((s) => s.type).join(', ')}.`
      : 'No known signature detected. Manual review recommended.',
    errorType,
    loader,
    suspectedMods,
    suggestions: Array.from(new Set(suggestions))
  };
}

export default { analyzeCrashLog };
