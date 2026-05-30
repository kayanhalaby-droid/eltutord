'use client';

import { useCallback, useRef } from 'react';
import type { Locale } from '@/store/settings';

const LANG_MAP: Record<Locale, string> = {
  ar: 'ar-SA',
  he: 'he-IL',
  en: 'en-US',
};

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, locale: Locale = 'ar') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_MAP[locale];
    u.rate = 0.9;
    u.pitch = 1.1;
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
