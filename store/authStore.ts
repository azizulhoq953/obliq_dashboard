import { create } from 'zustand';
import { User } from '../types';

function normalizePermissionAtom(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._\s]+/g, ':')
    .replace(/:+/g, ':');
}

function normalizePermissions(permissions: string[]): string[] {
  return [...new Set(permissions.map(normalizePermissionAtom))];
}

function setAccessTokenCookie(accessToken: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `access_token=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax`;
}

function clearAccessTokenCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = 'access_token=; Path=/; Max-Age=0; SameSite=Lax';
}

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
    setAccessTokenCookie(accessToken);
    set({ user, accessToken, permissions: normalizePermissions(permissions) });
  },
  clearAuth: () => {
    sessionStorage.removeItem('access_token');
    clearAccessTokenCookie();
    set({ user: null, accessToken: null, permissions: [] });
  },
  hasPermission: (atom) => get().permissions.includes(normalizePermissionAtom(atom)),
}));