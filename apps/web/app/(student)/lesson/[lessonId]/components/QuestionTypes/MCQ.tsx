'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MCQContent } from '@/lib/types/lesson';

interface Props {
  content: MCQContent;
  onAnswer: (selectedIds: string[]) => void;
  disabled?: boolean;
  correctIds?: string[];
  selectedIds?: string[];
}

export default function MCQ({ content, onAnswer, disabled, correctIds, selectedIds: externalSelected }: Props) {
  const [selected, setSelected] = useState<string[]>(externalSelected ?? []);

  const toggle = (id: string) => {
    if (disabled) return;
    if (content.isMultiSelect) {
      const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
      setSelected(next);
    } else {
      setSelected([id]);
      onAnswer([id]);
    }
  };

  const getStyle = (optId: string) => {
    const sel = selected ?? [];
    if (!disabled) {
      return sel.includes(optId)
        ? 'border-[#1A1F5E] bg-[#EEF0FF] text-[#1A1F5E] font-bold shadow-sm'
        : 'border-gray-200 bg-white text-gray-800 hover:border-[#1A1F5E]/50 hover:bg-[#F5F6FF]';
    }
    if (correctIds?.includes(optId)) {
      return 'border-[#22C55E] bg-[#DCFCE7] text-[#15803D] font-bold';
    }
    if (sel.includes(optId) && !correctIds?.includes(optId)) {
      return 'border-[#EF4444] bg-[#FEE2E2] text-[#B91C1C]';
    }
    return 'border-gray-200 bg-gray-50 text-gray-400 opacity-60';
  };

  const getIcon = (optId: string) => {
    if (!disabled) return null;
    if (correctIds?.includes(optId)) return <span className="text-[#22C55E] font-black text-lg ml-2">✓</span>;
    if (selected.includes(optId) && !correctIds?.includes(optId)) return <span className="text-[#EF4444] font-black text-lg ml-2">✗</span>;
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[22px] font-extrabold text-[#1A1F5E] text-center leading-snug">
        {content.questionText}
      </p>
      <div className="flex flex-col gap-3">
        {content.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`w-full px-5 py-4 min-h-[64px] rounded-[20px] border-2 text-right text-[18px] transition-all flex items-center justify-between ${getStyle(opt.id)}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={() => toggle(opt.id)}
            disabled={disabled}
          >
            <span>{opt.text}</span>
            {getIcon(opt.id)}
          </motion.button>
        ))}
      </div>
      {content.isMultiSelect && !disabled && (
        <button
          className="w-full mt-1 py-4 min-h-[56px] font-black rounded-[20px] text-base shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3580)', color: '#FFD700' }}
          onClick={() => onAnswer(selected)}
        >
          تأكيد الإجابة
        </button>
      )}
    </div>
  );
}
