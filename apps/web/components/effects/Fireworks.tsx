'use client';

import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF8E53', '#A78BFA'];
const PARTICLE_COUNT = 36;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  angle: (360 / PARTICLE_COUNT) * i,
  distance: randomBetween(80, 200),
  size: randomBetween(6, 14),
  duration: randomBetween(0.8, 1.4),
  delay: randomBetween(0, 0.3),
}));

interface FireworksProps {
  active: boolean;
  onComplete?: () => void;
}

export function Fireworks({ active, onComplete }: FireworksProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active && (
        <div
          data-testid="fireworks"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[
            { x: '20%', y: '30%' },
            { x: '50%', y: '25%' },
            { x: '80%', y: '35%' },
          ].map((origin, burst) => (
            <div
              key={burst}
              style={{ position: 'absolute', left: origin.x, top: origin.y }}
            >
              {particles.map((p) => {
                const rad = (p.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * p.distance;
                const ty = Math.sin(rad) * p.distance;
                return (
                  <motion.span
                    key={p.id}
                    style={{
                      position: 'absolute',
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      background: p.color,
                      transformOrigin: 'center',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
                    transition={{ duration: p.duration, delay: burst * 0.15 + p.delay, ease: 'easeOut' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
