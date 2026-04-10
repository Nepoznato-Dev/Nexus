import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Search, Clock, Bookmark, Newspaper, Thermometer } from 'lucide-react';

function ClockWidget() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return (
    <div className="text-center py-4">
      <div className="text-5xl font-thin text-white tabular-nums tracking-widest">
        {h}:{m}<span className="text-2xl text-white/30">:{s}</span>
      </div>
      <div className="text-sm text-white/50 mt-1">
        {dayNames[time.getDay()]}, {monthNames[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </div>
    </div>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(localStorage.getItem('nexus-weather-city') || '');
  const [inputCity, setInputCity] = useState('');

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(cityName)}?format=j1`);
      const data = await res.json();
      const curr = data.current_condition[0];
      setWeather({
        city: cityName,
        temp: curr.temp_C,
        desc: curr.weatherDesc[0].value,
        humidity: curr.humidity,
        feels: curr.FeelsLikeC,
        wind: curr.windspeedKmph,
      });
    } catch {
      setWeather({ error: true, city: cityName });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (city) fetchWeather(city);
  }, [city]);

  if (!city) {
    return (
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <Thermometer className="w-8 h-8 mx-auto mb-2 text-white/30" />
        <p className="text-xs text-white/40 mb-2">Enter your city for weather</p>
        <form onSubmit={e => { e.preventDefault(); setCity(inputCity); localStorage.setItem('nexus-weather-city', inputCity); }}>
          <input
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
            className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg outline-none w-full mb-2"
            placeholder="City name..."
          />
          <button type="submit" className="w-full py-1 text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg">
            Set City
          </button>
        </form>
      </div>
    );
  }

  if (loading) return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto" />
    </div>
  );

  if (weather?.error) return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <p className="text-xs text-red-400">Could not load weather for "{city}"</p>
      <button onClick={() => { setCity(''); setWeather(null); }} className="text-xs text-white/40 mt-1 hover:text-white">Try another city</button>
    </div>
  );

  if (!weather) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40">{weather.city}</p>
          <div className="text-3xl font-thin text-white">{weather.temp}°C</div>
          <p className="text-sm text-white/60">{weather.desc}</p>
        </div>
        <div className="text-right text-xs text-white/40 space-y-1">
          <p>Feels {weather.feels}°C</p>
          <p>Humidity {weather.humidity}%</p>
          <p>Wind {weather.wind} km/h</p>
        </div>
      </div>
      <button onClick={() => { setCity(''); setWeather(null); }} className="text-xs text-white/20 hover:text-white/50 mt-2">Change city</button>
    </div>
  );
}

function NewsWidget() {
  // Use a privacy-friendly RSS-like approach via public feed
  const headlines = [
    { title: 'Explore the latest in technology and science', url: 'https://news.ycombinator.com' },
    { title: 'Open source highlights from the community', url: 'https://github.com/trending' },
    { title: 'Privacy news and digital rights updates', url: 'https://www.eff.org/deeplinks' },
    { title: 'Web development trends and tutorials', url: 'https://css-tricks.com' },
    { title: 'Security vulnerabilities and patches', url: 'https://thehackernews.com' },
  ];

  return (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-4 h-4 text-white/40" />
        <span className="text-xs text-white/40 font-medium">Quick Links</span>
      </div>
      <div className="space-y-1">
        {headlines.map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-white/60 hover:text-white py-0.5 truncate hover:translate-x-1 transition-transform"
          >
            › {h.title}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function BrowserNewTab({ bookmarks = [], onNavigate, settings = {}, onUpdateSettings }) {
  const [searchInput, setSearchInput] = useState('');

  const config = settings.newTabContent || ['clock', 'bookmarks'];
  const allWidgets = ['clock', 'weather', 'bookmarks', 'news'];

  const toggleWidget = (w) => {
    const current = settings.newTabContent || ['clock', 'bookmarks'];
    const updated = current.includes(w) ? current.filter(x => x !== w) : [...current, w];
    onUpdateSettings?.({ newTabContent: updated });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput) return;
    onNavigate(searchInput);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-auto p-6 pb-10" style={{ background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0a12 70%)' }}>
      {/* Clock */}
      {config.includes('clock') && <ClockWidget />}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="w-full max-w-xl mt-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white placeholder-white/30 outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all text-sm"
            placeholder="Search or enter URL..."
            autoFocus
          />
        </div>
      </form>

      <div className="w-full max-w-2xl space-y-4">
        {/* Weather */}
        {config.includes('weather') && <WeatherWidget />}

        {/* Bookmarks grid */}
        {config.includes('bookmarks') && bookmarks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/30">Bookmarks</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {bookmarks.slice(0, 12).map(b => (
                <button
                  key={b.id}
                  onClick={() => onNavigate(b.url)}
                  className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all"
                  title={b.title}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    {b.favicon ? (
                      <img src={b.favicon} alt="" className="w-6 h-6" onError={e => { e.target.style.display='none'; }} />
                    ) : (
                      <Globe className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white truncate w-full text-center max-w-[60px]">
                    {b.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* News / quick links */}
        {config.includes('news') && <NewsWidget />}
      </div>

      {/* Widget configuration */}
      <div className="mt-6 flex gap-2 flex-wrap justify-center">
        {allWidgets.map(w => (
          <button
            key={w}
            onClick={() => toggleWidget(w)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              config.includes(w) ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10'
            }`}
          >
            {w.charAt(0).toUpperCase() + w.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
