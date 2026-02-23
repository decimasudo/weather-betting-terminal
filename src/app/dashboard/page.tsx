'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, Droplets, Wind, Waves, Eye, 
  TrendingUp, ArrowRight, Sun, Cloud, 
  CloudRain, CloudLightning, CloudSnow, CloudFog, Cpu,
  ThermometerSun, AlertTriangle, ChevronDown, MapPin, Globe
} from 'lucide-react';
import { fetchWeather, fetchCitySuggestions, WeatherData } from '@/lib/api';
import { InteractiveBackground } from '@/components/interactive-background';

// GLOBAL ditambahkan sebagai default pertama
const DEFAULT_WATCHLIST = [
  "GLOBAL", "New York", "London", "Chicago", "Miami", "Los Angeles", "Tokyo"
];

const MAJOR_CITIES = [
  "New York", "London", "Chicago", "Miami", "Los Angeles", "Tokyo",
  "Seoul", "Paris", "Jakarta", "Atlanta", "Dubai", "Sydney", "Moscow"
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
  
  // State for Watchlist, Default ke GLOBAL
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [selectedCity, setSelectedCity] = useState("GLOBAL");

  // Combobox states
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(MAJOR_CITIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim() !== '') {
        if (searchInput.length > 2) {
           try {
             const results = await fetchCitySuggestions(searchInput);
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

  // Effect: Fetch cuaca untuk kota di watchlist (KECUALI 'GLOBAL')
  useEffect(() => {
    const loadAllWeather = async () => {
      setIsLoadingWeather(true);
      const newMap: Record<string, WeatherData> = { ...weatherMap };
      let hasChanges = false;
      
      const citiesToFetch = watchlist.filter(c => c !== 'GLOBAL' && !newMap[c]); 
      
      if (citiesToFetch.length > 0) {
        await Promise.all(citiesToFetch.map(async (city) => {
           try {
             const wd = await fetchWeather(city);
             if (wd) {
               newMap[city] = wd;
               hasChanges = true;
             }
           } catch(e) { console.error("Error fetching city:", city) }
        }));
        if (hasChanges) {
          setWeatherMap(newMap);
        }
      }
      setIsLoadingWeather(false);
    };
    loadAllWeather();
  }, [watchlist]);

  // Effect: Load Markets 
  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoadingMarkets(true);
      try {
        // Jika GLOBAL, kirim string kosong agar API me-return semua data tanpa filter kota
        const cityName = selectedCity === 'GLOBAL' ? '' : selectedCity.split(',')[0];
        const res = await fetch(`/api/polymarket?city=${encodeURIComponent(cityName)}&tab=${activeTab}`);
        const rawMarketData = await res.json();

        if (Array.isArray(rawMarketData)) {
          setMarkets(rawMarketData);
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
  }, [activeTab, selectedCity]);

  const handleSelectCity = (city: string) => {
    if (!watchlist.includes(city)) {
      // Sisipkan setelah 'GLOBAL' (index 1)
      const newList = [...watchlist];
      newList.splice(1, 0, city);
      setWatchlist(newList);
    }
    setSelectedCity(city);
    setSearchInput('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen font-share-tech flex flex-col h-screen overflow-hidden selection:bg-primary/30 relative text-foreground">
      <InteractiveBackground />

      <div className="relative z-10 flex flex-col h-full">
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
          
          {/* LEFT PANEL: GLOBAL WATCHLIST */}
          <section className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 border-r border-primary/20 bg-background/40 backdrop-blur-sm">
            
            {/* AGENT IDENTITY WIDGET */}
            <div className="flex items-center justify-between p-4 border border-primary/30 bg-surface/60 rounded-xl relative overflow-hidden group shrink-0">
               <div className="absolute inset-0 bg-grid-mecha opacity-10 pointer-events-none" />
               <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                 style={{ background: 'linear-gradient(120deg, transparent, rgba(0,212,255,0.06), transparent)' }} />
               
               <div className="flex items-center gap-4 relative z-10">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden relative shadow-[0_0_15px_rgba(0,212,255,0.4)] bg-black/50 group-hover:shadow-[0_0_25px_rgba(0,212,255,0.8)] transition-all duration-500 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 pointer-events-none" />
                      <img src="/char.jpeg" alt="CHANI AI" className="w-[120%] h-[120%] object-cover object-center scale-90 rounded-full" />
                      <div className="absolute inset-0 w-full h-[30%] bg-primary/30 opacity-40 pointer-events-none animate-hologram-scan z-20" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-surface shadow-[0_0_8px_rgba(16,185,129,0.8)] z-30" />
                  </div>

                  <div>
                    <h3 className="text-primary font-bold text-sm tracking-widest text-glow flex items-center gap-2">
                      AGENT_CHANI
                      <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono">AI v2.1</span>
                    </h3>
                    <p className="text-[9px] text-primary/50 tracking-[0.2em] font-mono uppercase mt-0.5">
                      GLOBAL_RADAR_NODE // ACTIVE
                    </p>
                  </div>
               </div>

               <div className="hidden md:flex flex-col items-end gap-1 relative z-10 shrink-0">
                 <p className="text-[9px] font-mono text-primary/40 tracking-[0.2em] uppercase">SELECTED_NODE</p>
                 <p className="text-sm font-bold font-mono text-primary text-glow tracking-widest">{selectedCity.toUpperCase()}</p>
                 <p className="text-[8px] font-mono text-primary/30 tracking-widest">{activeTab === 'temperature' ? 'MODE: TEMP_ANALYSIS' : 'MODE: EVENT_WATCH'}</p>
               </div>
            </div>

            {/* COMBOBOX SEARCH */}
            <div className="relative z-50 shrink-0" ref={dropdownRef}>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchInput} 
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-surface/80 backdrop-blur-md border border-primary/40 text-white placeholder:text-primary/30 focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(0,212,255,0.4)] py-3 pl-12 pr-12 transition-all uppercase tracking-widest font-mono text-sm rounded-xl"
                  placeholder="ADD CITY TO WATCHLIST..."
                />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-primary/40 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {suggestions.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-5 py-3 hover:bg-primary/20 text-white font-mono uppercase tracking-widest text-sm border-b border-primary/10 last:border-0 transition-colors flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-primary/50" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7-DAY FORECAST WATCHLIST */}
            <div className="flex flex-col gap-3 pb-6">
              <h2 className="text-[10px] font-mono text-primary/50 tracking-[0.3em] uppercase pl-1">
                // WATCHLIST_NEXUS
              </h2>
              
              {isLoadingWeather && Object.keys(weatherMap).length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-primary/50 flex-col gap-3 font-mono border border-dashed border-primary/20 rounded-xl bg-surface/30 p-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="tracking-widest">SCANNING_ATMOSPHERE...</p>
                </div>
              ) : (
                watchlist.map((city) => {
                  const isSelected = selectedCity === city;

                  // Render spesial untuk kartu GLOBAL
                  if (city === 'GLOBAL') {
                    return (
                      <div 
                        key="GLOBAL"
                        onClick={() => setSelectedCity('GLOBAL')}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden mb-2 ${isSelected ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,212,255,0.2)]' : 'bg-surface/40 border-primary/20 hover:border-primary/50'}`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" />}
                        <div className="flex items-center gap-4 pl-2">
                          <div className="p-3 bg-primary/10 rounded-full border border-primary/30 group-hover:bg-primary/20 transition-colors">
                            <Globe className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-primary/70'}`} />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold tracking-widest uppercase ${isSelected ? 'text-primary text-glow' : 'text-white'}`}>
                              GLOBAL_RADAR
                            </h3>
                            <p className="text-[10px] text-primary/60 font-mono tracking-widest uppercase mt-1">SHOW ALL WORLDWIDE MARKETS</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render kartu kota reguler
                  const data = weatherMap[city];
                  if (!data) return null;

                  return (
                    <div 
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,212,255,0.15)]' : 'bg-surface/40 border-primary/20 hover:border-primary/50'}`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" />}
                      
                      <div className="flex justify-between items-start mb-4 pl-2">
                        <div>
                          <h3 className={`text-lg font-bold tracking-widest uppercase flex items-center gap-2 ${isSelected ? 'text-primary text-glow' : 'text-white'}`}>
                            {data.city}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold tracking-tighter text-white">{data.temp}°</span>
                            <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">{data.description}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {data.signals.stormRisk !== 'low' && (
                            <span className="px-2 py-0.5 text-[8px] font-bold text-red-400 bg-red-500/20 border border-red-500/50 rounded animate-pulse font-mono tracking-widest">
                              ⚠ STORM_RISK
                            </span>
                          )}
                          {(data.precipitationProb ?? 0) > 40 && (
                            <span className="px-2 py-0.5 text-[8px] font-bold text-indigo-400 bg-indigo-500/20 border border-indigo-500/50 rounded font-mono flex items-center gap-1">
                              <Droplets className="w-2 h-2" /> {data.precipitationProb}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 pl-2">
                        {data.daily.map((d, i) => (
                          <div key={i} className={`flex flex-col items-center p-2 rounded-lg min-w-[55px] shrink-0 border transition-colors ${i === 0 ? 'bg-primary/20 border-primary/40' : 'bg-black/40 border-primary/10 group-hover:border-primary/30'}`}>
                            <span className={`text-[9px] font-mono tracking-wider ${i === 0 ? 'text-primary font-bold' : 'text-primary/70'}`}>
                              {i === 0 ? 'TODAY' : d.date.split(',')[0].toUpperCase()}
                            </span>
                            <WeatherIcon code={d.weatherCode} className={`w-6 h-6 my-2 ${i === 0 ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-primary/80'}`} />
                            <div className="flex items-center gap-1.5 w-full justify-center">
                              <span className="text-[10px] font-bold text-blue-400">{d.minTemp}°</span>
                              <span className="text-[10px] font-bold text-orange-400">{d.maxTemp}°</span>
                            </div>
                            {activeTab === 'events' && d.precipProb > 20 && (
                               <div className="mt-1.5 text-[8px] text-indigo-400 font-mono tracking-tighter flex items-center gap-0.5 bg-indigo-500/10 px-1 rounded">
                                 <Droplets className="w-2 h-2" /> {d.precipProb}%
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT PANEL: POLYMARKET UI */}
          <section className="w-full lg:w-[500px] bg-surface/80 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] border-l border-primary/30">
            <div className="flex items-center justify-between pb-4 border-b border-primary/30 shrink-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-widest uppercase">
                <TrendingUp className={`w-5 h-5 ${activeTab === 'events' ? 'text-red-400' : 'text-primary'}`} />
                {selectedCity === 'GLOBAL' ? 'ALL_WORLDWIDE_MARKETS' : `${selectedCity.split(',')[0]}_MARKETS`}
              </h2>
              {isLoadingMarkets && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>

            <div className="space-y-4 pb-6">
              {!isLoadingMarkets && markets.length === 0 ? (
                 <div className="text-center py-12 px-6 text-primary/40 border border-dashed border-primary/20 font-mono text-xs tracking-widest rounded-xl bg-black/20 flex flex-col items-center gap-4">
                   <span>NO_ACTIVE_{activeTab === 'events' ? 'WEATHER' : 'TEMP'}_MARKETS_FOUND<br/>FOR_{selectedCity.toUpperCase()}</span>
                   
                   {/* Tombol Cerdas: Balik ke Global View jika kota kosong */}
                   {selectedCity !== 'GLOBAL' && (
                     <button 
                       onClick={() => setSelectedCity('GLOBAL')}
                       className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 rounded transition-all text-[10px] flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                     >
                       <Globe className="w-4 h-4" /> SWITCH TO GLOBAL VIEW
                     </button>
                   )}
                 </div>
              ) : (
                markets.map((market) => (
                  <div key={market.id} className="bg-black/60 border border-primary/20 hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.05)] rounded-xl overflow-hidden group">
                    <div className="flex items-start p-4 gap-4">
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