'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, Droplets, Wind, Waves, Eye, Clock, 
  TrendingUp, ArrowRight, Sun, Cloud, Globe,
  CloudRain, CloudLightning, CloudSnow, CloudFog, Cpu,
  ThermometerSun, ChevronDown, MapPin
} from 'lucide-react';
import { fetchWeather, fetchCitySuggestions, WeatherData } from '@/lib/api';
import { InteractiveBackground } from '@/components/interactive-background';

const MAJOR_CITIES = [
  "London", "New York", "Tokyo", "Seoul", "Paris", 
  "Jakarta", "Atlanta", "Los Angeles", "Dubai", "Sydney", "Moscow"
];

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
  // DEFAULT CITY = LONDON
  const [searchInput, setSearchInput] = useState('London');
  const [debouncedQuery, setDebouncedQuery] = useState('London');
  
  // Tab sekarang HANYA untuk Polymarket (Decoupled)
  const [activeTab, setActiveTab] = useState<'temperature' | 'events'>('temperature');
  
  const [suggestions, setSuggestions] = useState<string[]>(MAJOR_CITIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Jika kosong, kembalikan ke London secara default agar UI tidak kosong
      const finalQuery = searchInput.trim() === '' ? 'London' : searchInput.trim();
      setDebouncedQuery(finalQuery);
      
      if (finalQuery.length > 2) {
         try {
           const results = await fetchCitySuggestions(finalQuery);
           setSuggestions(results.length > 0 ? results : MAJOR_CITIES);
         } catch (e) {
           setSuggestions(MAJOR_CITIES);
         }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // EFFECT 1: FETCH WEATHER (Hanya bereaksi pada perubahan kota)
  useEffect(() => {
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const weatherData = await fetchWeather(debouncedQuery);
        setWeather(weatherData);
      } catch (error) {
        console.error("Fetch Weather Error", error);
        setWeather(null);
      } finally {
        setIsLoadingWeather(false);
      }
    };
    loadWeather();
  }, [debouncedQuery]);

  // EFFECT 2: FETCH POLYMARKET (Bereaksi pada perubahan kota ATAU tab)
  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoadingMarkets(true);
      try {
        const res = await fetch(`/api/polymarket?tab=${activeTab}&city=${encodeURIComponent(debouncedQuery)}`);
        const marketData = await res.json();
        setMarkets(Array.isArray(marketData) ? marketData : []);
      } catch (error) {
        console.error("Fetch Market Error", error);
        setMarkets([]);
      } finally {
        setIsLoadingMarkets(false);
      }
    };
    loadMarkets();
  }, [debouncedQuery, activeTab]); // Akan refetch jika kota atau tab berganti

  return (
    <div className="min-h-screen font-share-tech flex flex-col h-screen overflow-hidden selection:bg-primary/30 relative text-foreground bg-[#0a0a0a]">
      <InteractiveBackground />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Navbar */}
        <nav className="h-16 border-b border-primary/20 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_4px_30px_rgba(0,212,255,0.1)]">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary/70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div className="h-4 w-px bg-primary/30"></div>
            <span className="font-bold text-primary flex items-center gap-2 tracking-widest uppercase text-sm text-glow">
              <Cpu className="w-5 h-5" /> CHANI_CORE
            </span>
          </div>

          <button className="px-5 py-2 border border-primary text-primary hover:bg-primary hover:text-background text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            Connect_Wallet
          </button>
        </nav>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* LEFT PANEL: WEATHER DATA (STABLE, NOT AFFECTED BY TAB) */}
          <section className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 border-r border-primary/20 bg-background/40 backdrop-blur-sm">
            
            {/* SEARCH BAR WIDGET */}
            <div className="relative max-w-2xl z-50 w-full" ref={dropdownRef}>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchInput} 
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-surface/80 backdrop-blur-md border border-primary/40 text-white placeholder:text-primary/30 focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(0,212,255,0.4)] py-4 pl-12 pr-12 transition-all uppercase tracking-widest font-mono text-sm rounded-xl"
                  placeholder="SEARCH CITY (e.g. MOSCOW)..."
                />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-primary/40 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {suggestions.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchInput(city);
                        setDebouncedQuery(city);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-primary/20 text-white font-mono uppercase tracking-widest text-sm border-b border-primary/10 last:border-0 transition-colors flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-primary/50" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WEATHER DATA RENDER */}
            {isLoadingWeather ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-primary/20 rounded-2xl bg-surface/20">
                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : weather ? (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                <div className="backdrop-blur-md border border-primary/30 bg-surface/60 p-8 relative overflow-hidden rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.05)]">
                  <div className="absolute top-8 right-8 pointer-events-none text-primary/10">
                    <WeatherIcon code={weather.weatherCode || 0} className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-1 tracking-widest uppercase">{weather.city}</h2>
                    <p className="text-primary/70 mb-8 flex items-center gap-2 text-xs tracking-widest font-mono">
                      <Clock className="w-4 h-4" /> SYS.TIME: CURRENT
                    </p>
                    <div className="flex items-end gap-4">
                      <span className="text-7xl font-bold tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
                        {weather.temp || 0}°
                      </span>
                      <span className="text-2xl text-primary/50 font-medium mb-2">C</span>
                    </div>
                    <p className="text-xl text-white font-semibold mt-2 uppercase tracking-widest">{weather.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Droplets, label: 'PRECIP', val: `${weather.precipitationProb || 0}%` },
                    { icon: Wind, label: 'WIND', val: `${weather.windSpeed || 0} km/h` },
                    { icon: Waves, label: 'HUMIDITY', val: `${weather.humidity || 0}%` },
                    { icon: Eye, label: 'VISIBILITY', val: `${weather.visibility || 0} km` }
                  ].map((item, i) => (
                    <div key={i} className="bg-surface/60 backdrop-blur-sm border border-primary/20 p-5 rounded-xl">
                      <span className="text-xs tracking-widest font-medium mb-3 flex items-center gap-2 text-primary/60">
                        <item.icon className="w-4 h-4" /> {item.label}
                      </span>
                      <span className="text-xl font-bold text-white font-mono">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {/* RIGHT PANEL: POLYMARKET MARKETS (DYNAMIC TABS) */}
          <section className="w-full lg:w-[450px] bg-surface/80 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] border-l border-primary/30">
            
            <div className="flex flex-col gap-4 pb-4 border-b border-primary/30">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-widest uppercase">
                <TrendingUp className="w-5 h-5 text-primary" />
                {debouncedQuery} MARKETS
                {isLoadingMarkets && <span className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
              </h2>
              
              {/* TAB CONTROLS DI DALAM PANEL KANAN */}
              <div className="flex bg-background/50 border border-primary/30 rounded-lg p-1 gap-1">
                <button 
                  onClick={() => setActiveTab('temperature')}
                  className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded flex items-center justify-center gap-2 transition-all ${activeTab === 'temperature' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'text-primary/50 hover:text-primary'}`}
                >
                  <ThermometerSun className="w-4 h-4" /> Temp
                </button>
                <button 
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded flex items-center justify-center gap-2 transition-all ${activeTab === 'events' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] border border-indigo-500/30' : 'text-primary/50 hover:text-primary'}`}
                >
                  <CloudLightning className="w-4 h-4" /> Weather
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!isLoadingMarkets && markets.length === 0 ? (
                 <div className="text-center py-12 text-primary/40 border border-dashed border-primary/20 font-mono text-xs tracking-widest rounded-xl bg-black/20">
                   NO {activeTab.toUpperCase()} MARKETS FOUND<br/>FOR {debouncedQuery.toUpperCase()}
                 </div>
              ) : (
                markets.map((market) => (
                  <div key={market.id} className="bg-black/60 border border-primary/20 hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.05)] rounded-xl overflow-hidden group">
                    <div className="flex items-start p-4 gap-4">
                      <div className="w-16 h-16 shrink-0 rounded-lg bg-surface border border-primary/30 overflow-hidden flex items-center justify-center relative">
                        {market.image ? (
                          <img src={market.image} alt="market" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <Globe className="w-6 h-6 text-primary/30" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-[13px] leading-snug mb-2 font-sans">{market.title}</h3>
                        <div className="flex items-center gap-3 text-[9px] font-mono tracking-widest">
                          <span className="text-primary/80">VOL: ${(market.volume / 1000).toFixed(1)}K</span>
                          <span className="text-primary/40">•</span>
                          <span className="text-primary/80">EXP: {market.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-primary/20 border-t border-primary/20">
                      <button className="flex justify-between items-center px-4 py-3 bg-surface/80 hover:bg-primary/20 transition-all">
                        <span className="font-bold text-cyan-400 uppercase tracking-widest text-xs">Yes</span>
                        <span className="font-mono text-white font-bold">{market.outcomePrices[0] || 0}¢</span>
                      </button>
                      <button className="flex justify-between items-center px-4 py-3 bg-surface/80 hover:bg-red-500/20 transition-all">
                        <span className="font-bold text-red-400 uppercase tracking-widest text-xs">No</span>
                        <span className="font-mono text-white font-bold">{market.outcomePrices[1] || 0}¢</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}