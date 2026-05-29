'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Pair { id: string; right: string; left: string }

interface Props {
  content: { questionText?: string; pairs: Pair[] };
  onAnswer: (matches: Record<string, string>) => void;
  disabled: boolean;
  isCorrect?: boolean;
}

export default function Matching({ content, onAnswer, disabled, isCorrect }: Props) {
  const { questionText, pairs } = content;
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [shuffled] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const handleLeft = (id: string) => {
    if (disabled) return;
    setSelectedLeft(prev => (prev === id ? null : id));
  };

  const handleRight = (rightId: string) => {
    if (disabled || !selectedLeft) return;
    const updated = { ...matches, [selectedLeft]: rightId };
    setMatches(updated);
    setSelectedLeft(null);
    if (Object.keys(updated).length === pairs.length) onAnswer(updated);
  };

  const matchedRight = (leftId: string) => matches[leftId];
  const rightIsMatched = (rightId: string) => Object.values(matches).includes(rightId);

  return (
    <div className="flex flex-col gap-3">
      {questionText && (
        <p className="text-base font-bold text-gray-800 text-right mb-1">{questionText}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Column A — words */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground font-semibold mb-0.5">الكلمة</p>
          {pairs.map(pair => {
            const matched = matchedRight(pair.id);
            const selected = selectedLeft === pair.id;
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleLeft(pair.id)}
                disabled={disabled || !!matched}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-center',
                  matched  ? 'bg-green-50 border-green-400 text-green-700 cursor-default' :
                  selected ? 'bg-brand text-white border-brand shadow-md' :
                             'bg-white border-gray-200 text-gray-700 hover:border-brand/60',
                )}
              >
                {pair.right}
                {matched && ' ✓'}
              </motion.button>
            );
          })}
        </div>

        {/* Column B — definitions */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground font-semibold mb-0.5">المعنى</p>
          {shuffled.map(pair => {
            const isMatched = rightIsMatched(pair.id);
            const canTap   = !!selectedLeft && !isMatched;
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleRight(pair.id)}
                disabled={disabled || isMatched || !selectedLeft}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-center',
                  isMatched ? 'bg-green-50 border-green-400 text-green-700 cursor-default' :
                  canTap    ? 'bg-white border-brand/40 text-gray-700 hover:border-brand hover:bg-brand/5' :
                              'bg-white border-gray-200 text-gray-400 cursor-default',
                )}
              >
                {pair.left}
                {isMatched && ' ✓'}
              </motion.button>
            );
          })}
        </div>
      </div>

      {!disabled && Object.keys(matches).length < pairs.length && (
        <p className="text-xs text-center text-muted-foreground mt-1 animate-pulse">
          {selectedLeft ? '← الآن اختر المعنى من العمود الأيسر' : 'انقر على كلمة في العمود الأيمن للبدء →'}
        </p>
      )}
    </div>
  );
}
