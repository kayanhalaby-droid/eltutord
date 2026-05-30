'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings';

export function ThemeApplier() {
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const isDyslexicFontEnabled = useSettingsStore((s) => s.isDyslexicFontEnabled);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isDyslexicFontEnabled) {
      document.body.classList.add('font-opendyslexic');
    } else {
      document.body.classList.remove('font-opendyslexic');
    }
  }, [isDyslexicFontEnabled]);

  return null;
}
