'use client';

import { useState } from 'react';

interface Props {
  questionText: string;
  onAnswer: (text: string) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function ShortAnswer({ questionText, onAnswer, disabled, isCorrect }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-brand text-center">{questionText}</p>
      <textarea
        className={`w-full rounded-xl border-2 p-3 text-right resize-none outline-none transition-colors
          ${disabled ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'border-brand focus:border-gold'}`}
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="اكتب إجابتك هنا..."
        dir="rtl"
      />
      {!disabled && (
        <button
          className="self-center px-8 py-2 bg-brand text-gold font-bold rounded-xl hover:opacity-90"
          onClick={() => onAnswer(value)}
        >
          تأكيد
        </button>
      )}
    </div>
  );
}
