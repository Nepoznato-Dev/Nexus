# Games Library - Complete Reference

**80+ open-source games available in Nexus**

---

## 🎮 Quick Access

Access all games through the **Games** page in Nexus app.

**Location**: Nexus → Games tab  
**Source**: `public/games/` folder  
**Manifest**: `public/games/games-manifest.json`

---

## 📚 Available Games

### Arcade Classics
- Pacman Canvas
- Snake
- Tetris
- Space Invaders
- Breakout

### Strategy & Puzzle
- Chess
- Sudoku
- 2048
- Minesweeper
- Tower Defense

### Adventure
- Browser Quest
- Dark Room
- Portal 2D

### Simulation
- OpenTTD (Transport Tycoon)

### Educational
- Math games
- Typing games
- Memory games

**Total**: 80+ games indexed and playable

---

## 🔧 Technical Details

### File Structure
```
public/games/
├── games-manifest.json       # Master game index
├── pacman-canvas/           # Individual game folders
├── browser-quest/
├── dark-room/
├── openttd/
└── ...                      # 80+ more games
```

### Integration
Games are loaded via the `Games.js` component:
- Fetches `games-manifest.json`
- Displays game cards with thumbnails
- Opens games in iframe or new tab
- Supports filtering and search

### Adding New Games
1. Add game folder to `public/games/`
2. Update `games-manifest.json`
3. Include thumbnail image
4. Test in Games page

---

## 🎯 Game Categories

**Action**: Fast-paced gameplay  
**Puzzle**: Logic and problem-solving  
**Strategy**: Planning and tactics  
**Educational**: Learning-focused  
**Casual**: Easy pick-up-and-play

All games are:
- ✅ Open-source
- ✅ Browser-playable (no install)
- ✅ School-safe (no ads, no tracking)
- ✅ Offline-capable (once loaded)

---

## 🔗 References

**Component**: `src/PagesDisplay/Games.js`  
**Assets**: `public/games/`  
**Manifest**: `public/games/games-manifest.json`
