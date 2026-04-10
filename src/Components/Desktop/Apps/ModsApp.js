import React, { useState, useEffect, useRef } from 'react';
import { Package, Download, Trash2, CheckCircle, Plus, Code, Upload, Share2 } from 'lucide-react';
import nexusModStorage from '../../Storage/nexusModStorage.js';
import modExecutor from '../../Storage/modExecutor.js';

export default function ModsApp() {
    const [activeTab, setActiveTab] = useState('browse');
    const [mods, setMods] = useState([]);

    // Define functional default mods with actual code
    const getModCode = (modId) => {
        const modCodes = {
            darktheme: `// Dark Theme Pro - Enhanced dark mode with color tinting
// Get current theme color
const currentColor = await api.getSetting('theme.primaryColor') || '#ffffff';

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

// Convert HSL to hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return \`#\${f(0)}\${f(8)}\${f(4)}\`;
}

// Get RGB values
const rgb = hexToRgb(currentColor);
const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);

// Create dark version: reduce lightness to 8-15% based on original
const darkLightness = Math.min(15, Math.max(8, l * 0.2));
const darkColor = hslToHex(h, s, darkLightness);

// Apply dark theme with color tint
await api.setSetting('theme.mode', 'dark');
await api.setSetting('theme.customDarkColor', darkColor);
await api.setSetting('theme.blur', true);
await api.setSetting('theme.transparency', true);
await api.setSetting('background.type', 'soft-particle-drift');
await api.setSetting('background.opacity', 0.3);

// Store in localStorage for immediate CSS application
api.setLocal('dark_theme_color', darkColor);
api.setLocal('dark_theme_enabled', true);

// Apply custom CSS
const styleId = 'nexus-dark-theme-pro';
let styleEl = document.getElementById(styleId);
if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
}

styleEl.textContent = \`
    :root {
        --nexus-dark-bg: \${darkColor};
        --nexus-dark-fg: #ffffff;
        --nexus-dark-accent: \${hslToHex(h, s, darkLightness + 10)};
    }
    
    body, .app-container {
        background-color: var(--nexus-dark-bg) !important;
    }
    
    .glass-card, .settings-container, .card {
        background: linear-gradient(135deg, 
            \${hslToHex(h, s, darkLightness + 5)}cc, 
            \${hslToHex(h, s, darkLightness + 2)}99) !important;
        backdrop-filter: blur(10px) !important;
    }
    
    .taskbar, .start-menu {
        background: \${hslToHex(h, s, darkLightness + 3)}dd !important;
    }
\`;

api.log(\`✨ Dark Theme Pro activated! Color: \${darkColor} (H:\${Math.round(h)}° S:\${Math.round(s)}% L:\${Math.round(darkLightness)}%)\`);
api.notify('Dark Theme Pro activated with custom tinting', 'success');`,

            customsounds: `// Custom Sounds - Enhanced audio experience
await api.setSetting('accessibility.soundEffects', true);
await api.setSetting('accessibility.clickSounds', true);
api.setLocal('sound_volume', 0.5);
api.log('🔊 Custom Sounds enabled!');
api.notify('Custom Sounds activated', 'success');`,

            widgets: `// Widget Pack - Additional desktop widgets
await api.setSetting('widgets.enabled', true);
await api.setSetting('widgets.spotify', true);
await api.setSetting('widgets.youtube', true);
await api.setSetting('widgets.tiktok', true);
await api.setSetting('performance.widgetLimit', 5);
api.log('📦 Widget Pack enabled! More widgets available.');
api.notify('Widget Pack activated', 'success');`,

            transparency: `// Transparency Effects - Glass morphism UI
await api.setSetting('theme.blur', true);
await api.setSetting('theme.transparency', true);
await api.setSetting('background.blur', 4);
await api.setSetting('motion.animations', 'full');
api.log('🪟 Transparency Effects enabled!');
api.notify('Transparency Effects activated', 'success');`,

            animations: `// Smooth Animations - Enhanced motion
await api.setSetting('motion.animations', 'full');
await api.setSetting('performance.animationScale', 1);
await api.setSetting('performance.targetFPS', 60);
await api.setSetting('background.speed', 0.7);
api.log('✨ Smooth Animations enabled!');
api.notify('Smooth Animations activated', 'success');`,

            shortcuts: `// Keyboard Shortcuts - Custom hotkeys
await api.setSetting('input.holdToConfirm', false);
await api.setSetting('input.contextMenus', true);
await api.setSetting('accessibility.navigationHints', true);
api.setLocal('shortcuts_enabled', true);
api.log('⌨️ Keyboard Shortcuts enabled!');
api.notify('Keyboard Shortcuts activated', 'success');`
        };

        return modCodes[modId] || '// Mod code here';
    };

    const [availableMods] = useState([
        {
            id: 'darktheme',
            name: 'Dark Theme Pro',
            author: 'Nepoznato',
            version: '2.1.0',
            description: 'Smart dark mode that adapts to your theme color - turns white to dark gray, red to dark red, etc. Color-intelligent AMOLED tinting!',
            downloads: 1250
        },
        {
            id: 'customsounds',
            name: 'Custom Sounds',
            author: 'Nepoznato',
            version: '1.8.0',
            description: 'Add custom notification and UI click sounds throughout Nexus',
            downloads: 840
        },
        {
            id: 'widgets',
            name: 'Widget Pack',
            author: 'Nepoznato',
            version: '3.2.0',
            description: 'Unlock all widgets including Spotify, YouTube, and TikTok',
            downloads: 2100
        },
        {
            id: 'transparency',
            name: 'Transparency Effects',
            author: 'Nepoznato',
            version: '1.5.0',
            description: 'Glass morphism UI with blur and transparency effects',
            downloads: 965
        },
        {
            id: 'animations',
            name: 'Smooth Animations',
            author: 'Nepoznato',
            version: '2.0.0',
            description: 'Enhanced 60 FPS animations with smooth transitions',
            downloads: 1430
        },
        {
            id: 'shortcuts',
            name: 'Keyboard Shortcuts',
            author: 'Nepoznato',
            version: '1.3.0',
            description: 'Customizable keyboard shortcuts and navigation hints',
            downloads: 756
        },
    ]);

    const [newMod, setNewMod] = useState({
        name: '',
        description: '',
        code: '',
    });
    const [uiPreset, setUiPreset] = useState({
        themeMode: 'dark',
        accent: '#14b8a6',
        backgroundType: 'soft-particle-drift',
        backgroundOpacity: 0.4,
        blur: true,
        transparency: true,
        taskbarPosition: 'bottom',
        taskbarStyle: 'modern',
        windowsVersion: '11',
        density: 'default'
    });

    const [createMode, setCreateMode] = useState('visual');
    const [visualElements, setVisualElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [showUiPreview, setShowUiPreview] = useState(true);
    const [showReferencePoints, setShowReferencePoints] = useState(true);
    const [showHoverIds, setShowHoverIds] = useState(true);
    const [hoveredElementId, setHoveredElementId] = useState(null);
    const [uiPreviewMode, setUiPreviewMode] = useState('dashboard');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
    const canvasRef = useRef(null);
    const dragStateRef = useRef({ id: null, offsetX: 0, offsetY: 0 });
    const importInputRef = useRef(null);

    // Initialize storage
    useEffect(() => {
        nexusModStorage.initialize().then(() => {
            loadMods();
            // Execute all enabled mods on startup
            const installedMods = nexusModStorage.getAllMods();
            modExecutor.executeAllMods(installedMods).then(results => {
                const executed = results.filter(r => r.success);
                if (executed.length > 0) {
                    console.log(`✅ Executed ${executed.length} mods on startup`);
                }
            });
        });
    }, []);

    const loadMods = () => {
        const installedMods = nexusModStorage.getAllMods();
        setMods(installedMods);
    };

    const createVisualElement = (type = 'rect') => {
        const id = `element-${Date.now().toString(36)}`;
        const base = {
            id,
            type,
            x: 40,
            y: 40,
            width: 140,
            height: 60,
            text: type === 'text' ? 'Text' : 'Button',
            color: '#ffffff',
            background: '#14b8a6',
            opacity: 1,
            borderRadius: 8,
            actionType: 'none',
            actionTarget: '',
            followMouse: false,
            mouseOffsetX: 12,
            mouseOffsetY: 12,
            frames: [],
            animation: {
                durationMs: 2000,
                easing: 'ease-in-out',
                loop: true
            }
        };

        setVisualElements(prev => [...prev, base]);
        setSelectedElementId(id);
    };

    const updateVisualElement = (id, updates) => {
        setVisualElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
    };

    const updateVisualElementAnimation = (id, updates) => {
        setVisualElements(prev => prev.map(el => {
            if (el.id !== id) return el;
            return { ...el, animation: { ...el.animation, ...updates } };
        }));
    };

    const addFrameToElement = (id) => {
        setVisualElements(prev => prev.map(el => {
            if (el.id !== id) return el;
            const frame = {
                x: el.x,
                y: el.y,
                opacity: el.opacity
            };
            return { ...el, frames: [...el.frames, frame] };
        }));
    };

    const clearFramesForElement = (id) => {
        setVisualElements(prev => prev.map(el => (el.id === id ? { ...el, frames: [] } : el)));
    };

    const snapElementToAnchor = (id, anchor) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const scale = zoomLevel || 1;
        const element = visualElements.find(el => el.id === id);
        if (!element) return;

        const logicalWidth = canvasRect.width / scale;
        const logicalHeight = canvasRect.height / scale;
        const maxX = Math.max(0, logicalWidth - element.width);
        const maxY = Math.max(0, logicalHeight - element.height);

        const anchorMap = {
            'top-left': { x: 0, y: 0 },
            'top-right': { x: maxX, y: 0 },
            'bottom-left': { x: 0, y: maxY },
            'bottom-right': { x: maxX, y: maxY },
            'center': { x: maxX / 2, y: maxY / 2 }
        };

        const target = anchorMap[anchor];
        if (!target) return;
        updateVisualElement(id, { x: target.x, y: target.y });
    };

    const handleCanvasMouseMove = (event) => {
        const dragState = dragStateRef.current;
        if (!dragState.id) return;

        const canvasRect = event.currentTarget.getBoundingClientRect();
        const scale = zoomLevel || 1;
        const x = Math.max(0, (event.clientX - canvasRect.left) / scale - dragState.offsetX);
        const y = Math.max(0, (event.clientY - canvasRect.top) / scale - dragState.offsetY);
        updateVisualElement(dragState.id, { x, y });
    };

    const handleCanvasMouseUp = () => {
        dragStateRef.current = { id: null, offsetX: 0, offsetY: 0 };
    };

    const handleElementMouseDown = (event, id) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const scale = zoomLevel || 1;
        dragStateRef.current = {
            id,
            offsetX: (event.clientX - rect.left) / scale,
            offsetY: (event.clientY - rect.top) / scale
        };
        setSelectedElementId(id);
    };

    const generateVisualModCode = () => {
        const sanitizeId = (value) => value.replace(/[^a-zA-Z0-9_-]/g, '');
        const lines = [];
        lines.push('// Visual Mod - Generated by Nexus Visual Editor');
        lines.push('const container = document.createElement(\'div\');');
        lines.push('container.id = \"nexus-visual-mod\";');
        lines.push('container.style.position = \"fixed\";');
        lines.push('container.style.left = \"0\";');
        lines.push('container.style.top = \"0\";');
        lines.push('container.style.width = \"100%\";');
        lines.push('container.style.height = \"100%\";');
        lines.push('container.style.pointerEvents = \"none\";');
        lines.push('container.style.zIndex = \"9999\";');
        lines.push('document.body.appendChild(container);');

        visualElements.forEach((el, index) => {
            const safeId = sanitizeId(el.id || `element-${index}`);
            const tag = el.type === 'button' ? 'button' : 'div';
            const text = el.type === 'text' || el.type === 'button' ? (el.text || '') : '';
            lines.push(`const el${index} = document.createElement(\'${tag}\');`);
            lines.push(`el${index}.id = \"${safeId}\";`);
            lines.push(`el${index}.style.position = \"absolute\";`);
            lines.push(`el${index}.style.left = \"${Math.round(el.x)}px\";`);
            lines.push(`el${index}.style.top = \"${Math.round(el.y)}px\";`);
            lines.push(`el${index}.style.width = \"${Math.round(el.width)}px\";`);
            lines.push(`el${index}.style.height = \"${Math.round(el.height)}px\";`);
            lines.push(`el${index}.style.opacity = \"${el.opacity}\";`);
            lines.push(`el${index}.style.borderRadius = \"${Math.round(el.borderRadius)}px\";`);
            lines.push('el' + index + '.style.display = "flex";');
            lines.push('el' + index + '.style.alignItems = "center";');
            lines.push('el' + index + '.style.justifyContent = "center";');
            lines.push('el' + index + '.style.fontFamily = "inherit";');
            if (el.type !== 'text') {
                lines.push(`el${index}.style.background = \"${el.background}\";`);
            }
            lines.push(`el${index}.style.color = \"${el.color}\";`);
            if (el.actionType && el.actionType !== 'none') {
                lines.push(`el${index}.style.pointerEvents = \"auto\";`);
            } else {
                lines.push(`el${index}.style.pointerEvents = \"none\";`);
            }
            if (text) {
                lines.push(`el${index}.textContent = \"${text.replace(/"/g, '\\"')}\";`);
            }
            if (el.actionType === 'navigate' && el.actionTarget) {
                lines.push(`el${index}.addEventListener(\'click\', () => api.navigate(\'${el.actionTarget}\'));`);
            }
            if (el.actionType === 'open-url' && el.actionTarget) {
                lines.push(`el${index}.addEventListener(\'click\', () => window.open(\'${el.actionTarget}\', \'_blank\', \'noopener,noreferrer\'));`);
            }
            lines.push(`container.appendChild(el${index});`);

            if (el.followMouse) {
                lines.push(`el${index}.style.transition = \"left 0.12s ease, top 0.12s ease\";`);
                lines.push(`document.addEventListener(\'mousemove\', (event) => {`);
                lines.push(`  el${index}.style.left = (event.clientX + ${Math.round(el.mouseOffsetX)}) + \"px\";`);
                lines.push(`  el${index}.style.top = (event.clientY + ${Math.round(el.mouseOffsetY)}) + \"px\";`);
                lines.push('});');
            } else if (el.frames && el.frames.length >= 2) {
                const keyframes = el.frames.map(frame => ({
                    left: `${Math.round(frame.x)}px`,
                    top: `${Math.round(frame.y)}px`,
                    opacity: frame.opacity
                }));
                const easing = (el.animation && el.animation.easing) || 'ease-in-out';
                const durationMs = (el.animation && el.animation.durationMs) || 2000;
                const loop = el.animation && el.animation.loop;
                lines.push(`el${index}.animate(${JSON.stringify(keyframes)}, {`);
                lines.push(`  duration: ${durationMs},`);
                lines.push(`  iterations: ${loop ? 'Infinity' : 1},`);
                lines.push(`  easing: \"${easing}\",`);
                lines.push('  fill: "forwards"');
                lines.push('});');
            }
        });

        return lines.join('\n');
    };

    const generateUiPresetCode = () => {
        const lines = [];
        lines.push('// UI Preset - Generated by Nexus UI Editor');
        lines.push(`await api.setSetting('theme.mode', '${uiPreset.themeMode}');`);
        lines.push(`await api.setSetting('theme.accent', '${uiPreset.accent}');`);
        lines.push(`await api.setSetting('theme.blur', ${uiPreset.blur});`);
        lines.push(`await api.setSetting('theme.transparency', ${uiPreset.transparency});`);
        lines.push(`await api.setSetting('background.type', '${uiPreset.backgroundType}');`);
        lines.push(`await api.setSetting('background.opacity', ${uiPreset.backgroundOpacity});`);
        lines.push(`await api.setSetting('layout.taskbarPosition', '${uiPreset.taskbarPosition}');`);
        lines.push(`await api.setSetting('layout.taskbarStyle', '${uiPreset.taskbarStyle}');`);
        lines.push(`await api.setSetting('layout.windowsVersion', '${uiPreset.windowsVersion}');`);
        lines.push(`await api.setSetting('layout.density', '${uiPreset.density}');`);
        lines.push("api.notify('UI preset applied', 'success');");
        return lines.join('\n');
    };

    const clearLivePreview = () => {
        const existing = document.getElementById('nexus-visual-mod');
        if (existing) {
            existing.remove();
        }
    };

    useEffect(() => {
        let previewTimer;

        if (createMode === 'visual' && livePreviewEnabled) {
            previewTimer = setTimeout(() => {
                clearLivePreview();
                const code = generateVisualModCode();
                const previewMod = {
                    id: '__visual_preview__',
                    name: 'Visual Preview',
                    enabled: true,
                    code
                };
                modExecutor.executeMod(previewMod);
            }, 150);
        } else {
            clearLivePreview();
        }

        return () => {
            if (previewTimer) clearTimeout(previewTimer);
        };
    }, [createMode, livePreviewEnabled, visualElements]);

    const handleInstallMod = async (availableMod) => {
        const result = await nexusModStorage.installMod({
            id: availableMod.id,
            name: availableMod.name,
            author: availableMod.author || 'Nepoznato',
            version: availableMod.version,
            description: availableMod.description,
            code: getModCode(availableMod.id),
            icon: '📦',
        });

        if (result.success) {
            const shouldReload = confirm(`✅ ${result.message || 'Mod installed successfully'}\n\n⚡ Settings have been modified. Reload the page to see all changes?\n\n(You can reload later if you want to install more mods first)`);
            loadMods();
            // Auto-execute the mod
            await executeMod(result.mod);

            if (shouldReload) {
                window.location.reload();
            }
        } else {
            alert(`❌ ${result.error || 'Failed to install mod'}`);
        }
    };

    const executeMod = async (mod) => {
        const result = await modExecutor.executeMod(mod);
        if (result.success) {
            console.log(`✅ Mod executed: ${mod.name}`);
        } else {
            console.error(`❌ Mod execution failed: ${mod.name}`, result.error);
        }
    };

    const handleUninstallMod = async (modId) => {
        if (confirm('Uninstall this mod?')) {
            const result = nexusModStorage.uninstallMod(modId);
            if (result.success) {
                alert(`✅ ${result.message || 'Mod uninstalled successfully'}`);
                // Deactivate mod
                const mod = { id: modId };
                await modExecutor.deactivateMod(mod);
                loadMods();
            } else {
                alert(`❌ ${result.error || 'Failed to uninstall mod'}`);
            }
        }
    };

    const handleToggleMod = async (modId) => {
        const toggleResult = nexusModStorage.toggleMod(modId);
        const mod = nexusModStorage.getMod(modId);

        if (mod && mod.enabled) {
            // Execute mod when enabled
            await executeMod(mod);
            const shouldReload = confirm(`✅ ${mod.name} enabled!\n\n⚡ Settings have been modified. Reload to apply all changes?`);
            if (shouldReload) {
                window.location.reload();
            }
        } else if (mod && !mod.enabled) {
            // Deactivate mod when disabled
            await modExecutor.deactivateMod(mod);
            alert(`❌ ${mod.name} disabled. Settings changes remain until manually reverted.`);
        }

        loadMods();
    };

    const handleCreateMod = async () => {
        if (!newMod.name.trim()) {
            alert('Mod name is required');
            return;
        }

        const visualCode = createMode === 'visual' ? generateVisualModCode() : '';
        const uiCode = createMode === 'ui' ? generateUiPresetCode() : '';
        const modCode = createMode === 'visual'
            ? visualCode
            : createMode === 'ui'
                ? uiCode
                : (newMod.code || `// ${newMod.name} - Your mod code here`);

        const modId = newMod.name.toLowerCase().replace(/\s+/g, '-');
        const authorName = localStorage.getItem('nexus_username') || 'User';
        const result = await nexusModStorage.installMod({
            id: modId,
            name: newMod.name,
            author: authorName,
            version: '1.0.0',
            description: newMod.description,
            code: modCode,
            visual: createMode === 'visual' ? { elements: visualElements } : null,
        });

        if (result.success) {
            alert(`✅ Mod created successfully by ${authorName}!`);
            setNewMod({ name: '', description: '', code: '' });
            setVisualElements([]);
            setSelectedElementId(null);
            setActiveTab('installed');
            loadMods();
        } else {
            alert(`❌ ${result.error || 'Failed to create mod'}`);
        }
    };

    const handleExportMod = (modId) => {
        const modData = nexusModStorage.exportMod(modId);
        if (modData) {
            const fileData = JSON.stringify(modData, null, 2);
            const blob = new Blob([fileData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${modData.id}.nexus-mod.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleExportAll = () => {
        const allMods = nexusModStorage.exportAllMods();
        const fileData = JSON.stringify(allMods, null, 2);
        const blob = new Blob([fileData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-mods-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportMod = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const modsToInstall = Array.isArray(parsed) ? parsed : [parsed];

            let installedCount = 0;
            for (const modData of modsToInstall) {
                const result = await nexusModStorage.installMod(modData);
                if (result.success) installedCount += 1;
            }

            alert(`✅ Imported ${installedCount} mod${installedCount === 1 ? '' : 's'}.`);
            loadMods();
        } catch (error) {
            console.error('Failed to import mod:', error);
            alert('❌ Failed to import mod file.');
        } finally {
            event.target.value = '';
        }
    };

    const storageUsage = nexusModStorage.getStorageUsage();
    const installedIds = mods.map(m => m.id);

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
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #333',
                padding: '16px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                }}>
                    <Package size={24} style={{ color: '#14b8a6' }} />
                    <div>
                        <h1 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                            Nexus Mods Manager
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '12px' }}>
                            {mods.length} installed • {storageUsage.totalMB} MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #333',
                backgroundColor: '#0f0f0f',
            }}>
                {[
                    { id: 'browse', label: 'Browse Mods' },
                    { id: 'installed', label: 'Installed' },
                    { id: 'create', label: 'Create Mod' },
                ].map(tab => (
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
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                {/* Browse Tab */}
                {activeTab === 'browse' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Info Box */}
                        <div style={{
                            backgroundColor: '#1a2d1f',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #14b8a6',
                            marginBottom: '8px',
                        }}>
                            <p style={{ margin: 0, color: '#14b8a6', fontSize: '13px' }}>
                                ⚡ <strong>Nexus Mods modify actual settings!</strong> Each mod changes real preferences like theme, widgets, animations, etc.
                                You may need to reload the page after installing to see all changes take effect.
                            </p>
                        </div>

                        {/* Dark Theme Pro Tip */}
                        <div style={{
                            backgroundColor: '#1a1a2d',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #4d96ff',
                            marginBottom: '8px',
                        }}>
                            <p style={{ margin: 0, color: '#8bb4ff', fontSize: '13px' }}>
                                🌙 <strong>Dark Theme Pro Tip:</strong> This mod reads your current theme color and creates a dark version.
                                White → Dark Gray, Red → Dark Red, Blue → Dark Blue, etc. Change your theme color in Settings, then toggle the mod to update!
                            </p>
                        </div>

                        <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                            {installedIds.length}/{availableMods.length} mods installed
                        </p>
                        {availableMods.map(mod => (
                            <div
                                key={mod.id}
                                style={{
                                    padding: '12px',
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{
                                            margin: 0,
                                            color: '#fff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}>
                                            {mod.name}
                                        </h3>
                                        {installedIds.includes(mod.id) && (
                                            <CheckCircle size={16} style={{ color: '#14b8a6' }} />
                                        )}
                                    </div>
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        color: '#666',
                                        fontSize: '12px',
                                    }}>
                                        by {mod.author} • v{mod.version} • ⬇️ {mod.downloads}
                                    </p>
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        color: '#999',
                                        fontSize: '12px',
                                    }}>
                                        {mod.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleInstallMod(mod)}
                                    disabled={installedIds.includes(mod.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: installedIds.includes(mod.id) ? '#333' : '#14b8a6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: installedIds.includes(mod.id) ? 'default' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        opacity: installedIds.includes(mod.id) ? 0.5 : 1,
                                    }}
                                >
                                    {installedIds.includes(mod.id) ? 'Installed' : <><Download size={14} /> Install</>}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Installed Tab */}
                {activeTab === 'installed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mods.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center', padding: '32px 0' }}>
                                No mods installed. Browse and install some mods!
                            </p>
                        ) : (
                            <>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}>
                                    <button
                                        onClick={() => importInputRef.current?.click()}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: '#3b465a',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <Upload size={14} /> Import Mod
                                    </button>
                                    <button
                                        onClick={handleExportAll}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: '#2d5a4a',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <Upload size={14} /> Export All
                                    </button>
                                </div>
                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept="application/json"
                                    onChange={handleImportMod}
                                    style={{ display: 'none' }}
                                />

                                {mods.map(mod => (
                                    <div
                                        key={mod.id}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: mod.enabled ? '#1a2d1f' : '#2a1a1a',
                                            border: `1px solid ${mod.enabled ? '#14b8a6' : '#444'}`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: mod.enabled ? 1 : 0.6,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                margin: 0,
                                                color: '#fff',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }}>
                                                {mod.name}
                                            </h3>
                                            <p style={{
                                                margin: '4px 0 0 0',
                                                color: '#666',
                                                fontSize: '12px',
                                            }}>
                                                by {mod.author} • v{mod.version}
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '6px',
                                        }}>
                                            <button
                                                onClick={() => handleToggleMod(mod.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: mod.enabled ? '#14b8a6' : '#666',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {mod.enabled ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleExportMod(mod.id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    backgroundColor: '#3b5a6a',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }}
                                                title="Export mod"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleUninstallMod(mod.id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    backgroundColor: '#5a2a2a',
                                                    color: '#ff6b6b',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Create Mod Tab */}
                {activeTab === 'create' && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}>
                        <div style={{
                            backgroundColor: '#1a2d1f',
                            padding: '16px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #14b8a6',
                        }}>
                            <p style={{ margin: 0, color: '#14b8a6', fontSize: '13px' }}>
                                💡 <strong>Tip:</strong> Build mods visually or write code directly. Visual mods create elements, animations, and click actions.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['visual', 'ui', 'code'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setCreateMode(mode)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: createMode === mode ? '#14b8a6' : '#2a2a2a',
                                        color: createMode === mode ? '#000' : '#bbb',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {mode === 'visual'
                                        ? 'Visual Editor'
                                        : mode === 'ui'
                                            ? 'UI Preset'
                                            : 'Code Editor'}
                                </button>
                            ))}
                        </div>

                        {createMode === 'visual' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 3fr 1.4fr',
                                gap: '12px',
                                alignItems: 'start'
                            }}>
                                <div style={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Elements</h3>
                                        <button
                                            onClick={() => createVisualElement('rect')}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#14b8a6',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        >
                                            + Add
                                        </button>
                                    </div>

                                    {visualElements.length === 0 ? (
                                        <p style={{ color: '#666', fontSize: '12px' }}>No elements yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {visualElements.map(el => (
                                                <button
                                                    key={el.id}
                                                    onClick={() => setSelectedElementId(el.id)}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '6px 8px',
                                                        backgroundColor: selectedElementId === el.id ? '#223' : '#2a2a2a',
                                                        color: '#ccc',
                                                        border: '1px solid #333',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {el.id} ({el.type})
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    backgroundColor: '#121212',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Canvas</h3>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#aaa', fontSize: '11px' }}>
                                                Zoom
                                                <input
                                                    type="range"
                                                    min="0.6"
                                                    max="1.6"
                                                    step="0.05"
                                                    value={zoomLevel}
                                                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                                                    style={{ width: '90px' }}
                                                />
                                                <span style={{ color: '#9ae6b4', fontSize: '11px', minWidth: '36px' }}>{Math.round(zoomLevel * 100)}%</span>
                                            </label>
                                            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#aaa', fontSize: '11px' }}>
                                                Live Preview
                                                <input
                                                    type="checkbox"
                                                    checked={livePreviewEnabled}
                                                    onChange={(e) => setLivePreviewEnabled(e.target.checked)}
                                                    style={{ width: '14px', height: '14px' }}
                                                />
                                            </label>
                                            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#aaa', fontSize: '11px' }}>
                                                UI Preview
                                                <input
                                                    type="checkbox"
                                                    checked={showUiPreview}
                                                    onChange={(e) => setShowUiPreview(e.target.checked)}
                                                    style={{ width: '14px', height: '14px' }}
                                                />
                                            </label>
                                            {showUiPreview && (
                                                <select
                                                    value={uiPreviewMode}
                                                    onChange={(e) => setUiPreviewMode(e.target.value)}
                                                    style={{
                                                        backgroundColor: '#1f1f1f',
                                                        color: '#bbb',
                                                        border: '1px solid #333',
                                                        borderRadius: '4px',
                                                        padding: '2px 6px',
                                                        fontSize: '11px'
                                                    }}
                                                >
                                                    <option value="dashboard">Dashboard UI</option>
                                                    <option value="windows">Windows Mode UI</option>
                                                </select>
                                            )}
                                            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#aaa', fontSize: '11px' }}>
                                                Reference Points
                                                <input
                                                    type="checkbox"
                                                    checked={showReferencePoints}
                                                    onChange={(e) => setShowReferencePoints(e.target.checked)}
                                                    style={{ width: '14px', height: '14px' }}
                                                />
                                            </label>
                                            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#aaa', fontSize: '11px' }}>
                                                Hover IDs
                                                <input
                                                    type="checkbox"
                                                    checked={showHoverIds}
                                                    onChange={(e) => setShowHoverIds(e.target.checked)}
                                                    style={{ width: '14px', height: '14px' }}
                                                />
                                            </label>
                                            <button
                                                onClick={() => setZoomLevel(1)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#2a2a2a',
                                                    color: '#bbb',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        ref={canvasRef}
                                        onMouseMove={createMode === 'visual' ? handleCanvasMouseMove : undefined}
                                        onMouseUp={createMode === 'visual' ? handleCanvasMouseUp : undefined}
                                        onMouseLeave={createMode === 'visual' ? handleCanvasMouseUp : undefined}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '520px',
                                            background: showUiPreview
                                                ? 'linear-gradient(180deg, rgba(10, 12, 18, 0.75), rgba(10, 12, 18, 0.4)), radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.08), rgba(15, 23, 42, 0.9))'
                                                : 'radial-gradient(circle at 20% 20%, #1f2937, #0b0f17)',
                                            backdropFilter: showUiPreview ? 'blur(6px)' : 'none',
                                            border: '1px dashed #2a2a2a',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: 'top left'
                                        }}>
                                            {showUiPreview && uiPreviewMode === 'dashboard' && (
                                                <div style={{ pointerEvents: 'none' }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        left: 12,
                                                        right: 12,
                                                        height: 96,
                                                        borderRadius: 16,
                                                        background: 'rgba(15, 23, 42, 0.45)',
                                                        border: '1px solid rgba(148, 163, 184, 0.16)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '16px',
                                                        gap: 16
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            <div style={{ width: 140, height: 10, borderRadius: 999, background: 'rgba(148, 163, 184, 0.25)' }} />
                                                            <div style={{ width: 220, height: 16, borderRadius: 999, background: 'rgba(148, 163, 184, 0.4)' }} />
                                                            <div style={{ width: 120, height: 10, borderRadius: 999, background: 'rgba(148, 163, 184, 0.2)' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {Array.from({ length: 3 }).map((_, index) => (
                                                                <div
                                                                    key={`quick-${index}`}
                                                                    style={{
                                                                        width: 60,
                                                                        height: 28,
                                                                        borderRadius: 999,
                                                                        background: 'rgba(20, 184, 166, 0.28)',
                                                                        border: '1px solid rgba(20, 184, 166, 0.4)'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 122,
                                                        left: 12,
                                                        right: 12,
                                                        height: 70,
                                                        borderRadius: 16,
                                                        background: 'rgba(15, 23, 42, 0.35)',
                                                        border: '1px solid rgba(148, 163, 184, 0.15)',
                                                    }} />

                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 205,
                                                        left: 12,
                                                        right: 12,
                                                        height: 70,
                                                        borderRadius: 16,
                                                        background: 'rgba(15, 23, 42, 0.35)',
                                                        border: '1px solid rgba(148, 163, 184, 0.12)'
                                                    }}>
                                                    </div>

                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 300,
                                                        left: 12,
                                                        right: 12,
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                                        gap: 12
                                                    }}>
                                                        {Array.from({ length: 8 }).map((_, index) => (
                                                            <div
                                                                key={`tile-${index}`}
                                                                style={{
                                                                    height: 74,
                                                                    borderRadius: 16,
                                                                    background: 'rgba(30, 41, 59, 0.45)',
                                                                    border: '1px solid rgba(148, 163, 184, 0.15)'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    <div style={{
                                                        position: 'absolute',
                                                        left: 12,
                                                        right: 12,
                                                        bottom: 18,
                                                        height: 48,
                                                        borderRadius: 12,
                                                        background: 'rgba(15, 23, 42, 0.25)',
                                                        border: '1px solid rgba(148, 163, 184, 0.12)'
                                                    }} />
                                                </div>
                                            )}
                                            {showUiPreview && uiPreviewMode === 'windows' && (
                                                <div style={{ pointerEvents: 'none' }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.35), rgba(2, 6, 23, 0.6))'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 14,
                                                        left: 18,
                                                        width: 220,
                                                        height: 120,
                                                        borderRadius: 12,
                                                        background: 'rgba(15, 23, 42, 0.5)',
                                                        border: '1px solid rgba(148, 163, 184, 0.18)'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 160,
                                                        left: 18,
                                                        width: 160,
                                                        height: 80,
                                                        borderRadius: 12,
                                                        background: 'rgba(30, 41, 59, 0.4)',
                                                        border: '1px solid rgba(148, 163, 184, 0.14)'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 80,
                                                        left: 260,
                                                        right: 18,
                                                        height: 260,
                                                        borderRadius: 16,
                                                        background: 'rgba(15, 23, 42, 0.35)',
                                                        border: '1px solid rgba(148, 163, 184, 0.18)'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 12,
                                                        left: 0,
                                                        right: 0,
                                                        height: 52,
                                                        borderRadius: 12,
                                                        background: 'rgba(15, 23, 42, 0.6)',
                                                        border: '1px solid rgba(148, 163, 184, 0.22)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 10
                                                    }}>
                                                        {Array.from({ length: 6 }).map((_, index) => (
                                                            <div
                                                                key={`task-${index}`}
                                                                style={{
                                                                    width: 30,
                                                                    height: 30,
                                                                    borderRadius: 8,
                                                                    background: 'rgba(148, 163, 184, 0.35)'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {showReferencePoints && (
                                                <>
                                                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                                                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                                                    {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map(point => (
                                                        <div
                                                            key={point}
                                                            style={{
                                                                position: 'absolute',
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'rgba(20, 184, 166, 0.6)',
                                                                border: '1px solid rgba(20, 184, 166, 0.9)',
                                                                left: point.includes('left') ? '8px' : point.includes('right') ? 'calc(100% - 18px)' : 'calc(50% - 5px)',
                                                                top: point.includes('top') ? '8px' : point.includes('bottom') ? 'calc(100% - 18px)' : 'calc(50% - 5px)'
                                                            }}
                                                            title={point}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                            {visualElements.map(el => {
                                                const Tag = el.type === 'button' ? 'button' : 'div';
                                                const isSelected = selectedElementId === el.id;
                                                const isHovered = hoveredElementId === el.id;
                                                return (
                                                    <Tag
                                                        key={el.id}
                                                        onMouseDown={(event) => handleElementMouseDown(event, el.id)}
                                                        onMouseEnter={() => setHoveredElementId(el.id)}
                                                        onMouseLeave={() => setHoveredElementId(null)}
                                                        style={{
                                                            position: 'absolute',
                                                            left: el.x,
                                                            top: el.y,
                                                            width: el.width,
                                                            height: el.height,
                                                            background: el.type === 'text' ? 'transparent' : el.background,
                                                            color: el.color,
                                                            opacity: el.opacity,
                                                            borderRadius: el.borderRadius,
                                                            border: isSelected ? '2px solid #14b8a6' : '1px solid #333',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'move',
                                                            fontSize: '12px',
                                                            pointerEvents: 'auto',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {(el.type === 'text' || el.type === 'button') ? el.text : ''}
                                                        {showHoverIds && isHovered && (
                                                            <span style={{
                                                                position: 'absolute',
                                                                top: '-18px',
                                                                left: 0,
                                                                padding: '2px 6px',
                                                                borderRadius: '999px',
                                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                                color: '#9ae6b4',
                                                                fontSize: '10px',
                                                                border: '1px solid rgba(20, 184, 166, 0.5)'
                                                            }}>
                                                                {el.id}
                                                            </span>
                                                        )}
                                                    </Tag>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '14px' }}>Properties</h3>
                                    {selectedElementId ? (
                                        (() => {
                                            const selected = visualElements.find(el => el.id === selectedElementId);
                                            if (!selected) return null;
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Element ID</label>
                                                        <input
                                                            type="text"
                                                            value={selected.id}
                                                            onChange={(e) => updateVisualElement(selected.id, { id: e.target.value })}
                                                            style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Type</label>
                                                        <select
                                                            value={selected.type}
                                                            onChange={(e) => updateVisualElement(selected.id, { type: e.target.value })}
                                                            style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                        >
                                                            <option value="rect">Rectangle</option>
                                                            <option value="text">Text</option>
                                                            <option value="button">Button</option>
                                                        </select>
                                                    </div>

                                                    {(selected.type === 'text' || selected.type === 'button') && (
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Text</label>
                                                            <input
                                                                type="text"
                                                                value={selected.text}
                                                                onChange={(e) => updateVisualElement(selected.id, { text: e.target.value })}
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>X</label>
                                                            <input
                                                                type="number"
                                                                value={Math.round(selected.x)}
                                                                onChange={(e) => updateVisualElement(selected.id, { x: parseInt(e.target.value || '0', 10) })}
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Y</label>
                                                            <input
                                                                type="number"
                                                                value={Math.round(selected.y)}
                                                                onChange={(e) => updateVisualElement(selected.id, { y: parseInt(e.target.value || '0', 10) })}
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Width</label>
                                                            <input
                                                                type="number"
                                                                value={Math.round(selected.width)}
                                                                onChange={(e) => updateVisualElement(selected.id, { width: parseInt(e.target.value || '0', 10) })}
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Height</label>
                                                            <input
                                                                type="number"
                                                                value={Math.round(selected.height)}
                                                                onChange={(e) => updateVisualElement(selected.id, { height: parseInt(e.target.value || '0', 10) })}
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Opacity</label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={selected.opacity}
                                                            onChange={(e) => updateVisualElement(selected.id, { opacity: parseFloat(e.target.value) })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Color</label>
                                                            <input
                                                                type="color"
                                                                value={selected.color}
                                                                onChange={(e) => updateVisualElement(selected.id, { color: e.target.value })}
                                                                style={{ width: '100%', height: '32px', marginTop: '4px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '4px' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Background</label>
                                                            <input
                                                                type="color"
                                                                value={selected.background}
                                                                onChange={(e) => updateVisualElement(selected.id, { background: e.target.value })}
                                                                style={{ width: '100%', height: '32px', marginTop: '4px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '4px' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Border Radius</label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="40"
                                                            step="1"
                                                            value={selected.borderRadius}
                                                            onChange={(e) => updateVisualElement(selected.id, { borderRadius: parseInt(e.target.value, 10) })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Action</label>
                                                        <select
                                                            value={selected.actionType}
                                                            onChange={(e) => updateVisualElement(selected.id, { actionType: e.target.value })}
                                                            style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                        >
                                                            <option value="none">None</option>
                                                            <option value="navigate">Navigate to Page</option>
                                                            <option value="open-url">Open URL</option>
                                                        </select>
                                                    </div>

                                                    {selected.actionType === 'navigate' && (
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Target Page ID</label>
                                                            <input
                                                                type="text"
                                                                value={selected.actionTarget}
                                                                onChange={(e) => updateVisualElement(selected.id, { actionTarget: e.target.value })}
                                                                placeholder="Settings, Games, Utilities"
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                    )}

                                                    {selected.actionType === 'open-url' && (
                                                        <div>
                                                            <label style={{ color: '#999', fontSize: '11px' }}>Target URL</label>
                                                            <input
                                                                type="text"
                                                                value={selected.actionTarget}
                                                                onChange={(e) => updateVisualElement(selected.id, { actionTarget: e.target.value })}
                                                                placeholder="https://example.com/game"
                                                                style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px' }}>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Follow Mouse</label>
                                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#bbb', marginTop: '4px' }}>
                                                            Enable
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.followMouse}
                                                                onChange={(e) => updateVisualElement(selected.id, { followMouse: e.target.checked })}
                                                                style={{ width: '16px', height: '16px' }}
                                                            />
                                                        </label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                                                            <div>
                                                                <label style={{ color: '#999', fontSize: '11px' }}>Offset X</label>
                                                                <input
                                                                    type="number"
                                                                    value={selected.mouseOffsetX}
                                                                    onChange={(e) => updateVisualElement(selected.id, { mouseOffsetX: parseInt(e.target.value || '0', 10) })}
                                                                    style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ color: '#999', fontSize: '11px' }}>Offset Y</label>
                                                                <input
                                                                    type="number"
                                                                    value={selected.mouseOffsetY}
                                                                    onChange={(e) => updateVisualElement(selected.id, { mouseOffsetY: parseInt(e.target.value || '0', 10) })}
                                                                    style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px' }}>
                                                        <label style={{ color: '#999', fontSize: '11px' }}>Reference Snap</label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                                                            {[
                                                                { id: 'top-left', label: 'Top Left' },
                                                                { id: 'top-right', label: 'Top Right' },
                                                                { id: 'center', label: 'Center' },
                                                                { id: 'bottom-left', label: 'Bottom Left' },
                                                                { id: 'bottom-right', label: 'Bottom Right' }
                                                            ].map(anchor => (
                                                                <button
                                                                    key={anchor.id}
                                                                    onClick={() => snapElementToAnchor(selected.id, anchor.id)}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        backgroundColor: '#2a2a2a',
                                                                        color: '#bbb',
                                                                        border: '1px solid #333',
                                                                        borderRadius: '4px',
                                                                        fontSize: '10px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {anchor.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        borderTop: '1px solid #2a2a2a',
                                                        paddingTop: '8px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: '#bbb', fontSize: '12px' }}>Frames: {selected.frames.length}</span>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => addFrameToElement(selected.id)}
                                                                    style={{ padding: '4px 8px', backgroundColor: '#14b8a6', color: '#000', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                                                                >
                                                                    Add Frame
                                                                </button>
                                                                <button
                                                                    onClick={() => clearFramesForElement(selected.id)}
                                                                    style={{ padding: '4px 8px', backgroundColor: '#333', color: '#bbb', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                                                                >
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                                            <div>
                                                                <label style={{ color: '#999', fontSize: '11px' }}>Duration (ms)</label>
                                                                <input
                                                                    type="number"
                                                                    value={selected.animation.durationMs}
                                                                    onChange={(e) => updateVisualElementAnimation(selected.id, { durationMs: parseInt(e.target.value || '0', 10) })}
                                                                    style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ color: '#999', fontSize: '11px' }}>Smoothing</label>
                                                                <select
                                                                    value={selected.animation.easing}
                                                                    onChange={(e) => updateVisualElementAnimation(selected.id, { easing: e.target.value })}
                                                                    style={{ width: '100%', padding: '6px', marginTop: '4px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                                                >
                                                                    <option value="linear">Linear</option>
                                                                    <option value="ease">Ease</option>
                                                                    <option value="ease-in">Ease In</option>
                                                                    <option value="ease-out">Ease Out</option>
                                                                    <option value="ease-in-out">Smooth</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#bbb' }}>
                                                            Loop
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.animation.loop}
                                                                onChange={(e) => updateVisualElementAnimation(selected.id, { loop: e.target.checked })}
                                                                style={{ width: '16px', height: '16px' }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p style={{ color: '#666', fontSize: '12px' }}>Select an element to edit.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {createMode === 'ui' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '12px',
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                padding: '12px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Theme</h3>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Mode
                                        <select
                                            value={uiPreset.themeMode}
                                            onChange={(e) => setUiPreset({ ...uiPreset, themeMode: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                            <option value="amoled">AMOLED</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Accent Color
                                        <input
                                            type="color"
                                            value={uiPreset.accent}
                                            onChange={(e) => setUiPreset({ ...uiPreset, accent: e.target.value })}
                                            style={{ width: '100%', height: '34px', marginTop: '4px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '4px' }}
                                        />
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Background Type
                                        <select
                                            value={uiPreset.backgroundType}
                                            onChange={(e) => setUiPreset({ ...uiPreset, backgroundType: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="soft-particle-drift">Soft Particle Drift</option>
                                            <option value="gradient">Gradient</option>
                                            <option value="waves">Waves</option>
                                            <option value="noise">Noise</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Background Opacity
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={uiPreset.backgroundOpacity}
                                            onChange={(e) => setUiPreset({ ...uiPreset, backgroundOpacity: parseFloat(e.target.value) })}
                                            style={{ width: '100%' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Layout</h3>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Taskbar Position
                                        <select
                                            value={uiPreset.taskbarPosition}
                                            onChange={(e) => setUiPreset({ ...uiPreset, taskbarPosition: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="bottom">Bottom</option>
                                            <option value="left">Left</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Taskbar Style
                                        <select
                                            value={uiPreset.taskbarStyle}
                                            onChange={(e) => setUiPreset({ ...uiPreset, taskbarStyle: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="modern">Modern</option>
                                            <option value="classic">Classic</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Windows Version
                                        <select
                                            value={uiPreset.windowsVersion}
                                            onChange={(e) => setUiPreset({ ...uiPreset, windowsVersion: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="11">Windows 11</option>
                                            <option value="10">Windows 10</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px' }}>
                                        Density
                                        <select
                                            value={uiPreset.density}
                                            onChange={(e) => setUiPreset({ ...uiPreset, density: e.target.value })}
                                            style={{ width: '100%', marginTop: '4px', padding: '6px', backgroundColor: '#232323', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                        >
                                            <option value="compact">Compact</option>
                                            <option value="default">Default</option>
                                            <option value="comfortable">Comfortable</option>
                                        </select>
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Blur
                                        <input
                                            type="checkbox"
                                            checked={uiPreset.blur}
                                            onChange={(e) => setUiPreset({ ...uiPreset, blur: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                    </label>
                                    <label style={{ color: '#999', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Transparency
                                        <input
                                            type="checkbox"
                                            checked={uiPreset.transparency}
                                            onChange={(e) => setUiPreset({ ...uiPreset, transparency: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {createMode === 'code' && (
                            <div>
                                <label style={{ color: '#999', fontSize: '12px' }}>Mod Code (JavaScript)</label>
                                <textarea
                                    value={newMod.code}
                                    onChange={(e) => setNewMod({ ...newMod, code: e.target.value })}
                                    placeholder="// Your mod code here\nconsole.log('My mod loaded!');"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginTop: '4px',
                                        height: '160px',
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#14b8a6',
                                        fontSize: '12px',
                                        fontFamily: 'Monaco, Consolas, monospace',
                                        boxSizing: 'border-box',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ color: '#999', fontSize: '12px' }}>Mod Name</label>
                            <input
                                type="text"
                                value={newMod.name}
                                onChange={(e) => setNewMod({ ...newMod, name: e.target.value })}
                                placeholder="My Awesome Mod"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '4px',
                                    backgroundColor: '#2a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#999', fontSize: '12px' }}>Description</label>
                            <textarea
                                value={newMod.description}
                                onChange={(e) => setNewMod({ ...newMod, description: e.target.value })}
                                placeholder="What does your mod do?"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '4px',
                                    height: '60px',
                                    backgroundColor: '#2a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        <button
                            onClick={handleCreateMod}
                            style={{
                                padding: '12px',
                                backgroundColor: '#14b8a6',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <Plus size={18} /> Create Mod
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
