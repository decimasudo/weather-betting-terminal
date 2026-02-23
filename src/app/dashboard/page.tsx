'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, Droplets, Wind, Waves, Eye, 
  TrendingUp, ArrowRight, Sun, Cloud, 
  CloudRain, CloudLightning, CloudSnow, CloudFog, Cpu,
  ThermometerSun, AlertTriangle, ChevronDown, MapPin
} from 'lucide-react';
import { fetchWeather, fetchCitySuggestions, WeatherData } from '@/lib/api';
import { InteractiveBackground } from '@/components/interactive-background';

// Daftar kota besar default untuk Dropdown (Bisa ditambah sesuai kebutuhan)
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
  const [activeTab, setActiveTab] = useState<'temperature' | 'events'>('temperature');
  
  // State untuk Combobox / Dropdown Kota
  const [searchInput, setSearchInput] = useState('London');
  const [debouncedQuery, setDebouncedQuery] = useState('London');
  const [suggestions, setSuggestions] = useState<string[]>(MAJOR_CITIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [markets, setMarkets] = useState<any[]>([]); // Menggunakan any lokal agar fleksibel menangkap image API
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle klik di luar dropdown untuk menutupnya
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce logic untuk Search Input
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim() !== '') {
        setDebouncedQuery(searchInput); // Update query utama
        
        // Fetch suggestions only if query length > 2
        if (searchInput.length > 2) {
           try {
             const results = await fetchCitySuggestions(searchInput);
             // Prefer results, fallback to MAJOR_CITIES if empty to not show blank list
             setSuggestions(results.length > 0 ? results : MAJOR_CITIES);
           } catch (e) {
             setSuggestions(MAJOR_CITIES);
           }
        } else {
          setSuggestions(MAJOR_CITIES);
        }
      } else {
        setSuggestions(MAJOR_CITIES);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Effect 1: Weather only — re-runs when city changes, never touches markets
  useEffect(() => {
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const weatherData = await fetchWeather(debouncedQuery);
        setWeather(weatherData);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };
    loadWeather();
  }, [debouncedQuery]); // city-only dependency

  // Effect 2: Markets only — re-runs when tab changes, never re-runs on city change
  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoadingMarkets(true);
      try {
        const res = await fetch(`/api/polymarket?tab=${activeTab}`);
        const rawMarketData = await res.json();

        if (Array.isArray(rawMarketData)) {
          const formattedMarkets = rawMarketData.map((event: any) => {
            const primaryMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
            let prices = [0, 0];
            if (primaryMarket && primaryMarket.outcomePrices) {
              try { prices = JSON.parse(primaryMarket.outcomePrices); } catch(e){}
            }
            return {
              id: event.id,
              title: event.title,
              volume: event.volume || 0,
              endDate: new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              outcomePrices: prices.map((p: any) => Math.round(Number(p) * 100)),
              image: event.image || event.icon || null,
            };
          });
          setMarkets(formattedMarkets);
        } else {
          setMarkets([]);
        }
      } catch (error) {
        console.error('Markets fetch error:', error);
        setMarkets([]);
      } finally {
        setIsLoadingMarkets(false);
      }
    };
    loadMarkets();
  }, [activeTab]); // tab-only dependency — city changes are intentionally excluded

  // Filter kota untuk Dropdown Suggestion
  const filteredCities = suggestions;

  return (
    <div className="min-h-screen font-share-tech flex flex-col h-screen overflow-hidden selection:bg-primary/30 relative text-foreground">
      
      {/* Background Interactive Animasi (Cyberpunk Pattern) */}
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
              <Cpu className="w-5 h-5" /> CHANI_CORE_TERMINAL
            </span>
          </div>
          
          {/* TAB NAVIGATION MODUL */}
          <div className="hidden lg:flex bg-background/50 border border-primary/30 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setActiveTab('temperature')}
              className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase rounded flex items-center gap-2 transition-all ${activeTab === 'temperature' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'text-primary/50 hover:text-primary hover:bg-primary/10'}`}
            >
              <ThermometerSun className="w-4 h-4" /> Daily_Temp
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase rounded flex items-center gap-2 transition-all ${activeTab === 'events' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] border border-indigo-500/30' : 'text-primary/50 hover:text-primary hover:bg-primary/10'}`}
            >
              <CloudLightning className="w-4 h-4" /> Weather_Events
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-5 py-2 bg-transparent border border-primary text-primary hover:bg-primary hover:text-background text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]">
              Connect_Wallet
            </button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* LEFT PANEL: DATA INTEL & SEARCH */}
          <section className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 border-r border-primary/20 bg-background/40 backdrop-blur-sm">
            
            {/* AGENT IDENTITY WIDGET (CHANI AVATAR) */}
            <div className="flex items-center justify-between p-4 border border-primary/30 bg-surface/60 rounded-xl relative overflow-hidden group">
               {/* Animated grid background */}
               <div className="absolute inset-0 bg-grid-mecha opacity-10 pointer-events-none" />
               {/* Glow sweep */}
               <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                 style={{ background: 'linear-gradient(120deg, transparent, rgba(0,212,255,0.06), transparent)' }} />
               
               <div className="flex items-center gap-4 relative z-10">
                  {/* Avatar with scan line */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden relative shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.9)] transition-all duration-500">
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
                      <img src="/char.jpeg" alt="CHANI AI" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 w-full h-[20%] bg-primary/30 opacity-50 pointer-events-none animate-hologram-scan z-20" />
                    </div>
                    {/* Online pulse ring */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>

                  <div>
                    <h3 className="text-primary font-bold text-sm tracking-widest text-glow flex items-center gap-2">
                      AGENT_CHANI
                      <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono">AI v2.1</span>
                    </h3>
                    <p className="text-[9px] text-primary/50 tracking-[0.2em] font-mono uppercase mt-0.5">
                      ORACLE_NODE // {isLoadingWeather ? (
                        <span className="text-amber-400 animate-pulse">SCANNING...</span>
                      ) : weather ? (
                        <span className="text-emerald-400">DATA_LOCKED</span>
                      ) : (
                        <span className="text-red-400">AWAITING_CMD</span>
                      )}
                    </p>
                    {/* Live status pills */}
                    {weather?.signals && !isLoadingWeather && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border tracking-widest ${
                          weather.signals.stormRisk === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' :
                          weather.signals.stormRisk === 'moderate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>⬤ STORM:{weather.signals.stormRisk.toUpperCase()}</span>
                        {weather.signals.extremeHeatRisk && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse">⚠ EXTREME_HEAT</span>}
                        {weather.signals.extremeColdRisk && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse">⚠ EXTREME_COLD</span>}
                        {!weather.signals.extremeHeatRisk && !weather.signals.extremeColdRisk && !isLoadingMarkets && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border bg-primary/10 text-primary/60 border-primary/20">
                            {markets.length} MARKETS_LIVE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
               </div>

               {/* Right side: current city intel */}
               <div className="hidden md:flex flex-col items-end gap-1 relative z-10 shrink-0">
                 {weather && !isLoadingWeather ? (
                   <>
                     <p className="text-[9px] font-mono text-primary/40 tracking-[0.2em] uppercase">ACTIVE_NODE</p>
                     <p className="text-sm font-bold font-mono text-primary text-glow tracking-widest">{weather.city.toUpperCase()}</p>
                     <p className="text-[10px] font-mono text-white/60">{weather.temp}°C · {weather.description}</p>
                     <p className="text-[8px] font-mono text-primary/30 tracking-widest">{activeTab === 'temperature' ? 'MODE: TEMP_ANALYSIS' : 'MODE: EVENT_WATCH'}</p>
                   </>
                 ) : (
                   <>
                     <p className="text-[9px] font-mono text-primary/40 tracking-[0.2em] uppercase">AWAITING</p>
                     <div className="flex gap-0.5">
                       {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: `${i*150}ms`}} />)}
                     </div>
                   </>
                 )}
               </div>
            </div>

            {/* COMBOBOX SEARCH (Global Cities) */}
            <div className="relative max-w-2xl z-50" ref={dropdownRef}>
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
                  placeholder="ENTER_GLOBAL_CITY..."
                />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Suggestions */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-primary/40 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city, idx) => (
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
                    ))
                  ) : (
                    <div className="px-5 py-4 text-primary/50 font-mono text-xs tracking-widest uppercase">
                      Search custom city: <span className="text-white font-bold">"{searchInput}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WEATHER DATA RENDER */}
            {!weather && !isLoadingWeather ? (
              <div className="flex-1 flex items-center justify-center text-primary/50 flex-col gap-3 font-mono border border-dashed border-primary/20 rounded-xl bg-surface/30">
                <CloudFog className="w-12 h-12 opacity-50" />
                <p className="tracking-widest">TARGET_DATA_NOT_FOUND</p>
              </div>
            ) : (
              <div className={`transition-opacity duration-500 ${isLoadingWeather ? 'opacity-30' : 'opacity-100'} flex flex-col gap-4`}>

                {/* === HERO: Current Conditions === */}
                <div className={`backdrop-blur-md border p-6 relative overflow-hidden rounded-2xl ${activeTab === 'events' ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-surface/60 border-primary/30'}`}>
                  <div className={`absolute top-4 right-4 pointer-events-none ${activeTab === 'events' ? 'text-indigo-500/10' : 'text-primary/10'}`}>
                    <WeatherIcon code={weather?.weatherCode || 0} className="w-36 h-36" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-primary/50 text-[10px] tracking-[0.3em] font-mono uppercase mb-1">{weather?.country || ''} // LIVE</p>
                        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{weather?.city || 'Scanning...'}</h2>
                      </div>
                      {weather?.signals && (
                        <div className={`px-2 py-1 text-[9px] font-bold tracking-widest rounded border font-mono ${
                          weather.signals.stormRisk === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' :
                          weather.signals.stormRisk === 'moderate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        }`}>
                          STORM: {(weather.signals.stormRisk || '').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-end gap-3 mt-4 mb-1">
                      <span className={`text-6xl font-bold tracking-tighter ${activeTab === 'events' ? 'text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'text-primary drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]'}`}>
                        {weather?.temp ?? 0}°C
                      </span>
                      <div className="mb-2 flex flex-col gap-0.5">
                        <span className="text-[10px] text-primary/50 font-mono tracking-widest">FEELS {weather?.feelsLike ?? 0}°C</span>
                        <span className="text-[10px] text-primary/50 font-mono tracking-widest">UV: {weather?.uvIndex ?? 0}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 uppercase tracking-widest">{weather?.description || '...'}</p>

                    {/* Today Min/Max bar */}
                    {weather?.signals && (
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-[10px] font-mono text-blue-400 tracking-widest">↓{weather.signals.todayMinTemp}°</span>
                        <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-primary to-orange-400 rounded-full"
                            style={{ width: `${Math.min(100, ((weather.temp - weather.signals.todayMinTemp) / Math.max(1, weather.signals.todayMaxTemp - weather.signals.todayMinTemp)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-orange-400 tracking-widest">↑{weather.signals.todayMaxTemp}°</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* === STATS GRID === */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Droplets,    label: 'PRECIP',   val: `${weather?.precipitationProb ?? 0}%`,   hi: (weather?.precipitationProb ?? 0) > 50 },
                    { icon: Wind,        label: 'WIND',     val: `${weather?.windSpeed ?? 0} km/h`,        hi: (weather?.windSpeed ?? 0) > 30 },
                    { icon: Waves,       label: 'HUMIDITY', val: `${weather?.humidity ?? 0}%`,             hi: false },
                    { icon: Eye,         label: 'VISIB.',   val: `${weather?.visibility ?? 0} km`,         hi: (weather?.visibility ?? 10) < 3 },
                  ].map((c, i) => (
                    <div key={i} className={`bg-surface/50 border rounded-xl p-3 flex flex-col gap-1 ${c.hi ? 'border-amber-500/40' : 'border-primary/20'}`}>
                      <c.icon className={`w-3.5 h-3.5 ${c.hi ? 'text-amber-400' : 'text-primary/60'}`} />
                      <span className="text-[9px] text-primary/40 tracking-widest font-mono">{c.label}</span>
                      <span className="text-sm font-bold text-white font-mono">{c.val}</span>
                    </div>
                  ))}
                </div>

                {/* === BETTING SIGNALS === */}
                {weather?.signals && (
                  <div className={`border rounded-xl p-4 ${activeTab === 'temperature' ? 'bg-primary/5 border-primary/30' : 'bg-indigo-900/10 border-indigo-500/30'}`}>
                    <p className="text-[9px] font-mono text-primary/50 tracking-[0.3em] uppercase mb-3">// BETTING_SIGNALS</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-primary/60 tracking-widest">TEMP ANOMALY vs 7-DAY AVG</span>
                        <span className={`text-xs font-bold font-mono ${weather.signals.tempAnomaly > 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                          {weather.signals.tempAnomaly > 0 ? '+' : ''}{weather.signals.tempAnomaly}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-primary/60 tracking-widest">TODAY RANGE</span>
                        <span className="text-xs font-bold font-mono text-white">{weather.signals.todayMinTemp}° – {weather.signals.todayMaxTemp}°C</span>
                      </div>
                      {weather.signals.extremeHeatRisk && (
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-[9px] font-mono tracking-widest">
                          <AlertTriangle className="w-3 h-3" /> EXTREME HEAT RISK — Temp ≥ 35°C
                        </div>
                      )}
                      {weather.signals.extremeColdRisk && (
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-[9px] font-mono tracking-widest">
                          <AlertTriangle className="w-3 h-3" /> EXTREME COLD RISK — Temp ≤ 0°C
                        </div>
                      )}
                      {activeTab === 'events' && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-primary/60 tracking-widest">DAILY PRECIP SUM</span>
                          <span className={`text-xs font-bold font-mono ${(weather.daily?.[0]?.precipSum ?? 0) > 10 ? 'text-indigo-400' : 'text-primary/80'}`}>
                            {weather.daily?.[0]?.precipSum ?? 0} mm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* === HOURLY FORECAST (24h) === */}
                {activeTab === 'temperature' ? (
                  <div className="bg-surface/40 border border-primary/20 rounded-xl p-4">
                    <p className="text-[9px] font-mono text-primary/50 tracking-[0.3em] uppercase mb-3">// HOURLY_TEMP_24H</p>
                    {/* Mini sparkline bar chart */}
                    <div className="flex items-end gap-1 h-16 mb-2">
                      {weather?.hourly?.map((h, i) => {
                        const allTemps = weather.hourly.map(x => x.temp);
                        const minT = Math.min(...allTemps);
                        const maxT = Math.max(...allTemps);
                        const pct = maxT === minT ? 50 : Math.round(((h.temp - minT) / (maxT - minT)) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                            <div
                              className="w-full bg-primary/40 hover:bg-primary rounded-sm transition-all cursor-default"
                              style={{ height: `${Math.max(8, pct)}%` }}
                            />
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-white font-mono opacity-0 group-hover:opacity-100 bg-surface/90 px-1 rounded pointer-events-none whitespace-nowrap">
                              {h.time}<br/>{h.temp}°
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[8px] text-primary/30 font-mono">
                      <span>{weather?.hourly?.[0]?.time}</span>
                      <span>{weather?.hourly?.[6]?.time}</span>
                      <span>{weather?.hourly?.[12]?.time}</span>
                      <span>{weather?.hourly?.[18]?.time}</span>
                      <span>{weather?.hourly?.[23]?.time}</span>
                    </div>
                  </div>
                ) : (
                  /* Events tab: precip probability bars */
                  <div className="bg-surface/40 border border-indigo-500/20 rounded-xl p-4">
                    <p className="text-[9px] font-mono text-primary/50 tracking-[0.3em] uppercase mb-3">// PRECIP_PROBABILITY_24H</p>
                    <div className="flex items-end gap-1 h-16 mb-2">
                      {weather?.hourly?.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                          <div
                            className={`w-full rounded-sm transition-all cursor-default ${h.precipProb > 70 ? 'bg-indigo-400' : h.precipProb > 40 ? 'bg-indigo-500/60' : 'bg-primary/20'}`}
                            style={{ height: `${Math.max(4, h.precipProb)}%` }}
                          />
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-white font-mono opacity-0 group-hover:opacity-100 bg-surface/90 px-1 rounded pointer-events-none whitespace-nowrap">
                            {h.time}: {h.precipProb}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-primary/30 font-mono">
                      <span>{weather?.hourly?.[0]?.time}</span>
                      <span>{weather?.hourly?.[6]?.time}</span>
                      <span>{weather?.hourly?.[12]?.time}</span>
                      <span>{weather?.hourly?.[18]?.time}</span>
                      <span>{weather?.hourly?.[23]?.time}</span>
                    </div>
                  </div>
                )}

                {/* === 7-DAY DAILY FORECAST === */}
                <div className="bg-surface/40 border border-primary/20 rounded-xl p-4">
                  <p className="text-[9px] font-mono text-primary/50 tracking-[0.3em] uppercase mb-3">// 7-DAY_FORECAST</p>
                  <div className="space-y-1.5">
                    {weather?.daily?.map((d, i) => (
                      <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-primary/5'}`}>
                        <span className="text-[10px] font-mono text-primary/60 w-20 tracking-wider">{i === 0 ? 'TODAY' : d.date.split(',')[0].toUpperCase()}</span>
                        <WeatherIcon code={d.weatherCode} className="w-4 h-4 text-primary/60 shrink-0" />
                        <span className="text-[10px] font-mono text-white/60 flex-1 hidden md:block truncate">{d.description}</span>
                        {/* Precip probability pill */}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded w-10 text-center ${d.precipProb > 60 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-primary/10 text-primary/40'}`}>
                          {d.precipProb}%
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[11px] font-bold font-mono text-blue-400">{d.minTemp}°</span>
                          <span className="text-primary/20 text-[10px]">/</span>
                          <span className="text-[11px] font-bold font-mono text-orange-400">{d.maxTemp}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* RIGHT PANEL: POLYMARKET UI WITH IMAGES */}
          <section className="w-full lg:w-[500px] bg-surface/80 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] border-l border-primary/30">
            <div className="flex items-center justify-between pb-4 border-b border-primary/30">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-widest uppercase">
                <TrendingUp className={`w-5 h-5 ${activeTab === 'events' ? 'text-red-400' : 'text-primary'}`} />
                {activeTab === 'events' ? 'EXTREME_MARKETS' : 'TEMP_MARKETS'}
              </h2>
              {isLoadingMarkets && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>

            <div className="space-y-4">
              {!isLoadingMarkets && markets.length === 0 ? (
                 <div className="text-center py-12 text-primary/40 border border-dashed border-primary/20 font-mono text-xs tracking-widest rounded-xl bg-black/20">
                   NO_ACTIVE_MARKETS_FOUND<br/>FOR_CURRENT_PARAMETERS
                 </div>
              ) : (
                markets.map((market) => (
                  <div key={market.id} className="bg-black/60 border border-primary/20 hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.05)] rounded-xl overflow-hidden group">
                    {/* Market Layout dengan Gambar */}
                    <div className="flex items-start p-4 gap-4">
                      {/* Thumbnail Market (Menggunakan gambar API jika ada) */}
                      <div className="w-16 h-16 shrink-0 rounded-lg bg-surface border border-primary/30 overflow-hidden flex items-center justify-center relative">
                        {market.image ? (
                          <img src={market.image} alt="market icon" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <TrendingUp className="w-6 h-6 text-primary/30" />
                        )}
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
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

                    {/* Execution Buttons */}
                    <div className="grid grid-cols-2 gap-px bg-primary/20 border-t border-primary/20">
                      <button className="flex justify-between items-center px-5 py-3 bg-surface/80 hover:bg-primary/20 transition-all">
                        <span className="font-bold text-cyan-400 uppercase tracking-widest text-xs text-glow">Yes</span>
                        <span className="font-mono text-white font-bold">{market.outcomePrices[0] || 0}¢</span>
                      </button>
                      <button className="flex justify-between items-center px-5 py-3 bg-surface/80 hover:bg-red-500/20 transition-all">
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