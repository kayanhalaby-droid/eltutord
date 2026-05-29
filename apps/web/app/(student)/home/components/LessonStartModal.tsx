'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NoorOwl from '@/components/NoorOwl';
import { LearningPathNodeDto } from '@/lib/types/lesson';

interface Props {
  node: LearningPathNodeDto;
  onClose: () => void;
}

const STEPS = [
  { icon: '📚', label: 'تعلّم الكلمات الجديدة' },
  { icon: '✏️', label: 'تمارين تفاعلية متنوعة' },
  { icon: '⭐', label: 'اكسب نقاط XP وجواهر' },
];

export default function LessonStartModal({ node, onClose }: Props) {
  const router = useRouter();

  const unitLabel = getUnitLabel(node.snakePathOrder);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl"
        initial={{ scale: 0.75, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.75, y: 40 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <NoorOwl expression="excited" size={80} animate />

        <div className="text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{unitLabel}</p>
          <h2 className="text-lg font-extrabold text-brand leading-snug">{node.lesson.title}</h2>
          {node.lesson.durationMin && (
            <p className="text-xs text-muted-foreground mt-1">⏱ {node.lesson.durationMin} دقيقة</p>
          )}
        </div>

        {/* 3 steps */}
        <div className="w-full flex flex-col gap-2">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 bg-brand/5 rounded-xl px-4 py-2.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <span className="text-xl w-7 text-center">{step.icon}</span>
              <span className="text-sm font-bold text-brand">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {node.score != null && node.score > 0 && (
          <div className="text-xs text-muted-foreground bg-gray-50 rounded-xl px-3 py-1.5 w-full text-center">
            أفضل نتيجة سابقة: <span className="font-bold text-brand">{node.score}%</span>
          </div>
        )}

        <div className="w-full flex gap-3">
          <button
            className="flex-1 border-2 border-brand text-brand font-bold rounded-2xl py-3 hover:bg-brand/5 active:scale-95 transition-all text-sm"
            onClick={onClose}
          >
            لاحقاً
          </button>
          <button
            className="flex-[2] bg-brand text-gold font-extrabold rounded-2xl py-3 shadow-md hover:opacity-90 active:scale-95 transition-all"
            onClick={() => router.push(`/lesson/${node.lesson.id}`)}
          >
            ابدأ الدرس 🚀
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getUnitLabel(order: number): string {
  const unit = Math.ceil(order / 4);
  const labels = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
  return `الوحدة ${labels[unit - 1] ?? unit}`;
}
