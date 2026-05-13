import { create } from 'zustand';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  downloads: Song[];
  isPremium: boolean;
  setSong: (song: Song) => void;
  togglePlay: () => void;
  addToQueue: (song: Song) => void;
  setPremium: (status: boolean) => void;
  nextSong: () => void;
  prevSong: () => void;
  downloadSong: (song: Song) => void;
}

export const useStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  history: (() => {
    try { return JSON.parse(localStorage.getItem('history') || '[]'); } 
    catch { return []; }
  })() || [],
  downloads: (() => {
    try { return JSON.parse(localStorage.getItem('downloads') || '[]'); } 
    catch { return []; }
  })() || [],
  isPremium: false,
  setSong: (song) => set((state) => {
    const newHistory = [song, ...state.history.filter(s => s.id !== song.id)].slice(0, 50);
    localStorage.setItem('history', JSON.stringify(newHistory));
    return {
      currentSong: song,
      isPlaying: true,
      history: newHistory
    };
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  setPremium: (status) => set({ isPremium: status }),
  nextSong: () => {
    const { queue, setSong } = get();
    if (queue.length > 0) {
      const next = queue[0];
      set({ queue: queue.slice(1) });
      setSong(next);
    }
  },
  prevSong: () => {
    const { history, setSong, currentSong } = get();
    if (history.length > 1) {
      // Find current in history and get the one after it
      const currentIndex = history.findIndex(s => s.id === currentSong?.id);
      if (currentIndex !== -1 && currentIndex < history.length - 1) {
        const prev = history[currentIndex + 1];
        setSong(prev);
      }
    }
  },
  downloadSong: (song) => set((state) => {
    const newDownloads = state.downloads.some(s => s.id === song.id) 
      ? state.downloads 
      : [...state.downloads, song];
    localStorage.setItem('downloads', JSON.stringify(newDownloads));
    return { downloads: newDownloads };
  }),
}));
