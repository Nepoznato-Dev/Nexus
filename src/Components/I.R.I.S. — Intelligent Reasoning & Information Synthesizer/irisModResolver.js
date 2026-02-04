/**
 * irisModResolver.js - IRIS-Powered Minecraft Mod Dependency & Compatibility System
 * 
 * Features:
 * - Automatic dependency resolution (recursive)
 * - Compatibility checking (version conflicts, loader conflicts)
 * - Conflict resolution suggestions
 * - Dependency download automation
 * - Version matching (semantic versioning)
 * - Performance impact analysis
 * 
 * Integrates with modAPIHandler.js for API calls
 */

import modAPIHandler from '../Games/modAPIHandler';

class IRISModResolver {
  constructor() {
    this.dependencyGraph = new Map(); // mod -> dependencies
    this.compatibilityCache = new Map(); // hash -> compatibility result
    this.conflictRules = this.initializeConflictRules();
    
    console.log('[IRIS] Mod Resolver initialized');
  }

  /**
   * Initialize known mod conflicts and incompatibilities
   */
  initializeConflictRules() {
    return {
      // Known incompatible mod pairs
      incompatible: [
        { mods: ['optifine', 'sodium'], reason: 'Both modify rendering engine' },
        { mods: ['optifine', 'rubidium'], reason: 'Both modify rendering engine' },
        { mods: ['sodium', 'rubidium'], reason: 'Duplicate rendering optimizations' }
      ],
      
      // Loader-specific conflicts
      loaderConflicts: {
        fabric: ['forge-only-mod'],
        forge: ['fabric-api'],
        quilt: []
      },
      
      // Version requirements (Minecraft version dependencies)
      versionRequirements: {
        '1.20+': ['modernfix', 'c2me'],
        '1.19+': ['fabric-api'],
        '1.18+': ['starlight']
      }
    };
  }

  /**
   * Resolve all dependencies for a mod (recursive)
   * @param {Object} mod - Mod details from API
   * @param {string} versionId - Specific version to resolve
   * @param {string} minecraftVersion - Target Minecraft version
   * @param {string} loader - Mod loader (fabric, forge, quilt)
   * @returns {Promise<Object>} Resolved dependency tree with download info
   */
  async resolveDependencies(mod, versionId, minecraftVersion, loader) {
    console.log(`[IRIS] Resolving dependencies for ${mod.name} (${versionId})`);
    
    const resolved = {
      mod: mod,
      version: versionId,
      dependencies: [],
      optionalDependencies: [],
      conflicts: [],
      warnings: [],
      totalSize: 0,
      downloadQueue: []
    };

    try {
      // Get version details
      const versionDetails = await modAPIHandler.getVersionDetails(mod.id, versionId, mod.source);
      
      if (!versionDetails || !versionDetails.dependencies) {
        console.log(`[IRIS] No dependencies found for ${mod.name}`);
        return resolved;
      }

      // Process each dependency
      for (const dep of versionDetails.dependencies) {
        const depType = dep.dependency_type || dep.type;
        
        if (depType === 'required') {
          // Recursive resolution
          const depMod = await this.fetchDependencyMod(dep, minecraftVersion, loader);
          
          if (depMod) {
            // Check if already in graph (circular dependency detection)
            if (this.dependencyGraph.has(depMod.id)) {
              resolved.warnings.push({
                type: 'circular_dependency',
                message: `Circular dependency detected: ${depMod.name}`,
                severity: 'low'
              });
              continue;
            }

            this.dependencyGraph.set(depMod.id, dep);

            // Recursively resolve dependencies of this dependency
            const nestedDeps = await this.resolveDependencies(
              depMod,
              depMod.latestVersion,
              minecraftVersion,
              loader
            );

            resolved.dependencies.push({
              mod: depMod,
              version: depMod.latestVersion,
              nested: nestedDeps.dependencies,
              required: true
            });

            resolved.downloadQueue.push({
              name: depMod.name,
              id: depMod.id,
              version: depMod.latestVersion,
              url: depMod.downloadUrl,
              size: depMod.fileSize || 0
            });

            resolved.totalSize += depMod.fileSize || 0;
          } else {
            resolved.warnings.push({
              type: 'missing_dependency',
              message: `Required dependency not found: ${dep.project_id || dep.name}`,
              severity: 'high'
            });
          }
        } else if (depType === 'optional') {
          const depMod = await this.fetchDependencyMod(dep, minecraftVersion, loader);
          
          if (depMod) {
            resolved.optionalDependencies.push({
              mod: depMod,
              version: depMod.latestVersion,
              description: dep.description || 'Enhances functionality'
            });
          }
        }
      }

      // Clear dependency graph for this resolution
      this.dependencyGraph.clear();

      console.log(`[IRIS] Resolved ${resolved.dependencies.length} required, ${resolved.optionalDependencies.length} optional dependencies`);
      
    } catch (error) {
      console.error('[IRIS] Dependency resolution failed:', error);
      resolved.warnings.push({
        type: 'resolution_error',
        message: `Failed to resolve dependencies: ${error.message}`,
        severity: 'high'
      });
    }

    return resolved;
  }

