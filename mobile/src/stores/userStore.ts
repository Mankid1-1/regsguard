import { create } from 'zustand';
import { storage } from '@/utils/storage';
import type { BusinessProfile, Role } from '@/shared/types';
import { getPermissions } from '@/shared/rbac';
import type { Locale } from '@/shared/i18n/translations';

interface UserState {
  profile: BusinessProfile | null;
  locale: Locale;
  darkMode: boolean;
  permissions: readonly string[];
  setProfile: (profile: BusinessProfile | null) => void;
  setLocale: (locale: Locale) => Promise<void>;
  setDarkMode: (darkMode: boolean) => Promise<void>;
  loadPermissions: (role: Role) => void;
  hydrate: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  locale: 'en',
  darkMode: false,
  permissions: [],

  setProfile: (profile) => set({ profile }),

  setLocale: async (locale) => {
    await storage.set('locale', locale);
    set({ locale });
  },

  setDarkMode: async (darkMode) => {
    await storage.set('darkMode', darkMode);
    set({ darkMode });
  },

  loadPermissions: (role) => {
    set({ permissions: getPermissions(role) });
  },

  hydrate: async () => {
    const locale = (await storage.get<Locale>('locale')) ?? 'en';
    const darkMode = (await storage.get<boolean>('darkMode')) ?? false;
    set({ locale, darkMode });
  },
}));
