'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Droplets, Wind, Waves, Eye, Clock, 
  TrendingUp, Activity, ArrowRight, Sun, Cloud, 
  CloudRain, CloudLightning, CloudSnow, CloudFog 
} from 'lucide-react';

// Import fungsi dari lib/api.ts (Pastikan path ini sesuai dengan struktur folder kamu)
import { fetchWeather, fetchPolymarketEvents, getCityFromCoordinates, WeatherData, PolymarketEvent } from '@/lib/api';

// Helper: Mengubah WMO Code dari API cuaca menjadi icon Lucide yang elegan
const WeatherIcon = ({ code, className }: { code: number, className?: string }) => {
  if (code === 0) return <Sun className={className} />;
  if (code >= 1 && code <= 3) return <Cloud className={className} />;
  if (code >= 45 && code <= 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
  if (code >= 80 && code <= 99) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
};

export default function DashboardTerminal() {
  const [searchInput, setSearchInput] = useState('Denpasar');
  const [debouncedQuery, setDebouncedQuery] = useState('Denpasar');
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [markets, setMarkets] = useState<PolymarketEvent[]>([]);
  
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);

  // Auto-detect user location on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoordinates(latitude, longitude);
          if (city) {
            setSearchInput(city.split(" ")[0]); // Ambil kata pertama saja jika terlalu panjang
            setDebouncedQuery(city.split(" ")[0]);
          }
        },
        (error) => {
          console.log("Location access denied or error:", error);
        }
      );
    }
  }, []);

  // Debounce logic: Menunda API call sampai user selesai mengetik selama 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== '') {
        setDebouncedQuery(searchInput);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Data Dinamis setiap kali debouncedQuery berubah
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingWeather(true);
      setIsLoadingMarkets(true);

      try {
        // Fetch Cuaca
        const weatherData = await fetchWeather(debouncedQuery);
        setWeather(weatherData);
        setIsLoadingWeather(false);

        // Fetch Polymarket (Gunakan nama kota sebagai keyword pencarian di market)
        const marketData = await fetchPolymarketEvents(debouncedQuery);
        setMarkets(marketData);
        setIsLoadingMarkets(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoadingWeather(false);
        setIsLoadingMarkets(false);
      }
    };

    loadData();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col h-screen overflow-hidden selection:bg-blue-200">
      
      {/* Top Navigation Bar - Light Theme */}
      <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Terminal Control
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-600 font-medium">Polygon Network</span>
          </div>
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Main Terminal Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ========================================= */}
        {/* LEFT PANEL: MOUSAM WEATHER UI (DATA TIER) */}
        {/* ========================================= */}
        <section className="flex-1 bg-slate-50 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              placeholder="Search city for weather analysis..."
            />
            {isLoadingWeather && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            )}
          </div>

          {!weather && !isLoadingWeather ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
              <CloudFog className="w-12 h-12" />
              <p>Weather data not found for this location.</p>
            </div>
          ) : (
            <div className={`transition-opacity duration-500 ${isLoadingWeather ? 'opacity-50' : 'opacity-100'}`}>
              
              {/* Current Weather Widget (Clean Adwaita Style) */}
              <div className="bg-gradient-to-br from-white to-blue-50/50 border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden mb-6">
                <div className="absolute top-8 right-8 text-blue-100 pointer-events-none">
                  <WeatherIcon code={weather?.weatherCode || 0} className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-1">{weather?.city || 'Loading...'}</h2>
                  <p className="text-slate-500 mb-8 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Current
                  </p>
                  
                  <div className="flex items-end gap-4">
                    <span className="text-7xl font-bold tracking-tighter text-slate-800">{weather?.temp || 0}°</span>
                    <span className="text-2xl text-slate-500 font-medium mb-2">C</span>
                  </div>
                  <p className="text-xl text-blue-600 font-semibold mt-2">{weather?.description || '...'}</p>
                </div>
              </div>

              {/* Essential Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" /> Rain Probability
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{weather?.precipitationProb || 0}%</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-500" /> Wind Speed
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{weather?.windSpeed || 0} <span className="text-sm text-slate-500">km/h</span></span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-500" /> Humidity
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{weather?.humidity || 0}%</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" /> Visibility
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{weather?.visibility || 0} <span className="text-sm text-slate-500">km</span></span>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-slate-800 font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Hourly Forecast
                </h3>
                <div className="flex justify-between items-center overflow-x-auto gap-6 pb-2 custom-scrollbar">
                  {weather?.hourly?.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 min-w-[60px]">
                      <span className="text-sm font-medium text-slate-500">{item.time}</span>
                      {/* Mapping back icon string from API to Lucide, or use WMO code directly if API updated */}
                      <WeatherIcon code={0} className="w-6 h-6 text-slate-700" /> 
                      <span className="font-bold text-slate-800 text-lg">{item.temp}°</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </section>

        {/* ========================================= */}
        {/* RIGHT PANEL: POLYMARKET UI (EXECUTION) */}
        {/* ========================================= */}
        <section className="w-full lg:w-[480px] bg-white border-l border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Market Execution
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">Live</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">
              Displaying active markets for <strong className="text-slate-800">{debouncedQuery}</strong>. Execute positions based on probability data in the left panel.
            </p>
          </div>

          <div className="space-y-4">
            {isLoadingMarkets ? (
               <div className="flex justify-center py-10">
                 <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : markets.length === 0 ? (
               <div className="text-center py-10 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                 <p className="text-sm">No relevant active betting markets for this location on Polymarket currently.</p>
               </div>
            ) : (
              markets.map((market) => (
                <div key={market.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-[15px] leading-snug mb-4">{market.title}</h3>
                  
                  <div className="flex items-center justify-between text-xs mb-4 font-medium">
                    <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">Vol: ${(market.volume / 1000).toFixed(1)}k</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Ends: {market.endDate}</span>
                  </div>
                  
                  {/* Odds Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex justify-between items-center px-4 py-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group">
                      <span className="font-bold text-blue-600">Yes</span>
                      <span className="font-mono font-medium text-slate-700">{market.outcomePrices[0] || 0}¢</span>
                    </button>
                    <button className="flex justify-between items-center px-4 py-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-xl transition-all group">
                      <span className="font-bold text-red-500">No</span>
                      <span className="font-mono font-medium text-slate-700">{market.outcomePrices[1] || 0}¢</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}