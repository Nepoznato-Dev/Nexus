/**
 * IRIS Cache Manager
 * Handles browser-based mod caching to eliminate need for physical mod files in repo
 * Saves ~1.6GB of repository storage
 */

class IRISCacheManager {
  constructor() {
    this.dbName = 'nexus_mod_cache';
    this.dbVersion = 1;
    this.db = null;
    this.catalogUrl = '/docs/MODS_CATALOG.md';
  }

  /**
   * Initialize IndexedDB for mod metadata and cache references
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store mod metadata and download info
        if (!db.objectStoreNames.contains('mods')) {
          const modStore = db.createObjectStore('mods', { keyPath: 'cacheKey' });
          modStore.createIndex('modId', 'modId', { unique: false });
          modStore.createIndex('minecraftVersion', 'minecraftVersion', { unique: false });
        }

        // Store downloaded mod files as blobs
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'fileKey' });
          fileStore.createIndex('modId', 'modId', { unique: false });
        }
      };
    });
  }

  /**
   * Generate cache key for mod + version combo
   */
  getCacheKey(modId, minecraftVersion, loader = 'fabric') {
    return `${modId}@${minecraftVersion}-${loader}`;
  }

  /**
   * Check if mod is already cached
   */
  async isCached(modId, minecraftVersion, loader = 'fabric') {
    if (!this.db) await this.initialize();
    
    const cacheKey = this.getCacheKey(modId, minecraftVersion, loader);
    const transaction = this.db.transaction(['mods'], 'readonly');
    const store = transaction.objectStore('mods');
    
    return new Promise((resolve, reject) => {
      const request = store.get(cacheKey);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached mod metadata
   */
  async getCachedMod(modId, minecraftVersion, loader = 'fabric') {
    if (!this.db) await this.initialize();
    
    const cacheKey = this.getCacheKey(modId, minecraftVersion, loader);
    const transaction = this.db.transaction(['mods'], 'readonly');
    const store = transaction.objectStore('mods');
    
    return new Promise((resolve, reject) => {
      const request = store.get(cacheKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Download mod from Modrinth/CurseForge and cache it
   */
  async downloadAndCacheMod(modId, minecraftVersion, loader = 'fabric', downloadUrl, fileName) {
    if (!this.db) await this.initialize();

    try {
      // Download the mod file
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const fileSize = blob.size;

      // Store file blob
      const fileKey = `file_${this.getCacheKey(modId, minecraftVersion, loader)}`;
      const fileTransaction = this.db.transaction(['files'], 'readwrite');
      const fileStore = fileTransaction.objectStore('files');
      
      await new Promise((resolve, reject) => {
        const request = fileStore.put({
          fileKey,
          modId,
          blob,
          fileName,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Store metadata
      const cacheKey = this.getCacheKey(modId, minecraftVersion, loader);
      const metadata = {
        cacheKey,
        modId,
        minecraftVersion,
        loader,
        fileName,
        fileSize,
        downloadUrl,
        cachedAt: Date.now(),
        fileKey
      };

      const metaTransaction = this.db.transaction(['mods'], 'readwrite');
      const metaStore = metaTransaction.objectStore('mods');
      
      await new Promise((resolve, reject) => {
        const request = metaStore.put(metadata);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return { success: true, metadata, fileSize };
    } catch (error) {
      console.error('IRIS Cache: Download failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cached mod file as downloadable blob URL
   */
  async getCachedModFile(modId, minecraftVersion, loader = 'fabric') {
    if (!this.db) await this.initialize();

    const metadata = await this.getCachedMod(modId, minecraftVersion, loader);
    if (!metadata) return null;

    const transaction = this.db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    
    return new Promise((resolve, reject) => {
      const request = store.get(metadata.fileKey);
      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          const url = URL.createObjectURL(request.result.blob);
          resolve({ url, fileName: request.result.fileName });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached mods for a Minecraft version
   */
  async getCachedModsForVersion(minecraftVersion) {
    if (!this.db) await this.initialize();

    const transaction = this.db.transaction(['mods'], 'readonly');
    const store = transaction.objectStore('mods');
    const index = store.index('minecraftVersion');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(minecraftVersion);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear cache for specific mod
   */
  async clearModCache(modId, minecraftVersion, loader = 'fabric') {
    if (!this.db) await this.initialize();

    const cacheKey = this.getCacheKey(modId, minecraftVersion, loader);
    const metadata = await this.getCachedMod(modId, minecraftVersion, loader);

    if (!metadata) return { success: true, message: 'Not cached' };

    // Delete file blob
    const fileTransaction = this.db.transaction(['files'], 'readwrite');
    const fileStore = fileTransaction.objectStore('files');
    fileStore.delete(metadata.fileKey);

    // Delete metadata
    const metaTransaction = this.db.transaction(['mods'], 'readwrite');
    const metaStore = metaTransaction.objectStore('mods');
    metaStore.delete(cacheKey);

    return { success: true, message: 'Cache cleared' };
  }

  /**
   * Get total cache size
   */
  async getCacheSize() {
    if (!this.db) await this.initialize();

    const transaction = this.db.transaction(['mods'], 'readonly');
    const store = transaction.objectStore('mods');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const mods = request.result || [];
        const totalBytes = mods.reduce((sum, mod) => sum + (mod.fileSize || 0), 0);
        const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
        resolve({ bytes: totalBytes, mb: totalMB, count: mods.length });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear entire cache (all mods)
   */
  async clearAllCache() {
    if (!this.db) await this.initialize();

    const fileTransaction = this.db.transaction(['files'], 'readwrite');
    const fileStore = fileTransaction.objectStore('files');
    fileStore.clear();

    const metaTransaction = this.db.transaction(['mods'], 'readwrite');
    const metaStore = metaTransaction.objectStore('mods');
    metaStore.clear();

    return { success: true, message: 'All cache cleared' };
  }

  /**
   * Export cached mods as downloadable ZIP (for injection to server)
   */
  async exportCachedMods(modIds, minecraftVersion, loader = 'fabric') {
    // Get all cached mod files
    const files = [];
    for (const modId of modIds) {
      const fileData = await this.getCachedModFile(modId, minecraftVersion, loader);
      if (fileData) {
        files.push({ name: fileData.fileName, url: fileData.url });
      }
    }

    if (files.length === 0) {
      return { success: false, error: 'No cached mods found' };
    }

    // Note: Actual ZIP creation would require JSZip library
    // For now, return file list for manual download
    return { success: true, files, count: files.length };
  }
}

// Singleton instance
const irisCacheManager = new IRISCacheManager();

export default irisCacheManager;
