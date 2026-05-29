'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';

export interface ComprehensionQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface ReadingComprehensionContent {
  text: string;
  audioText?: string;
  questions: ComprehensionQuestion[];
}

interface Props {
  content: ReadingComprehensionContent;
  onAnswer: (answers: number[]) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function ReadingComprehension({ content, onAnswer, disabled, isCorrect }: Props) {
  const { speak } = useTTS();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(content.questions.map(() => null));

  // Auto-read text on mount
  useEffect(() => {
    const t = setTimeout(() => speak(content.audioText ?? content.text), 700);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (optIdx: number) => {
    if (disabled || answers[currentQ] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optIdx;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < content.questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        onAnswer(newAnswers as number[]);
      }
    }, 700);
  };

  const q = content.questions[currentQ];
  const answered = answers[currentQ] !== null;

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Reading text */}
      <div className="bg-[#1A1F5E]/5 border border-[#1A1F5E]/20 rounded-2xl p-5">
        <button
          className="flex items-center gap-2 mb-3 text-[#1A1F5E]"
          onClick={() => speak(content.audioText ?? content.text)}
        >
          <span className="text-xl">🔊</span>
          <span className="text-xs font-bold">اضغط للاستماع</span>
        </button>
        <p className="text-xl font-bold leading-relaxed text-gray-800 whitespace-pre-line">
          {content.text}
        </p>
      </div>

      {/* Question progress dots */}
      <div className="flex gap-2 justify-center">
        {content.questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 max-w-[40px] rounded-full transition-all ${
              i < currentQ ? 'bg-green-400' : i === currentQ ? 'bg-[#1A1F5E]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-3"
        >
          <p className="text-xl font-extrabold text-[#1A1F5E] text-center bg-white rounded-xl p-3 border border-gray-100">
            {q.q}
          </p>
          {q.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            const isCorrectOpt = i === q.correct;
            let style = 'border-gray-200 bg-white hover:border-[#1A1F5E]/40';
            if (answered) {
              if (isCorrectOpt) style = 'border-green-500 bg-green-50 text-green-700 font-extrabold';
              else if (isSelected) style = 'border-red-400 bg-red-50 text-red-700';
              else style = 'border-gray-200 bg-gray-50 opacity-40';
            }
            return (
              <motion.button
                key={i}
                className={`px-5 py-4 rounded-2xl border-2 font-bold text-xl text-right transition-all ${style}`}
                whileTap={answered ? {} : { scale: 0.97 }}
                onClick={() => {
                  speak(opt);
                  handleSelect(i);
                }}
                disabled={answered}
              >
                {opt}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
