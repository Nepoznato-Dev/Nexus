import React, { useState, useEffect } from 'react';
import {
    Folder, FileText, Image, Film, Music, Package,
    ChevronLeft, ChevronRight, Home, Search, Grid, List,
    Plus, Upload, FolderPlus, Trash2, PencilLine, X, Download,
    MoreVertical, Eye, Copy, Share2, Star, ChevronDown, Monitor,
    HardDrive, Database
} from 'lucide-react';

// Storage keys
const C_DRIVE_KEY = 'nexus_c_drive'; // localStorage
const D_DRIVE_KEY = 'nexus_d_drive'; // IndexedDB
const CACHE_NAME = 'nexus-d-drive-files';

// IndexedDB helper
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NexusFileSystem', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'path' });
            }
        };
    });
};

// Save to IndexedDB
const saveToIndexedDB = async (path, data) => {
    const db = await openDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    store.put({ path, data });
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

// Load from IndexedDB
const loadFromIndexedDB = async (path) => {
    const db = await openDB();
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.get(path);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => reject(request.error);
    });
};

// Delete from IndexedDB
const deleteFromIndexedDB = async (path) => {
    const db = await openDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    store.delete(path);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

// Save file content to Cache API
const saveToCache = async (path, content) => {
    const cache = await caches.open(CACHE_NAME);
    const blob = new Blob([content], { type: 'text/plain' });
    const response = new Response(blob);
    await cache.put(path, response);
};

// Load file content from Cache API
const loadFromCache = async (path) => {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(path);
    if (response) {
        return await response.text();
    }
    return null;
};

// Delete from Cache API
const deleteFromCache = async (path) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(path);
};

// Default file system for C: drive (localStorage)
const getDefaultCDrive = () => ({
    'C:/': {
        type: 'folder',
        name: 'C:',
        children: ['Users', 'Program Files', 'Windows'],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users': {
        type: 'folder',
        name: 'Users',
        children: ['Nexus'],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus': {
        type: 'folder',
        name: 'Nexus',
        children: ['Documents', 'Downloads', 'Pictures', 'Videos', 'Music', 'Desktop'],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Documents': {
        type: 'folder',
        name: 'Documents',
        children: ['welcome.txt'],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Documents/welcome.txt': {
        type: 'file',
        name: 'welcome.txt',
        content: 'Welcome to Nexus File Manager!\n\nC: Drive uses LocalStorage (limited to ~5MB)\nD: Drive uses IndexedDB + Cache API (much larger capacity)\n\nYou can upload real files and they will be stored persistently!',
        size: 0,
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Downloads': {
        type: 'folder',
        name: 'Downloads',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Pictures': {
        type: 'folder',
        name: 'Pictures',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Videos': {
        type: 'folder',
        name: 'Videos',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Music': {
        type: 'folder',
        name: 'Music',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Users/Nexus/Desktop': {
        type: 'folder',
        name: 'Desktop',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Program Files': {
        type: 'folder',
        name: 'Program Files',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    },
    'C:/Windows': {
        type: 'folder',
        name: 'Windows',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'C'
    }
});

// Default file system for D: drive (IndexedDB + Cache)
const getDefaultDDrive = () => ({
    'D:/': {
        type: 'folder',
        name: 'D:',
        children: ['Storage', 'Media', 'Backups'],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'D'
    },
    'D:/Storage': {
        type: 'folder',
        name: 'Storage',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'D'
    },
    'D:/Media': {
        type: 'folder',
        name: 'Media',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'D'
    },
    'D:/Backups': {
        type: 'folder',
        name: 'Backups',
        children: [],
        dateCreated: Date.now(),
        dateModified: Date.now(),
        drive: 'D'
    }
});

// Load file system for C: drive
const loadCDrive = () => {
    const saved = localStorage.getItem(C_DRIVE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load C: drive:', e);
        }
    }
    return getDefaultCDrive();
};

// Load file system for D: drive
const loadDDrive = async () => {
    try {
        const data = await loadFromIndexedDB(D_DRIVE_KEY);
        if (data) {
            return data;
        }
    } catch (e) {
        console.error('Failed to load D: drive:', e);
    }
    return getDefaultDDrive();
};

