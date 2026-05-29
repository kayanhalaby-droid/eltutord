'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlashcardStats } from '@/lib/hooks/useFlashcards';
import FlashcardReviewModal from './FlashcardReviewModal';

export default function FlashcardsWidget() {
  const { data, isLoading } = useFlashcardStats();
  const [showReview, setShowReview] = useState(false);

  if (isLoading) return <div className="h-20 bg-white rounded-2xl animate-pulse" />;

  const total = data?.total ?? 0;
  const dueToday = data?.dueToday ?? 0;
  const reviewed = data?.todayReviewed ?? 0;

  if (total === 0) return null; // Nothing to show until student has flashcards

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Stats */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">🗂️</span>
          <div>
            <p className="text-sm font-extrabold text-brand leading-tight">
              تعلّمت <span className="text-orange-500">{total}</span> كلمة عبرية
            </p>
            {dueToday > 0 ? (
              <p className="text-xs text-muted-foreground">
                {reviewed > 0
                  ? `راجعت ${reviewed} بطاقة اليوم — تبقى ${dueToday} للمراجعة`
                  : `${dueToday} بطاقة جاهزة للمراجعة`
                }
              </p>
            ) : (
              <p className="text-xs text-green-600 font-semibold">✓ راجعت كل بطاقاتك اليوم!</p>
            )}
          </div>
        </div>

        {/* Review button */}
        {dueToday > 0 && (
          <motion.button
            className="bg-brand text-gold font-extrabold text-sm rounded-xl px-3 py-2 shadow hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowReview(true)}
          >
            راجع الآن
          </motion.button>
        )}
      </motion.div>

      {/* Review modal */}
      <AnimatePresence>
        {showReview && (
          <FlashcardReviewModal onClose={() => setShowReview(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
