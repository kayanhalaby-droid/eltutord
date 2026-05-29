'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Option { id: string; text: string }
interface Props {
  content: { questionText: string; sentence: string; options: Option[] };
  onAnswer: (selectedOptionId: string) => void;
  disabled?: boolean;
  correctOptionId?: string;
  selectedOptionId?: string;
}

export default function FillBlankChoice({ content, onAnswer, disabled, correctOptionId, selectedOptionId: ext }: Props) {
  const [selected, setSelected] = useState<string | null>(ext ?? null);

  const choose = (id: string) => {
    if (disabled) return;
    setSelected(id);
    onAnswer(id);
  };

  const parts = content.sentence.split('___');

  const optStyle = (id: string) => {
    if (!disabled) return selected === id ? 'border-brand bg-brand/10 text-brand font-bold' : 'border-gray-200 bg-white hover:border-brand/50';
    if (id === correctOptionId) return 'border-green-500 bg-green-50 text-green-700 font-bold';
    if (id === selected && id !== correctOptionId) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>

      {/* Sentence with blank */}
      <div className="bg-gray-50 rounded-2xl px-5 py-4 text-center text-lg font-semibold leading-loose border border-gray-200">
        {parts[0]}
        <span className={`inline-block min-w-[80px] mx-2 px-3 py-0.5 rounded-lg border-2 border-dashed align-bottom
          ${selected && disabled && selected === correctOptionId ? 'border-green-400 bg-green-50 text-green-700' :
            selected && disabled ? 'border-red-300 bg-red-50 text-red-600' :
            selected ? 'border-brand bg-brand/10 text-brand' : 'border-gray-400 bg-white text-gray-400'}`}>
          {selected ? content.options.find(o => o.id === selected)?.text ?? '___' : '___'}
        </span>
        {parts[1] ?? ''}
      </div>

      <div className="flex flex-col gap-3">
        {content.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`w-full px-5 py-3 rounded-xl border-2 text-right transition-all font-semibold text-base ${optStyle(opt.id)}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={() => choose(opt.id)}
            disabled={disabled}
          >
            {opt.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
