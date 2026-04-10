import React, { useState, useEffect, useMemo } from 'react';
import { useWindowManager } from '../WindowManager';
import { X, Cpu, MemoryStick, Activity, Zap, TrendingUp, Settings, Info, Battery, BatteryCharging, Wifi, HardDrive, CircuitBoard } from 'lucide-react';
import { storage } from '../../Storage/clientStorage.js';
import { usePerformanceMonitor, performanceManager } from '../../../hooks/usePerformanceMonitor.js';

export default function TaskManagerApp() {
    const { windows, closeWindow } = useWindowManager();
    const [activeTab, setActiveTab] = useState('processes');

    // Use centralized performance monitoring
    const metrics = usePerformanceMonitor();

    const [performanceSettings, setPerformanceSettings] = useState({
        targetFPS: 60,
        fpsCapEnabled: true,
        animationScale: 1,
        prefersReducedMotion: false,
        backgroundParticles: true,
        backgroundType: 'soft-particle-drift',
        desktopWallpaper: 'nexus-default',
        particleCount: 50,
        backgroundSpeed: 0.5,
        backgroundOpacity: 0.4,
        gpuAcceleration: true,
        lazyLoading: true,
        imageOptimization: true,
        vsyncEnabled: true,
        pageRAMSoftLimit: 750,
        pageRAMHardLimit: 1250,
        gamesRAMSoftLimit: 1024,
        gamesRAMHardLimit: 4096,
    });
    const [irisPreferences, setIrisPreferences] = useState({
        autoOptimize: true,
        aggressiveness: 'medium',
    });

    useEffect(() => {
        const syncPreferences = () => {
            const taskData = performanceManager.getTaskManagerData();
            const prefs = taskData?.preferences;
            if (prefs) {
                setIrisPreferences({
                    autoOptimize: prefs.autoOptimize !== false,
                    aggressiveness: prefs.aggressiveness || 'medium',
                });
            }
        };

        const pollPreferences = () => {
            if (typeof document === 'undefined' || document.visibilityState === 'visible') {
                syncPreferences();
            }
        };

        const handleVisibility = () => {
            if (typeof document === 'undefined' || document.visibilityState === 'visible') {
                syncPreferences();
            }
        };

        syncPreferences();
        const interval = setInterval(pollPreferences, 10000);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    useEffect(() => {
        // Load performance settings
        storage.loadSettings().then(settings => {
            if (settings?.performance) {
                setPerformanceSettings(prev => ({
                    ...prev,
                    targetFPS: settings.performance.targetFPS || 60,
                    fpsCapEnabled: settings.performance.fpsCapEnabled !== false,
                    animationScale: settings.performance.animationScale || 1,
                    prefersReducedMotion: settings.performance.prefersReducedMotion || false,
                    gpuAcceleration: settings.performance.gpuAcceleration !== false,
                    lazyLoading: settings.performance.lazyLoading !== false,
                    imageOptimization: settings.performance.imageOptimization !== false,
                    vsyncEnabled: settings.performance.vsyncEnabled !== false,
                    pageRAMSoftLimit: settings.performance.pageRAMSoftLimit || 750,
                    pageRAMHardLimit: settings.performance.pageRAMHardLimit || 1250,
                    gamesRAMSoftLimit: settings.performance.gamesRAMSoftLimit || 1024,
                    gamesRAMHardLimit: settings.performance.gamesRAMHardLimit || 4096,
                }));
            }
            if (settings?.background) {
                setPerformanceSettings(prev => ({
                    ...prev,
                    backgroundParticles: settings.background.type !== 'none',
                    backgroundType: settings.background.type || 'soft-particle-drift',
                    desktopWallpaper: settings.background.desktopWallpaper || 'nexus-default',
                    particleCount: settings.background.particleCount || 50,
                    backgroundSpeed: settings.background.speed || 0.5,
                    backgroundOpacity: settings.background.opacity || 0.4,
                }));
            }
        });
    }, []);

    const clearRamNow = async () => {
        try {
            const api = window.nexusRefreshActions;
            if (api?.enqueue) {
                const result = api.enqueue('clear-stale-cache-then-rerender', {
                    reason: 'manual',
                    payload: { source: 'task-manager' },
                });

                if (!result?.accepted) {
                    await performanceManager.clearRamAndReloadUI();
                }
            } else {
                await performanceManager.clearRamAndReloadUI();
            }
        } catch (error) {
            console.error('Failed to clear RAM:', error);
        }
    };

    const handleIRISPreferenceChange = (key, value) => {
        performanceManager.updatePreferences({ [key]: value });
        setIrisPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handlePerformanceChange = async (path, value) => {
        const currentSettings = (await storage.loadSettings()) || {};

        // Update settings based on path
        if (path.startsWith('background.')) {
            const key = path.split('.')[1];
            currentSettings.background = currentSettings.background || {};

            if (key === 'enabled') {
                const fallbackType = currentSettings.background.type && currentSettings.background.type !== 'none'
                    ? currentSettings.background.type
                    : 'soft-particle-drift';
                currentSettings.background.type = value ? fallbackType : 'none';
                setPerformanceSettings(prev => ({
                    ...prev,
                    backgroundParticles: value,
                    backgroundType: currentSettings.background.type
                }));
            } else if (key === 'type') {
                currentSettings.background.type = value;
                setPerformanceSettings(prev => ({
                    ...prev,
                    backgroundType: value,
                    backgroundParticles: value !== 'none'
                }));
            } else if (key === 'particleCount') {
                currentSettings.background.particleCount = value;
                setPerformanceSettings(prev => ({ ...prev, particleCount: value }));
            } else if (key === 'speed') {
                currentSettings.background.speed = value;
                setPerformanceSettings(prev => ({ ...prev, backgroundSpeed: value }));
            } else if (key === 'opacity') {
                currentSettings.background.opacity = value;
                setPerformanceSettings(prev => ({ ...prev, backgroundOpacity: value }));
            } else if (key === 'desktopWallpaper') {
                currentSettings.background.desktopWallpaper = value;
                setPerformanceSettings(prev => ({ ...prev, desktopWallpaper: value }));
            }
        } else if (path.startsWith('performance.')) {
            const key = path.split('.')[1];
            currentSettings.performance = currentSettings.performance || {};
            currentSettings.performance[key] = value;
            setPerformanceSettings(prev => ({ ...prev, [key]: value }));
        }

        await storage.saveSettings(currentSettings);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nexus:settings-changed', {
                detail: currentSettings,
            }));
        }
    };

    // Format RAM display: show as GB if >= 1000 MB
    const formatRAM = (MB) => {
        if (MB >= 1000) {
            return `${(MB / 1000).toFixed(1)} GB`;
        }
        return `${MB} MB`;
    };

    const isFpsCapped = performanceSettings.fpsCapEnabled !== false;
    const displayTargetFPS = isFpsCapped ? `${performanceSettings.targetFPS} FPS` : 'Unlimited';
    const displayFPS = !isFpsCapped
        ? metrics.fps
        : Math.min(metrics.fps, performanceSettings.targetFPS);

    const getWindowEstimatedRamMB = (windowInfo) => {
        const area = Math.max(1, (windowInfo?.width || 800) * (windowInfo?.height || 600));
        let estimate = 12 + Math.round(area / 90000);
        if (!windowInfo?.minimized) estimate += 6;
        if (windowInfo?.alwaysOnTop) estimate += 3;

        const id = String(windowInfo?.id || '').toLowerCase();
        if (id.includes('browser')) estimate += 22;
        if (id.includes('games')) estimate += 26;
        if (id.includes('media') || id.includes('movie')) estimate += 18;
        if (id.includes('ai') || id.includes('chat')) estimate += 12;

        return estimate;
    };

    const processRows = windows.filter(w => w.id !== 'taskmanager');
    const processRamEstimates = useMemo(() => {
        const byId = new Map();
        processRows.forEach((w) => {
            byId.set(w.id, getWindowEstimatedRamMB(w));
        });
        return byId;
    }, [windows]);

    const systemInfo = useMemo(() => {
        const hasPerformanceMemory = typeof performance !== 'undefined' && performance.memory;
        const memoryPercent = hasPerformanceMemory
            ? Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
            : null;

        const screenValue = typeof window !== 'undefined'
            ? `${window.screen.width}x${window.screen.height}`
            : 'Unknown';

        return [
            { label: 'Browser', value: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown' },
            { label: 'Platform', value: typeof navigator !== 'undefined' ? (navigator.platform || 'Unknown') : 'Unknown' },
            { label: 'Language', value: typeof navigator !== 'undefined' ? (navigator.language || 'Unknown') : 'Unknown' },
            { label: 'Logical Cores', value: typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 'Unknown') : 'Unknown' },
            { label: 'Device Memory', value: typeof navigator !== 'undefined' && navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown' },
            { label: 'Screen', value: screenValue },
            { label: 'JS Heap Usage', value: memoryPercent !== null ? `${memoryPercent}%` : 'Unavailable' }
        ];
    }, []);

    const tabSubtitle = {
        processes: 'System Status',
        performance: 'Performance Settings',
        system: 'System Info'
    }[activeTab] || 'System Status';

    return (
        <div style={{
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #333',
                backgroundColor: '#1a1a1a',
            }}>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    Task Manager
                </h2>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                    {windows.length} processes • {tabSubtitle}
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #333',
                backgroundColor: '#0f0f0f',
            }}>
                {[
                    { id: 'processes', label: 'Processes', icon: Activity },
                    { id: 'performance', label: 'Performance', icon: TrendingUp },
                    { id: 'system', label: 'System', icon: Info },
                ].map(tab => {
                    const Icon = tab.icon;
                    if (!Icon) return null; // Safety check
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #14b8a6' : 'none',
                                color: activeTab === tab.id ? '#fff' : '#888',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Processes Tab */}
            {activeTab === 'processes' && (
                <>
                    {/* System Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                        padding: '16px',
                        borderBottom: '1px solid #333',
                    }}>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Activity size={16} style={{ color: '#4d96ff' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>FPS</span>
                            </div>
                            <div style={{
                                color: displayFPS < 30 ? '#ff6b6b' : displayFPS < 60 ? '#f39c12' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {displayFPS}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>Target: {displayTargetFPS}</div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Cpu size={16} style={{ color: '#f39c12' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>CPU Usage</span>
                            </div>
                            <div style={{
                                color: metrics.cpu > 80 ? '#ff6b6b' : metrics.cpu > 50 ? '#f39c12' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {Math.round(metrics.cpu)}%
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {metrics.cpu > 80 ? 'High' : metrics.cpu > 50 ? 'Moderate' : 'Normal'}
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Zap size={16} style={{ color: '#9333ea' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>GPU Usage</span>
                            </div>
                            <div style={{
                                color: metrics.gpu > 80 ? '#ff6b6b' : metrics.gpu > 50 ? '#f39c12' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {Math.round(metrics.gpu)}%
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {displayFPS < 30 ? 'Struggling' : displayFPS < 50 ? 'Moderate' : 'Good'}
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MemoryStick size={16} style={{ color: metrics.ram.used > metrics.ram.limit ? '#ff6b6b' : '#48bb78' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>RAM Usage</span>
                            </div>
                            <div style={{
                                color: metrics.ram.used > metrics.ram.limit ? '#ff6b6b' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {formatRAM(metrics.ram.estimatedTotal || metrics.ram.used)}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                Heap: {formatRAM(metrics.ram.jsHeapUsed || metrics.ram.used)} • Headroom: {formatRAM(metrics.ram.jsHeapHeadroom || 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                                Limit: {formatRAM(metrics.ram.limit)} • Confidence: {(metrics.ram.confidence || 'low').toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Additional System Metrics */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                {metrics.battery.charging ? <BatteryCharging size={16} style={{ color: '#48bb78' }} /> : <Battery size={16} style={{ color: metrics.battery.level < 20 ? '#ff6b6b' : '#48bb78' }} />}
                                <span style={{ color: '#aaa', fontSize: '12px' }}>Battery</span>
                            </div>
                            <div style={{
                                color: metrics.battery.level < 20 ? '#ff6b6b' : metrics.battery.level < 50 ? '#f39c12' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {metrics.battery.level}%
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {metrics.battery.charging ? 'Charging' : 'Discharging'}
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Wifi size={16} style={{ color: '#10b981' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>Network</span>
                            </div>
                            <div style={{
                                color: '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {metrics.network.effectiveType.toUpperCase()}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {metrics.network.downlink} Mbps ↓ • {metrics.network.rtt}ms
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <HardDrive size={16} style={{ color: '#3b82f6' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>Storage</span>
                            </div>
                            <div style={{
                                color: metrics.storage.percentage > 80 ? '#ff6b6b' : '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {metrics.storage.used} MB
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {metrics.storage.percentage}% of {metrics.storage.quota} MB
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#252525',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CircuitBoard size={16} style={{ color: '#ec4899' }} />
                                <span style={{ color: '#aaa', fontSize: '12px' }}>Hardware</span>
                            </div>
                            <div style={{
                                color: '#48bb78',
                                fontSize: '20px',
                                fontWeight: 600
                            }}>
                                {metrics.hardware.cores} Cores
                            </div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                {metrics.hardware.deviceMemory} GB Device RAM
                            </div>
                        </div>
                    </div>

                    {/* Process List */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{
                                backgroundColor: '#252525',
                                borderBottom: '1px solid #333',
                                position: 'sticky',
                                top: 0,
                            }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#aaa', fontSize: '12px', fontWeight: 500 }}>
                                        Name
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#aaa', fontSize: '12px', fontWeight: 500 }}>
                                        Status
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#aaa', fontSize: '12px', fontWeight: 500 }}>
                                        RAM (est)
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: '#aaa', fontSize: '12px', fontWeight: 500 }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {processRows.map(window => (
                                    <tr
                                        key={window.id}
                                        style={{ borderBottom: '1px solid #2a2a2a' }}
                                    >
                                        <td style={{ padding: '12px', color: '#fff', fontSize: '13px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {window.icon}
                                                <span>{window.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: window.minimized ? '#4a5568' : '#48bb78',
                                                color: '#fff',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 500,
                                            }}>
                                                {window.minimized ? 'Minimized' : 'Running'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#9ca3af', fontSize: '12px' }}>
                                            ~{formatRAM(processRamEstimates.get(window.id) || 0)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => closeWindow(window.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e53e3e',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                <X size={14} />
                                                End Task
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'performance' && (
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                        {/* Info Box */}
                        <div style={{
                            backgroundColor: '#1a2d1f',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #14b8a6',
                        }}>
                            <p style={{ margin: 0, color: '#14b8a6', fontSize: '13px' }}>
                                ⚡ <strong>Performance Settings</strong> - Adjust these to improve speed and responsiveness. Lower values = better performance.
                            </p>
                        </div>

                        {/* Animation Settings */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={18} style={{ color: '#f39c12' }} />
                                Animation & Motion
                            </h3>

                            {/* Target FPS */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Target FPS</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{displayTargetFPS}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="165"
                                    step="1"
                                    value={performanceSettings.targetFPS}
                                    onChange={(e) => handlePerformanceChange('performance.targetFPS', parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>FPS cap range: 5 to 165 when enabled. Disable cap for unlimited mode.</p>
                            </div>

                            {/* Animation Scale */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Animation Scale</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{performanceSettings.animationScale.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={performanceSettings.animationScale}
                                    onChange={(e) => handlePerformanceChange('performance.animationScale', parseFloat(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>0 = disabled, 1 = normal, 2 = slow motion</p>
                            </div>

                            {/* Reduce Motion */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                <div>
                                    <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>Reduce Motion</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>Minimize animations for accessibility</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={performanceSettings.prefersReducedMotion}
                                    onChange={(e) => handlePerformanceChange('performance.prefersReducedMotion', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>
                        </div>

                        {/* Background Settings */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} style={{ color: '#14b8a6' }} />
                                Background Effects
                            </h3>

                            {/* Background Style */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Background Style</label>
                                </div>
                                <select
                                    value={performanceSettings.backgroundParticles ? (performanceSettings.backgroundType || 'soft-particle-drift') : 'none'}
                                    onChange={(e) => handlePerformanceChange('background.type', e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#111',
                                        color: '#fff',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '8px'
                                    }}
                                >
                                    <option value="soft-particle-drift">Soft Particle Drift</option>
                                    <option value="fireflies">Fireflies</option>
                                    <option value="geometric">Geometric Patterns</option>
                                    <option value="network-nodes">Network Nodes</option>
                                    <option value="none">None (Solid Background)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Desktop Wallpaper Pack</label>
                                </div>
                                <select
                                    value={performanceSettings.desktopWallpaper || 'nexus-default'}
                                    onChange={(e) => handlePerformanceChange('background.desktopWallpaper', e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#111',
                                        color: '#fff',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '8px'
                                    }}
                                >
                                    <option value="nexus-default">Nexus Default (Current)</option>
                                    <option value="windows-7">Windows 7 Classic</option>
                                    <option value="windows-8">Windows 8 Bloom</option>
                                    <option value="windows-10">Windows 10 Hero</option>
                                    <option value="season-halloween">Seasonal: Halloween</option>
                                    <option value="season-christmas">Seasonal: Christmas</option>
                                    <option value="season-easter">Seasonal: Easter</option>
                                    <option value="season-newyear">Seasonal: New Year's Eve</option>
                                </select>
                            </div>

                            {/* Enable Background */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>Enable Particles</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>Animated background particles</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={performanceSettings.backgroundParticles}
                                    onChange={(e) => handlePerformanceChange('background.enabled', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>

                            {performanceSettings.backgroundParticles && (
                                <>
                                    {/* Particle Count */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ color: '#bbb', fontSize: '13px' }}>Particle Count</label>
                                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{performanceSettings.particleCount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="200"
                                            step="10"
                                            value={performanceSettings.particleCount}
                                            onChange={(e) => handlePerformanceChange('background.particleCount', parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                        <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>Fewer = better performance</p>
                                    </div>

                                    {/* Speed */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ color: '#bbb', fontSize: '13px' }}>Animation Speed</label>
                                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{performanceSettings.backgroundSpeed.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="2"
                                            step="0.1"
                                            value={performanceSettings.backgroundSpeed}
                                            onChange={(e) => handlePerformanceChange('background.speed', parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {/* Opacity */}
                                    <div style={{ marginBottom: '0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ color: '#bbb', fontSize: '13px' }}>Opacity</label>
                                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{Math.round(performanceSettings.backgroundOpacity * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={performanceSettings.backgroundOpacity}
                                            onChange={(e) => handlePerformanceChange('background.opacity', parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* V-Sync & Idle Status */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={18} style={{ color: '#00f0ff' }} />
                                Sync & Performance Status
                            </h3>

                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>FPS Cap Enabled</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>Limit rendering to your selected target FPS ({isFpsCapped ? 'ON' : 'OFF'})</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isFpsCapped}
                                    onChange={(e) => handlePerformanceChange('performance.fpsCapEnabled', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>V-Sync Enabled</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>Sync FPS to monitor refresh rate ({performanceSettings.vsyncEnabled ? 'ON' : 'OFF'})</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={performanceSettings.vsyncEnabled}
                                    onChange={(e) => handlePerformanceChange('performance.vsyncEnabled', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                <div>
                                    <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>Idle Mode</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>Auto-unload UI after 30s inactivity (Press Ctrl+Shift+F to show FPS)</div>
                                </div>
                                <span style={{ color: '#00f0ff', fontSize: '12px', fontWeight: 600 }}>ACTIVE</span>
                            </label>
                        </div>

                        {/* RAM Limiter */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MemoryStick size={18} style={{ color: metrics.ram.used > metrics.ram.limit ? '#ff6b6b' : '#48bb78' }} />
                                RAM Management
                            </h3>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Website RAM Soft Limit</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{formatRAM(performanceSettings.pageRAMSoftLimit)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="750"
                                    max="1250"
                                    step="50"
                                    value={performanceSettings.pageRAMSoftLimit}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setPerformanceSettings(prev => ({ ...prev, pageRAMSoftLimit: value }));
                                        handlePerformanceChange('performance.pageRAMSoftLimit', value);
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>Warning threshold: 750 – 1250 MB</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Website RAM Hard Limit</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{formatRAM(performanceSettings.pageRAMHardLimit)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="750"
                                    max="1250"
                                    step="50"
                                    value={performanceSettings.pageRAMHardLimit}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setPerformanceSettings(prev => ({ ...prev, pageRAMHardLimit: value }));
                                        handlePerformanceChange('performance.pageRAMHardLimit', value);
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>Hard cap: 750 – 1250 MB</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Games RAM Soft Limit</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{formatRAM(performanceSettings.gamesRAMSoftLimit)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1024"
                                    max="4096"
                                    step="256"
                                    value={performanceSettings.gamesRAMSoftLimit}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setPerformanceSettings(prev => ({ ...prev, gamesRAMSoftLimit: value }));
                                        handlePerformanceChange('performance.gamesRAMSoftLimit', value);
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>Warning threshold: 1 – 4 GB</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ color: '#bbb', fontSize: '13px' }}>Games RAM Hard Limit</label>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{formatRAM(performanceSettings.gamesRAMHardLimit)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1024"
                                    max="4096"
                                    step="256"
                                    value={performanceSettings.gamesRAMHardLimit}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setPerformanceSettings(prev => ({ ...prev, gamesRAMHardLimit: value }));
                                        handlePerformanceChange('performance.gamesRAMHardLimit', value);
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>Hard cap: 1 – 4 GB</p>
                            </div>

                            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#252525', borderRadius: '6px', borderLeft: '3px solid #48bb78' }}>
                                <p style={{ margin: 0, color: '#aaa', fontSize: '11px' }}>Current usage: <span style={{ color: metrics.ram.used > metrics.ram.limit ? '#ff6b6b' : '#48bb78', fontWeight: 600 }}>{formatRAM(metrics.ram.used)}</span></p>
                            </div>

                        </div>

                        {/* System Optimization */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={18} style={{ color: '#4d96ff' }} />
                                System Optimization
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>IRIS Auto-Optimize</div>
                                        <div style={{ color: '#666', fontSize: '11px' }}>Allow I.R.I.S to suspend heavy background tasks under load</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={irisPreferences.autoOptimize}
                                        onChange={(e) => handleIRISPreferenceChange('autoOptimize', e.target.checked)}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </label>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ color: '#bbb', fontSize: '13px' }}>IRIS Aggressiveness</label>
                                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{irisPreferences.aggressiveness}</span>
                                    </div>
                                    <select
                                        value={irisPreferences.aggressiveness}
                                        onChange={(e) => handleIRISPreferenceChange('aggressiveness', e.target.value)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#111',
                                            color: '#fff',
                                            border: '1px solid #333',
                                            borderRadius: '6px',
                                            padding: '8px'
                                        }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>GPU Acceleration</div>
                                        <div style={{ color: '#666', fontSize: '11px' }}>Use hardware rendering</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={performanceSettings.gpuAcceleration}
                                        onChange={(e) => handlePerformanceChange('performance.gpuAcceleration', e.target.checked)}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>Lazy Loading</div>
                                        <div style={{ color: '#666', fontSize: '11px' }}>Load content as needed</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={performanceSettings.lazyLoading}
                                        onChange={(e) => handlePerformanceChange('performance.lazyLoading', e.target.checked)}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>Image Optimization</div>
                                        <div style={{ color: '#666', fontSize: '11px' }}>Compress & optimize images</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={performanceSettings.imageOptimization}
                                        onChange={(e) => handlePerformanceChange('performance.imageOptimization', e.target.checked)}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Clear RAM */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>Clear RAM</h4>
                                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Clear caches, preloads, and reload all UI components without refreshing the browser page.</p>
                            </div>
                            <button
                                onClick={clearRamNow}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#e53e3e',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
                            >
                                Clear RAM
                            </button>
                        </div>

                        {/* Reload Notice */}
                        <div style={{
                            backgroundColor: '#2a1a1a',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #f39c12',
                        }}>
                            <p style={{ margin: 0, color: '#fd9644', fontSize: '13px' }}>
                                🔄 Some changes may require reloading the page to take full effect.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        padding: '16px',
                        maxWidth: '640px'
                    }}>
                        <h3 style={{
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: 600,
                            margin: '0 0 12px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Info size={18} style={{ color: '#60a5fa' }} />
                            System Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {systemInfo.map(item => (
                                <div key={item.label} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '160px', color: '#94a3b8', fontSize: '12px' }}>{item.label}</div>
                                    <div style={{ fontSize: '12px', color: '#e2e8f0', wordBreak: 'break-word' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
