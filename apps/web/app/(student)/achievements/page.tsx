'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { id: 'all',      label: 'الكل' },
  { id: 'lessons',  label: 'الدروس' },
  { id: 'streak',   label: 'السلسلة' },
  { id: 'xp',       label: 'XP' },
  { id: 'gems',     label: 'الجواهر' },
  { id: 'accuracy', label: 'الدقة' },
];

export default function AchievementsPage() {
  const { data: achievements = [], isLoading } = useAchievements();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const unlocked = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-extrabold text-brand flex items-center gap-2">
          <Medal size={20} />
          الإنجازات
        </h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-6 flex flex-col gap-5">

        {/* Progress summary */}
        <motion.div
          className="bg-gradient-to-br from-brand to-brand/80 text-white rounded-2xl p-5 shadow-md"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">إنجازاتك</p>
              <p className="text-3xl font-extrabold mt-0.5">{unlocked} / {achievements.length}</p>
            </div>
            <div className="text-5xl">🏆</div>
          </div>
          <div className="mt-4 h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: achievements.length > 0 ? `${(unlocked / achievements.length) * 100}%` : '0%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">
            {achievements.length - unlocked} إنجاز متبقٍ لإكماله
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0',
                filter === cat.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand/40',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                className={cn(
                  'rounded-2xl p-4 flex flex-col gap-2 border-2 transition-all',
                  a.isUnlocked
                    ? 'bg-white border-gold shadow-sm'
                    : 'bg-gray-50 border-gray-200',
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                  a.isUnlocked ? 'bg-gold/15' : 'bg-gray-100 grayscale opacity-50',
                )}>
                  {a.icon}
                </div>

                {/* Text */}
                <div>
                  <p className={cn('text-sm font-extrabold leading-tight', a.isUnlocked ? 'text-brand' : 'text-gray-400')}>
                    {a.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{a.description}</p>
                </div>

                {/* Progress bar */}
                {!a.isUnlocked && (
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{a.progress}</span>
                      <span>{a.target}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand/40 rounded-full transition-all"
                        style={{ width: `${Math.min((a.progress / a.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {a.isUnlocked && (
                  <div className="flex items-center gap-1 text-gold text-xs font-bold mt-auto">
                    ✓ مكتمل
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold">لا توجد إنجازات في هذه الفئة</p>
          </div>
        )}
      </main>
    </div>
  );
}
