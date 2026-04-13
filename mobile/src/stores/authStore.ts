import { create } from 'zustand';
import { keychain } from '@/utils/keychain';
import { storage } from '@/utils/storage';
import type { AuthUser } from '@/shared/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    try {
      const token = await keychain.getToken();
      const user = await storage.get<AuthUser>('auth_user');
      if (token && user) {
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (token: string, user: AuthUser) => {
    await keychain.setToken(token);
    await storage.set('auth_user', user);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await keychain.clearToken();
    await storage.remove('auth_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: async (updates: Partial<AuthUser>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    await storage.set('auth_user', updated);
    set({ user: updated });
  },
}));
