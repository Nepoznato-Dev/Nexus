/**
 * ModManager.js - Minecraft Mod Discovery & Download UI
 * 
 * Provides a student-friendly interface to:
 * - Search for mods on Modrinth & CurseForge
 * - View mod details, screenshots, dependencies
 * - Download mods to user-selected folder
 * - Learn about mod installation & best practices
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  AlertTriangle,
  BookOpen,
  Settings,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  Loader2,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { session } from '../Storage/clientStorage.js';
import modAPIHandler from './modAPIHandler';
import irisModResolver from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisModResolver';
import { IRISPerformanceManager } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisPerformanceManager';
import { analyzeCrashLog } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisCrashAnalyzer';
import { checkModUpdates } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisUpdateChecker';
import { getRecommendations } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisRecommendations';
import irisCacheManager from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisCacheManager';
import COMMUNITY_PACKS from './communityModPacks';
import './ModManager.css';

export default function ModManager() {
  // Search & Discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [minecraftVersion, setMinecraftVersion] = useState('1.20.1');
  const [modLoader, setModLoader] = useState('fabric');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mod Details & Download
  const [selectedMod, setSelectedMod] = useState(null);
  const [modDetails, setModDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [dependencies, setDependencies] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Download Progress
  const [downloadingMods, setDownloadingMods] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});

  // RAZONET integration
  const [irisResolving, setIrisResolving] = useState(false);
  const [irisReport, setIrisReport] = useState(null);
  const [compatibilityReport, setCompatibilityReport] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]); // Mods user plans to install
  const [performanceReport, setPerformanceReport] = useState(null);
  const [updateReport, setUpdateReport] = useState([]);
  const [serverCompatibility, setServerCompatibility] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [crashLogInput, setCrashLogInput] = useState('');
  const [crashAnalysis, setCrashAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [modpackJsonInput, setModpackJsonInput] = useState('');
  const [modpackImportError, setModpackImportError] = useState('');
  const [safeModeEnabled, setSafeModeEnabled] = useState(false);
  const [cacheDownloadReport, setCacheDownloadReport] = useState(null);

  // Browser Cache State
  const [cacheStats, setCacheStats] = useState({ bytes: 0, mb: '0', count: 0 });
  const [cachedMods, setCachedMods] = useState([]);
  const [isCaching, setIsCaching] = useState(false);

  const role = session.getRole();
  const canAccessIris = ['moderator', 'admin', 'owner'].includes(role);

  const performanceManagerRef = useRef(new IRISPerformanceManager());
  const LAST_GOOD_KEY = 'nexus_last_known_good_mods';
  const SAFE_MODE_KEY = 'nexus_safe_mode_enabled';

  // UI State
  const [activeTab, setActiveTab] = useState('search'); // search, details, education, installed, iris
  const [installGuideStep, setInstallGuideStep] = useState(0);
  const [installedVersions, setInstalledVersions] = useState([]);

  // Initialize
  useEffect(() => {
    modAPIHandler.getInstalledVersions().then(setInstalledVersions);
  }, []);

  useEffect(() => {
    const storedSafeMode = localStorage.getItem(SAFE_MODE_KEY);
    if (storedSafeMode === 'true') {
      setSafeModeEnabled(true);
      const storedMods = localStorage.getItem(LAST_GOOD_KEY);
      if (storedMods) {
        try {
          setSelectedMods(JSON.parse(storedMods));
        } catch {
          setSelectedMods([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!canAccessIris && activeTab === 'iris') {
      setActiveTab('search');
    }
  }, [canAccessIris, activeTab]);

  /**
   * Search for mods
   */
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    const results = await modAPIHandler.searchMods(
      searchQuery,
      minecraftVersion,
      modLoader === 'all' ? null : modLoader
    );

    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, minecraftVersion, modLoader]);

  /**
   * Load mod details and dependencies
   */
  const handleSelectMod = useCallback(async (mod) => {
    setSelectedMod(mod);
    setIsLoadingDetails(true);
    setActiveTab('details');

    const details = await modAPIHandler.getModDetails(mod.id, mod.source);
    setModDetails(details);

    // Auto-select latest version
    if (details?.versions?.length > 0) {
      const latestVersion = details.versions[0];
      setSelectedVersion(latestVersion.id);

      const deps = await modAPIHandler.resolveDependencies(details, latestVersion.id);
      setDependencies(deps);

      // RAZONET: auto-resolve dependencies
      console.log('[RAZONET] Auto-resolving dependencies for', mod.name);
      setIrisResolving(true);

      const irisResolution = await irisModResolver.resolveDependencies(
        details,
        latestVersion.id,
        minecraftVersion,
        modLoader === 'all' ? 'fabric' : modLoader
      );

      setIrisReport(irisResolution);
      setIrisResolving(false);

      if (irisResolution.warnings.length > 0) {
        console.warn('[RAZONET] Warnings detected:', irisResolution.warnings);
      }
    }

    setIsLoadingDetails(false);
  }, [minecraftVersion, modLoader]);

  /**
   * Handle version change
   */
  const handleVersionChange = useCallback(async (versionId) => {
    setSelectedVersion(versionId);

    const deps = await modAPIHandler.resolveDependencies(modDetails, versionId);
    setDependencies(deps);
  }, [modDetails]);

  /**
   * Download a mod file
   */
  const handleDownloadMod = useCallback(async (mod, version, file) => {
    const fileId = file.id || file.url;

    // Update UI to show downloading
    setDownloadingMods(prev => ({
      ...prev,
      [fileId]: true
    }));

    // Prefer server-side cache for injection workflows
    const cached = await modAPIHandler.downloadModToCache(file.url, file.name);

    if (cached?.success) {
      alert(
        `✅ ${cached.fileName} saved to Nexus mod cache!\n\n` +
        `Cache URL: ${cached.publicUrl}\n` +
        `Ready for injection.`
      );

      setDownloadingMods(prev => ({
        ...prev,
        [fileId]: false
      }));
      return;
    }

    // Fallback: browser download with progress tracking
    const result = await modAPIHandler.downloadMod(
      file.url,
      file.name,
      (progress) => {
        setDownloadProgress(prev => ({
          ...prev,
          [fileId]: progress
        }));
      }
    );

    if (result.success) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(result.blob);
      link.download = result.fileName;
      link.click();

      alert(`✅ ${result.fileName} downloaded!\n\nSave it to your mods folder.\nNeed help? Check the "How to Install" guide!`);
    } else {
      alert(`❌ Download failed: ${result.message}`);
    }

    setDownloadingMods(prev => ({
      ...prev,
      [fileId]: false
    }));
  }, []);

  /**
  * Download all dependencies + mod with RAZONET
   */
  const handleDownloadAll = useCallback(async (mod, version) => {
    if (irisReport && irisReport.downloadQueue.length > 0) {
      // Use RAZONET auto-download
      console.log('[RAZONET] Starting automatic dependency download');
      setDownloadingMods({ iris: true });

      const results = await irisModResolver.downloadAllDependencies(irisReport);

      // Trigger browser downloads only for items that returned blobs
      results.successful.forEach(item => {
        if (!item.blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(item.blob);
        link.download = item.fileName;
        link.click();
      });

      setDownloadingMods({});

      const cachedCount = results.successful.filter(item => item.cached).length;
      const browserCount = results.successful.length - cachedCount;

      alert(
        `[RAZONET] Auto-Download Complete!\n\n` +
        `✅ Cached: ${cachedCount} files\n` +
        `⬇️ Browser downloads: ${browserCount} files\n` +
        `❌ Failed: ${results.failed.length} files\n` +
        `📦 Total Size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB\n` +
        `⏱️ Time: ${(results.totalTime / 1000).toFixed(1)}s\n\n` +
        `Cached files are ready for injection. Browser downloads should be moved to your mods folder.`
      );
    } else {
      // Fallback to manual download
      const allToDownload = [
        { ...mod, ...version },
        ...dependencies
      ];

      let successCount = 0;
      for (const item of allToDownload) {
        const selectedVersion = item.versions?.[0];
        if (selectedVersion?.files?.[0]) {
          await handleDownloadMod(item, selectedVersion, selectedVersion.files[0]);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Stagger downloads
        }
      }

      alert(`✅ Downloaded ${successCount} files!\n\nMove all .jar files to your mods folder.`);
    }
  }, [irisReport, dependencies, handleDownloadMod]);

  /**
   * Add mod to selection list for compatibility check
   */
  const handleAddToList = useCallback((mod) => {
    setSelectedMods(prev => {
      const exists = prev.some(m => m.id === mod.id);
      if (exists) {
        return prev.filter(m => m.id !== mod.id);
      }
      return [...prev, mod];
    });
  }, []);

  const openIrisTab = useCallback(() => {
    if (canAccessIris) {
      setActiveTab('iris');
    } else {
      alert('RAZONET is experimental and available for Moderator+ roles.');
    }
  }, [canAccessIris]);

  /**
   * Run RAZONET compatibility check on selected mods
   */
  const handleCompatibilityCheck = useCallback(() => {
    if (selectedMods.length === 0) {
      alert('Add some mods to the list first!');
      return;
    }

    console.log('[RAZONET] Running compatibility check on', selectedMods.length, 'mods');
    const report = irisModResolver.checkCompatibility(
      selectedMods,
      minecraftVersion,
      modLoader === 'all' ? 'fabric' : modLoader
    );

    setCompatibilityReport(report);
    if (report.compatible) {
      localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(selectedMods));
    }
    openIrisTab();
  }, [selectedMods, minecraftVersion, modLoader, openIrisTab]);

  const handleRunPerformanceScan = useCallback(async () => {
    const usage = await performanceManagerRef.current.getSystemUsage();
    setPerformanceReport(usage);
  }, []);

  const handleCheckUpdates = useCallback(async () => {
    if (selectedMods.length === 0) {
      alert('Add some mods to the list first!');
      return;
    }
    const report = await checkModUpdates(
      selectedMods,
      minecraftVersion,
      modLoader === 'all' ? 'fabric' : modLoader
    );
    setUpdateReport(report);
  }, [selectedMods, minecraftVersion, modLoader]);

  const handleAnalyzeServerCompatibility = useCallback(() => {
    const report = irisModResolver.analyzeServerCompatibility(selectedMods);
    setServerCompatibility(report);
  }, [selectedMods]);

  const handleSimulateInstall = useCallback(() => {
    const report = irisModResolver.simulateInstall(
      selectedMods,
      minecraftVersion,
      modLoader === 'all' ? 'fabric' : modLoader
    );
    setRiskReport(report);
  }, [selectedMods, minecraftVersion, modLoader]);

  const handlePinVersions = useCallback(async () => {
    if (selectedMods.length === 0) {
      alert('Add some mods to the list first!');
      return;
    }
    const pinned = await irisModResolver.pinVersions(
      selectedMods,
      minecraftVersion,
      modLoader === 'all' ? 'fabric' : modLoader
    );
    setSelectedMods(pinned);
  }, [selectedMods, minecraftVersion, modLoader]);

  const handleAnalyzeCrashLog = useCallback(() => {
    const analysis = analyzeCrashLog(crashLogInput);
    setCrashAnalysis(analysis);
  }, [crashLogInput]);

  const handleGenerateRecommendations = useCallback(() => {
    const recs = getRecommendations(selectedMods);
    setRecommendations(recs);
  }, [selectedMods]);

  const handleExportModpack = useCallback(() => {
    if (selectedMods.length === 0) {
      alert('Add some mods to the list first!');
      return;
    }

    const payload = {
      name: 'Nexus Modpack Export',
      createdAt: new Date().toISOString(),
      minecraftVersion,
      loader: modLoader,
      mods: selectedMods.map((mod) => ({
        id: mod.id,
        name: mod.name,
        source: mod.source || 'modrinth',
        pinnedVersion: mod.pinnedVersion,
        pinnedVersionName: mod.pinnedVersionName
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nexus-modpack-${Date.now()}.modpack.json`;
    link.click();
  }, [selectedMods, minecraftVersion, modLoader]);

  const handleImportModpack = useCallback(() => {
    try {
      const parsed = JSON.parse(modpackJsonInput);
      if (!parsed?.mods?.length) {
        setModpackImportError('Invalid modpack file.');
        return;
      }

      const importedMods = parsed.mods.map((mod) => ({
        id: mod.id,
        name: mod.name,
        source: mod.source || 'modrinth',
        pinnedVersion: mod.pinnedVersion || null,
        pinnedVersionName: mod.pinnedVersionName || null
      }));

      setSelectedMods(importedMods);
      setModpackImportError('');
      openIrisTab();
    } catch (error) {
      setModpackImportError('Failed to parse JSON.');
    }
  }, [modpackJsonInput, openIrisTab]);

  const handleToggleSafeMode = useCallback(() => {
    const next = !safeModeEnabled;
    setSafeModeEnabled(next);
    localStorage.setItem(SAFE_MODE_KEY, String(next));

    if (next) {
      const storedMods = localStorage.getItem(LAST_GOOD_KEY);
      if (storedMods) {
        try {
          setSelectedMods(JSON.parse(storedMods));
        } catch {
          setSelectedMods([]);
        }
      }
    }
  }, [safeModeEnabled]);

  const handleRestoreLastKnownGood = useCallback(() => {
    const storedMods = localStorage.getItem(LAST_GOOD_KEY);
    if (storedMods) {
      try {
        setSelectedMods(JSON.parse(storedMods));
      } catch {
        setSelectedMods([]);
      }
    }
  }, []);

  const handleDownloadSelectedToCache = useCallback(async () => {
    if (selectedMods.length === 0) {
      alert('Add some mods to the list first!');
      return;
    }

    setDownloadingMods({ cache: true });
    const results = { successful: [], failed: [] };

    for (const mod of selectedMods) {
      try {
        const details = await modAPIHandler.getModDetails(mod.id, mod.source || 'modrinth');
        const compatible = details?.versions?.find((version) => {
          const matchesGame = version.minecraftVersions?.includes(minecraftVersion);
          const matchesLoader = version.loaders?.includes(modLoader === 'all' ? 'fabric' : modLoader);
          return matchesGame && matchesLoader;
        }) || details?.versions?.[0];

        const file = compatible?.files?.[0];
        if (!file?.url) {
          results.failed.push({ name: mod.name, error: 'No download URL' });
          continue;
        }

        const cached = await modAPIHandler.downloadModToCache(file.url, file.name);
        if (cached?.success) {
          results.successful.push({ name: mod.name, publicUrl: cached.publicUrl });
        } else {
          results.failed.push({ name: mod.name, error: cached?.message || 'Cache failed' });
        }
      } catch (error) {
        results.failed.push({ name: mod.name, error: error.message });
      }
    }

    setCacheDownloadReport(results);
    setDownloadingMods({});
  }, [selectedMods, minecraftVersion, modLoader]);

  const handleImportCommunityPack = useCallback((pack) => {
    const mods = pack.mods.map((modId) => ({
      id: modId,
      name: modId,
      source: 'modrinth'
    }));
    setSelectedMods(mods);
    openIrisTab();
  }, [openIrisTab]);

  // Browser Cache Handlers
  const handleDownloadModToCache = useCallback(async (modId, modName) => {
    setIsCaching(true);
    try {
      // Get mod details and download URL
      const details = await modAPIHandler.getModDetails(modId, 'modrinth');
      const compatible = details?.versions?.find((version) => {
        const matchesGame = version.minecraftVersions?.includes(minecraftVersion);
        const matchesLoader = version.loaders?.includes(modLoader);
        return matchesGame && matchesLoader;
      });

      if (!compatible || !compatible.files?.[0]?.url) {
        alert(`No compatible version found for ${modName}`);
        return;
      }

      const file = compatible.files[0];
      const result = await irisCacheManager.downloadAndCacheMod(
        modId,
        minecraftVersion,
        modLoader,
        file.url,
        file.filename
      );

      if (result.success) {
        alert(`✅ ${modName} cached successfully! (${(result.fileSize / 1024 / 1024).toFixed(2)}MB)`);
        await refreshCacheStats();
      } else {
        alert(`❌ Failed to cache ${modName}: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error caching ${modName}: ${error.message}`);
    } finally {
      setIsCaching(false);
    }
  }, [minecraftVersion, modLoader]);

  const handleDownloadAllSelectedToCache = useCallback(async () => {
    if (selectedMods.length === 0) {
      alert('No mods selected to cache');
      return;
    }

    setIsCaching(true);
    let successCount = 0;
    let failCount = 0;

    for (const mod of selectedMods) {
      try {
        const details = await modAPIHandler.getModDetails(mod.id, mod.source || 'modrinth');
        const compatible = details?.versions?.find((version) => {
          const matchesGame = version.minecraftVersions?.includes(minecraftVersion);
          const matchesLoader = version.loaders?.includes(modLoader);
          return matchesGame && matchesLoader;
        });

        if (!compatible || !compatible.files?.[0]?.url) {
          failCount++;
          continue;
        }

        const file = compatible.files[0];
        const result = await irisCacheManager.downloadAndCacheMod(
          mod.id,
          minecraftVersion,
          modLoader,
          file.url,
          file.filename
        );

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    alert(`✅ Cached ${successCount} mods, ${failCount} failed`);
    await refreshCacheStats();
    setIsCaching(false);
  }, [selectedMods, minecraftVersion, modLoader]);

  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = await irisCacheManager.getCacheSize();
      setCacheStats(stats);

      const cached = await irisCacheManager.getCachedModsForVersion(minecraftVersion);
      setCachedMods(cached);
    } catch (error) {
      console.error('Failed to refresh cache stats:', error);
    }
  }, [minecraftVersion]);

  const handleClearCache = useCallback(async () => {
    if (!confirm('Clear all cached mods? This will free up browser storage but you\'ll need to download mods again.')) {
      return;
    }

    try {
      await irisCacheManager.clearAllCache();
      alert('✅ Cache cleared successfully');
      await refreshCacheStats();
    } catch (error) {
      alert(`❌ Failed to clear cache: ${error.message}`);
    }
  }, [refreshCacheStats]);

  const handleExportCachedMods = useCallback(async () => {
    try {
      const modIds = cachedMods.map(m => m.modId);
      const result = await irisCacheManager.exportCachedMods(modIds, minecraftVersion, modLoader);

      if (result.success) {
        // Create download links for each cached mod
        for (const file of result.files) {
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(file.url);
          await new Promise(resolve => setTimeout(resolve, 500)); // Stagger downloads
        }
        alert(`✅ Downloaded ${result.count} cached mods`);
      } else {
        alert(`❌ Export failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Export error: ${error.message}`);
    }
  }, [cachedMods, minecraftVersion, modLoader]);

  // Load cache stats on mount and version change
  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

  // ===== RENDER COMPONENTS =====

  const renderSearchTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mod-search-container"
    >
      <GlassCard className="search-card">
        <h2>🔍 Search Mods</h2>

        <form onSubmit={handleSearch} className="search-form">
          {/* Search Input */}
          <div className="input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="e.g., Sodium, Optifine, Litematica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filters */}
          <div className="filters-row">
            <div className="filter-group">
              <label>Minecraft Version:</label>
              <select
                value={minecraftVersion}
                onChange={(e) => setMinecraftVersion(e.target.value)}
                className="filter-select"
              >
                {installedVersions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Mod Loader:</label>
              <select
                value={modLoader}
                onChange={(e) => setModLoader(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Loaders</option>
                <option value="fabric">Fabric</option>
                <option value="forge">Forge</option>
                <option value="quilt">Quilt</option>
              </select>
            </div>
          </div>

          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            {isSearching ? 'Searching...' : 'Search Mods'}
          </button>
        </form>
      </GlassCard>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="results-grid">
          <h3>{searchResults.length} Results Found</h3>
          <div className="mods-list">
            {searchResults.map((mod, idx) => (
              <motion.div
                key={`${mod.source}-${mod.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`mod-card ${selectedMods.some(m => m.id === mod.id) ? 'selected' : ''}`}
              >
                <div onClick={() => handleSelectMod(mod)} className="mod-card-content">
                  {mod.icon && <img src={mod.icon} alt={mod.name} className="mod-icon" />}

                  <div className="mod-info">
                    <h4>{mod.name}</h4>
                    <p className="author">by {mod.author}</p>
                    <p className="description">{mod.description?.substring(0, 80)}...</p>

                    <div className="mod-stats">
                      <span className="stat">⬇️ {(mod.downloads / 1000).toFixed(0)}K downloads</span>
                      <span className="stat">⭐ {mod.rating}</span>
                      <span className={`source-badge ${mod.source}`}>{mod.source}</span>
                    </div>
                  </div>

                  <ArrowRight size={20} className="expand-icon" />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToList(mod);
                  }}
                  className={`add-to-list-button ${selectedMods.some(m => m.id === mod.id) ? 'added' : ''}`}
                  title={selectedMods.some(m => m.id === mod.id) ? 'Remove from RAZONET list' : 'Add to RAZONET list'}
                >
                  {selectedMods.some(m => m.id === mod.id) ? (
                    <Check size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderDetailsTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mod-details-container"
    >
      <button
        onClick={() => {
          setActiveTab('search');
          setSelectedMod(null);
          setModDetails(null);
        }}
        className="back-button"
      >
        ← Back to Search
      </button>

      {isLoadingDetails ? (
        <div className="loading">
          <Loader2 size={32} className="spin" />
          <p>Loading mod details...</p>
        </div>
      ) : modDetails ? (
        <>
          {/* Mod Header */}
          <GlassCard className="mod-header">
            {modDetails.icon && <img src={modDetails.icon} alt={modDetails.name} className="large-icon" />}

            <div className="header-info">
              <h2>{modDetails.name}</h2>
              <p className="author">Created by {modDetails.author}</p>
              <p className="description">{modDetails.description}</p>

              <div className="stats-row">
                <div className="stat-item">
                  <span className="label">Downloads</span>
                  <span className="value">{(modDetails.downloads / 1000000).toFixed(1)}M</span>
                </div>
                <div className="stat-item">
                  <span className="label">Version</span>
                  <span className="value">{modDetails.versions?.length}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Source</span>
                  <span className="value">{selectedMod?.source}</span>
                </div>
              </div>

              {modDetails.repo && (
                <a href={modDetails.repo} target="_blank" rel="noopener noreferrer" className="link-button">
                  <ExternalLink size={16} /> View Source
                </a>
              )}
            </div>
          </GlassCard>

          {/* Version & Download */}
          {selectedVersion && modDetails.versions && (
            <GlassCard className="download-section">
              <h3>📦 Select Version & Download</h3>

              <div className="version-selector">
                <label>Choose Version:</label>
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="version-select"
                >
                  {modDetails.versions.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} • {v.releaseType} • {new Date(v.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {modDetails.versions
                .find(v => v.id === selectedVersion)
                ?.files.map(file => (
                  <div key={file.id || file.url} className="file-item">
                    <div className="file-info">
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">Size: {(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>

                    <button
                      onClick={() => handleDownloadMod(
                        selectedMod,
                        modDetails.versions.find(v => v.id === selectedVersion),
                        file
                      )}
                      disabled={downloadingMods[file.id || file.url]}
                      className="download-button"
                    >
                      {downloadingMods[file.id || file.url] ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          {downloadProgress[file.id || file.url]?.percent}%
                        </>
                      ) : (
                        <>
                          <Download size={16} /> Download
                        </>
                      )}
                    </button>
                  </div>
                ))}

              {/* Dependencies */}
              {dependencies.length > 0 && (
                <div className="dependencies">
                  <h4>⚙️ Required Dependencies</h4>
                  <p className="warning">
                    <AlertTriangle size={16} />
                    This mod requires other mods to work. Download all to avoid crashes!
                  </p>

                  <div className="deps-list">
                    {dependencies.map((dep, idx) => (
                      <div key={idx} className="dep-item">
                        <div className="dep-name">{dep.name}</div>
                        <button
                          onClick={() => handleDownloadMod(
                            dep,
                            dep.versions?.[0],
                            dep.versions?.[0]?.files?.[0]
                          )}
                          disabled={downloadingMods[dep.id]}
                          className="dep-download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDownloadAll(selectedMod, modDetails.versions.find(v => v.id === selectedVersion))}
                    className="download-all-button"
                  >
                    <Download size={18} />
                    Download All ({dependencies.length + 1} files)
                  </button>
                </div>
              )}
            </GlassCard>
          )}

          {/* Safety Tips */}
          <GlassCard className="safety-tips">
            <h3>⚠️ Safety Tips</h3>
            <ul>
              <li>✅ Always backup your Minecraft saves before installing mods</li>
              <li>✅ Download only from Modrinth or CurseForge (verified sources)</li>
              <li>✅ Some mods may reduce FPS - test in single-player first</li>
              <li>✅ Mix incompatible mods = crashes (check mod compatibility)</li>
              <li>✅ Use one mod loader (Fabric OR Forge, not both)</li>
            </ul>
          </GlassCard>
        </>
      ) : null}
    </motion.div>
  );

  const renderEducationTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="education-container"
    >
      <GlassCard className="education-card">
        <h2>📚 Modding Guide for Beginners</h2>

        {/* Step Navigation */}
        <div className="step-nav">
          {[
            { id: 0, title: 'What is a Mod?' },
            { id: 1, title: 'Mod Loaders' },
            { id: 2, title: 'Installation Steps' },
            { id: 3, title: 'Troubleshooting' }
          ].map(step => (
            <button
              key={step.id}
              onClick={() => setInstallGuideStep(step.id)}
              className={`step-button ${installGuideStep === step.id ? 'active' : ''}`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="step-content">
          {installGuideStep === 0 && (
            <div className="step">
              <h3>What is a Minecraft Mod?</h3>
              <p>A <strong>mod</strong> is a modification to Minecraft that adds new features, items, or changes gameplay.</p>

              <h4>Examples:</h4>
              <ul>
                <li><strong>Sodium</strong> - Makes Minecraft run faster (optimization mod)</li>
                <li><strong>Litematica</strong> - Allows building structures from schematics (building mod)</li>
                <li><strong>JourneyMap</strong> - Adds a minimap to your world (utility mod)</li>
                <li><strong>Mystical Agriculture</strong> - Adds new crops and farming (content mod)</li>
              </ul>

              <div className="pro-tip">
                <strong>💡 Pro Tip:</strong> Start with small mods (optimization, utilities) before adding big content mods.
              </div>
            </div>
          )}

          {installGuideStep === 1 && (
            <div className="step">
              <h3>Understanding Mod Loaders</h3>
              <p>A <strong>mod loader</strong> is software that allows Minecraft to run mods. Think of it as an adapter.</p>

              <div className="loader-comparison">
                <div className="loader">
                  <h4>Fabric</h4>
                  <p className="pros">✅ Lightweight & fast</p>
                  <p className="pros">✅ Most optimization mods</p>
                  <p className="cons">❌ Fewer modding tools for developers</p>
                </div>

                <div className="loader">
                  <h4>Forge</h4>
                  <p className="pros">✅ Most mods available</p>
                  <p className="pros">✅ Best compatibility</p>
                  <p className="cons">❌ Heavier, slower than Fabric</p>
                </div>

                <div className="loader">
                  <h4>Quilt</h4>
                  <p className="pros">✅ Like Fabric but better</p>
                  <p className="pros">✅ Better mod compatibility</p>
                  <p className="cons">❌ Smaller community</p>
                </div>
              </div>

              <div className="pro-tip">
                <strong>💡 Recommendation:</strong> Use <strong>Fabric</strong> for your first time. It's simpler and faster.
              </div>
            </div>
          )}

          {installGuideStep === 2 && (
            <div className="step">
              <h3>How to Install Mods</h3>

              <ol className="install-steps">
                <li>
                  <strong>Install a Mod Loader</strong>
                  <p>Download the loader installer from <code>fabricmc.net</code> (for Fabric)</p>
                  <p>Run the installer and select your Minecraft version</p>
                </li>

                <li>
                  <strong>Find Your Mods Folder</strong>
                  <p>After installing the loader, a <code>mods</code> folder appears in:</p>
                  <p className="code">Windows: C:\Users\[YourName]\AppData\Roaming\.minecraft\mods</p>
                  <p className="code">Mac: ~/Library/Application Support/minecraft/mods</p>
                  <p className="code">Linux: ~/.minecraft/mods</p>
                </li>

                <li>
                  <strong>Download Mods Here</strong>
                  <p>Use this tool to download mods (they'll be .jar files)</p>
                  <p>Move the .jar files into your <code>mods</code> folder</p>
                </li>

                <li>
                  <strong>Launch Minecraft</strong>
                  <p>Open the Minecraft launcher</p>
                  <p>Select the loader version (e.g., "fabric-loader-...")</p>
                  <p>Click Play!</p>
                </li>

                <li>
                  <strong>Verify Mods Loaded</strong>
                  <p>In the main menu, click Mods</p>
                  <p>You should see your downloaded mods listed</p>
                </li>
              </ol>

              <div className="warning-box">
                <AlertTriangle size={20} />
                <p><strong>⚠️ Backup First!</strong> Mods can sometimes conflict. Always create a backup of your world before installing.</p>
              </div>
            </div>
          )}

          {installGuideStep === 3 && (
            <div className="step">
              <h3>Troubleshooting Common Issues</h3>

              <div className="faq">
                <div className="qa">
                  <h4>❌ "Mods aren't showing in the mods folder"</h4>
                  <p>Make sure you have a mod loader installed. The mods folder only appears after installing it.</p>
                </div>

                <div className="qa">
                  <h4>❌ "Game crashes on startup"</h4>
                  <p>You likely have conflicting mods. Remove the last mod you added and try again.</p>
                  <p>Check the crash report for clues about which mod failed.</p>
                </div>

                <div className="qa">
                  <h4>❌ "Mods aren't loading"</h4>
                  <p>You might have the wrong mod version. Make sure the mod version matches your Minecraft version.</p>
                  <p>Example: A 1.19 mod won't work on 1.20.1</p>
                </div>

                <div className="qa">
                  <h4>❌ "Can't find the mods folder"</h4>
                  <p>Hidden folders are disabled by default on Windows/Mac.</p>
                  <p>Enable viewing hidden files, then navigate to the path above.</p>
                </div>
              </div>

              <div className="pro-tip">
                <strong>💡 Debug Tip:</strong> Try installing mods one at a time to find the problematic one.
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderIRISTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="razonet-tab-container"
    >
      <GlassCard className="razonet-header-card">
        <div className="razonet-header">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <h2>RAZONET Mod Assistant</h2>
              <p className="text-sm text-white/60">
                Intelligent dependency resolution & compatibility checking
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Selected Mods List */}
      <GlassCard className="mod-list-card">
        <div className="flex items-center justify-between mb-4">
          <h3>Your Mod List ({selectedMods.length})</h3>
          <button
            onClick={handleCompatibilityCheck}
            disabled={selectedMods.length === 0}
            className="check-button"
          >
            <Shield size={16} />
            Check Compatibility
          </button>
        </div>

        {selectedMods.length === 0 && (
          <div className="empty-state">
            <Sparkles className="w-16 h-16 text-purple-400/40 mb-3" />
            <p className="text-white/60">No mods selected yet</p>
            <p className="text-sm text-white/40 mt-2">
              Go to Search and click the + button on mods to add them here
            </p>
          </div>
        )}

        <div className="selected-mods-grid">
          {selectedMods.map(mod => (
            <div key={mod.id} className="selected-mod-card">
              <div className="flex items-start gap-3">
                {mod.icon && (
                  <img src={mod.icon} alt="" className="w-10 h-10 rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{mod.name}</h4>
                  <p className="text-xs text-white/60 mt-1">by {mod.author}</p>
                </div>
                <button
                  onClick={() => handleAddToList(mod)}
                  className="remove-button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="razonet-actions-card">
        <div className="razonet-actions-header">
          <h3>RAZONET Quick Actions</h3>
          <div className="razonet-toggle-row">
            <span>Safe Mode</span>
            <button className={`toggle-button ${safeModeEnabled ? 'enabled' : ''}`} onClick={handleToggleSafeMode}>
              {safeModeEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="razonet-actions-grid">
          <button className="action-button" onClick={handlePinVersions}>
            <Zap size={16} /> Pin Versions
          </button>
          <button className="action-button" onClick={handleSimulateInstall}>
            <AlertTriangle size={16} /> Simulate Install
          </button>
          <button className="action-button" onClick={handleCheckUpdates}>
            <Download size={16} /> Check Updates
          </button>
          <button className="action-button" onClick={handleAnalyzeServerCompatibility}>
            <Shield size={16} /> Server Compatibility
          </button>
          <button className="action-button" onClick={handleRunPerformanceScan}>
            <Settings size={16} /> Performance Scan
          </button>
          <button className="action-button" onClick={handleDownloadSelectedToCache}>
            <Download size={16} /> Download to Cache
          </button>
          <button className="action-button" onClick={handleRestoreLastKnownGood}>
            <Check size={16} /> Restore Last Good
          </button>
          <button className="action-button" onClick={handleExportModpack}>
            <ExternalLink size={16} /> Export .modpack
          </button>
        </div>

        <div className="modpack-import">
          <h4>Import .modpack JSON</h4>
          <textarea
            value={modpackJsonInput}
            onChange={(e) => setModpackJsonInput(e.target.value)}
            placeholder="Paste your .modpack.json content here"
          />
          {modpackImportError && <p className="error-text">{modpackImportError}</p>}
          <button className="action-button" onClick={handleImportModpack}>Import Modpack</button>
        </div>
      </GlassCard>

      {/* Compatibility Report */}
      {compatibilityReport && (
        <GlassCard className="compatibility-report-card">
          <div className="report-header">
            <h3>Compatibility Report</h3>
            <div className={`status-badge ${compatibilityReport.compatible ? 'success' : 'error'}`}>
              {compatibilityReport.compatible ? (
                <>
                  <Check size={16} />
                  Compatible
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  Issues Detected
                </>
              )}
            </div>
          </div>

          {/* Conflicts */}
          {compatibilityReport.conflicts.length > 0 && (
            <div className="report-section conflicts">
              <h4>
                <AlertTriangle size={18} className="text-red-400" />
                Conflicts ({compatibilityReport.conflicts.length})
              </h4>
              {compatibilityReport.conflicts.map((conflict, idx) => (
                <div key={idx} className="conflict-item">
                  <div className="conflict-header">
                    <span className={`severity-badge ${conflict.severity}`}>
                      {conflict.severity}
                    </span>
                    <span className="conflict-type">{conflict.type.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="conflict-reason">{conflict.reason}</p>
                  <div className="conflict-mods">
                    {conflict.mods.map(mod => (
                      <span key={mod} className="mod-badge">{mod}</span>
                    ))}
                  </div>
                  <div className="conflict-suggestion">
                    <Zap size={14} />
                    {conflict.suggestion}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {compatibilityReport.warnings.length > 0 && (
            <div className="report-section warnings">
              <h4>
                <AlertTriangle size={18} className="text-yellow-400" />
                Warnings ({compatibilityReport.warnings.length})
              </h4>
              {compatibilityReport.warnings.map((warning, idx) => (
                <div key={idx} className="warning-item">
                  <p>{warning.message}</p>
                  {warning.suggestion && (
                    <p className="suggestion">{warning.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {compatibilityReport.suggestions.length > 0 && (
            <div className="report-section suggestions">
              <h4>
                <Sparkles size={18} className="text-blue-400" />
                RAZONET Suggestions
              </h4>
              {compatibilityReport.suggestions.map((suggestion, idx) => (
                <div key={idx} className="suggestion-item">
                  <p className="suggestion-message">{suggestion.message}</p>
                  {suggestion.benefit && (
                    <p className="suggestion-benefit">💡 {suggestion.benefit}</p>
                  )}
                  {suggestion.mods && (
                    <div className="suggested-mods">
                      {suggestion.mods.map(mod => (
                        <span key={mod} className="mod-badge">{mod}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Performance Impact */}
          <div className="report-section performance">
            <h4>
              <Zap size={18} className="text-green-400" />
              Performance Impact
            </h4>
            <div className="performance-stats">
              <div className="stat">
                <span className="stat-label">Score:</span>
                <span className="stat-value">{compatibilityReport.performanceImpact.score}/10</span>
              </div>
              <div className="stat">
                <span className="stat-label">Rating:</span>
                <span className={`stat-value rating-${compatibilityReport.performanceImpact.rating.toLowerCase()}`}>
                  {compatibilityReport.performanceImpact.rating}
                </span>
              </div>
            </div>
            <p className="performance-rec">{compatibilityReport.performanceImpact.recommendation}</p>
          </div>
        </GlassCard>
      )}

      {riskReport && (
        <GlassCard className="razonet-report-card">
          <h3>Install Risk Simulation</h3>
          <div className={`risk-badge ${riskReport.riskLevel}`}>Risk: {riskReport.riskLevel} ({riskReport.riskScore}/100)</div>
          <ul className="risk-notes">
            {riskReport.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </GlassCard>
      )}

      {updateReport?.length > 0 && (
        <GlassCard className="razonet-report-card">
          <h3>Update Checker</h3>
          <div className="update-list">
            {updateReport.map((item) => (
              <div key={item.id} className={`update-item ${item.status}`}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="text-xs">Current: {item.currentVersion} → Latest: {item.latestVersion}</p>
                </div>
                <span className="status-pill">{item.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {serverCompatibility && (
        <GlassCard className="razonet-report-card">
          <h3>Server Compatibility</h3>
          <div className="compat-columns">
            <div>
              <h4>Client-only</h4>
              <p>{serverCompatibility.clientOnly.join(', ') || 'None'}</p>
            </div>
            <div>
              <h4>Server-required</h4>
              <p>{serverCompatibility.serverRequired.join(', ') || 'None'}</p>
            </div>
            <div>
              <h4>Universal</h4>
              <p>{serverCompatibility.universal.join(', ') || 'None'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {performanceReport && (
        <GlassCard className="razonet-report-card">
          <h3>Performance Profiler</h3>
          <div className="perf-grid">
            <div>
              <span className="perf-label">RAM Usage</span>
              <strong>{performanceReport.ram.percentage.toFixed(0)}%</strong>
            </div>
            <div>
              <span className="perf-label">CPU Load</span>
              <strong>{performanceReport.cpu.estimated.toFixed(0)}%</strong>
            </div>
            <div>
              <span className="perf-label">FPS</span>
              <strong>{performanceReport.gpu.fps || 'N/A'}</strong>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="razonet-report-card">
        <h3>Crash Log Analyzer</h3>
        <textarea
          value={crashLogInput}
          onChange={(e) => setCrashLogInput(e.target.value)}
          placeholder="Paste your crash log here"
          className="crash-textarea"
        />
        <button className="action-button" onClick={handleAnalyzeCrashLog}>Analyze Crash Log</button>
        {crashAnalysis && (
          <div className="crash-report">
            <p><strong>Summary:</strong> {crashAnalysis.summary}</p>
            <p><strong>Loader:</strong> {crashAnalysis.loader}</p>
            <p><strong>Suspected Mods:</strong> {crashAnalysis.suspectedMods.join(', ') || 'None'}</p>
            <ul>
              {crashAnalysis.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>
        )}
      </GlassCard>

      <GlassCard className="razonet-report-card">
        <h3>Shader & Resource Pack Recommendations</h3>
        <button className="action-button" onClick={handleGenerateRecommendations}>Generate Recommendations</button>
        {recommendations && (
          <div className="recommendations">
            <p className="text-sm">{recommendations.note}</p>
            <div>
              <h4>Shaders</h4>
              <ul>
                {recommendations.shaders.map((shader) => (
                  <li key={shader.id}>{shader.name} — {shader.note}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Resource Packs</h4>
              <ul>
                {recommendations.resourcePacks.map((pack) => (
                  <li key={pack.id}>{pack.name} — {pack.note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="razonet-report-card">
        <h3>Community Packs</h3>
        <div className="community-grid">
          {COMMUNITY_PACKS.map((pack) => (
            <div key={pack.id} className="community-card">
              <h4>{pack.name}</h4>
              <p className="text-sm">by {pack.author}</p>
              <p className="text-sm">{pack.description}</p>
              <button className="action-button" onClick={() => handleImportCommunityPack(pack)}>
                Import Pack
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {cacheDownloadReport && (
        <GlassCard className="razonet-report-card">
          <h3>Cache Download Report</h3>
          <p>✅ Cached: {cacheDownloadReport.successful.length}</p>
          <p>❌ Failed: {cacheDownloadReport.failed.length}</p>
        </GlassCard>
      )}

      {/* RAZONET dependency report */}
      {irisReport && (
        <GlassCard className="dependency-report-card">
          <h3>Dependency Resolution</h3>

          {irisReport.dependencies.length > 0 && (
            <div className="dependency-list">
              <h4>{irisReport.dependencies.length} Required Dependencies</h4>
              {irisReport.dependencies.map((dep, idx) => (
                <div key={idx} className="dependency-item">
                  <Check size={16} className="text-green-400" />
                  <span>{dep.mod.name}</span>
                  {dep.nested && dep.nested.length > 0 && (
                    <span className="nested-count">+{dep.nested.length} more</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {irisReport.optionalDependencies.length > 0 && (
            <div className="optional-deps">
              <h4>{irisReport.optionalDependencies.length} Optional Enhancements</h4>
              {irisReport.optionalDependencies.map((dep, idx) => (
                <div key={idx} className="optional-item">
                  <span>{dep.mod.name}</span>
                  <span className="description">{dep.description}</span>
                </div>
              ))}
            </div>
          )}

          {irisReport.totalSize > 0 && (
            <div className="download-summary">
              <p>Total Download Size: {(irisReport.totalSize / 1024 / 1024).toFixed(2)} MB</p>
              <button
                onClick={() => handleDownloadAll(selectedMod, modDetails?.versions?.[0])}
                className="download-all-button"
                disabled={downloadingMods.iris}
              >
                {downloadingMods.iris ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Auto-Download All ({irisReport.downloadQueue.length} files)
                  </>
                )}
              </button>
            </div>
          )}
        </GlassCard>
      )}
    </motion.div>
  );

  // ===== MAIN RENDER =====

  return (
    <div className="mod-manager">
      <div className="header">
        <h1>🎮 Minecraft Mod Manager</h1>
        <p>Discover & download mods from Modrinth & CurseForge</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={18} /> Search
        </button>
        {canAccessIris && (
          <button
            className={`tab-button ${activeTab === 'iris' ? 'active' : ''}`}
            onClick={openIrisTab}
          >
            <Sparkles size={18} /> RAZONET Assistant
            {selectedMods.length > 0 && (
              <span className="badge">{selectedMods.length}</span>
            )}
          </button>
        )}
        <button
          className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          <BookOpen size={18} /> Learn
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'iris' && renderIRISTab()}
        {activeTab === 'education' && renderEducationTab()}
      </AnimatePresence>
    </div>
  );
}
