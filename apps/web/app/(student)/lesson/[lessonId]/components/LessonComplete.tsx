'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';
import { Fireworks } from '@/components/effects/Fireworks';
import { StarFall } from '@/components/effects/StarFall';
import { useRewardEffect } from '@/lib/hooks/useRewardEffect';

const REFLECTION_OPTIONS = [
  { id: 'confident',    label: 'أفهم الموضوع جيداً',       emoji: '😊' },
  { id: 'needs-review', label: 'أحتاج لمراجعة بعض النقاط', emoji: '🤔' },
  { id: 'confused',     label: 'الموضوع صعب عليّ',          emoji: '😅' },
  { id: 'want-more',    label: 'أريد تمارين أصعب!',         emoji: '🚀' },
];

interface Props {
  lessonTitle: string;
  xpEarned: number;
  gemsEarned?: number;
  correctAnswers: number;
  totalQuestions: number;
  hearts: number;
  unitUnlocked?: boolean;
  unlockedUnitName?: string;
  onContinue?: () => void;
}

function ResultStat({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/10 rounded-2xl p-3">
      <span className="text-2xl leading-none">{icon}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
      <span className="text-white/60 text-xs font-medium">{label}</span>
    </div>
  );
}

export default function LessonComplete({ lessonTitle, xpEarned, gemsEarned = 0, correctAnswers, totalQuestions, hearts, unitUnlocked, unlockedUnitName, onContinue }: Props) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [phase, setPhase] = useState<'reflection' | 'results'>('reflection');
  const [reflection, setReflection] = useState<string | null>(null);
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const { fireworksActive, starFallActive, triggerFireworks, triggerStarFall } = useRewardEffect();
  const wrong = totalQuestions - correctAnswers;

  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ['streak'],
    queryFn: () => apiFetch('/gamification/streak', { token: token! }),
    enabled: !!token,
    staleTime: 0,
  });
  const { data: gemsData } = useQuery<{ gems: number }>({
    queryKey: ['gems'],
    queryFn: () => apiFetch('/gamification/gems', { token: token! }),
    enabled: !!token,
    staleTime: 0,
  });
  const currentStreak = streakData?.streak ?? 0;
  const totalGems = gemsData?.gems ?? 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('canvas-confetti').then(m => {
      const confetti = m.default;
      if (accuracy >= 70) {
        confetti({ particleCount: unitUnlocked ? 200 : 120, spread: unitUnlocked ? 100 : 80, origin: { y: 0.6 }, colors: ['#FFD700', '#22C55E', '#3B82F6'] });
        if (unitUnlocked) {
          setTimeout(() => confetti({ particleCount: 150, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#ff6b6b'] }), 400);
          setTimeout(() => confetti({ particleCount: 150, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4ecdc4', '#1A1F5E'] }), 700);
        }
      }
    }).catch(() => {});
    if (accuracy === 100) triggerFireworks();
    else if (accuracy >= 90) triggerStarFall();
  }, []);

  const owlExpr = accuracy >= 90 ? 'celebrating' : accuracy >= 70 ? 'happy' : 'encouraging';
  const headline = accuracy >= 90 ? 'مذهل! 🌟' : accuracy >= 70 ? 'أحسنت! 🎉' : 'واصل المحاولة! 💪';

  const handleReflection = (id: string) => {
    setReflection(id);
    try {
      const stored = JSON.parse(localStorage.getItem('reflections') ?? '[]');
      stored.push({ lessonTitle, reflection: id, accuracy, date: new Date().toISOString() });
      localStorage.setItem('reflections', JSON.stringify(stored.slice(-50)));
    } catch {}
    setTimeout(() => setPhase('results'), 350);
  };

  return (
    <>
    <Fireworks active={fireworksActive} />
    <StarFall active={starFallActive} />
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #1A1F5E 0%, #2D3580 60%, #1565C0 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">

        {/* ── Phase 1: Reflection ── */}
        {phase === 'reflection' && (
          <motion.div
            key="reflection"
            className="bg-white/10 backdrop-blur-md rounded-3xl p-7 max-w-sm w-full flex flex-col items-center gap-5 border border-white/20 shadow-2xl"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <NoorOwl expression="thinking" size={80} animate />
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-white">كيف تشعر بعد الدرس؟</h2>
              <p className="text-sm text-white/60 mt-1">ردّك يساعدني لأكيّف الدروس القادمة</p>
            </div>
            <div className="w-full flex flex-col gap-2">
              {REFLECTION_OPTIONS.map(opt => (
                <motion.button
                  key={opt.id}
                  className={`w-full px-4 py-3.5 rounded-2xl border-2 font-bold text-right flex items-center gap-3 transition-all min-h-[52px]
                    ${reflection === opt.id
                      ? 'border-[#FFD700] bg-[#FFD700]/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10'}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleReflection(opt.id)}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-sm">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Phase 2: Results ── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            className="w-full max-w-sm flex flex-col items-center gap-5"
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            {/* Owl */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            >
              <NoorOwl expression={owlExpr} size={140} animate loop={false} />
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl font-black text-white text-center">{headline}</h2>
            <p className="text-white/60 text-sm text-center -mt-3">{lessonTitle}</p>

            {/* Score card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 w-full border border-white/15">
              <div className="text-center mb-4">
                <span className="text-7xl font-black text-[#FFD700] tabular-nums">{accuracy}</span>
                <span className="text-3xl font-black text-[#FFD700]">%</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ResultStat icon="✅" value={correctAnswers}  label="صحيح"    color="text-green-400" />
                <ResultStat icon="❌" value={wrong}           label="خطأ"     color="text-red-400"   />
                <ResultStat icon="⭐" value={`+${xpEarned}`} label="XP"      color="text-[#FFD700]" />
              </div>
            </div>

            {/* Rewards banner */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 w-full border border-white/15 flex justify-around">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">💎</span>
                <span className="text-lg font-black text-[#FFD700]">+{gemsEarned}</span>
                <span className="text-xs text-white/60">جواهر كسبت</span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">💼</span>
                <span className="text-lg font-black text-white">{totalGems}</span>
                <span className="text-xs text-white/60">مجموع جواهرك</span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-black text-orange-300">{currentStreak}</span>
                <span className="text-xs text-white/60">يوم متتالي</span>
              </div>
            </div>

            {/* Unit unlocked badge */}
            {unitUnlocked && (
              <motion.div
                className="w-full rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #FFD700, #F0C800)' }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <span className="text-3xl">🔓</span>
                <div>
                  <p className="text-[#1A1F5E] font-extrabold text-sm">وحدة جديدة مفتوحة!</p>
                  {unlockedUnitName && <p className="text-[#1A1F5E]/80 text-xs font-bold">{unlockedUnitName}</p>}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              <button
                className="w-full py-4 rounded-2xl font-black text-lg text-[#1A1F5E] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FFD700, #F0C800)' }}
                onClick={onContinue ?? (() => router.push('/home'))}
              >
                الدرس التالي ←
              </button>
              <button
                className="w-full py-3 rounded-2xl font-bold text-white/80 bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                onClick={() => router.push('/home')}
              >
                العودة للرئيسية
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
    </>
  );
}
