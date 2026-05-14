import { useState } from 'react';
import { ListMusic, Download, Heart, Music2, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

export function LibraryView() {
  const [activeSubTab, setActiveSubTab] = useState<'playlists' | 'liked' | 'downloads'>('playlists');
  const { downloads, playlists, createPlaylist, setSong } = useStore();

  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (name) {
      createPlaylist(name);
    }
  };

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
              onClick={handleCreatePlaylist}
              className="bg-[#18181b] aspect-square rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white/10 transition-all overflow-hidden relative shadow-lg"
            >
              <div className="bg-cyan-500/10 p-6 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <span className="font-bold text-sm">Create New</span>
            </div>
            {playlists.map(playlist => (
              <div 
                key={playlist.id}
                onClick={() => {
                  if (playlist.songs.length > 0) {
                    setSong(playlist.songs[0]);
                  } else {
                    alert(`${playlist.name} is empty!`);
                  }
                }}
                className="bg-[#18181b] aspect-square rounded-3xl border border-white/5 p-4 flex flex-col justify-between group cursor-pointer hover:bg-white/10 transition-all shadow-lg"
              >
                 <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-square border border-white/5 bg-white/5">
                   {playlist.songs.map((song, i) => (
                     i < 4 && <img key={song.id} src={song.thumbnail} className="w-full h-full object-cover" />
                   ))}
                 </div>
                 <div>
                   <h4 className="font-bold group-hover:text-cyan-400 transition-colors truncate">{playlist.name}</h4>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest">{playlist.songs.length} Songs</p>
                 </div>
              </div>
            ))}
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
