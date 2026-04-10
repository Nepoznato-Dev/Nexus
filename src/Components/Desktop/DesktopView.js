import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import Window from './Window';
import DesktopIcons from './DesktopIcons';
import { MouseOverlay } from './MouseOverlay';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    FileText,
    Folder,
    Globe,
    Gamepad2,
    Terminal as TerminalIcon,
    Activity,
    Package,
    Menu,
    Settings,
    Shield,
    User,
    LogOut,
    Search,
    Power,
    Clock,
    Pin,
    PinOff,
    Scissors,
    Music,
    Film,
    Cloud,
    Image,
    Sparkles,
    Send,
    Wrench,
    Battery,
    BatteryCharging,
    Calendar,
    Wifi,
    Cable,
    Signal,
    VolumeX,
    Volume1,
    Volume2,
    Bell
} from 'lucide-react';
import ErrorWindow from './Apps/ErrorWindow';
import { session, storage } from '../Storage/clientStorage.js';
import nexusModStorage from '../Storage/nexusModStorage.js';
import modExecutor from '../Storage/modExecutor.js';
import { processQuickAsk } from '../F.L.U.X. - Fast Logic & URL eXtraction/sparkQueryEngine.js';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor.js';
import { registerErrorWindowTrigger } from '../../utils/errorWindowManager.js';
import { AlertTriangle } from 'lucide-react';

const CompactPerformanceMonitor = lazy(() => import('./CompactPerformanceMonitor'));

const APP_LOADERS = {
    'ai-chat': () => import('./Apps/AIApp'),
    'clock': () => import('./Apps/ClockApp'),
    'snipping': () => import('./Apps/SnippingToolApp'),
    'media-player': () => import('./Apps/MediaPlayerApp'),
    'movies-tv': () => import('./Apps/MoviesTvApp'),
    'weather': () => import('./Apps/WeatherApp'),
    'image-viewer': () => import('./Apps/ImageViewerApp'),
    'calculator': () => import('./Apps/CalculatorApp'),
    'notepad': () => import('./Apps/NotepadApp'),
    'files': () => import('./Apps/FileManagerApp'),
    'browser': () => import('./Apps/BrowserApp'),
    'games': () => import('./Apps/GamesApp'),
    'engines': () => import('./Apps/EnginesApp'),
    'terminal': () => import('./Apps/TerminalApp'),
    'taskmanager': () => import('./Apps/TaskManagerApp'),
    'mods': () => import('./Apps/ModsApp'),
    'settings': () => import('./Apps/SettingsApp'),
    'admin-dashboard': () => import('./Apps/AdminDashboardApp'),
};

const DESKTOP_WALLPAPER_STYLES = {
    'nexus-default': {
        background: '#1a1d2e',
        backgroundImage: `
        linear-gradient(0deg, #1a1d2e 24%, transparent 25%, transparent 75%, #1a1d2e 76%, #1a1d2e),
        linear-gradient(90deg, #1a1d2e 24%, transparent 25%, transparent 75%, #1a1d2e 76%, #1a1d2e)
      `,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
    },
    'windows-7': {
        background: 'radial-gradient(circle at 18% 20%, rgba(125, 202, 255, 0.55), rgba(12, 71, 145, 0.9) 55%, #031f56 100%)',
    },
    'windows-8': {
        background: 'linear-gradient(135deg, #1f6ed4 0%, #3b8ff1 35%, #6cb8ff 70%, #82d0ff 100%)',
    },
    'windows-10': {
        background: 'linear-gradient(120deg, #021f53 0%, #0a4ea6 35%, #0f7fdf 65%, #29a9ff 100%)',
    },
    'season-halloween': {
        background: 'radial-gradient(circle at 20% 15%, rgba(255, 149, 0, 0.35), rgba(45, 20, 8, 0.9) 45%, #13090a 100%)',
    },
    'season-christmas': {
        background: 'linear-gradient(145deg, #09291f 0%, #0f5132 35%, #7d1f1f 68%, #2f0b0b 100%)',
    },
    'season-easter': {
        background: 'linear-gradient(145deg, #f7c6d9 0%, #d9d1ff 30%, #bfe9ff 60%, #ffe9b8 100%)',
    },
    'season-newyear': {
        background: 'radial-gradient(circle at 30% 15%, rgba(244, 224, 255, 0.4), rgba(28, 28, 57, 0.92) 45%, #0a0e1f 100%)',
    },
};

function resolveDesktopWallpaperStyle(wallpaperId) {
    return DESKTOP_WALLPAPER_STYLES[wallpaperId] || DESKTOP_WALLPAPER_STYLES['nexus-default'];
}

function readDesktopWallpaperFromSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        return settings?.background?.desktopWallpaper || 'nexus-default';
    } catch {
        return 'nexus-default';
    }
}

function LoadingAppShell({ appName = 'App' }) {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e5e7eb',
            backgroundColor: '#0b1220',
            fontSize: '14px',
            fontWeight: 600,
        }}>
            Loading {appName}...
        </div>
    );
}

