'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pair { id: string; hebrew: string; arabic: string }
interface Props {
  content: { questionText: string; pairs: Pair[] };
  onAnswer: (matches: Record<string, string>) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function TapPairs({ content, onAnswer, disabled, isCorrect }: Props) {
  const [selectedHebrew, setSelectedHebrew] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});

  // Shuffle right column so it's not in the same order as the left column
  const shuffledRight = useMemo(() => {
    const arr = [...content.pairs];
    const seed = content.pairs.reduce((s, p) => s + p.id.charCodeAt(0), 0);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (seed * (i + 7)) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [content.pairs]);

  const isMatchedHebrew = (id: string) => Object.keys(matched).includes(id);
  const isMatchedArabic = (id: string) => Object.values(matched).includes(id);

  const handleHebrew = (id: string) => {
    if (disabled || isMatchedHebrew(id)) return;
    setSelectedHebrew(prev => prev === id ? null : id);
  };

  const handleArabic = (id: string) => {
    if (disabled || isMatchedArabic(id) || !selectedHebrew) return;
    const next = { ...matched, [selectedHebrew]: id };
    setMatched(next);
    setSelectedHebrew(null);
    if (Object.keys(next).length === content.pairs.length) {
      onAnswer(next);
    }
  };

  const hebrewStyle = (id: string) => {
    if (isMatchedHebrew(id)) return 'border-green-500 bg-green-50 text-green-700 opacity-60';
    if (selectedHebrew === id) return 'border-brand bg-brand text-white shadow-lg scale-105';
    return 'border-gray-200 bg-white hover:border-brand/60';
  };

  const arabicStyle = (id: string) => {
    if (isMatchedArabic(id)) return 'border-green-500 bg-green-50 text-green-700 opacity-60';
    if (selectedHebrew) return 'border-brand/40 bg-brand/5 cursor-pointer';
    return 'border-gray-200 bg-white opacity-70';
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>
      {selectedHebrew && (
        <p className="text-sm text-center text-brand animate-pulse">اختر المقابل العربي الآن ←</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {/* Hebrew column */}
        <div className="flex flex-col gap-3">
          {content.pairs.map((p) => (
            <motion.button
              key={p.id}
              className={`min-h-[52px] px-4 py-3 rounded-xl border-2 font-bold text-lg transition-all ${hebrewStyle(p.id)}`}
              whileTap={!disabled && !isMatchedHebrew(p.id) ? { scale: 0.96 } : {}}
              onClick={() => handleHebrew(p.id)}
              disabled={disabled || isMatchedHebrew(p.id)}
            >
              {p.hebrew}
            </motion.button>
          ))}
        </div>
        {/* Arabic column (shuffled) */}
        <div className="flex flex-col gap-3">
          {shuffledRight.map((p) => (
            <motion.button
              key={p.id + '-ar'}
              className={`min-h-[52px] px-4 py-3 rounded-xl border-2 text-right transition-all ${arabicStyle(p.id)}`}
              whileTap={selectedHebrew && !isMatchedArabic(p.id) ? { scale: 0.96 } : {}}
              onClick={() => handleArabic(p.id)}
              disabled={disabled || isMatchedArabic(p.id) || !selectedHebrew}
            >
              {p.arabic}
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {Object.keys(matched).length === content.pairs.length && !disabled && (
          <motion.p
            className="text-center text-green-600 font-bold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎉 أحسنت! طابقت جميع الأزواج!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
