import { useEffect, useState } from 'react';
import { Home, Search, Library, Settings, Crown } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useStore } from './store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { SettingsView } from './components/SettingsView';
import { Player } from './components/Player';
import { AdView } from './components/AdView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'settings'>('home');
  const [user, setUser] = useState<any>(null);
  const { currentSong, isPremium, setPremium, downloadSong } = useStore();
  const [showAd, setShowAd] = useState(false);
  const [skipCount, setSkipCount] = useState(0);

  useEffect(() => {
    if (showAd) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAd]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setPremium(userDoc.data().isPremium);
        } else {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isPremium: false,
            createdAt: new Date().toISOString()
          });
          setPremium(false);
        }
      } else {
        setUser(null);
        setPremium(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleSkip = () => {
    if (isPremium) return;
    const newCount = skipCount + 1;
    if (newCount >= 3) {
      setShowAd(true);
      setSkipCount(0);
    } else {
      setSkipCount(newCount);
    }
  };

  const handleDownloadClick = () => {
    if (!isPremium) {
      setShowAd(true);
      return;
    }
    if (currentSong) {
      downloadSong(currentSong);
      alert(`${currentSong.title} added to offline library!`);
    }
  };

  // Accents based on Sleek Interface
  const accentColor = "cyan-400";
  const accentHex = "#22d3ee";

  const handleSearch = () => {
    if (isPremium) return;
    setShowAd(true);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] text-white font-sans overflow-hidden flex flex-col">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-linear-to-b from-indigo-900/20 to-transparent opacity-40 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-radial from-cyan-500/10 to-transparent opacity-20 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 flex-1 overflow-y-auto pb-48 pt-6">
        <div className="max-w-md mx-auto px-6">
           {activeTab === 'home' && <HomeView />}
           {activeTab === 'search' && <HomeView isSearch onSearch={handleSearch} />}
           {activeTab === 'library' && <LibraryView />}
           {activeTab === 'settings' && <SettingsView user={user} />}
        </div>
      </main>

      {/* Mini Player / Player Overlay */}
      <Player onDownload={handleDownloadClick} onSkip={handleSkip} />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121214]/90 backdrop-blur-3xl border-t border-white/5 pb-10 pt-4 px-8 flex justify-between items-center max-w-md mx-auto rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.6)]">
        <NavButton active={activeTab === 'home'} icon={<Home />} label="Home" onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'search'} icon={<Search />} label="Search" onClick={() => setActiveTab('search')} />
        <NavButton active={activeTab === 'library'} icon={<Library />} label="Library" onClick={() => setActiveTab('library')} />
        <NavButton active={activeTab === 'settings'} icon={<Settings />} label="Settings" onClick={() => setActiveTab('settings')} />
      </nav>

      {/* Interstitial Ad */}
      <AnimatePresence mode="wait">
        {showAd && <AdView key="ad" onClose={() => setShowAd(false)} />}
      </AnimatePresence>

      {!isPremium && user && (
        <div className="fixed top-8 right-8 z-[60]">
          <button 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-2.5 rounded-full font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-cyan-400/50"
          >
            <Crown size={14} />
            PRO
          </button>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1.5 transition-all outline-none", active ? "text-cyan-400 scale-110" : "text-white/30 hover:text-white/60")}>
      <div className={cn("p-1.5 rounded-xl transition-all", active && "bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]")}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}
