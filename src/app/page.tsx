import Link from 'next/link';
import { Cloud, TrendingUp, ArrowRight, Zap, Shield, Activity } from 'lucide-react';
import { InteractiveBackground } from '@/components/interactive-background';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-share-tech selection:bg-primary/30 relative text-foreground">
      {/* Background Component */}
      <InteractiveBackground />

      {/* Konten Utama (Harus Relative z-10 agar di atas background) */}
      <div className="relative z-10">
        
        {/* 1. Navbar */}
        <nav className="border-b border-primary/20 bg-surface/70 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-bold text-xl flex items-center gap-2 text-white">
              <Cloud className="w-6 h-6 text-primary" />
              <span>Weath3rBet</span>
            </div>
            <Link href="/dashboard" className="px-5 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary hover:text-white transition-all rounded-lg font-medium text-sm shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              Launch App
            </Link>
          </div>
        </nav>

        {/* 2. Hero Section */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live Weather Markets Available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white drop-shadow-lg">
              Predict the Weather.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Trade the Outcome.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Advanced weather analytics terminal integrated directly with Polymarket. Analyze real-time radar data and execute your positions in one distraction-free screen.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard" className="px-8 py-4 bg-primary hover:bg-cyan-400 text-black transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] rounded-xl font-bold text-lg flex items-center gap-2 group">
                Open Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mockup Preview UI */}
            <div className="mt-20 relative mx-auto w-full max-w-5xl">
              <div className="rounded-2xl border border-primary/30 bg-surface/50 p-2 shadow-2xl shadow-primary/10 backdrop-blur-sm">
                <div className="aspect-[16/9] rounded-xl bg-black/50 flex items-center justify-center border border-primary/20 overflow-hidden relative">
                  <div className="absolute inset-0 grid grid-cols-2 gap-px bg-primary/20">
                     <div className="bg-surface/80 p-8 flex flex-col justify-center items-center text-slate-400">
                        <Cloud className="w-16 h-16 mb-4 text-primary" />
                        <p className="font-medium text-primary/70">Weather Data (Mousam UI)</p>
                     </div>
                     <div className="bg-surface/90 p-8 flex flex-col justify-center items-center text-slate-400">
                        <TrendingUp className="w-16 h-16 mb-4 text-blue-500" />
                        <p className="font-medium text-blue-400">Polymarket Execution</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="py-24 px-6 border-t border-primary/20 bg-surface/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {icon: Activity, title: "Real-Time Data", color: "text-primary", desc: "High-precision weather data with clean UI. Monitor precipitation probability without distractions."},
                {icon: Zap, title: "Seamless Execution", color: "text-yellow-400", desc: "View opportunities on Polymarket and execute bets (Yes/No) on the exact same screen."},
                {icon: Shield, title: "Web3 Ready", color: "text-purple-400", desc: "Powered by Polygon network and Gamma API. Directly connected to the ecosystem."}
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-surface/40 border border-primary/20 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Footer */}
        <footer className="py-12 px-6 bg-surface/80 text-center border-t border-primary/20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Weath3rBet Terminal. Powered by CHANI AI.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}