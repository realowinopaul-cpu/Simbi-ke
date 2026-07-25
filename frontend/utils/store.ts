import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone_number: string;
  username: string;
  balance: number;
  total_wins: number;
  total_losses: number;
  total_matches: number;
  total_wagered: number;
  total_winnings: number;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

interface GameStore {
  currentMatchId: string | null;
  queuePosition: number | null;
  setMatchId: (id: string) => void;
  setQueuePosition: (pos: number) => void;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-store' }
  )
);

export const useGameStore = create<GameStore>((set) => ({
  currentMatchId: null,
  queuePosition: null,
  setMatchId: (id) => set({ currentMatchId: id }),
  setQueuePosition: (pos) => set({ queuePosition: pos }),
}));
