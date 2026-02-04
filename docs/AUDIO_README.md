# Audio System - Complete Reference

**Background music and sound effects for Nexus**

---

## 🎵 Quick Start

The audio system provides background music for each page and optional sound effects.

**Status**: Fully integrated  
**Component**: `src/Components/Music/MusicPlayer.js`  
**Assets**: `Sounds/` folder

---

## 🔧 Features

### Background Music
- Per-page music configuration
- Volume controls
- Fade in/out transitions
- Auto-play on page load (user preference)

### Sound Effects
- UI interaction sounds (clicks, hovers)
- Notification sounds
- Game audio integration

### Optional Integrations
- Spotify Widget (optional external service)
- YouTube Widget (music videos)

---

## 📂 File Structure

```
Sounds/                       # Audio assets
src/Components/Music/
└── MusicPlayer.js           # Main music component
src/Components/Widgets/
├── SpotifyWidget.js         # Spotify integration
└── YouTubeWidget.js         # YouTube integration
```

---

## ⚙️ Configuration

Music is configured per-page in the page components:
- Landing: Ambient background
- Games: Upbeat tracks
- Study Tools: Focus music
- Dashboard: Calm instrumental

### Volume Persistence
User volume preferences saved to `localStorage`:
- Key: `nexus_music_volume`
- Range: 0.0 - 1.0

---

## 🎯 Usage

### In Components
```javascript
import MusicPlayer from '../Components/Music/MusicPlayer';

<MusicPlayer 
  track="ambient-1.mp3"
  volume={0.5}
  autoPlay={true}
/>
```

### User Controls
- Volume slider (UI)
- Mute/unmute toggle
- Track selection (optional)

---

## 🔗 References

**Component**: `src/Components/Music/MusicPlayer.js`  
**Assets**: `Sounds/` folder  
**Widgets**: Spotify/YouTube integration (optional)
