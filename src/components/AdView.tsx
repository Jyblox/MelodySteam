import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, PlayCircle } from 'lucide-react';

export function AdView({ onClose }: { onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[#0a0a0b] flex flex-col pt-12 pb-8 px-6 overflow-y-auto no-scrollbar"
    >
      <div className="flex justify-between items-center mb-8 shrink-0">
        <span className="bg-cyan-500/10 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-400/20">AdMob</span>
        {timeLeft === 0 ? (
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
            <X size={24} />
          </button>
        ) : (
          <span className="text-white/40 text-sm font-bold">Skip in {timeLeft}s</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center text-center space-y-8 py-6">
        <div className="w-full max-w-sm aspect-video bg-[#18181b] rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5 shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=450&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Ad Content"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <PlayCircle size={64} className="text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">Experience Premium Sound with MelodyStream</h2>
          <p className="text-xl text-white/60">Unlock offline downloads, ad-free listening, and high-fidelity audio today.</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-cyan-500 text-black py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-cyan-400"
        >
          Get Free Premium (Go to Settings)
          <ExternalLink size={24} />
        </button>
      </div>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold mt-12">
        AdMob Interstitial: {(import.meta as any).env.VITE_ADMOB_UNIT_ID || 'ca-app-pub-xx/xx'}
      </p>
    </motion.div>
  );
}
