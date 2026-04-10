/**
 * I.R.I.S. Source Ranking System
 * ==============================
 * Rank and trust-score information sources
 */

import {storage} from '../Storage/clientStorage.js';

export const SOURCE_TYPES = {
  WEB: 'web',
  ACADEMIC: 'academic',
  OFFICIAL: 'official',
  USER: 'user',
  AI: 'ai',
  DOCUMENT: 'document',
};

export const TRUST_LEVELS = {
  HIGHLY_TRUSTED: 5,
  TRUSTED: 4,
  NEUTRAL: 3,
  QUESTIONABLE: 2,
  UNTRUSTED: 1,
};

/**
 * Calculate source trust score
 */
export function calculateTrustScore(source) {
  let score = TRUST_LEVELS.NEUTRAL;

  // Type-based scoring
  switch (source.type) {
    case SOURCE_TYPES.OFFICIAL:
      score += 2;
      break;
    case SOURCE_TYPES.ACADEMIC:
      score += 1.5;
      break;
    case SOURCE_TYPES.WEB:
      score += 0.5;
      break;
  }

  // Recency scoring
  if (source.timestamp) {
    const days = (Date.now() - source.timestamp) / (1000 * 60 * 60 * 24);
    if (days < 7) score += 1;
    else if (days < 30) score += 0.5;
    else if (days > 365) score -= 0.5;
  }

  // Author credentials
  if (source.authorCredentials) {
    score += 0.5;
  }

  // Clamp between 1 and 5
  return Math.max(1, Math.min(5, score));
}

/**
 * Rank sources
 */
export function rankSources(sources) {
  const ranked = sources.map((source) => ({
    ...source,
    trustScore: calculateTrustScore(source),
  }));

  return ranked.sort((a, b) => b.trustScore - a.trustScore);
}

/**
 * Get recommended sources (top tier)
 */
export function getRecommendedSources(sources, minimumTrust = TRUST_LEVELS.TRUSTED) {
  return rankSources(sources).filter((s) => s.trustScore >= minimumTrust);
}

/**
 * Create source profile
 */
export async function createSourceProfile(url, options = {}) {
  try {
    const profile = {
      id: generateId(),
      url,
      type: options.type || SOURCE_TYPES.WEB,
      title: options.title || url,
      trustScore: options.trustScore || TRUST_LEVELS.NEUTRAL,
      authorCredentials: options.authorCredentials || false,
      verified: options.verified === true,
      tags: options.tags || [],
      created: Date.now(),
      uses: 0,
      lastUsed: null,
    };

    const settings = await storage.loadSettings();
    if (!settings.sourceProfiles) {
      settings.sourceProfiles = [];
    }

    // Check for duplicates
    if (!settings.sourceProfiles.find((p) => p.url === url)) {
      settings.sourceProfiles.push(profile);
      await storage.saveSettings(settings);
    }

    return {success: true, profileId: profile.id};
  } catch (error) {
    console.error('Error creating source profile:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get source profile
 */
export async function getSourceProfile(url) {
  try {
    const settings = await storage.loadSettings();
    const profiles = settings?.sourceProfiles || [];

    return profiles.find((p) => p.url === url) || null;
  } catch (error) {
    console.error('Error getting source profile:', error);
    return null;
  }
}

/**
 * Update trust score for source
 */
export async function updateSourceTrust(url, trustScore) {
  try {
    const settings = await storage.loadSettings();
    const profiles = settings?.sourceProfiles || [];

    const profile = profiles.find((p) => p.url === url);
    if (!profile) {
      return {success: false, error: 'Profile not found'};
    }

    profile.trustScore = Math.max(1, Math.min(5, trustScore));
    profile.updated = Date.now();

    await storage.saveSettings(settings);

    return {success: true, trustScore: profile.trustScore};
  } catch (error) {
    console.error('Error updating trust score:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Record source usage
 */
export async function recordSourceUsage(url) {
  try {
    const settings = await storage.loadSettings();
    const profiles = settings?.sourceProfiles || [];

    const profile = profiles.find((p) => p.url === url);
    if (profile) {
      profile.uses = (profile.uses || 0) + 1;
      profile.lastUsed = Date.now();
      await storage.saveSettings(settings);
    }

    return {success: true};
  } catch (error) {
    console.error('Error recording source usage:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get source statistics
 */
export async function getSourceStats() {
  try {
    const settings = await storage.loadSettings();
    const profiles = settings?.sourceProfiles || [];

    const stats = {
      totalSources: profiles.length,
      averageTrust: profiles.length > 0 ?
        profiles.reduce((sum, p) => sum + p.trustScore, 0) / profiles.length : 0,
      mostUsed: profiles.reduce((prev, current) =>
        (prev.uses || 0) > (current.uses || 0) ? prev : current
      ),
      byType: {},
    };

    for (const profile of profiles) {
      stats.byType[profile.type] = (stats.byType[profile.type] || 0) + 1;
    }

    return stats;
  } catch (error) {
    console.error('Error getting source stats:', error);
    return {totalSources: 0};
  }
}

function generateId() {
  return `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