// Save C: drive to localStorage
const saveCDrive = (fs) => {
    localStorage.setItem(C_DRIVE_KEY, JSON.stringify(fs));
};

// Save D: drive to IndexedDB
const saveDDrive = async (fs) => {
    await saveToIndexedDB(D_DRIVE_KEY, fs);
};

// Get file icon
const getFileIcon = (name, type) => {
    if (type === 'folder') return <Folder size={32} />;

    const ext = name.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        return <Image size={32} />;
    }
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) {
        return <Film size={32} />;
    }
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
        return <Music size={32} />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return <Package size={32} />;
    }

    return <FileText size={32} />;
};

// Format file size
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Format date
const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
};

export default function FileManagerApp() {
    const [fileSystem, setFileSystem] = useState({});
    const [currentPath, setCurrentPath] = useState('C:/Users/Nexus');
    const [history, setHistory] = useState(['C:/Users/Nexus']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showNewFileDialog, setShowNewFileDialog] = useState(false);
    const [dialogInput, setDialogInput] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(new Set(['C:/', 'C:/Users', 'C:/Users/Nexus', 'D:/']));
    const [favorites, setFavorites] = useState(new Set(['C:/Users/Nexus/Documents', 'C:/Users/Nexus/Downloads', 'C:/Users/Nexus/Pictures', 'C:/Users/Nexus/Desktop']));
    const [loading, setLoading] = useState(true);

    // Load both drives on mount
    useEffect(() => {
        const loadDrives = async () => {
            setLoading(true);
            try {
                const cDrive = loadCDrive();
                const dDrive = await loadDDrive();
                setFileSystem({ ...cDrive, ...dDrive });
            } catch (e) {
                console.error('Failed to load drives:', e);
            }
            setLoading(false);
        };
        loadDrives();
    }, []);

    // Save file system whenever it changes
    useEffect(() => {
        if (Object.keys(fileSystem).length === 0 || loading) return;

        // Split filesystem by drive and save to appropriate storage
        const cFiles = {};
        const dFiles = {};

        Object.entries(fileSystem).forEach(([path, item]) => {
            if (path.startsWith('C:')) {
                cFiles[path] = item;
            } else if (path.startsWith('D:')) {
                dFiles[path] = item;
            }
        });

        // Save C: drive to localStorage
        saveCDrive(cFiles);

        // Save D: drive to IndexedDB async
        saveDDrive(dFiles).catch(err => console.error('Failed to save D: drive:', err));
    }, [fileSystem, loading]);

    // Close context menu when clicking elsewhere
    useEffect(() => {
        const handleClickAway = () => {
            if (contextMenu) setContextMenu(null);
        };

        document.addEventListener('click', handleClickAway);
        return () => document.removeEventListener('click', handleClickAway);
    }, [contextMenu]);

    // Get current folder contents
    const getCurrentFolder = () => {
        return fileSystem[currentPath] || { children: [] };
    };

    // Get items in current folder
    const getCurrentItems = () => {
        const folder = getCurrentFolder();
        if (!folder.children) return [];

        return folder.children
            .map(name => {
                const path = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
                return fileSystem[path];
            })
            .filter(item => item && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    // Navigate to path
    const navigateTo = (path) => {
        setCurrentPath(path);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setSelectedFile(null);
        setContextMenu(null);
    };

    // Go back
    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSelectedFile(null);
        }
    };

    // Go forward
    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(history[historyIndex + 1]);
            setSelectedFile(null);
        }
    };

    // Go to parent folder
    const goUp = () => {
        if (currentPath === '/') return;
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        navigateTo(parentPath);
    };

    // Create new folder
    const createFolder = () => {
        if (!dialogInput.trim()) return;

        const newPath = currentPath === '/' ? `/${dialogInput}` : `${currentPath}/${dialogInput}`;

        if (fileSystem[newPath]) {
            alert('A folder with this name already exists');
            return;
        }

        const newFS = { ...fileSystem };
        newFS[newPath] = {
            type: 'folder',
            name: dialogInput,
            children: [],
            dateCreated: Date.now(),
            dateModified: Date.now()
        };

        // Add to parent's children
        const parent = newFS[currentPath];
        if (parent && parent.children) {
            parent.children = [...parent.children, dialogInput];
            parent.dateModified = Date.now();
        }

        setFileSystem(newFS);
        setShowNewFolderDialog(false);
        setDialogInput('');
    };

    // Create new file
    const createFile = () => {
        if (!dialogInput.trim()) return;

        const newPath = currentPath === '/' ? `/${dialogInput}` : `${currentPath}/${dialogInput}`;

        if (fileSystem[newPath]) {
            alert('A file with this name already exists');
            return;
        }

        const newFS = { ...fileSystem };
        newFS[newPath] = {
            type: 'file',
            name: dialogInput,
            content: '',
            size: 0,
            dateCreated: Date.now(),
            dateModified: Date.now()
        };

        // Add to parent's children
        const parent = newFS[currentPath];
        if (parent && parent.children) {
            parent.children = [...parent.children, dialogInput];
            parent.dateModified = Date.now();
        }

        setFileSystem(newFS);
        setShowNewFileDialog(false);
        setDialogInput('');
    };

    // Rename file/folder
    const renameItem = () => {
        if (!dialogInput.trim() || !selectedFile) return;

        const oldPath = currentPath === '/' ? `/${selectedFile}` : `${currentPath}/${selectedFile}`;
        const newPath = currentPath === '/' ? `/${dialogInput}` : `${currentPath}/${dialogInput}`;

        if (fileSystem[newPath]) {
            alert('An item with this name already exists');
            return;
        }

        const newFS = { ...fileSystem };
        const item = newFS[oldPath];

        // Update item name
        item.name = dialogInput;
        item.dateModified = Date.now();

        // Move item to new path
        newFS[newPath] = item;
        delete newFS[oldPath];

        // Update parent's children
        const parent = newFS[currentPath];
        if (parent && parent.children) {
            parent.children = parent.children.map(name => name === selectedFile ? dialogInput : name);
            parent.dateModified = Date.now();
        }

        // If it's a folder, update all children paths
        if (item.type === 'folder') {
            const updateChildPaths = (oldParent, newParent) => {
                Object.keys(newFS).forEach(path => {
                    if (path.startsWith(oldParent + '/')) {
                        const relativePath = path.substring(oldParent.length);
                        const newChildPath = newParent + relativePath;
                        newFS[newChildPath] = newFS[path];
                        delete newFS[path];
                    }
                });
            };
            updateChildPaths(oldPath, newPath);
        }

        setFileSystem(newFS);
        setShowRenameDialog(false);
        setDialogInput('');
        setSelectedFile(null);
    };

    // Delete file/folder
    const deleteItem = (itemName) => {
        if (!itemName) return; // Safety check for null/undefined
        if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

        const itemPath = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
        const newFS = { ...fileSystem };
        const item = newFS[itemPath];

        if (!item) return; // Safety check if item doesn't exist

        // Delete item and all children if folder
        if (item.type === 'folder') {
            Object.keys(newFS).forEach(path => {
                if (path === itemPath || path.startsWith(itemPath + '/')) {
                    delete newFS[path];
                }
            });
        } else {
            delete newFS[itemPath];
        }

        // Remove from parent's children
        const parent = newFS[currentPath];
        if (parent && parent.children) {
            parent.children = parent.children.filter(name => name !== itemName);
            parent.dateModified = Date.now();
        }

        setFileSystem(newFS);
        setSelectedFile(null);
        setContextMenu(null);
    };

    // Handle file click
    const handleFileClick = (item) => {
        const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;

        if (item.type === 'folder') {
            navigateTo(itemPath);
        } else {
            setSelectedFile(item.name);
            setPreviewFile(fileSystem[itemPath]);
        }
    };

    // Handle file double click
    const handleFileDoubleClick = (item) => {
        const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;

        if (item.type === 'folder') {
            navigateTo(itemPath);
        } else {
            // Open file preview
            setPreviewFile(fileSystem[itemPath]);
        }
    };

    // Get breadcrumb parts
    const getBreadcrumbs = () => {
        if (currentPath === '/') return [{ name: 'Home', path: '/' }];

        const parts = currentPath.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Home', path: '/' }];

        let path = '';
        parts.forEach(part => {
            path += '/' + part;
            breadcrumbs.push({ name: part, path });
        });

        return breadcrumbs;
    };

    // Toggle folder expansion in sidebar
    const toggleFolderExpanded = (path) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };

    // Toggle favorite
    const toggleFavorite = (path) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(path)) {
            newFavorites.delete(path);
        } else {
            newFavorites.add(path);
        }
        setFavorites(newFavorites);
    };

    // Get all folders recursively for sidebar
    const getAllFolders = (parentPath = '/') => {
        const folder = fileSystem[parentPath];
        if (!folder || !folder.children) return [];

        const folders = [];
        folder.children.forEach(childName => {
            const childPath = parentPath === '/' ? `/${childName}` : `${parentPath}/${childName}`;
            const child = fileSystem[childPath];
            if (child && child.type === 'folder') {
                folders.push({
                    name: childName,
                    path: childPath,
                    hasChildren: child.children && child.children.some(name => {
                        const subPath = childPath === '/' ? `/${name}` : `${childPath}/${name}`;
                        return fileSystem[subPath]?.type === 'folder';
                    })
                });
            }
        });
        return folders;
    };

    const items = getCurrentItems();

    if (loading) {
        return (
            <div style={{
                height: '100%',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
            }}>
                Loading file system...
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#1a1a2e',
            color: '#fff',
        }}>
            {/* Toolbar */}
            <div style={{
                padding: '8px 12px',
                backgroundColor: '#0f1419',
                borderBottom: '1px solid #2a2a3e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                {/* Navigation buttons */}
                <button
                    onClick={goBack}
                    disabled={historyIndex === 0}
                    style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2a2a3e',
                        borderRadius: '4px',
                        color: historyIndex === 0 ? '#555' : '#fff',
                        cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={goForward}
                    disabled={historyIndex === history.length - 1}
                    style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2a2a3e',
                        borderRadius: '4px',
                        color: historyIndex === history.length - 1 ? '#555' : '#fff',
                        cursor: historyIndex === history.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ChevronRight size={18} />
                </button>
                <button
                    onClick={goUp}
                    disabled={currentPath === '/'}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2a2a3e',
                        borderRadius: '4px',
                        color: currentPath === '/' ? '#555' : '#fff',
                        cursor: currentPath === '/' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                    }}
                >
                    <Home size={16} />
                    Up
                </button>

                <div style={{ flex: 1 }} />

                {/* View mode toggle */}
                <button
                    onClick={() => setViewMode('grid')}
                    style={{
                        padding: '6px',
                        backgroundColor: viewMode === 'grid' ? '#2a5aff' : 'transparent',
                        border: '1px solid #2a2a3e',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Grid size={18} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    style={{
                        padding: '6px',
                        backgroundColor: viewMode === 'list' ? '#2a5aff' : 'transparent',
                        border: '1px solid #2a2a3e',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <List size={18} />
                </button>

                {/* Action buttons */}
                <button
                    onClick={() => { setShowNewFolderDialog(true); setDialogInput(''); }}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#2a5aff',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                    }}
                >
                    <FolderPlus size={16} />
                    New Folder
                </button>
                <button
                    onClick={() => { setShowNewFileDialog(true); setDialogInput(''); }}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                    }}
                >
                    <Plus size={16} />
                    New File
                </button>
            </div>

            {/* Breadcrumb & Search */}
            <div style={{
                padding: '12px',
                backgroundColor: '#16213e',
                borderBottom: '1px solid #2a2a3e',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                {/* Breadcrumb */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                }}>
                    {getBreadcrumbs().map((crumb, idx) => (
                        <React.Fragment key={crumb.path}>
                            <button
                                onClick={() => navigateTo(crumb.path)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: crumb.path === currentPath ? '#2a5aff' : 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                {crumb.name}
                            </button>
                            {idx < getBreadcrumbs().length - 1 && (
                                <span style={{ color: '#666' }}>/</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', width: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 6px 6px 32px',
                            backgroundColor: '#0f1419',
                            border: '1px solid #2a2a3e',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
            }}>
                {/* Sidebar */}
                <div style={{
                    width: '220px',
                    backgroundColor: '#0f1419',
                    borderRight: '1px solid #2a2a3e',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Quick Access Section */}
                    <div style={{ padding: '12px 8px 8px 8px' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#888',
                            padding: '4px 8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Quick Access
                        </div>
                    </div>

                    {/* Favorites */}
                    <div style={{ padding: '0 4px' }}>
                        {Array.from(favorites).map(favPath => {
                            const folder = fileSystem[favPath];
                            if (!folder) return null;
                            return (
                                <button
                                    key={favPath}
                                    onClick={() => navigateTo(favPath)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        backgroundColor: currentPath === favPath ? '#2a5aff22' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: currentPath === favPath ? '#6496ff' : '#ccc',
                                        fontSize: '13px',
                                        transition: 'all 0.2s',
                                        marginBottom: '2px',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPath !== favPath) {
                                            e.currentTarget.style.backgroundColor = '#252525';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPath !== favPath) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Star size={14} fill="#f39c12" color="#f39c12" />
                                    <Folder size={16} color="#f39c12" />
                                    <span style={{ flex: 1, textAlign: 'left' }}>{folder.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* This PC Section */}
                    <div style={{ padding: '16px 8px 8px 8px', marginTop: '8px' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#888',
                            padding: '4px 8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            This PC
                        </div>
                    </div>

                    {/* Folder Tree */}
                    <div style={{ padding: '0 4px', flex: 1 }}>
                        {/* C: Drive */}
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => {
                                    toggleFolderExpanded('C:/');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#ccc',
                                    fontSize: '13px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#252525';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <ChevronDown
                                    size={14}
                                    style={{
                                        transform: expandedFolders.has('C:/') ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                                <HardDrive size={16} color="#6496ff" />
                                <span style={{ flex: 1, textAlign: 'left' }}>Local Disk (C:)</span>
                                <span style={{ fontSize: '11px', color: '#666' }}>LocalStorage</span>
                            </button>

                            {/* C: drive folders */}
                            {expandedFolders.has('C:/') && getAllFolders('C:/').map(folder => (
                                <div key={folder.path} style={{ marginLeft: '16px' }}>
                                    <button
                                        onClick={() => {
                                            if (folder.hasChildren) {
                                                toggleFolderExpanded(folder.path);
                                            }
                                            navigateTo(folder.path);
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const isFav = favorites.has(folder.path);
                                            if (window.confirm(isFav ? 'Remove from favorites?' : 'Add to favorites?')) {
                                                toggleFavorite(folder.path);
                                            }
                                        }}
                                        title="Right-click to add/remove favorite"
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            backgroundColor: currentPath === folder.path ? '#2a5aff22' : 'transparent',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: currentPath === folder.path ? '#6496ff' : '#ccc',
                                            fontSize: '13px',
                                            transition: 'all 0.2s',
                                            marginBottom: '2px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPath !== folder.path) {
                                                e.currentTarget.style.backgroundColor = '#252525';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPath !== folder.path) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {folder.hasChildren && (
                                            <ChevronDown
                                                size={14}
                                                style={{
                                                    transform: expandedFolders.has(folder.path) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: 'transform 0.2s'
                                                }}
                                            />
                                        )}
                                        {!folder.hasChildren && <div style={{ width: '14px' }} />}
                                        <Folder size={16} color="#f39c12" />
                                        <span style={{ flex: 1, textAlign: 'left' }}>{folder.name}</span>
                                        {favorites.has(folder.path) && (
                                            <Star size={12} fill="#f39c12" color="#f39c12" />
                                        )}
                                    </button>

                                    {/* Subfolders */}
                                    {expandedFolders.has(folder.path) && getAllFolders(folder.path).map(subfolder => (
                                        <div key={subfolder.path} style={{ marginLeft: '16px' }}>
                                            <button
                                                onClick={() => {
                                                    if (subfolder.hasChildren) {
                                                        toggleFolderExpanded(subfolder.path);
                                                    }
                                                    navigateTo(subfolder.path);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    backgroundColor: currentPath === subfolder.path ? '#2a5aff22' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: currentPath === subfolder.path ? '#6496ff' : '#ccc',
                                                    fontSize: '13px',
                                                    transition: 'all 0.2s',
                                                    marginBottom: '2px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentPath !== subfolder.path) {
                                                        e.currentTarget.style.backgroundColor = '#252525';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPath !== subfolder.path) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {subfolder.hasChildren && (
                                                    <ChevronDown
                                                        size={14}
                                                        style={{
                                                            transform: expandedFolders.has(subfolder.path) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    />
                                                )}
                                                {!subfolder.hasChildren && <div style={{ width: '14px' }} />}
                                                <Folder size={16} color="#f39c12" />
                                                <span style={{ flex: 1, textAlign: 'left' }}>{subfolder.name}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* D: Drive */}
                        <div>
                            <button
                                onClick={() => {
                                    toggleFolderExpanded('D:/');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#ccc',
                                    fontSize: '13px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#252525';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <ChevronDown
                                    size={14}
                                    style={{
                                        transform: expandedFolders.has('D:/') ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                                <Database size={16} color="#10b981" />
                                <span style={{ flex: 1, textAlign: 'left' }}>Data Disk (D:)</span>
                                <span style={{ fontSize: '11px', color: '#666' }}>IndexedDB</span>
                            </button>

                            {/* D: drive folders */}
                            {expandedFolders.has('D:/') && getAllFolders('D:/').map(folder => (
                                <div key={folder.path} style={{ marginLeft: '16px' }}>
                                    <button
                                        onClick={() => {
                                            if (folder.hasChildren) {
                                                toggleFolderExpanded(folder.path);
                                            }
                                            navigateTo(folder.path);
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const isFav = favorites.has(folder.path);
                                            if (window.confirm(isFav ? 'Remove from favorites?' : 'Add to favorites?')) {
                                                toggleFavorite(folder.path);
                                            }
                                        }}
                                        title="Right-click to add/remove favorite"
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            backgroundColor: currentPath === folder.path ? '#2a5aff22' : 'transparent',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: currentPath === folder.path ? '#6496ff' : '#ccc',
                                            fontSize: '13px',
                                            transition: 'all 0.2s',
                                            marginBottom: '2px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPath !== folder.path) {
                                                e.currentTarget.style.backgroundColor = '#252525';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPath !== folder.path) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {folder.hasChildren && (
                                            <ChevronDown
                                                size={14}
                                                style={{
                                                    transform: expandedFolders.has(folder.path) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: 'transform 0.2s'
                                                }}
                                            />
                                        )}
                                        {!folder.hasChildren && <div style={{ width: '14px' }} />}
                                        <Folder size={16} color="#f39c12" />
                                        <span style={{ flex: 1, textAlign: 'left' }}>{folder.name}</span>
                                        {favorites.has(folder.path) && (
                                            <Star size={12} fill="#f39c12" color="#f39c12" />
                                        )}
                                    </button>

                                    {/* Subfolders */}
                                    {expandedFolders.has(folder.path) && getAllFolders(folder.path).map(subfolder => (
                                        <div key={subfolder.path} style={{ marginLeft: '16px' }}>
                                            <button
                                                onClick={() => {
                                                    if (subfolder.hasChildren) {
                                                        toggleFolderExpanded(subfolder.path);
                                                    }
                                                    navigateTo(subfolder.path);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    backgroundColor: currentPath === subfolder.path ? '#2a5aff22' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: currentPath === subfolder.path ? '#6496ff' : '#ccc',
                                                    fontSize: '13px',
                                                    transition: 'all 0.2s',
                                                    marginBottom: '2px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentPath !== subfolder.path) {
                                                        e.currentTarget.style.backgroundColor = '#252525';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPath !== subfolder.path) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {subfolder.hasChildren && (
                                                    <ChevronDown
                                                        size={14}
                                                        style={{
                                                            transform: expandedFolders.has(subfolder.path) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    />
                                                )}
                                                {!subfolder.hasChildren && <div style={{ width: '14px' }} />}
                                                <Folder size={16} color="#f39c12" />
                                                <span style={{ flex: 1, textAlign: 'left' }}>{subfolder.name}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* File List/Grid */}
                <div
                    onContextMenu={(e) => {
                        // Right-click on empty space
                        e.preventDefault();
                        setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            item: null,
                            type: 'empty'
                        });
                    }}
                    style={{
                        flex: previewFile ? 2 : 1,
                        padding: '16px',
                        overflowY: 'auto',
                    }}
                >
                    {items.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#666',
                            fontSize: '14px',
                        }}>
                            {searchQuery ? 'No files match your search' : 'This folder is empty'}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '16px',
                        }}>
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleFileClick(item)}
                                    onDoubleClick={() => handleFileDoubleClick(item)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            item: item.name,
                                            type: item.type
                                        });
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedFile === item.name ? '#2a5aff22' : 'transparent',
                                        border: selectedFile === item.name ? '1px solid #2a5aff' : '1px solid transparent',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedFile !== item.name) {
                                            e.currentTarget.style.backgroundColor = '#252525';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedFile !== item.name) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <div style={{ color: item.type === 'folder' ? '#f39c12' : '#6496ff' }}>
                                        {getFileIcon(item.name, item.type)}
                                    </div>
                                    <span style={{
                                        color: '#fff',
                                        fontSize: '12px',
                                        textAlign: 'center',
                                        wordBreak: 'break-word',
                                        maxWidth: '100%',
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleFileClick(item)}
                                    onDoubleClick={() => handleFileDoubleClick(item)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            item: item.name,
                                            type: item.type
                                        });
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedFile === item.name ? '#2a5aff22' : 'transparent',
                                        border: selectedFile === item.name ? '1px solid #2a5aff' : '1px solid transparent',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedFile !== item.name) {
                                            e.currentTarget.style.backgroundColor = '#252525';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedFile !== item.name) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <div style={{ color: item.type === 'folder' ? '#f39c12' : '#6496ff' }}>
                                        {getFileIcon(item.name, item.type)}
                                    </div>
                                    <span style={{
                                        flex: 1,
                                        color: '#fff',
                                        fontSize: '13px',
                                    }}>
                                        {item.name}
                                    </span>
                                    <span style={{
                                        color: '#666',
                                        fontSize: '12px',
                                    }}>
                                        {item.type === 'folder' ? `${item.children?.length || 0} items` : formatSize(item.size || item.content?.length || 0)}
                                    </span>
                                    <span style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        width: '150px',
                                    }}>
                                        {formatDate(item.dateModified)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* File Preview Panel */}
                {previewFile && (
                    <div style={{
                        flex: 1,
                        borderLeft: '1px solid #2a2a3e',
                        backgroundColor: '#16213e',
                        padding: '16px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingBottom: '12px',
                            borderBottom: '1px solid #2a2a3e',
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>File Preview</span>
                            <button
                                onClick={() => setPreviewFile(null)}
                                style={{
                                    padding: '4px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* File Icon */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '20px',
                            color: previewFile.type === 'folder' ? '#f39c12' : '#6496ff',
                        }}>
                            {getFileIcon(previewFile.name, previewFile.type)}
                        </div>

                        {/* File Info */}
                        <div style={{ fontSize: '13px', color: '#ccc' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>Name:</span> {previewFile.name}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>Type:</span> {previewFile.type === 'folder' ? 'Folder' : 'File'}
                            </div>
                            {previewFile.type === 'file' && (
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#888' }}>Size:</span> {formatSize(previewFile.content?.length || 0)}
                                </div>
                            )}
                            {previewFile.type === 'folder' && (
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#888' }}>Items:</span> {previewFile.children?.length || 0}
                                </div>
                            )}
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>Created:</span> {formatDate(previewFile.dateCreated)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>Modified:</span> {formatDate(previewFile.dateModified)}
                            </div>
                        </div>

                        {/* File Content Preview (for text files) */}
                        {previewFile.type === 'file' && previewFile.content && (
                            <div style={{
                                flex: 1,
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid #2a2a3e',
                            }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Content:</div>
                                <pre style={{
                                    padding: '12px',
                                    backgroundColor: '#0f1419',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#ccc',
                                    overflowX: 'auto',
                                    maxHeight: '300px',
                                    margin: 0,
                                }}>
                                    {previewFile.content}
                                </pre>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{
                            marginTop: 'auto',
                            paddingTop: '12px',
                            borderTop: '1px solid #2a2a3e',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}>
                            <button
                                onClick={() => {
                                    setShowRenameDialog(true);
                                    setDialogInput(previewFile.name);
                                    setSelectedFile(previewFile.name);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#2a5aff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <PencilLine size={14} />
                                Rename
                            </button>
                            <button
                                onClick={() => {
                                    deleteItem(previewFile.name);
                                    setPreviewFile(null);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#ef4444',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div style={{
                padding: '6px 12px',
                backgroundColor: '#0f1419',
                borderTop: '1px solid #2a2a3e',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                {selectedFile && <span>• {selectedFile} selected</span>}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999,
                        }}
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            left: contextMenu.x,
                            top: contextMenu.y,
                            backgroundColor: '#16213e',
                            border: '1px solid #2a2a3e',
                            borderRadius: '6px',
                            padding: '4px',
                            minWidth: '150px',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                    >
                        <button
                            onClick={() => {
                                const item = fileSystem[currentPath === '/' ? `/${contextMenu.item}` : `${currentPath}/${contextMenu.item}`];
                                if (item.type === 'file') {
                                    setPreviewFile(item);
                                }
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Eye size={14} />
                            Open
                        </button>
                        <button
                            onClick={() => {
                                setShowRenameDialog(true);
                                setDialogInput(contextMenu.item);
                                setSelectedFile(contextMenu.item);
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <PencilLine size={14} />
                            Rename
                        </button>
                        <button
                            onClick={() => {
                                deleteItem(contextMenu.item);
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '13px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </>
            )}

            {/* New Folder Dialog */}
            {showNewFolderDialog && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
                    onClick={() => setShowNewFolderDialog(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#16213e',
                            borderRadius: '8px',
                            padding: '24px',
                            minWidth: '300px',
                            border: '1px solid #2a2a3e',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>New Folder</h3>
                        <input
                            type="text"
                            placeholder="Folder name"
                            value={dialogInput}
                            onChange={(e) => setDialogInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createFolder();
                                if (e.key === 'Escape') setShowNewFolderDialog(false);
                            }}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#0f1419',
                                border: '1px solid #2a2a3e',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '13px',
                                outline: 'none',
                                marginBottom: '16px',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowNewFolderDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2a2a3e',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createFolder}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#2a5aff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New File Dialog */}
            {showNewFileDialog && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
                    onClick={() => setShowNewFileDialog(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#16213e',
                            borderRadius: '8px',
                            padding: '24px',
                            minWidth: '300px',
                            border: '1px solid #2a2a3e',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>New File</h3>
                        <input
                            type="text"
                            placeholder="File name (e.g., document.txt)"
                            value={dialogInput}
                            onChange={(e) => setDialogInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createFile();
                                if (e.key === 'Escape') setShowNewFileDialog(false);
                            }}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#0f1419',
                                border: '1px solid #2a2a3e',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '13px',
                                outline: 'none',
                                marginBottom: '16px',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowNewFileDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2a2a3e',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createFile}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#10b981',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Dialog */}
            {showRenameDialog && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
                    onClick={() => setShowRenameDialog(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#16213e',
                            borderRadius: '8px',
                            padding: '24px',
                            minWidth: '300px',
                            border: '1px solid #2a2a3e',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Rename</h3>
                        <input
                            type="text"
                            placeholder="New name"
                            value={dialogInput}
                            onChange={(e) => setDialogInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') renameItem();
                                if (e.key === 'Escape') setShowRenameDialog(false);
                            }}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#0f1419',
                                border: '1px solid #2a2a3e',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '13px',
                                outline: 'none',
                                marginBottom: '16px',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowRenameDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2a2a3e',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={renameItem}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#2a5aff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #2a2a3e',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 10000,
                        minWidth: '180px',
                        padding: '4px',
                        fontSize: '13px',
                    }}
                >
                    {contextMenu.type === 'empty' ? (
                        // Empty space context menu
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenu(null);
                                    setShowNewFolderDialog(true);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Folder size={16} />
                                New Folder
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenu(null);
                                    setShowNewFileDialog(true);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <FileText size={16} />
                                New File
                            </button>
                        </>
                    ) : (
                        // File/folder item context menu
                        <>
                            {contextMenu.type === 'folder' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const item = getCurrentItems().find(i => i.name === contextMenu.item);
                                        if (item) handleFileDoubleClick(item);
                                        setContextMenu(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <Folder size={16} />
                                    Open
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(contextMenu.item);
                                    setDialogInput(contextMenu.item);
                                    setShowRenameDialog(true);
                                    setContextMenu(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <FileText size={16} />
                                Rename
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#2a2a3e', margin: '4px 0' }} />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const confirmed = window.confirm(`Delete "${contextMenu.item}"?`);
                                    if (confirmed) {
                                        deleteItem(contextMenu.item);
                                    }
                                    setContextMenu(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#ff4444',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}