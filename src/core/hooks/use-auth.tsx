import type { User } from 'firebase/auth';
import { create } from 'zustand';

import type { IUserData } from '@/types';

interface AuthStore {
  user: User | null;
  userData: IUserData | null;
  loggedIn: boolean;
  setUser: (user: User | null) => void;
  setUserData: (userData: IUserData | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userData: null,
  loggedIn: false,
  setUser: (user: User | null) => set(() => ({ user })),
  setUserData: (userData: IUserData | null) =>
    set((state) => ({ ...state, userData })),
  setLoggedIn: (loggedIn: boolean) => set((state) => ({ ...state, loggedIn })),
}));
