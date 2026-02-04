/**
 * modAPIHandler.js - Minecraft Mod Discovery & Download Handler
 * 
 * Interfaces with Modrinth and CurseForge APIs to:
 * - Search for mods
 * - Get mod details (dependencies, versions, descriptions)
 * - Download mod files to user-selected location
 * - Resolve dependencies automatically
 * - Validate file integrity via checksums
 * 
 * No external dependencies required (uses native fetch)
 */

class ModAPIHandler {
  constructor() {
    this.modrinthBase = 'https://api.modrinth.com/v2';
    this.curseforgeBase = 'https://api.curseforge.com/v1';
    this.curseforgeKey = process.env.REACT_APP_CURSEFORGE_API_KEY || null;
    
    // Rate limiting (Modrinth: 600/min, CurseForge: depends on tier)
    this.requestQueue = [];
    this.isProcessing = false;
    
    // Cache popular mods/versions to reduce API calls
    this.cache = {
      mods: {},
      versions: {},
      timestamp: {}
    };
    this.cacheTTL = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Search for mods across both platforms
   * @param {string} query - Search term (e.g., "Sodium")
   * @param {string} minecraftVersion - Game version (e.g., "1.20.1")
   * @param {string} loader - Mod loader filter (fabric, forge, quilt, null for all)
   * @returns {Promise<Array>} Combined results from both APIs
   */
  async searchMods(query, minecraftVersion = '1.20.1', loader = null) {
    try {
      const [modrinthResults, curseforgeResults] = await Promise.all([
        this._searchModrinth(query, minecraftVersion, loader),
        this._searchCurseForge(query, minecraftVersion, loader)
      ]);

      // Combine and deduplicate (by name similarity)
      const combined = [...modrinthResults, ...curseforgeResults];
      return this._deduplicateResults(combined);
    } catch (error) {
      console.error('Mod search failed:', error);
      return [];
    }
  }

  /**
   * Search Modrinth API
   * @private
   */
  async _searchModrinth(query, minecraftVersion, loader) {
    try {
      const params = new URLSearchParams({
        query,
        index: 'relevance',
        limit: 15,
        filters: this._buildModrinthFilters(minecraftVersion, loader)
      });

      const response = await fetch(
        `${this.modrinthBase}/search?${params}`,
        { headers: { 'User-Agent': 'Nexus-ModManager/1.0' } }
      );

      if (!response.ok) throw new Error(`Modrinth API error: ${response.status}`);
      
      const data = await response.json();
      return data.hits.map(hit => ({
        id: hit.project_id,
        name: hit.title,
        description: hit.description,
        author: hit.author,
        downloads: hit.downloads,
        rating: hit.host === 'modrinth' ? (hit.follows / 1000).toFixed(1) : 0,
        source: 'modrinth',
        icon: hit.icon_url,
        versions: hit.versions || [],
        url: `${this.modrinthBase}/project/${hit.project_id}`
      }));
    } catch (error) {
      console.error('Modrinth search error:', error);
      return [];
    }
  }

  /**
   * Search CurseForge API
   * @private
   */
  async _searchCurseForge(query, minecraftVersion, loader) {
    if (!this.curseforgeKey) {
      console.warn('CurseForge API key not configured, skipping CurseForge results');
      return [];
    }

    try {
      const classId = 6; // 6 = Mods
      const gameVersionId = this._getGameVersionId(minecraftVersion);
      
      const response = await fetch(
        `${this.curseforgeBase}/mods/search?gameId=432&classId=${classId}&gameVersion=${gameVersionId}&searchFilter=${query}&index=popularity&pageSize=15`,
        { headers: { 'x-api-key': this.curseforgeKey } }
      );

      if (!response.ok) throw new Error(`CurseForge API error: ${response.status}`);
      
      const data = await response.json();
      return (data.data || []).map(mod => ({
        id: mod.id,
        name: mod.name,
        description: mod.summary,
        author: mod.authors?.[0]?.name || 'Unknown',
        downloads: mod.downloadCount,
        rating: mod.rating?.toFixed(1) || 0,
        source: 'curseforge',
        icon: mod.logo?.url,
        versions: mod.latestFiles?.map(f => f.gameVersion) || [],
        url: mod.websiteUrl
      }));
    } catch (error) {
      console.error('CurseForge search error:', error);
      return [];
    }
  }

  /**
   * Get detailed mod information including dependencies
   */
  async getModDetails(modId, source = 'modrinth') {
    try {
      if (source === 'modrinth') {
        return await this._getModrinthDetails(modId);
      } else if (source === 'curseforge') {
        return await this._getCurseForgeDetails(modId);
      }
    } catch (error) {
      console.error(`Failed to get ${source} mod details:`, error);
      return null;
    }
  }

  /**
   * Get detailed version info for a specific mod version
   * @param {string} modId
   * @param {string} versionId
   * @param {string} source
   * @returns {Promise<Object|null>}
   */
  async getVersionDetails(modId, versionId, source = 'modrinth') {
    try {
      if (source === 'modrinth') {
        const response = await fetch(`${this.modrinthBase}/version/${versionId}`);
        if (!response.ok) throw new Error('Failed to fetch Modrinth version');
        return await response.json();
      }

      if (source === 'curseforge') {
        if (!this.curseforgeKey) return null;
        const response = await fetch(
          `${this.curseforgeBase}/mods/${modId}/files/${versionId}`,
          { headers: { 'x-api-key': this.curseforgeKey } }
        );
        if (!response.ok) throw new Error('Failed to fetch CurseForge version');
        const { data } = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Failed to get version details:', error);
      return null;
    }

    return null;
  }

  /**
   * Get Modrinth mod details
   * @private
   */
  async _getModrinthDetails(modId) {
    const cacheKey = `modrinth-${modId}`;
    if (this._isCacheValid(cacheKey)) {
      return this.cache.mods[cacheKey];
    }

    const response = await fetch(`${this.modrinthBase}/project/${modId}`);
    if (!response.ok) throw new Error('Failed to fetch Modrinth details');

    const project = await response.json();
    
    // Get versions and dependencies
    const versions = await fetch(`${this.modrinthBase}/project/${modId}/versions`)
      .then(r => r.json());

    const details = {
      id: project.id,
      name: project.title,
      description: project.description,
      body: project.body,
      author: project.team?.[0]?.user?.username || 'Unknown',
      downloads: project.downloads,
      icon: project.icon_url,
      repo: project.source_url,
      issues: project.issue_tracker_url,
      wiki: project.wiki_url,
      versions: versions.map(v => ({
        id: v.id,
        name: v.version_number,
        minecraftVersions: v.game_versions,
        loaders: v.loaders,
        releaseType: v.release_channel,
        date: v.date_published,
        files: v.files.map(f => ({
          id: f.id,
          name: f.filename,
          size: f.size,
          url: f.url,
          hashes: f.hashes,
          primary: f.primary
        })),
        dependencies: v.dependencies.map(d => ({
          projectId: d.project_id,
          versionId: d.version_id,
          type: d.dependency_type // required, optional, incompatible, embedded
        }))
      }))
    };

    this.cache.mods[cacheKey] = details;
    this.cache.timestamp[cacheKey] = Date.now();
    return details;
  }

  /**
   * Get CurseForge mod details
   * @private
   */
  async _getCurseForgeDetails(modId) {
    if (!this.curseforgeKey) return null;

    const cacheKey = `curseforge-${modId}`;
    if (this._isCacheValid(cacheKey)) {
      return this.cache.mods[cacheKey];
    }

    const response = await fetch(
      `${this.curseforgeBase}/mods/${modId}`,
      { headers: { 'x-api-key': this.curseforgeKey } }
    );
    if (!response.ok) throw new Error('Failed to fetch CurseForge details');

    const { data: mod } = await response.json();

    // Get all files (versions)
    const filesResponse = await fetch(
      `${this.curseforgeBase}/mods/${modId}/files`,
      { headers: { 'x-api-key': this.curseforgeKey } }
    );
    const { data: files } = await filesResponse.json();

    const details = {
      id: mod.id,
      name: mod.name,
      description: mod.summary,
      body: mod.description,
      author: mod.authors?.[0]?.name || 'Unknown',
      downloads: mod.downloadCount,
      icon: mod.logo?.url,
      url: mod.websiteUrl,
      versions: files
        .sort((a, b) => new Date(b.fileDate) - new Date(a.fileDate))
        .slice(0, 20)
        .map(f => ({
          id: f.id,
          name: f.displayName,
          minecraftVersions: f.gameVersions,
          releaseType: f.releaseType,
          date: f.fileDate,
          files: [{
            id: f.id,
            name: f.fileName,
            size: f.fileLength,
            url: f.downloadUrl
          }],
          dependencies: f.dependencies.map(d => ({
            modId: d.modId,
            type: d.relationType // 1=requires, 2=optional, 3=incompatible, 4=include
          }))
        }))
    };

    this.cache.mods[cacheKey] = details;
    this.cache.timestamp[cacheKey] = Date.now();
    return details;
  }

  /**
   * Download a mod file to user-selected folder
   * @param {string} fileUrl - Direct download URL
   * @param {string} fileName - File name to save
   * @param {Function} onProgress - Callback with {loaded, total} for progress tracking
   * @returns {Promise<{success, message, path}>}
   */
  async downloadMod(fileUrl, fileName, onProgress = null) {
    try {
      // Fetch the file
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const contentLength = parseInt(response.headers.get('content-length'), 10);
      let loaded = 0;

      // Stream to file (using Blob for browser compatibility)
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress) {
          onProgress({
            loaded,
            total: contentLength,
            percent: Math.round((loaded / contentLength) * 100)
          });
        }
      }

      const blob = new Blob(chunks, { type: 'application/java-archive' });

      // Return blob + instructions (browser can't auto-save to custom folders)
      // User will need to handle actual save via file picker
      return {
        success: true,
        blob,
        fileName,
        size: blob.size,
        message: 'File ready to download. Click "Save to Folder" to choose location.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Download failed: ${error.message}`,
        error
      };
    }
  }

