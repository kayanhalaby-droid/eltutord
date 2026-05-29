'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';
import { wordToEmoji } from '@/lib/arabicEmoji';

export interface ImageOption {
  id: string;
  emoji?: string;
  imageQuery?: string;
  label: string;
}

export interface ImageChoiceContent {
  questionText: string;
  audioText?: string;
  imageQuery?: string;
  options: ImageOption[];
}

interface Props {
  content: ImageChoiceContent;
  onAnswer: (selectedId: string) => void;
  disabled?: boolean;
  correctId?: string;
  selectedId?: string;
}

export default function ImageChoice({ content, onAnswer, disabled, correctId, selectedId }: Props) {
  const { speak } = useTTS();

  useEffect(() => {
    const t = setTimeout(() => speak(content.audioText ?? content.questionText), 400);
    return () => clearTimeout(t);
  }, [content.questionText]);

  const getStyle = (id: string) => {
    if (!disabled) {
      return selectedId === id
        ? 'border-[#1A1F5E] bg-[#1A1F5E]/10 ring-2 ring-[#1A1F5E]/30'
        : 'border-gray-200 bg-white hover:border-[#1A1F5E]/40 hover:shadow-md';
    }
    if (id === correctId) return 'border-green-500 bg-green-50 ring-2 ring-green-300';
    if (id === selectedId) return 'border-red-400 bg-red-50';
    return 'border-gray-200 bg-gray-50 opacity-40';
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Question with TTS */}
      <button
        className="w-full bg-[#1A1F5E]/5 rounded-2xl p-4 flex items-center justify-center gap-3"
        onClick={() => speak(content.audioText ?? content.questionText)}
      >
        <span className="text-3xl">🔊</span>
        <p className="text-2xl font-extrabold text-[#1A1F5E] leading-relaxed">
          {content.questionText}
        </p>
      </button>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-4">
        {content.options.map((opt, i) => {
          const emoji = opt.emoji && opt.emoji !== '🖼️'
            ? opt.emoji
            : wordToEmoji(opt.imageQuery ?? opt.label);
          return (
            <motion.button
              key={opt.id}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-3 transition-all shadow-sm ${getStyle(opt.id)}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={disabled ? {} : { scale: 0.93 }}
              onClick={() => {
                speak(opt.label);
                if (!disabled) onAnswer(opt.id);
              }}
              disabled={disabled}
            >
              <span className="text-6xl leading-none">{emoji}</span>
              <span className="text-xl font-extrabold text-gray-800 text-center">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
