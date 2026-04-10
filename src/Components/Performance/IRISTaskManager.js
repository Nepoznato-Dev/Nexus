/**
 * IRIS Task Manager UI Component
 * Shows top resource consumers with smart auto-optimization
 */

import React, { useState, useEffect } from 'react';
import { performanceManager } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisPerformanceManager.js';
import GlassCard from './GlassCard';
import { NeonButton } from './NeonButton';

export default function IRISTaskManager() {
  const [data, setData] = useState(null);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [aggressiveness, setAggressiveness] = useState('medium');

  useEffect(() => {
    // Update every 5 seconds
    const interval = setInterval(() => {
      const taskData = performanceManager.getTaskManagerData();
      setData(taskData);
    }, 5000);

    // Initial load
    setData(performanceManager.getTaskManagerData());

    return () => clearInterval(interval);
  }, []);

  const handleKillProcess = (processId) => {
    if (confirm('Are you sure you want to end this task?')) {
      performanceManager.killProcess(processId);
    }
  };

  const handleResumeProcess = (processId) => {
    performanceManager.resumeProcess(processId);
  };

  const handleToggleAutoOptimize = () => {
    const newValue = !autoOptimize;
    setAutoOptimize(newValue);
    performanceManager.updatePreferences({ autoOptimize: newValue });
  };

  const handleAggressivenessChange = (level) => {
    setAggressiveness(level);
    performanceManager.updatePreferences({ aggressiveness: level });
  };

  if (!data) return <div className="loading">Loading task manager...</div>;

  const { processes, suspended, performance, preferences } = data;

  return (
    <GlassCard className="iris-task-manager">
      <div className="task-manager-header">
        <h2>🧠 IRIS Performance Manager</h2>
        <p className="subtitle">Smart resource optimization</p>
      </div>

      {/* Performance Overview */}
      <div className="performance-overview">
        <div className="stat-card">
          <div className="stat-label">RAM Usage</div>
          <div className="stat-value">
            {performance?.ram.percentage.toFixed(1)}%
          </div>
          <div className="stat-bar">
            <div
              className={`stat-fill ${getPerformanceClass(performance?.ram.percentage)}`}
              style={{ width: `${performance?.ram.percentage}%` }}
            />
          </div>
          <div className="stat-detail">
            {formatBytes(performance?.ram.used)} / {formatBytes(performance?.ram.limit)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">CPU Load</div>
          <div className="stat-value">
            {performance?.cpu.estimated.toFixed(0)}%
          </div>
          <div className="stat-bar">
            <div
              className={`stat-fill ${getPerformanceClass(performance?.cpu.estimated)}`}
              style={{ width: `${performance?.cpu.estimated}%` }}
            />
          </div>
          <div className="stat-detail">
            {performance?.cpu.status}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">GPU (FPS)</div>
          <div className="stat-value">
            {performance?.gpu.fps} FPS
          </div>
          <div className="stat-bar">
            <div
              className={`stat-fill ${getFPSClass(performance?.gpu.fps)}`}
              style={{ width: `${Math.min(100, (performance?.gpu.fps / 60) * 100)}%` }}
            />
          </div>
          <div className="stat-detail">
            {performance?.gpu.status}
          </div>
        </div>
      </div>

      {/* Auto-Optimization Settings */}
      <div className="optimization-controls">
        <div className="control-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoOptimize}
              onChange={handleToggleAutoOptimize}
            />
            <span>Auto-Optimize Performance</span>
          </label>
        </div>

        {autoOptimize && (
          <div className="aggressiveness-control">
            <label>Optimization Level:</label>
            <div className="button-group">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  className={`level-btn ${aggressiveness === level ? 'active' : ''}`}
                  onClick={() => handleAggressivenessChange(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <div className="level-description">
              {getLevelDescription(aggressiveness)}
            </div>
          </div>
        )}
      </div>

      {/* Active Processes */}
      <div className="processes-section">
        <h3>Active Tasks (Sorted by Resource Usage)</h3>
        <div className="process-list">
          {processes.length === 0 ? (
            <div className="empty-state">No active tasks</div>
          ) : (
            processes.map(process => (
              <ProcessRow
                key={process.id}
                process={process}
                onKill={handleKillProcess}
              />
            ))
          )}
        </div>
      </div>

      {/* Suspended Processes */}
      {suspended.length > 0 && (
        <div className="suspended-section">
          <h3>Suspended by IRIS ({suspended.length})</h3>
          <div className="process-list">
            {suspended.map(({ process, suspendedAt }) => (
              <div key={process.id} className="process-row suspended">
                <div className="process-icon">⏸️</div>
                <div className="process-info">
                  <div className="process-name">{process.name}</div>
                  <div className="process-meta">
                    Suspended {getTimeAgo(suspendedAt)} ago
                  </div>
                </div>
                <NeonButton
                  size="small"
                  onClick={() => handleResumeProcess(process.id)}
                >
                  Resume
                </NeonButton>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .iris-task-manager {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .task-manager-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .task-manager-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .performance-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .stat-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .stat-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .stat-fill.good { background: #4ade80; }
        .stat-fill.medium { background: #fbbf24; }
        .stat-fill.high { background: #f87171; }

        .stat-detail {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .optimization-controls {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .control-row {
          margin-bottom: 16px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 14px;
        }

        .toggle-label input[type="checkbox"] {
          width: 40px;
          height: 20px;
        }

        .aggressiveness-control {
          margin-top: 16px;
        }

        .aggressiveness-control label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .button-group {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .level-btn {
          flex: 1;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .level-btn.active {
          background: rgba(102, 126, 234, 0.3);
          border-color: #667eea;
        }

        .level-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .level-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        .processes-section,
        .suspended-section {
          margin-bottom: 24px;
        }

        .processes-section h3,
        .suspended-section h3 {
          font-size: 16px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .process-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .process-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }

        .process-row:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .process-row.suspended {
          opacity: 0.7;
          border-color: rgba(251, 191, 36, 0.3);
        }

        .process-icon {
          font-size: 24px;
        }

        .process-info {
          flex: 1;
        }

        .process-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .process-meta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-state {
          text-align: center;
          padding: 32px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </GlassCard>
  );
}

// Process row component
function ProcessRow({ process, onKill }) {
  const getIcon = (type) => {
    const icons = {
      browser: '🌐',
      game: '🎮',
      ai: '🧠',
      media: '🎬'
    };
    return icons[type] || '📱';
  };

  const getResourceBadge = (value) => {
    if (typeof value === 'number') {
      return formatBytes(value);
    }
    const colors = {
      low: '#4ade80',
      medium: '#fbbf24',
      high: '#f87171'
    };
    return (
      <span style={{ color: colors[value] || '#fff' }}>
        {value}
      </span>
    );
  };

  return (
    <div className="process-row">
      <div className="process-icon">{getIcon(process.type)}</div>
      <div className="process-info">
        <div className="process-name">{process.name}</div>
        <div className="process-meta">
          RAM: {getResourceBadge(process.estimatedRAM)} •
          CPU: {getResourceBadge(process.estimatedCPU)}
          {!process.active && <span style={{ marginLeft: 8, color: '#fbbf24' }}>• Inactive</span>}
        </div>
      </div>
      {process.canSuspend && (
        <NeonButton
          size="small"
          variant="danger"
          onClick={() => onKill(process.id)}
        >
          End Task
        </NeonButton>
      )}
    </div>
  );
}

// Helper functions
function getPerformanceClass(percentage) {
  if (percentage >= 80) return 'high';
  if (percentage >= 60) return 'medium';
  return 'good';
}

function getFPSClass(fps) {
  if (fps >= 50) return 'good';
  if (fps >= 30) return 'medium';
  return 'high';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function getLevelDescription(level) {
  const descriptions = {
    low: 'Only optimize when critical (>85% usage)',
    medium: 'Balance performance and convenience (>75% usage)',
    high: 'Aggressive optimization for maximum performance (>60% usage)'
  };
  return descriptions[level];
}
