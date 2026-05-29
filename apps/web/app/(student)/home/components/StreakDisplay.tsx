'use client';

import { motion } from 'framer-motion';
import { useStreak } from '@/lib/hooks/useStreak';

export default function StreakDisplay() {
  const { streak, streakAtRisk, hasFreeze, isLoading } = useStreak();

  if (isLoading) return <div className="h-14 bg-white rounded-xl animate-pulse" />;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center gap-1 relative overflow-visible">
      {/* Freeze badge */}
      {hasFreeze && (
        <span
          className="absolute -top-2 -left-2 text-base leading-none"
          title="لديك تجميد سلسلة"
        >
          ❄️
        </span>
      )}

      <motion.div
        className="flex items-center gap-1"
        animate={streakAtRisk
          ? { scale: [1, 1.12, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }
          : streak > 0
            ? { scale: [1, 1.06, 1] }
            : {}
        }
        transition={{ duration: streakAtRisk ? 0.8 : 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          className={`w-8 h-8 ${streakAtRisk ? 'text-red-500' : streak > 0 ? 'text-orange-500' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-3.38-1.21-6.49-3.59-8.43z" />
        </svg>
        <span className={`text-2xl font-extrabold ${streakAtRisk ? 'text-red-500' : 'text-brand'}`}>
          {streak}
        </span>
      </motion.div>

      <p className={`text-xs font-semibold ${streakAtRisk ? 'text-red-500' : 'text-muted-foreground'}`}>
        {streakAtRisk ? '⚠️ في خطر!' : streak > 0 ? 'يوم متتالي' : 'ابدأ سلسلتك!'}
      </p>
    </div>
  );
}
