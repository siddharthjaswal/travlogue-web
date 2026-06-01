export interface WeatherCondition {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationSum: number;
  uvIndex: number;
}

export interface WeatherData {
  current: WeatherCondition;
  forecast: DailyForecast[];
  timezone: string;
}

// WMO weather code → label + emoji mapping
export function getWeatherLabel(code: number, isDay = 1): { label: string; emoji: string } {
  if (code === 0) return { label: isDay ? 'Clear sky' : 'Clear night', emoji: isDay ? '☀️' : '🌙' };
  if (code <= 2) return { label: 'Partly cloudy', emoji: '⛅' };
  if (code === 3) return { label: 'Overcast', emoji: '☁️' };
  if (code <= 49) return { label: 'Foggy', emoji: '🌫️' };
  if (code <= 59) return { label: 'Drizzle', emoji: '🌦️' };
  if (code <= 69) return { label: 'Rain', emoji: '🌧️' };
  if (code <= 79) return { label: 'Snow', emoji: '❄️' };
  if (code <= 82) return { label: 'Rain showers', emoji: '🌧️' };
  if (code <= 86) return { label: 'Snow showers', emoji: '🌨️' };
  if (code <= 99) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Unknown', emoji: '🌡️' };
}

export async function fetchWeather(lat: number, lng: number, days = 7): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max',
    forecast_days: days.toString(),
    timezone: 'auto',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error('Weather fetch failed');

  const data = await res.json();

  const current: WeatherCondition = {
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    weatherCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    isDay: data.current.is_day,
  };

  const forecast: DailyForecast[] = (data.daily.time as string[]).map((date: string, i: number) => ({
    date,
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    weatherCode: data.daily.weather_code[i],
    precipitationSum: data.daily.precipitation_sum[i],
    uvIndex: data.daily.uv_index_max[i],
  }));

  return { current, forecast, timezone: data.timezone };
}
