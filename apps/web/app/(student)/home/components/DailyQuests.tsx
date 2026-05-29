'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDailyQuests, useClaimQuestsBonus, DailyQuest } from '@/lib/hooks/useQuests';

const QUEST_ICONS: Record<string, string> = {
  complete_lesson:  '📚',
  two_lessons:      '📖',
  answer_correct:   '✅',
  lesson_no_errors: '⭐',
  high_score:       '🏆',
};

function QuestCard({ quest, index }: { quest: DailyQuest; index: number }) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100);
  return (
    <motion.div
      className={`rounded-xl p-3 border-2 flex items-center gap-3 transition-colors ${
        quest.completed
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <span className="text-2xl flex-shrink-0">{QUEST_ICONS[quest.type] ?? '🎯'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className={`text-sm font-extrabold leading-tight ${quest.completed ? 'text-green-700' : 'text-brand'}`}>
            {quest.title}
          </p>
          <span className={`text-xs font-bold flex-shrink-0 ms-2 ${quest.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
            {quest.completed ? '✓' : `${quest.progress}/${quest.target}`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-tight mb-1.5">{quest.description}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${quest.completed ? 'bg-green-500' : 'bg-brand'}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
          />
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-amber-600 font-bold">+{quest.xpReward} XP</p>
        <p className="text-xs text-blue-600 font-bold">+{quest.gemsReward} 💎</p>
      </div>
    </motion.div>
  );
}

export default function DailyQuests() {
  const { data, isLoading } = useDailyQuests();
  const { mutate: claimBonus, isPending, isSuccess } = useClaimQuestsBonus();

  if (isLoading) return <div className="h-32 bg-white rounded-2xl animate-pulse" />;
  if (!data) return null;

  const { quests, allCompleted, bonusClaimed, bonusGems } = data;
  const completedCount = quests.filter(q => q.completed).length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h2 className="text-base font-extrabold text-brand">مهام اليوم</h2>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          allCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-muted-foreground'
        }`}>
          {completedCount}/{quests.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {quests.map((q, i) => <QuestCard key={q.id} quest={q} index={i} />)}
      </div>

      {/* All-complete bonus */}
      <AnimatePresence>
        {allCompleted && !bonusClaimed && !isSuccess && (
          <motion.div
            className="mt-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-3 flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div>
              <p className="text-white font-extrabold text-sm">🎉 أكملت جميع المهام!</p>
              <p className="text-white/80 text-xs">احصل على مكافأة +{bonusGems} جوهرة</p>
            </div>
            <button
              className="bg-white text-orange-600 font-extrabold text-sm px-3 py-1.5 rounded-lg shadow hover:brightness-105 active:scale-95 transition-all disabled:opacity-60"
              onClick={() => claimBonus()}
              disabled={isPending}
            >
              {isPending ? '...' : 'استلم!'}
            </button>
          </motion.div>
        )}

        {(bonusClaimed || isSuccess) && allCompleted && (
          <motion.div
            className="mt-3 bg-green-50 border-2 border-green-300 rounded-xl p-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-green-700 font-extrabold text-sm">✅ تم استلام المكافأة! +{bonusGems} 💎</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
