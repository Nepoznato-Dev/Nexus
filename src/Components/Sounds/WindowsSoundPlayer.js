import React, { useState, useRef, useEffect } from 'react';
import './WindowsSoundPlayer.css';

const OSMusicPlayer = () => {
  const [currentSound, setCurrentSound] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('windows'); // windows, macos, linux
  const audioRef = useRef(null);

  // Windows versions and their available sounds
  const windowsVersions = [
    {
      version: '95',
      name: 'Windows 95',
      year: '1995',
      color: '#008080',
      sounds: [
        { type: 'startup', available: true },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'logoff', available: false },
        { type: 'error', available: false },
        { type: 'notify', available: false }
      ]
    },
    {
      version: '98',
      name: 'Windows 98',
      year: '1998',
      color: '#000080',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: '2000',
      name: 'Windows 2000',
      year: '2000',
      color: '#004080',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false }
      ]
    },
    {
      version: 'me',
      name: 'Windows ME',
      year: '2000',
      color: '#800080',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'xp',
      name: 'Windows XP',
      year: '2001',
      color: '#0066CC',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'logoff', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'vista',
      name: 'Windows Vista',
      year: '2007',
      color: '#1E90FF',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: '7',
      name: 'Windows 7',
      year: '2009',
      color: '#0078D7',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'logoff', available: false },
        { type: 'error', available: false },
        { type: 'notify', available: false }
      ]
    },
    {
      version: '8',
      name: 'Windows 8',
      year: '2012',
      color: '#00BCF2',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'notify', available: false }
      ]
    },
    {
      version: '10',
      name: 'Windows 10',
      year: '2015',
      color: '#0078D4',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'notify', available: false }
      ]
    },
    {
      version: '11',
      name: 'Windows 11',
      year: '2021',
      color: '#0067C0',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'logon', available: false },
        { type: 'notify', available: false }
      ]
    }
  ];

  // macOS versions
  const macosVersions = [
    // Classic Mac OS
    {
      version: 'system-7',
      name: 'System 7',
      year: '1991',
      category: 'Classic Mac OS',
      color: '#A0A0A0',
      sounds: [
        { type: 'startup', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'mac-os-8',
      name: 'Mac OS 8',
      year: '1997',
      category: 'Classic Mac OS',
      color: '#A5A5A5',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'mac-os-9',
      name: 'Mac OS 9',
      year: '1999',
      category: 'Classic Mac OS',
      color: '#AAAAAA',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'error', available: false }
      ]
    },
    // Mac OS X
    {
      version: 'mac-os-x-cheetah',
      name: 'Mac OS X 10.0 Cheetah',
      year: '2001',
      category: 'Mac OS X',
      color: '#999999',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false }
      ]
    },
    {
      version: 'mac-os-x-leopard',
      name: 'Mac OS X 10.5 Leopard',
      year: '2007',
      category: 'Mac OS X',
      color: '#888888',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'mac-os-x-lion',
      name: 'Mac OS X 10.7 Lion',
      year: '2011',
      category: 'Mac OS X',
      color: '#777777',
      sounds: [
        { type: 'startup', available: false },
        { type: 'shutdown', available: false }
      ]
    },
    // macOS Modern
    {
      version: 'macos-big-sur',
      name: 'macOS 11 Big Sur',
      year: '2020',
      category: 'macOS',
      color: '#666666',
      sounds: [
        { type: 'startup', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'macos-monterey',
      name: 'macOS 12 Monterey',
      year: '2021',
      category: 'macOS',
      color: '#555555',
      sounds: [
        { type: 'startup', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'macos-sonoma',
      name: 'macOS 14 Sonoma',
      year: '2023',
      category: 'macOS',
      color: '#444444',
      sounds: [
        { type: 'startup', available: false },
        { type: 'error', available: false }
      ]
    }
  ];

  // Linux versions
  const linuxVersions = [
    // Desktop Environments
    {
      version: 'gnome',
      name: 'GNOME',
      category: 'Desktop Environments',
      color: '#FF9900',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false },
        { type: 'logout', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'kde-plasma',
      name: 'KDE Plasma',
      category: 'Desktop Environments',
      color: '#0066CC',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false },
        { type: 'logout', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'xfce',
      name: 'XFCE',
      category: 'Desktop Environments',
      color: '#0066FF',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'cinnamon',
      name: 'Cinnamon',
      category: 'Desktop Environments',
      color: '#FF6633',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false },
        { type: 'error', available: false }
      ]
    },
    // Distributions
    {
      version: 'ubuntu',
      name: 'Ubuntu',
      category: 'Distributions',
      color: '#DD4814',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false },
        { type: 'error', available: false }
      ]
    },
    {
      version: 'fedora',
      name: 'Fedora',
      category: 'Distributions',
      color: '#003478',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false }
      ]
    },
    {
      version: 'debian',
      name: 'Debian',
      category: 'Distributions',
      color: '#A81D33',
      sounds: [
        { type: 'startup', available: false },
        { type: 'login', available: false }
      ]
    },
    {
      version: 'arch',
      name: 'Arch Linux',
      category: 'Distributions',
      color: '#1793D1',
      sounds: [
        { type: 'startup', available: false }
      ]
    }
  ];

  const playSound = (version, soundType, versionName, osType = 'windows') => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const soundPath = `/Sounds/${osType === 'macos' ? 'macOS' : osType === 'linux' ? 'Linux' : 'Windows'}/${version}/${soundType}.mp3`;
    
    setCurrentSound({ version: versionName, type: soundType, path: soundPath, osType });
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = soundPath;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(err => {
        console.error('Error playing sound:', err);
        setIsPlaying(false);
      });
    }
  };

  const playRandomSound = () => {
    const availableSounds = [];
    
    const allVersions = activeTab === 'windows' ? windowsVersions : activeTab === 'macos' ? macosVersions : linuxVersions;
    const osType = activeTab;
    
    allVersions.forEach(ver => {
      ver.sounds.forEach(sound => {
        if (sound.available) {
          availableSounds.push({
            version: ver.version,
            versionName: ver.name,
            soundType: sound.type
          });
        }
      });
    });

    if (availableSounds.length > 0) {
      const random = availableSounds[Math.floor(Math.random() * availableSounds.length)];
      playSound(random.version, random.soundType, random.versionName, osType);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="windows-sound-player">
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      <div className="player-header">
        <h1>🔊 Operating System Sounds Museum</h1>
        <p>A nostalgic journey through decades of computer startup sounds</p>
      </div>

      {currentSound && (
        <div className="now-playing">
          <div className="now-playing-content">
            <span className="playing-icon">{isPlaying ? '▶️' : '⏸️'}</span>
            <div className="playing-info">
              <div className="playing-version">{currentSound.version}</div>
              <div className="playing-type">{currentSound.type}</div>
            </div>
          </div>
          <button onClick={stopSound} className="stop-btn">Stop</button>
        </div>
      )}

      <div className="controls">
        <div className="volume-control">
          <span>🔉</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span>🔊</span>
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>

        <button onClick={playRandomSound} className="random-btn">
          🎲 Play Random Sound
        </button>
      </div>

      <div className="os-tabs">
        <button 
          className={`tab-btn ${activeTab === 'windows' ? 'active' : ''}`}
          onClick={() => setActiveTab('windows')}
        >
          🪟 Windows
        </button>
        <button 
          className={`tab-btn ${activeTab === 'macos' ? 'active' : ''}`}
          onClick={() => setActiveTab('macos')}
        >
          🍎 macOS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'linux' ? 'active' : ''}`}
          onClick={() => setActiveTab('linux')}
        >
          🐧 Linux
        </button>
      </div>

      <div className="versions-grid">
        {activeTab === 'windows' && windowsVersions.map((winVer) => (
          <div
            key={winVer.version}
            className="version-card"
            style={{ '--version-color': winVer.color }}
          >
            <div className="version-header">
              <h3>{winVer.name}</h3>
              <span className="version-year">{winVer.year}</span>
            </div>

            <div className="sounds-list">
              {winVer.sounds.map((sound) => (
                <button
                  key={sound.type}
                  className={`sound-btn ${!sound.available ? 'disabled' : ''}`}
                  onClick={() => sound.available && playSound(winVer.version, sound.type, winVer.name, 'windows')}
                  disabled={!sound.available}
                >
                  <span className="sound-icon">
                    {sound.type === 'startup' && '🚀'}
                    {sound.type === 'shutdown' && '🔴'}
                    {sound.type === 'logon' && '👤'}
                    {sound.type === 'logoff' && '👋'}
                    {sound.type === 'error' && '❌'}
                    {sound.type === 'notify' && '🔔'}
                  </span>
                  <span className="sound-type">{sound.type}</span>
                  {!sound.available && <span className="coming-soon">Soon</span>}
                </button>
              ))}
            </div>

            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{
                  width: `${(winVer.sounds.filter(s => s.available).length / winVer.sounds.length) * 100}%`
                }}
              />
            </div>
          </div>
        ))}

        {activeTab === 'macos' && macosVersions.map((macVer) => (
          <div
            key={macVer.version}
            className="version-card"
            style={{ '--version-color': macVer.color }}
          >
            <div className="version-header">
              <h3>{macVer.name}</h3>
              <span className="version-year">{macVer.year}</span>
            </div>

            <div className="sounds-list">
              {macVer.sounds.map((sound) => (
                <button
                  key={sound.type}
                  className={`sound-btn ${!sound.available ? 'disabled' : ''}`}
                  onClick={() => sound.available && playSound(macVer.version, sound.type, macVer.name, 'macos')}
                  disabled={!sound.available}
                >
                  <span className="sound-icon">
                    {sound.type === 'startup' && '🚀'}
                    {sound.type === 'shutdown' && '🔴'}
                    {sound.type === 'error' && '❌'}
                  </span>
                  <span className="sound-type">{sound.type}</span>
                  {!sound.available && <span className="coming-soon">Soon</span>}
                </button>
              ))}
            </div>

            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{
                  width: `${(macVer.sounds.filter(s => s.available).length / macVer.sounds.length) * 100}%`
                }}
              />
            </div>
          </div>
        ))}

        {activeTab === 'linux' && linuxVersions.map((linuxVer) => (
          <div
            key={linuxVer.version}
            className="version-card"
            style={{ '--version-color': linuxVer.color }}
          >
            <div className="version-header">
              <h3>{linuxVer.name}</h3>
              <span className="version-year">{linuxVer.category}</span>
            </div>

            <div className="sounds-list">
              {linuxVer.sounds.map((sound) => (
                <button
                  key={sound.type}
                  className={`sound-btn ${!sound.available ? 'disabled' : ''}`}
                  onClick={() => sound.available && playSound(linuxVer.version, sound.type, linuxVer.name, 'linux')}
                  disabled={!sound.available}
                >
                  <span className="sound-icon">
                    {sound.type === 'startup' && '🚀'}
                    {sound.type === 'login' && '👤'}
                    {sound.type === 'logout' && '👋'}
                    {sound.type === 'error' && '❌'}
                  </span>
                  <span className="sound-type">{sound.type}</span>
                  {!sound.available && <span className="coming-soon">Soon</span>}
                </button>
              ))}
            </div>

            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{
                  width: `${(linuxVer.sounds.filter(s => s.available).length / linuxVer.sounds.length) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h3>📚 About This Collection</h3>
        <p>
          This is a preservation of operating system sounds from Windows, macOS, and Linux spanning 1984 to present.
          These iconic sounds defined computing experiences for billions of users worldwide.
        </p>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">
              {activeTab === 'windows' ? windowsVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0) : activeTab === 'macos' ? macosVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0) : linuxVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0)}
            </div>
            <div className="stat-label">Sounds Available</div>
          </div>
          <div className="stat">
            <div className="stat-value">{activeTab === 'windows' ? windowsVersions.length : activeTab === 'macos' ? macosVersions.length : linuxVersions.length}</div>
            <div className="stat-label">{activeTab === 'windows' ? 'Windows' : activeTab === 'macos' ? 'macOS' : 'Linux'} Versions</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {windowsVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0) + macosVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0) + linuxVersions.reduce((acc, ver) => acc + ver.sounds.filter(s => s.available).length, 0)}/{10 * 5.2 + 9 * 2.4 + 8 * 3.5}
            </div>
            <div className="stat-label">Total Collection</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSMusicPlayer;
