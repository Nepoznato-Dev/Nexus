/**
 * I.R.I.S Autonomous Search System
 * Intelligent Research & Information System
 * 
 * Allows I.R.I.S to independently search for information when needed
 */

import { storage } from '../Storage/clientStorage.js';

// Search cache to avoid redundant searches
const searchCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Determine if I.R.I.S needs to search for information
 */
export function needsExternalSearch(query) {
  const searchIndicators = [
    // Current events & news
    /today|tomorrow|yesterday|this week|latest|recent|current|news/i,
    /what('s| is) (happening|going on|new)/i,
    
    // Real-time data
    /weather|temperature|forecast/i,
    /stock|price|market|trading/i,
    /time in|timezone|what time/i,
    
    // Specific factual queries
    /when (did|was|is)|what year|what date/i,
    /who (is|was|are|invented|created|founded)/i,
    /where (is|was|can i find)/i,
    /how many|how much|statistics|data on/i,
    
    // Technical/specialized topics
    /latest version of|current version/i,
    /documentation for|api for|tutorial/i,
    /research on|studies about|papers on/i,
    
    // Specific searches
    /search (for|up)|look up|find (me|information)/i,
    /tell me about (?!nexus|settings|features)/i, // about external topics only
  ];
  
  return searchIndicators.some(pattern => pattern.test(query));
}

/**
 * Extract search query from user's message
 */
export function extractSearchQuery(message) {
  // Remove search commands
  let query = message
    .replace(/^(search for|look up|find|tell me about|what is|who is|when was|where is)\s+/i, '')
    .replace(/\?$/, '')
    .trim();
  
  return query;
}

/**
 * Perform web search using multiple search engines
 */
export async function performWebSearch(query, options = {}) {
  const cacheKey = `search:${query.toLowerCase()}`;
  
  // Check cache first
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[I.R.I.S] Using cached search results for:', query);
      return cached.data;
    }
  }
  
  console.log('[I.R.I.S] Searching for:', query);
  
  try {
    // Try multiple search strategies
    const results = await Promise.race([
      searchWikipedia(query),
      searchDuckDuckGo(query),
      searchSerpAPI(query, options.apiKey),
    ].filter(Boolean));
    
    // Cache results
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });
    
    return results;
  } catch (error) {
    console.error('[I.R.I.S] Search failed:', error);
    return {
      success: false,
      error: error.message,
      suggestion: 'I can still help with what I know! Would you like me to explain based on my training?'
    };
  }
}

/**
 * Search Wikipedia API (free, no key needed)
 */
