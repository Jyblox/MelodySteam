import { useState } from 'react';
import { ListMusic, Download, Heart, Music2, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

export function LibraryView() {
  const [activeSubTab, setActiveSubTab] = useState<'playlists' | 'liked' | 'downloads'>('playlists');
  const { downloads, setSong } = useStore();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <h1 className="text-4xl font-bold tracking-tight">Your Library</h1>
        <button className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <Plus size={24} />
        </button>
      </header>

      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5">
        <button 
          onClick={() => setActiveSubTab('playlists')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeSubTab === 'playlists' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white/60'}`}
        >
          Playlists
        </button>
        <button 
          onClick={() => setActiveSubTab('liked')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeSubTab === 'liked' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white/60'}`}
        >
          Liked
        </button>
        <button 
          onClick={() => setActiveSubTab('downloads')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeSubTab === 'downloads' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white/60'}`}
        >
          Offline
        </button>
      </div>

      <div className="space-y-4">
        {activeSubTab === 'playlists' && (
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => alert('Coming Soon: Custom Playlists')}
              className="bg-[#18181b] aspect-square rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white/10 transition-all overflow-hidden relative shadow-lg"
            >
              <div className="bg-cyan-500/10 p-6 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <span className="font-bold text-sm">Create New</span>
            </div>
            <div 
              onClick={() => alert('Coming Soon: Opening Playlists')}
              className="bg-[#18181b] aspect-square rounded-3xl border border-white/5 p-4 flex flex-col justify-between group cursor-pointer hover:bg-white/10 transition-all shadow-lg"
            >
               <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-square">
                 <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" className="w-full h-full" />
                 <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100&h=100&fit=crop" className="w-full h-full" />
                 <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" className="w-full h-full" />
                 <img src="https://images.unsplash.com/photo-1459749411177-042180ce673c?w=100&h=100&fit=crop" className="w-full h-full" />
               </div>
               <div>
                 <h4 className="font-bold group-hover:text-cyan-400 transition-colors">Heavy Beats</h4>
                 <p className="text-[10px] text-white/40 uppercase tracking-widest">12 Songs</p>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'liked' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-white/5 p-8 rounded-full">
              <Heart size={48} className="text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Liked Songs</h3>
              <p className="text-white/40">Songs you like will appear here.</p>
            </div>
          </div>
        )}

        {activeSubTab === 'downloads' && (
          <div className="space-y-3">
            {downloads.length > 0 ? (
              downloads.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-4 bg-[#18181b] p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
                  onClick={() => setSong(song)}
                >
                  <img src={song.thumbnail} alt={song.title} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm tracking-tight group-hover:text-cyan-400 transition-colors">{song.title}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{song.artist}</p>
                  </div>
                  <div className="bg-cyan-500/10 p-2 rounded-full text-cyan-400">
                    <Music2 size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-white/5 p-8 rounded-full">
                  <Download size={48} className="text-white/20" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Your offline vault is empty</h3>
                  <p className="text-white/40 text-sm">Download songs to listen without internet.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
