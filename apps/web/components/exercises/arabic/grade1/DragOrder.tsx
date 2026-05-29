'use client';

import { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';

export interface DragOrderItem {
  id: string;
  text: string;
  order?: number; // expected order (1-based)
}

export interface DragOrderContent {
  question: string;
  items: DragOrderItem[];
  correctOrder?: string[]; // ids in correct order
}

interface Props {
  content: DragOrderContent;
  onAnswer: (orderedIds: string[]) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function DragOrder({ content, onAnswer, disabled, isCorrect }: Props) {
  const { speak } = useTTS();
  const [items, setItems] = useState<DragOrderItem[]>(
    [...content.items].sort(() => Math.random() - 0.5),
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submitted || disabled) return;
    setSubmitted(true);
    onAnswer(items.map((i) => i.id));
  };

  const bgForItem = (item: DragOrderItem, idx: number) => {
    if (!disabled && !submitted) return 'bg-white border-gray-200';
    if (!isCorrect) return 'bg-orange-50 border-orange-200';
    return 'bg-green-50 border-green-300';
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <p className="text-2xl font-extrabold text-[#1A1F5E] text-center">{content.question}</p>
      <p className="text-sm text-center text-muted-foreground">
        {disabled ? '' : 'اسحب البطاقات أو اضغط عنصرين لتبديلهما'}
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={disabled ? () => {} : setItems}
        className="flex flex-col gap-3"
      >
        {items.map((item, idx) => (
          <Reorder.Item
            key={item.id}
            value={item}
            drag={!disabled}
            className={`px-5 py-4 rounded-2xl border-2 font-extrabold text-xl flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all ${bgForItem(item, idx)}`}
          >
            <span className="text-muted-foreground text-base font-normal w-6">{idx + 1}.</span>
            <button
              className="flex-1 text-right text-gray-800"
              onClick={() => speak(item.text.replace(/[^؀-ۿ\s]/g, '').trim())}
            >
              {item.text}
            </button>
            {!disabled && <span className="text-gray-300 text-xl">⠿</span>}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!disabled && !submitted && (
        <motion.button
          className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
        >
          تأكيد الترتيب ✓
        </motion.button>
      )}
    </div>
  );
}
