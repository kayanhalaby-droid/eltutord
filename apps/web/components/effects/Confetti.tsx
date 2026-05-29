'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#FFD700', '#1A1F5E', '#FF6B6B', '#4ECDC4', '#A78BFA', '#34D399'];
const COUNT = 50;

interface Piece {
  id: number; x: number; color: string;
  size: number; duration: number; delay: number; rotate: number;
}

function randomPieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 1.5,
    delay: Math.random() * 0.8,
    rotate: Math.random() * 360,
  }));
}

interface ConfettiProps { duration?: number; onDone?: () => void }

export default function Confetti({ duration = 3000, onDone }: ConfettiProps) {
  const pieces = useRef(randomPieces()).current;

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute', top: -20, left: `${p.x}%`,
            width: p.size, height: p.size * 0.5,
            background: p.color, borderRadius: 2,
          }}
          initial={{ y: -20, rotate: p.rotate, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rotate + 720, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
