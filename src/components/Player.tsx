import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Heart, Download, ChevronDown, ListMusic, Repeat, Shuffle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Player({ onDownload, onSkip }: { onDownload: () => void, onSkip: () => void }) {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [streamUrl, setStreamUrl] = useState<string | undefined>();
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (currentSong) {
      if (currentSong.streamUrl) {
         setStreamUrl(currentSong.streamUrl);
      } else {
         // Fallback if somehow there's no streamUrl (e.g. old history)
         setStreamUrl(`https://api.jamendo.com/v3.0/tracks/file/?client_id=c9cb2a0a&action=stream&audioformat=mp32&id=${currentSong.id}`);
      }
    } else {
      setStreamUrl(undefined);
    }
  }, [currentSong]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isExpanded]);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying && currentSong) {
        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e: Error) => console.log('Playback interrupted:', e));
        }
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 w-32 h-32 opacity-0 pointer-events-none z-[-1]">
          <audio
            ref={playerRef}
            src={streamUrl}
            autoPlay={true}
            onTimeUpdate={(e) => {
              const target = e.target as HTMLAudioElement;
              setPlayed(target.currentTime);
              setProgress((target.currentTime / target.duration) * 100);
            }}
            onLoadedMetadata={(e) => {
              const target = e.target as HTMLAudioElement;
              setDuration(target.duration);
            }}
            onEnded={() => {
              if (currentSong) {
                onSkip();
                nextSong();
              }
            }}
            onError={(e) => {
              console.error("Audio error:", (e.target as HTMLAudioElement).error);
            }}
          />
      </div>

      {!currentSong ? null : (
        <>
          {/* Mini Player */}
          <motion.div 
        layoutId="player"
        onClick={() => setIsExpanded(true)}
        className={cn(
          "fixed bottom-24 left-4 right-4 z-40 bg-[#151619]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-2xl transition-all cursor-pointer",
          isExpanded && "opacity-0 pointer-events-none"
        )}
      >
        <img src={currentSong.thumbnail} alt={currentSong.title} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{currentSong.title}</h4>
          <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-2 text-white/40 hover:text-white">
            <Download size={20} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="bg-cyan-500 p-2 rounded-full shadow-lg shadow-cyan-500/20">
            {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="text-black ml-0.5" />}
          </button>
        </div>
        <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/5">
          <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>

      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0b] flex flex-col pt-12 pb-16 px-8 overflow-y-auto no-scrollbar"
          >
             {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none -z-10 fixed">
              <div className="absolute top-0 left-0 w-full h-[60%] bg-linear-to-b from-indigo-900/40 to-transparent opacity-40 blur-[100px]" />
              <img src={currentSong.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-[80px]" alt="" />
            </div>

            <div className="flex justify-between items-center mb-8 shrink-0">
              <button onClick={() => setIsExpanded(false)} className="p-2 text-white/60 hover:text-white">
                <ChevronDown size={28} />
              </button>
              <h5 className="uppercase tracking-[0.2em] text-[10px] font-bold text-white/40">Now Playing</h5>
              <button 
                onClick={() => {
                  const { playlists, addSongToPlaylist } = useStore.getState();
                  if (playlists.length === 0) {
                    alert("You don't have any playlists yet! Go to Library to create one.");
                    return;
                  }
                  const playlistNames = playlists.map((p, i) => `${i + 1}: ${p.name}`).join('\n');
                  const input = prompt(`Enter the number of the playlist to add this song to:\n${playlistNames}`);
                  const idx = parseInt(input || '') - 1;
                  if (!isNaN(idx) && playlists[idx]) {
                    addSongToPlaylist(playlists[idx].id, currentSong);
                    alert(`Added to ${playlists[idx].name}!`);
                  }
                }}
                className="p-2 text-white/60 hover:text-white"
              >
                <ListMusic size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-8 min-h-0 py-4">
              <motion.div 
                layoutId="player-art"
                className="aspect-square w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] shrink-0"
              >
                <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
              </motion.div>

              <div className="space-y-4 shrink-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{currentSong.title}</h2>
                      <p className="text-base text-white/40">{currentSong.artist}</p>
                    </div>
                    <Heart className="text-cyan-400" fill="#22d3ee" size={24} />
                  </div>
                </div>
              </div>

              <div className="space-y-5 shrink-0">
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <span>{formatTime(played)}</span>
                    <span>{formatTime(duration) || currentSong.duration}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Shuffle className="text-white/40" size={20} />
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevSong(); }}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <SkipBack size={14} fill="white" className="text-white" />
                    </button>
                    <button onClick={togglePlay} className="bg-white p-5 rounded-full text-black shadow-xl scale-110 active:scale-95 transition-transform">
                      {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSkip(); nextSong(); }}
                      className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 border-cyan-500/30 transition-colors shadow-lg shadow-cyan-500/10"
                    >
                      <SkipForward size={14} fill="#22d3ee" className="text-cyan-400" />
                    </button>
                  </div>
                  <Repeat className="text-white/40" size={20} />
                </div>

                <div className="flex justify-center">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 bg-cyan-400/5 px-6 py-3 rounded-full border border-cyan-400/20 active:scale-95 transition-transform"
                  >
                    <Download size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Save MP3 Offline</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </>
  );
}
