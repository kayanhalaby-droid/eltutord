'use client';

import { motion } from 'framer-motion';

interface StarBurstProps { count?: number; onDone?: () => void }

export default function StarBurst({ count = 12, onDone }: StarBurstProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360;
        const dist = 60 + Math.random() * 40;
        const x = Math.cos((angle * Math.PI) / 180) * dist;
        const y = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={i}
            style={{ position: 'absolute', fontSize: 16 + Math.random() * 12, color: '#FFD700' }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: [1, 1, 0], scale: [0, 1.4, 0.8], x, y }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
            onAnimationComplete={i === count - 1 ? onDone : undefined}
          >
            ⭐
          </motion.div>
        );
      })}
    </div>
  );
}
