'use client';

import { motion } from 'framer-motion';
import { useXP } from '@/lib/hooks/useXP';

const XP_PER_LEVEL = 100;

export default function XPDisplay() {
  const { xp, isLoading } = useXP();

  if (isLoading) return <div className="h-14 bg-white rounded-xl animate-pulse" />;
  if (!xp) return null;

  const xpInLevel = xp.totalXp % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center gap-1 min-w-[120px]">
      <div className="flex items-center gap-1">
        <span className="text-lg">⭐</span>
        <span className="text-xl font-extrabold text-brand">مستوى {xp.level}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{xp.totalXp} XP</p>
    </div>
  );
}
