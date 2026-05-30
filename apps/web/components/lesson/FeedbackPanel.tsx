'use client';

import { motion } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';

interface FeedbackPanelProps {
  isCorrect: boolean;
  correctAnswerText: string;
  explanation?: string;
  onNext: () => void;
}

export function FeedbackPanel({ isCorrect, correctAnswerText, explanation, onNext }: FeedbackPanelProps) {
  const message = isCorrect
    ? 'ممتاز! إجابة صحيحة 🌟'
    : `الإجابة الصحيحة: ${correctAnswerText}`;

  return (
    <motion.div
      data-testid="feedback-panel"
      className={`rounded-[20px] p-4 flex items-center justify-between gap-3
        ${isCorrect
          ? 'border-2 border-[#22C55E] bg-[#DCFCE7]'
          : 'border-2 border-[#EF4444] bg-[#FEE2E2]'}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Noor with speech bubble */}
        <div className="shrink-0">
          <NoorOwl
            expression={isCorrect ? 'celebrating' : 'encouraging'}
            size={52}
            animate
            message={message}
          />
        </div>

        <div className="min-w-0">
          <p className={`font-extrabold text-base flex items-center gap-1.5 ${isCorrect ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
            <span className="text-xl">{isCorrect ? '✓' : '✗'}</span>
            {isCorrect ? 'ممتاز!' : 'تقريباً!'}
          </p>

          {!isCorrect && correctAnswerText && (
            <p className="text-sm text-[#15803D] font-bold mt-1">
              الإجابة: {correctAnswerText}
            </p>
          )}

          {explanation && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{explanation}</p>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className={`shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95
          ${isCorrect ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
      >
        التالي
      </button>
    </motion.div>
  );
}
