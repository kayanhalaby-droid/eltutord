'use client';

import { motion } from 'framer-motion';

interface HeartFloatProps { count?: number; onDone?: () => void }

export default function HeartFloat({ count = 8, onDone }: HeartFloatProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-50">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 18 + Math.random() * 14,
            bottom: 0,
            left: `${10 + (i / count) * 80}%`,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -120 - Math.random() * 60, opacity: [1, 1, 0], x: (Math.random() - 0.5) * 40 }}
          transition={{ duration: 1.8 + Math.random() * 0.6, delay: i * 0.15, ease: 'easeOut' }}
          onAnimationComplete={i === count - 1 ? onDone : undefined}
        >
          💙
        </motion.div>
      ))}
    </div>
  );
}
