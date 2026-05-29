'use client';

import { motion } from 'framer-motion';
import { TrueFalseContent } from '@/lib/types/lesson';

interface Props {
  content: TrueFalseContent;
  onAnswer: (isTrue: boolean) => void;
  disabled?: boolean;
  correctAnswer?: boolean;
  userAnswer?: boolean | null;
}

export default function TrueFalse({ content, onAnswer, disabled, correctAnswer, userAnswer }: Props) {
  const getBtnStyle = (val: boolean) => {
    if (!disabled) return 'border-gray-200 bg-white hover:border-brand/50 text-brand';
    if (correctAnswer === val) return 'border-green-500 bg-green-50 text-green-700 font-bold';
    if (userAnswer === val && userAnswer !== correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-bold text-brand text-center leading-relaxed">{content.statement}</p>
      <div className="flex gap-4 justify-center">
        {[
          { label: '✓ صحيح', value: true },
          { label: '✗ خطأ', value: false },
        ].map(({ label, value }) => (
          <motion.button
            key={String(value)}
            className={`flex-1 max-w-[160px] py-4 rounded-2xl border-2 text-lg font-bold transition-all ${getBtnStyle(value)}`}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={() => !disabled && onAnswer(value)}
            disabled={disabled}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
