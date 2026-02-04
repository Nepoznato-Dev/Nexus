import React, { useState } from 'react';
import { useVersion } from '../contexts/VersionContext.js';
import { Check, AlertCircle, Info } from 'lucide-react';
import './VersionSelector.css';

/**
 * VersionSelector - Settings component to switch between versions
 * Displays available versions and their features
 */
export default function VersionSelector() {
  const { currentVersion, setVersion, getAvailableVersions, getFeaturesForVersion, getFeatureDescription } = useVersion();
  const [selectedVersion, setSelectedVersion] = useState(currentVersion);
  const [showDetails, setShowDetails] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [releaseFilter, setReleaseFilter] = useState('all'); // 'all', 'release', 'snapshot'

  const availableVersions = getAvailableVersions();
  
  // Filter versions by release type
  const filteredVersions = availableVersions.filter(v => {
    if (releaseFilter === 'all') return true;
    const versionData = availableVersions.find(av => av.version === v.version);
    return versionData?.releaseType === releaseFilter;
  });
  const selectedFeatures = getFeaturesForVersion(selectedVersion);

  const handleVersionChange = async (newVersion) => {
    if (newVersion === currentVersion) return;

    setIsChanging(true);
    const success = await setVersion(newVersion);
    
    if (success) {
      setSelectedVersion(newVersion);
      // Optionally reload page to apply version changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      console.error('Failed to change version');
      setSelectedVersion(currentVersion);
    }
    setIsChanging(false);
  };

  const getVersionStatus = (status) => {
    switch (status) {
      case 'stable':
        return <span className="version-badge stable">Stable</span>;
      case 'experimental':
        return <span className="version-badge experimental">Experimental</span>;
      case 'beta':
        return <span className="version-badge beta">Beta</span>;
      case 'deprecated':
        return <span className="version-badge deprecated">Deprecated</span>;
      default:
        return <span className="version-badge">{status}</span>;
    }
  };

  const getReleaseTypeBadge = (releaseType) => {
    switch (releaseType) {
      case 'release':
        return <span className="release-type-badge release">Release</span>;
      case 'snapshot':
        return <span className="release-type-badge snapshot">Snapshot</span>;
      default:
        return null;
    }
  };

  const enabledFeaturesCount = Object.values(selectedFeatures).filter(v => v === true).length;
  const totalFeaturesCount = Object.keys(selectedFeatures).length;

  return (
    <div className="versionwith custom dropdown */}
      <div className="version-selector-main">
        <div className="version-select-wrapper">
          <label className="version-label">Select Version</label>
          
          {/* Custom dropdown trigger */}
          <button
            className="version-select-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isChanging}
          >
            <div className="trigger-content">
              <div className="trigger-left">
                <span className="trigger-version">v{selectedVersion}</span>
                <span className="trigger-name">
                  {availableVersions.find(v => v.version === selectedVersion)?.name}
                </span>
              </div>
              <div className="trigger-right">
                {getReleaseTypeBadge(availableVersions.find(v => v.version === selectedVersion)?.releaseType)}
                <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
              </div>
            </div>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="version-dropdown-menu">
              {/* Filter tabs */}
              <div className="dropdown-filters">
                <button
                  className={`filter-btn ${releaseFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setReleaseFilter('all')}
                >
                  All Versions
                </button>
                <button
                  className={`filter-btn ${releaseFilter === 'release' ? 'active' : ''}`}
                  onClick={() => setReleaseFilter('release')}
                >
                  Releases
                </button>
                <button
                  className={`filter-btn ${releaseFilter === 'snapshot' ? 'active' : ''}`}
                  onClick={() => setReleaseFilter('snapshot')}
                >
                  Snapshots
                </button>
              </div>

              {/* Scrollable version list */}
              <div className="dropdown-versions-list">
                {filteredVersions.length === 0 && (
                  <div className="no-versions">No versions found</div>
                )}
                
                {filteredVersions.map(v => (
                  <div
                    key={v.version}
                    className={`dropdown-version-item ${selectedVersion === v.version ? 'selected' : ''} ${currentVersion === v.version ? 'current' : ''}`}
                    onClick={() => {
                      setSelectedVersion(v.version);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="version-item-header">
                      <div className="version-item-left">
                        <span className="version-item-number">v{v.version}</span>
                        {currentVersion === v.version && (
                          <Check className="current-check" />
                        )}
                      </div>
                      <div className="version-item-badges">
                        {getReleaseTypeBadge(v.releaseType)}
                        {getVersionStatus(v.status)}
                      </div>
                    </div>
                    <div className="version-item-name">{v.name}</div>
                    <div className="version-item-date">{v.releaseDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}mlFor="version-select" className="version-label">Available Versions</label>
          <select
            id="version-select"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="version-select"
            disabled={isChanging}
          >
            {availableVersions.map(v => (
              <option key={v.version} value={v.version}>
                v{v.version} - {v.name}
              </option>
            ))}
          </select>
        </div>

        {selectedVersion !== currentVersion && (
          <button
            onClick={() => handleVersionChange(selectedVersion)}
            disabled={isChanging}
            className="change-version-btn"
          >
            {isChanging ? 'Switching...' : 'Switch Version'}
          </button>
        )}
      </div>

      {/* Version details */}
      <div className="version-details-card">
        {availableVersions.find(v => v.version === selectedVersion) && (
          <>
            <div className="version-info-row">
              <span className="info-label">Version:</span>
              <span className="info-value">v{selectedVersion}</span>
            </div>
            <div className="version-info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">
                {getVersionStatus(availableVersions.find(v => v.version === selectedVersion)?.status)}
              </span>
            </div>
            <div className="version-info-row">
              <span className="info-label">Features:</span>
              <span className="info-value">
                {enabledFeaturesCount} / {totalFeaturesCount} enabled
              </span>
            </div>
          </>
        )}
      </div>

      {/* Toggle feature details */}
      <button
        className="toggle-details-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>{showDetails ? '▼' : '▶'} Feature Details</span>
      </button>

      {/* Feature list */}
      {showDetails && (
        <div className="features-list">
          <h4>Features in v{selectedVersion}</h4>
          <div className="features-grid">
            {Object.entries(selectedFeatures).map(([featureName, isEnabled]) => (
              <div key={featureName} className={`feature-item ${isEnabled ? 'enabled' : 'disabled'}`}>
                <div className="feature-header">
                  <span className={`feature-icon ${isEnabled ? 'enabled' : 'disabled'}`}>
                    {isEnabled ? '✓' : '✗'}
                  </span>
                  <span className="feature-name">{featureName}</span>
                </div>
                <p className="feature-description">
                  {getFeatureDescription(featureName)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning message if not on latest */}
      {selectedVersion !== availableVersions[availableVersions.length - 1].version && (
        <div className="version-warning">
          <AlertCircle className="w-4 h-4" />
          <div>
            <strong>Running older version</strong>
            <p>You're using an older version of Nexus. Latest version has more features and bug fixes.</p>
          </div>
        </div>
      )}

      {/* Info message about versioning */}
      <div className="version-info">
        <Info className="w-4 h-4" />
        <div>
          <strong>Version Control</strong>
          <p>Switching versions changes which features are available. Older versions may lack new features but are more stable.</p>
        </div>
      </div>
    </div>
  );
}
