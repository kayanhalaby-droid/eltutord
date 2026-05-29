'use client';

import { motion } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';
import { useRepairStreak } from '@/lib/hooks/useStreak';
import { useGemsBalance } from '@/lib/hooks/useGems';
import { useDailyGoal } from '@/lib/hooks/useDailyGoal';

interface Props {
  mode: 'at-risk' | 'broken';
  brokenStreak?: number;
  onClose: () => void;
  onRepaired?: () => void;
}

export default function StreakBrokenModal({ mode, brokenStreak, onClose, onRepaired }: Props) {
  const { mutate: repair, isPending } = useRepairStreak();
  const gems = useGemsBalance();
  const { data: dailyGoal } = useDailyGoal();
  const canFreeze = (gems ?? 0) >= 200;

  function handleFreeze() {
    repair(undefined, {
      onSuccess: () => {
        onRepaired?.();
        onClose();
      },
    });
  }

  const xpToday = dailyGoal?.current ?? 0;
  const xpGoal = dailyGoal?.target ?? 50;
  const xpPct = Math.min((xpToday / xpGoal) * 100, 100);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-7 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl"
        initial={{ scale: 0.7, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 50 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <NoorOwl
          expression={mode === 'broken' ? 'sad' : 'encouraging'}
          size={100} animate
          message={mode === 'broken' ? 'سلسلتك انكسرت 😢' : 'سلسلتك في خطر! ادرس الآن 💪'}
        />

        {/* Stats row: gems + XP */}
        <div className="w-full grid grid-cols-2 gap-2">
          <div className="bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-amber-200">
            <span className="text-lg">💎</span>
            <div>
              <p className="text-xs text-muted-foreground">جواهرك</p>
              <p className="text-sm font-extrabold text-amber-700">{gems ?? 0}</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl px-3 py-2 flex flex-col gap-1 border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">XP اليوم</span>
              <span className="text-xs font-bold text-brand">{xpToday}/{xpGoal}</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {mode === 'at-risk' ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-red-500">سلسلتك في خطر! ⚠️</h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                لم تدرس اليوم بعد. إذا لم تكمل درساً ستنقطع سلسلتك!
              </p>
            </div>
            {canFreeze && (
              <motion.button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 shadow hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                onClick={handleFreeze}
                disabled={isPending}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xl">❄️</span>
                <span>{isPending ? 'جارٍ...' : 'استخدم Streak Freeze (200 💎)'}</span>
              </motion.button>
            )}
            {!canFreeze && (
              <p className="text-xs text-muted-foreground text-center">
                تحتاج 200 جوهرة للـ Streak Freeze (لديك {gems ?? 0})
              </p>
            )}
            <button
              className="w-full bg-brand text-gold font-extrabold rounded-2xl py-3 shadow-md hover:opacity-90 active:scale-95 transition-all"
              onClick={onClose}
            >
              ادرس الآن!
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-red-500">انقطعت سلسلتك 💔</h2>
              {brokenStreak && brokenStreak > 0 ? (
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  كانت سلسلتك <span className="font-extrabold text-brand">{brokenStreak} يوم</span>. يمكنك إصلاحها الآن!
                </p>
              ) : (
                <p className="text-muted-foreground text-sm mt-2">ابدأ سلسلة جديدة اليوم!</p>
              )}
            </div>

            {canRepair(canFreeze, brokenStreak) && (
              <motion.button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 shadow hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                onClick={handleFreeze}
                disabled={isPending}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xl">❄️</span>
                <span>
                  {isPending
                    ? 'جارٍ الإصلاح...'
                    : `استخدم Streak Freeze ❄️ (200 💎)`}
                </span>
              </motion.button>
            )}

            {!canFreeze && (
              <div className="text-xs text-muted-foreground text-center">
                تحتاج 200 جوهرة (لديك {gems ?? 0})
              </div>
            )}

            <button
              className="w-full border-2 border-brand text-brand font-extrabold rounded-2xl py-3 hover:bg-brand/5 active:scale-95 transition-all"
              onClick={onClose}
            >
              ابدأ من جديد
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function canRepair(hasGems: boolean, brokenStreak?: number) {
  return hasGems && (brokenStreak ?? 0) > 0;
}
