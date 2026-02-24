import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Radar, Network, TerminalSquare, Cpu } from 'lucide-react';
import { InteractiveBackground } from '@/components/interactive-background';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-share-tech selection:bg-cyan-500/30 relative text-foreground overflow-hidden bg-black">
      {/* Background Component */}
      <InteractiveBackground />

      {/* Cyberpunk Kanji Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-between items-center opacity-[0.03] text-cyan-500 font-bold">
        <div className="text-[15rem] leading-none writing-vertical-rl -ml-10">天気</div> {/* Tenki: Cuaca */}
        <div className="text-[15rem] leading-none writing-vertical-rl -mr-10">予言</div> {/* Yogen: Prediksi */}
      </div>

      {/* Konten Utama (Harus Relative z-10 agar di atas background) */}
      <div className="relative z-10">
        
        {/* 1. Navbar */}
        <nav className="border-b border-cyan-500/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-bold text-xl flex items-center gap-2 text-white">
              <Cpu className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                WEATH3R_TERMINAL
              </span>
            </div>
            <Link href="/dashboard" className="px-5 py-2 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-400 hover:text-cyan-100 transition-all rounded-sm font-medium text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              INITIALIZE APP
            </Link>
          </div>
        </nav>

        {/* 2. Hero Section */}
        <section className="relative pt-24 pb-20 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/60 border border-cyan-500/40 text-cyan-400 text-sm font-medium mb-8 backdrop-blur-sm uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-cyan-500"></span>
              </span>
              Neural Network Online
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
              Predict the <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">Anomaly.</span><br/>
              Trade the <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">Outcome.</span>
            </h1>
            <p className="text-lg md:text-xl text-cyan-100/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Terminal analisis cuaca tingkat lanjut. Terintegrasi langsung dengan Polymarket. Analisis data satelit secara real-time dan eksekusi posisi Anda dibantu oleh Agen AI CHANI.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.6)] font-bold text-lg flex items-center gap-2 group uppercase tracking-wider skew-x-[-10deg] hover:scale-105 duration-200">
                <span className="skew-x-[10deg] flex items-center gap-2">
                  Access Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mockup Preview UI */}
            <div className="mt-24 relative mx-auto w-full max-w-5xl">
              <div className="border border-cyan-500/50 bg-black/80 p-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md">
                <div className="aspect-[16/9] bg-gray-950 flex items-center justify-center border border-cyan-900 overflow-hidden relative">
                  
                  {/* Grid Lines Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                  <div className="absolute inset-0 grid grid-cols-2 gap-px bg-cyan-900/50">
                     
                     {/* Kiri: CHANI Oracle (Menggunakan chani-bg.jpg) */}
                     <div className="bg-black/90 relative p-8 flex flex-col justify-center items-center text-slate-400 overflow-hidden group">
                        {/* Background Image CHANI */}
                        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                          <Image 
                            src="/chani-bg.jpg" 
                            alt="CHANI AI" 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <span className="text-5xl mb-2 font-bold text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,1)] opacity-80">電脳</span>
                          <h3 className="font-bold text-cyan-400 text-2xl tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">CHANI ORACLE</h3>
                          <p className="text-sm text-cyan-100/80 max-w-[85%] leading-relaxed border-t border-cyan-500/30 pt-3">
                            "Memproses anomali cuaca secara real-time untuk memandu prediksi pasar Anda."
                          </p>
                        </div>
                     </div>

                     {/* Kanan: Polymarket Execution */}
                     <div className="bg-black/90 relative p-8 flex flex-col justify-center items-center text-slate-400 overflow-hidden">
                        <div className="absolute right-[-20%] top-[-10%] text-9xl text-pink-500/5 font-bold pointer-events-none">市場</div>
                        <Network className="w-16 h-16 mb-6 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
                        <h3 className="font-bold text-pink-400 text-2xl tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">EXECUTION PROTOCOL</h3>
                        <p className="text-sm text-pink-100/70 text-center max-w-[85%]">
                          Sinkronisasi Polymarket aktif. Siap mengeksekusi probabilitas Yes/No secara instan.
                        </p>
                     </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="py-24 px-6 border-t border-cyan-500/20 bg-black/40 backdrop-blur-md relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Radar, 
                  title: "Real-Time Radar", 
                  color: "text-cyan-400", 
                  borderColor: "group-hover:border-cyan-500/60",
                  shadowColor: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
                  kanji: "気象", // Kisho: Weather
                  desc: "Pemindaian data satelit presisi tinggi. Pantau probabilitas presipitasi tanpa gangguan antarmuka yang rumit."
                },
                {
                  icon: Network, 
                  title: "Seamless Execution", 
                  color: "text-pink-400", 
                  borderColor: "group-hover:border-pink-500/60",
                  shadowColor: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
                  kanji: "実行", // Jikko: Execution
                  desc: "Lihat peluang event di Polymarket dan eksekusi posisi (Yes/No) pada satu terminal yang sama."
                },
                {
                  icon: TerminalSquare, 
                  title: "AI Agent CHANI", 
                  color: "text-yellow-400", 
                  borderColor: "group-hover:border-yellow-500/60",
                  shadowColor: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
                  kanji: "知能", // Chinou: Intelligence
                  desc: "Interaksi chat langsung dengan Agen AI per-event. Dapatkan analisis tajam secara gratis (Fast Model) tanpa perlu repot connect wallet."
                }
              ].map((item, i) => (
                <div key={i} className={`group p-8 bg-gray-900/50 border border-gray-800 transition-all duration-300 relative overflow-hidden ${item.borderColor} ${item.shadowColor}`}>
                  <div className="absolute right-4 top-4 text-4xl font-bold opacity-10 text-white pointer-events-none group-hover:scale-110 transition-transform">
                    {item.kanji}
                  </div>
                  <div className={`w-14 h-14 bg-black/50 border border-gray-800 flex items-center justify-center mb-6 shadow-inner ${item.color}`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-wide uppercase">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                  
                  {/* Decorative Cyber Line */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-current transition-all duration-500 group-hover:w-full opacity-50" style={{ color: item.color === 'text-cyan-400' ? '#22d3ee' : item.color === 'text-pink-400' ? '#f472b6' : '#facc15' }}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Footer */}
        <footer className="py-8 px-6 bg-black text-center border-t border-cyan-900/50">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <p className="text-cyan-600/50 text-xs font-mono tracking-widest uppercase">
              SYS.LOG // {new Date().getFullYear()} // TERMINAL_READY // POWERED BY CHANI_AI
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}