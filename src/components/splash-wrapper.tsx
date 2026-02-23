'use client';
import { useState, useEffect } from 'react';
import { TerminalSplash } from './terminal-splash';

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Cek apakah user sudah melihat splash screen di sesi browser ini
    const hasSeenSplash = sessionStorage.getItem('chani_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    // Simpan data ke session storage saat splash screen selesai
    sessionStorage.setItem('chani_splash_seen', 'true');
    setShowSplash(false);
  };

  if (!mounted) return null;

  if (showSplash) {
    return <TerminalSplash onComplete={handleSplashComplete} />;
  }

  return <>{children}</>;
}