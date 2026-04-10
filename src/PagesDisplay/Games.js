import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelCull from '../rendering/PixelCull';
import RenderGate from '../rendering/RenderGate';
import useMemoryPressure from '../rendering/useMemoryPressure';
import { ArrowLeft, Star, Clock, TrendingUp, Shuffle, Tag, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { useNavigateBack } from '../hooks/useNavigateBack.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import GameCard from '../Components/Games/GameCard.js';
import GameFilters from '../Components/Games/GameFilters.js';
import { storage, session } from '../Components/Storage/clientStorage.js';
import SoftParticleDrift from '../Components/Backgrounds/SoftParticleDrift.js';

const FALLBACK_GAMES = [
  {
    id: 18,
    title: 'Slither.io',
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=225&fit=crop',
    tags: ['arcade', 'io', 'snake'],
    performance: 'low',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/slither-io'
  },
  {
    id: 19,
    title: 'Shell Shockers',
    thumbnail: 'https://images.unsplash.com/photo-1587132117816-8f8b60fa3fdf?w=400&h=225&fit=crop',
    tags: ['shooter', 'fps', 'funny'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '10+ min',
    url: 'https://www.crazygames.com/game/shell-shockers'
  },
  {
    id: 20,
    title: 'Stickman Hook',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=225&fit=crop',
    tags: ['arcade', 'skill', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/stickman-hook'
  },
  {
    id: 21,
    title: 'Geometry Dash',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop',
    tags: ['arcade', 'rhythm', 'skill'],
    performance: 'medium',
    source: 'coolmath',
    playTime: '5-10 min',
    url: 'https://www.coolmathgames.com/0-geometry-dash'
  },
  {
    id: 22,
    title: 'Car Parking Multiplayer',
    thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=225&fit=crop',
    tags: ['simulation', 'car', 'multiplayer'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '15+ min',
    url: 'https://www.crazygames.com/game/car-parking-multiplayer'
  },
  {
    id: 23,
    title: 'Tetris',
    thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=225&fit=crop',
    tags: ['puzzle', 'classic', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '10+ min',
    url: 'https://poki.com/en/g/tetris'
  },
  {
    id: 24,
    title: 'BitLife',
    thumbnail: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=225&fit=crop',
    tags: ['simulation', 'life-sim', 'text-based'],
    performance: 'low',
    source: 'crazygames',
    playTime: '20+ min',
    url: 'https://www.crazygames.com/game/bitlife'
  },
  {
    id: 25,
    title: 'Friday Night Funkin',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop',
    tags: ['rhythm', 'music', 'casual'],
    performance: 'medium',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/friday-night-funkin'
  },
  {
    id: 26,
    title: 'Retro Bowl',
    thumbnail: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=225&fit=crop',
    tags: ['sports', 'football', 'retro'],
    performance: 'low',
    source: 'poki',
    playTime: '15+ min',
    url: 'https://poki.com/en/g/retro-bowl'
  },
  {
    id: 27,
    title: 'Cookie Clicker',
    thumbnail: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=225&fit=crop',
    tags: ['clicker', 'idle', 'casual'],
    performance: 'low',
    source: 'coolmath',
    playTime: '30+ min',
    url: 'https://orteil.dashnet.org/cookieclicker/'
  },
  {
    id: 28,
    title: 'Tunnel Rush',
    thumbnail: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=225&fit=crop',
    tags: ['arcade', '3d', 'skill'],
    performance: 'medium',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/tunnel-rush'
  },
  {
    id: 29,
    title: 'Paper.io 2',
    thumbnail: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=225&fit=crop',
    tags: ['io', 'strategy', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/paper-io-2'
  },
  {
    id: 30,
    title: 'Bottle Flip 3D',
    thumbnail: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=225&fit=crop',
    tags: ['casual', 'skill', '3d'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/bottle-flip-3d'
  },
  {
    id: 31,
    title: 'Crossy Road',
    thumbnail: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=225&fit=crop',
    tags: ['arcade', 'casual', 'endless'],
    performance: 'low',
    source: 'poki',
    playTime: '5-10 min',
    url: 'https://poki.com/en/g/crossy-road'
  },
  {
    id: 32,
    title: 'Rocket League (Sideswipe)',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
    tags: ['sports', 'car', 'soccer'],
    performance: 'high',
    source: 'crazygames',
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/rocket-league-sideswipe'
  },
  {
    id: 33,
    title: 'Flappy Bird',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b07?w=400&h=225&fit=crop',
    tags: ['arcade', 'casual', 'skill'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/flappy-bird'
  },
  {
    id: 34,
    title: 'Duck Life',
    thumbnail: 'https://images.unsplash.com/photo-1535268244629-727c0c2c8c21?w=400&h=225&fit=crop',
    tags: ['adventure', 'training', 'casual'],
    performance: 'low',
    source: 'coolmath',
    playTime: '15+ min',
    url: 'https://www.coolmathgames.com/0-duck-life'
  },
  {
    id: 35,
    title: 'Minecraft Classic',
    thumbnail: 'https://images.unsplash.com/photo-1587408501332-0b70fccf4c15?w=400&h=225&fit=crop',
    tags: ['sandbox', 'creative', '3d'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '30+ min',
    url: 'https://classic.minecraft.net/'
  },
  {
    id: 36,
    title: 'Vex 5',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=225&fit=crop',
    tags: ['platformer', 'skill', 'action'],
    performance: 'low',
    source: 'coolmath',
    playTime: '10+ min',
    url: 'https://www.coolmathgames.com/0-vex-5'
  },
  {
    id: 37,
    title: 'Stick War',
    thumbnail: 'https://images.unsplash.com/photo-1589241062272-c0a000072de8?w=400&h=225&fit=crop',
    tags: ['strategy', 'war', 'stickman'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '20+ min',
    url: 'https://www.crazygames.com/game/stick-war'
  },
  {
    id: 38,
    title: 'Color Switch',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop',
    tags: ['arcade', 'skill', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/color-switch'
  },
  {
    id: 39,
    title: 'Hill Climb Racing',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    tags: ['racing', 'physics', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '10+ min',
    url: 'https://poki.com/en/g/hill-climb-racing'
  },
  {
    id: 40,
    title: 'Brawl Stars',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
    tags: ['action', 'multiplayer', 'battle'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/brawl-stars'
  },
  {
    id: 41,
    title: 'Stumble Guys',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop',
    tags: ['battle-royale', 'multiplayer', 'funny'],
    performance: 'medium',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/stumble-guys'
  },
  {
    id: 42,
    title: 'Subway Clash 3D',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
    tags: ['shooter', 'fps', '3d'],
    performance: 'high',
    source: 'crazygames',
    playTime: '10+ min',
    url: 'https://www.crazygames.com/game/subway-clash-3d'
  },
  {
    id: 43,
    title: 'Soccer Skills',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=225&fit=crop',
    tags: ['sports', 'soccer', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5-10 min',
    url: 'https://poki.com/en/g/soccer-skills-world-cup'
  },
  {
    id: 44,
    title: 'Idle Breakout',
    thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=225&fit=crop',
    tags: ['idle', 'clicker', 'arcade'],
    performance: 'low',
    source: 'coolmath',
    playTime: '30+ min',
    url: 'https://www.coolmathgames.com/0-idle-breakout'
  },
  {
    id: 45,
    title: 'Parking Fury 3D',
    thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=225&fit=crop',
    tags: ['simulation', 'car', '3d'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/parking-fury-3d'
  },
  {
    id: 46,
    title: 'Bubble Shooter',
    thumbnail: 'https://images.unsplash.com/photo-1535268244629-727c0c2c8c21?w=400&h=225&fit=crop',
    tags: ['puzzle', 'casual', 'match-3'],
    performance: 'low',
    source: 'poki',
    playTime: '10+ min',
    url: 'https://poki.com/en/g/bubble-shooter'
  },
  {
    id: 47,
    title: 'Stack',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=225&fit=crop',
    tags: ['arcade', 'skill', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/stack'
  },
  {
    id: 48,
    title: 'Madalin Stunt Cars 2',
    thumbnail: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=225&fit=crop',
    tags: ['racing', 'car', '3d'],
    performance: 'high',
    source: 'crazygames',
    playTime: '15+ min',
    url: 'https://www.crazygames.com/game/madalin-stunt-cars-2'
  },
  {
    id: 49,
    title: 'Run 2',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b07?w=400&h=225&fit=crop',
    tags: ['arcade', '3d', 'endless-runner'],
    performance: 'low',
    source: 'coolmath',
    playTime: '10+ min',
    url: 'https://www.coolmathgames.com/0-run-2'
  },
  {
    id: 50,
    title: 'Pacman',
    thumbnail: 'https://images.unsplash.com/photo-1589241062272-c0a000072de8?w=400&h=225&fit=crop',
    tags: ['arcade', 'classic', 'retro'],
    performance: 'low',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/pacman'
  },
  {
    id: 51,
    title: 'Snake.io',
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=225&fit=crop',
    tags: ['io', 'snake', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5-10 min',
    url: 'https://poki.com/en/g/snake-io'
  },
  {
    id: 52,
    title: 'Basketball Legends',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop',
    tags: ['sports', 'basketball', 'multiplayer'],
    performance: 'medium',
    source: 'crazygames',
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/basketball-legends'
  },
  {
    id: 53,
    title: 'Subway Surfers 2',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
    tags: ['arcade', 'endless-runner', 'action'],
    performance: 'medium',
    source: 'poki',
    playTime: '10+ min',
    url: 'https://poki.com/en/g/subway-surfers-2'
  },
  {
    id: 54,
    title: 'Tank Trouble',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
    tags: ['action', 'multiplayer', 'tank'],
    performance: 'low',
    source: 'crazygames',
    playTime: '5-10 min',
    url: 'https://www.crazygames.com/game/tank-trouble'
  },
  {
    id: 55,
    title: 'Drift Boss',
    thumbnail: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=225&fit=crop',
    tags: ['racing', 'drift', 'skill'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/drift-boss'
  },
  {
    id: 56,
    title: 'Penalty Shooters 2',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=225&fit=crop',
    tags: ['sports', 'soccer', 'casual'],
    performance: 'low',
    source: 'poki',
    playTime: '5 min',
    url: 'https://poki.com/en/g/penalty-shooters-2'
  },
  {
    id: 57,
    title: 'Rolling Sky',
    thumbnail: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=225&fit=crop',
    tags: ['arcade', '3d', 'rhythm'],
    performance: 'medium',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/rolling-sky'
  },
  {
    id: 58,
    title: 'Basketball Stars 2',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop',
    tags: ['sports', 'basketball', 'multiplayer'],
    performance: 'medium',
    source: 'poki',
    playTime: '10 min',
    url: 'https://poki.com/en/g/basketball-stars-2'
  },
  {
    id: 59,
    title: 'Getaway Shootout',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop',
    tags: ['action', 'funny', 'multiplayer'],
    performance: 'low',
    source: 'crazygames',
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/getaway-shootout'
  },
  {
    id: 60,
    title: 'Papa\'s Pizzeria',
    thumbnail: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=225&fit=crop',
    tags: ['simulation', 'cooking', 'casual'],
    performance: 'low',
    source: 'coolmath',
    playTime: '15+ min',
    url: 'https://www.coolmathgames.com/0-papas-pizzeria'
  },
];

export default function Games() {
  const memoryPressure = useMemoryPressure();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [search, setSearch] = useState('');
  const [performance, setPerformance] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameLoadError, setSelectedGameLoadError] = useState('');
  const [selectedGameLoading, setSelectedGameLoading] = useState(false);
  const [selectedGameEmbedWarning, setSelectedGameEmbedWarning] = useState('');
  const gameFrameLoadedRef = useRef(false);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [activeSource, setActiveSource] = useState('all');

  const accentColor = '#ff6b6b';

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      await storage.init();
      const saved = await storage.loadFavorites();
      setFavorites(saved);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const loadSettings = async () => {
    try {
      await storage.init();
      const saved = await storage.loadSettings();
      if (saved) {
        setSettings(saved);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  // State for loaded games
  const [loadedGames, setLoadedGames] = useState(FALLBACK_GAMES);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [canAccessTesting, setCanAccessTesting] = useState(false);

  // Check if user can access testing games
  useEffect(() => {
    const currentCode = session.get();
    if (currentCode) {
      const canAccess = storage.canAccessTestingGames(currentCode);
      setCanAccessTesting(canAccess);
    }
  }, []);

  const loadGames = useCallback(async () => {
      setGamesLoading(true);
      try {
        // Load regular games
        const response = await fetch('/games/games-manifest.json');
        let allGames = [...FALLBACK_GAMES];

        if (response.ok) {
          const data = await response.json();
          if (data.games && Array.isArray(data.games)) {
            // Convert manifest format to component format
            const convertedGames = data.games.map(game => ({
              id: game.id,
              title: game.title,
              thumbnail: game.thumbnail || generateThumbnail(game.title, game.category),
              tags: game.tags || [game.category],
              performance: game.performance || 'low',
              source: game.localPath ? 'local' : 'online',
              playTime: game.playTime || '5-10 min',
              url: game.localPath || game.online, // Prefer local cloned games, fallback to online
              tier: game.tier,
              quality: game.quality,
              testing: false
            }));
            allGames = [...convertedGames, ...FALLBACK_GAMES];
          }
        }

        // Load user-provided local HTML games from /public/games-html-files.
        try {
          const localHtmlResponse = await fetch('/games-html-files-manifest.json');
          if (localHtmlResponse.ok) {
            const localHtmlManifest = await localHtmlResponse.json();
            if (Array.isArray(localHtmlManifest)) {
              const convertedLocalHtmlGames = localHtmlManifest
                .filter(game => typeof game?.url === 'string' && game.url.length > 0)
                .map((game, index) => ({
                  id: Number.isInteger(game.id) ? game.id : `html-${index}`,
                  title: game.title || `Local HTML ${index + 1}`,
                  thumbnail: generateThumbnail(game.title || 'Local HTML Game', game.category || 'local'),
                  tags: [game.category || 'local', 'local-html', 'html'],
                  performance: game.performance || 'medium',
                  source: 'local',
                  playTime: game.playTime || 'varies',
                  url: game.url,
                  testing: false
                }));

              allGames = [...convertedLocalHtmlGames, ...allGames];
            }
          }
        } catch (err) {
          console.log('Local HTML games manifest not available');
        }

        // Load lightweight remote engine ports so we avoid storing full engine payloads in-repo.
        try {
          const enginePortsResponse = await fetch('/engine-ports-manifest.json');
          if (enginePortsResponse.ok) {
            const enginePortsManifest = await enginePortsResponse.json();
            if (Array.isArray(enginePortsManifest)) {
              const convertedEnginePorts = enginePortsManifest
                .filter(engine => typeof engine?.url === 'string' && engine.url.length > 0)
                .map((engine, index) => ({
                  id: engine.id ?? `engine-${index}`,
                  title: engine.title || `Engine Port ${index + 1}`,
                  thumbnail: engine.icon || generateThumbnail(engine.title || 'Engine Port', 'engine'),
                  tags: ['engine', 'html5-port', 'browser-runtime'],
                  performance: engine.performance || 'low',
                  source: 'engine-port',
                  playTime: engine.playTime || 'sandbox',
                  url: engine.url,
                  testing: false,
                  description: engine.description || 'Lightweight browser engine port'
                }));

              allGames = [...convertedEnginePorts, ...allGames];
            }
          }
        } catch (err) {
          console.log('Engine ports manifest not available');
        }

        // Load testing games if user has access
        if (canAccessTesting) {
          try {
            const testingResponse = await fetch('/games/testing-games-manifest.json');
            if (testingResponse.ok) {
              const testingData = await testingResponse.json();
              if (Array.isArray(testingData)) {
                const convertedTestingGames = testingData.map(game => ({
                  id: game.id,
                  title: game.title,
                  thumbnail: generateThumbnail(game.title, game.tags?.[0] || 'testing'),
                  tags: [...(game.tags || []), 'testing'],
                  performance: game.performance || 'medium',
                  source: game.localPath ? 'local' : 'online',
                  playTime: '10+ min',
                  url: game.localPath || game.online,
                  testing: true,
                  rating: game.rating
                }));
                allGames = [...allGames, ...convertedTestingGames];
              }
            }
          } catch (err) {
            console.log('Testing games not available');
          }
        }

        setLoadedGames(allGames);
      } catch (err) {
        console.log('Using fallback games - manifest not loaded');
      } finally {
        setGamesLoading(false);
      }
    }, [canAccessTesting]);

  // Load games from manifest
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    const handleDataRefresh = (event) => {
      const target = event?.detail?.target;
      if (target !== 'games-list') return;
      loadGames();
    };

    window.addEventListener('nexus:refresh-data', handleDataRefresh);
    return () => {
      window.removeEventListener('nexus:refresh-data', handleDataRefresh);
    };
  }, [loadGames]);

  // Helper to generate placeholder thumbnails
  const generateThumbnail = (title, category) => {
    const colors = {
      puzzle: '%23edc850',
      strategy: '%23312e2b',
      arcade: '%2344d62c',
      platformer: '%23ff6b35',
      racing: '%23f7931e',
      shooter: '%23ff1744',
      '3d': '%23000'
    };
    const color = colors[category] || '%23666';
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="${color}" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3E${encodeURIComponent(title)}%3C/text%3E%3C/svg%3E`;
  };

  const allTags = [...new Set(loadedGames.flatMap(g => g.tags))].sort();

  const filteredGames = loadedGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const matchesPerformance = performance === 'all' || game.performance === performance;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => game.tags.includes(tag));
    const matchesSource = activeSource === 'all' || game.source === activeSource;
    const matchesFavorite = activeTab !== 'favorites' || favorites.includes(game.id);
    return matchesSearch && matchesPerformance && matchesTags && matchesSource && matchesFavorite;
  });

  // Pin favorites to top
  const sortedGames = [...filteredGames].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const toggleFavorite = async (game) => {
    const newFavorites = favorites.includes(game.id)
      ? favorites.filter(id => id !== game.id)
      : [...favorites, game.id];

    setFavorites(newFavorites);

    try {
      await storage.saveFavorites(newFavorites);
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const playGame = (game) => {
    gameFrameLoadedRef.current = false;
    setSelectedGameLoadError('');
    setSelectedGameEmbedWarning('');
    setSelectedGameLoading(true);
    setSelectedGame(game);
  };

  useEffect(() => {
    if (!selectedGame) return;

    const timeoutId = setTimeout(() => {
      if (!gameFrameLoadedRef.current) {
        setSelectedGameLoading(false);
        setSelectedGameEmbedWarning('This game is taking longer than expected to render in the embedded player. Some providers block iframe playback. Use Open to launch it directly.');
      }
    }, 9000);

    return () => clearTimeout(timeoutId);
  }, [selectedGame]);

  const clearAllFilters = () => {
    setSearch('');
    setPerformance('all');
    setSelectedTags([]);
    setActiveSource('all');
    setActiveTab('all');
  };

  const hasActiveFilters =
    search.trim().length > 0 ||
    performance !== 'all' ||
    selectedTags.length > 0 ||
    activeSource !== 'all' ||
    activeTab !== 'all';

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        gameFrameLoadedRef.current = false;
        setSelectedGameLoading(false);
        setSelectedGameEmbedWarning('');
        setSelectedGame(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const removeHostMenuUX = (doc) => {
    if (!doc) return;

    const selectors = [
      '#sidebarad1',
      '#sidebarad2',
      '.sidebar-close',
      '.sidebar-frame',
      '#truffled-logo',
      'a[href*="truffled.lol"][target="_blank"]',
      'a[href*="gn-math"][target="_blank"]',
      '.adsbygoogle',
      'ins.adsbygoogle',
      '[id*="google_ads"]',
      '[class*="google-ad"]',
      'iframe[src*="googlesyndication.com"]',
      'script[src*="googlesyndication.com"]'
    ];

    selectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    });
  };

  const unwrapHostEmbed = (doc, iframe) => {
    if (!doc?.body || !iframe) return false;

    try {
      const directIframe = doc.querySelector('body > iframe[src]');
      if (!directIframe) return false;

      const iframeCount = doc.querySelectorAll('iframe[src]').length;
      const hasPlayableSurface = !!doc.querySelector(
        'canvas, #unity-container, #openfl-content, #game, #gameContainer, [id*="game-canvas"]'
      );

      if (iframeCount !== 1 || hasPlayableSurface) return false;

      const nestedSrc = directIframe.getAttribute('src') || '';
      const isHostWrapper = /(truffled\.lol|cdn\.jsdelivr\.net\/gh\/gn-math|gn-math)/i.test(nestedSrc);
      if (!isHostWrapper) return false;

      const resolvedSrc = new URL(nestedSrc, iframe.contentWindow?.location?.href || window.location.href).toString();
      if (!resolvedSrc || resolvedSrc === iframe.src) return false;

      iframe.src = resolvedSrc;
      return true;
    } catch {
      return false;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Games', icon: TrendingUp },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently Played', icon: Clock },
  ];

  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'poki', name: 'Poki' },
    { id: 'crazygames', name: 'CrazyGames' },
    { id: 'coolmath', name: 'Coolmath Games' },
    { id: 'nealfun', name: 'Neal.fun' },
    { id: 'gamejolt', name: 'GameJolt' },
    { id: 'github', name: 'GitHub Games' },
    { id: 'engine-port', name: 'Engine Ports' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SoftParticleDrift accentColor={accentColor} particleCount={40} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <NeonButton variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </NeonButton>
            <div>
              <h1 className="text-3xl font-bold text-white">Games</h1>
              <p className="text-white/50">Browser games from top platforms</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
                  }`}
                style={{
                  borderBottom: activeTab === tab.id ? `2px solid ${accentColor}` : 'none'
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}

            <NeonButton
              variant="ghost"
              className="ml-auto"
              onClick={() => {
                const randomGame = loadedGames[Math.floor(Math.random() * loadedGames.length)];
                playGame(randomGame);
              }}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random Game
            </NeonButton>
          </div>

          {/* Platform Filter Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActiveSource(platform.id)}
                className={`p-4 rounded-xl font-medium text-sm transition-all ${activeSource === platform.id
                  ? 'bg-white/15 text-white border-2'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border-2 border-transparent'
                  }`}
                style={{ borderColor: activeSource === platform.id ? accentColor : 'transparent' }}
              >
                {platform.name}
              </button>
            ))}
          </div>

          {/* Filters */}
          <GameFilters
            search={search}
            setSearch={setSearch}
            performance={performance}
            setPerformance={setPerformance}
            accentColor={accentColor}
          />

          {/* Tag Filters */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/50">Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${selectedTags.includes(tag)
                    ? 'bg-white/20 text-white border-2'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 border-2 border-transparent'
                    }`}
                  style={{ borderColor: selectedTags.includes(tag) ? accentColor : 'transparent' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-white/70">
              Showing <span className="text-white font-semibold">{sortedGames.length}</span> of <span className="text-white font-semibold">{loadedGames.length}</span> games
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.header>

        {gamesLoading && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
            Loading game manifests and building your library...
          </div>
        )}

        {/* Game Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {sortedGames.map((game, index) => (
              <PixelCull key={game.id} placeholderHeight={280}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <GameCard
                    game={game}
                    onPlay={playGame}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.includes(game.id)}
                    accentColor={accentColor}
                  />
                </motion.div>
              </PixelCull>
            ))}
          </AnimatePresence>
        </motion.div>

        {sortedGames.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/50 text-lg">No games found matching your filters</p>
          </motion.div>
        )}

        {/* Game Player Modal */}
        <AnimatePresence>
          {selectedGame && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                gameFrameLoadedRef.current = false;
                setSelectedGameLoading(false);
                setSelectedGameEmbedWarning('');
                setSelectedGame(null);
              }}
            >
              <motion.div
                className="relative w-full h-[90vh] max-w-5xl bg-[#2a2a3e] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-[#2a2a3e] to-transparent p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{selectedGame.title}</h2>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80">{selectedGame.playTime || 'varies'}</span>
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 capitalize">{selectedGame.performance || 'medium'} perf</span>
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 capitalize">{selectedGame.source || 'web'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedGame.url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-3 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        gameFrameLoadedRef.current = false;
                        setSelectedGameLoading(false);
                        setSelectedGameEmbedWarning('');
                        setSelectedGame(null);
                      }}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>

                {/* Game iframe */}
                <RenderGate
                  id={`games-modal-iframe:${selectedGame.id}`}
                  priority="high"
                  budgetCost={memoryPressure.shouldConserve ? 4 : 2}
                  fallback={
                    <div className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center text-white/70 text-sm">
                      Renderer is conserving resources. The game will resume when budget is available.
                    </div>
                  }
                >
                  <iframe
                    src={selectedGame.url}
                    title={selectedGame.title}
                    onLoad={(e) => {
                      gameFrameLoadedRef.current = true;
                      setSelectedGameLoading(false);
                      setSelectedGameEmbedWarning('');

                      try {
                        const iframe = e.currentTarget;
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                        const iframeLocation = iframe.contentWindow?.location;

                        if (!iframeDoc) return;

                        if (unwrapHostEmbed(iframeDoc, iframe)) {
                          return;
                        }

                        removeHostMenuUX(iframeDoc);

                        const isLocalHtmlGame = typeof selectedGame.url === 'string' && selectedGame.url.startsWith('/games-html-files/');
                        const loadedPath = iframeLocation?.pathname || '';
                        const loadedTitle = (iframeDoc.title || '').toLowerCase();
                        const hasReactRoot = !!iframeDoc.getElementById('root');
                        const loadedSiteShell = isLocalHtmlGame && hasReactRoot && (
                          loadedPath === '/' ||
                          loadedPath === '/index.html' ||
                          loadedTitle.includes('nexus')
                        );

                        if (loadedSiteShell) {
                          setSelectedGameLoadError('This game file was not found in public/games-html-files, so the app shell loaded instead.');
                          setSelectedGameLoading(false);
                          iframe.src = 'about:blank';
                        }
                      } catch {
                        // Ignore cross-origin iframe checks.
                      }
                    }}
                    className="w-full h-full border-none"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
                    allow="autoplay; fullscreen; accelerometer; camera; clipboard-read; clipboard-write; encrypted-media; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; speaker; usb; vr; xr-spatial-tracking"
                  />
                </RenderGate>

                {selectedGameLoading && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-6 z-20">
                    <div className="text-center max-w-md">
                      <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <h3 className="text-white text-lg font-semibold mb-1">Loading game...</h3>
                      <p className="text-white/70 text-sm">Please wait while the game initializes.</p>
                    </div>
                  </div>
                )}

                {selectedGameEmbedWarning && !selectedGameLoadError && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xl bg-amber-500/15 border border-amber-400/30 p-3">
                    <p className="text-amber-100 text-sm">{selectedGameEmbedWarning}</p>
                  </div>
                )}

                {selectedGameLoadError && (
                  <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-20">
                    <div className="text-center max-w-2xl">
                      <h3 className="text-white text-lg font-semibold mb-2">Failed to load game file</h3>
                      <p className="text-white/70 text-sm">{selectedGameLoadError}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}