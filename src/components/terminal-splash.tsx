'use client';
import React, { useState, useEffect, useRef } from 'react';
import { InteractiveBackground } from './interactive-background';

interface TerminalSplashProps {
  onComplete: () => void;
}

export const TerminalSplash: React.FC<TerminalSplashProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bootSequence = [
    { text: "Initializing System...", color: "text-slate-500", delay: 300 },
    { text: "Powering up Core Engine... [OK]", color: "text-primary text-glow", delay: 400 },
    { text: "Loading Agent Skill Protocols... [OK]", color: "text-primary", delay: 400 },
    { text: "Mounting neural pathways... [OK]", color: "text-primary", delay: 500 },
    { text: "Connecting to Polygon Node... [CONNECTED]", color: "text-accent text-glow", delay: 600 },
    { text: "Loading agent subroutines...", color: "text-slate-500", delay: 400 },
    { text: "  → Weather Radar API... [READY]", color: "text-primary", delay: 200 },
    { text: "  → Market Execution Layer... [READY]", color: "text-primary", delay: 200 },
    { text: "  → Climate Intelligence AI (CHANI)... [READY]", color: "text-cyan-300 font-bold text-glow", delay: 300 },
    { text: "System check complete. Awaiting user input.", color: "text-slate-500", delay: 400 },
    { text: " ", color: "text-transparent", delay: 100 },
    { text: "═══════════════════════════════════════════════════", color: "text-primary/50 font-bold", delay: 100 },
    { text: "   CHANI OS v2.0.0 / SYSTEM_READY", color: "text-primary font-bold text-glow text-lg", delay: 100 },
    { text: "   Intelligent Weather Forecasting & Market Execution", color: "text-slate-300 tracking-widest text-xs", delay: 100 },
    { text: "═══════════════════════════════════════════════════", color: "text-primary/50 font-bold", delay: 100 },
    { text: " ", color: "text-transparent", delay: 300 },
    { text: "Type 'start' or press ENTER to launch dashboard...", color: "text-primary/70 animate-pulse-fast font-bold", delay: 0 },
  ];

  // Auto-scroll ke bawah saat baris baru muncul
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    let currentIndex = 0;
    const runSequence = () => {
      if (currentIndex >= bootSequence.length) {
        setShowPrompt(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }
      const step = bootSequence[currentIndex];
      setLines(prev => [...prev, step.text]);
      currentIndex++;
      setTimeout(runSequence, step.delay);
    };
    runSequence();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') triggerExit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.toLowerCase() === 'start') triggerExit();
  };

  const triggerExit = () => {
    setLines(prev => [...prev, "Bypassing protocols... Launching Dashboard..."]);
    setTimeout(onComplete, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] font-share-tech text-sm md:text-base cursor-text flex items-center justify-center bg-background" onClick={() => inputRef.current?.focus()}>
      
      {/* Background Interaktif tetap berjalan di belakang layar splash */}
      <InteractiveBackground />

      {/* Main Terminal Container */}
      <div className="relative z-10 w-full max-w-5xl p-4 md:p-12 flex flex-col items-center justify-center h-full">
        
        {/* Terminal Window - Ditambahkan CRT Overlay & Batas Ketinggian (max-h) */}
        <div className="crt-overlay relative w-full max-h-[85vh] bg-surface/80 backdrop-blur-xl border border-primary/50 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,212,255,0.25)] animate-pulse-slow">
          
          {/* Holographic Scanline Effect */}
          <div className="absolute inset-0 w-full h-[10%] bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-50 pointer-events-none animate-hologram-scan z-10"></div>

          {/* Sidebar / Character Image Area */}
          <div className="hidden md:flex w-[320px] shrink-0 border-r border-primary/30 items-center justify-center p-8 bg-black/60 relative z-20">
            <div className="relative w-56 h-56 rounded-full border-2 border-primary/50 flex items-center justify-center shadow-[0_0_40px_rgba(0,212,255,0.6)] p-1 group">
               <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary relative">
                  {/* Overlay warna cyan tipis di atas gambar agar menyatu dengan tema */}
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
                  {/* Path Gambar diperbarui ke /char.jpeg */}
                  <img src="/char.jpeg" alt="CHANI AI" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
               </div>
               
               {/* Lingkaran Sensor Bergerak */}
               <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }}></div>
               <div className="absolute inset-[-10px] rounded-full border-b-2 border-cyan-400 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 flex flex-col min-h-0 relative z-20 bg-black/40"> 
            
            {/* Header Terminal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30 shrink-0 bg-surface/50">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-widest text-primary text-glow">CHANI_TERMINAL</span>
                <span className="text-[9px] text-primary/60 tracking-[0.2em]">CONNECTION_SECURE</span>
              </div>
              <div className="flex gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,212,255,0.8)]"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-primary/30"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-primary/30"></div>
              </div>
            </div>

            {/* Area Teks yang Bisa Di-Scroll */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 md:p-8 font-share-tech text-sm md:text-base overflow-y-auto custom-scrollbar"
            >
               {lines.map((line, idx) => {
                 // Ambil style warna dari array bootSequence
                 const style = idx < bootSequence.length ? bootSequence[idx].color : 'text-primary text-glow';
                 return (
                   <div key={idx} className="mb-3 flex items-start animate-fade-in">
                     <span className="text-cyan-400 mr-3 opacity-90 shrink-0 text-glow">›</span>
                     <span className={`${style} whitespace-pre-wrap break-words leading-relaxed`}>{line}</span>
                   </div>
                 );
               })}

               {/* Input Terminal Pengguna */}
               {showPrompt && (
                 <div className="flex items-center mt-6 group">
                   <span className="text-cyan-400 mr-3 opacity-90 text-glow font-bold">root@chani:~$</span>
                   <input
                     ref={inputRef} 
                     type="text" 
                     value={inputValue} 
                     onChange={handleChange} 
                     onKeyDown={handleKeyDown}
                     className="bg-transparent border-none outline-none text-white w-full caret-transparent font-bold tracking-wider text-glow"
                     autoFocus
                   />
                   {/* Kursor Kotak ala Terminal Retro */}
                   <span className="inline-block w-3 h-5 bg-primary animate-blink ml-1 shadow-[0_0_10px_rgba(0,212,255,0.8)]"></span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};