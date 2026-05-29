'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHearts } from '@/lib/hooks/useHearts';

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-7 h-7 ${filled ? 'text-red-500' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function HeartsDisplay() {
  const { hearts, isLoading } = useHearts();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!hearts || !hearts.nextRegenerationAt || hearts.hearts >= hearts.maxHearts) {
      setTimeLeft(null);
      return;
    }
    const regen = new Date(hearts.nextRegenerationAt).getTime();
    const calc = () => setTimeLeft(Math.max(0, regen - Date.now()));
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [hearts]);

  if (isLoading || !hearts) return <div className="h-14 bg-white rounded-xl animate-pulse" />;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {Array.from({ length: hearts.maxHearts }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ scale: i < hearts.hearts ? 1 : 0.75, opacity: i < hearts.hearts ? 1 : 0.35 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <HeartIcon filled={i < hearts.hearts} />
          </motion.div>
        ))}
      </div>
      {timeLeft !== null && timeLeft > 0 && (
        <p className="text-xs text-muted-foreground">القلب التالي: {formatTime(timeLeft)}</p>
      )}
      {hearts.hearts >= hearts.maxHearts && (
        <p className="text-xs text-green-600 font-semibold">القلوب ممتلئة!</p>
      )}
    </div>
  );
}
