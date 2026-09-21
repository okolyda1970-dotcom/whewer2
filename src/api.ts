import { WeatherData, City } from './types';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];
  
  const response = await fetch(
    `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=ru&format=json`
  );
  const data = await response.json();
  return data.results || [];
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${WEATHER_API}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&hourly=temperature_2m,weather_code` +
    `&timezone=auto&forecast_days=7`
  );
  const data = await response.json();
  
  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      windspeed: Math.round(data.current.wind_speed_10m),
      weathercode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      feelslike: Math.round(data.current.apparent_temperature),
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weather_code,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min,
      precipitation_sum: data.daily.precipitation_sum,
      windspeed_10m_max: data.daily.wind_speed_10m_max,
    },
    hourly: {
      time: data.hourly.time.slice(0, 24),
      temperature_2m: data.hourly.temperature_2m.slice(0, 24),
      weathercode: data.hourly.weather_code.slice(0, 24),
    },
  };
}

export function getWeatherInfo(code: number): { icon: string; description: string; bg: string } {
  const weatherMap: Record<number, { icon: string; description: string; bg: string }> = {
    0: { icon: '☀️', description: 'Ясно', bg: 'from-amber-400 to-orange-500' },
    1: { icon: '🌤️', description: 'Преимущественно ясно', bg: 'from-amber-400 to-orange-400' },
    2: { icon: '⛅', description: 'Переменная облачность', bg: 'from-blue-400 to-blue-600' },
    3: { icon: '☁️', description: 'Пасмурно', bg: 'from-gray-400 to-gray-600' },
    45: { icon: '🌫️', description: 'Туман', bg: 'from-gray-400 to-gray-500' },
    48: { icon: '🌫️', description: 'Изморозь', bg: 'from-gray-300 to-gray-500' },
    51: { icon: '🌦️', description: 'Лёгкая морось', bg: 'from-blue-400 to-blue-600' },
    53: { icon: '🌦️', description: 'Морось', bg: 'from-blue-500 to-blue-700' },
    55: { icon: '🌧️', description: 'Сильная морось', bg: 'from-blue-600 to-blue-800' },
    61: { icon: '🌧️', description: 'Небольшой дождь', bg: 'from-blue-500 to-blue-700' },
    63: { icon: '🌧️', description: 'Дождь', bg: 'from-blue-600 to-blue-800' },
    65: { icon: '🌧️', description: 'Сильный дождь', bg: 'from-blue-700 to-indigo-900' },
    71: { icon: '🌨️', description: 'Небольшой снег', bg: 'from-blue-200 to-blue-400' },
    73: { icon: '🌨️', description: 'Снег', bg: 'from-blue-300 to-blue-500' },
    75: { icon: '❄️', description: 'Сильный снег', bg: 'from-blue-300 to-indigo-500' },
    77: { icon: '🌨️', description: 'Снежные зёрна', bg: 'from-gray-300 to-blue-400' },
    80: { icon: '🌦️', description: 'Ливень', bg: 'from-blue-500 to-blue-700' },
    81: { icon: '🌧️', description: 'Сильный ливень', bg: 'from-blue-600 to-blue-800' },
    82: { icon: '⛈️', description: 'Очень сильный ливень', bg: 'from-blue-700 to-indigo-900' },
    85: { icon: '🌨️', description: 'Снегопад', bg: 'from-blue-300 to-blue-500' },
    86: { icon: '❄️', description: 'Сильный снегопад', bg: 'from-blue-400 to-indigo-600' },
    95: { icon: '⛈️', description: 'Гроза', bg: 'from-gray-700 to-gray-900' },
    96: { icon: '⛈️', description: 'Гроза с градом', bg: 'from-gray-800 to-gray-900' },
    99: { icon: '⛈️', description: 'Сильная гроза с градом', bg: 'from-gray-800 to-black' },
  };
  
  return weatherMap[code] || { icon: '🌡️', description: 'Неизвестно', bg: 'from-blue-400 to-blue-600' };
}

export function getDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Сегодня';
  if (index === 1) return 'Завтра';
  
  const date = new Date(dateStr);
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
}

export function getHourLabel(timeStr: string): string {
  const date = new Date(timeStr);
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}
