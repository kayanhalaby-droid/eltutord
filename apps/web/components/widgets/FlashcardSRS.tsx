'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FlashCard {
  front: string;
  back: string;
  transliteration?: string;
}

interface FlashcardSRSProps {
  card: FlashCard;
  onResult: (result: 'know' | 'unsure') => void;
}

export function FlashcardSRS({ card, onResult }: FlashcardSRSProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Card */}
      <div
        data-testid="flip-btn"
        onClick={handleFlip}
        className="w-full max-w-sm min-h-[160px] rounded-3xl border-2 border-[#1A1F5E] bg-white shadow-lg flex flex-col items-center justify-center gap-2 p-6 cursor-pointer"
        role="button"
        aria-label={flipped ? 'الجانب الخلفي' : 'اضغط للكشف'}
      >
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-3xl font-black text-[#1A1F5E] text-center">{card.front}</p>
              <p className="text-xs text-gray-400">اضغط للكشف عن الإجابة</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-3xl font-black text-[#FFD700] text-center">{card.back}</p>
              {card.transliteration && (
                <p className="text-sm text-gray-500 font-medium">{card.transliteration}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result buttons — only visible after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 w-full max-w-sm"
          >
            <button
              data-testid="unsure-btn"
              onClick={() => onResult('unsure')}
              className="flex-1 py-3 rounded-2xl border-2 border-[#EF4444] bg-[#FEE2E2] text-[#B91C1C] font-bold text-sm hover:bg-red-100 transition-colors"
            >
              ما عرفت ✗
            </button>
            <button
              data-testid="know-btn"
              onClick={() => onResult('know')}
              className="flex-1 py-3 rounded-2xl border-2 border-[#22C55E] bg-[#DCFCE7] text-[#15803D] font-bold text-sm hover:bg-green-100 transition-colors"
            >
              عرفت ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
