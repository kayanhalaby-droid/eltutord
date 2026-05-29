'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';
import { wordToEmoji } from '@/lib/arabicEmoji';

export interface ImageMatchPair {
  id: string;
  image: string;
  word: string;
  imageQuery?: string;
}

export interface ImageMatchContent {
  questionText: string;
  pairs: ImageMatchPair[];
}

interface Props {
  content: ImageMatchContent;
  onAnswer: (matches: Record<string, string>) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function ImageMatch({ content, onAnswer, disabled, isCorrect }: Props) {
  const { speak } = useTTS();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const matchedImageIds = Object.keys(matches);
  const matchedWords = Object.values(matches);

  // Shuffle words column (deterministic based on word content so it's stable across re-renders)
  const shuffledPairs = useMemo(() => {
    const arr = [...content.pairs];
    for (let i = arr.length - 1; i > 0; i--) {
      const seed = arr.map(p => p.word.charCodeAt(0)).reduce((a, b) => a + b, 0);
      const j = (seed * (i + 1)) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [content.pairs]);

  const handleImageTap = (pair: ImageMatchPair) => {
    if (disabled || matchedImageIds.includes(pair.id)) return;
    setSelectedImageId(pair.id);
    speak(pair.word);
  };

  const handleWordTap = (pair: ImageMatchPair) => {
    if (disabled || matchedWords.includes(pair.word) || !selectedImageId) return;
    speak(pair.word);
    const newMatches = { ...matches, [selectedImageId]: pair.word };
    setMatches(newMatches);
    setSelectedImageId(null);
    if (Object.keys(newMatches).length === content.pairs.length) {
      onAnswer(newMatches);
    }
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <p className="text-2xl font-extrabold text-[#1A1F5E] text-center">{content.questionText}</p>
      {selectedImageId && (
        <p className="text-sm text-center text-[#1A1F5E] font-bold animate-pulse">👆 الآن اضغط الكلمة المناسبة</p>
      )}
      {!selectedImageId && Object.keys(matches).length < content.pairs.length && (
        <p className="text-sm text-center text-muted-foreground">👆 اضغط صورة أولاً</p>
      )}

      <div className="flex gap-3">
        {/* Left: Images */}
        <div className="flex flex-col gap-3 flex-1">
          {content.pairs.map((pair) => {
            const isMatched = matchedImageIds.includes(pair.id);
            const isSelected = selectedImageId === pair.id;
            return (
              <motion.button
                key={pair.id}
                className={`p-4 rounded-2xl border-3 flex items-center justify-center transition-all
                  ${isMatched ? 'border-green-400 bg-green-50 opacity-50 cursor-default' :
                    isSelected ? 'border-[#1A1F5E] bg-[#1A1F5E]/10 scale-105 shadow-lg' :
                    'border-gray-200 bg-white hover:border-[#1A1F5E]/40 hover:shadow'}`}
                onClick={() => handleImageTap(pair)}
                whileTap={{ scale: 0.95 }}
                disabled={disabled || isMatched}
              >
                <span className="text-5xl">{wordToEmoji(pair.imageQuery ?? pair.image)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right: Words (shuffled) */}
        <div className="flex flex-col gap-3 flex-1">
          {shuffledPairs.map((pair) => {
            const isMatched = matchedWords.includes(pair.word);
            const canTap = !!selectedImageId && !isMatched && !disabled;
            return (
              <motion.button
                key={pair.id + '-word'}
                className={`p-4 rounded-2xl border-3 font-extrabold text-xl text-center transition-all
                  ${isMatched ? 'border-green-400 bg-green-50 text-green-700 opacity-50 cursor-default' :
                    canTap ? 'border-[#FFD700] bg-[#FFD700]/20 hover:bg-[#FFD700]/30 shadow' :
                    'border-gray-200 bg-white text-gray-800 opacity-60'}`}
                onClick={() => handleWordTap(pair)}
                whileTap={canTap ? { scale: 0.95 } : {}}
                disabled={disabled || isMatched || !selectedImageId}
              >
                {pair.word}
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {Object.keys(matches).length} / {content.pairs.length} مطابقات
      </p>
    </div>
  );
}
