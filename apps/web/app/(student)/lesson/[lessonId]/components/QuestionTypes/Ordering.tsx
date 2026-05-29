'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';

interface Props {
  questionText: string;
  items: string[];
  onAnswer: (ordered: string[]) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function Ordering({ questionText, items: initialItems, onAnswer, disabled, isCorrect }: Props) {
  const [items, setItems] = useState<string[]>(() => [...initialItems].sort(() => Math.random() - 0.5));

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-brand text-center">{questionText}</p>
      <p className="text-sm text-muted-foreground text-center">اسحب العناصر لترتيبها</p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={disabled ? () => {} : setItems}
        className="flex flex-col gap-2"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            className={`px-4 py-3 bg-white rounded-xl border-2 cursor-grab active:cursor-grabbing text-brand font-semibold text-right shadow-sm transition-colors
              ${disabled ? (isCorrect ? 'border-green-400' : 'border-red-300') : 'border-brand/30 hover:border-brand'}`}
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!disabled && (
        <button
          className="self-center px-8 py-2 bg-brand text-gold font-bold rounded-xl hover:opacity-90 mt-2"
          onClick={() => onAnswer(items)}
        >
          تأكيد
        </button>
      )}
    </div>
  );
}