  /**
   * Fetch dependency mod details from API
   * @private
   */
  async fetchDependencyMod(dependency, minecraftVersion, loader) {
    try {
      const depId = dependency.project_id || dependency.mod_id;
      
      if (!depId) return null;

      const depDetails = await modAPIHandler.getModDetails(depId, dependency.source || 'modrinth');
      
      if (!depDetails) return null;

      // Find compatible version
      const compatibleVersion = depDetails.versions.find(v => 
        v.game_versions?.includes(minecraftVersion) &&
        v.loaders?.includes(loader)
      );

      if (!compatibleVersion) {
        console.warn(`[IRIS] No compatible version found for ${depDetails.name}`);
        return null;
      }

      return {
        id: depDetails.id,
        name: depDetails.name,
        latestVersion: compatibleVersion.id,
        downloadUrl: compatibleVersion.files[0]?.url,
        fileSize: compatibleVersion.files[0]?.size || 0
      };
    } catch (error) {
      console.error('[IRIS] Failed to fetch dependency:', error);
      return null;
    }
  }

  /**
   * Check compatibility between mods
   * @param {Array<Object>} modList - List of mods with versions
   * @param {string} minecraftVersion - Target Minecraft version
   * @param {string} loader - Mod loader
   * @returns {Object} Compatibility report with conflicts and suggestions
   */
  checkCompatibility(modList, minecraftVersion, loader) {
    console.log(`[IRIS] Checking compatibility for ${modList.length} mods`);
    
    const report = {
      compatible: true,
      conflicts: [],
      warnings: [],
      suggestions: [],
      performanceImpact: this.estimatePerformanceImpact(modList)
    };

    // Check for known incompatibilities
    for (const incompatRule of this.conflictRules.incompatible) {
      const conflictingMods = modList.filter(mod => 
        incompatRule.mods.some(name => 
          mod.name.toLowerCase().includes(name.toLowerCase())
        )
      );

      if (conflictingMods.length > 1) {
        report.compatible = false;
        report.conflicts.push({
          type: 'incompatible_mods',
          mods: conflictingMods.map(m => m.name),
          reason: incompatRule.reason,
          severity: 'high',
          suggestion: `Remove one of: ${conflictingMods.map(m => m.name).join(', ')}`
        });
      }
    }

    // Check loader compatibility
    const loaderIncompatible = modList.filter(mod => {
      const incompatibleLoaders = this.conflictRules.loaderConflicts[loader] || [];
      return incompatibleLoaders.some(name => 
        mod.name.toLowerCase().includes(name.toLowerCase())
      );
    });

    if (loaderIncompatible.length > 0) {
      report.compatible = false;
      report.conflicts.push({
        type: 'loader_incompatible',
        mods: loaderIncompatible.map(m => m.name),
        reason: `These mods are not compatible with ${loader}`,
        severity: 'high',
        suggestion: `Use ${loader === 'fabric' ? 'Forge' : 'Fabric'} versions or remove incompatible mods`
      });
    }

    // Check version conflicts (multiple versions of same mod)
    const modNames = {};
    modList.forEach(mod => {
      const baseName = mod.name.toLowerCase();
      if (modNames[baseName]) {
        modNames[baseName].push(mod);
      } else {
        modNames[baseName] = [mod];
      }
    });

    Object.entries(modNames).forEach(([name, versions]) => {
      if (versions.length > 1) {
        report.warnings.push({
          type: 'duplicate_mod',
          message: `Multiple versions of ${versions[0].name} detected`,
          severity: 'medium',
          suggestion: 'Keep only the latest version'
        });
      }
    });

    // Suggest performance mods if missing
    const hasPerformanceMod = modList.some(mod => 
      ['sodium', 'lithium', 'phosphor', 'starlight', 'modernfix'].some(name =>
        mod.name.toLowerCase().includes(name)
      )
    );

    if (!hasPerformanceMod) {
      report.suggestions.push({
        type: 'performance_enhancement',
        message: 'Consider adding performance mods like Sodium, Lithium, or ModernFix',
        mods: ['Sodium', 'Lithium', 'ModernFix'],
        benefit: 'Significantly improves FPS and reduces lag'
      });
    }

    console.log(`[IRIS] Compatibility check complete: ${report.compatible ? 'PASS' : 'FAIL'}`);
    return report;
  }

