'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image dari Next.js

interface TerminalSplashProps {
  onComplete?: () => void; // Prop untuk menutup splash
}

const BOOT_SEQUENCE = [
  "INITIALIZING NEURAL LINK...",
  "ESTABLISHING CONNECTION TO CHANI_ORACLE...",
  "DECRYPTING SATELLITE WEATHER DATA...",
  "BYPASSING MAINFRAME PROTOCOLS...",
  "SYNCING POLYMARKET NODES...",
  "ACCESS GRANTED. WELCOME TO WEATH3R_TERMINAL."
];

export function TerminalSplash({ onComplete }: TerminalSplashProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setLines((prev) => [...prev, BOOT_SEQUENCE[currentLine]]);
        setProgress(Math.floor(((currentLine + 1) / BOOT_SEQUENCE.length) * 100));
        currentLine++;
        
        // Efek Glitch Acak
        if (Math.random() > 0.6) {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 150);
        }
      } else {
        clearInterval(interval);
        // Tunggu sebentar setelah selesai sebelum memanggil onComplete (menutup splash)
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1000); 
      }
    }, 350); // Kecepatan munculnya teks (ms)

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-cyan-500 font-share-tech flex flex-col items-center justify-center overflow-hidden selection:bg-cyan-500/30">
      
      {/* Kanji Background Overlay (起動 - Kidou / Booting) */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none transition-transform duration-75 ${isGlitching ? 'translate-x-2 -translate-y-1' : ''}`}>
        <span className="text-[25rem] font-bold text-cyan-500" style={{ writingMode: 'vertical-rl' }}>
          起動
        </span> 
      </div>

      <div className={`w-full max-w-3xl p-8 bg-black/80 border border-cyan-900/60 shadow-[0_0_40px_rgba(34,211,238,0.1)] backdrop-blur-md relative z-10 transition-opacity duration-75 ${isGlitching ? 'opacity-70' : 'opacity-100'} flex flex-col md:flex-row gap-6 items-start`}>
        
        {/* Bagian Gambar CHANI (Kiri) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-[0_0_25px_rgba(34,211,238,0.6)]">
            <Image 
              src="/char.jpeg" 
              alt="CHANI AI" 
              fill
              className="object-cover"
            />
             {/* Overlay Efek Scanline pada Gambar */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_2px,transparent_2px)] bg-[size:100%_4px] pointer-events-none z-10"></div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-pink-500 font-bold tracking-widest text-sm uppercase drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] block">
              AI AGENT: CHANI
            </span>
            <span className="text-cyan-700 text-xs font-mono tracking-widest uppercase">
              ID: ORACLE_UNIT_01
            </span>
          </div>
        </div>

        {/* Bagian Terminal Log (Kanan) */}
        <div className="flex-1 w-full">
          {/* Terminal Header */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-cyan-900/80 w-full">
            <div className="flex items-center gap-3">
              <span className="animate-pulse h-3 w-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
              <span className="text-pink-500 font-bold tracking-widest text-sm uppercase drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">CHANI_OS v2.0.4</span>
            </div>
            <span className="text-cyan-700 text-xs font-mono tracking-widest">SYS.BOOT_SEQ</span>
          </div>

          {/* Booting Logs */}
          <div className="space-y-3 mb-8 min-h-[180px] md:min-h-[200px] font-mono text-sm md:text-base">
            {lines.map((line, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-cyan-800/70 shrink-0">
                  [{new Date().toISOString().split('T')[1].slice(0, 8)}]
                </span>
                <span className={index === BOOT_SEQUENCE.length - 1 ? 'text-pink-400 font-bold drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.4)]'}>
                  {line}
                </span>
              </div>
            ))}
            {lines.length < BOOT_SEQUENCE.length && (
              <div className="flex gap-4">
                <span className="text-cyan-800/70 shrink-0">
                  [{new Date().toISOString().split('T')[1].slice(0, 8)}]
                </span>
                <span className="text-cyan-400 animate-pulse font-bold">_</span>
              </div>
            )}
          </div>

          {/* Cyber Progress Bar */}
          <div className="w-full bg-cyan-950/30 border border-cyan-900/80 h-1 mt-4 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right mt-3 text-xs text-cyan-600 font-mono tracking-widest uppercase">
            SYSTEM_LOAD // {progress}%
          </div>
        </div>
      </div>
      
      {/* Scanline CRT Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-30"></div>
    </div>
  );
}

export default TerminalSplash;