async function searchWikipedia(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Wikipedia search failed');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      source: 'Wikipedia',
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
      thumbnail: data.thumbnail?.source,
      timestamp: Date.now()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Search using DuckDuckGo Instant Answer API (free)
 */
async function searchDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('DuckDuckGo search failed');
    }
    
    const data = await response.json();
    
    // DuckDuckGo returns different response types
    const summary = data.AbstractText || data.Answer || data.Definition || '';
    
    if (!summary) {
      // Try related topics
      const relatedTopics = data.RelatedTopics?.[0];
      if (relatedTopics?.Text) {
        return {
          success: true,
          source: 'DuckDuckGo',
          title: relatedTopics.FirstURL ? 'Related Information' : query,
          summary: relatedTopics.Text,
          url: relatedTopics.FirstURL,
          timestamp: Date.now()
        };
      }
      
      return null;
    }
    
    return {
      success: true,
      source: 'DuckDuckGo',
      title: data.Heading || query,
      summary: summary,
      url: data.AbstractURL,
      image: data.Image,
      timestamp: Date.now()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Search using SerpAPI (requires API key, most reliable)
 */
async function searchSerpAPI(query, apiKey) {
  if (!apiKey) return null;
  
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=3`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('SerpAPI search failed');
    }
    
    const data = await response.json();
    
    // Extract answer box or knowledge graph
    const answer = data.answer_box?.answer || data.answer_box?.snippet;
    const knowledge = data.knowledge_graph?.description;
    
    return {
      success: true,
      source: 'Google (SerpAPI)',
      title: data.knowledge_graph?.title || data.answer_box?.title || query,
      summary: answer || knowledge || data.organic_results?.[0]?.snippet || '',
      url: data.knowledge_graph?.source?.link || data.organic_results?.[0]?.link,
      image: data.knowledge_graph?.image,
      results: data.organic_results?.slice(0, 3).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet
      })),
      timestamp: Date.now()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get weather information (example of specialized search)
 */
export async function getWeatherInfo(location) {
  try {
    // Using wttr.in - free weather API
    const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }
    
    const data = await response.json();
    const current = data.current_condition[0];
    
    return {
      success: true,
      location: data.nearest_area[0].areaName[0].value,
      temperature: `${current.temp_C}°C / ${current.temp_F}°F`,
      condition: current.weatherDesc[0].value,
      humidity: `${current.humidity}%`,
      feelsLike: `${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F`,
      windSpeed: `${current.windspeedKmph} km/h`,
      timestamp: Date.now()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current time in different timezones
 */
export async function getTimeInfo(timezone) {
  try {
    const response = await fetch(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`);
    
    if (!response.ok) {
      throw new Error('Time fetch failed');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      timezone: data.timezone,
      datetime: new Date(data.datetime).toLocaleString(),
      utcOffset: data.utc_offset,
      timestamp: Date.now()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Format search results for I.R.I.S response
 */
export function formatSearchResults(results, personality = 'adaptive') {
  if (!results || !results.success) {
    const fallbacks = {
      adaptive: "Hmm, I couldn't find current info on that, but I can explain what I know!",
      kind: "Oh no, I had trouble searching! 😊 But don't worry, let me share what I know!",
      moody: "Ugh, search failed. Whatever, I'll tell you what I remember.",
      professional: "Search temporarily unavailable. Providing cached knowledge.",
      mentor: "I encountered a search limitation, but let me share my foundational knowledge with you!",
      chill: "Search didn't work rn, but I got you with what I know! 😎"
    };
    
    return fallbacks[personality] || fallbacks.adaptive;
  }
  
  const { title, summary, url, source } = results;
  
  const responses = {
    adaptive: `I found this: **${title}**\n\n${summary}\n\n${url ? `🔗 [Read more](${url})` : ''}\n\n*Source: ${source}*`,
    kind: `Great news! I found something helpful! 📚\n\n**${title}**\n\n${summary}\n\n${url ? `Want to learn more? Check this out: ${url}` : ''}\n\n*Found via ${source}*`,
    moody: `Fine, here's what I dug up:\n\n**${title}**\n\n${summary}\n\n${url ? `If you really need more: ${url}` : ''}\n\n*${source}, you're welcome.*`,
    professional: `**Research Results:**\n\n**${title}**\n\n${summary}\n\n${url ? `Reference: ${url}` : ''}\n\n*Source: ${source}*`,
    mentor: `Excellent question! Here's what I discovered:\n\n**${title}**\n\n${summary}\n\nThis is important because it provides current, verified information. ${url ? `For deeper study, explore: ${url}` : ''}\n\n*Researched via ${source}*`,
    chill: `Check it, found this:\n\n**${title}**\n\n${summary}\n\n${url ? `More deets: ${url}` : ''}\n\n*Via ${source}* ✌️`
  };
  
  return responses[personality] || responses.adaptive;
}

/**
 * Enhanced AI response with autonomous search
 */
export async function generateSearchEnhancedResponse(query, personality = 'adaptive', apiKey = null) {
  // Check if search is needed
  if (!needsExternalSearch(query)) {
    return null; // Use standard AI response
  }
  
  // Extract what to search for
  const searchQuery = extractSearchQuery(query);
  
  // Perform autonomous search
  const searchResults = await performWebSearch(searchQuery, { apiKey });
  
  // Format response with search results
  return formatSearchResults(searchResults, personality);
}

/**
 * Clear old cache entries (run periodically)
 */
export function cleanSearchCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      searchCache.delete(key);
    }
  }
}

// Clean cache every 10 minutes
setInterval(cleanSearchCache, 10 * 60 * 1000);

export default {
  needsExternalSearch,
  performWebSearch,
  getWeatherInfo,
  getTimeInfo,
  formatSearchResults,
  generateSearchEnhancedResponse
};
