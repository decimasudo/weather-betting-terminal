'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Radar, Network, TerminalSquare, Cpu, Globe, Zap, Database, Github, Twitter } from 'lucide-react';
import { InteractiveBackground } from '@/components/interactive-background';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-share-tech selection:bg-pink-500/30 relative text-foreground overflow-hidden bg-[#050505]">
      
      {/* Tambahan Custom CSS untuk animasi Ticker/Marquee tanpa perlu ubah Tailwind Config */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
      `}} />

      {/* Background Component */}
      <div className="absolute inset-0 z-0 opacity-80">
        <InteractiveBackground />
      </div>

      {/* === DEKORASI HUD SCI-FI (KIRI & KANAN) === */}
      <div className="fixed left-2 md:left-6 top-1/4 bottom-1/4 w-8 border-r border-cyan-900/40 flex flex-col justify-between items-center py-4 text-[9px] text-cyan-800 font-mono z-0 hidden sm:flex">
        <span>01</span><span className="text-cyan-900/50">|</span><span className="text-cyan-900/50">|</span>
        <span className="text-pink-500 animate-pulse">02</span>
        <span className="text-cyan-900/50">|</span><span className="text-cyan-900/50">|</span><span>03</span>
        <div className="h-full w-px bg-gradient-to-b from-transparent via-cyan-900/50 to-transparent my-4"></div>
        <span className="text-cyan-600 font-bold" style={{ writingMode: 'vertical-rl' }}>SYSTEM</span>
      </div>

      <div className="fixed right-2 md:right-6 top-1/4 bottom-1/4 w-8 border-l border-pink-900/40 flex flex-col justify-between items-center py-4 text-[9px] text-pink-800 font-mono z-0 hidden sm:flex">
        <span className="text-pink-600 font-bold" style={{ writingMode: 'vertical-rl' }}>CONNECTION ESTABLISHED</span>
        <div className="h-full w-px bg-gradient-to-b from-transparent via-pink-900/50 to-transparent my-4"></div>
        <span>0X</span><span className="text-pink-900/50">|</span>
        <span className="text-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.8)]">OK</span>
        <span className="text-pink-900/50">|</span><span>FF</span>
      </div>

      {/* Cyberpunk Kanji Background Decorations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-[0.02] text-cyan-500 font-bold mix-blend-screen">
        <div className="text-[20rem] leading-none whitespace-nowrap">WEATHER PROPHECY</div>
      </div>

      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* 1. Navbar */}
        <nav className="border-b border-cyan-500/30 bg-black/60 backdrop-blur-md sticky top-0 z-50 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
            <div className="font-bold text-xl flex items-center gap-2 text-white group">
              <Cpu className="w-6 h-6 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] group-hover:rotate-90 transition-transform duration-500" />
              <span className="tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                chaniagent
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/decimasudo/weather-betting-terminal" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-pink-500/10">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/chaniagent" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-pink-500/10">
                <Twitter className="w-5 h-5" />
              </a>
              <Link href="/dashboard" className="px-5 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-400 hover:text-cyan-100 transition-all font-medium text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] relative overflow-hidden group">
                <span className="relative z-10">INITIALIZE APP</span>
                <div className="absolute inset-0 bg-cyan-400 w-0 group-hover:w-full transition-all duration-300 opacity-20 z-0"></div>
              </Link>
            </div>
          </div>
        </nav>

        {/* 2. Ticker/Marquee Sci-Fi */}
        <div className="w-full bg-pink-950/30 border-b border-pink-500/30 py-1.5 overflow-hidden relative z-40 flex items-center backdrop-blur-sm shadow-[0_4px_15px_rgba(236,72,153,0.1)]">
          <div className="w-full flex whitespace-nowrap">
            <div className="animate-marquee text-[10px] md:text-xs font-mono text-pink-400 tracking-[0.2em] flex gap-8">
              <span>[SYS.LOG] POLYMARKET NODES SYNCED</span>
              <span className="text-cyan-400">///</span>
              <span>CONNECTION ESTABLISHED</span>
              <span className="text-cyan-400">///</span>
              <span>SATELLITE FEED SECURE</span>
              <span className="text-cyan-400">///</span>
              <span className="text-white bg-pink-600 px-2 font-bold">WEATHER ANOMALY DETECTED</span>
              <span className="text-cyan-400">///</span>
              <span>GLOBAL RADAR ACTIVE</span>
              <span className="text-cyan-400">///</span>
              {/* Duplicate for infinite effect */}
              <span>[SYS.LOG] POLYMARKET NODES SYNCED</span>
              <span className="text-cyan-400">///</span>
              <span>CONNECTION ESTABLISHED</span>
              <span className="text-cyan-400">///</span>
              <span>SATELLITE FEED SECURE</span>
              <span className="text-cyan-400">///</span>
              <span className="text-white bg-pink-600 px-2 font-bold">WEATHER ANOMALY DETECTED</span>
              <span className="text-cyan-400">///</span>
              <span>GLOBAL RADAR ACTIVE</span>
              <span className="text-cyan-400">///</span>
            </div>
          </div>
        </div>

        {/* 3. Hero Section */}
        <section className="relative flex-1 flex flex-col justify-center pt-16 pb-20 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
            
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-8 backdrop-blur-sm uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-pink-500"></span>
              </span>
              Neural Network Online // <span className="text-pink-400">ONLINE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl uppercase leading-none">
              Predict the <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">Anomaly.</span><br/>
              Trade the <span className="text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] relative inline-block">
                Outcome.
                <div className="absolute -right-6 top-0 text-[10px] text-pink-300 font-mono tracking-widest writing-vertical-rl opacity-50">PROBABILITY</div>
              </span>
            </h1>
            
            <p className="text-sm md:text-lg text-cyan-100/70 mb-12 max-w-2xl mx-auto leading-relaxed font-mono">
              Autonomous Climate Intelligence Agent. Directly integrated with <span className="text-white font-bold border-b border-pink-500">Polymarket</span>. Real-time satellite data analysis and position execution assisted by CHANI AI Agent.
            </p>

            <div className="flex justify-center gap-6">
              <Link href="/dashboard" className="relative px-8 py-4 bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] font-bold text-sm md:text-lg flex items-center gap-3 group uppercase tracking-[0.2em]">
                {/* Siku-siku Sci-fi Button */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-pink-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-pink-500"></div>
                
                Access Agent 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* Mockup Preview UI (Rame & Cyberpunk) */}
            <div className="mt-20 relative mx-auto w-full max-w-4xl">
              {/* Outer Glowing Frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-500 opacity-20 blur-xl rounded-xl"></div>
              
              <div className="relative border border-cyan-500/50 bg-black/90 p-1 shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-xl">
                
                {/* HUD Header for Mockup */}
                <div className="flex justify-between items-center px-4 py-2 border-b border-cyan-900/60 bg-cyan-950/20">
                   <div className="flex gap-2">
                     <div className="w-2 h-2 bg-pink-500 animate-pulse"></div>
                     <div className="w-2 h-2 bg-cyan-500"></div>
                     <div className="w-2 h-2 bg-cyan-900"></div>
                   </div>
                   <div className="text-[10px] text-cyan-500 font-mono tracking-widest">DATA_FEED_SECURE // NODE: TOKYO</div>
                </div>

                <div className="aspect-video md:aspect-[21/9] bg-gray-950 flex border-t border-cyan-900 overflow-hidden relative">
                  
                  {/* Grid Lines Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                  {/* Kiri: CHANI Oracle */}
                  <div className="flex-1 bg-black/80 relative p-6 flex flex-col justify-center items-center text-slate-400 overflow-hidden group border-r border-cyan-900/50">
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                      <Image src="/char.jpeg" alt="CHANI AI" fill className="object-cover filter contrast-125" />
                      {/* Inner scanline */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_2px,transparent_2px)] bg-[size:100%_4px] pointer-events-none"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="text-4xl md:text-6xl mb-2 font-bold text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,1)] opacity-90">NEURAL</span>
                      <h3 className="font-bold text-white text-xl md:text-2xl tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">CHANI ORACLE</h3>
                      <div className="h-px w-16 bg-pink-500 mb-3 shadow-[0_0_10px_rgba(236,72,153,1)]"></div>
                      <p className="text-[10px] md:text-xs text-cyan-200/80 max-w-[85%] leading-relaxed font-mono uppercase">
                        &gt; Processing real-time weather anomalies... <br/>
                        &gt; Probability synchronization active.
                      </p>
                    </div>
                  </div>

                  {/* Kanan: Polymarket Execution */}
                  <div className="flex-1 bg-black/90 relative p-6 flex flex-col justify-center items-center text-slate-400 overflow-hidden">
                    <div className="absolute right-[-10%] top-[-10%] text-8xl md:text-9xl text-pink-500/5 font-bold pointer-events-none">MARKET</div>
                    
                    {/* Sci-fi Target UI around icon */}
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 border border-pink-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-2 border border-dashed border-cyan-500/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                      <Network className="w-10 h-10 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] relative z-10" />
                    </div>

                    <h3 className="font-bold text-pink-400 text-lg md:text-xl tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">EXECUTION PROTOCOL</h3>
                    <p className="text-[10px] md:text-xs text-pink-100/70 text-center max-w-[85%] font-mono uppercase">
                      Direct node to Polymarket Contracts. <br/>
                      <span className="text-cyan-400">Yes / No probability routing...</span>
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Section (Data-Heavy Look) */}
        <section className="py-24 px-6 border-t border-cyan-500/30 bg-black/80 backdrop-blur-md relative overflow-hidden">
          {/* Decorative side text */}
          <div className="absolute left-4 top-10 text-[100px] font-bold text-cyan-900/10 writing-vertical-rl pointer-events-none">FEATURES</div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-12 border-b border-cyan-900/50 pb-4">
               <Database className="w-6 h-6 text-pink-500" />
               <h2 className="text-2xl font-bold text-white tracking-[0.2em] uppercase">System_Capabilities</h2>
               <div className="flex-1 h-px bg-cyan-900/50 ml-4"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Radar, 
                  title: "Real-Time Radar", 
                  color: "text-cyan-400", 
                  borderColor: "border-cyan-500/40 hover:border-cyan-400",
                  shadowColor: "hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
                  kanji: "RADAR",
                  sysCode: "SYS.01.RAD",
                  desc: "High-precision satellite data scanning. Monitor precipitation probabilities without complex interface disruptions."
                },
                {
                  icon: Network, 
                  title: "Seamless Execution", 
                  color: "text-pink-400", 
                  borderColor: "border-pink-500/40 hover:border-pink-400",
                  shadowColor: "hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
                  kanji: "EXEC",
                  sysCode: "PRT.02.EXE",
                  desc: "View event opportunities on Polymarket and execute positions (Yes/No) on the same terminal quickly."
                },
                {
                  icon: TerminalSquare, 
                  title: "AI Agent CHANI", 
                  color: "text-white", 
                  borderColor: "border-white/40 hover:border-white",
                  shadowColor: "hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]",
                  kanji: "AI",
                  sysCode: "AI.03.CHN",
                  desc: "Direct chat interaction with AI Agent per-event. Get sharp analysis for free without wallet connection hassle."
                }
              ].map((item, i) => (
                <div key={i} className={`group p-6 bg-black/50 border transition-all duration-300 relative overflow-hidden flex flex-col ${item.borderColor} ${item.shadowColor}`}>
                  
                  {/* Decorative background kanji */}
                  <div className="absolute -right-4 -bottom-4 text-7xl font-bold opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                    {item.kanji}
                  </div>

                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 bg-black border border-current flex items-center justify-center shadow-inner ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 tracking-widest">{item.sysCode}</span>
                  </div>

                  <h3 className={`text-xl font-bold mb-3 tracking-widest uppercase ${item.color}`}>{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-xs font-mono mb-4 flex-1">{item.desc}</p>
                  
                  {/* Footer Card Decorative Line */}
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-full h-px bg-gray-800 relative">
                      <div className={`absolute top-0 left-0 h-full w-0 transition-all duration-500 group-hover:w-full bg-current ${item.color}`}></div>
                    </div>
                    <div className={`w-2 h-2 shrink-0 border border-current ${item.color}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Statistics Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-black/80 to-cyan-950/20 backdrop-blur-md relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/60 border border-pink-500/40 text-pink-400 text-xs font-mono mb-6 backdrop-blur-sm uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 bg-cyan-500"></span>
                </span>
                Live System Metrics
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
                Platform <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">Performance</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { value: "99.9%", label: "Uptime", sub: "24/7 Operation", color: "text-cyan-400", bgColor: "from-cyan-500/10 to-cyan-600/5" },
                { value: "2.1M", label: "Data Points", sub: "Processed Daily", color: "text-pink-400", bgColor: "from-pink-500/10 to-pink-600/5" },
                { value: "87.3%", label: "Accuracy", sub: "Prediction Rate", color: "text-green-400", bgColor: "from-green-500/10 to-green-600/5" },
                { value: "<50ms", label: "Response", sub: "Average Latency", color: "text-yellow-400", bgColor: "from-yellow-500/10 to-yellow-600/5" }
              ].map((stat, i) => (
                <div key={i} className={`group p-6 bg-gradient-to-br ${stat.bgColor} border border-current/20 hover:border-current/40 transition-all duration-300 relative overflow-hidden rounded-lg backdrop-blur-sm`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 text-center">
                    <div className={`text-3xl md:text-4xl font-black mb-2 ${stat.color} drop-shadow-[0_0_10px_currentColor]`}>
                      {stat.value}
                    </div>
                    <div className="text-white font-bold text-sm md:text-lg mb-1 tracking-widest uppercase">
                      {stat.label}
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      {stat.sub}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>
                </div>
              ))}
            </div>

            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-black/50 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest uppercase">Active Markets</h3>
                <div className="space-y-3">
                  {[
                    { name: "NYC Temperature >15°C", volume: "$2.4M", change: "+12.3%" },
                    { name: "London Rain Tomorrow", volume: "$1.8M", change: "-3.7%" },
                    { name: "Tokyo Snow Event", volume: "$956K", change: "+28.1%" }
                  ].map((market, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-cyan-900/30 last:border-b-0">
                      <span className="text-gray-300 text-sm">{market.name}</span>
                      <div className="text-right">
                        <div className="text-cyan-400 font-mono text-sm">{market.volume}</div>
                        <div className={`text-xs ${market.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {market.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-black/50 border border-pink-500/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-bold text-pink-400 mb-4 tracking-widest uppercase">AI Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Temperature Prediction</span>
                    <span className="text-green-400 font-mono">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Precipitation Forecast</span>
                    <span className="text-green-400 font-mono">89.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Storm Detection</span>
                    <span className="text-green-400 font-mono">96.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Market Sentiment</span>
                    <span className="text-green-400 font-mono">87.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. How It Works Section */}
        <section className="py-24 px-6 bg-black/90 backdrop-blur-md relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pink-500/50 to-transparent"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
                How It <span className="text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">Works</span>
              </h2>
              <p className="text-cyan-100/70 max-w-2xl mx-auto text-sm md:text-lg font-mono">
                From weather data to profitable positions in three streamlined steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection lines between steps */}
              <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-px bg-gradient-to-r from-cyan-500/50 via-pink-500/50 to-cyan-500/50"></div>

              {[
                {
                  step: "01",
                  title: "Data Acquisition",
                  desc: "Real-time satellite imagery, weather station data, and IoT sensor networks feed into our processing pipeline.",
                  icon: Radar,
                  color: "text-cyan-400",
                  features: ["Satellite Imagery", "Weather Stations", "IoT Sensors", "API Integration"]
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  desc: "CHANI AI processes weather patterns, predicts outcomes, and identifies market opportunities with high accuracy.",
                  icon: Cpu,
                  color: "text-pink-400",
                  features: ["Pattern Recognition", "Probability Modeling", "Sentiment Analysis", "Risk Assessment"]
                },
                {
                  step: "03",
                  title: "Position Execution",
                  desc: "Execute positions directly on Polymarket with optimized timing and automated risk management.",
                  icon: Zap,
                  color: "text-green-400",
                  features: ["Direct Integration", "Auto Execution", "Portfolio Management", "Real-time Monitoring"]
                }
              ].map((step, i) => (
                <div key={i} className="group relative">
                  {/* Step number background */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-black border border-current/50 flex items-center justify-center">
                    <span className={`text-lg font-black ${step.color}`}>{step.step}</span>
                  </div>

                  <div className="p-6 bg-black/50 border border-current/20 hover:border-current/40 transition-all duration-300 rounded-lg backdrop-blur-sm h-full">
                    <div className={`w-16 h-16 bg-black/80 border border-current/30 flex items-center justify-center mb-6 mx-auto ${step.color}`}>
                      <step.icon className="w-8 h-8" />
                    </div>

                    <h3 className={`text-xl font-bold mb-4 text-center tracking-widest uppercase ${step.color}`}>
                      {step.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
                      {step.desc}
                    </p>

                    <div className="space-y-2">
                      {step.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 bg-current rounded-full ${step.color}`}></div>
                          <span className="text-xs text-gray-500 font-mono">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block p-6 bg-gradient-to-r from-cyan-950/50 to-pink-950/50 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 tracking-widest uppercase">Start Trading Weather</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md">
                  Join thousands of traders using AI-powered weather analysis to predict market movements and execute profitable positions.
                </p>
                <Link href="/dashboard" className="inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                  Launch Terminal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Footer */}
        <footer className="py-6 px-6 bg-[#020202] text-center border-t border-cyan-900/50 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cyan-600/50 text-[10px] font-mono tracking-widest uppercase">
              SYS.LOG // {new Date().getFullYear()} // TERMINAL_READY 
            </p>
            <div className="flex gap-2 text-pink-500/50 text-[10px] font-mono tracking-widest">
               <span>[ENCRYPTED]</span>
               <span>POWERED BY CHANI_AI</span>
            </div>
          </div>
        </footer>

      </div>

      {/* === GLOBAL CRT SCANLINE OVERLAY === */}
      {/* Bersifat pointer-events-none agar seluruh halaman bisa diklik */}
      <div className="pointer-events-none fixed inset-0 z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-overlay"></div>
      
    </div>
  );
}