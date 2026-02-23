'use client';

import { useRef, useState } from 'react';

export function InteractiveBackground() {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOpacity(0)}
      className="fixed inset-0 z-0 overflow-hidden bg-[#050814]"
    >
      {/* --- LAYER 1: THE CORE AMBIENCE (CHANI THEME) --- */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
      </div>

      {/* --- LAYER 2: MOVING HUD ELEMENTS (CROWDED VIBE) --- */}
      <div className="absolute inset-0 bg-grid-mecha pointer-events-none opacity-30" />
      
      {/* Floating Data Particles (increased count for crowded feel) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(150)].map((_, i) => {
          const size = Math.random() > 0.8 ? 'w-1.5 h-1.5' : 'w-1 h-1';
          // Warna partikel variasi Cyan, Blue, dan White
          const colorClass = Math.random() > 0.6 ? 'bg-cyan-400' : Math.random() > 0.3 ? 'bg-blue-500' : 'bg-white';
          
          return (
            <div 
              key={i}
              className={`absolute ${size} ${colorClass} rounded-full animate-float shadow-[0_0_5px_rgba(0,212,255,0.5)]`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.1
              }}
            />
          );
        })}
      </div>

      {/* Additional Geometric Particles (Squares & Lines) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => {
          const isSquare = Math.random() > 0.5;
          const size = Math.random() > 0.8 ? 'w-3 h-3' : 'w-1 h-1';
          return (
            <div 
              key={`geo-${i}`}
              className={`absolute ${size} border border-cyan-500/30 ${isSquare ? 'rounded-none' : 'rounded-full'} animate-float-slow`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: Math.random() * 0.4 + 0.1
              }}
            />
          );
        })}
      </div>

      {/* Vertical Scanning Lines (HUD Effect) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="w-full h-[2px] bg-cyan-400/30 shadow-[0_0_20px_rgba(0,212,255,0.6)] absolute top-0 animate-scan" />
      </div>

      {/* --- LAYER 3: INTERACTIVE SENSOR --- */}
      {/* The Mouse Sensor Spotlight - Reacts to movement */}
      <div 
        className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] transition-opacity duration-300 pointer-events-none mix-blend-screen"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          opacity: opacity
        }}
      />
    </div>
  );
}