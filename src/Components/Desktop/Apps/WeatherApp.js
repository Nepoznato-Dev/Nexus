import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, MapPin } from 'lucide-react';

export default function WeatherApp() {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState('New York');
    const [country, setCountry] = useState('USA');
    const [loading, setLoading] = useState(false);
    const [unit, setUnit] = useState(() => {
        const saved = localStorage.getItem('weather_unit');
        return saved || 'C';
    });
    const [geoLoading, setGeoLoading] = useState(true);

    // Location to country mapping with weather data
    const weatherData = {
        'New York': {
            country: 'USA',
            temp: 22,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 12,
            visibility: 10,
            feelsLike: 20,
            forecast: [
                { day: 'Mon', high: 24, low: 18, condition: 'Sunny' },
                { day: 'Tue', high: 22, low: 16, condition: 'Cloudy' },
                { day: 'Wed', high: 19, low: 14, condition: 'Rainy' },
                { day: 'Thu', high: 21, low: 15, condition: 'Partly Cloudy' },
                { day: 'Fri', high: 25, low: 19, condition: 'Sunny' }
            ]
        },
        'Los Angeles': {
            country: 'USA',
            temp: 26,
            condition: 'Sunny',
            humidity: 45,
            windSpeed: 8,
            visibility: 12,
            feelsLike: 25,
            forecast: [
                { day: 'Mon', high: 27, low: 20, condition: 'Sunny' },
                { day: 'Tue', high: 28, low: 21, condition: 'Sunny' },
                { day: 'Wed', high: 25, low: 18, condition: 'Cloudy' },
                { day: 'Thu', high: 26, low: 19, condition: 'Sunny' },
                { day: 'Fri', high: 29, low: 22, condition: 'Sunny' }
            ]
        },
        'Chicago': {
            country: 'USA',
            temp: 18,
            condition: 'Cloudy',
            humidity: 60,
            windSpeed: 14,
            visibility: 10,
            feelsLike: 16,
            forecast: [
                { day: 'Mon', high: 20, low: 15, condition: 'Cloudy' },
                { day: 'Tue', high: 19, low: 14, condition: 'Rainy' },
                { day: 'Wed', high: 21, low: 16, condition: 'Sunny' },
                { day: 'Thu', high: 18, low: 13, condition: 'Cloudy' },
                { day: 'Fri', high: 22, low: 17, condition: 'Sunny' }
            ]
        },
        'London': {
            country: 'UK',
            temp: 18,
            condition: 'Rainy',
            humidity: 78,
            windSpeed: 15,
            visibility: 8,
            feelsLike: 16,
            forecast: [
                { day: 'Mon', high: 19, low: 14, condition: 'Rainy' },
                { day: 'Tue', high: 17, low: 12, condition: 'Cloudy' },
                { day: 'Wed', high: 20, low: 14, condition: 'Sunny' },
                { day: 'Thu', high: 18, low: 13, condition: 'Rainy' },
                { day: 'Fri', high: 21, low: 15, condition: 'Sunny' }
            ]
        },
        'Paris': {
            country: 'France',
            temp: 20,
            condition: 'Cloudy',
            humidity: 62,
            windSpeed: 10,
            visibility: 10,
            feelsLike: 19,
            forecast: [
                { day: 'Mon', high: 21, low: 16, condition: 'Cloudy' },
                { day: 'Tue', high: 22, low: 17, condition: 'Sunny' },
                { day: 'Wed', high: 20, low: 15, condition: 'Rainy' },
                { day: 'Thu', high: 19, low: 14, condition: 'Cloudy' },
                { day: 'Fri', high: 23, low: 18, condition: 'Sunny' }
            ]
        },
        'Tokyo': {
            country: 'Japan',
            temp: 28,
            condition: 'Sunny',
            humidity: 55,
            windSpeed: 8,
            visibility: 12,
            feelsLike: 26,
            forecast: [
                { day: 'Mon', high: 29, low: 24, condition: 'Sunny' },
                { day: 'Tue', high: 27, low: 22, condition: 'Sunny' },
                { day: 'Wed', high: 25, low: 20, condition: 'Cloudy' },
                { day: 'Thu', high: 26, low: 21, condition: 'Partly Cloudy' },
                { day: 'Fri', high: 28, low: 23, condition: 'Sunny' }
            ]
        },
        'Sydney': {
            country: 'Australia',
            temp: 24,
            condition: 'Sunny',
            humidity: 50,
            windSpeed: 10,
            visibility: 11,
            feelsLike: 23,
            forecast: [
                { day: 'Mon', high: 25, low: 20, condition: 'Sunny' },
                { day: 'Tue', high: 26, low: 21, condition: 'Sunny' },
                { day: 'Wed', high: 23, low: 18, condition: 'Cloudy' },
                { day: 'Thu', high: 24, low: 19, condition: 'Sunny' },
                { day: 'Fri', high: 27, low: 22, condition: 'Sunny' }
            ]
        },
        'Berlin': {
            country: 'Germany',
            temp: 16,
            condition: 'Partly Cloudy',
            humidity: 68,
            windSpeed: 11,
            visibility: 10,
            feelsLike: 15,
            forecast: [
                { day: 'Mon', high: 18, low: 13, condition: 'Partly Cloudy' },
                { day: 'Tue', high: 17, low: 12, condition: 'Cloudy' },
                { day: 'Wed', high: 19, low: 14, condition: 'Sunny' },
                { day: 'Thu', high: 16, low: 11, condition: 'Rainy' },
                { day: 'Fri', high: 20, low: 15, condition: 'Sunny' }
            ]
        },
        'Dubai': {
            country: 'UAE',
            temp: 38,
            condition: 'Sunny',
            humidity: 35,
            windSpeed: 12,
            visibility: 10,
            feelsLike: 40,
            forecast: [
                { day: 'Mon', high: 39, low: 32, condition: 'Sunny' },
                { day: 'Tue', high: 40, low: 33, condition: 'Sunny' },
                { day: 'Wed', high: 37, low: 30, condition: 'Partly Cloudy' },
                { day: 'Thu', high: 38, low: 31, condition: 'Sunny' },
                { day: 'Fri', high: 40, low: 34, condition: 'Sunny' }
            ]
        }
    };

    // Detect user location on mount
    useEffect(() => {
        const detectLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        // Simple country detection based on coordinates
                        const detectedCountry = getCountryFromCoordinates(latitude, longitude);
                        const defaultUnit = detectedCountry === 'USA' ? 'F' : 'C';

                        // Set default unit based on country if user hasn't manually set it
                        if (!localStorage.getItem('weather_unit_manual')) {
                            setUnit(defaultUnit);
                        }

                        // Set a default location based on detected country
                        const defaultLocation = getDefaultLocationForCountry(detectedCountry);
                        setLocation(defaultLocation);
                        setCountry(detectedCountry);
                        setGeoLoading(false);
                    },
                    (error) => {
                        console.log('Geolocation error:', error);
                        setGeoLoading(false);
                    }
                );
            } else {
                setGeoLoading(false);
            }
        };
        detectLocation();
    }, []);

    const getCountryFromCoordinates = (lat, lon) => {
        // Simplified country detection based on coordinate ranges
        if (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -65) return 'USA';
        if (lat >= -44 && lat <= -10 && lon >= 113 && lon <= 154) return 'Australia';
        if (lat >= 20 && lat <= 46 && lon >= 2 && lon <= 40) return 'Europe';
        if (lat >= 20 && lat <= 55 && lon >= 60 && lon <= 145) return 'Asia';
        if (lat >= -35 && lat <= -12 && lon >= 8 && lon <= 40) return 'Africa';
        return 'Europe'; // Default
    };

    const getDefaultLocationForCountry = (detectedCountry) => {
        const locationMap = {
            'USA': 'New York',
            'UK': 'London',
            'Europe': 'Paris',
            'Asia': 'Tokyo',
            'Australia': 'Sydney',
            'Africa': 'London'
        };
        return locationMap[detectedCountry] || 'New York';
    };

    const getWeatherIcon = (condition) => {
        if (condition.includes('Sunny')) return <Sun size={48} color="#FFD700" />;
        if (condition.includes('Rain')) return <CloudRain size={48} color="#87CEEB" />;
        if (condition.includes('Cloudy')) return <Cloud size={48} color="#A9A9A9" />;
        return <Cloud size={48} color="#A9A9A9" />;
    };

    const handleSearch = () => {
        setLoading(true);
        setTimeout(() => {
            if (weatherData[location]) {
                setWeather(weatherData[location]);
                setCountry(weatherData[location].country);
            }
            setLoading(false);
        }, 500);
    };

    const toggleUnit = () => {
        const newUnit = unit === 'C' ? 'F' : 'C';
        setUnit(newUnit);
        localStorage.setItem('weather_unit', newUnit);
        localStorage.setItem('weather_unit_manual', 'true');
    };

    useEffect(() => {
        handleSearch();
    }, []);

    const tempF = weather ? Math.round((weather.temp * 9 / 5) + 32) : 0;
    const displayTemp = unit === 'C' ? weather?.temp : tempF;
    const windUnit = unit === 'C' ? 'km/h' : 'mph';
    const windSpeed = unit === 'C' ? weather?.windSpeed : Math.round(weather?.windSpeed * 0.621371);

    return (
        <div style={{ padding: '20px', color: '#fff', height: '100%', overflow: 'auto', backgroundColor: 'transparent' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Weather</h2>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                >
                    {Object.keys(weatherData).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
                <button
                    onClick={toggleUnit}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        backgroundColor: '#4d96ff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                    }}
                    title={unit === 'C' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
                >
                    °{unit === 'C' ? 'F' : 'C'}
                </button>
            </div>

            {weather && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '12px', color: '#aaa' }}>
                        <MapPin size={14} color="#4d96ff" />
                        <span>{location}</span>
                        <span>•</span>
                        <span>{country}</span>
                        <span>•</span>
                        <span>{unit === 'C' ? 'Metric (°C)' : 'Imperial (°F)'}</span>
                    </div>

                    <div style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(77,150,255,0.15)',
                        border: '1px solid rgba(77,150,255,0.3)',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                            {getWeatherIcon(weather.condition)}
                        </div>
                        <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>
                            {unit === 'C' ? weather.temp : Math.round((weather.temp * 9 / 5) + 32)}°{unit}
                        </div>
                        <div style={{ fontSize: '16px', color: '#aaa', marginBottom: '10px' }}>
                            {weather.condition}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888' }}>
                            Feels like {unit === 'C' ? weather.feelsLike : Math.round((weather.feelsLike * 9 / 5) + 32)}°
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Droplets size={14} color="#4d96ff" /> Humidity
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{weather.humidity}%</div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Wind size={14} color="#4d96ff" /> Wind
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{windSpeed} {windUnit}</div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Eye size={14} color="#4d96ff" /> Visibility
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{weather.visibility} {unit === 'C' ? 'km' : 'mi'}</div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>5-Day Forecast</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {weather.forecast.map((day, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        textAlign: 'center',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                                        {day.day}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                                        {day.condition}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                        {unit === 'C' ? day.high : Math.round((day.high * 9 / 5) + 32)}° / {unit === 'C' ? day.low : Math.round((day.low * 9 / 5) + 32)}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
