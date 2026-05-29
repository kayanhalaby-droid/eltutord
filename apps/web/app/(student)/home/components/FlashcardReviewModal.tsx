'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';
import { useDueFlashcards, useReviewCard, Flashcard, Difficulty } from '@/lib/hooks/useFlashcards';

interface Props {
  onClose: () => void;
}

const DIFFICULTY_CONFIG = {
  hard:   { label: 'صعب',  emoji: '😓', bg: 'bg-red-500',    days: '1 يوم'  },
  medium: { label: 'وسط',  emoji: '🤔', bg: 'bg-yellow-500', days: '3 أيام' },
  easy:   { label: 'سهل',  emoji: '😊', bg: 'bg-green-500',  days: '7 أيام' },
};

function FlipCard({ card, onRate }: { card: Flashcard; onRate: (d: Difficulty) => void }) {
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Flip card */}
      <div
        className="w-full max-w-xs aspect-[3/2] cursor-pointer perspective-1000"
        onClick={() => setFlipped(true)}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Front — Hebrew */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand to-blue-700 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl p-5"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-5xl font-extrabold text-white tracking-wide">{card.front}</p>
            {showHint && (
              <p className="text-white/70 text-base italic">{card.transliteration}</p>
            )}
            {!showHint && (
              <button
                className="text-white/50 text-xs underline mt-1"
                onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
              >
                اعرض النطق
              </button>
            )}
            <p className="text-white/40 text-xs mt-2">اضغط للكشف</p>
          </div>

          {/* Back — Arabic */}
          <div
            className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl p-5 border-4 border-brand"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-4xl font-extrabold text-brand">{card.back}</p>
            <p className="text-muted-foreground text-sm italic">{card.transliteration}</p>
            <p className="text-lg font-bold text-gray-500 mt-1">{card.front}</p>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons — only shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            className="flex gap-3 w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {(['hard', 'medium', 'easy'] as Difficulty[]).map(diff => {
              const cfg = DIFFICULTY_CONFIG[diff];
              return (
                <button
                  key={diff}
                  className={`flex-1 ${cfg.bg} text-white font-extrabold rounded-2xl py-3 flex flex-col items-center gap-0.5 shadow active:scale-95 transition-all hover:brightness-110`}
                  onClick={() => onRate(diff)}
                >
                  <span className="text-xl">{cfg.emoji}</span>
                  <span className="text-sm">{cfg.label}</span>
                  <span className="text-xs opacity-70">{cfg.days}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-muted-foreground text-sm">اضغط على البطاقة لكشف الإجابة</p>
      )}
    </div>
  );
}

export default function FlashcardReviewModal({ onClose }: Props) {
  const { data, isLoading, refetch } = useDueFlashcards();
  const { mutate: reviewCard, isPending } = useReviewCard();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);

  const cards = data?.cards ?? [];
  const card = cards[currentIdx];

  function handleRate(difficulty: Difficulty) {
    if (!card || isPending) return;
    reviewCard({ cardId: card.id, difficulty }, {
      onSuccess: () => {
        const next = currentIdx + 1;
        setReviewed(r => r + 1);
        if (next >= cards.length) {
          setDone(true);
        } else {
          setCurrentIdx(next);
        }
      },
    });
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-brand font-bold">جاري تحميل البطاقات...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      >
        {done ? (
          /* Completion screen */
          <>
            <NoorOwl expression="excited" size={90} animate />
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-brand">أحسنت! 🎉</h2>
              <p className="text-muted-foreground text-sm mt-1">
                راجعت <span className="font-extrabold text-brand">{reviewed}</span> بطاقة اليوم
              </p>
            </div>
            <button
              className="w-full bg-brand text-gold font-extrabold rounded-2xl py-3 shadow hover:opacity-90 active:scale-95 transition-all"
              onClick={onClose}
            >
              ممتاز! 🔥
            </button>
          </>
        ) : cards.length === 0 ? (
          /* No due cards */
          <>
            <NoorOwl expression="happy" size={80} animate />
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-brand">لا بطاقات للمراجعة!</h2>
              <p className="text-muted-foreground text-sm mt-1">أكمل دروساً لإضافة مفردات جديدة</p>
            </div>
            <button
              className="w-full border-2 border-brand text-brand font-extrabold rounded-2xl py-3 hover:bg-brand/5 transition-all"
              onClick={onClose}
            >
              حسناً
            </button>
          </>
        ) : (
          /* Review flow */
          <>
            {/* Header */}
            <div className="w-full flex items-center justify-between">
              <button onClick={onClose} className="text-muted-foreground text-sm hover:text-red-500 transition-colors">
                ✕ إغلاق
              </button>
              <span className="text-sm font-bold text-brand">
                {currentIdx + 1} / {cards.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                animate={{ width: `${((currentIdx) / cards.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {card && (
                <motion.div
                  key={card.id}
                  className="w-full"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <FlipCard card={card} onRate={handleRate} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
