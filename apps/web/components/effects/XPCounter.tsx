'use client';

import { motion } from 'framer-motion';

interface XPCounterProps { amount: number; onDone?: () => void }

export default function XPCounter({ amount, onDone }: XPCounterProps) {
  return (
    <motion.div
      className="pointer-events-none absolute z-50 font-extrabold text-2xl"
      style={{ color: '#FFD700', textShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}
      initial={{ y: 0, opacity: 1, scale: 0.8 }}
      animate={{ y: -80, opacity: [1, 1, 0], scale: [0.8, 1.2, 1] }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    >
      +{amount} XP ⭐
    </motion.div>
  );
}
