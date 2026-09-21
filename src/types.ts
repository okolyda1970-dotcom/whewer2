export interface WeatherData {
  current: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    humidity: number;
    feelslike: number;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
  };
}

export interface City {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export interface LocationInfo {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}
