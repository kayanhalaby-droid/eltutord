'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  content: { front: string; back: string; transliteration: string };
  onAnswer: (result: { rated: boolean; rating: string }) => void;
  disabled?: boolean;
}

export default function FlashcardExercise({ content, onAnswer, disabled }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);

  const rate = (rating: string) => {
    if (rated || disabled) return;
    setRated(true);
    onAnswer({ rated: true, rating });
  };

  return (
    <div className="flex flex-col gap-6 items-center" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">
        {flipped ? 'هل كنت تعرف هذه الكلمة؟' : 'اقرأ الكلمة العبرية واضغط لرؤية معناها'}
      </p>

      {/* Card */}
      <div
        className="w-full max-w-sm cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => !rated && setFlipped(true)}
      >
        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative w-full h-48"
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand to-brand/80 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-5xl font-extrabold text-white mb-3">{content.front}</p>
            <p className="text-white/70 text-base">{content.transliteration}</p>
            {!flipped && <p className="text-white/40 text-sm mt-4">اضغط لرؤية المعنى</p>}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-4xl font-extrabold text-white mb-2">{content.back}</p>
            <p className="text-white/70 text-base">{content.front} ({content.transliteration})</p>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons */}
      {flipped && !rated && !disabled && (
        <motion.div
          className="flex gap-3 w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { id: 'hard',   label: '😰 صعب',   color: 'bg-red-500 hover:bg-red-600' },
            { id: 'medium', label: '🤔 متوسط', color: 'bg-yellow-500 hover:bg-yellow-600' },
            { id: 'easy',   label: '😊 سهل',   color: 'bg-green-500 hover:bg-green-600' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => rate(r.id)}
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm ${r.color} active:scale-95 transition-all`}
            >
              {r.label}
            </button>
          ))}
        </motion.div>
      )}

      {rated && (
        <p className="text-green-600 font-bold text-sm">✓ تم تقييم البطاقة — انتقل للتالي</p>
      )}
    </div>
  );
}
