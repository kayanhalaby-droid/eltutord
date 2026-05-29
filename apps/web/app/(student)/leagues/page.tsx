'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useLeague } from '@/lib/hooks/useLeague';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const LEAGUE_META: Record<string, { emoji: string; bg: string; border: string; text: string; badge: string }> = {
  BRONZE:   { emoji: '🥉', bg: 'from-amber-700 to-amber-500',   border: 'border-amber-400',  text: 'text-amber-800',   badge: 'bg-amber-100' },
  SILVER:   { emoji: '🥈', bg: 'from-slate-500 to-slate-400',   border: 'border-slate-300',  text: 'text-slate-700',   badge: 'bg-slate-100' },
  GOLD:     { emoji: '🥇', bg: 'from-yellow-500 to-yellow-400', border: 'border-yellow-300', text: 'text-yellow-800',  badge: 'bg-yellow-50' },
  PLATINUM: { emoji: '💠', bg: 'from-cyan-600 to-cyan-400',     border: 'border-cyan-300',   text: 'text-cyan-800',    badge: 'bg-cyan-50'   },
  DIAMOND:  { emoji: '💎', bg: 'from-brand to-blue-400',        border: 'border-blue-300',   text: 'text-blue-900',    badge: 'bg-blue-50'   },
};

export default function LeaguesPage() {
  const { data: league, isLoading } = useLeague();

  const meta = LEAGUE_META[league?.league ?? 'BRONZE'];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-extrabold text-brand">الدوريات</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-6 flex flex-col gap-5">

        {/* League header card */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-3xl" />
        ) : league && (
          <motion.div
            className={cn('rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br', meta.bg)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">دوريتك الحالية</p>
                <h2 className="text-2xl font-extrabold mt-0.5">
                  {meta.emoji} الدورية {league.leagueName}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  المركز {league.rank} من {league.totalParticipants}
                </p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl px-4 py-3">
                <p className="text-2xl font-extrabold">{league.weeklyXp}</p>
                <p className="text-white/70 text-xs">XP هذا الأسبوع</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-white/80 text-sm">
              <Clock size={14} />
              <span>يتجدد خلال {league.daysLeft} أيام</span>
            </div>
          </motion.div>
        )}

        {/* Promotion/Demotion zones legend */}
        {!isLoading && league && (
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <TrendingUp size={13} className="text-green-600" />
              <span className="text-green-700 font-semibold">أعلى {league.promotionZone} → ترقية</span>
            </div>
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <TrendingDown size={13} className="text-red-500" />
              <span className="text-red-600 font-semibold">أدنى {league.demotionZone} → هبوط</span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={18} className="text-gold" />
            <h3 className="font-extrabold text-brand">المتصدرون هذا الأسبوع</h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="w-8 h-5 rounded" />
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="flex-1 h-4 rounded" />
                  <Skeleton className="w-16 h-4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {league?.participants.map((p, i) => {
                const isPromo = p.rank <= (league.promotionZone);
                const isDemote = p.rank > (league.totalParticipants - (league.totalParticipants - league.demotionZone));
                const isUser = p.isCurrentUser;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 transition-colors',
                      isUser && 'bg-brand/5 border-brand/20',
                    )}
                  >
                    {/* Rank */}
                    <div className={cn(
                      'w-7 text-center font-extrabold text-sm',
                      p.rank === 1 ? 'text-yellow-500' :
                      p.rank === 2 ? 'text-slate-500' :
                      p.rank === 3 ? 'text-amber-600' : 'text-gray-400',
                    )}>
                      {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}
                    </div>

                    {/* Avatar */}
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0',
                      isUser ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600',
                    )}>
                      {p.avatar}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-bold truncate', isUser ? 'text-brand' : 'text-gray-800')}>
                        {p.name} {isUser && <span className="text-xs font-normal text-muted-foreground">(أنت)</span>}
                      </p>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1.5">
                      {isPromo && <TrendingUp size={13} className="text-green-500" />}
                      {isDemote && <TrendingDown size={13} className="text-red-400" />}
                      {!isPromo && !isDemote && <Minus size={13} className="text-gray-300" />}
                      <span className={cn('text-sm font-extrabold', isUser ? 'text-brand' : 'text-gray-700')}>
                        {p.xp} XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Motivation message */}
        {!isLoading && league && (
          <div className="bg-gradient-to-r from-brand/5 to-gold/5 border border-brand/10 rounded-2xl p-4 text-center">
            <p className="text-brand font-bold text-sm">
              {league.rank <= 3
                ? '🎉 أنت في المراكز الأولى! استمر للحفاظ على مكانتك'
                : `💪 أضف ${(league.participants[league.promotionZone - 1]?.xp ?? 0) - league.weeklyXp + 1} نقطة لتصل لمنطقة الترقية`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