export default function DesktopView() {
    const { windows, openWindow, restoreWindow, minimizeWindow, closeWindow, bringToFront } = useWindowManager();
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorWindowData, setErrorWindowData] = useState(null);
    const errorWindowIdRef = useRef(null);
    const errorRetryCountRef = useRef(0);

    // Get real-time performance metrics from centralized monitor
    const metrics = usePerformanceMonitor();
    const systemStats = {
        cpu: metrics.cpu,
        gpu: metrics.gpu,
        ram: metrics.ram.percentage
    };

    // S.P.A.R.K Chat State
    const [sparkChatMode, setSparkChatMode] = useState(false);
    const [sparkChatHistory, setSparkChatHistory] = useState([]);
    const [sparkChatLoading, setSparkChatLoading] = useState(false);
    const [perfMonitorVisible, setPerfMonitorVisible] = useState(false);
    const [perfMonitorPosition, setPerfMonitorPosition] = useState({ x: 0, y: 0 });
    const [now, setNow] = useState(new Date());
    const [timeHover, setTimeHover] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [soundLevel, setSoundLevel] = useState(() => {
        const stored = localStorage.getItem('desktop_sound_level');
        return stored ? Number(stored) : 50;
    });
    const [notificationCount, setNotificationCount] = useState(0);
    const [hoveredWindow, setHoveredWindow] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [startDoubleClickTimer, setStartDoubleClickTimer] = useState(null);
    const [powerMenuOpen, setPowerMenuOpen] = useState(false);
    const [volumePopupOpen, setVolumePopupOpen] = useState(false);
    const [altTabOpen, setAltTabOpen] = useState(false);
    const [altTabIndex, setAltTabIndex] = useState(0);
    const [taskbarHoveredWindow, setTaskbarHoveredWindow] = useState(null);
    const [isMobile, setIsMobile] = useState(() => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    });
    const [pinnedTaskbar, setPinnedTaskbar] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('desktop_pinned_taskbar') || '[]');
        } catch (e) {
            return [];
        }
    });
    const [pinnedSidebar, setPinnedSidebar] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('desktop_pinned_sidebar') || '[]');
        } catch (e) {
            return [];
        }
    });
    // Inspector state for code inspection feature
    const [inspectMode, setInspectMode] = useState(false);
    const [inspectedElement, setInspectedElement] = useState(null);
    const [hooveredInspectElement, setHooveredInspectElement] = useState(null);
    const [contextMenuData, setContextMenuData] = useState(null); // {x, y, type: 'desktop'|'taskbar', options: []}
    const [desktopItems, setDesktopItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('desktop_items') || '[]');
        } catch (e) {
            return [];
        }
    });
    // Right panel state
    const [recentApps, setRecentApps] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('desktop_recent_apps') || '[]');
        } catch (e) {
            return [];
        }
    });
    const [customGroups, setCustomGroups] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('desktop_custom_groups') || '[]');
        } catch (e) {
            return [];
        }
    });
    const [weather, setWeather] = useState({ temp: 72, condition: 'Sunny' });
    const [renameItemId, setRenameItemId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [submenuOpen, setSubmenuOpen] = useState(null); // Track which submenu is open
    const [desktopGridOffset, setDesktopGridOffset] = useState({ x: 10, y: 10 });
    const [desktopWallpaper, setDesktopWallpaper] = useState(() => readDesktopWallpaperFromSettings());
    const [viewportSize, setViewportSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    });
    const appComponentCacheRef = useRef(new Map());
    const desktopContainerRef = useRef(null);
    const startHoverTimer = useRef(null);
    const popupStateRef = useRef({
        contextMenu: null,
        calendarOpen: false,
        powerMenuOpen: false,
        volumePopupOpen: false,
        altTabOpen: false,
    });
    const windowsRef = useRef([]);
    const altTabOpenRef = useRef(false);
    const altTabIndexRef = useRef(0);
    const navigate = useNavigate();

    useEffect(() => {
        popupStateRef.current = {
            contextMenu,
            calendarOpen,
            powerMenuOpen,
            volumePopupOpen,
            altTabOpen,
        };
    }, [contextMenu, calendarOpen, powerMenuOpen, volumePopupOpen, altTabOpen]);

    useEffect(() => {
        windowsRef.current = windows;
    }, [windows]);

    useEffect(() => {
        altTabOpenRef.current = altTabOpen;
    }, [altTabOpen]);

    useEffect(() => {
        altTabIndexRef.current = altTabIndex;
    }, [altTabIndex]);

    useEffect(() => {
        const syncWallpaper = (event) => {
            const next = event?.detail?.background?.desktopWallpaper || readDesktopWallpaperFromSettings();
            setDesktopWallpaper(next || 'nexus-default');
        };

        window.addEventListener('nexus:settings-changed', syncWallpaper);
        return () => {
            window.removeEventListener('nexus:settings-changed', syncWallpaper);
        };
    }, []);

    useEffect(() => {
        const refreshViewport = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', refreshViewport);
        refreshViewport();

        return () => {
            window.removeEventListener('resize', refreshViewport);
        };
    }, []);

    const isWindowPixelVisible = (desktopWindow) => {
        if (!desktopWindow || desktopWindow.minimized) return false;
        if (desktopWindow.maximized) return true;

        const right = desktopWindow.x + desktopWindow.width;
        const bottom = desktopWindow.y + desktopWindow.height;

        // Pixel-perfect culling: if no pixel intersects viewport, unload window content.
        return right > 0
            && bottom > 0
            && desktopWindow.x < viewportSize.width
            && desktopWindow.y < viewportSize.height;
    };

    // Element registry with JSX code snippets
    const elementRegistry = {
        taskbar: {
            name: 'Taskbar',
            component: 'DesktopView',
            description: 'Main taskbar with app pinning and window indicators',
            code: `{/* Taskbar with pinned apps and open windows */}
<div style={{
    position: taskbarPosition === 'left' ? 'fixed' : taskbarPosition === 'top' ? 'fixed' : 'fixed',
    left: taskbarPosition === 'left' ? 0 : undefined,
    top: taskbarPosition === 'top' ? 0 : undefined,
    bottom: taskbarPosition === 'bottom' ? 0 : undefined,
    right: 0,
    backgroundColor: 'rgba(15,15,15,0.9)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: taskbarPosition === 'left' ? 'column' : 'row',
    alignItems: 'center',
    padidng: '8px'
}}>
  {/* Start button with system stats */}
  <button onClick={handleStartClick}>Start</button>
  
  {/* Pinned apps */}
  {pinnedTaskbarApps.map(app => (
    <button key={app.id} onClick={() => launchApp(app)}>
      {app.name}
    </button>
  ))}
  
  {/* Open windows indicator */}
  {windows.map(window => (
    <div key={window.id}>{window.title}</div>
  ))}
</div>`
        },
        startMenu: {
            name: 'Start Menu',
            component: 'DesktopView',
            description: 'Windows-style start menu with search and app grid',
            code: `{/* Start Menu Popup */}
<div style={{
    position: 'fixed',
    bottom: taskbarPosition === 'bottom' ? '60px' : undefined,
    left: taskbarPosition === 'left' ? '60px' : undefined,
    top: taskbarPosition === 'top' ? '60px' : undefined,
    zIndex: 10010,
    backgroundColor: 'rgba(20,20,20,0.98)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '350px',
    maxHeight: '500px',
    padding: '8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
}}>
  <SearchBar value={searchQuery} onChange={setSearchQuery} />
  <AppGrid apps={filteredApps} onAppClick={openWindow} />
  <PowerMenu />
</div>`
        },
        systemTray: {
            name: 'System Tray',
            component: 'DesktopView',
            description: 'Status area with WiFi, volume, battery, and notifications',
            code: `{/* System Tray */}
<div style={{
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    marginLeft: 'auto'
}}>
  {/* Network Indicator */}
  <div style={{
    display: 'flex',
    gap: '1px',
    alignItems: 'flex-end',
    height: '14px'
  }}>
    {getNetworkType() === 'ethernet' ? (
      <Cable size={14} color="#10b981" />
    ) : getNetworkType() === 'cellular' ? (
      <Signal size={14} color={getNetworkStrength() >= 3 ? '#10b981' : getNetworkStrength() >= 2 ? '#f59e0b' : '#ef4444'} />
    ) : (
      [...Array(4)].map((_, i) => (
        <div key={i} style={{
          width: '2px',
          height: (i + 1) * 3.5 + 'px',
          backgroundColor: i < getNetworkStrength() ? '#10b981' : '#555',
          borderRadius: '1px'
        }} />
      ))
    )}
  </div>
  
  {/* Volume Control */}
  <button onClick={() => setVolumePopupOpen(!volumePopupOpen)}>
    🔊 {soundLevel}%
  </button>
  
  {/* Battery Indicator */}
  <div>🔋 {metrics.battery.level}%</div>
  
  {/* Clock */}
  <div>{now.toLocaleTimeString()}</div>
</div>`,
        },
        altTab: {
            name: 'Alt+Tab Switcher',
            component: 'DesktopView',
            description: 'Task switcher overlay for window navigation',
            code: `{/* Alt+Tab Task Switcher */}
{altTabOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 10020,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      backgroundColor: 'rgba(20,20,20,0.95)',
      borderRadius: '16px',
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px'
    }}>
      {windows.filter(w => !w.minimized).map((window, index) => (
        <div key={window.id} style={{
          padding: '16px',
          backgroundColor: index === altTabIndex ? 'rgba(77,150,255,0.2)' : 'rgba(255,255,255,0.03)',
          border: \`2px solid \${index === altTabIndex ? '#4d96ff' : 'rgba(255,255,255,0.08)'}\`,
          borderRadius: '8px'
        }}>
          {window.icon}
          <div>{window.title}</div>
        </div>
      ))}
    </div>
  </div>
)}`
        },
        windows: {
            name: 'Draggable Windows',
            component: 'Window',
            description: 'Individual window components with title bar and controls',
            code: `{/* Individual Window Component */}
{windows.map(window => (
  <Window
    key={window.id}
    window={window}
    onBringToFront={() => bringToFront(window.id)}
    onMove={(pos) => updateWindowPosition(window.id, pos)}
    onResize={(size) => updateWindowSize(window.id, size)}
  >
    <component.Component appId={window.id} />
  </Window>
))}

// Window Component Structure:
<div draggable style={{
  position: 'absolute',
  left: window.x,
  top: window.y,
  width: window.width,
  height: window.height,
  zIndex: window.zIndex,
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
  display: 'flex',
  flexDirection: 'column'
}}>
  <TitleBar window={window} />
  <Content>{/* App content */}</Content>
</div>`
        },
        contextMenu: {
            name: 'Context Menu',
            component: 'DesktopView',
            description: 'Right-click context menu for desktop and app pinning',
            code: `{/* Context Menu */}
{contextMenu && (
  <div style={{
    position: 'fixed',
    left: contextMenu.x,
    top: contextMenu.y,
    backgroundColor: 'rgba(25,25,25,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    zIndex: 10005,
    minWidth: '200px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.6)'
  }}>
    <MenuItem onClick={() => pinApp(contextMenu.appId, 'taskbar')}>
      Pin to Taskbar
    </MenuItem>
    <MenuItem onClick={() => pinApp(contextMenu.appId, 'sidebar')}>
      Pin to Sidebar
    </MenuItem>
  </div>
)}`
        },
        desktopIcons: {
            name: 'Desktop Icons',
            component: 'DesktopIcons',
            description: 'Double-click launchable icons on desktop',
            code: `{/* Desktop Icons */}
<div style={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: '20px',
    pointerEvents: 'none'
}}>
  {apps.map(app => (
    <div
      key={app.id}
      onDoubleClick={() => launchApp(app)}
      style={{
        cursor: 'pointer',
        pointerEvents: 'auto',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px'
      }}
    >
      {app.icon}
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        {app.name}
      </div>
    </div>
  ))}
</div>`
        },
        volumePopup: {
            name: 'Volume Control Popup',
            component: 'DesktopView',
            description: 'Volume slider (0-150%) with mute toggle and visual feedback',
            code: `{/* Volume Popup */}
{volumePopupOpen && (
  <div style={{
    position: 'absolute',
    right: '60px',
    bottom: '50px',
    backgroundColor: 'rgba(25,25,25,0.95)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '16px',
    zIndex: 10005,
    minWidth: '180px'
  }}>
    <input 
      type="range" 
      min="0" 
      max="150" 
      value={soundLevel}
      onChange={(e) => setSoundLevel(Number(e.target.value))}
      style={{ width: '100%' }}
    />
    <div style={{ 
      color: '#aaa', 
      fontSize: '12px', 
      marginTop: '8px',
      textAlign: 'center'
    }}>
      {soundLevel}%
    </div>
  </div>
)}`
        },
        performanceMonitor: {
            name: 'Performance Monitor',
            component: 'CompactPerformanceMonitor',
            description: 'Real-time CPU, GPU, and RAM usage display with color indicators',
            code: `{/* Compact Performance Monitor */}
{perfMonitorVisible && (
  <div style={{
    position: 'fixed',
    left: perfMonitorPosition.x,
    top: perfMonitorPosition.y,
    backgroundColor: 'rgba(20,20,20,0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px',
    fontFamily: 'monospace',
    fontSize: '11px',
    minWidth: '150px'
  }}>
    <div>CPU: {systemStats.cpu}%</div>
    <div>GPU: {systemStats.gpu}%</div>
    <div>RAM: {systemStats.ram}%</div>
  </div>
)}`
        },
        windowManager: {
            name: 'Window Manager',
            component: 'WindowManager (Context)',
            description: 'Manages window state, z-index, position, size, and lifecycle',
            code: `// WindowManager Context provides:
{
  windows: Array<Window>,
  openWindow: (appId, config?) => void,
  closeWindow: (appId) => void,
  minimizeWindow: (appId) => void,
  restoreWindow: (appId) => void,
  updateWindowPosition: (appId, x, y) => void,
  updateWindowSize: (appId, width, height) => void,
  bringToFront: (appId) => void
}

// Each window has:
{
  id: string,
  appId: string,
  title: string,
  icon: React.ReactNode,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  minimized: boolean,
  maximized: boolean,
  component: React.ComponentType
}`
        },
        startButton: {
            name: 'Start Button',
            component: 'DesktopView',
            description: 'Toggles Start Menu and shows system stats (CPU/GPU/RAM)',
            code: `{/* Start Menu Button */}
<button
  onClick={handleStartClick}
  style={{
    padding: '8px 12px',
    backgroundColor: startMenuOpen ? '#3a3a3a' : 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s'
  }}
>
  {/* System Stats Indicator */}
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  }}>
    <div style={{
      width: '14px',
      height: '3px',
      backgroundColor: getCpuColor(),
      borderRadius: '1px'
    }} />
    <div style={{
      width: '14px',
      height: '3px',
      backgroundColor: getGpuColor(),
      borderRadius: '1px'
    }} />
    <div style={{
      width: '14px',
      height: '3px',
      backgroundColor: getRamColor(),
      borderRadius: '1px'
    }} />
  </div>
  Start
</button>`
        }
    };



    // Get taskbar settings from localStorage
    const taskbarPosition = localStorage.getItem('desktop_taskbar_position') || 'bottom';
    const taskbarStyle = localStorage.getItem('desktop_taskbar_style') || 'modern';
    const windowsVersion = localStorage.getItem('desktop_windows_version') || '11';

    // Styled icon component
    const AppIcon = ({ icon: Icon, color, size = 24 }) => (
        <div style={{
            width: size === 24 ? '48px' : '32px',
            height: size === 24 ? '48px' : '32px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}dd 0%, ${color}aa 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}40`,
        }}>
            <Icon size={size} color="#fff" strokeWidth={2.5} />
        </div>
    );

    const isAdmin = session.isAdmin?.() || false;

    useEffect(() => {
        let tick = 0;
        const interval = setInterval(() => {
            tick += 1;
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';

            // Keep taskbar time fresh while active, but throttle hidden-tab updates.
            if (isVisible || tick % 15 === 0) {
                setNow(new Date());
            }
        }, 2000);

        const handleVisibility = () => {
            if (typeof document === 'undefined' || document.visibilityState === 'visible') {
                setNow(new Date());
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('desktop_sound_level', String(soundLevel));
    }, [soundLevel]);

    useEffect(() => {
        const handleClickAway = () => {
            const popupState = popupStateRef.current;
            if (popupState.contextMenu) setContextMenu(null);
            if (popupState.calendarOpen) setCalendarOpen(false);
            if (popupState.powerMenuOpen) setPowerMenuOpen(false);
            if (popupState.volumePopupOpen) setVolumePopupOpen(false);
            if (popupState.altTabOpen) setAltTabOpen(false);
        };
        document.addEventListener('click', handleClickAway);
        return () => document.removeEventListener('click', handleClickAway);
    }, []);

    // Keyboard shortcuts (Alt+Tab, Win key, Ctrl+Shift+I for inspector)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Shift+I to toggle element inspector
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                setInspectMode((prev) => {
                    const next = !prev;
                    if (!next) {
                        setInspectedElement(null);
                        setHooveredInspectElement(null);
                    }
                    return next;
                });
            }

            // Alt+Tab to open task switcher
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                const visibleWindows = windowsRef.current.filter((w) => !w.minimized);
                if (visibleWindows.length > 0) {
                    const nextIndex = altTabOpenRef.current
                        ? ((altTabIndexRef.current + 1) % visibleWindows.length)
                        : 0;

                    altTabOpenRef.current = true;
                    altTabIndexRef.current = nextIndex;
                    setAltTabOpen(true);
                    setAltTabIndex(nextIndex);
                }
            }

            // Win key to toggle Start menu
            if (e.key === 'Meta' || e.key === 'OS') {
                e.preventDefault();
                setStartMenuOpen((prev) => !prev);
            }
        };

        const handleKeyUp = (e) => {
            // Release Alt to switch to selected window
            if (!e.altKey && altTabOpenRef.current) {
                const visibleWindows = windowsRef.current.filter((w) => !w.minimized);
                const targetWindow = visibleWindows[altTabIndexRef.current];
                if (targetWindow) {
                    restoreWindow(targetWindow.id);
                }

                altTabOpenRef.current = false;
                altTabIndexRef.current = 0;
                setAltTabOpen(false);
                setAltTabIndex(0);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [restoreWindow]);

    useEffect(() => {
        let cancelled = false;

        const initMods = async () => {
            try {
                await nexusModStorage.initialize();
                if (cancelled) return;
                const enabledMods = nexusModStorage.getEnabledMods();
                await modExecutor.executeAllMods(enabledMods);
            } catch (error) {
                console.error('Failed to initialize mods:', error);
            }
        };

        initMods();
        return () => {
            cancelled = true;
        };
    }, []);

    // Register global error window trigger
    useEffect(() => {
        const handleErrorWindow = (errorData) => {
            errorRetryCountRef.current += 1;
            const enrichedError = {
                ...errorData,
                retryCount: errorRetryCountRef.current
            };
            setErrorWindowData(enrichedError);

            // Open or update error window
            if (errorWindowIdRef.current && windows.find(w => w.id === errorWindowIdRef.current)) {
                // Error window already exists, just update data
                // Window will re-render with new props
            } else {
                // Create new error window
                const windowId = `error-${Date.now()}`;
                errorWindowIdRef.current = windowId;

                openWindow({
                    id: windowId,
                    title: 'System Error',
                    icon: <AlertTriangle size={16} color="#d32f2f" />,
                    component: ErrorWindow,
                    componentProps: {
                        errorData: enrichedError,
                        onRetry: enrichedError.retryAction ? () => {
                            if (enrichedError.retryAction) {
                                enrichedError.retryAction();
                            }
                        } : null,
                        onDismiss: () => {
                            if (errorWindowIdRef.current) {
                                closeWindow(errorWindowIdRef.current);
                                errorWindowIdRef.current = null;
                                setErrorWindowData(null);
                                errorRetryCountRef.current = 0;
                            }
                        }
                    },
                    alwaysOnTop: true,
                    width: 450,
                    height: 200,
                    x: (window.innerWidth - 450) / 2,
                    y: (window.innerHeight - 200) / 2,
                });
            }
        };

        registerErrorWindowTrigger(handleErrorWindow);

        return () => {
            registerErrorWindowTrigger(null);
        };
    }, [windows, openWindow, closeWindow]);

    const baseApps = [
        { id: 'ai-chat', name: 'I.R.I.S. AI', icon: <AppIcon icon={Sparkles} color="#a855f7" />, smallIcon: <Sparkles size={16} />, width: 900, height: 700 },
        { id: 'clock', name: 'Clock', icon: <AppIcon icon={Clock} color="#22c55e" />, smallIcon: <Clock size={16} />, width: 420, height: 520 },
        { id: 'snipping', name: 'Snipping Tool', icon: <AppIcon icon={Scissors} color="#f97316" />, smallIcon: <Scissors size={16} />, width: 720, height: 480 },
        { id: 'media-player', name: 'Media Player', icon: <AppIcon icon={Music} color="#22d3ee" />, smallIcon: <Music size={16} />, width: 740, height: 520 },
        { id: 'movies-tv', name: 'Movies & TV', icon: <AppIcon icon={Film} color="#a855f7" />, smallIcon: <Film size={16} />, width: 920, height: 650 },
        { id: 'weather', name: 'Weather', icon: <AppIcon icon={Cloud} color="#06b6d4" />, smallIcon: <Cloud size={16} />, width: 450, height: 650 },
        { id: 'image-viewer', name: 'Image Viewer', icon: <AppIcon icon={Image} color="#f59e0b" />, smallIcon: <Image size={16} />, width: 900, height: 700 },
        { id: 'calculator', name: 'Calculator', icon: <AppIcon icon={Calculator} color="#3b82f6" />, smallIcon: <Calculator size={16} />, width: 400, height: 550 },
        { id: 'notepad', name: 'Notepad', icon: <AppIcon icon={FileText} color="#8b5cf6" />, smallIcon: <FileText size={16} />, width: 700, height: 500 },
        { id: 'files', name: 'File Manager', icon: <AppIcon icon={Folder} color="#f59e0b" />, smallIcon: <Folder size={16} />, width: 800, height: 600 },
        { id: 'browser', name: 'Browser', icon: <AppIcon icon={Globe} color="#06b6d4" />, smallIcon: <Globe size={16} />, width: 1000, height: 700 },
        { id: 'games', name: 'Hydrux', icon: <AppIcon icon={Gamepad2} color="#ec4899" />, smallIcon: <Gamepad2 size={16} />, width: 1100, height: 750 },
        { id: 'engines', name: 'Engines Lab', icon: <AppIcon icon={Wrench} color="#3b82f6" />, smallIcon: <Wrench size={16} />, width: 1180, height: 760 },
        { id: 'terminal', name: 'Terminal', icon: <AppIcon icon={TerminalIcon} color="#10b981" />, smallIcon: <TerminalIcon size={16} />, width: 800, height: 500 },
        { id: 'taskmanager', name: 'Task Manager', icon: <AppIcon icon={Activity} color="#ef4444" />, smallIcon: <Activity size={16} />, alwaysOnTop: true, width: 700, height: 550 },
        { id: 'mods', name: 'Mods', icon: <AppIcon icon={Package} color="#14b8a6" />, smallIcon: <Package size={16} />, width: 800, height: 600 },
        { id: 'settings', name: 'Settings', icon: <AppIcon icon={Settings} color="#64748b" />, smallIcon: <Settings size={16} />, width: 900, height: 700, showInStart: false },
    ];

    const apps = isAdmin
        ? [...baseApps, { id: 'admin-dashboard', name: 'Admin Console', icon: <AppIcon icon={Shield} color="#ef4444" />, smallIcon: <Shield size={16} />, width: 1100, height: 750 }]
        : baseApps;

    const getAppById = (appId) => apps.find(app => app.id === appId);

    // Resolve persisted references (ID or legacy object shape) to a live app object.
    const resolveStoredApp = (storedApp) => {
        if (!storedApp) return null;
        if (typeof storedApp === 'string') return getAppById(storedApp) || null;
        if (typeof storedApp === 'object' && typeof storedApp.id === 'string') {
            return getAppById(storedApp.id) || null;
        }
        return null;
    };

    const togglePin = (appId, target) => {
        if (target === 'taskbar') {
            const next = pinnedTaskbar.includes(appId)
                ? pinnedTaskbar.filter(id => id !== appId)
                : [...pinnedTaskbar, appId];
            setPinnedTaskbar(next);
            localStorage.setItem('desktop_pinned_taskbar', JSON.stringify(next));
            return;
        }

        const next = pinnedSidebar.includes(appId)
            ? pinnedSidebar.filter(id => id !== appId)
            : [...pinnedSidebar, appId];
        setPinnedSidebar(next);
        localStorage.setItem('desktop_pinned_sidebar', JSON.stringify(next));
    };

    const pinnedTaskbarApps = pinnedTaskbar
        .map(id => getAppById(id))
        .filter(Boolean);

    const pinnedSidebarApps = pinnedSidebar
        .map(id => getAppById(id))
        .filter(Boolean);

    const getRamColor = () => {
        if (systemStats.ram >= 80) return '#ef4444'; // Red for 80%+
        if (systemStats.ram >= 60) return '#f59e0b'; // Yellow for 60%+
        return '#10b981'; // Green
    };

    const getCpuColor = () => {
        if (systemStats.cpu >= 80) return '#ef4444'; // Red for 80%+
        if (systemStats.cpu >= 60) return '#f59e0b'; // Yellow for 60%+
        return '#10b981'; // Green
    };

    const getGpuColor = () => {
        if (systemStats.gpu >= 80) return '#ef4444'; // Red for 80%+
        if (systemStats.gpu >= 60) return '#f59e0b'; // Yellow for 60%+
        return '#10b981'; // Green
    };

    const getBatteryColor = () => {
        const batteryLevel = metrics.battery.level;
        if (batteryLevel <= 20) return '#ef4444';
        if (batteryLevel <= 50) return '#f59e0b';
        return '#10b981';
    };

    // Network helpers
    const getNetworkStrength = () => {
        const { effectiveType, downlink } = metrics.network;
        // Determine signal strength based on connection quality
        if (effectiveType === 'slow-2g' || downlink < 0.5) return 1;
        if (effectiveType === '2g' || downlink < 1.5) return 2;
        if (effectiveType === '3g' || downlink < 5) return 3;
        return 4; // 4g, 5g, or high speed
    };

    const getNetworkType = () => {
        const type = metrics.network.type?.toLowerCase() || 'unknown';
        if (type.includes('wifi')) return 'wifi';
        if (type.includes('ethernet') || type.includes('wired')) return 'ethernet';
        if (type.includes('cellular') || type.includes('mobile') || type.includes('3g') || type.includes('4g') || type.includes('5g')) return 'cellular';
        return 'wifi'; // Default to wifi icon for unknown
    };

    const getNetworkQuality = () => {
        const strength = getNetworkStrength();
        if (strength === 4) return 'Excellent';
        if (strength === 3) return 'Good';
        if (strength === 2) return 'Fair';
        return 'Weak';
    };

    const handleShowDesktop = () => {
        windows.forEach(window => {
            if (!window.minimized) minimizeWindow(window.id);
        });
    };

    const loadAppComponent = async (appId) => {
        const cached = appComponentCacheRef.current.get(appId);
        if (cached) return cached;

        const loader = APP_LOADERS[appId];
        if (!loader) {
            throw new Error(`No loader configured for app id: ${appId}`);
        }

        const module = await loader();
        const component = module?.default;
        if (!component) {
            throw new Error(`App module for ${appId} has no default export`);
        }

        appComponentCacheRef.current.set(appId, component);
        return component;
    };

    const openAppWindow = async (app, overrides = {}) => {
        if (!app) return;

        const windowId = overrides.id ?? app.id;
        const loadingWindowId = `${windowId}__loading`;
        const existingWindow = windows.find((window) => window.id === windowId);
        if (existingWindow) {
            if (existingWindow.minimized) {
                restoreWindow(windowId);
            }
            bringToFront(windowId);
            return;
        }

        const existingLoadingWindow = windows.find((window) => window.id === loadingWindowId);
        if (existingLoadingWindow) {
            if (existingLoadingWindow.minimized) {
                restoreWindow(loadingWindowId);
            }
            bringToFront(loadingWindowId);
            return;
        }

        const loadingTitle = overrides.title ?? app.name;
        const loadingIcon = overrides.icon ?? app.smallIcon ?? app.icon;

        openWindow({
            id: loadingWindowId,
            title: loadingTitle,
            icon: loadingIcon,
            component: () => <LoadingAppShell appName={app.name} />,
            alwaysOnTop: overrides.alwaysOnTop ?? app.alwaysOnTop,
            width: overrides.width ?? app.width ?? 800,
            height: overrides.height ?? app.height ?? 600,
            x: overrides.x ?? (100 + (windows.length * 30)),
            y: overrides.y ?? (100 + (windows.length * 30)),
            componentProps: overrides.componentProps,
        });

        try {
            const component = await loadAppComponent(app.id);
            closeWindow(loadingWindowId);
            openWindow({
                id: windowId,
                title: loadingTitle,
                icon: loadingIcon,
                component,
                alwaysOnTop: overrides.alwaysOnTop ?? app.alwaysOnTop,
                width: overrides.width ?? app.width ?? 800,
                height: overrides.height ?? app.height ?? 600,
                x: overrides.x ?? (100 + (windows.length * 30)),
                y: overrides.y ?? (100 + (windows.length * 30)),
                componentProps: overrides.componentProps,
            });
        } catch (error) {
            closeWindow(loadingWindowId);
            openWindow({
                id: `${windowId}-load-error`,
                title: `${app.name} - Load Error`,
                icon: <AlertTriangle size={16} color="#ef4444" />,
                component: () => (
                    <div style={{ padding: '16px', color: '#fff' }}>
                        Failed to load {app.name}.<br />
                        <span style={{ color: '#fca5a5', fontSize: '12px' }}>{error.message}</span>
                    </div>
                ),
                width: 420,
                height: 180,
                x: overrides.x ?? 120,
                y: overrides.y ?? 120,
                alwaysOnTop: true,
            });
        }
    };

    const handleStartClick = () => {
        if (startDoubleClickTimer) {
            // Double click detected - minimize all windows
            clearTimeout(startDoubleClickTimer);
            setStartDoubleClickTimer(null);
            handleShowDesktop();
        } else {
            // First click - start the timer
            const timer = setTimeout(() => {
                setStartDoubleClickTimer(null);
                setStartMenuOpen(!startMenuOpen);
            }, 300);
            setStartDoubleClickTimer(timer);
        }
    };

    const handleLogout = () => {
        session.clear();
        navigate('/');
    };

    const handleShutdown = () => {
        // Close all windows
        windows.forEach(window => minimizeWindow(window.id));
        setPowerMenuOpen(false);
        setStartMenuOpen(false);
    };

    const handleRestart = () => {
        // Reset the desktop UI (clear all windows but don't reload page)
        windows.forEach(window => minimizeWindow(window.id));
        setPowerMenuOpen(false);
        setStartMenuOpen(false);
        // Could add a visual "restarting" effect here if desired
    };

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const fullDateTime = now.toLocaleString();

    const getCalendarDays = () => {
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    };

    const launchApp = (app) => {
        if (!app) return;

        const resolvedApp = app.name ? app : getAppById(app.id);
        if (!resolvedApp) return;

        openAppWindow(resolvedApp);

        // Track recent apps
        setRecentApps(prev => {
            const prevIds = prev
                .map(entry => (typeof entry === 'string' ? entry : entry?.id))
                .filter(id => typeof id === 'string');
            const filtered = prevIds.filter(id => id !== resolvedApp.id);
            const updated = [resolvedApp.id, ...filtered].slice(0, 6);
            localStorage.setItem('desktop_recent_apps', JSON.stringify(updated));
            return updated;
        });

        setStartMenuOpen(false);
        setSearchQuery('');
    };

    // Expose a safe desktop app launcher API for terminal/user commands.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.nexusDesktop = {
            launchAppById: (appId) => {
                const target = getAppById(appId);
                if (!target) return { success: false, error: `Unknown app id: ${appId}` };
                launchApp(target);
                return { success: true, appId: target.id, appName: target.name };
            },
            listApps: () => apps.map(app => ({ id: app.id, name: app.name })),
        };

        return () => {
            delete window.nexusDesktop;
        };
    }, [apps]);

    // ═══════════════════════════════════════════════════════════════
    // S.P.A.R.K Chat Functions
    // ═══════════════════════════════════════════════════════════════

    const handleStartSparkChat = async () => {
        if (!searchQuery.trim()) return;

        const userMessage = searchQuery.trim();
        setSparkChatMode(true);
        setStartMenuOpen(false);

        // Add user message to history
        setSparkChatHistory([{
            role: 'USER',
            message: userMessage,
            timestamp: Date.now()
        }]);

        setSearchQuery('');
        await handleSparkMessage(userMessage);
    };

    const handleSparkMessage = async (message) => {
        setSparkChatLoading(true);

        try {
            const apiKeys = await storage.getApiKeys();
            const userName = session.getUser()?.username || 'User';

            const sparkResponse = await processQuickAsk(
                message,
                userName,
                {
                    apiKeys: {
                        openai: apiKeys?.openai,
                        google: apiKeys?.google,
                    },
                    conversationHistory: sparkChatHistory
                }
            );

            setSparkChatHistory(prev => [...prev, {
                role: 'SPARK',
                message: sparkResponse?.response || "Sorry, I couldn't process that.",
                timestamp: Date.now()
            }]);
        } catch (error) {
            console.error('[S.P.A.R.K Chat] Error:', error);
            setSparkChatHistory(prev => [...prev, {
                role: 'SPARK',
                message: `Error: ${error.message || 'Failed to get response'}`,
                timestamp: Date.now()
            }]);
        } finally {
            setSparkChatLoading(false);
        }
    };

    const handleSendSparkMessage = async () => {
        if (!searchQuery.trim() || sparkChatLoading) return;

        const userMessage = searchQuery.trim();
        setSparkChatHistory(prev => [...prev, {
            role: 'USER',
            message: userMessage,
            timestamp: Date.now()
        }]);

        setSearchQuery('');
        await handleSparkMessage(userMessage);
    };

    const handleOpenSettings = () => {
        setStartMenuOpen(false);
        launchApp(getAppById('settings'));
    };

    const handleOpenProfile = () => {
        setStartMenuOpen(false);
        navigate('/profile');
    };

    const handleSignOut = () => {
        localStorage.setItem('desktop_mode', 'false');
        window.location.reload();
    };

    const handleStartHover = (event) => {
        if (!startMenuOpen) {
            event.currentTarget.style.backgroundColor = '#2a2a2a';
        }
        if (startHoverTimer.current) {
            clearTimeout(startHoverTimer.current);
        }
        const rect = event.currentTarget.getBoundingClientRect();
        startHoverTimer.current = setTimeout(() => {
            setPerfMonitorPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
            });
            setPerfMonitorVisible(true);
        }, 1200);
    };

    const handleStartLeave = (event) => {
        if (!startMenuOpen) {
            event.currentTarget.style.backgroundColor = 'transparent';
        }
        if (startHoverTimer.current) {
            clearTimeout(startHoverTimer.current);
            startHoverTimer.current = null;
        }
        setPerfMonitorVisible(false);
    };

    useEffect(() => {
        return () => {
            if (startHoverTimer.current) {
                clearTimeout(startHoverTimer.current);
                startHoverTimer.current = null;
            }
        };
    }, []);

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const startApps = filteredApps.filter(app => app.showInStart !== false);
    const sortedStartApps = [...startApps].sort((a, b) => a.name.localeCompare(b.name));
    const calendarDays = getCalendarDays();
    const calendarTitle = now.toLocaleDateString([], { month: 'long', year: 'numeric' });

    // Determine taskbar layout based on Windows version and open windows
    const isWin11 = windowsVersion === '11' && taskbarPosition === 'bottom';
    const hasOpenWindows = windows.filter(w => !w.minimized).length > 0;

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const monitorPadding = 12;
    const monitorWidth = 180;
    const monitorHeight = 170;
    const reservedLeft = taskbarPosition === 'left' ? 72 : 0;
    const reservedBottom = taskbarPosition === 'bottom' ? 56 : 0;
    const clampedMonitorX = Math.min(
        Math.max(perfMonitorPosition.x, monitorPadding + reservedLeft),
        viewportWidth - monitorWidth - monitorPadding
    );
    const clampedMonitorY = Math.min(
        Math.max(perfMonitorPosition.y, monitorPadding),
        viewportHeight - monitorHeight - monitorPadding - reservedBottom
    );

    // Win11 centering logic: START centered when no windows, shifts left when windows open
    const taskbarClasses = taskbarPosition === 'left'
        ? 'fixed left-0 top-0 h-full w-16 flex-col'
        : 'fixed bottom-0 left-0 right-0 h-12 flex-row';

    // Grid system constants (same as DesktopIcons)
    const ICON_SIZE = 100;
    const GRID_SPACING = 10;
    const GRID_SIZE = ICON_SIZE + GRID_SPACING; // 110px

    // Calculate dynamic grid offset (same as DesktopIcons)
    useEffect(() => {
        const calculateOffset = () => {
            if (desktopContainerRef.current) {
                const containerWidth = desktopContainerRef.current.clientWidth;
                const containerHeight = desktopContainerRef.current.clientHeight;

                const cellsX = Math.floor(containerWidth / GRID_SIZE);
                const cellsY = Math.floor(containerHeight / GRID_SIZE);

                const remainderX = containerWidth - (cellsX * GRID_SIZE);
                const remainderY = containerHeight - (cellsY * GRID_SIZE);

                setDesktopGridOffset({
                    x: Math.floor(remainderX / 2),
                    y: Math.floor(remainderY / 2)
                });
            }
        };

        calculateOffset();
        window.addEventListener('resize', calculateOffset);
        return () => window.removeEventListener('resize', calculateOffset);
    }, []);

    // Snap to grid function (same as DesktopIcons)
    const snapToGrid = (x, y) => {
        return {
            x: Math.round((x - desktopGridOffset.x) / GRID_SIZE) * GRID_SIZE + desktopGridOffset.x,
            y: Math.round((y - desktopGridOffset.y) / GRID_SIZE) * GRID_SIZE + desktopGridOffset.y,
        };
    };

    // Persist desktop items to localStorage
    useEffect(() => {
        localStorage.setItem('desktop_items', JSON.stringify(desktopItems));
    }, [desktopItems]);

    // Desktop items management functions
    const createDesktopItem = (type, x, y) => {
        const timestamp = Date.now();
        // Snap to grid using the same system as DesktopIcons
        const snapped = snapToGrid(x || 20, y || 80);

        const newItem = {
            id: `desktop-item-${timestamp}`,
            type: type, // 'folder', 'textfile', 'image', 'audio'
            name: type === 'folder' ? 'New Folder' : type === 'textfile' ? 'Document.txt' : type === 'image' ? 'Image.jpg' : 'Audio.mp3',
            x: snapped.x,
            y: snapped.y,
            content: '', // For text files and images (base64)
            folderContents: [] // For folders - stores app IDs or nested items
        };
        setDesktopItems([...desktopItems, newItem]);
        return newItem;
    };

    const openDesktopItem = (item) => {
        if (item.type === 'folder') {
            // Open folder window
            openWindow({
                id: `folder-${item.id}`,
                title: item.name,
                icon: <Folder size={16} />,
                component: () => (
                    <div style={{
                        padding: '20px',
                        color: '#fff',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>📁 {item.name}</h3>
                        <div style={{
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            {item.folderContents && item.folderContents.length > 0 ? (
                                <div>Folder contains {item.folderContents.length} items</div>
                            ) : (
                                <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
                                    This folder is empty
                                </div>
                            )}
                        </div>
                    </div>
                ),
                width: 600,
                height: 400,
            });
        } else if (item.type === 'textfile') {
            // Open in Notepad
            const notepadApp = apps.find(app => app.id === 'notepad');
            if (notepadApp) {
                openAppWindow(notepadApp, {
                    id: `notepad-${item.id}`,
                    title: item.name,
                    icon: notepadApp.icon,
                    width: 700,
                    height: 500,
                });
            }
        } else if (item.type === 'image') {
            // Open in Image Viewer
            const imageViewerApp = apps.find(app => app.id === 'image-viewer');
            if (imageViewerApp) {
                openAppWindow(imageViewerApp, {
                    id: `image-${item.id}`,
                    title: item.name,
                    icon: imageViewerApp.icon,
                    width: 800,
                    height: 600,
                });
            }
        } else if (item.type === 'audio') {
            // Open in Media Player
            const mediaPlayerApp = apps.find(app => app.id === 'media-player');
            if (mediaPlayerApp) {
                openAppWindow(mediaPlayerApp, {
                    id: `audio-${item.id}`,
                    title: item.name,
                    icon: mediaPlayerApp.icon,
                    width: 400,
                    height: 300,
                });
            }
        }
    };

    const deleteDesktopItem = (itemId) => {
        setDesktopItems(desktopItems.filter(item => item.id !== itemId));
    };

    const renameDesktopItem = (itemId, newName) => {
        setDesktopItems(desktopItems.map(item =>
            item.id === itemId ? { ...item, name: newName } : item
        ));
        setRenameItemId(null);
    };

    const updateItemPosition = (itemId, x, y) => {
        setDesktopItems(desktopItems.map(item =>
            item.id === itemId ? { ...item, x, y } : item
        ));
    };

    // Context menu handlers
    const handleDesktopContextMenu = (e) => {
        e.preventDefault();
        const clickX = e.clientX;
        const clickY = e.clientY;

        setContextMenuData({
            x: clickX,
            y: clickY,
            type: 'desktop',
            options: [
                { id: 'refresh', label: 'Refresh', action: () => window.location.reload() },
                { id: 'separator1', type: 'separator' },
                {
                    id: 'new_items', label: 'New', submenu: [
                        {
                            id: 'new_folder_item',
                            label: '📁 Folder',
                            action: () => {
                                createDesktopItem('folder', clickX - 50, clickY - 20);
                                setContextMenuData(null);
                            }
                        },
                        {
                            id: 'new_textfile_item',
                            label: '📄 Text File',
                            action: () => {
                                createDesktopItem('textfile', clickX - 50, clickY - 20);
                                setContextMenuData(null);
                            }
                        },
                        {
                            id: 'new_image_item',
                            label: '🖼️ Image',
                            action: () => {
                                createDesktopItem('image', clickX - 50, clickY - 20);
                                setContextMenuData(null);
                            }
                        },
                        {
                            id: 'new_audio_item',
                            label: '🎵 Audio File',
                            action: () => {
                                createDesktopItem('audio', clickX - 50, clickY - 20);
                                setContextMenuData(null);
                            }
                        }
                    ]
                },
                {
                    id: 'display_settings', label: '🎨 Display Settings', action: () => {
                        openAppWindow(getAppById('settings'), {
                            id: 'settings-display',
                            title: 'Display Settings',
                            icon: <Settings size={16} />,
                            width: 900,
                            height: 700,
                        });
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'personalize', label: '✨ Personalize', action: () => {
                        openAppWindow(getAppById('settings'), {
                            id: 'settings-personalize',
                            title: 'Personalization',
                            icon: <Settings size={16} />,
                            width: 900,
                            height: 700,
                        });
                        setContextMenuData(null);
                    }
                },
                { id: 'separator2', type: 'separator' },
                { id: 'properties', label: 'Properties', action: () => alert('Desktop properties') }
            ]
        });
    };

    const handleTaskbarContextMenu = (e) => {
        e.preventDefault();
        setContextMenuData({
            x: e.clientX,
            y: e.clientY,
            type: 'taskbar',
            options: [
                {
                    id: 'show_desktop', label: '📊 Show the Desktop', action: () => {
                        handleShowDesktop();
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'task_manager', label: '⚙️ Task Manager', action: () => {
                        launchApp(getAppById('taskmanager'));
                        setContextMenuData(null);
                    }
                },
                { id: 'separator1', type: 'separator' },
                {
                    id: 'taskbar_settings', label: '🔧 Taskbar Settings', action: () => {
                        openAppWindow(getAppById('settings'), {
                            id: 'settings-taskbar',
                            title: 'Taskbar Settings',
                            icon: <Settings size={16} />,
                            width: 900,
                            height: 700,
                        });
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'lock_taskbar', label: '🔒 Lock the Taskbar', action: () => {
                        alert('Taskbar locked!');
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'cascade_windows', label: '📑 Cascade Windows', action: () => {
                        alert('Cascading windows...');
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'tile_windows_h', label: '📋 Tile Horizontally', action: () => {
                        alert('Tiling windows horizontally...');
                        setContextMenuData(null);
                    }
                },
                {
                    id: 'tile_windows_v', label: '📋 Tile Vertically', action: () => {
                        alert('Tiling windows vertically...');
                        setContextMenuData(null);
                    }
                }
            ]
        });
    };

    return (
        <>
            <style>{`
                /* Custom Scrollbar for Start Menu */
                .start-menu-scroll::-webkit-scrollbar {
                    width: 5px;
                }
                .start-menu-scroll::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                }
                .start-menu-scroll::-webkit-scrollbar-thumb {
                    background: rgba(0,255,255,0.4);
                    border-radius: 10px;
                    transition: background 120ms ease-out;
                }
                .start-menu-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,255,255,0.6);
                }
                
                /* Fade-in animation */
                @keyframes startMenuFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px) ${windowsVersion === '10' && taskbarPosition === 'bottom' ? '' : 'translateX(-50%)'};
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) ${windowsVersion === '10' && taskbarPosition === 'bottom' ? '' : 'translateX(-50%)'};
                    }
                }
            `}</style>
            <div
                ref={desktopContainerRef}
                className="desktop-view"
                onContextMenu={handleDesktopContextMenu}
                style={{
                    position: 'fixed',
                    inset: 0,
                    ...resolveDesktopWallpaperStyle(desktopWallpaper),
                    cursor: inspectMode ? 'crosshair' : 'default'
                }}>
                {/* Desktop Icons */}
                <DesktopIcons apps={apps} onAppClick={launchApp} />

                {/* Desktop Items (User-Created Folders and Files) */}
                {desktopItems.map(item => (
                    <div
                        key={item.id}
                        onDoubleClick={() => openDesktopItem(item)}
                        style={{
                            position: 'absolute',
                            left: `${item.x}px`,
                            top: `${item.y}px`,
                            width: '100px',
                            cursor: 'grab',
                            userSelect: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            transition: 'background-color 0.2s',
                            transform: 'translate(5px, 1.5px)'
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenuData({
                                x: e.clientX,
                                y: e.clientY,
                                type: 'item',
                                options: [
                                    {
                                        id: 'open_item',
                                        label: `📂 Open`,
                                        action: () => {
                                            openDesktopItem(item);
                                            setContextMenuData(null);
                                        }
                                    },
                                    { id: 'separator0', type: 'separator' },
                                    {
                                        id: 'rename_item',
                                        label: '✏️ Rename',
                                        action: () => {
                                            setRenameItemId(item.id);
                                            setRenameValue(item.name);
                                            setContextMenuData(null);
                                        }
                                    },
                                    { id: 'separator', type: 'separator' },
                                    {
                                        id: 'delete_item',
                                        label: '🗑️ Delete',
                                        action: () => {
                                            deleteDesktopItem(item.id);
                                            setContextMenuData(null);
                                        }
                                    }
                                ]
                            });
                        }}
                        draggable
                        onDragStart={(e) => {
                            e.currentTarget.style.cursor = 'grabbing';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                        onDragEnd={(e) => {
                            e.currentTarget.style.cursor = 'grab';
                            e.currentTarget.style.backgroundColor = 'transparent';
                            // Snap to grid using the same system as DesktopIcons
                            const snapped = snapToGrid(e.clientX - 50, e.clientY - 50);
                            updateItemPosition(item.id, snapped.x, snapped.y);
                        }}
                    >
                        {/* Icon Container - 64x64 like app icons */}
                        <div
                            style={{
                                pointerEvents: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '64px',
                                height: '64px',
                                fontSize: '48px'
                            }}
                        >
                            {item.type === 'folder' ? '📁' : item.type === 'textfile' ? '📄' : item.type === 'image' ? '🖼️' : '🎵'}
                        </div>

                        {/* Label */}
                        {renameItemId === item.id ? (
                            <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        renameDesktopItem(item.id, renameValue);
                                    } else if (e.key === 'Escape') {
                                        setRenameItemId(null);
                                    }
                                }}
                                onBlur={() => {
                                    renameDesktopItem(item.id, renameValue);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    backgroundColor: 'rgba(77,150,255,0.2)',
                                    border: '1px solid #4d96ff',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    fontFamily: 'inherit',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    lineHeight: '1.2'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span
                                style={{
                                    color: '#fff',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    wordWrap: 'break-word',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    pointerEvents: 'none',
                                    maxWidth: '100%',
                                    lineHeight: '1.2'
                                }}
                            >
                                {item.name}
                            </span>
                        )}
                    </div>
                ))}

                {/* Render all windows */}
                <div
                    onMouseEnter={() => {
                        if (inspectMode && hooveredInspectElement?.startsWith('window-') === false) {
                            setHooveredInspectElement('windows');
                            setInspectedElement('windows');
                        }
                    }}
                    onMouseLeave={() => {
                        if (inspectMode && !hooveredInspectElement?.startsWith('window-')) {
                            setHooveredInspectElement(null);
                        }
                    }}
                    style={{ position: 'relative' }}
                >
                    {windows.map(window => (
                        isWindowPixelVisible(window) ? (
                            <Window key={window.id} window={window} />
                        ) : null
                    ))}
                </div>

                {/* Taskbar */}
                <div
                    className={`desktop-taskbar ${taskbarClasses}`}
                    onContextMenu={handleTaskbarContextMenu}
                    onMouseEnter={() => inspectMode && (setHooveredInspectElement('taskbar'), setInspectedElement('taskbar'))}
                    onMouseLeave={() => inspectMode && setHooveredInspectElement(null)}
                    style={{
                        backgroundColor: taskbarStyle === 'modern' ? '#1a1a1a' : '#2d2d2d',
                        borderTop: taskbarPosition === 'bottom' ? '1px solid #333' : 'none',
                        borderRight: taskbarPosition === 'left' ? '1px solid #333' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        padding: taskbarPosition === 'left' ? '8px 0' : '0 8px',
                        gap: '8px',
                        zIndex: 10000,
                        justifyContent: 'space-between',
                        border: hooveredInspectElement === 'taskbar' ? '2px solid #4d96ff' : 'inherit',
                        boxShadow: hooveredInspectElement === 'taskbar' ? 'inset 0 0 20px rgba(77,150,255,0.3)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {/* Left Group: Start + Pinned + Windows */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexDirection: taskbarPosition === 'left' ? 'column' : 'row',
                        flex: 1,
                        justifyContent: isWin11 ? 'center' : 'flex-start',
                    }}>
                        {/* Start Menu Button with System Stats Indicator */}
                        <button
                            onClick={handleStartClick}
                            onMouseEnter={(e) => {
                                handleStartHover(e);
                                if (inspectMode) {
                                    setHooveredInspectElement('startButton');
                                    setInspectedElement('startButton');
                                }
                            }}
                            onMouseLeave={(e) => {
                                handleStartLeave(e);
                                if (inspectMode) setHooveredInspectElement(null);
                            }}
                            title="Click to open Start menu, double-click to minimize all"
                            style={{
                                padding: taskbarPosition === 'left' ? '8px' : '8px 12px',
                                backgroundColor: startMenuOpen ? '#3a3a3a' : 'transparent',
                                border: hooveredInspectElement === 'startButton' ? '1px solid rgba(77,150,255,0.5)' : 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'background-color 0.2s',
                                boxShadow: hooveredInspectElement === 'startButton' ? 'inset 0 0 15px rgba(77,150,255,0.2)' : 'none'
                            }}
                        >
                            {/* Custom 3-bar system indicator */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '16px',
                                height: '16px',
                            }}>
                                {/* CPU bar (top) */}
                                <div style={{
                                    width: '14px',
                                    height: '3px',
                                    backgroundColor: getCpuColor(),
                                    borderRadius: '1px',
                                    opacity: 0.9,
                                }} title={`CPU: ${systemStats.cpu}%`} />
                                {/* GPU bar (middle) */}
                                <div style={{
                                    width: '14px',
                                    height: '3px',
                                    backgroundColor: getGpuColor(),
                                    borderRadius: '1px',
                                    opacity: 0.9,
                                }} title={`GPU: ${systemStats.gpu}%`} />
                                {/* RAM bar (bottom) */}
                                <div style={{
                                    width: '14px',
                                    height: '3px',
                                    backgroundColor: getRamColor(),
                                    borderRadius: '1px',
                                    opacity: 0.9,
                                }} title={`RAM: ${systemStats.ram}%`} />
                            </div>
                            {taskbarPosition === 'bottom' && !isWin11 && <span>Start</span>}
                        </button>

                        {/* Pinned Taskbar Icons with Separator */}
                        {pinnedTaskbarApps.length > 0 && windows.length > 0 && (
                            <div style={{
                                width: '1px',
                                height: '24px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                margin: '0 4px'
                            }} />
                        )}
                        {pinnedTaskbarApps.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexDirection: taskbarPosition === 'left' ? 'column' : 'row',
                                gap: '4px',
                            }}>
                                {pinnedTaskbarApps.map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => launchApp(app)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setContextMenu({
                                                x: e.clientX,
                                                y: e.clientY,
                                                appId: app.id
                                            });
                                        }}
                                        title={app.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        {app.smallIcon}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Taskbar Hover Preview */}
                        {taskbarHoveredWindow === window.id && !window.minimized && taskbarPosition === 'bottom' && (
                            <div
                                style={{
                                    position: 'fixed',
                                    bottom: '70px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'rgba(15,15,15,0.98)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                                    padding: '12px',
                                    zIndex: 10010,
                                    minWidth: '280px',
                                    maxWidth: '320px',
                                }}
                                onMouseEnter={() => setTaskbarHoveredWindow(window.id)}
                                onMouseLeave={() => setTaskbarHoveredWindow(null)}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '8px',
                                    padding: '6px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '6px',
                                }}>
                                    {window.icon}
                                    <div style={{
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#fff'
                                    }}>
                                        {window.title}
                                    </div>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '160px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    color: '#666',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    {window.icon}
                                    <span style={{ marginLeft: '8px' }}>Preview</span>
                                </div>
                            </div>
                        )}
                        {/* Open Windows */}
                        {windows.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexDirection: taskbarPosition === 'left' ? 'column' : 'row',
                                gap: '4px',
                            }}>
                                {windows.map(window => {
                                    const maxVisibleZ = Math.max(
                                        ...windows.filter((w) => !w.minimized).map((w) => w.zIndex),
                                        0,
                                    );
                                    const isTopFocused = !window.minimized && window.zIndex === maxVisibleZ;

                                    return (
                                        <div
                                            key={window.id}
                                            style={{ position: 'relative' }}
                                            onMouseEnter={() => setTaskbarHoveredWindow(window.id)}
                                            onMouseLeave={() => setTaskbarHoveredWindow(null)}
                                        >
                                            <button
                                                onClick={() => {
                                                    if (window.minimized) {
                                                        restoreWindow(window.id);
                                                    } else if (!isTopFocused) {
                                                        bringToFront(window.id);
                                                    } else {
                                                        minimizeWindow(window.id);
                                                    }
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: window.minimized ? '#1f1f1f' : '#2a2a2a',
                                                    border: `1px solid ${window.minimized ? '#333' : '#444'}`,
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    maxWidth: taskbarPosition === 'bottom' ? '200px' : 'auto',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    opacity: window.minimized ? 0.7 : 1,
                                                }}
                                            >
                                                {window.icon}
                                                {taskbarPosition === 'bottom' && <span>{window.title}</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Group: System Tray + Time/Calendar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0px',
                        minWidth: 'auto'
                    }}>
                        {/* System Tray Container */}
                        {taskbarPosition === 'bottom' && (
                            <div
                                onMouseEnter={() => inspectMode && (setHooveredInspectElement('systemTray'), setInspectedElement('systemTray'))}
                                onMouseLeave={() => inspectMode && setHooveredInspectElement(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '6px',
                                    marginRight: '8px',
                                    border: hooveredInspectElement === 'systemTray' ? '1px solid rgba(77,150,255,0.5)' : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: hooveredInspectElement === 'systemTray' ? 'inset 0 0 15px rgba(77,150,255,0.2)' : 'none',
                                    transition: 'all 0.2s'
                                }}>
                                {/* Network Icon */}
                                <div
                                    title={`Network: ${getNetworkQuality()} (${metrics.network.effectiveType.toUpperCase()}, ${metrics.network.downlink} Mbps)`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1px',
                                        cursor: 'default',
                                        height: '14px',
                                        position: 'relative'
                                    }}
                                >
                                    {getNetworkType() === 'ethernet' ? (
                                        <Cable size={16} color="#10b981" strokeWidth={2} />
                                    ) : getNetworkType() === 'cellular' ? (
                                        <Signal
                                            size={16}
                                            color={getNetworkStrength() >= 3 ? '#10b981' : getNetworkStrength() >= 2 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <Wifi
                                            size={18}
                                            color={getNetworkStrength() >= 3 ? '#10b981' : getNetworkStrength() >= 2 ? '#f59e0b' : getNetworkStrength() >= 1 ? '#ef4444' : 'rgba(255,255,255,0.35)'}
                                            strokeWidth={2}
                                        />
                                    )}
                                </div>

                                {/* Volume Icon */}
                                <div
                                    title={`Volume: ${soundLevel}%`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setVolumePopupOpen(!volumePopupOpen);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        position: 'relative'
                                    }}
                                >
                                    {soundLevel === 0 ? (
                                        <VolumeX size={16} strokeWidth={2} color="#ef4444" />
                                    ) : soundLevel < 50 ? (
                                        <Volume1 size={16} strokeWidth={2} color="#f59e0b" />
                                    ) : soundLevel < 150 ? (
                                        <Volume2 size={16} strokeWidth={2} color="#10b981" />
                                    ) : (
                                        <Volume2 size={16} strokeWidth={2} color="#ef4444" />
                                    )}

                                    {/* Volume Popup */}
                                    {volumePopupOpen && (
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                position: 'fixed',
                                                bottom: '60px',
                                                right: '120px',
                                                backgroundColor: 'rgba(20,20,20,0.95)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                                zIndex: 10005,
                                                padding: '16px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: '#fff' }}>
                                                Volume: {soundLevel}%
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="150"
                                                value={soundLevel}
                                                onChange={(e) => setSoundLevel(Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    accentColor: '#4d96ff',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginTop: '8px',
                                                fontSize: '11px',
                                                color: '#888'
                                            }}>
                                                <span>0%</span>
                                                <span>150%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notifications Icon */}
                                <div
                                    title={`Notifications: ${notificationCount}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        position: 'relative'
                                    }}
                                >
                                    <Bell
                                        size={15}
                                        strokeWidth={2}
                                        color={notificationCount === 0 ? '#888' : '#10b981'}
                                    />
                                </div>

                                {/* Battery Indicator */}
                                {!isMobile && (
                                    <div
                                        title="Desktop (No Battery)"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'default',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Battery icon with terminal */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0px'
                                        }}>
                                            {/* Battery body */}
                                            <div style={{
                                                width: '24px',
                                                height: '13px',
                                                border: `1.5px solid ${getBatteryColor()}`,
                                                borderRadius: '2px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: 'rgba(0,0,0,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {/* Fill - Always full for desktop */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: getBatteryColor(),
                                                    transition: 'width 0.3s',
                                                    position: 'absolute',
                                                    left: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <span style={{
                                                        color: 'rgba(0,0,0,0.7)',
                                                        fontSize: '13px',
                                                        lineHeight: '1',
                                                        transform: 'translateY(-1px)',
                                                        fontWeight: 'bold',
                                                        zIndex: 1
                                                    }}>
                                                        ∞
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Battery terminal (right nub) */}
                                            <div style={{
                                                width: '3px',
                                                height: '8px',
                                                backgroundColor: getBatteryColor(),
                                                borderRadius: '0 1px 1px 0'
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {isMobile && (
                                    <div
                                        title={`Battery: ${metrics.battery.level}% ${metrics.battery.charging ? '(Charging)' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'default',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Battery icon with terminal */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0px'
                                        }}>
                                            {/* Battery body */}
                                            <div style={{
                                                width: '24px',
                                                height: '13px',
                                                border: `1.5px solid ${getBatteryColor()}`,
                                                borderRadius: '2px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: 'rgba(0,0,0,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {/* Fill from left */}
                                                <div style={{
                                                    width: `${metrics.battery.level}%`,
                                                    height: '100%',
                                                    backgroundColor: getBatteryColor(),
                                                    transition: 'width 0.3s',
                                                    position: 'absolute',
                                                    left: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {metrics.battery.level > 20 && (
                                                        <span style={{
                                                            color: 'rgba(0,0,0,0.7)',
                                                            fontSize: '11px',
                                                            lineHeight: '1',
                                                            transform: 'translateY(-1px)',
                                                            fontWeight: 'bold',
                                                            zIndex: 1
                                                        }}>
                                                            {metrics.battery.level}
                                                        </span>
                                                    )}
                                                    {metrics.battery.charging && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                                                            animation: 'pulse 1.5s ease-in-out infinite'
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                            {/* Battery terminal (right nub) */}
                                            <div style={{
                                                width: '3px',
                                                height: '8px',
                                                backgroundColor: getBatteryColor(),
                                                borderRadius: '0 1px 1px 0'
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Time/Calendar Section */}
                        <button
                            onMouseEnter={() => setTimeHover(true)}
                            onMouseLeave={() => setTimeHover(false)}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCalendarOpen(!calendarOpen);
                            }}
                            style={{
                                padding: '6px 10px',
                                backgroundColor: calendarOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                lineHeight: 1.1,
                                fontSize: '12px',
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>{timeString}</span>
                            <span style={{ color: '#b0b0b0', fontSize: '11px' }}>{dateString}</span>
                        </button>
                        {timeHover && (
                            <div style={{
                                position: 'fixed',
                                right: '16px',
                                bottom: taskbarPosition === 'bottom' ? '60px' : '12px',
                                backgroundColor: 'rgba(20,20,20,0.95)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '6px',
                                padding: '8px 10px',
                                fontSize: '12px',
                                color: '#fff',
                                zIndex: 10002,
                                pointerEvents: 'none',
                            }}>
                                {fullDateTime}
                            </div>
                        )}
                    </div>
                </div>

                {calendarOpen && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            right: taskbarPosition === 'bottom' ? '12px' : 'auto',
                            left: taskbarPosition === 'left' ? '72px' : 'auto',
                            bottom: taskbarPosition === 'bottom' ? '60px' : '12px',
                            backgroundColor: 'rgba(20,20,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '12px',
                            width: '280px',
                            color: '#fff',
                            zIndex: 10002,
                            boxShadow: '0 10px 24px rgba(0,0,0,0.4)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{calendarTitle}</div>
                            <Clock size={16} />
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px',
                            fontSize: '11px',
                            color: '#9aa0a6',
                            marginBottom: '6px'
                        }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <div key={`day-${idx}`} style={{ textAlign: 'center' }}>{day}</div>
                            ))}
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px',
                            marginBottom: '12px'
                        }}>
                            {calendarDays.map((day, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        textAlign: 'center',
                                        padding: '4px 0',
                                        borderRadius: '4px',
                                        backgroundColor: day === now.getDate() ? 'rgba(255,255,255,0.12)' : 'transparent',
                                        color: day ? '#fff' : 'transparent',
                                        fontSize: '11px'
                                    }}
                                >
                                    {day || '.'}
                                </div>
                            ))}
                        </div>

                        {pinnedSidebarApps.length > 0 && (
                            <div>
                                <div style={{ fontSize: '12px', color: '#9aa0a6', marginBottom: '6px' }}>
                                    Pinned
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {pinnedSidebarApps.map(app => (
                                        <button
                                            key={app.id}
                                            onClick={() => launchApp(app)}
                                            title={app.name}
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {app.smallIcon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {contextMenu && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            left: contextMenu.x,
                            top: contextMenu.y,
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            padding: '4px',
                            minWidth: '180px',
                            zIndex: 10005,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
                        }}
                    >
                        <button
                            onClick={() => {
                                togglePin(contextMenu.appId, 'taskbar');
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {pinnedTaskbar.includes(contextMenu.appId) ? <PinOff size={16} /> : <Pin size={16} />}
                            {pinnedTaskbar.includes(contextMenu.appId) ? 'Unpin from taskbar' : 'Pin to taskbar'}
                        </button>
                        <button
                            onClick={() => {
                                togglePin(contextMenu.appId, 'sidebar');
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {pinnedSidebar.includes(contextMenu.appId) ? <PinOff size={16} /> : <Pin size={16} />}
                            {pinnedSidebar.includes(contextMenu.appId) ? 'Unpin from sidebar' : 'Pin to sidebar'}
                        </button>
                    </div>
                )}

                {/* Compact Performance Monitor - appears on hover */}
                <div style={{
                    position: 'fixed',
                    left: taskbarPosition === 'left' ? '72px' : '12px',
                    top: taskbarPosition === 'left' ? '12px' : 'auto',
                    bottom: taskbarPosition === 'bottom' ? '60px' : 'auto',
                    right: 'auto',
                    zIndex: 10001,
                    pointerEvents: perfMonitorVisible ? 'auto' : 'none',
                    opacity: perfMonitorVisible ? 1 : 0,
                    transform: perfMonitorVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 0.2s ease, transform 0.2s ease'
                }}>
                    {perfMonitorVisible && (
                        <Suspense fallback={null}>
                            <CompactPerformanceMonitor visible={perfMonitorVisible} />
                        </Suspense>
                    )}
                </div>

                {/* Start Menu - Windows 11 Style */}
                {startMenuOpen && (
                    <>
                        <div
                            onClick={() => setStartMenuOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9998,
                                backdropFilter: 'blur(2px)',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                            }}
                        />
                        <div
                            style={{
                                position: 'fixed',
                                [taskbarPosition === 'left' ? 'left' : 'bottom']: taskbarPosition === 'left' ? '68px' : '60px',
                                [taskbarPosition === 'left' ? 'bottom' : 'left']: windowsVersion === '10' && taskbarPosition === 'bottom' ? '8px' : (taskbarPosition === 'left' ? '8px' : '50%'),
                                [taskbarPosition === 'left' ? '' : 'transform']: windowsVersion === '10' && taskbarPosition === 'bottom' ? '' : (taskbarPosition === 'left' ? '' : 'translateX(-50%)'),
                                background: 'linear-gradient(to bottom, rgba(28, 28, 32, 0.96) 0%, rgba(24, 24, 28, 0.96) 100%)',
                                backdropFilter: 'blur(40px) saturate(150%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0',
                                width: '560px',
                                maxHeight: '650px',
                                overflow: 'hidden',
                                zIndex: 9999,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1) inset',
                                animation: 'startMenuFadeIn 150ms ease-out'
                            }}
                        >
                            {/* Search Bar */}
                            <div style={{ padding: '24px 24px 0px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative', marginBottom: '18px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search apps or ask S.P.A.R.K..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim()) {
                                                handleStartSparkChat();
                                            }
                                        }}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '13px 52px 13px 42px',
                                            backgroundColor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(0,255,255,0.25)',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 120ms ease-out',
                                            boxShadow: '0 0 0 2px rgba(0,255,255,0)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                            e.target.style.borderColor = 'rgba(0,255,255,0.5)';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(0,255,255,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                            e.target.style.borderColor = 'rgba(0,255,255,0.25)';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(0,255,255,0)';
                                        }}
                                    />
                                    {/* S.P.A.R.K Button */}
                                    <button
                                        onClick={handleStartSparkChat}
                                        disabled={!searchQuery.trim()}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: searchQuery.trim() ? 'rgba(147, 51, 234, 0.8)' : 'rgba(255,255,255,0.08)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '7px',
                                            cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                                            color: searchQuery.trim() ? '#fff' : '#666',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 120ms ease-out',
                                            opacity: searchQuery.trim() ? 1 : 0.5
                                        }}
                                        title="Ask S.P.A.R.K"
                                        onMouseEnter={(e) => {
                                            if (searchQuery.trim()) {
                                                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 1)';
                                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (searchQuery.trim()) {
                                                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.8)';
                                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                            }
                                        }}
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                </div>

                                {/* Apps Section - Windows 10 Style */}
                                <div style={{ padding: '0', overflowY: 'auto', maxHeight: '400px', order: 2, display: 'flex', height: '400px' }}>
                                    {/* Left: All Apps List */}
                                    <div className="start-menu-scroll" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginBottom: '18px', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                            All Apps
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {sortedStartApps.map(app => (
                                                <button
                                                    key={app.id}
                                                    onClick={() => launchApp(app)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        if (customGroups.length > 0) {
                                                            const groupName = prompt(`Add "${app.name}" to which group?\n\nAvailable groups:\n${customGroups.map((g, i) => `${i + 1}. ${g.name}`).join('\n')}\n\nEnter group number:`);
                                                            if (groupName) {
                                                                const groupIdx = parseInt(groupName) - 1;
                                                                if (groupIdx >= 0 && groupIdx < customGroups.length) {
                                                                    const newGroups = [...customGroups];
                                                                    const currentItems = Array.isArray(newGroups[groupIdx].items)
                                                                        ? newGroups[groupIdx].items
                                                                        : [];
                                                                    const hasApp = currentItems.some(item => {
                                                                        if (typeof item === 'string') return item === app.id;
                                                                        return item?.id === app.id;
                                                                    });

                                                                    if (!hasApp) {
                                                                        newGroups[groupIdx].items = [...currentItems, app.id];
                                                                        setCustomGroups(newGroups);
                                                                        localStorage.setItem('desktop_custom_groups', JSON.stringify(newGroups));
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            alert('Create a group first by clicking "+ New Group" in the right panel');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 12px',
                                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '10px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        transition: 'all 120ms ease-out',
                                                        fontSize: '12px',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.04) 100%)';
                                                        e.currentTarget.style.borderColor = 'rgba(0,255,255,0.35)';
                                                        e.currentTarget.style.transform = 'translateX(4px) scale(1.01)';
                                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,255,255,0.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                                        e.currentTarget.style.transform = 'translateX(0) scale(1)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)';
                                                    }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                                                        {app.icon}
                                                    </span>
                                                    <span style={{ textAlign: 'left', fontWeight: 400, color: '#ccc', flex: 1 }}>{app.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Widgets Panel */}
                                    <div className="start-menu-scroll" style={{ flex: 1, padding: '16px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                                        {/* Weather Widget */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(0,180,255,0.12) 0%, rgba(0,120,200,0.08) 100%)',
                                            border: '1px solid rgba(0,180,255,0.2)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            transition: 'all 120ms ease-out',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,180,255,0.16) 0%, rgba(0,120,200,0.12) 100%)';
                                                e.currentTarget.style.borderColor = 'rgba(0,180,255,0.35)';
                                                e.currentTarget.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,180,255,0.12) 0%, rgba(0,120,200,0.08) 100%)';
                                                e.currentTarget.style.borderColor = 'rgba(0,180,255,0.2)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                            onClick={() => launchApp({ id: 'weather' })}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>WEATHER</div>
                                                    <div style={{ fontSize: '28px', fontWeight: '600', color: '#fff', lineHeight: '1' }}>{weather.temp}°</div>
                                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{weather.condition}</div>
                                                </div>
                                                <Cloud size={48} style={{ opacity: 0.9, color: 'rgba(255,255,255,0.9)' }} />
                                            </div>
                                        </div>

                                        {/* Recent Apps */}
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                                Recent
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {recentApps.slice(0, 4).map((storedApp, idx) => {
                                                    const app = resolveStoredApp(storedApp);
                                                    if (!app) return null;

                                                    return (
                                                        <button
                                                            key={app.id || idx}
                                                            onClick={() => launchApp(app)}
                                                            style={{
                                                                padding: '8px 10px',
                                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                                                                border: '1px solid rgba(255,255,255,0.06)',
                                                                borderRadius: '8px',
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                transition: 'all 120ms ease-out',
                                                                fontSize: '12px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.05) 100%)';
                                                                e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)';
                                                                e.currentTarget.style.transform = 'translateX(4px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)';
                                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                                e.currentTarget.style.transform = 'translateX(0)';
                                                            }}
                                                        >
                                                            <div style={{ fontSize: '18px' }}>{app.icon}</div>
                                                            <span style={{ flex: 1, textAlign: 'left', fontWeight: 400 }}>{app.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Custom Groups */}
                                        {customGroups.map((group, groupIdx) => (
                                            <div key={groupIdx}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    fontWeight: '500',
                                                    marginBottom: '10px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {group.name}
                                                    <button
                                                        onClick={() => {
                                                            const newGroups = customGroups.filter((_, i) => i !== groupIdx);
                                                            setCustomGroups(newGroups);
                                                            localStorage.setItem('desktop_custom_groups', JSON.stringify(newGroups));
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'rgba(255,255,255,0.3)',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            padding: '2px'
                                                        }}
                                                        title="Delete group"
                                                    >×</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {(Array.isArray(group.items) ? group.items : []).map((storedItem, itemIdx) => {
                                                        const item = resolveStoredApp(storedItem);
                                                        if (!item) return null;

                                                        return (
                                                            <button
                                                                key={item.id || itemIdx}
                                                                onClick={() => launchApp(item)}
                                                                style={{
                                                                    padding: '8px 10px',
                                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                                    borderRadius: '8px',
                                                                    color: '#fff',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    transition: 'all 120ms ease-out',
                                                                    fontSize: '12px'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.05) 100%)';
                                                                    e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)';
                                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)';
                                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '18px' }}>{item.icon}</div>
                                                                <span style={{ flex: 1, textAlign: 'left', fontWeight: 400 }}>{item.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Group Button */}
                                        <button
                                            onClick={() => {
                                                const groupName = prompt('Group name:');
                                                if (groupName) {
                                                    const newGroups = [...customGroups, { name: groupName, items: [] }];
                                                    setCustomGroups(newGroups);
                                                    localStorage.setItem('desktop_custom_groups', JSON.stringify(newGroups));
                                                }
                                            }}
                                            style={{
                                                padding: '10px',
                                                background: 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.04) 100%)',
                                                border: '1px dashed rgba(0,255,255,0.3)',
                                                borderRadius: '8px',
                                                color: 'rgba(0,255,255,0.8)',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                transition: 'all 120ms ease-out',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,255,0.12) 0%, rgba(0,255,255,0.06) 100%)';
                                                e.currentTarget.style.borderColor = 'rgba(0,255,255,0.5)';
                                                e.currentTarget.style.color = 'rgba(0,255,255,1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.04) 100%)';
                                                e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)';
                                                e.currentTarget.style.color = 'rgba(0,255,255,0.8)';
                                            }}
                                        >
                                            + New Group
                                        </button>
                                    </div>
                                </div>

                                {/* Status Bar with Settings, Battery, Time, and Quick Options */}
                                <div style={{
                                    order: 1,
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    backgroundColor: 'rgba(0,0,0,0.15)',
                                    marginTop: '16px'
                                }}>
                                    {/* Quick Open: Task Manager */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            transition: 'all 120ms ease-out',
                                            color: '#fff'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,255,255,0.1)';
                                            e.currentTarget.style.color = 'rgba(0,255,255,1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onClick={() => {
                                            launchApp({ id: 'taskmanager' });
                                            setStartMenuOpen(false);
                                        }}
                                        title="Task Manager"
                                    >
                                        <Activity size={16} />
                                    </div>

                                    <div style={{ flex: 1 }} />

                                    {/* Time and Battery on Right - Vertical Stack */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        {/* Time */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                transition: 'all 120ms ease-out',
                                                fontSize: '12px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(0,255,255,0.1)';
                                                e.currentTarget.style.color = 'rgba(0,255,255,1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onClick={() => setCalendarOpen(!calendarOpen)}
                                            title="View calendar"
                                        >
                                            <Clock size={14} />
                                            <span style={{ fontWeight: 500 }}>
                                                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Battery */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: metrics.battery.level < 20 ? '#ff6b6b' : '#fff',
                                                cursor: 'pointer',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                transition: 'all 120ms ease-out',
                                                fontSize: '12px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(0,255,255,0.1)';
                                                e.currentTarget.style.transform = 'scale(1.03)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                            title={`Battery: ${metrics.battery.level}%${metrics.battery.charging ? ' (Charging)' : ''}`}
                                        >
                                            {!isMobile && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '13px',
                                                        border: `1.5px solid ${getBatteryColor()}`,
                                                        borderRadius: '2px',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: getBatteryColor(),
                                                            transition: 'width 0.3s',
                                                            position: 'absolute',
                                                            left: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <span style={{
                                                                color: 'rgba(0,0,0,0.7)',
                                                                fontSize: '13px',
                                                                lineHeight: '1',
                                                                transform: 'translateY(-1px)',
                                                                fontWeight: 'bold',
                                                                zIndex: 1
                                                            }}>
                                                                ∞
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '8px',
                                                        backgroundColor: getBatteryColor(),
                                                        borderRadius: '0 1px 1px 0'
                                                    }} />
                                                </div>
                                            )}

                                            {isMobile && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '13px',
                                                        border: `1.5px solid ${getBatteryColor()}`,
                                                        borderRadius: '2px',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: `${metrics.battery.level}%`,
                                                            height: '100%',
                                                            backgroundColor: getBatteryColor(),
                                                            transition: 'width 0.3s',
                                                            position: 'absolute',
                                                            left: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {metrics.battery.level > 20 && (
                                                                <span style={{
                                                                    color: 'rgba(0,0,0,0.7)',
                                                                    fontSize: '11px',
                                                                    lineHeight: '1',
                                                                    transform: 'translateY(-1px)',
                                                                    fontWeight: 'bold',
                                                                    zIndex: 1
                                                                }}>
                                                                    {metrics.battery.level}
                                                                </span>
                                                            )}
                                                            {metrics.battery.charging && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                                                                    animation: 'pulse 1.5s ease-in-out infinite'
                                                                }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '8px',
                                                        backgroundColor: getBatteryColor(),
                                                        borderRadius: '0 1px 1px 0'
                                                    }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer - User & Power */}
                                <div style={{
                                    order: 3,
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    padding: '10px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'linear-gradient(to bottom, rgba(15,15,20,0) 0%, rgba(15,15,20,0.85) 30%, rgba(15,15,20,0.9) 100%)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    marginTop: '-64px'
                                }}>
                                    <button
                                        onClick={handleOpenProfile}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            fontSize: '13px',
                                            flex: 1,
                                            transition: 'all 120ms ease-out'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,255,255,0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(0,255,255,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            border: '1.5px solid rgba(255,255,255,0.08)',
                                            transition: 'all 120ms ease-out'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.08)';
                                                e.currentTarget.style.borderColor = 'rgba(0,255,255,0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                            }}
                                        >
                                            U
                                        </div>
                                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span>Username</span>
                                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>Guest</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleOpenSettings}
                                        title="Settings"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 120ms ease-out'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,255,255,0.1)';
                                            e.currentTarget.style.color = 'rgba(0,255,255,1)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPowerMenuOpen(!powerMenuOpen);
                                        }}
                                        title="Power menu"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            transition: 'all 120ms ease-out'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)';
                                            e.currentTarget.style.color = '#ff6b6b';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <Power size={18} />
                                    </button>
                                    {powerMenuOpen && (
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                position: 'fixed',
                                                bottom: '72px',
                                                right: '20px',
                                                backgroundColor: 'rgba(20,20,20,0.95)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                                zIndex: 10005,
                                                minWidth: '200px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                Log out
                                            </button>
                                            <button
                                                onClick={handleShutdown}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                Shutdown
                                            </button>
                                            <button
                                                onClick={handleRestart}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                Restart
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Alt+Tab Task Switcher Overlay */}
                {altTabOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 10020,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(20,20,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            minWidth: '500px',
                            maxWidth: '700px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#888',
                                marginBottom: '16px',
                                textAlign: 'center',
                                fontWeight: '500'
                            }}>
                                Alt + Tab to switch windows
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '12px',
                            }}>
                                {windows.filter(w => !w.minimized).map((window, index) => (
                                    <div
                                        key={window.id}
                                        style={{
                                            padding: '16px',
                                            backgroundColor: index === altTabIndex ? 'rgba(77,150,255,0.2)' : 'rgba(255,255,255,0.03)',
                                            border: `2px solid ${index === altTabIndex ? '#4d96ff' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            transform: index === altTabIndex ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                    >
                                        <div style={{ fontSize: '32px' }}>
                                            {window.icon}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#fff',
                                            textAlign: 'center',
                                            fontWeight: index === altTabIndex ? '600' : '400',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            width: '100%'
                                        }}>
                                            {window.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Context Menu */}
                {contextMenuData && (
                    <>
                        {/* Background click to close */}
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 10015
                            }}
                            onClick={() => {
                                setContextMenuData(null);
                                setSubmenuOpen(null);
                            }}
                        />

                        {/* Context Menu Popup */}
                        <div
                            style={{
                                position: 'fixed',
                                left: `${contextMenuData.x}px`,
                                top: `${contextMenuData.y}px`,
                                backgroundColor: 'rgba(25,25,25,0.98)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '8px',
                                zIndex: 10016,
                                minWidth: '200px',
                                maxWidth: '300px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
                                backdropFilter: 'blur(8px)',
                                overflow: 'visible'
                            }}
                        >
                            {contextMenuData.options.map((option, idx) => {
                                if (option.type === 'separator') {
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                height: '1px',
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                margin: '4px 0'
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <div key={option.id}>
                                        <button
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(77,150,255,0.2)';
                                                if (option.submenu) setSubmenuOpen(option.id);
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (option.action && !option.submenu) {
                                                    option.action();
                                                    setContextMenuData(null);
                                                    setSubmenuOpen(null);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '13px',
                                                transition: 'background-color 0.15s',
                                                fontWeight: '400',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {option.label}
                                            {option.submenu && <span style={{ marginLeft: '12px' }}>›</span>}
                                        </button>

                                        {/* Submenu */}
                                        {option.submenu && submenuOpen === option.id && (
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    left: `${contextMenuData.x + 200}px`,
                                                    top: `${contextMenuData.y + (idx * 42)}px`,
                                                    backgroundColor: 'rgba(25,25,25,0.98)',
                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                    borderRadius: '8px',
                                                    zIndex: 10017,
                                                    minWidth: '180px',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
                                                    backdropFilter: 'blur(8px)',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseLeave={() => setSubmenuOpen(null)}
                                            >
                                                {option.submenu.map((subOption) => (
                                                    <button
                                                        key={subOption.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (subOption.action) subOption.action();
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            color: '#fff',
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            fontSize: '13px',
                                                            transition: 'background-color 0.15s',
                                                            fontWeight: '400'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(77,150,255,0.2)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                    >
                                                        {subOption.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Code Inspector Panel */}
                {inspectMode && (
                    <div style={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '450px',
                        backgroundColor: 'rgba(15,15,15,0.98)',
                        backdropFilter: 'blur(12px)',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 10030,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {/* Inspector Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#fff'
                            }}>
                                Element Inspector
                            </h3>
                            <button
                                onClick={() => {
                                    setInspectMode(false);
                                    setInspectedElement(null);
                                    setHooveredInspectElement(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#888',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    padding: '0 8px',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Inspector Instructions */}
                        {!inspectedElement && (
                            <div style={{
                                padding: '20px',
                                color: '#888',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                                <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                                    Hover over UI elements to inspect
                                </div>
                                <div>
                                    See how Nexus is built with React, and understand the code that powers each component
                                </div>
                            </div>
                        )}

                        {/* Inspector Content */}
                        {inspectedElement && elementRegistry[inspectedElement] && (
                            <div style={{
                                flex: 1,
                                padding: '16px',
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {/* Element Name */}
                                <div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#888',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Component
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#4d96ff'
                                    }}>
                                        {elementRegistry[inspectedElement].name}
                                    </div>
                                </div>

                                {/* Component Source */}
                                <div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#888',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Source File
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#aaa',
                                        fontFamily: 'monospace',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {elementRegistry[inspectedElement].component}.js
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#888',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Description
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#ccc',
                                        lineHeight: '1.5'
                                    }}>
                                        {elementRegistry[inspectedElement].description}
                                    </div>
                                </div>

                                {/* Code Snippet */}
                                <div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#888',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        React JSX Code
                                    </div>
                                    <pre style={{
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '6px',
                                        padding: '12px',
                                        fontSize: '11px',
                                        color: '#aaa',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                        fontFamily: 'monospace',
                                        margin: 0,
                                        lineHeight: '1.4',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {elementRegistry[inspectedElement].code}
                                    </pre>
                                </div>

                                {/* Copy Button */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(elementRegistry[inspectedElement].code);
                                        alert('Code copied to clipboard!');
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: 'rgba(77,150,255,0.1)',
                                        border: '1px solid rgba(77,150,255,0.3)',
                                        borderRadius: '6px',
                                        color: '#4d96ff',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(77,150,255,0.2)';
                                        e.currentTarget.style.borderColor = 'rgba(77,150,255,0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(77,150,255,0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(77,150,255,0.3)';
                                    }}
                                >
                                    📋 Copy Code
                                </button>
                            </div>
                        )}

                        {/* Elements List */}
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            maxHeight: '250px',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '8px'
                            }}>
                                Inspectable Elements
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '6px'
                            }}>
                                {Object.entries(elementRegistry).map(([key, element]) => (
                                    <button
                                        key={key}
                                        onMouseEnter={() => {
                                            setHooveredInspectElement(key);
                                            setInspectedElement(key);
                                        }}
                                        onClick={() => setInspectedElement(key)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: inspectedElement === key ? 'rgba(77,150,255,0.2)' : 'rgba(255,255,255,0.03)',
                                            border: inspectedElement === key ? '1px solid rgba(77,150,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '6px',
                                            color: inspectedElement === key ? '#4d96ff' : '#aaa',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: inspectedElement === key ? '600' : '400',
                                            transition: 'all 0.2s',
                                            textAlign: 'left'
                                        }}
                                        onMouseLeave={() => {
                                            if (inspectedElement !== key) {
                                                setHooveredInspectElement(null);
                                            }
                                        }}
                                    >
                                        {element.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* S.P.A.R.K Chat Dropdown (anchored to Start menu) */}
                {sparkChatMode && (
                    <div
                        onClick={() => {
                            setSparkChatMode(false);
                            setSearchQuery('');
                        }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 10000,
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'fixed',
                                [taskbarPosition === 'left' ? 'left' : 'bottom']: taskbarPosition === 'left' ? '68px' : '60px',
                                [taskbarPosition === 'left' ? 'bottom' : 'left']: windowsVersion === '10' && taskbarPosition === 'bottom' ? '8px' : (taskbarPosition === 'left' ? '8px' : '50%'),
                                [taskbarPosition === 'left' ? '' : 'transform']: windowsVersion === '10' && taskbarPosition === 'bottom' ? '' : (taskbarPosition === 'left' ? '' : 'translateX(-50%)'),
                                width: windowsVersion === '10' && taskbarPosition === 'bottom' ? '620px' : '760px',
                                maxWidth: taskbarPosition === 'left' ? 'calc(100vw - 90px)' : 'calc(100vw - 24px)',
                                height: taskbarPosition === 'left' ? 'calc(100vh - 16px)' : 'calc(100vh - 72px)',
                                maxHeight: '760px',
                                backgroundColor: 'rgba(30,30,30,0.96)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
                                animation: 'chatDropIn 0.22s ease-out',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Sparkles size={24} style={{ color: '#9333ea' }} />
                                    <div>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                                            S.P.A.R.K Chat
                                        </h3>
                                        <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '13px' }}>
                                            Quick Runtime Assistant
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSparkChatMode(false);
                                        setSearchQuery('');
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#888',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        padding: '4px 8px',
                                        lineHeight: 1
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Chat History */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                {sparkChatHistory.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.role === 'USER' ? 'flex-end' : 'flex-start',
                                            gap: '4px'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#666',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: '600'
                                        }}>
                                            {msg.role === 'USER' ? 'YOU' : 'S.P.A.R.K'}
                                        </div>
                                        <div style={{
                                            backgroundColor: msg.role === 'USER' ? 'rgba(100,150,255,0.2)' : 'rgba(147, 51, 234, 0.2)',
                                            border: `1px solid ${msg.role === 'USER' ? 'rgba(100,150,255,0.3)' : 'rgba(147, 51, 234, 0.3)'}`,
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            maxWidth: '75%',
                                            color: '#fff',
                                            fontSize: '14px',
                                            lineHeight: '1.5'
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                {sparkChatLoading && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#666',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: '600'
                                        }}>
                                            S.P.A.R.K
                                        </div>
                                        <div style={{
                                            backgroundColor: 'rgba(147, 51, 234, 0.2)',
                                            border: '1px solid rgba(147, 51, 234, 0.3)',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            color: '#888',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div className="spinner" style={{
                                                width: '12px',
                                                height: '12px',
                                                border: '2px solid rgba(147, 51, 234, 0.2)',
                                                borderTop: '2px solid #9333ea',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }}></div>
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="Continue the conversation with S.P.A.R.K..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim() && !sparkChatLoading) {
                                                handleSendSparkMessage();
                                            }
                                        }}
                                        disabled={sparkChatLoading}
                                        style={{
                                            flex: 1,
                                            padding: '12px 16px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSendSparkMessage}
                                        disabled={!searchQuery.trim() || sparkChatLoading}
                                        style={{
                                            padding: '12px 20px',
                                            backgroundColor: searchQuery.trim() && !sparkChatLoading ? 'rgba(147, 51, 234, 0.8)' : 'rgba(255,255,255,0.08)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: searchQuery.trim() && !sparkChatLoading ? '#fff' : '#666',
                                            cursor: searchQuery.trim() && !sparkChatLoading ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (searchQuery.trim() && !sparkChatLoading) {
                                                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (searchQuery.trim() && !sparkChatLoading) {
                                                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.8)';
                                            }
                                        }}
                                    >
                                        <Send size={16} />
                                        Send
                                    </button>
                                </div>

                                {/* Continue to I.R.I.S Button */}
                                {sparkChatHistory.length > 0 && (
                                    <button
                                        onClick={() => {
                                            // Store S.P.A.R.K context for I.R.I.S in localStorage
                                            localStorage.setItem('sparkToIrisHandoff', JSON.stringify({
                                                sparkConversation: sparkChatHistory,
                                                timestamp: Date.now()
                                            }));
                                            // Close S.P.A.R.K chat and open I.R.I.S
                                            setSparkChatMode(false);
                                            setSearchQuery('');
                                            // Trigger I.R.I.S help menu (assuming it exists)
                                            // You may need to add state/function to open I.R.I.S
                                            console.log('Transitioning to I.R.I.S with context:', sparkChatHistory);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '8px',
                                            color: '#3b82f6',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>→</span>
                                        Continue to I.R.I.S for deeper analysis
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                @keyframes chatDropIn {
                    from {
                        transform: translateY(-28px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
            </div>

            {/* Mouse Overlay Effects */}
            <MouseOverlay />
        </>
    );
}