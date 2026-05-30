'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, type Locale } from '@/store/settings';

const LANGS: { locale: Locale; flag: string; label: string }[] = [
  { locale: 'ar', flag: '🇸🇦', label: 'عربي' },
  { locale: 'he', flag: '🇮🇱', label: 'עברית' },
  { locale: 'en', flag: '🇬🇧', label: 'English' },
];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const current = LANGS.find((l) => l.locale === locale) ?? LANGS[0];

  return (
    <div className="relative" data-testid="language-selector">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
        aria-label="اختر اللغة"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-xs opacity-70">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[130px]"
          >
            {LANGS.map((lang) => (
              <button
                key={lang.locale}
                onClick={() => { setLocale(lang.locale); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  lang.locale === locale ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                }`}
                style={{ minHeight: 44 }}
              >
                <span>{lang.flag}</span>
                <span className="text-gray-800 dark:text-gray-100">{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