  /**
   * Estimate performance impact of mod list
   * @private
   */
  estimatePerformanceImpact(modList) {
    const categories = {
      optimization: ['sodium', 'lithium', 'phosphor', 'starlight', 'modernfix', 'ferritecore'],
      heavy: ['shaders', 'create', 'immersive engineering', 'mekanism'],
      medium: ['jei', 'rei', 'journeymap', 'minimap'],
      light: ['fabric api', 'cloth config', 'mod menu']
    };

    let impact = 0;

    modList.forEach(mod => {
      const name = mod.name.toLowerCase();
      
      if (categories.optimization.some(opt => name.includes(opt))) {
        impact -= 2; // Performance boost
      } else if (categories.heavy.some(h => name.includes(h))) {
        impact += 3; // Heavy performance cost
      } else if (categories.medium.some(m => name.includes(m))) {
        impact += 1;
      } else {
        impact += 0.5;
      }
    });

    return {
      score: Math.max(0, Math.min(10, 5 + impact)),
      rating: impact < -2 ? 'Excellent' : impact < 2 ? 'Good' : impact < 5 ? 'Moderate' : 'Heavy',
      recommendation: impact > 5 ? 'Consider adding optimization mods' : 'Performance looks good'
    };
  }

  /**
   * Auto-download all dependencies
   * @param {Object} resolvedDeps - Result from resolveDependencies()
   * @returns {Promise<Object>} Download results
   */
  async downloadAllDependencies(resolvedDeps) {
    console.log(`[IRIS] Starting auto-download of ${resolvedDeps.downloadQueue.length} dependencies`);
    
    const results = {
      successful: [],
      failed: [],
      totalSize: resolvedDeps.totalSize,
      totalTime: 0
    };

    const startTime = Date.now();

    for (const item of resolvedDeps.downloadQueue) {
      try {
        console.log(`[IRIS] Downloading ${item.name}...`);
        
        const fileName = `${item.name}-${item.version}.jar`;

        const cached = await modAPIHandler.downloadModToCache(item.url, fileName);
        if (cached?.success) {
          results.successful.push({
            name: item.name,
            size: item.size,
            fileName: cached.fileName || fileName,
            cached: true,
            publicUrl: cached.publicUrl,
            filePath: cached.filePath
          });
          continue;
        }

        const result = await modAPIHandler.downloadMod(
          item.url,
          fileName,
          (progress) => {
            console.log(`[IRIS] ${item.name}: ${progress}%`);
          }
        );

        if (result.success) {
          results.successful.push({
            name: item.name,
            size: item.size,
            blob: result.blob,
            fileName: result.fileName
          });
        } else {
          results.failed.push({
            name: item.name,
            error: result.message
          });
        }
      } catch (error) {
        results.failed.push({
          name: item.name,
          error: error.message
        });
      }
    }

    results.totalTime = Date.now() - startTime;

    console.log(`[IRIS] Download complete: ${results.successful.length} succeeded, ${results.failed.length} failed (${results.totalTime}ms)`);
    
    return results;
  }

