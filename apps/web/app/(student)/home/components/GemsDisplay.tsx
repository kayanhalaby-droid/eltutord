'use client';

import { motion } from 'framer-motion';
import { useGems } from '@/lib/hooks/useGems';

export default function GemsDisplay() {
  const { gems, isLoading } = useGems();

  if (isLoading) return <div className="h-14 bg-white rounded-xl animate-pulse" />;

  return (
    <motion.div
      className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center gap-1"
      whileHover={{ scale: 1.04 }}
    >
      <div className="flex items-center gap-1">
        <span className="text-2xl">💎</span>
        <span className="text-2xl font-extrabold text-brand">{gems}</span>
      </div>
      <p className="text-xs text-muted-foreground">جواهر</p>
    </motion.div>
  );
}
