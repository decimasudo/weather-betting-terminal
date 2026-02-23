// src/lib/api.ts (Update bagian ini saja)

// Define types
export interface WeatherData {
  city: string;
  temp: number;
  description: string;
  weatherCode: number;
  precipitationProb: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  hourly: { time: string; temp: number }[];
}

export interface PolymarketEvent {
  id: string;
  title: string;
  volume: number;
  endDate: string;
  outcomes: string[];
  outcomePrices: number[];
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

// Function to fetch weather data
export async function fetchWeather(city: string): Promise<WeatherData | null> {
  try {
    // First, geocode the city to get lat/lon
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }
    
    const { latitude, longitude, name } = geoData.results[0];
    
    // Fetch weather data from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,visibility&hourly=temperature_2m&forecast_days=1`
    );
    const weatherData = await weatherRes.json();
    
    // Map WMO code to description
    const getWeatherDescription = (code: number): string => {
      if (code === 0) return 'Clear sky';
      if (code === 1) return 'Mainly clear';
      if (code === 2) return 'Partly cloudy';
      if (code === 3) return 'Overcast';
      if (code >= 45 && code <= 48) return 'Fog';
      if (code >= 51 && code <= 55) return 'Drizzle';
      if (code >= 56 && code <= 57) return 'Freezing drizzle';
      if (code >= 61 && code <= 65) return 'Rain';
      if (code >= 66 && code <= 67) return 'Freezing rain';
      if (code >= 71 && code <= 75) return 'Snow';
      if (code === 77) return 'Snow grains';
      if (code >= 80 && code <= 82) return 'Rain showers';
      if (code >= 85 && code <= 86) return 'Snow showers';
      if (code >= 95 && code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };
    
    const current = weatherData.current;
    const hourly = weatherData.hourly;
    
    return {
      city: name,
      temp: Math.round(current.temperature_2m),
      description: getWeatherDescription(current.weather_code),
      weatherCode: current.weather_code,
      precipitationProb: current.precipitation_probability || 0,
      windSpeed: Math.round(current.wind_speed_10m),
      humidity: current.relative_humidity_2m,
      visibility: Math.round((current.visibility || 10000) / 1000), // Convert to km
      hourly: hourly.time.slice(0, 24).map((time: string, i: number) => ({
        time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(hourly.temperature_2m[i])
      }))
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export async function fetchPolymarketEvents(keyword: string): Promise<PolymarketEvent[]> {
  try {
    // HIT KE INTERNAL API NEXT.JS (Proxy), bukan langsung ke Gamma API
    const res = await fetch(`/api/polymarket?query=${keyword}`);
    const data = await res.json();

    // Jika terjadi error dari proxy atau data bukan array, kembalikan array kosong
    if (data.error || !Array.isArray(data)) return [];

    return data.map((event: any) => {
      const primaryMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
      let prices = [0, 0];
      let outcomes = ["Yes", "No"];

      if (primaryMarket) {
        try {
          // Parsing harga dan string outcome
          if (primaryMarket.outcomePrices) prices = JSON.parse(primaryMarket.outcomePrices);
          if (primaryMarket.outcomes) outcomes = JSON.parse(primaryMarket.outcomes);
        } catch (e) {
          console.warn("Gagal parse data market:", e);
        }
      }

      return {
        id: event.id,
        title: event.title,
        volume: event.volume || 0,
        endDate: new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        outcomes: outcomes,
        // Ubah format harga ke cents (misal: 0.82 jadi 82)
        outcomePrices: prices.map((p: any) => Math.round(Number(p) * 100)), 
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data Polymarket via Proxy:", error);
    return [];
  }
}