  /**
   * Generate installation guide based on mod list
   */
  generateInstallationGuide(modList, loader, minecraftVersion) {
    const guide = {
      steps: [],
      requirements: [],
      warnings: []
    };

    // Step 1: Loader installation
    guide.steps.push({
      step: 1,
      title: `Install ${loader} Mod Loader`,
      description: `Download and install ${loader} for Minecraft ${minecraftVersion}`,
      url: loader === 'fabric' 
        ? 'https://fabricmc.net/use/' 
        : 'https://files.minecraftforge.net/',
      critical: true
    });

    // Step 2: Create mods folder
    guide.steps.push({
      step: 2,
      title: 'Create Mods Folder',
      description: 'Navigate to your .minecraft directory and create a "mods" folder if it doesn\'t exist',
      path: loader === 'fabric' 
        ? '.minecraft/mods' 
        : '.minecraft/mods',
      critical: true
    });

    // Step 3: Install dependencies first
    const hasDeps = modList.some(mod => mod.dependencies && mod.dependencies.length > 0);
    if (hasDeps) {
      guide.steps.push({
        step: 3,
        title: 'Install Required Dependencies',
        description: 'Install library and API mods first (like Fabric API, Cloth Config)',
        critical: true
      });
    }

    // Step 4: Install main mods
    guide.steps.push({
      step: hasDeps ? 4 : 3,
      title: 'Install Mods',
      description: 'Copy all .jar files to the mods folder',
      critical: true
    });

    // Step 5: Launch game
    guide.steps.push({
      step: hasDeps ? 5 : 4,
      title: 'Launch Minecraft',
      description: `Select the ${loader} profile and launch the game`,
      critical: true
    });

    // Add requirements
    guide.requirements.push(`Minecraft ${minecraftVersion}`);
    guide.requirements.push(`${loader} Mod Loader`);
    guide.requirements.push(`Java 17+ (for Minecraft 1.18+)`);

    return guide;
  }

  /**
   * Pin compatible versions for each mod (latest compatible)
   */
  async pinVersions(modList, minecraftVersion, loader) {
    const pinned = [];

    for (const mod of modList) {
      try {
        const details = await modAPIHandler.getModDetails(mod.id, mod.source || 'modrinth');
        if (!details?.versions?.length) {
          pinned.push({ ...mod, pinnedVersion: null, pinnedVersionName: null });
          continue;
        }

        const compatible = details.versions.find((version) => {
          const matchesGame = version.minecraftVersions?.includes(minecraftVersion);
          const matchesLoader = version.loaders?.includes(loader);
          return matchesGame && matchesLoader;
        }) || details.versions[0];

        pinned.push({
          ...mod,
          pinnedVersion: compatible.id,
          pinnedVersionName: compatible.name || compatible.version_number || compatible.id
        });
      } catch (error) {
        pinned.push({ ...mod, pinnedVersion: null, pinnedVersionName: null, pinError: error.message });
      }
    }

    return pinned;
  }

  /**
   * Analyze server compatibility for selected mods
   */
  analyzeServerCompatibility(modList) {
    const clientOnlyKeywords = ['client', 'hud', 'minimap', 'map', 'zoom', 'sodium', 'iris', 'shader', 'particles'];
    const serverRequiredKeywords = ['server', 'fabric-api', 'forge', 'quilt', 'library'];

    const report = {
      clientOnly: [],
      serverRequired: [],
      universal: []
    };

    modList.forEach((mod) => {
      const name = mod.name?.toLowerCase() || '';
      if (serverRequiredKeywords.some((keyword) => name.includes(keyword))) {
        report.serverRequired.push(mod.name);
      } else if (clientOnlyKeywords.some((keyword) => name.includes(keyword))) {
        report.clientOnly.push(mod.name);
      } else {
        report.universal.push(mod.name);
      }
    });

    return report;
  }

  /**
   * Simulate installation risk before download
   */
  simulateInstall(modList, minecraftVersion, loader) {
    const compatibility = this.checkCompatibility(modList, minecraftVersion, loader);
    const conflicts = compatibility.conflicts.length;
    const warnings = compatibility.warnings.length;
    const performanceScore = compatibility.performanceImpact?.score || 5;

    const riskScore = Math.min(100, Math.round(conflicts * 30 + warnings * 10 + performanceScore * 2));
    const riskLevel = riskScore > 70 ? 'high' : riskScore > 35 ? 'medium' : 'low';

    return {
      riskScore,
      riskLevel,
      notes: [
        `${conflicts} conflicts detected`,
        `${warnings} warnings detected`,
        `Performance impact score: ${performanceScore}/10`
      ],
      compatibility
    };
  }
}

// Export singleton instance
const irisModResolver = new IRISModResolver();
export default irisModResolver;
