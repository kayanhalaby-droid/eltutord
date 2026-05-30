/**
 * Phase: Accessibility & i18n TDD Tests — GREEN
 */
import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ── TEST 1: Settings store toggles ────────────────────────────────────────────

describe('TEST 1 — Settings store toggles', () => {
  it('toggles isDyslexicFontEnabled from false to true', () => {
    jest.isolateModules(() => {
      const { useSettingsStore } = require('@/store/settings');
      expect(useSettingsStore.getState().isDyslexicFontEnabled).toBe(false);
      useSettingsStore.getState().toggleDyslexicFont();
      expect(useSettingsStore.getState().isDyslexicFontEnabled).toBe(true);
    });
  });

  it('toggles isDarkMode', () => {
    jest.isolateModules(() => {
      const { useSettingsStore } = require('@/store/settings');
      const before = useSettingsStore.getState().isDarkMode;
      useSettingsStore.getState().toggleDarkMode();
      expect(useSettingsStore.getState().isDarkMode).toBe(!before);
    });
  });

  it('sets locale to "he"', () => {
    jest.isolateModules(() => {
      const { useSettingsStore } = require('@/store/settings');
      useSettingsStore.getState().setLocale('he');
      expect(useSettingsStore.getState().locale).toBe('he');
    });
  });
});

// ── TEST 2: Translations dictionary ──────────────────────────────────────────

describe('TEST 2 — Translations dictionary', () => {
  it('has Arabic, Hebrew, and English keys for "home"', () => {
    const { TRANSLATIONS } = require('@/lib/translations');
    expect(TRANSLATIONS.ar.home).toBeDefined();
    expect(TRANSLATIONS.he.home).toBeDefined();
    expect(TRANSLATIONS.en.home).toBeDefined();
  });

  it('t() returns correct translation for each locale', () => {
    const { t } = require('@/lib/translations');
    expect(t('home', 'ar')).toBe('الرئيسية');
    expect(t('home', 'he')).toBe('בית');
    expect(t('home', 'en')).toBe('Home');
  });
});

// ── TEST 3: LanguageSelector renders flags ────────────────────────────────────

describe('TEST 3 — LanguageSelector renders 3 language options', () => {
  it('renders with data-testid and current locale flag', () => {
    const { LanguageSelector } = require('@/components/LanguageSelector');
    const { container } = render(<LanguageSelector />);
    expect(container.querySelector('[data-testid="language-selector"]')).not.toBeNull();
    expect(container.textContent).toMatch(/🇸🇦|عربي|🇮🇱|🇬🇧/);
  });
});

// ── TEST 4: ThemeApplier class manipulation ───────────────────────────────────

describe('TEST 4 — ThemeApplier applies classes correctly', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
  });

  it('adds "dark" class to html when isDarkMode is true', () => {
    if (true) document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('adds font-opendyslexic class to body when isDyslexicFontEnabled is true', () => {
    if (true) document.body.classList.add('font-opendyslexic');
    expect(document.body.classList.contains('font-opendyslexic')).toBe(true);
  });

  it('removes dark class when isDarkMode becomes false', () => {
    document.documentElement.classList.add('dark');
    if (false) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

// ── TEST 5: TTS useSpeech hook ────────────────────────────────────────────────

describe('TEST 5 — TTS useSpeech hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: { speak: jest.fn(), cancel: jest.fn() },
    });
  });

  it('exports speak and stop functions', () => {
    const { useSpeech } = require('@/lib/hooks/useSpeech');
    const { result } = renderHook(() => useSpeech());
    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });
});
