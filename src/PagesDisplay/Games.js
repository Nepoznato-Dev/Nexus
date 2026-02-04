import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, TrendingUp, Shuffle, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { useNavigateBack } from '../hooks/useNavigateBack.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import GameCard from '../Components/Games/GameCard.js';
import GameFilters from '../Components/Games/GameFilters.js';
import { storage, session } from '../Components/Storage/clientStorage.js';
import SoftParticleDrift from '../Components/Backgrounds/SoftParticleDrift.js';

// Fallback games in case manifest doesn't load
const FALLBACK_GAMES = [
  { 
    id: 1, 
    title: '2048', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23edc850" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="72" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3E2048%3C/text%3E%3C/svg%3E', 
    tags: ['puzzle', 'casual', 'math'], 
    performance: 'low', 
    source: 'playable', 
    playTime: '5-10 min',
    url: 'https://play2048.co/'
  },
  { 
    id: 2, 
    title: 'Tetris', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23000" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%2300ffff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3ETETRIS%3C/text%3E%3C/svg%3E', 
    tags: ['puzzle', 'classic', 'arcade'], 
    performance: 'low', 
    source: 'playable', 
    playTime: '10+ min',
    url: 'https://tetris.com/play-tetris'
  },
  { 
    id: 3, 
    title: 'Snake', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%2344d62c" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3ESNAKE%3C/text%3E%3C/svg%3E', 
    tags: ['arcade', 'classic', 'skill'], 
    performance: 'low', 
    source: 'playable', 
    playTime: '5 min',
    url: 'https://playsnake.org/'
  },
  { 
    id: 4, 
    title: 'Chess', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23312e2b" width="400" height="225"/%3E%3Cg transform="translate(150,60)"%3E%3Crect fill="%23fff" width="25" height="25"/%3E%3Crect fill="%23312e2b" x="25" width="25" height="25"/%3E%3Crect fill="%23312e2b" y="25" width="25" height="25"/%3E%3Crect fill="%23fff" x="25" y="25" width="25" height="25"/%3E%3C/g%3E%3Ctext x="50%25" y="75%25" font-size="42" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3EChess%3C/text%3E%3C/svg%3E', 
    tags: ['strategy', 'board', 'multiplayer'], 
    performance: 'low', 
    source: 'playable', 
    playTime: '15+ min',
    url: 'https://www.chess.com/play/computer'
  },
  { 
    id: 5, 
    title: 'Moto X3M', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Cdefs%3E%3ClinearGradient id="m" x1="0" y1="0" x2="1" y2="0"%3E%3Cstop offset="0%25" stop-color="%23ff6b35"/%3E%3Cstop offset="100%25" stop-color="%23f7931e"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23m)" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="42" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3EMoto X3M%3C/text%3E%3C/svg%3E', 
    tags: ['racing', 'bike', 'stunts'], 
    performance: 'medium', 
    source: 'crazygames', 
    playTime: '5-10 min',
    url: 'https://www.crazygames.com/game/moto-x3m'
  },
  { 
    id: 6, 
    title: 'Basketball Stars', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ff6347" width="400" height="225"/%3E%3Ccircle cx="200" cy="112" r="40" fill="%23ff8c42" stroke="%23000" stroke-width="3"/%3E%3Ctext x="50%25" y="80%25" font-size="36" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3EBasketball%3C/text%3E%3C/svg%3E', 
    tags: ['sports', 'basketball', 'multiplayer'], 
    performance: 'medium', 
    source: 'poki', 
    playTime: '10 min',
    url: 'https://poki.com/en/g/basketball-stars'
  },
  { 
    id: 7, 
    title: 'Fireboy and Watergirl', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Cdefs%3E%3ClinearGradient id="fw" x1="0" y1="0" x2="1" y2="0"%3E%3Cstop offset="0%25" stop-color="%23ff4444"/%3E%3Cstop offset="100%25" stop-color="%234444ff"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23fw)" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="32" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3EFireboy %26 Watergirl%3C/text%3E%3C/svg%3E', 
    tags: ['adventure', 'puzzle', 'co-op'], 
    performance: 'low', 
    source: 'coolmath', 
    playTime: '15+ min',
    url: 'https://www.coolmathgames.com/0-fireboy-and-watergirl'
  },
  { 
    id: 8, 
    title: 'Temple Run', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23228b22" width="400" height="225"/%3E%3Crect x="150" y="60" width="100" height="120" fill="%23d4a574"/%3E%3Ctext x="50%25" y="85%25" font-size="36" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3ETemple Run%3C/text%3E%3C/svg%3E', 
    tags: ['action', 'endless-runner', '3d'], 
    performance: 'high', 
    source: 'crazygames', 
    playTime: '5 min',
    url: 'https://www.crazygames.com/game/temple-run-2'
  },
  { 
    id: 9, 
    title: 'Cut the Rope', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%2344d62c" width="400" height="225"/%3E%3Ccircle cx="200" cy="100" r="35" fill="%2376d672"/%3E%3Ccircle cx="190" cy="95" r="8" fill="%23000"/%3E%3Ccircle cx="210" cy="95" r="8" fill="%23000"/%3E%3Ctext x="50%25" y="80%25" font-size="32" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3ECut the Rope%3C/text%3E%3C/svg%3E', 
    tags: ['puzzle', 'casual', 'physics'], 
    performance: 'low', 
    source: 'poki', 
    playTime: '5 min',
    url: 'https://poki.com/en/g/cut-the-rope'
  },
  { 
    id: 10, 
    title: 'Happy Wheels', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ff1744" width="400" height="225"/%3E%3Ccircle cx="160" cy="140" r="30" fill="%23333"/%3E%3Ccircle cx="240" cy="140" r="30" fill="%23333"/%3E%3Ctext x="50%25" y="40%25" font-size="36" fill="%23fff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3EHappy Wheels%3C/text%3E%3C/svg%3E', 
    tags: ['action', 'physics', 'funny'], 
    performance: 'medium', 
    source: 'crazygames', 
    playTime: '10 min',
    url: 'https://www.crazygames.com/game/happy-wheels'
  },
  { 
    id: 11, 
    title: 'Run 3', 
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23000" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" font-size="72" fill="%2300ffff" text-anchor="middle" dy=".3em" font-family="Arial,sans-serif" font-weight="bold"%3ERUN 3%3C/text%3E%3C/svg%3E', 
    tags: ['arcade', '3d', 'endless-runner'], 
    performance: 'low', 
    source: 'coolmath', 
    playTime: '10+ min',
    url: 'https://www.coolmathgames.com/0-run-3'
  },
  { 
    id: 12, 
    title: 'Drift Hunters', 
    thumbnail: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=225&fit=crop', 
    tags: ['racing', 'car', '3d'], 
    performance: 'high', 
    source: 'crazygames', 
    playTime: '15+ min',
    url: 'https://www.crazygames.com/game/drift-hunters'
  },
  { 
    id: 13, 
    title: '1v1.LOL', 
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', 
    tags: ['shooter', 'multiplayer', 'battle'], 
    performance: 'high', 
    source: 'poki', 
    playTime: '10+ min',
    url: 'https://poki.com/en/g/1v1-lol'
  },
  { 
    id: 14, 
    title: 'Krunker.io', 
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop', 
    tags: ['shooter', 'multiplayer', 'fps'], 
    performance: 'high', 
    source: 'crazygames', 
    playTime: '15+ min',
    url: 'https://www.crazygames.com/game/krunker-io'
  },
  { 
    id: 15, 
    title: 'Bloons TD 6', 
    thumbnail: 'https://images.unsplash.com/photo-1534982841079-afde227ada8f?w=400&h=225&fit=crop', 
    tags: ['strategy', 'tower-defense', 'casual'], 
    performance: 'medium', 
    source: 'poki', 
    playTime: '20+ min',
    url: 'https://poki.com/en/g/bloons-tower-defense'
  },
  { 
    id: 16, 
    title: 'Among Us', 
    thumbnail: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=225&fit=crop', 
    tags: ['multiplayer', 'social', 'mystery'], 
    performance: 'low', 
    source: 'crazygames', 
    playTime: '10-15 min',
    url: 'https://www.crazygames.com/game/among-us'
  },
  { 
    id: 17, 
    title: 'Agar.io', 
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=225&fit=crop', 
    tags: ['arcade', 'io', 'casual'], 
    performance: 'low', 
    source: 'poki', 
    playTime: '5-10 min',
    url: 'https://poki.com/en/g/agario'
  },
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
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [search, setSearch] = useState('');
  const [performance, setPerformance] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
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

  // Load games from manifest
  useEffect(() => {
    const loadGames = async () => {
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
    };
    loadGames();
  }, [canAccessTesting]);

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
    const url = game?.url;
    const isMinecraftJava =
      game?.title?.toLowerCase().includes('minecraft java') ||
      (typeof url === 'string' && url.includes('/games/minecraft/launcher.html'));

    if (isMinecraftJava && typeof url === 'string') {
      const newTab = window.open('about:blank', '_blank', 'noopener,noreferrer');
      if (newTab) {
        newTab.document.title = 'Minecraft Java Edition';
        newTab.document.body.style.margin = '0';
        newTab.document.body.style.padding = '0';
        newTab.document.body.style.overflow = 'hidden';
        newTab.document.body.style.background = '#000';
        newTab.document.documentElement.style.margin = '0';
        newTab.document.documentElement.style.padding = '0';
        newTab.document.documentElement.style.overflow = 'hidden';
        newTab.document.documentElement.style.height = '100%';

        const iframe = newTab.document.createElement('iframe');
        iframe.src = url;
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.overflow = 'hidden';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('allow', 'fullscreen');

        newTab.document.body.appendChild(iframe);
      }
      return;
    }

    // Open game in iframe modal instead of navigating to browser
    setSelectedGame(game);
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
    { id: 'github', name: 'GitHub Games' }
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

export default function Games() {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [search, setSearch] = useState('');
  const [performance, setPerformance] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
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

  // Load games from manifest
  useEffect(() => {
    const loadGames = async () => {
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
    };
    loadGames();
  }, [canAccessTesting]);

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
    // Open game in iframe modal instead of navigating to browser
    setSelectedGame(game);
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
    { id: 'github', name: 'GitHub Games' }
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
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
                className={`p-4 rounded-xl font-medium text-sm transition-all ${
                  activeSource === platform.id
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
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    selectedTags.includes(tag)
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
        </motion.header>

        {/* Game Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {sortedGames.map((game, index) => (
              <motion.div
                key={game.id}
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
              onClick={() => setSelectedGame(null)}
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
                    <p className="text-sm text-white/50">{selectedGame.playTime}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedGame(null)}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </motion.button>
                </div>

                {/* Game iframe */}
                <iframe
                  src={selectedGame.url}
                  title={selectedGame.title}
                  className="w-full h-full border-none"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
                  allow="autoplay; fullscreen; accelerometer; camera; clipboard-read; clipboard-write; encrypted-media; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; speaker; usb; vr; xr-spatial-tracking"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}