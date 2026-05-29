'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LogOut, Star, Flame, Gem, Heart, Trophy, Calendar, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { useAchievements } from '@/lib/hooks/useAchievements';
import NoorOwl from '@/components/NoorOwl';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProfileData {
  id: string; firstName: string; lastName: string;
  gradeLevel: number; xp: number; level: number;
  streak: number; gems: number; hearts: number;
  weeklyXp: number; completedLessons: number;
  joinedAt: string; longestStreak: number;
}

interface CalendarData {
  streak: number;
  calendar: { date: string; active: boolean; xp: number }[];
  longestStreak: number;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'مبتدئ', 2: 'متعلم', 3: 'نشيط', 4: 'متقدم',
  5: 'محترف', 6: 'خبير', 7: 'بطل', 8: 'أسطورة',
};

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, clearAuth } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ['userProfile'],
    queryFn: () => apiFetch('/user/profile', { token: token! }),
    enabled: !!token,
  });

  const { data: calendarData } = useQuery<CalendarData>({
    queryKey: ['streakCalendar'],
    queryFn: () => apiFetch('/gamification/streak/calendar', { token: token! }),
    enabled: !!token,
  });

  const { data: achievements = [] } = useAchievements();

  const lvl = profile?.level ?? 1;
  const xpForNext = lvl * 200;
  const xpProgress = ((profile?.xp ?? 0) % xpForNext) / xpForNext * 100;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-extrabold text-brand flex-1">ملفي الشخصي</h1>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-6 flex flex-col gap-5">

        {/* Hero Card */}
        <motion.div
          className="bg-gradient-to-br from-brand to-brand/80 rounded-3xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold border-3 border-white/40">
                {profile?.firstName?.charAt(0) ?? user?.firstName?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -left-1 bg-gold text-brand text-xs font-extrabold rounded-full px-2 py-0.5 shadow">
                {lvl}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold truncate">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-white/70 text-sm">الصف {profile?.gradeLevel} · {LEVEL_TITLES[lvl] ?? 'متعلم'}</p>
            </div>
            <NoorOwl expression="happy" size={56} />
          </div>

          {/* XP progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>المستوى {lvl}</span>
              <span>{profile?.xp ?? 0} / {lvl * 200} XP</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🔥', label: 'السلسلة الحالية', value: `${profile?.streak ?? 0} يوم`,    color: 'text-orange-500' },
            { icon: '⭐', label: 'إجمالي XP',       value: (profile?.xp ?? 0).toLocaleString('ar'), color: 'text-yellow-500' },
            { icon: '💎', label: 'الجواهر',          value: (profile?.gems ?? 0).toLocaleString('ar'), color: 'text-cyan-500' },
            { icon: '📚', label: 'الدروس المكتملة',  value: `${profile?.completedLessons ?? 0} درس`, color: 'text-emerald-500' },
            { icon: '🏆', label: 'أطول سلسلة',       value: `${calendarData?.longestStreak ?? 0} يوم`, color: 'text-purple-500' },
            { icon: '🏅', label: 'الإنجازات',         value: `${unlockedCount} / ${achievements.length}`, color: 'text-brand' },
          ].map(({ icon, label, value, color }, i) => (
            <motion.div
              key={label}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn('text-base font-extrabold', color)}>{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streak Calendar */}
        {calendarData?.calendar && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-brand mb-4 flex items-center gap-2">
              <Calendar size={18} />
              نشاط آخر ٣٠ يوماً
            </h3>
            <div className="grid grid-cols-[repeat(10,1fr)] gap-1.5">
              {calendarData.calendar.map((day, i) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.xp} XP`}
                  className={cn(
                    'aspect-square rounded-md transition-colors',
                    day.active ? 'bg-brand' : 'bg-gray-100',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gray-100" /> بدون نشاط
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-brand" /> يوم نشط
              </div>
            </div>
          </div>
        )}

        {/* Achievements preview */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-brand flex items-center gap-2">
              <Trophy size={18} />
              الإنجازات ({unlockedCount} / {achievements.length})
            </h3>
            <Link href="/achievements" className="text-xs text-brand font-bold flex items-center gap-1 hover:opacity-80">
              عرض الكل <ChevronLeft size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {achievements.slice(0, 8).map(a => (
              <div key={a.id} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all',
                  a.isUnlocked ? 'border-gold bg-gold/10 shadow-sm' : 'border-gray-100 bg-gray-50 grayscale opacity-40',
                )}>
                  {a.icon}
                </div>
                <p className="text-[10px] text-center text-muted-foreground leading-tight">{a.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logout (desktop) */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="hidden lg:flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-600 font-bold bg-white rounded-2xl p-4 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </main>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          >
            <NoorOwl expression="sad" size={60} animate />
            <h3 className="text-lg font-extrabold text-brand mt-3">هل تريد الخروج؟</h3>
            <p className="text-sm text-muted-foreground mt-1">سيتم إنهاء جلستك الحالية</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => { clearAuth(); router.replace('/login'); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                خروج
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
