'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';

export interface ListenImageOption {
  id: string;
  emoji: string;
  label?: string;
}

export interface ListenImageContent {
  question: string;
  audioText: string;
  options: ListenImageOption[];
}

interface Props {
  content: ListenImageContent;
  onAnswer: (selectedId: string) => void;
  disabled?: boolean;
  correctId?: string;
  selectedId?: string;
}

export default function ListenImage({ content, onAnswer, disabled, correctId, selectedId }: Props) {
  const { speak } = useTTS();

  // Auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => speak(content.audioText), 600);
    return () => clearTimeout(t);
  }, [content.audioText]);

  const getStyle = (id: string) => {
    if (!disabled) {
      return selectedId === id
        ? 'border-[#1A1F5E] bg-[#1A1F5E]/10 ring-2 ring-[#1A1F5E]/30 scale-105'
        : 'border-gray-200 bg-white hover:border-[#1A1F5E]/40 hover:shadow-md';
    }
    if (id === correctId) return 'border-green-500 bg-green-50 ring-2 ring-green-300';
    if (id === selectedId) return 'border-red-400 bg-red-50';
    return 'border-gray-200 bg-gray-50 opacity-40';
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-extrabold text-[#1A1F5E] text-center">{content.question}</p>

      {/* Big play button */}
      <motion.button
        className="w-full py-6 bg-[#1A1F5E] rounded-2xl flex flex-col items-center gap-2 shadow-lg"
        onClick={() => speak(content.audioText)}
        whileTap={{ scale: 0.97 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: 1, duration: 0.6, delay: 0.7 }}
      >
        <span className="text-5xl">🔊</span>
        <span className="text-[#FFD700] font-extrabold">اضغط للاستماع مجدداً</span>
      </motion.button>

      {/* Image options */}
      <div className="grid grid-cols-2 gap-4">
        {content.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`flex flex-col items-center gap-2 p-5 rounded-3xl border-3 transition-all ${getStyle(opt.id)}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileTap={disabled ? {} : { scale: 0.93 }}
            onClick={() => {
              if (opt.label) speak(opt.label);
              if (!disabled) onAnswer(opt.id);
            }}
            disabled={disabled}
          >
            <span className="text-6xl leading-none">{opt.emoji}</span>
            {opt.label && (
              <span className="text-lg font-extrabold text-gray-800">{opt.label}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
