'use client';

import { motion, AnimatePresence } from 'framer-motion';

const STAR_COUNT = 20;
const STARS = ['⭐', '✨', '🌟', '💫'];

const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  emoji: STARS[i % STARS.length],
  left: `${5 + (i / STAR_COUNT) * 90}%`,
  delay: (i / STAR_COUNT) * 1.5,
  duration: 1.2 + (i % 4) * 0.3,
  size: 14 + (i % 3) * 6,
}));

interface StarFallProps {
  active: boolean;
  onComplete?: () => void;
}

export function StarFall({ active, onComplete }: StarFallProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active && (
        <div
          data-testid="starfall"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9998,
            overflow: 'hidden',
          }}
        >
          {stars.map((star) => (
            <motion.span
              key={star.id}
              style={{
                position: 'absolute',
                left: star.left,
                top: -40,
                fontSize: star.size,
                display: 'inline-block',
              }}
              animate={{ y: '110vh', rotate: [0, 180, 360], opacity: [1, 1, 0] }}
              transition={{ duration: star.duration, delay: star.delay, ease: 'easeIn' }}
            >
              {star.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
