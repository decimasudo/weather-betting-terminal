// src/lib/api.ts

// Define types
export interface DailyForecast {
  date: string;        // e.g. "Mon 24"
  maxTemp: number;
  minTemp: number;
  precipProb: number;  // max precipitation probability for the day (%)
  precipSum: number;   // total precipitation (mm)
  weatherCode: number;
  description: string;
}

export interface HourlyPoint {
  time: string;       // e.g. "14:00"
  temp: number;
  precipProb: number;
  weatherCode: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  description: string;
  weatherCode: number;
  precipitationProb: number;
  windSpeed: number;
  windDirection: number; // degrees
  humidity: number;
  visibility: number;
  uvIndex: number;
  hourly: HourlyPoint[];      // next 24h
  daily: DailyForecast[];     // 7-day
  // Betting signals derived from data
  signals: {
    tempAnomaly: number;      // degrees above/below daily avg
    stormRisk: 'low' | 'moderate' | 'high';
    extremeHeatRisk: boolean; // temp > 35°C
    extremeColdRisk: boolean; // temp < 0°C
    todayMaxTemp: number;
    todayMinTemp: number;
  }
}

export interface PolymarketEvent {
  id: string;
  title: string;
  volume: number;
  endDate: string;
  outcomes: string[];
  outcomePrices: number[];
  image?: string;
}

export async function fetchCitySuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    const data = await res.json();
    if (data.results) {
      // Deduplicate by city name — keep only the first (most prominent) result per unique name
      const seen = new Set<string>();
      return data.results
        .map((item: any) => item.name as string)
        .filter((name: string) => {
          const key = name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function getCityFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 71 && code <= 75) return 'Snow';
  if (code === 77) return 'Snow Grains';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

// Function to fetch weather data
export async function fetchWeather(city: string): Promise<WeatherData | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error('City not found');

    const { latitude, longitude, name, country_code } = geoData.results[0];

    // Fetch comprehensive forecast: current + hourly (48h) + daily (7 days)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,visibility,uv_index` +
      `&hourly=temperature_2m,precipitation_probability,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max` +
      `&forecast_days=7&timezone=auto`
    );
    const wd = await weatherRes.json();

    const cur = wd.current;
    const hourly = wd.hourly;
    const daily = wd.daily;

    // Derive betting signals
    const todayMaxTemp = daily.temperature_2m_max[0];
    const todayMinTemp = daily.temperature_2m_min[0];
    const weekAvgMax = daily.temperature_2m_max.reduce((a: number, b: number) => a + b, 0) / daily.temperature_2m_max.length;
    const tempAnomaly = Math.round((todayMaxTemp - weekAvgMax) * 10) / 10;
    const maxPrecipProb = daily.precipitation_probability_max[0] || 0;
    const stormRisk = maxPrecipProb >= 70 ? 'high' : maxPrecipProb >= 40 ? 'moderate' : 'low';

    // Hourly — next 24 slices
    const hourlyPoints: HourlyPoint[] = hourly.time.slice(0, 24).map((t: string, i: number) => ({
      time: new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temp: Math.round(hourly.temperature_2m[i]),
      precipProb: hourly.precipitation_probability[i] || 0,
      weatherCode: hourly.weather_code[i] || 0,
    }));

    // Daily 7-day
    const dailyPoints: DailyForecast[] = daily.time.map((t: string, i: number) => ({
      date: new Date(t).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      precipProb: daily.precipitation_probability_max[i] || 0,
      precipSum: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
      weatherCode: daily.weather_code[i] || 0,
      description: getWeatherDescription(daily.weather_code[i] || 0),
    }));

    return {
      city: name,
      country: country_code || '',
      temp: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      description: getWeatherDescription(cur.weather_code),
      weatherCode: cur.weather_code,
      precipitationProb: cur.precipitation_probability || 0,
      windSpeed: Math.round(cur.wind_speed_10m),
      windDirection: cur.wind_direction_10m || 0,
      humidity: cur.relative_humidity_2m,
      visibility: Math.round((cur.visibility || 10000) / 1000),
      uvIndex: cur.uv_index || 0,
      hourly: hourlyPoints,
      daily: dailyPoints,
      signals: {
        tempAnomaly,
        stormRisk: stormRisk as 'low' | 'moderate' | 'high',
        extremeHeatRisk: todayMaxTemp >= 35,
        extremeColdRisk: todayMinTemp <= 0,
        todayMaxTemp: Math.round(todayMaxTemp),
        todayMinTemp: Math.round(todayMinTemp),
      },
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export async function fetchPolymarketEvents(city: string, tab: 'temperature' | 'events'): Promise<PolymarketEvent[]> {
  try {
    const cityName = city.split(',')[0].trim();
    const res = await fetch(`/api/polymarket?city=${encodeURIComponent(cityName)}&tab=${tab}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      volume: event.volume || 0,
      endDate: event.endDate || '',
      outcomes: ['Yes', 'No'],
      outcomePrices: event.outcomePrices || [0, 0],
      image: event.image || null,
    }));
  } catch (error) {
    console.error('Failed to fetch Polymarket events:', error);
    return [];
  }
}