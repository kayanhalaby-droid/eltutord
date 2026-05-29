'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';
import { milestoneLabel, milestoneGems } from '@/lib/hooks/useStreak';

interface Props {
  milestone: number;
  whatsappSent?: boolean;
  onClose: () => void;
}

export default function StreakMilestoneModal({ milestone, whatsappSent, onClose }: Props) {
  const gems = milestoneGems(milestone);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('canvas-confetti').then((m) => {
      const confetti = m.default;
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ['#FF6B35', '#FFD700', '#FF4444'] });
      setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#FF6B35', '#FFD700'] }), 350);
      setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#FF6B35', '#FFD700'] }), 600);
    }).catch(() => {});
  }, []);

  const fireEmoji = milestone >= 30 ? '💎' : milestone >= 14 ? '🌟' : '🔥';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl"
        initial={{ scale: 0.6, y: 60, rotate: -4 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.6, y: 60 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      >
        <NoorOwl expression="celebrating" size={150} animate message={`${milestone} أيام متواصلة! أنت بطل! 🏆`} />

        {/* Milestone badge */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-4xl">{fireEmoji}</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-brand text-gold text-xs font-extrabold rounded-full w-9 h-9 flex items-center justify-center border-2 border-white shadow">
            {milestone}
          </div>
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-brand">سلسلة مذهلة!</h2>
          <p className="text-orange-600 font-bold mt-1">{milestoneLabel(milestone)}</p>
        </div>

        {gems > 0 && (
          <motion.div
            className="flex items-center gap-2 bg-amber-50 rounded-2xl px-5 py-3 border border-amber-200"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <span className="text-2xl">💎</span>
            <span className="text-brand font-extrabold">+{gems} جوهرة مكافأة!</span>
          </motion.div>
        )}

        {whatsappSent && (
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2 text-sm text-green-700 font-bold border border-green-200">
            <span>📲</span>
            <span>تم إخطار والديك عبر واتساب!</span>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold rounded-2xl py-3 text-base shadow-md hover:opacity-90 active:scale-95 transition-all"
          onClick={onClose}
        >
          استمر! 🔥
        </button>
      </motion.div>
    </motion.div>
  );
}
