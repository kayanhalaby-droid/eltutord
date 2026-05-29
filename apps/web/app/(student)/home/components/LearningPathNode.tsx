'use client';

import { motion } from 'framer-motion';
import { LearningPathNodeDto } from '@/lib/types/lesson';

interface Props {
  node: LearningPathNodeDto;
  position: { x: number; y: number };
  onClick: () => void;
  onLockedClick?: (message: string) => void;
}

export function LearningPathNode({ node, position, onClick, onLockedClick }: Props) {
  const isLocked = node.status === 'LOCKED';
  const isCompleted = node.status === 'COMPLETED';
  const isCurrent = node.isCurrent || node.status === 'IN_PROGRESS';

  function handleClick() {
    if (!isLocked) { onClick(); return; }
    if (onLockedClick) {
      const msg = node.unitLocked
        ? 'أكمل اختبار الوحدة السابقة بنتيجة 70% أو أكثر لفتح هذه الوحدة'
        : 'أكمل الدرس السابق أولاً';
      onLockedClick(msg);
    }
  }

  const size = isCurrent ? 80 : 64;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: position.x - size / 2, top: position.y - size / 2 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      {/* Node circle */}
      {isCompleted && (
        <button
          onClick={handleClick}
          className="rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          }}
        >
          <span className="text-white text-2xl font-black">✓</span>
        </button>
      )}

      {isCurrent && !isCompleted && (
        <motion.button
          onClick={handleClick}
          className="rounded-full border-4 border-white flex items-center justify-center shadow-xl relative"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #FFD700, #F0C800)',
          }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span className="text-[#1A1F5E] text-lg font-black">{node.lesson.order ?? '▶'}</span>
          {/* Play badge */}
          <div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            style={{ background: '#1A1F5E' }}
          >
            <span className="text-[#FFD700] text-[10px] font-bold">▶</span>
          </div>
        </motion.button>
      )}

      {isLocked && (
        <button
          onClick={handleClick}
          className="rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center opacity-60 cursor-pointer"
          style={{ width: size, height: size }}
        >
          <span className="text-gray-400 text-xl">🔒</span>
        </button>
      )}

      {/* UNLOCKED (not yet started) */}
      {node.status === 'UNLOCKED' && !isCurrent && (
        <motion.button
          onClick={handleClick}
          className="rounded-full border-2 border-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #1A1F5E, #2D3580)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="text-[#FFD700] text-lg font-black">▶</span>
        </motion.button>
      )}

      {/* Label */}
      <div className="mt-2 text-center" style={{ maxWidth: 90 }}>
        <p className="text-xs font-bold text-gray-700 leading-tight line-clamp-2 text-center">
          {node.lesson.title}
        </p>
        {node.score != null && (
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{node.score}%</p>
        )}
      </div>
    </motion.div>
  );
}
