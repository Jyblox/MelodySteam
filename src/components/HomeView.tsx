import { useState, useEffect } from 'react';
import { Search, Play, MoreVertical, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

export function HomeView({ isSearch, onSearch }: { isSearch?: boolean, onSearch?: () => void }) {
  const { setSong, history } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Deduplicate history to show unique recently played songs
  const recentPlayed = history.filter((song, index, self) =>
    index === self.findIndex((s) => s.id === song.id)
  ).slice(0, 10);

  const trending = [
    { id: "1", title: "Recent Hit", artist: "MelodyStream", duration: "3:50", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
    { id: "2", title: "Vibe Mix", artist: "MelodyStream", duration: "4:03", thumbnail: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop" },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        try {
          const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (Array.isArray(res.data)) {
            setResults(res.data);
          } else {
            console.error("Invalid API response", res.data);
            setResults([]);
          }
          if (onSearch) onSearch();
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePlaySong = (song: any, allResults: any[]) => {
    setSong(song);
    const index = allResults.findIndex(s => s.id === song.id);
    if (index !== -1) {
      const nextSongs = allResults.slice(index + 1);
      useStore.setState({ queue: nextSongs });
    }
    
    // Scroll to top
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {isSearch && (
        <div className="relative">
          {loading ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 animate-spin" size={20} />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          )}
          <input 
            type="text" 
            placeholder="Search for songs, artists, or albums..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {!searchQuery && (
        <>
          <section>
            <div className="flex justify-between items-end mb-6 text-white">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                <p className="text-white/40 text-sm">Popular this week</p>
              </div>
              <button className="text-cyan-400 text-sm font-semibold">See All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {trending.map((song) => (
                <div 
                  key={song.id} 
                  className="min-w-[160px] space-y-3 cursor-pointer group p-3 rounded-2xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all text-white"
                  onClick={() => handlePlaySong(song, trending)}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/20">
                        <Play fill="black" size={24} className="text-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold truncate">{song.title}</h3>
                    <p className="text-xs text-white/40">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-white">Recently Played</h2>
            <div className="space-y-2">
              {recentPlayed.length > 0 ? (
                recentPlayed.map((song) => (
                  <div 
                    key={song.id} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer text-white"
                    onClick={() => handlePlaySong(song, recentPlayed)}
                  >
                    <img src={song.thumbnail} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{song.title}</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{song.artist}</p>
                    </div>
                    <MoreVertical size={20} className="text-white/20" />
                  </div>
                ))
              ) : (
                <div className="bg-white/5 p-8 rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">No History Yet</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {searchQuery && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-white/60">Results for "{searchQuery}"</h2>
          <div className="space-y-4">
             {results.map((song) => (
               <div 
                 key={song.id} 
                 className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group text-white"
                 onClick={() => handlePlaySong(song, results)}
               >
                 <img src={song.thumbnail} alt={song.title} className="w-16 h-16 rounded-xl object-cover" />
                 <div className="flex-1">
                   <h3 className="font-bold group-hover:text-cyan-400 transition-colors">{song.title}</h3>
                   <p className="text-sm text-white/40">{song.artist}</p>
                 </div>
                 <Play size={20} className="text-cyan-400" />
               </div>
             ))}
             {results.length === 0 && !loading && (
               <p className="text-white/40 text-center py-10">No results found.</p>
             )}
          </div>
        </section>
      )}
    </div>
  );
}
