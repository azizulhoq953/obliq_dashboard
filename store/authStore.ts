import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  setAuth: (user: User, token: string, permissions: string[]) => void;
  clearAuth: () => void;
  hasPermission: (atom: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  permissions: [],
  setAuth: (user, accessToken, permissions) => {
    sessionStorage.setItem('access_token', accessToken);
    set({ user, accessToken, permissions });
  },
  clearAuth: () => {
    sessionStorage.removeItem('access_token');
    set({ user: null, accessToken: null, permissions: [] });
  },
  hasPermission: (atom) => get().permissions.includes(atom),
}));