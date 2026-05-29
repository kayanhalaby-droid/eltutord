'use client';

import { useState } from 'react';
import { FillBlankContent } from '@/lib/types/lesson';

interface Props {
  content: FillBlankContent;
  onAnswer: (blanks: Record<string, string>) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function FillBlank({ content, onAnswer, disabled, isCorrect }: Props) {
  const [blanks, setBlanks] = useState<Record<string, string>>({});

  const update = (id: string, value: string) => {
    const next = { ...blanks, [id]: value };
    setBlanks(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 items-center justify-center text-xl font-semibold text-brand leading-loose">
        {content.textParts.map((part, i) => {
          if (part.type === 'text') return <span key={i}>{part.value}</span>;
          return (
            <input
              key={part.id}
              value={blanks[part.id!] ?? ''}
              onChange={(e) => update(part.id!, e.target.value)}
              disabled={disabled}
              className={`border-b-2 text-center w-24 outline-none bg-transparent px-1 transition-colors
                ${disabled ? (isCorrect ? 'border-green-500 text-green-600' : 'border-red-400 text-red-600') : 'border-brand focus:border-gold'}`}
              placeholder="___"
            />
          );
        })}
      </div>
      {!disabled && (
        <button
          className="self-center px-8 py-2 bg-brand text-gold font-bold rounded-xl hover:opacity-90 mt-2"
          onClick={() => onAnswer(blanks)}
        >
          تأكيد
        </button>
      )}
    </div>
  );
}
