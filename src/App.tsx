import { useState, useEffect, useRef } from 'react';
import { WeatherData, City, LocationInfo } from './types';
import { searchCities, getWeather, getWeatherInfo, getDayName, getHourLabel } from './api';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDefaultWeather();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadDefaultWeather() {
    setLoading(true);
    try {
      // Попробуем получить геолокацию
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeather(latitude, longitude, 'Мое местоположение', '');
          },
          async () => {
            // Если не удалось - Москва по умолчанию
            await fetchWeather(55.7558, 37.6173, 'Москва', 'Россия');
          },
          { timeout: 5000 }
        );
      } else {
        await fetchWeather(55.7558, 37.6173, 'Москва', 'Россия');
      }
    } catch {
      await fetchWeather(55.7558, 37.6173, 'Москва', 'Россия');
    }
  }

  async function fetchWeather(lat: number, lon: number, name: string, country: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather(lat, lon);
      setWeather(data);
      setLocation({ name, country, latitude: lat, longitude: lon });
    } catch (err) {
      setError('Не удалось загрузить данные о погоде');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length >= 2) {
      searchTimeout.current = setTimeout(async () => {
        const results = await searchCities(query);
        setSearchResults(results);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }

  async function selectCity(city: City) {
    setSearchQuery(city.name);
    setShowSearch(false);
    setSearchResults([]);
    await fetchWeather(city.latitude, city.longitude, city.name, city.country);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🌤️</div>
          <p className="text-xl">Загрузка погоды...</p>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={loadDefaultWeather}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const weatherInfo = weather ? getWeatherInfo(weather.current.weathercode) : null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${weatherInfo?.bg || 'from-blue-500 to-indigo-700'} transition-all duration-700`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header with Search */}
        <header className="p-4 pt-6">
          <div ref={searchRef} className="relative">
            <div className="flex items-center bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3">
              <span className="text-white/80 mr-3">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Поиск города..."
                className="bg-transparent text-white placeholder-white/60 w-full outline-none text-lg"
              />
            </div>
            
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden z-50">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="text-gray-800 font-medium">{city.name}</div>
                    <div className="text-gray-500 text-sm">
                      {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Current Weather */}
        {weather && location && (
          <main className="flex-1 px-4 pb-6">
            {/* Location */}
            <div className="text-center text-white mb-2">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                📍 {location.name}
              </h1>
              {location.country && (
                <p className="text-white/70 text-sm">{location.country}</p>
              )}
            </div>

            {/* Main Weather Card */}
            <div className="text-center text-white my-8">
              <div className="text-8xl mb-4 animate-bounce-slow">
                {weatherInfo?.icon}
              </div>
              <div className="text-7xl font-thin mb-2">
                {weather.current.temperature}°
              </div>
              <div className="text-xl text-white/90 mb-1">
                {weatherInfo?.description}
              </div>
              <div className="text-white/70">
                Ощущается как {weather.current.feelslike}°
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center text-white">
                <div className="text-2xl mb-1">💨</div>
                <div className="text-lg font-semibold">{weather.current.windspeed}</div>
                <div className="text-xs text-white/70">км/ч</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center text-white">
                <div className="text-2xl mb-1">💧</div>
                <div className="text-lg font-semibold">{weather.current.humidity}%</div>
                <div className="text-xs text-white/70">Влажность</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center text-white">
                <div className="text-2xl mb-1">🌡️</div>
                <div className="text-lg font-semibold">{weather.current.feelslike}°</div>
                <div className="text-xs text-white/70">Ощущается</div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                🕐 Почасовой прогноз
              </h3>
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {weather.hourly.time.map((time, i) => {
                  const hourInfo = getWeatherInfo(weather.hourly.weathercode[i]);
                  return (
                    <div key={i} className="flex flex-col items-center min-w-[60px] text-white">
                      <span className="text-xs text-white/70">{getHourLabel(time)}</span>
                      <span className="text-2xl my-2">{hourInfo.icon}</span>
                      <span className="text-sm font-medium">{Math.round(weather.hourly.temperature_2m[i])}°</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                📅 Прогноз на 7 дней
              </h3>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide px-1">
                {weather.daily.time.map((date, i) => {
                  const dayInfo = getWeatherInfo(weather.daily.weathercode[i]);
                  return (
                    <div key={i} className="flex flex-col items-center min-w-[80px] bg-white/10 rounded-xl p-3 text-white">
                      <span className="text-xs font-medium mb-2">{getDayName(date, i)}</span>
                      <span className="text-3xl my-2">{dayInfo.icon}</span>
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="text-sm font-semibold">
                          {Math.round(weather.daily.temperature_2m_max[i])}°
                        </span>
                        <span className="text-xs text-white/60">
                          {Math.round(weather.daily.temperature_2m_min[i])}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Precipitation */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                🌧️ Осадки (мм)
              </h3>
              <div className="flex justify-between items-end h-20">
                {weather.daily.precipitation_sum.map((precip, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div
                      className="w-4 bg-blue-300/60 rounded-t-sm transition-all"
                      style={{ height: `${Math.min(precip * 4, 60)}px` }}
                    />
                    <span className="text-xs text-white/70 mt-1">{getDayName(weather.daily.time[i], i).slice(0, 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="text-center text-white/50 text-xs pb-4 px-4">
          Данные: Open-Meteo.com • Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </footer>
      </div>
    </div>
  );
}

export default App;
