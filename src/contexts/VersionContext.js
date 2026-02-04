import React, { createContext, useState, useEffect, useCallback } from 'react';
import versionConfig from '../versionConfig.json';
import { storage } from '../Components/Storage/clientStorage.js';

export const VersionContext = createContext();

/**
 * VersionProvider - Manages version selection and feature gates
 * Reads selected version from localStorage (set via Settings)
 * Provides isFeatureEnabled() to all components
 */
export function VersionProvider({ children }) {
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [currentFeatures, setCurrentFeatures] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load selected version from storage on mount
  useEffect(() => {
    const loadVersion = async () => {
      try {
        await storage.init();
        const settings = await storage.loadSettings();
        const savedVersion = settings?.nexusVersion || '1.0.0';
        
        setCurrentVersion(savedVersion);
        updateFeatures(savedVersion);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load version setting:', error);
        // Default to 1.0.0
        setCurrentVersion('1.0.0');
        updateFeatures('1.0.0');
        setIsInitialized(true);
      }
    };

    loadVersion();
  }, []);

  // Update features when version changes
  const updateFeatures = useCallback((version) => {
    const versionData = versionConfig.versions.find(v => v.version === version);
    if (versionData) {
      setCurrentFeatures(versionData.features);
    } else {
      console.warn(`Version ${version} not found, defaulting to 1.0.0`);
      const defaultVersion = versionConfig.versions.find(v => v.version === '1.0.0');
      setCurrentFeatures(defaultVersion?.features || {});
    }
  }, []);

  // Change version and save to storage
  const setVersion = useCallback(async (newVersion) => {
    try {
      await storage.init();
      const settings = await storage.loadSettings();
      await storage.saveSettings({
        ...settings,
        nexusVersion: newVersion
      });
      setCurrentVersion(newVersion);
      updateFeatures(newVersion);
      return true;
    } catch (error) {
      console.error('Failed to save version setting:', error);
      return false;
    }
  }, [updateFeatures]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = useCallback((featureName) => {
    return currentFeatures[featureName] === true;
  }, [currentFeatures]);

  // Get all available versions
  const getAvailableVersions = useCallback(() => {
    return versionConfig.versions.map(v => ({
      version: v.version,
      name: v.name,
      status: v.status,
      releaseDate: v.releaseDate,
      releaseType: v.releaseType
    }));
  }, []);

  // Get feature description
  const getFeatureDescription = useCallback((featureName) => {
    return versionConfig.featureDescriptions[featureName] || '';
  }, []);

  // Get all features for a version
  const getFeaturesForVersion = useCallback((version) => {
    const versionData = versionConfig.versions.find(v => v.version === version);
    return versionData?.features || {};
  }, []);

  const value = {
    currentVersion,
    currentFeatures,
    isFeatureEnabled,
    setVersion,
    getAvailableVersions,
    getFeatureDescription,
    getFeaturesForVersion,
    isInitialized
  };

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
}

/**
 * Hook to use version context
 */
export function useVersion() {
  const context = React.useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within VersionProvider');
  }
  return context;
}

/**
 * Component wrapper - only renders if feature is enabled
 */
export function FeatureGate({ feature, children, fallback = null }) {
  const { isFeatureEnabled } = useVersion();
  
  if (!isFeatureEnabled(feature)) {
    return fallback;
  }
  
  return children;
}