  /**
   * Download a mod file into the local server cache for injection workflows
   * @param {string} fileUrl - Direct download URL
   * @param {string} fileName - File name to save
   * @returns {Promise<{success, message, filePath, publicUrl, fileName, size}>}
   */
  async downloadModToCache(fileUrl, fileName) {
    try {
      const response = await fetch('/api/mods/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, fileName })
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Server cache unavailable (${response.status})`
        };
      }

      const data = await response.json();
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Server cache download failed'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: `Server cache download failed: ${error.message}`
      };
    }
  }

  /**
   * Resolve all dependencies for a mod
   * @param {Object} mod - Mod details from getModDetails
   * @param {string} versionId - Specific version to resolve for
   * @returns {Promise<Array>} Array of dependency mods
   */
  async resolveDependencies(mod, versionId) {
    try {
      const version = mod.versions.find(v => v.id === versionId);
      if (!version || !version.dependencies) return [];

      const dependencies = [];

      for (const dep of version.dependencies) {
        if (dep.type === 'required' || dep.type === 1) { // required dependencies
          let depDetails;

          if (mod.source === 'modrinth') {
            depDetails = await this._getModrinthDetails(dep.projectId);
          } else {
            depDetails = await this._getCurseForgeDetails(dep.modId);
          }

          dependencies.push({
            ...depDetails,
            type: dep.type,
            required: true
          });
        }
      }

      return dependencies;
    } catch (error) {
      console.error('Dependency resolution failed:', error);
      return [];
    }
  }

  /**
   * Validate file integrity via checksum
   * @param {Blob} blob - File blob
   * @param {Object} expectedHashes - Expected hashes {sha1, sha512}
   * @returns {Promise<boolean>}
   */
  async validateChecksum(blob, expectedHashes) {
    try {
      if (!expectedHashes) return true; // No hash provided

      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Compare with available hashes (try any provided format)
      return Object.values(expectedHashes).some(expected => 
        hashHex.toLowerCase() === expected.toLowerCase()
      );
    } catch (error) {
      console.error('Checksum validation error:', error);
      return false; // Fail open if validation fails
    }
  }

  /**
   * Get compatible loaders for a Minecraft version
   * @param {string} minecraftVersion
   * @returns {Promise<Array>} Array of loader names (fabric, forge, quilt)
   */
  async getCompatibleLoaders(minecraftVersion) {
    try {
      const response = await fetch(`${this.modrinthBase}/game_versions`);
      const versions = await response.json();
      
      const versionData = versions.find(v => v.version === minecraftVersion);
      if (!versionData) return ['fabric', 'forge', 'quilt'];

      return versionData.loaders || ['fabric', 'forge'];
    } catch (error) {
      console.error('Failed to get loaders:', error);
      return ['fabric', 'forge', 'quilt'];
    }
  }

  /**
   * Helper: Deduplicate results by fuzzy name matching
   * @private
   */
  _deduplicateResults(results) {
    const seen = new Map();
    const deduplicated = [];

    for (const result of results) {
      // Use name similarity as key (first 3 words)
      const key = result.name.split(' ').slice(0, 3).join(' ').toLowerCase();
      
      if (!seen.has(key)) {
        seen.set(key, result);
        deduplicated.push(result);
      }
    }

    return deduplicated;
  }

  /**
   * Helper: Build Modrinth filter string
   * @private
   */
  _buildModrinthFilters(minecraftVersion, loader) {
    const filters = [
      `versions:"${minecraftVersion}"`
    ];

    if (loader) {
      filters.push(`loaders:"${loader}"`);
    }

    return filters.join(' AND ');
  }

  /**
   * Helper: Get CurseForge game version ID
   * @private
   */
  _getGameVersionId(minecraftVersion) {
    // CurseForge uses numeric IDs for versions (sample mapping)
    const versionMap = {
      '1.20.1': 11610,
      '1.20': 11608,
      '1.19.3': 9615,
      '1.19.2': 9493,
      '1.19': 9366,
      '1.18.2': 8877,
    };

    return versionMap[minecraftVersion] || 11610; // Default to latest
  }

  /**
   * Helper: Check if cache is still valid
   * @private
   */
  _isCacheValid(key) {
    const timestamp = this.cache.timestamp[key];
    if (!timestamp) return false;

    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Get installed Minecraft versions (attempt to detect from launcher)
   * @returns {Promise<Array>} Available versions
   */
  async getInstalledVersions() {
    // This would ideally read from:
    // - Windows: %APPDATA%\.minecraft\versions
    // - Linux: ~/.minecraft/versions
    // - macOS: ~/Library/Application Support/minecraft/versions
    // 
    // For now, return popular versions - user can select manually
    return [
      '1.20.1',
      '1.20',
      '1.19.3',
      '1.19.2',
      '1.18.2'
    ];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = { mods: {}, versions: {}, timestamp: {} };
  }
}

export default new ModAPIHandler();
