import React, { useEffect, useMemo, useState, createRef, useRef } from 'react';
import { Cpu, ExternalLink, Package, Search, Wrench, Maximize2, Rocket, FolderOpen } from 'lucide-react';
import { useWindowManager } from '../WindowManager';
import GameWindow from './GameWindow';
import ModsApp from './ModsApp';

export default function EnginesApp() {
    const [activeTab, setActiveTab] = useState('ports');
    const [searchQuery, setSearchQuery] = useState('');
    const [enginePorts, setEnginePorts] = useState([]);
    const [minecraftVersions, setMinecraftVersions] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [selectedEntryType, setSelectedEntryType] = useState('ports');
    const [helperNotice, setHelperNotice] = useState('');
    const windowRefs = useRef({});
    const launchTimeoutRef = useRef(null);
    const launchFrameRef = useRef(null);
    const { openWindow, windows, restoreWindow } = useWindowManager();

    useEffect(() => {
        return () => {
            if (launchTimeoutRef.current) {
                window.clearTimeout(launchTimeoutRef.current);
                launchTimeoutRef.current = null;
            }

            if (launchFrameRef.current && document.body.contains(launchFrameRef.current)) {
                document.body.removeChild(launchFrameRef.current);
            }
            launchFrameRef.current = null;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadManifests = async () => {
            try {
                const [engineResponse, minecraftResponse] = await Promise.all([
                    fetch('/engine-ports-manifest.json'),
                    fetch('/minecraft-versions-manifest.json')
                ]);

                const nextEnginePorts = engineResponse.ok ? await engineResponse.json() : [];
                const nextMinecraftVersions = minecraftResponse.ok ? await minecraftResponse.json() : [];

                if (!isMounted) return;

                const normalizedMinecraftVersions = Array.isArray(nextMinecraftVersions)
                    ? nextMinecraftVersions.map((entry) => {
                        const version = entry.version || entry.title || '';
                        const folder = entry.relativeInstancePath?.split('/').pop() || entry.title || version;
                        const loader = entry.loader || 'unknown';

                        return {
                            ...entry,
                            relativeInstancePath: entry.relativeInstancePath || `MinecraftVersions/${folder}`,
                            protocolUrl: entry.protocolUrl || `nexus-launcher://minecraft-instance?folder=${encodeURIComponent(folder)}&version=${encodeURIComponent(version)}&loader=${encodeURIComponent(loader)}`
                        };
                    })
                    : [];

                setEnginePorts(Array.isArray(nextEnginePorts) ? nextEnginePorts : []);
                setMinecraftVersions(normalizedMinecraftVersions);
            } catch (error) {
                console.warn('Failed to load engines manifests:', error);
            }
        };

        loadManifests();

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleEntries = useMemo(() => {
        const source = activeTab === 'ports' ? enginePorts : minecraftVersions;
        const lowerSearch = searchQuery.trim().toLowerCase();

        if (!lowerSearch) return source;

        return source.filter((entry) => {
            const haystack = [
                entry.title,
                entry.description,
                entry.loader,
                entry.loaderLabel,
                ...(Array.isArray(entry.topMods) ? entry.topMods : [])
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(lowerSearch);
        });
    }, [activeTab, enginePorts, minecraftVersions, searchQuery]);

    useEffect(() => {
        if (visibleEntries.length === 0) {
            setSelectedEntry(null);
            return;
        }

        const selectedStillVisible = visibleEntries.some((entry) => entry.id === selectedEntry?.id);
        if (!selectedStillVisible || selectedEntryType !== activeTab) {
            setSelectedEntry(visibleEntries[0]);
            setSelectedEntryType(activeTab);
        }
    }, [visibleEntries, selectedEntry, selectedEntryType, activeTab]);

    const startEnginePort = (entry) => {
        if (!entry?.url) return;

        const windowId = `engine_port_${entry.id}`;
        const existingWindow = windows.find((win) => win.id === windowId);
        if (existingWindow) {
            restoreWindow(windowId);
            return;
        }

        const engineRef = createRef();
        windowRefs.current[windowId] = engineRef;

        const fullscreenButton = (
            <button
                onClick={() => {
                    engineRef.current?.toggleFullscreen();
                }}
                style={{
                    padding: '4px 12px',
                    background: '#2563eb',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                }}
            >
                <Maximize2 size={14} />
                Toggle FS
            </button>
        );

        openWindow({
            id: windowId,
            title: entry.title,
            icon: entry.emoji || '⚙️',
            component: <GameWindow ref={engineRef} game={{ title: entry.title, url: entry.url }} />,
            customControls: fullscreenButton,
            width: 1200,
            height: 780,
            x: 120,
            y: 70,
            minWidth: 720,
            minHeight: 520,
            onClose: () => {
                delete windowRefs.current[windowId];
            }
        });
    };

    const openModsWindow = () => {
        const existingWindow = windows.find((win) => win.id === 'mods');
        if (existingWindow) {
            restoreWindow('mods');
            return;
        }

        openWindow({
            id: 'mods',
            title: 'Mods',
            icon: '📦',
            component: <ModsApp />,
            width: 800,
            height: 600,
            minWidth: 680,
            minHeight: 480,
            x: 160,
            y: 90,
        });
    };

    const launchLocalMinecraftInstance = (entry) => {
        if (!entry?.protocolUrl) return;

        setHelperNotice('');

        if (launchTimeoutRef.current) {
            window.clearTimeout(launchTimeoutRef.current);
            launchTimeoutRef.current = null;
        }

        if (launchFrameRef.current && document.body.contains(launchFrameRef.current)) {
            document.body.removeChild(launchFrameRef.current);
        }

        const launchFrame = document.createElement('iframe');
        launchFrame.style.display = 'none';
        launchFrame.src = entry.protocolUrl;
        launchFrameRef.current = launchFrame;
        document.body.appendChild(launchFrame);

        launchTimeoutRef.current = window.setTimeout(() => {
            if (document.body.contains(launchFrame)) {
                document.body.removeChild(launchFrame);
            }
            launchFrameRef.current = null;
            launchTimeoutRef.current = null;
            setHelperNotice('helper-missing');
        }, 1800);
    };

    const renderPortDetails = (entry) => (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${entry.color || '#2563eb'}dd, ${entry.color || '#2563eb'}66)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    overflow: 'hidden'
                }}>
                    {entry.icon ? (
                        <img src={entry.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (entry.emoji || '⚙️')}
                </div>
                <div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{entry.title}</div>
                    <div style={{ color: '#9fb3c8', fontSize: '13px', marginTop: '4px' }}>Remote HTML5 engine port</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                    onClick={() => startEnginePort(entry)}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                    }}
                >
                    <Cpu size={16} />
                    Open Engine Port
                </button>
                <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#203040',
                        border: '1px solid #35506d',
                        borderRadius: '8px',
                        color: '#d9e6f2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    <ExternalLink size={16} />
                    Open External
                </a>
            </div>

            <div style={{ color: '#c7d5e0', lineHeight: 1.7, fontSize: '14px', maxWidth: '820px' }}>
                <p>{entry.description || 'Browser-hosted engine entry.'}</p>
            </div>
        </>
    );

    const renderMinecraftDetails = (entry) => (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${entry.color || '#22c55e'}dd, ${entry.color || '#22c55e'}66)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                }}>
                    {entry.emoji || '⛏️'}
                </div>
                <div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>Minecraft {entry.version || entry.title}</div>
                    <div style={{ color: '#9fb3c8', fontSize: '13px', marginTop: '4px' }}>{entry.loaderLabel || entry.loader || 'Unknown Loader'}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[
                    ['Mods', entry.modCount ?? 0],
                    ['Sessions', entry.playCount ?? 0],
                    ['Memory', entry.allocatedMemoryMb ? `${entry.allocatedMemoryMb} MB` : 'Unknown']
                ].map(([label, value]) => (
                    <div key={label} style={{
                        minWidth: '160px',
                        padding: '16px',
                        backgroundColor: '#223345',
                        borderRadius: '10px',
                        border: '1px solid #30485f'
                    }}>
                        <div style={{ color: '#8fb1cf', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
                        <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>{value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                    onClick={() => launchLocalMinecraftInstance(entry)}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                    }}
                >
                    <Rocket size={16} />
                    Launch Local Instance
                </button>
                <button
                    onClick={() => {
                        const setupCmd = 'cd native-launch-helper && node setup-helper.js';
                        alert(
                            `Run this command in a terminal:\n\n${setupCmd}\n\nThe wizard will:\n✓ Auto-detect your launcher\n✓ Create config.json\n✓ Register protocol handler`
                        );
                    }}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#7c3aed',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                    }}
                >
                    <Wrench size={16} />
                    Setup Helper
                </button>
                <button
                    onClick={openModsWindow}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#16a34a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                    }}
                >
                    <Package size={16} />
                    Open Mod Manager
                </button>
                {entry.relativeInstancePath && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#203040',
                        border: '1px solid #35506d',
                        borderRadius: '8px',
                        color: '#d9e6f2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}>
                        <FolderOpen size={16} />
                        {entry.relativeInstancePath}
                    </div>
                )}
            </div>

            {helperNotice === 'helper-missing' && (
                <div style={{
                    marginBottom: '18px',
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    color: '#dbeafe',
                    fontSize: '14px',
                    maxWidth: '900px'
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>Minecraft launcher not detected.</strong> Set up the native helper to launch real Minecraft instances.
                    </div>
                    <button
                        onClick={() => {
                            const setupCmd = 'cd native-launch-helper && node setup-helper.js';
                            alert(
                                `Run this command:\n\n${setupCmd}\n\nThe setup wizard will:\n✓ Auto-detect your Minecraft launcher (Prism, MultiMC, etc.)\n✓ Create config.json with your settings\n✓ Register the nexus-launcher:// protocol`
                            );
                            setHelperNotice('');
                        }}
                        style={{
                            padding: '8px 14px',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '13px'
                        }}
                    >
                        Show Setup Command
                    </button>
                </div>
            )}

            <div style={{ color: '#c7d5e0', lineHeight: 1.7, fontSize: '14px', maxWidth: '860px' }}>
                <p>{entry.description || 'Minecraft instance snapshot discovered from the local MinecraftVersions folder.'}</p>
                {Array.isArray(entry.topMods) && entry.topMods.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}>Top Mods</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {entry.topMods.map((mod) => (
                                <span key={mod} style={{ padding: '6px 10px', backgroundColor: '#2a475e', borderRadius: '999px', fontSize: '12px' }}>{mod}</span>
                            ))}
                        </div>
                    </div>
                )}
                {entry.lastPlayed && entry.lastPlayed !== '0001-01-01T00:00:00' && (
                    <p style={{ marginTop: '16px', color: '#9fb3c8' }}>
                        Last played: {new Date(entry.lastPlayed).toLocaleString()}
                    </p>
                )}
                {entry.protocolUrl && (
                    <p style={{ marginTop: '16px', color: '#7dd3fc', fontSize: '12px' }}>
                        Launch protocol: {entry.protocolUrl}
                    </p>
                )}
            </div>
        </>
    );

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: '#16202a', color: '#fff' }}>
            <div style={{ width: '300px', borderRight: '1px solid #274055', backgroundColor: '#111923', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #274055' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Wrench size={20} />
                        Engines Lab
                    </div>
                    <div style={{ marginTop: '6px', color: '#8fa6bb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        HTML5 Ports + Minecraft Versions
                    </div>
                </div>

                <div style={{ padding: '14px 16px 10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <button onClick={() => setActiveTab('ports')} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #35506d', backgroundColor: activeTab === 'ports' ? '#274b70' : '#192532', color: '#fff', cursor: 'pointer' }}>Engine Ports</button>
                        <button onClick={() => setActiveTab('minecraft')} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #35506d', backgroundColor: activeTab === 'minecraft' ? '#274b70' : '#192532', color: '#fff', cursor: 'pointer' }}>Minecraft</button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8fa6bb' }} />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={activeTab === 'ports' ? 'Search engine ports...' : 'Search versions or mods...'}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #35506d', backgroundColor: '#192532', color: '#fff', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 10px' }}>
                    {visibleEntries.map((entry) => {
                        const isSelected = entry.id === selectedEntry?.id;
                        return (
                            <button
                                key={entry.id}
                                onClick={() => {
                                    setSelectedEntry(entry);
                                    setSelectedEntryType(activeTab);
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    marginBottom: '6px',
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: isSelected ? '#4d7cad' : 'transparent',
                                    backgroundColor: isSelected ? '#223345' : 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${entry.color || '#2563eb'}dd, ${entry.color || '#2563eb'}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                    {entry.icon && activeTab === 'ports' ? (
                                        <img src={entry.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (entry.emoji || (activeTab === 'ports' ? '⚙️' : '⛏️'))}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.title}</div>
                                    <div style={{ fontSize: '11px', color: '#8fa6bb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activeTab === 'ports' ? 'Remote browser engine' : `${entry.loaderLabel || entry.loader || 'Unknown'} • ${entry.modCount || 0} mods`}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {visibleEntries.length === 0 && (
                        <div style={{ color: '#8fa6bb', padding: '20px 12px', fontSize: '13px' }}>
                            No entries found.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'linear-gradient(180deg, #182430, #15202b)' }}>
                {selectedEntry ? (
                    activeTab === 'ports' ? renderPortDetails(selectedEntry) : renderMinecraftDetails(selectedEntry)
                ) : (
                    <div style={{ color: '#9fb3c8', fontSize: '15px' }}>Select an engine port or Minecraft version to inspect it.</div>
                )}
            </div>
        </div>
    );
}
