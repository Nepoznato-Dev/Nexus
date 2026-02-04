/**
 * WeatherWidget.js - Weather display with location detection
 * Uses OpenWeatherMap API for current weather data
 */

import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, MapPin, RefreshCw, Loader } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // metric or imperial

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Fallback to IP-based location or default city
            fetchWeatherByCity('New York');
          }
        );
      } else {
        // Geolocation not supported
        fetchWeatherByCity('New York');
      }
    } catch (err) {
      setError('Unable to fetch weather');
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      // Using free weather API (no key required for demo)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${unit === 'metric' ? 'celsius' : 'fahrenheit'}`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      
      setWeather({
        temp: Math.round(data.current_weather.temperature),
        windSpeed: data.current_weather.windspeed,
        weatherCode: data.current_weather.weathercode,
        time: new Date(data.current_weather.time)
      });

      // Reverse geocode to get city name
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await geoResponse.json();
      setLocation(geoData.address.city || geoData.address.town || 'Unknown Location');
      
      setLoading(false);
    } catch (err) {
      console.error('Weather API error:', err);
      setError('Failed to load weather');
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      // Geocode city name to coordinates
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.length > 0) {
        const { lat, lon } = geoData[0];
        await fetchWeather(parseFloat(lat), parseFloat(lon));
      } else {
        throw new Error('City not found');
      }
    } catch (err) {
      setError('City not found');
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    // WMO Weather interpretation codes
    // 0 = clear, 1-3 = partly cloudy, 45/48 = fog, 51-67 = rain, 71-77 = snow, 80-99 = rain showers/thunderstorm
    if (code === 0) return <Sun className="w-12 h-12 text-yellow-400" />;
    if (code <= 3) return <Cloud className="w-12 h-12 text-gray-300" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400" />;
    return <Cloud className="w-12 h-12 text-gray-400" />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80) return 'Showers';
    return 'Cloudy';
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
    if (weather) {
      getLocationAndWeather(); // Refresh with new unit
    }
  };

  return (
    <div className="weather-widget h-full flex flex-col">
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white/60" />
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-white/60">
          <Cloud className="w-16 h-16 mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={getLocationAndWeather}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {weather && !loading && !error && (
        <div className="flex-1 flex flex-col justify-between p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{location || 'Loading...'}</span>
            </div>
            <button
              onClick={toggleUnit}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors text-white"
            >
              °{unit === 'metric' ? 'C' : 'F'}
            </button>
          </div>

          {/* Main weather display */}
          <div className="flex items-center justify-center flex-col my-4">
            {getWeatherIcon(weather.weatherCode)}
            <div className="text-5xl font-bold text-white mt-4">
              {weather.temp}°
            </div>
            <div className="text-white/70 text-sm mt-2">
              {getWeatherDescription(weather.weatherCode)}
            </div>
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-300" />
              <div>
                <div className="text-xs text-white/60">Wind</div>
                <div className="text-sm font-semibold text-white">
                  {Math.round(weather.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-300" />
              <div>
                <div className="text-xs text-white/60">Updated</div>
                <div className="text-sm font-semibold text-white">
                  {weather.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={getLocationAndWeather}
            className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-white/80 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
