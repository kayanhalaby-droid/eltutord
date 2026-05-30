import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'ar' | 'he' | 'en';

interface SettingsState {
  isDyslexicFontEnabled: boolean;
  isDarkMode: boolean;
  isMascotMuted: boolean;
  locale: Locale;
  toggleDyslexicFont: () => void;
  toggleDarkMode: () => void;
  toggleMascotMute: () => void;
  setLocale: (locale: Locale) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDyslexicFontEnabled: false,
      isDarkMode: false,
      isMascotMuted: false,
      locale: 'ar' as Locale,
      toggleDyslexicFont: () => set((s) => ({ isDyslexicFontEnabled: !s.isDyslexicFontEnabled })),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      toggleMascotMute: () => set((s) => ({ isMascotMuted: !s.isMascotMuted })),
      setLocale: (locale: Locale) => set({ locale }),
    }),
    { name: 'elitutor-settings' },
  ),
);
