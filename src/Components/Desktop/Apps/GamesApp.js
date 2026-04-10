import React, { useState, useEffect, useRef, createRef } from 'react';
import { Play, Search, Heart, Home, Grid, Zap, Gamepad2, Star, X, Maximize2, Clock, Trophy, Users, ArrowLeft, Filter, ChevronDown, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useWindowManager } from '../WindowManager';
import GameWindow from './GameWindow';

export default function GamesApp() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [gameStats, setGameStats] = useState({});
    const [localGames, setLocalGames] = useState([]);
    const [enginePorts, setEnginePorts] = useState([]);
    const [customGames, setCustomGames] = useState([]);
    const [showCustomGameModal, setShowCustomGameModal] = useState(false);
    const [customGameUrl, setCustomGameUrl] = useState('');
    const [customGameTitle, setCustomGameTitle] = useState('');
    const [currentView, setCurrentView] = useState('library'); // 'library' or 'gameDetails'
    const [selectedGame, setSelectedGame] = useState(null);
    const selectedGameId = selectedGame?.id;
    const hasSelectedGame = selectedGame !== null;
    const hasSelectedGameId = selectedGameId !== undefined && selectedGameId !== null;
    const gameWindowRefs = useRef({});
    const { openWindow, minimizeWindow, restoreWindow } = useWindowManager();

    // Comprehensive game library with custom icons
    const allGames = [
        // Action & Adventure
        { id: 1, title: '2048', url: 'https://play2048.co/', category: 'puzzle', icon: 'https://play2048.co/meta/apple-touch-icon.png', emoji: '🎮', color: '#f59e0b', description: 'Slide numbered tiles on a grid to combine them and create a tile with the number 2048. Simple to learn, hard to master!' },
        { id: 2, title: 'Slither.io', url: 'https://slither.io/', category: 'action', icon: 'https://slither.io/s/favicon.png', emoji: '🐍', color: '#10b981', description: 'Control a snake in a massive multiplayer arena. Eat glowing orbs to grow longer while avoiding other players.' },
        { id: 3, title: 'Agar.io', url: 'https://agar.io/', category: 'action', icon: 'https://agar.io/favicon.ico', emoji: '⚫', color: '#3b82f6', description: 'Become the biggest cell in this addictive multiplayer game. Consume smaller cells and avoid bigger ones to survive.' },
        { id: 4, title: 'Tetris', url: 'https://tetris.com/play-tetris', category: 'puzzle', icon: 'https://tetris.com/favicon.ico', emoji: '🟦', color: '#8b5cf6', description: 'The classic puzzle game where you arrange falling blocks to create and clear horizontal lines.' },
        { id: 5, title: 'Snake', url: 'https://www.google.com/fbx?fbx=snake_arcade', category: 'classic', emoji: '🐍', color: '#06b6d4', description: 'Guide your snake to eat food and grow longer without running into walls or your own tail in this timeless arcade classic.' },
        { id: 6, title: 'Pac-Man', url: 'https://www.google.com/logos/2010/pacman10-i.html', category: 'classic', emoji: '👻', color: '#f59e0b', description: 'Navigate mazes, eat dots, and avoid ghosts in this iconic arcade game that defined a generation.' },
        { id: 7, title: 'Flappy Bird', url: 'https://flappybird.io/', category: 'action', icon: 'https://flappybird.io/favicon.ico', emoji: '🐦', color: '#ec4899', description: 'Tap to make the bird fly between pipes in this notoriously difficult but addictive casual game.' },
        { id: 8, title: 'Dino Game', url: 'https://chromedino.com/', category: 'action', emoji: '🦖', color: '#14b8a6', description: 'Jump over cacti and dodge pterodactyls as Chrome\'s offline dinosaur. How far can you run?' },
        { id: 9, title: 'Chess', url: 'https://www.chess.com/', category: 'strategy', icon: 'https://www.chess.com/bundles/web/favicons/favicon-96x96.png', emoji: '♟️', color: '#64748b', description: 'Master the ultimate strategy game. Play against AI or real players in the world\'s most popular board game.' },
        { id: 10, title: 'Checkers', url: 'https://www.gamesforthebrain.com/game/checkers/', category: 'strategy', emoji: '⚪', color: '#475569', description: 'Classic checkers where you jump over opponent pieces to capture them and reach the opposite side to crown your kings.' },
        { id: 11, title: 'Breakout', url: 'https://www.crazygames.com/game/breakout', category: 'action', emoji: '🟨', color: '#f59e0b', description: 'Bounce a ball with your paddle to break all the bricks in this classic arcade game from the 1970s.' },
        { id: 12, title: 'Pong', url: 'https://pong.com/', category: 'classic', emoji: '🎾', color: '#fbbf24', description: 'The original video game! Hit the ball past your opponent in this two-player table tennis simulation.' },
        { id: 13, title: 'Space Invaders', url: 'https://www.crazygames.com/game/space-invaders', category: 'action', emoji: '👾', color: '#a78bfa', description: 'Defend Earth from descending alien invaders in this legendary 1978 arcade shooter that started it all.' },
        { id: 14, title: 'Asteroids', url: 'https://www.crazygames.com/game/asteroids', category: 'action', emoji: '⭐', color: '#06b6d4', description: 'Pilot your spaceship through an asteroid field, blasting rocks and UFOs while managing momentum in zero gravity.' },
        { id: 15, title: 'Hangman', url: 'https://www.hangmanwords.com/', category: 'puzzle', emoji: '🎯', color: '#f87171', description: 'Guess the hidden word one letter at a time before the stick figure is complete in this classic word game.' },
        { id: 16, title: 'Minesweeper', url: 'https://www.crazygames.com/game/minesweeper', category: 'puzzle', emoji: '💣', color: '#ef4444', description: 'Use logic to reveal all safe squares while avoiding hidden mines. Numbers show how many mines are adjacent.' },
        { id: 17, title: 'Wordle', url: 'https://www.nytimes.com/games/wordle/index.html', category: 'puzzle', icon: 'https://www.nytimes.com/games-assets/v2/metadata/wordle-icon.png', emoji: '🔤', color: '#10b981', description: 'Guess the five-letter word in six tries. Each guess reveals which letters are in the word and correctly placed.' },
        { id: 18, title: 'Sudoku', url: 'https://sudoku.com/', category: 'puzzle', icon: 'https://sudoku.com/favicon.ico', emoji: '🔢', color: '#3b82f6', description: 'Fill a 9x9 grid so each row, column, and 3x3 box contains digits 1-9 exactly once in this number placement puzzle.' },
        { id: 19, title: 'Solitaire', url: 'https://www.solitaireturkiye.net/', category: 'strategy', emoji: '🂡', color: '#8b5cf6', description: 'The classic card game where you build stacks by suit from Ace to King. Perfect for relaxing or passing time.' },
        { id: 20, title: 'Memory', url: 'https://www.crazygames.com/game/memory', category: 'puzzle', emoji: '🧠', color: '#a78bfa', description: 'Flip cards to find matching pairs in this memory training game. Test your recall skills and improve concentration.' },
    ];

    // Load user-provided local HTML games manifest from /public.
    useEffect(() => {
        let isMounted = true;

        const loadLocalGames = async () => {
            try {
                const response = await fetch('/games-html-files-manifest.json');
                if (!response.ok) return;

                const manifest = await response.json();
                if (!Array.isArray(manifest)) return;

                // Load icon configuration
                let iconConfig = {};
                try {
                    const iconResponse = await fetch('/game-icons-config.json');
                    if (iconResponse.ok) {
                        iconConfig = await iconResponse.json();
                    }
                } catch (err) {
                    console.log('No icon config found, using defaults');
                }

                const mappedLocalGames = manifest.map((game, index) => {
                    // Try to find icon by exact title match or partial match
                    let iconUrl = null;
                    for (const [key, url] of Object.entries(iconConfig)) {
                        if (game.title.includes(key) || key.includes(game.title.split(' ')[0])) {
                            iconUrl = url;
                            break;
                        }
                    }

                    return {
                        id: Number.isInteger(game.id) ? game.id : 1000 + index,
                        title: game.title || `Local Game ${index + 1}`,
                        url: game.url,
                        category: game.category || 'local',
                        emoji: game.emoji || '🎮',
                        color: game.color || '#475569',
                        icon: iconUrl,
                        description: game.description || null,
                    };
                }).filter(game => typeof game.url === 'string' && game.url.length > 0);

                if (isMounted) {
                    setLocalGames(mappedLocalGames);
                }
            } catch (error) {
                console.warn('Failed to load local HTML games manifest:', error);
            }
        };

        loadLocalGames();

        return () => {
            isMounted = false;
        };
    }, []);

    // Load lightweight remote engine ports manifest.
    useEffect(() => {
        let isMounted = true;

        const loadEnginePorts = async () => {
            try {
                const response = await fetch('/engine-ports-manifest.json');
                if (!response.ok) return;

                const manifest = await response.json();
                if (!Array.isArray(manifest)) return;

                const mappedPorts = manifest
                    .filter(entry => typeof entry?.url === 'string' && entry.url.length > 0)
                    .map((entry, index) => ({
                        id: entry.id ?? `engine-port-${index}`,
                        title: entry.title || `Engine Port ${index + 1}`,
                        url: entry.url,
                        category: 'engine',
                        emoji: entry.emoji || '⚙️',
                        color: entry.color || '#2563eb',
                        icon: entry.icon || null,
                        description: entry.description || 'Browser-hosted engine port',
                        source: entry.source || 'engine-port',
                    }));

                if (isMounted) {
                    setEnginePorts(mappedPorts);
                }
            } catch (error) {
                console.warn('Failed to load engine ports manifest:', error);
            }
        };

        loadEnginePorts();

        return () => {
            isMounted = false;
        };
    }, []);

    // Load custom games from localStorage
    useEffect(() => {
        const savedCustomGames = localStorage.getItem('nexus_custom_games');
        if (savedCustomGames) {
            try {
                setCustomGames(JSON.parse(savedCustomGames));
            } catch (e) {
                console.error('Failed to load custom games:', e);
            }
        }
    }, []);

    const gameLibrary = [...customGames, ...enginePorts, ...localGames, ...allGames];

    // Load game stats from localStorage on mount
    useEffect(() => {
        const savedStats = localStorage.getItem('nexus_game_stats');
        if (savedStats) {
            try {
                setGameStats(JSON.parse(savedStats));
            } catch (e) {
                console.error('Failed to load game stats:', e);
            }
        }
    }, []);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showFilterMenu && !e.target.closest('button')) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showFilterMenu]);

    const startGame = (gameId) => {
        const game = gameLibrary.find(g => g && g.id === gameId);
        if (!game) return;

        // Track game stats on launch
        setGameStats(prev => {
            const currentStats = prev[gameId] || { totalMinutes: 0, lastPlayed: null, playCount: 0 };
            const updated = {
                ...prev,
                [gameId]: {
                    ...currentStats,
                    lastPlayed: new Date().toISOString(),
                    playCount: currentStats.playCount + 1
                }
            };
            localStorage.setItem('nexus_game_stats', JSON.stringify(updated));
            return updated;
        });

        // Create ref for this game window
        const gameRef = createRef();
        gameWindowRefs.current[`game_${gameId}`] = gameRef;

        // Create fullscreen button
        const fullscreenButton = (
            <button
                onClick={() => {
                    gameRef.current?.toggleFullscreen();
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
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                }}
            >
                <Maximize2 size={14} />
                Toggle FS
            </button>
        );

        // Minimize Hydrux (Games) while dedicated game window is open.
        minimizeWindow('games');

        // Open game in a new draggable window
        openWindow({
            id: `game_${gameId}`,
            title: game.title,
            icon: game.emoji || '🎮',
            component: <GameWindow ref={gameRef} game={game} />,
            customControls: fullscreenButton,
            renderPriority: 'high',
            renderBudgetCost: 3,
            width: 1024,
            height: 768,
            x: 100 + (Math.random() * 100),
            y: 50 + (Math.random() * 50),
            minWidth: 640,
            minHeight: 480,
            onClose: () => {
                // Restore Hydrux (Games) when game closes.
                restoreWindow('games');
                // Clean up ref
                delete gameWindowRefs.current[`game_${gameId}`];
            }
        });
    };

    const categories = [
        { id: 'all', label: 'All Games', icon: Grid },
        { id: 'action', label: 'Action', icon: Gamepad2 },
        { id: 'puzzle', label: 'Puzzle', icon: Zap },
        { id: 'strategy', label: 'Strategy', icon: Star },
        { id: 'classic', label: 'Classics', icon: Star },
        { id: 'engine', label: 'Engine Ports', icon: Zap },
        { id: 'local', label: 'Local HTML', icon: Grid },
        { id: 'custom', label: 'Custom URLs', icon: LinkIcon },
    ];

    // Add custom game
    const addCustomGame = () => {
        if (!customGameUrl.trim()) return;

        const newGame = {
            id: Date.now(), // Unique ID based on timestamp
            title: customGameTitle.trim() || 'Custom Game',
            url: customGameUrl.trim(),
            category: 'custom',
            emoji: '🌐',
            color: '#6366f1',
            description: 'Custom game added by user',
            isCustom: true,
        };

        const updatedGames = [...customGames, newGame];
        setCustomGames(updatedGames);
        localStorage.setItem('nexus_custom_games', JSON.stringify(updatedGames));

        // Reset form
        setCustomGameUrl('');
        setCustomGameTitle('');
        setShowCustomGameModal(false);
    };

    // Remove custom game
    const removeCustomGame = (gameId) => {
        const updatedGames = customGames.filter(g => g.id !== gameId);
        setCustomGames(updatedGames);
        localStorage.setItem('nexus_custom_games', JSON.stringify(updatedGames));
    };

    const filteredGames = gameLibrary.filter(game => {
        if (!game) return false; // Skip null/undefined games
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort games: favorites first, then the rest
    const favoriteGames = filteredGames.filter(g => favorites.has(g.id));
    const regularGames = filteredGames.filter(g => !favorites.has(g.id));
    const sortedGames = [...favoriteGames, ...regularGames];

    const toggleFavorite = (gameId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(gameId)) {
            newFavorites.delete(gameId);
        } else {
            newFavorites.add(gameId);
        }
        setFavorites(newFavorites);
    };

    const formatPlayTime = (gameId) => {
        const stats = gameStats[gameId];
        if (!stats || stats.totalMinutes === 0) return 'Not played';

        const hours = Math.floor(stats.totalMinutes / 60);
        const minutes = stats.totalMinutes % 60;

        if (hours === 0) return `${minutes} mins`;
        if (minutes === 0) return `${hours} hrs`;
        return `${hours}h ${minutes}m`;
    };

    const handleGameClick = (game) => {
        setSelectedGame(game);
        setCurrentView('gameDetails');
    };

    const handleBackToLibrary = () => {
        setCurrentView('library');
        setSelectedGame(null);
    };

    const handleDoubleClickGame = (game) => {
        startGame(game.id);
    };

    // Game library view
    return (
        <>
            <div style={{
                display: 'flex',
                height: '100%',
                backgroundColor: '#1b2838',
                color: '#fff',
            }}>
                {/* Sidebar - Game List */}
                <div style={{
                    width: '240px',
                    backgroundColor: '#171d25',
                    borderRight: '1px solid #2a3f5f',
                    overflowY: 'auto',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{ padding: '16px', marginBottom: '8px', borderBottom: '1px solid #2a3f5f' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>HYDRUX</div>
                        <div style={{ fontSize: '12px', color: '#8f98a0', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Library</div>
                    </div>

                    {/* Game List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {/* Favorites Section */}
                        {favoriteGames.length > 0 && (
                            <>
                                <div style={{
                                    padding: '12px 16px 8px 16px',
                                    fontSize: '11px',
                                    color: '#8f98a0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    <Heart size={12} fill="#ff6b9d" color="#ff6b9d" />
                                    Favorites
                                </div>
                                {favoriteGames.map(game => (
                                    <div
                                        key={`fav_${game.id}`}
                                        onClick={() => handleGameClick(game)}
                                        onDoubleClick={() => handleDoubleClickGame(game)}
                                        style={{
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: '#c7d5e0',
                                            fontSize: '12px',
                                            transition: 'background-color 0.15s',
                                            backgroundColor: selectedGame?.id === game.id ? '#3d5a80' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedGame?.id !== game.id) {
                                                e.currentTarget.style.backgroundColor = '#223345';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGame?.id !== game.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '3px',
                                            backgroundColor: game.icon ? '#000' : game.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '14px',
                                            overflow: 'hidden',
                                        }}>
                                            {game.icon ? (
                                                <img
                                                    src={game.icon}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.textContent = game.emoji;
                                                    }}
                                                />
                                            ) : (
                                                game.emoji
                                            )}
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 500,
                                        }}>
                                            {game.title}
                                        </div>
                                    </div>
                                ))}

                                {/* Separator */}
                                <div style={{
                                    margin: '12px 16px',
                                    height: '1px',
                                    backgroundColor: '#2a3f5f',
                                }}></div>
                            </>
                        )}

                        {/* Regular Games Section */}
                        {regularGames.length > 0 && (
                            <>
                                <div style={{
                                    padding: '12px 16px 8px 16px',
                                    fontSize: '11px',
                                    color: '#8f98a0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600,
                                }}>
                                    All Games
                                </div>
                                {regularGames.map(game => (
                                    <div
                                        key={`game_${game.id}`}
                                        onClick={() => handleGameClick(game)}
                                        onDoubleClick={() => handleDoubleClickGame(game)}
                                        style={{
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: '#c7d5e0',
                                            fontSize: '12px',
                                            transition: 'background-color 0.15s',
                                            backgroundColor: selectedGame?.id === game.id ? '#3d5a80' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedGame?.id !== game.id) {
                                                e.currentTarget.style.backgroundColor = '#223345';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGame?.id !== game.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '3px',
                                            backgroundColor: game.icon ? '#000' : game.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '14px',
                                            overflow: 'hidden',
                                        }}>
                                            {game.icon ? (
                                                <img
                                                    src={game.icon}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.textContent = game.emoji;
                                                    }}
                                                />
                                            ) : (
                                                game.emoji
                                            )}
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 400,
                                        }}>
                                            {game.title}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {sortedGames.length === 0 && (
                            <div style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                color: '#8f98a0',
                                fontSize: '12px',
                            }}>
                                No games found
                            </div>
                        )}
                    </div>
                </div>

                {currentView === 'library' ? (
                    // LIBRARY GRID VIEW
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        backgroundColor: '#1b2838',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            backgroundColor: '#171d25',
                            borderBottom: '1px solid #2a3f5f',
                        }}>
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 400, color: '#fff', letterSpacing: '0.5px' }}>
                                        Library
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8f98a0', marginTop: '6px' }}>
                                        {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Add Custom Game Button */}
                                    <button
                                        onClick={() => setShowCustomGameModal(true)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#2a475e',
                                            border: '1px solid #3d5a80',
                                            borderRadius: '3px',
                                            color: '#c7d5e0',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#3d5a80';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#2a475e';
                                        }}
                                    >
                                        <Plus size={14} />
                                        Add Custom URL
                                    </button>

                                    {/* Filter Button */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#2a475e',
                                                border: '1px solid #3d5a80',
                                                borderRadius: '3px',
                                                color: '#c7d5e0',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#3d5a80';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#2a475e';
                                            }}
                                        >
                                            <Filter size={14} />
                                            {categories.find(c => c.id === selectedCategory)?.label || 'All Games'}
                                            <ChevronDown size={14} />
                                        </button>

                                        {/* Filter Dropdown */}
                                        {showFilterMenu && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '4px',
                                                backgroundColor: '#2a475e',
                                                border: '1px solid #3d5a80',
                                                borderRadius: '3px',
                                                minWidth: '180px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                zIndex: 1000,
                                            }}>
                                                {categories.map(cat => {
                                                    if (!cat || !cat.icon) return null;
                                                    const Icon = cat.icon;
                                                    const isActive = selectedCategory === cat.id;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                setSelectedCategory(cat.id);
                                                                setShowFilterMenu(false);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 16px',
                                                                backgroundColor: isActive ? '#3d5a80' : 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                color: isActive ? '#fff' : '#c7d5e0',
                                                                fontSize: '13px',
                                                                fontWeight: isActive ? 600 : 400,
                                                                transition: 'background-color 0.15s',
                                                                textAlign: 'left',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isActive) {
                                                                    e.currentTarget.style.backgroundColor = '#223345';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isActive) {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            <Icon size={14} />
                                                            {cat.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div style={{ maxWidth: '350px', position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8f98a0' }} />
                                    <input
                                        type="text"
                                        placeholder="Search games..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 38px',
                                            backgroundColor: '#232d3f',
                                            border: '1px solid #3d5a80',
                                            borderRadius: '3px',
                                            color: '#fff',
                                            fontSize: '13px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Games Grid */}
                            <div style={{
                                padding: '20px',
                                overflowY: 'auto',
                                flex: 1,
                            }}>
                                {filteredGames.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '200px',
                                        color: '#8f98a0',
                                        fontSize: '14px',
                                    }}>
                                        No games found
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(184px, 1fr))',
                                        gap: '12px',
                                    }}>
                                        {filteredGames.map(game => (
                                            <div
                                                key={game.id}
                                                onClick={() => handleGameClick(game)}
                                                style={{
                                                    position: 'relative',
                                                    backgroundColor: '#000',
                                                    borderRadius: '0px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {/* Game Cover Image */}
                                                <div style={{
                                                    width: '100%',
                                                    paddingBottom: '62.5%',
                                                    backgroundColor: game.icon ? '#1a1a1a' : game.color,
                                                    background: game.icon ? '#1a1a1a' : `linear-gradient(135deg, ${game.color}dd 0%, ${game.color}aa 100%)`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}>
                                                    {game.icon ? (
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '16px',
                                                        }}>
                                                            <img
                                                                src={game.icon}
                                                                alt={game.title}
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    maxHeight: '100%',
                                                                    objectFit: 'contain',
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const fallback = document.createElement('div');
                                                                    fallback.style.fontSize = '48px';
                                                                    fallback.textContent = game.emoji;
                                                                    e.target.parentElement.appendChild(fallback);
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '48px',
                                                        }}>
                                                            {game.emoji}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Game Info Overlay on Hover */}
                                                <div className="game-info-overlay" style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    padding: '12px',
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                                                        {game.title}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#acb2b8', marginBottom: '8px' }}>
                                                        {formatPlayTime(game.id)}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(game.id);
                                                        }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid #acb2b8',
                                                            borderRadius: '2px',
                                                            color: favorites.has(game.id) ? '#ff6b9d' : '#acb2b8',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        <Heart size={12} fill={favorites.has(game.id) ? '#ff6b9d' : 'none'} />
                                                        {favorites.has(game.id) ? 'Unfavorite' : 'Favorite'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        ) :
                        hasSelectedGame ? (
                        // GAME DETAILS VIEW
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            backgroundColor: '#1b2838',
                        }}>
                            {/* Hero Section */}
                            <div style={{
                                position: 'relative',
                                height: '350px',
                                background: selectedGame && selectedGame.icon
                                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(27,40,56,1) 100%), url(${selectedGame.icon}) center/cover`
                                    : selectedGame ? `linear-gradient(135deg, ${selectedGame.color}dd 0%, ${selectedGame.color}66 100%)` : '#1b2838',
                                display: 'flex',
                                alignItems: 'flex-end',
                            }}>
                                <div style={{ padding: '32px', width: '100%' }}>
                                    {/* Back Button */}
                                    <button
                                        onClick={handleBackToLibrary}
                                        style={{
                                            position: 'absolute',
                                            top: '20px',
                                            left: '20px',
                                            padding: '8px 16px',
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            border: 'none',
                                            borderRadius: '3px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
                                        }}
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Library
                                    </button>

                                    <div style={{ fontSize: '42px', fontWeight: 300, color: '#fff', letterSpacing: '1px', marginBottom: '16px' }}>
                                        {selectedGame?.title || 'Game'}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => hasSelectedGameId && startGame(selectedGameId)}
                                            style={{
                                                padding: '12px 32px',
                                                backgroundColor: '#5c7e10',
                                                border: 'none',
                                                borderRadius: '3px',
                                                color: '#d2efa9',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#6a9413';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#5c7e10';
                                            }}
                                        >
                                            <Play size={16} fill="#d2efa9" />
                                            Play Now
                                        </button>

                                        <button
                                            onClick={() => hasSelectedGameId && toggleFavorite(selectedGameId)}
                                            style={{
                                                padding: '12px 20px',
                                                backgroundColor: 'rgba(0,0,0,0.4)',
                                                border: '1px solid #4e697d',
                                                borderRadius: '3px',
                                                color: hasSelectedGameId && favorites.has(selectedGameId) ? '#ff6b9d' : '#c7d5e0',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '13px',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
                                            }}
                                        >
                                            <Heart size={16} fill={hasSelectedGameId && favorites.has(selectedGameId) ? '#ff6b9d' : 'none'} />
                                            {hasSelectedGameId && favorites.has(selectedGameId) ? 'In Favorites' : 'Add to Favorites'}
                                        </button>

                                        {/* Delete Custom Game Button */}
                                        {selectedGame?.isCustom && (
                                            <button
                                                onClick={() => {
                                                    if (selectedGame?.title && confirm(`Remove "${selectedGame.title}" from your library?`)) {
                                                        hasSelectedGameId && removeCustomGame(selectedGameId);
                                                        handleBackToLibrary();
                                                    }
                                                }}
                                                style={{
                                                    padding: '12px 20px',
                                                    backgroundColor: 'rgba(200,0,0,0.2)',
                                                    border: '1px solid rgba(200,0,0,0.4)',
                                                    borderRadius: '3px',
                                                    color: '#ff6b6b',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(200,0,0,0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(200,0,0,0.2)';
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Game Stats & Info */}
                            <div style={{ padding: '32px', display: 'flex', gap: '32px' }}>
                                {/* Stats Column */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#2a475e',
                                            borderRadius: '3px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#66c0f4', marginBottom: '8px' }}>
                                                <Clock size={16} />
                                                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Play Time</span>
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 400, color: '#fff' }}>
                                                {formatPlayTime(hasSelectedGameId ? selectedGameId : '')}
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#2a475e',
                                            borderRadius: '3px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffd700', marginBottom: '8px' }}>
                                                <Trophy size={16} />
                                                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Sessions</span>
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 400, color: '#fff' }}>
                                                {hasSelectedGameId ? (gameStats[selectedGameId]?.playCount || 0) : 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Game Description */}
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            About This Game
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#c7d5e0', lineHeight: '1.6' }}>
                                            <p style={{ marginBottom: '12px' }}>
                                                {selectedGame?.description || `${selectedGame?.title || 'Game'} is available to play directly in your browser.${selectedGame?.category === 'local' ? ' This is a locally hosted HTML game.' : ' Enjoy this classic game instantly!'}`}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: '#3d5a80',
                                                    borderRadius: '3px',
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {selectedGame?.category || 'Game'}
                                                </span>
                                                {hasSelectedGameId && gameStats[selectedGameId]?.lastPlayed && (
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        backgroundColor: '#3d5a80',
                                                        borderRadius: '3px',
                                                        fontSize: '11px',
                                                    }}>
                                                        Last played: {new Date(gameStats[selectedGameId].lastPlayed).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Could add achievements, activity, etc. */}
                                <div style={{ width: '280px' }}>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#2a475e',
                                        borderRadius: '3px',
                                        marginBottom: '16px',
                                    }}>
                                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                                            Quick Actions
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#c7d5e0', lineHeight: '1.8' }}>
                                            • Click Play to launch game<br />
                                            • Game opens in new window<br />
                                            • Use fullscreen for best experience<br />
                                            • Hydrux auto-minimizes on launch
                                        </div>
                                    </div>

                                    {hasSelectedGameId && favorites.has(selectedGameId) && (
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: 'rgba(255, 107, 157, 0.1)',
                                            border: '1px solid rgba(255, 107, 157, 0.3)',
                                            borderRadius: '3px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b9d', marginBottom: '8px' }}>
                                                <Heart size={14} fill="#ff6b9d" />
                                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Favorite</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#c7d5e0' }}>
                                                Double-click in sidebar to quick launch
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null

                }

            </div>

            <style>{`
                .game-info-overlay {
                    pointer-events: none;
                }
                .game-info-overlay button {
                    pointer-events: all;
                }
                div:hover > .game-info-overlay {
                    opacity: 1 !important;
                }
                
                /* Custom scrollbar */
                div::-webkit-scrollbar {
                    width: 10px;
                }
                div::-webkit-scrollbar-track {
                    background: #171d25;
                }
                div::-webkit-scrollbar-thumb {
                    background: #3d5a80;
                    border-radius: 5px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #4e697d;
                }
            `}</style>

            {/* Custom Game Modal */}
            {showCustomGameModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                }}
                    onClick={() => setShowCustomGameModal(false)}
                >
                    <div style={{
                        backgroundColor: '#1b2838',
                        borderRadius: '8px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        border: '1px solid #3d5a80',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                Add Custom Game URL
                            </h2>
                            <button
                                onClick={() => setShowCustomGameModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#8f98a0',
                                    cursor: 'pointer',
                                    padding: '4px',
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#c7d5e0', marginBottom: '8px', fontWeight: 500 }}>
                                Game Title (optional)
                            </label>
                            <input
                                type="text"
                                value={customGameTitle}
                                onChange={(e) => setCustomGameTitle(e.target.value)}
                                placeholder="My Awesome Game"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    backgroundColor: '#232d3f',
                                    border: '1px solid #3d5a80',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#5a82b3'}
                                onBlur={(e) => e.target.style.borderColor = '#3d5a80'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#c7d5e0', marginBottom: '8px', fontWeight: 500 }}>
                                Game URL *
                            </label>
                            <input
                                type="url"
                                value={customGameUrl}
                                onChange={(e) => setCustomGameUrl(e.target.value)}
                                placeholder="https://example.com/game.html"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    backgroundColor: '#232d3f',
                                    border: '1px solid #3d5a80',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#5a82b3'}
                                onBlur={(e) => e.target.style.borderColor = '#3d5a80'}
                            />
                            <div style={{ fontSize: '12px', color: '#8f98a0', marginTop: '8px' }}>
                                Enter any URL to a game or website. It will open in an iframe.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCustomGameModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2a475e',
                                    border: '1px solid #3d5a80',
                                    borderRadius: '4px',
                                    color: '#c7d5e0',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCustomGame}
                                disabled={!customGameUrl.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: customGameUrl.trim() ? '#2563eb' : '#3d5a80',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: customGameUrl.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    opacity: customGameUrl.trim() ? 1 : 0.5,
                                }}
                            >
                                Add Game
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
