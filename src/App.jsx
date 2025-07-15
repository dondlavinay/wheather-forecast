import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = 'e83ec77581be29c24f356230323eabd7'; // Updated API key

const themes = [
  { name: 'Light', icon: '☀️', className: 'theme-light' },
  { name: 'Dark', icon: '🌙', className: 'theme-dark' },
  { name: 'Blue', icon: '🔵', className: 'theme-blue' },
  { name: 'Green', icon: '🟢', className: 'theme-green' },
];

function App() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState(themes[0]);

  useEffect(() => {
    document.body.classList.remove(...themes.map(t => t.className));
    document.body.classList.add(theme.className);
  }, [theme]);

  // Auto-detect location using Geolocation API
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  // Fetch weather by city name
  const fetchWeather = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('Location not found');
      const data = await res.json();
      setWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('Location not found');
      const data = await res.json();
      setWeather(data);
      fetchForecast(lat, lon);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  };

  // Fetch 5-day forecast
  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('Forecast not found');
      const data = await res.json();
      // Get one forecast per day (at 12:00)
      const daily = data.list.filter((item) => item.dt_txt.includes('12:00:00'));
      setForecast(daily);
    } catch (err) {
      setError('Could not fetch forecast.');
      setForecast([]);
    }
  };

  return (
    <div className="weather-app">
      <div className="theme-menu-wrapper">
        <button
          className="theme-menu-btn"
          onClick={() => setThemeMenuOpen((open) => !open)}
          aria-label="Theme menu"
        >
          <span role="img" aria-label="theme">🎨</span>
        </button>
        {themeMenuOpen && (
          <div className="theme-dropdown">
            {themes.map((t) => (
              <button
                key={t.name}
                className={`theme-option${theme.name === t.name ? ' selected' : ''}`}
                onClick={() => {
                  setTheme(t);
                  setThemeMenuOpen(false);
                }}
              >
                <span role="img" aria-label={t.name}>{t.icon}</span> {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <h1>Weather Forecast</h1>
      <form onSubmit={fetchWeather} className="weather-form">
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" disabled={loading}>Search</button>
        <button type="button" onClick={detectLocation} disabled={loading}>
          Auto-Detect
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {weather && (
        <div className="weather-current">
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <p>
            <strong>{Math.round(weather.main.temp)}°C</strong> - {weather.weather[0].description}
          </p>
          <p style={{ fontSize: '0.95em', color: '#888', margin: '0.5em 0' }}>
            Lat: {weather.coord.lat}, Lon: {weather.coord.lon}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
        </div>
      )}
      {forecast.length > 0 && (
        <div className="weather-forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-list">
            {forecast.map((item) => (
              <div className="forecast-item" key={item.dt}>
                <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                />
                <p>
                  <strong>{Math.round(item.main.temp)}°C</strong>
                </p>
                <p>{item.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
