'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, Droplets, Wind, Waves, Eye, 
  TrendingUp, ArrowRight, Sun, Cloud, 
  CloudRain, CloudLightning, CloudSnow, CloudFog, Cpu,
  ThermometerSun, AlertTriangle, ChevronDown, MapPin, Globe,
  MessageSquare, X, Send, ExternalLink, Loader2, Activity
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

// Function to parse simple markdown **bold** syntax
const parseMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function DashboardTerminal() {
  const [activeTab, setActiveTab] = useState<'temperature' | 'events'>('temperature');
  
  // State for Watchlist
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

  // === CHANI CHAT STATES ===
  const [selectedMarket, setSelectedMarket] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // City Search logic
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

  // Effect: Fetch Weather
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
        if (hasChanges) setWeatherMap(newMap);
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
        const cityName = selectedCity === 'GLOBAL' ? '' : selectedCity.split(',')[0];
        const res = await fetch(`/api/polymarket?city=${encodeURIComponent(cityName)}&tab=${activeTab}`);
        const rawMarketData = await res.json();
        setMarkets(Array.isArray(rawMarketData) ? rawMarketData : []);
      } catch (error) {
        setMarkets([]);
      } finally {
        setIsLoadingMarkets(false);
      }
    };
    loadMarkets();
  }, [activeTab, selectedCity]);

  const handleSelectCity = (city: string) => {
    if (!watchlist.includes(city)) {
      const newList = [...watchlist];
      newList.splice(1, 0, city);
      setWatchlist(newList);
    }
    setSelectedCity(city);
    setSearchInput('');
    setIsDropdownOpen(false);
  };

  // === CHAT LOGIC ===
  const openChatForMarket = (market: any) => {
    setSelectedMarket(market);
    setIsChatOpen(true);
    setChatMessages([
      {
        role: 'assistant',
        content: `[NODE CONNECTED]\nMarket: **${market.title}**\n\nI am CHANI. Satellite data and event probabilities (YES: ${market.outcomePrices[0]}¢, NO: ${market.outcomePrices[1]}¢) have been loaded into my neural memory. What would you like to analyze from this anomaly?`
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedMarket) return;
    
    const newMsg = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, newMsg],
          context: selectedMarket
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "SYSTEM ERROR: Koneksi ke mainframe terputus." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-share-tech flex flex-col h-screen overflow-hidden selection:bg-pink-500/30 relative text-foreground bg-[#0a0a0a]">
      
      {/* === INTERACTIVE BACKGROUND === */}
      {/* Ditempatkan dengan z-0 agar berada di belakang panel yang semi-transparan */}
      <div className="absolute inset-0 z-0">
        <InteractiveBackground />
      </div>

      {/* Main Content Overlay dengan sedikit transparansi untuk menampilkan background */}
      <div className="relative z-10 flex flex-col h-full bg-black/60">
        
        {/* NAVBAR */}
        <nav className="h-16 border-b border-cyan-900/60 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-[0_4px_20px_rgba(34,211,238,0.1)]">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-cyan-600 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-pink-500/10">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div className="h-4 w-px bg-cyan-900"></div>
            <span className="font-bold text-cyan-400 flex items-center gap-2 tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              <Cpu className="w-5 h-5 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> CHANI_CORE_TERMINAL
            </span>
          </div>
          
          <div className="hidden lg:flex bg-black/50 border border-cyan-900/50 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setActiveTab('temperature')}
              className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase rounded flex items-center gap-2 transition-all duration-300 ${activeTab === 'temperature' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-500/50' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-900/30 border border-transparent'}`}
            >
              <ThermometerSun className="w-4 h-4" /> Daily_Temp
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase rounded flex items-center gap-2 transition-all duration-300 ${activeTab === 'events' ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] border border-pink-500/50' : 'text-cyan-700 hover:text-pink-400 hover:bg-pink-900/30 border border-transparent'}`}
            >
              <CloudLightning className="w-4 h-4" /> Weather_Events
            </button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* LEFT PANEL: GLOBAL WATCHLIST */}
          <section className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative border-r border-cyan-900/50 bg-black/40 backdrop-blur-sm">
            
            {/* AGENT IDENTITY WIDGET */}
            <div className="flex items-center justify-between p-4 border border-cyan-900/60 bg-black/80 rounded-xl relative overflow-hidden group shrink-0 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-black p-1 group/frame shrink-0 my-1">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-pink-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-pink-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-pink-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-pink-500"></div>
                    <div className="relative w-full h-full overflow-hidden border border-cyan-900/50">
                      <Image src="/char.jpeg" alt="CHANI AI" fill className="object-cover opacity-80 group-hover/frame:opacity-100 transition-opacity duration-300 filter contrast-125 grayscale-[10%]" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_2px,transparent_2px)] bg-[size:100%_4px] pointer-events-none z-10"></div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-pink-500/50 px-2 py-0.5 text-[8px] text-pink-400 font-mono tracking-widest whitespace-nowrap shadow-[0_0_10px_rgba(236,72,153,0.5)] z-20">
                      UNIT: CHANI
                    </div>
                  </div>
                  <div>
                    <h3 className="text-pink-400 font-bold text-sm tracking-widest drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] flex items-center gap-2">
                      AGENT_CHANI
                      <span className="text-[8px] bg-pink-500/20 text-pink-300 border border-pink-500/50 px-1.5 py-0.5 rounded font-mono">AI v2.1</span>
                    </h3>
                    <p className="text-[9px] text-cyan-600 tracking-[0.2em] font-mono uppercase mt-0.5">
                      GLOBAL_RADAR_NODE // ACTIVE
                    </p>
                  </div>
               </div>
               <div className="hidden md:flex flex-col items-end gap-1 relative z-10 shrink-0">
                 <p className="text-[9px] font-mono text-cyan-800 tracking-[0.2em] uppercase">SELECTED_NODE</p>
                 <p className="text-sm font-bold font-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] tracking-widest">{selectedCity.toUpperCase()}</p>
                 <p className="text-[8px] font-mono text-pink-500/70 tracking-widest">{activeTab === 'temperature' ? 'MODE: TEMP_ANALYSIS' : 'MODE: EVENT_WATCH'}</p>
               </div>
            </div>

            {/* COMBOBOX SEARCH */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <div className="relative z-50">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchInput} 
                  onChange={(e) => { setSearchInput(e.target.value); setIsDropdownOpen(true); }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-black/80 backdrop-blur-md border border-cyan-900/60 text-cyan-100 placeholder:text-cyan-800 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] py-3 pl-12 pr-12 transition-all uppercase tracking-widest font-mono text-sm rounded-xl"
                  placeholder="ADD CITY TO WATCHLIST..."
                />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600 w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-black/95 backdrop-blur-xl border border-cyan-900/60 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar z-50">
                  {suggestions.map((city, idx) => (
                    <button key={idx} onClick={() => handleSelectCity(city)} className="w-full text-left px-5 py-3 hover:bg-cyan-900/40 text-cyan-100 font-mono uppercase tracking-widest text-sm border-b border-cyan-900/30 last:border-0 transition-colors flex items-center gap-3">
                      <Search className="w-4 h-4 text-pink-500/50" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === WATCHLIST NEXUS === */}
            <div className="flex flex-col gap-4 pb-6">
              <div className="flex items-center gap-2 pl-1 border-b border-cyan-900/30 pb-2">
                 <Activity className="w-4 h-4 text-pink-500 animate-pulse" />
                 <h2 className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] uppercase">
                   // WATCHLIST_NEXUS
                 </h2>
              </div>
              
              {isLoadingWeather && Object.keys(weatherMap).length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-cyan-600 flex-col gap-3 font-mono border border-dashed border-cyan-900/50 rounded-xl bg-black/40 p-12">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-2 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                  <p className="tracking-widest animate-pulse">SCANNING_ATMOSPHERE...</p>
                </div>
              ) : (
                watchlist.map((city) => {
                  const isSelected = selectedCity === city;

                  // === KARTU: GLOBAL VIEW ===
                  if (city === 'GLOBAL') {
                    return (
                      <div key="GLOBAL" onClick={() => setSelectedCity('GLOBAL')} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden mb-2 ${isSelected ? 'bg-gradient-to-r from-cyan-900/40 to-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-black/60 border-cyan-900/40 hover:border-pink-500/50'}`}>
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                        <div className="flex items-center gap-4 pl-2">
                          <div className={`p-3 rounded-full border transition-colors ${isSelected ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-black/50 border-cyan-900/50 group-hover:border-pink-500/50 group-hover:bg-pink-500/10'}`}>
                            <Globe className={`w-8 h-8 ${isSelected ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-cyan-700'}`} />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold tracking-widest uppercase ${isSelected ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-cyan-100'}`}>GLOBAL_RADAR</h3>
                            <p className="text-[10px] text-pink-500/70 font-mono tracking-widest uppercase mt-1">SHOW ALL WORLDWIDE MARKETS</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const data = weatherMap[city];
                  if (!data) return null;

                  // === KARTU: CITY FORECAST ===
                  return (
                    <div key={city} onClick={() => setSelectedCity(city)} className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${isSelected ? 'bg-gradient-to-br from-cyan-950/30 to-black border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.15)]' : 'bg-black/80 border-cyan-900/50 hover:border-cyan-500/50 hover:bg-cyan-950/10'}`}>
                      {/* Efek Garis Aktif */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />}
                      
                      {/* Header Kartu: Info Utama */}
                      <div className="flex justify-between items-start mb-5 pl-2">
                        <div>
                          <h3 className={`text-xl font-bold tracking-widest uppercase flex items-center gap-2 ${isSelected ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-cyan-100'}`}>
                            {data.city}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-3xl font-bold tracking-tighter text-white drop-shadow-md">{data.temp}°</span>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-pink-400/90 font-mono tracking-widest uppercase">{data.description}</span>
                              <span className="text-[9px] text-cyan-600 font-mono uppercase">CURRENT_STATUS</span>
                            </div>
                          </div>
                        </div>

                        {/* Indikator Risiko Anomali */}
                        <div className="flex flex-col items-end gap-1.5">
                          {data.signals.stormRisk !== 'low' && (
                            <span className="px-2 py-0.5 text-[8px] font-bold text-black bg-pink-500 border border-pink-400 rounded animate-pulse font-mono tracking-widest shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                              ⚠ STORM_RISK
                            </span>
                          )}
                          {(data.precipitationProb ?? 0) > 30 && (
                            <span className="px-2 py-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-900/50 border border-cyan-500/50 rounded font-mono flex items-center gap-1 shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                              <Droplets className="w-2.5 h-2.5 text-cyan-400" /> {data.precipitationProb}% PRECIP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 7-DAY FORECAST GRID */}
                      <div className="mt-2 pt-4 border-t border-cyan-900/40">
                        <p className="text-[9px] font-mono text-cyan-700 tracking-widest mb-3 pl-2 uppercase">7-DAY_PROJECTION_MATRIX</p>
                        <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2 pl-2 pr-2">
                          {data.daily.map((d, i) => {
                            const isToday = i === 0;
                            return (
                              <div key={i} className={`flex flex-col items-center p-3 rounded-lg min-w-[70px] shrink-0 border transition-all duration-300 ${isToday ? 'bg-pink-950/20 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden' : 'bg-black/60 border-cyan-900/40 group-hover:border-cyan-700/60 hover:bg-cyan-900/20 hover:scale-105'}`}>
                                
                                {/* Background glow for TODAY */}
                                {isToday && <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent pointer-events-none" />}
                                
                                <span className={`text-[10px] font-mono tracking-wider z-10 ${isToday ? 'text-pink-400 font-bold drop-shadow-[0_0_2px_rgba(236,72,153,0.8)]' : 'text-cyan-600'}`}>
                                  {isToday ? 'TODAY' : d.date.split(',')[0].toUpperCase()}
                                </span>
                                
                                <WeatherIcon code={d.weatherCode} className={`w-7 h-7 my-2.5 z-10 ${isToday ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-cyan-500'}`} />
                                
                                <div className="flex items-center justify-between w-full z-10 px-1">
                                  <span className="text-[11px] font-bold text-cyan-400 text-shadow-sm">{d.minTemp}°</span>
                                  <span className="text-[11px] font-bold text-pink-400 text-shadow-sm">{d.maxTemp}°</span>
                                </div>
                                
                                {activeTab === 'events' && d.precipProb > 20 && (
                                   <div className="mt-2 text-[9px] text-cyan-200 font-mono tracking-tighter flex items-center gap-1 bg-cyan-900/40 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-[0_0_5px_rgba(34,211,238,0.2)] z-10">
                                     <Droplets className="w-2.5 h-2.5" /> {d.precipProb}%
                                   </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT PANEL: POLYMARKET UI */}
          <section className="w-full lg:w-[500px] bg-black/60 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] border-l border-cyan-900/50">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50 shrink-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-widest uppercase">
                <TrendingUp className={`w-5 h-5 ${activeTab === 'events' ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`} />
                {selectedCity === 'GLOBAL' ? 'ALL_WORLDWIDE_MARKETS' : `${selectedCity.split(',')[0]}_MARKETS`}
              </h2>
              {isLoadingMarkets && <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>}
            </div>

            <div className="space-y-4 pb-6">
              {!isLoadingMarkets && markets.length === 0 ? (
                 <div className="text-center py-12 px-6 text-cyan-700 border border-dashed border-cyan-900/50 font-mono text-xs tracking-widest rounded-xl bg-black/40 flex flex-col items-center gap-4">
                   <span>NO_ACTIVE_{activeTab === 'events' ? 'WEATHER' : 'TEMP'}_MARKETS_FOUND<br/>FOR_{selectedCity.toUpperCase()}</span>
                   {selectedCity !== 'GLOBAL' && (
                     <button onClick={() => setSelectedCity('GLOBAL')} className="px-6 py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-700/50 rounded transition-all text-[10px] flex items-center gap-2 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                       <Globe className="w-4 h-4" /> SWITCH TO GLOBAL VIEW
                     </button>
                   )}
                 </div>
              ) : (
                markets.map((market) => (
                  <div key={market.id} className="bg-black/80 border border-cyan-900/40 hover:border-pink-500/80 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] rounded-xl overflow-hidden group relative flex flex-col">
                    
                    {/* === ICON CHAT KHUSUS === */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openChatForMarket(market);
                      }}
                      className="absolute top-4 right-4 z-20 bg-black/80 border border-pink-500/50 text-pink-400 hover:bg-pink-500 hover:text-white p-2 rounded-lg shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:shadow-[0_0_15px_rgba(236,72,153,0.8)] transition-all flex items-center justify-center opacity-70 group-hover:opacity-100"
                      title="Diskusi dengan CHANI"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* === BUNGKUSAN CARD UTAMA === */}
                    <a 
                      href={`https://polymarket.com/event/${market.slug || ''}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex flex-col relative z-10"
                    >
                      <div className="flex items-start p-4 gap-4 flex-1">
                        <div className="w-16 h-16 shrink-0 rounded-lg bg-black border border-cyan-900/60 overflow-hidden flex items-center justify-center relative">
                          {market.image ? (
                            <img src={market.image} alt="market icon" className="w-full h-full object-cover filter contrast-125 grayscale-[20%]" />
                          ) : (
                            <TrendingUp className="w-6 h-6 text-cyan-700" />
                          )}
                          <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                        </div>
                        
                        <div className="flex-1 pr-10">
                          <h3 className="font-bold text-cyan-50 text-[13px] leading-snug mb-2 font-sans group-hover:text-cyan-300 transition-colors line-clamp-2">{market.title}</h3>
                          <div className="flex items-center gap-3 text-[9px] font-mono tracking-widest">
                            <span className="text-cyan-500">VOL: ${(market.volume / 1000).toFixed(1)}K</span>
                            <span className="text-cyan-900">•</span>
                            <span className="text-pink-500/80">EXP: {market.endDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-px bg-cyan-900/40 border-t border-cyan-900/40 mt-auto">
                        <div className="flex justify-between items-center px-5 py-3 bg-black hover:bg-cyan-900/30 transition-all">
                          <span className="font-bold text-cyan-400 uppercase tracking-widest text-xs drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Yes</span>
                          <span className="font-mono text-cyan-100 font-bold">{market.outcomePrices[0] || 0}¢</span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-3 bg-black hover:bg-pink-900/30 transition-all">
                          <span className="font-bold text-pink-400 uppercase tracking-widest text-xs drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">No</span>
                          <span className="font-mono text-pink-100 font-bold">{market.outcomePrices[1] || 0}¢</span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* === SIDEBAR CHANI CHAT === */}
          {isChatOpen && selectedMarket && (
            <div className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-black/95 border-l border-pink-500/50 shadow-[-20px_0_50px_rgba(236,72,153,0.2)] z-[100] flex flex-col backdrop-blur-3xl animate-in slide-in-from-right duration-300">
              {/* Header Sidebar */}
              <div className="p-4 border-b border-pink-500/30 flex items-center justify-between bg-gradient-to-r from-pink-900/20 to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-pink-500 overflow-hidden relative">
                    <Image src="/char.jpeg" alt="CHANI" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-pink-400 font-bold text-sm tracking-widest flex items-center gap-2">CHANI <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,211,238,1)]"></span></h3>
                    <p className="text-[9px] text-cyan-600 font-mono uppercase">ORACLE_AI_READY</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-pink-500/50 hover:text-pink-400 transition-colors p-2 bg-black rounded-lg border border-pink-900/50 hover:border-pink-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Market Context Link */}
              <div className="p-4 border-b border-cyan-900/50 bg-black/60 shrink-0">
                 <p className="text-xs text-cyan-100 font-semibold mb-3 line-clamp-2">{selectedMarket.title}</p>
                 <div className="flex items-center gap-2">
                    <a 
                      href={`https://polymarket.com/event/${selectedMarket.slug || ''}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all"
                    >
                      EXECUTE ON POLYMARKET <ExternalLink className="w-4 h-4" />
                    </a>
                 </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 text-sm font-mono whitespace-pre-wrap ${
                      msg.role === 'user' 
                      ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/30 rounded-l-xl rounded-tr-xl' 
                      : 'bg-pink-900/20 text-pink-100 border border-pink-500/30 rounded-r-xl rounded-tl-xl shadow-[0_0_10px_rgba(236,72,153,0.1)]'
                    }`}>
                      {parseMarkdown(msg.content)}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3 text-sm font-mono bg-pink-900/20 text-pink-400 border border-pink-500/30 rounded-r-xl rounded-tl-xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> ANALYZING...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-pink-500/30 bg-black/80 shrink-0">
                {/* Suggested Questions */}
                <div className="mb-3">
                  <div className="text-[10px] text-cyan-400/70 font-mono mb-2 tracking-widest uppercase">QUICK QUERIES</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What's the probability analysis?",
                      "Should I bet YES or NO?",
                      "Market sentiment overview",
                      "Risk assessment",
                      "Weather anomaly detection"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(suggestion)}
                        disabled={isChatLoading}
                        className="px-2 py-1 text-[9px] bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200 rounded font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    placeholder="Ask CHANI about this event..."
                    className="w-full bg-black border border-cyan-900/60 text-cyan-100 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_15px_rgba(236,72,153,0.3)] py-3 pl-4 pr-12 rounded-lg font-mono text-xs transition-all disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 p-2 text-cyan-500 hover:text-pink-400 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* === GLOBAL CRT SCANLINE OVERLAY === */}
      <div className="pointer-events-none fixed inset-0 z-[150] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-30 mix-blend-overlay"></div>
    </div>
  );
}