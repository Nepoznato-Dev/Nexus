/**
 * IRIS Report Classifier
 * Classifies user submissions as: bug, complaint, feature, feedback, junk
 */

const KEYWORDS = {
  bug: [
    'bug', 'error', 'crash', 'freeze', 'stuck', 'broken', 'glitch', 'lag',
    'not working', 'doesn\'t work', 'won\'t load', 'failed', 'issue', 'problem'
  ],
  complaint: [
    'hate', 'annoying', 'frustrating', 'terrible', 'awful', 'slow', 'bad',
    'useless', 'stupid', 'trash', 'worst', 'unhappy'
  ],
  feature: [
    'feature', 'add', 'request', 'please add', 'would be nice', 'suggest',
    'idea', 'wish', 'could you', 'should have'
  ],
  feedback: [
    'feedback', 'love', 'like', 'nice', 'great', 'awesome', 'good', 'thanks'
  ]
};

const JUNK_PATTERNS = [
  /^[\W_]+$/i, // only symbols
  /(.)\1{6,}/i, // repeated chars
  /^[a-z]{1,2}$/i // too short
];

const MIN_LENGTH = 12;

export function classifyReport(text = '') {
  const normalized = String(text).trim();
  if (!normalized) {
    return { type: 'junk', confidence: 0.95, reasons: ['empty'] };
  }

  if (normalized.length < MIN_LENGTH) {
    return { type: 'junk', confidence: 0.8, reasons: ['too short'] };
  }

  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(normalized)) {
      return { type: 'junk', confidence: 0.9, reasons: ['pattern junk'] };
    }
  }

  const lower = normalized.toLowerCase();
  const scores = {
    bug: 0,
    complaint: 0,
    feature: 0,
    feedback: 0
  };

  for (const [type, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      if (lower.includes(w)) scores[type] += 1;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = sorted[0];

  if (topScore === 0) {
    return { type: 'review', confidence: 0.4, reasons: ['no keywords'] };
  }

  const confidence = Math.min(0.9, 0.5 + topScore * 0.15);
  return { type: topType, confidence, reasons: ['keyword match'] };
}

export function isReportLikelyValid(classification) {
  return ['bug', 'complaint', 'feature', 'feedback'].includes(classification.type)
    && classification.confidence >= 0.55;
}
