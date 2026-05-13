import { useState } from 'react';
import { User, ShieldCheck, LogOut, CreditCard, Bell, HelpCircle, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import axios from 'axios';

export function SettingsView({ user }: { user: any }) {
  const { isPremium, setPremium } = useStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpgrade = async () => {
    if (!user) {
      alert("Please login first to upgrade.");
      return;
    }
    setLoading(true);
    try {
      // Simulate Stripe Payment Gateway
      const res = await axios.post('/api/payments/verify', {
        paymentId: 'fake_stripe_id_' + Date.now(),
        amount: 9.99
      });
      
      if (res.data.status === 'success') {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            isPremium: true
          }, { merge: true });
        } catch (dbError) {
          console.warn('Could not save to database, but payment succeeded:', dbError);
        }
        setPremium(true);
        alert("Welcome to MelodyStream Pro! Ads have been removed permanently.");
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-white/40 text-sm">Manage your account and preferences</p>
      </header>

      {user ? (
        <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-lg">
          <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-20 h-20 rounded-2xl border-2 border-cyan-500 shadow-lg shadow-cyan-500/20" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">{user.displayName}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1.5 mt-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <ShieldCheck size={12} />
                Pro Member
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#18181b] p-10 rounded-3xl border border-white/5 text-center space-y-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Join the Community</h3>
            <p className="text-white/40">Sync your playlists across all your devices.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-95 shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      )}

      {!isPremium && user && (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-cyan-500 p-8 rounded-3xl space-y-6 shadow-[0_20px_40px_rgba(34,211,238,0.2)]">
          <Sparkles className="absolute top-4 right-4 text-white/40" size={64} />
          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-black italic tracking-tighter">MELODYSTREAM PRO</h2>
            <p className="text-white/90 font-medium">Remove all ads, enable high-quality streaming, and download unlimited songs for offline playback.</p>
          </div>
          <button 
            onClick={handleUpgrade}
            disabled={loading}
            className="relative z-10 w-full bg-black text-white py-4 rounded-xl font-bold shadow-2xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Get Pro - $9.99 Life-time"}
          </button>
        </section>
      )}

      <div className="space-y-2">
        <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Settings</h3>
        <SettingsItem icon={<CreditCard size={20} />} label="Billing & Payments" />
        <SettingsItem icon={<Bell size={20} />} label="Notifications" />
        <SettingsItem icon={<HelpCircle size={20} />} label="Support & Help" />
        {user && (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all mt-4"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={() => alert(`Coming Soon: ${label}`)}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#18181b] border border-white/5 hover:bg-white/5 transition-all group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="text-white/40 group-hover:text-cyan-400 transition-colors">{icon}</div>
        <span className="font-semibold">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20" />
    </button>
  );
}
