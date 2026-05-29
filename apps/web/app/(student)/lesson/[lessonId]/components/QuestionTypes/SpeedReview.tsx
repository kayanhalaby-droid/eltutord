'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pair { id: string; left: string; right: string }
interface Props {
  content: { questionText: string; pairs: Pair[]; timeLimitSeconds: number };
  onAnswer: (result: { completed: boolean; score: number }) => void;
  disabled?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SpeedReview({ content, onAnswer, disabled }: Props) {
  const { pairs, timeLimitSeconds, questionText } = content;
  const shuffledRight = useRef(shuffle(pairs)).current;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setDone(true);
          onAnswer({ completed: false, score: matched.size });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [started, done]);

  const handleLeft = (id: string) => {
    if (!started || done || disabled || matched.has(id)) return;
    setSelectedLeft(prev => prev === id ? null : id);
  };

  const handleRight = (id: string) => {
    if (!started || done || disabled || matched.has(id) || !selectedLeft) return;
    if (selectedLeft === id) {
      const next = new Set(matched).add(id);
      setMatched(next);
      setSelectedLeft(null);
      if (next.size === pairs.length) {
        clearInterval(timerRef.current!);
        setDone(true);
        onAnswer({ completed: true, score: pairs.length });
      }
    } else {
      setWrongFlash(id);
      setTimeout(() => setWrongFlash(null), 500);
      setSelectedLeft(null);
    }
  };

  const timePct = (timeLeft / timeLimitSeconds) * 100;
  const timerColor = timePct > 50 ? '#22C55E' : timePct > 25 ? '#F59E0B' : '#EF4444';

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <span className="text-5xl">⚡</span>
        <p className="text-xl font-extrabold text-brand text-center">{questionText || 'مراجعة سريعة!'}</p>
        <p className="text-gray-500 text-center text-sm">طابق كل الأزواج قبل انتهاء الوقت</p>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
          <span className="text-2xl">⏱️</span>
          <span className="font-bold text-amber-700">{timeLimitSeconds} ثانية</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setStarted(true)}
          className="bg-brand text-white font-extrabold py-4 px-10 rounded-2xl text-lg shadow-lg shadow-brand/30"
        >
          ابدأ!
        </motion.button>
      </div>
    );
  }

  if (done) {
    const won = matched.size === pairs.length;
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-8"
      >
        <span className="text-6xl">{won ? '🏆' : '⏰'}</span>
        <p className="text-2xl font-extrabold text-center text-brand">
          {won ? 'رائع! أكملت جميع الأزواج!' : 'انتهى الوقت!'}
        </p>
        <p className="text-gray-500">
          طابقت {matched.size} من {pairs.length} زوج
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Timer bar */}
      <div className="flex items-center gap-3">
        <span className="text-lg">⏱️</span>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timerColor }}
            animate={{ width: `${timePct}%` }}
            transition={{ duration: 0.8, ease: 'linear' }}
          />
        </div>
        <span className="font-bold tabular-nums text-sm" style={{ color: timerColor }}>{timeLeft}s</span>
      </div>

      {/* Score */}
      <p className="text-center text-sm text-gray-500 font-medium">
        {matched.size} / {pairs.length} ✓
      </p>

      {/* Pairs grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="flex flex-col gap-2">
          {pairs.map(p => {
            const isMatched = matched.has(p.id);
            const isSelected = selectedLeft === p.id;
            return (
              <motion.button
                key={p.id}
                onClick={() => handleLeft(p.id)}
                whileTap={!isMatched ? { scale: 0.95 } : {}}
                className={`min-h-[48px] px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all text-center
                  ${isMatched ? 'border-green-400 bg-green-50 text-green-600 opacity-50' :
                    isSelected ? 'border-brand bg-brand text-white shadow-md' :
                    'border-gray-200 bg-white hover:border-brand/50'}`}
                disabled={isMatched}
              >
                {p.left}
              </motion.button>
            );
          })}
        </div>
        {/* Right column (shuffled) */}
        <div className="flex flex-col gap-2">
          {shuffledRight.map(p => {
            const isMatched = matched.has(p.id);
            const isWrong = wrongFlash === p.id;
            return (
              <motion.button
                key={p.id + '-r'}
                onClick={() => handleRight(p.id)}
                whileTap={!isMatched ? { scale: 0.95 } : {}}
                animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`min-h-[48px] px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all text-center
                  ${isMatched ? 'border-green-400 bg-green-50 text-green-600 opacity-50' :
                    isWrong ? 'border-red-400 bg-red-50 text-red-600' :
                    selectedLeft ? 'border-brand/40 bg-brand/5 cursor-pointer hover:border-brand' :
                    'border-gray-200 bg-white opacity-70'}`}
                disabled={isMatched}
              >
                {p.right}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
