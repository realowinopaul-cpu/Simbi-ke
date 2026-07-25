import { create } from 'zustand';

interface AuthStore {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user: any) => set({ user, isAuthenticated: true }),
  setToken: (token: string) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

interface GameStore {
  roomId: string | null;
  queuePosition: number | null;
  balance: number;
  setRoomId: (roomId: string) => void;
  setQueuePosition: (position: number) => void;
  setBalance: (balance: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  queuePosition: null,
  balance: 0,
  setRoomId: (roomId: string) => set({ roomId }),
  setQueuePosition: (position: number) => set({ queuePosition: position }),
  setBalance: (balance: number) => set({ balance }),
}));
