'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';

export interface TranslateContent {
  question: string;
  sourceLabel?: string;
  source: string;      // colloquial (for TRANSLATE) or formal (for TRANSLATE_REVERSE)
  hint?: string;
  options?: string[];  // if provided → choice, else → type
  correct: string;
  emoji?: string;
}

interface Props {
  content: TranslateContent;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function Translate({ content, onAnswer, disabled, isCorrect }: Props) {
  const { speak } = useTTS();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    if (disabled) return;
    speak(opt);
    setSelected(opt);
    onAnswer(opt);
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Question */}
      <p className="text-xl font-extrabold text-[#1A1F5E] text-center">{content.question}</p>

      {/* Source word/phrase */}
      <motion.button
        className="w-full bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col items-center gap-2"
        onClick={() => speak(content.source)}
        whileTap={{ scale: 0.98 }}
      >
        {content.emoji && <span className="text-5xl">{content.emoji}</span>}
        {content.sourceLabel && (
          <span className="text-xs font-bold text-amber-600">{content.sourceLabel}</span>
        )}
        <span className="text-3xl font-extrabold text-gray-800">{content.source}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">🔊 اضغط للاستماع</span>
      </motion.button>

      {content.hint && (
        <p className="text-sm text-center text-muted-foreground bg-yellow-50 rounded-xl p-2">
          💡 {content.hint}
        </p>
      )}

      {/* Options or input */}
      {content.options ? (
        <div className="flex flex-col gap-3">
          {content.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrectOpt = opt === content.correct;
            let style = 'border-gray-200 bg-white hover:border-[#1A1F5E]/40';
            if (disabled) {
              if (isCorrectOpt) style = 'border-green-500 bg-green-50 text-green-700';
              else if (isSelected) style = 'border-red-400 bg-red-50 text-red-700';
              else style = 'border-gray-200 bg-gray-50 opacity-40';
            } else if (isSelected) {
              style = 'border-[#1A1F5E] bg-[#1A1F5E]/10';
            }
            return (
              <motion.button
                key={i}
                className={`px-5 py-4 rounded-2xl border-2 font-extrabold text-2xl text-center transition-all ${style}`}
                whileTap={disabled ? {} : { scale: 0.97 }}
                onClick={() => handleSelect(opt)}
                disabled={disabled}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            className="w-full border-2 border-gray-200 rounded-2xl p-4 text-2xl text-center font-bold focus:border-[#1A1F5E] outline-none"
            dir="rtl"
            placeholder="اكتب الإجابة هنا..."
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                onAnswer((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
          <button
            className="w-full py-3.5 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl"
            disabled={disabled}
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement);
              if (input?.value.trim()) onAnswer(input.value.trim());
            }}
          >
            تأكيد
          </button>
          {disabled && (
            <div className={`p-3 rounded-xl text-center text-lg font-extrabold ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              الإجابة الصحيحة: {content.correct}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
