import Link from 'next/link';
import { Cloud, Droplets, TrendingUp, ArrowRight, Zap, Shield, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-share-tech selection:bg-blue-200">
      
      {/* 1. Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2 text-slate-800">
            <Cloud className="w-6 h-6 text-blue-500" />
            <span>Weath3rBet</span>
          </div>
          <Link href="/dashboard" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg font-medium text-sm shadow-sm">
            Launch App
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Efek Cahaya Latar Belakang (Glow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Weather Markets Available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
            Predict the Weather.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Trade the Outcome.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Advanced weather analytics terminal integrated directly with Polymarket. Analyze real-time radar data and execute your positions in one distraction-free screen.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg hover:shadow-blue-500/25 rounded-xl font-semibold text-lg flex items-center gap-2 group">
              Open Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mockup Preview UI */}
          <div className="mt-20 relative mx-auto w-full max-w-5xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50">
              <div className="aspect-[16/9] rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden relative">
                {/* Ilustrasi Split Screen */}
                <div className="absolute inset-0 grid grid-cols-2 gap-px bg-slate-200">
                   <div className="bg-slate-50 p-8 flex flex-col justify-center items-center text-slate-400">
                      <Cloud className="w-16 h-16 mb-4 text-blue-500" />
                      <p className="font-medium text-slate-500">Weather Data (Mousam UI)</p>
                   </div>
                   <div className="bg-white p-8 flex flex-col justify-center items-center text-slate-400">
                      <TrendingUp className="w-16 h-16 mb-4 text-blue-600" />
                      <p className="font-medium text-slate-500">Polymarket Execution</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-24 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Why Use This Terminal?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">One screen, two great powers. Designed specifically for analysis efficiency and market execution.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Real-Time Data</h3>
              <p className="text-slate-500 leading-relaxed">
                High-precision weather data with clean Mousam Desktop-style UI. Monitor precipitation probability (rain) without distractions.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Seamless Execution</h3>
              <p className="text-slate-500 leading-relaxed">
                View opportunities on Polymarket and execute bets (Yes/No) on the exact same screen next to your radar data.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Web3 Ready</h3>
              <p className="text-slate-500 leading-relaxed">
                Powered by Polygon network and Gamma API. No additional intermediaries, directly connected to the Polymarket ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">How It Works?</h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Analyze the Data', desc: 'Search for a specific city or location in the left terminal. Check weather forecast like temperature and precipitation percentage using actual satellite radar data.' },
              { step: '02', title: 'Spot Inefficiency', desc: 'Compare actual rain probability with "market price" (odds) in the right terminal (Polymarket). Look for gaps where the market underestimates weather facts.' },
              { step: '03', title: 'Make Your Move', desc: 'Make your decision. Connect your wallet and buy YES or NO shares directly from the terminal widget without switching browser tabs.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 md:gap-8 items-start p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex-shrink-0 font-mono text-4xl font-extrabold text-blue-100">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Powered By Section */}
      <section className="py-16 px-6 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">Integrations & Data Sources</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Cloud className="w-6 h-6 text-orange-500" /> Open-Meteo
            </div>
            <div className="text-2xl font-bold font-serif italic text-blue-600">Polymarket</div>
            <div className="text-2xl font-bold tracking-tighter text-slate-900">▲ Next.js</div>
            <div className="text-xl font-bold text-purple-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-600 rounded-full"></div> Polygon
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 px-6 bg-slate-50 text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="font-bold text-xl mb-6 text-slate-700 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-blue-500" /> Weath3rBet
          </div>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
            Disclaimer: This application is merely a data aggregator interface. We do not store funds or execute bets unilaterally. All web3 transactions depend on the user.
          </p>
          <div className="w-24 h-px bg-slate-200 mb-8"></div>
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Weath3rBet Terminal.
          </div>
        </div>
      </footer>

    </div>
  );
}