'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';

interface WeekDay {
  day: string;
  subject: string;
  lessonId: string;
  lessonTitle: string;
  done: boolean;
}

interface PersonalPlan {
  greeting: string;
  strengths: string[];
  weaknesses: string[];
  weeklySchedule: WeekDay[];
  completionForecast: string;
  upcomingExam: { name: string; date: string; readinessPercent: number };
  recommendation: { text: string; lessonId: string; lessonTitle: string };
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PlanPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const { data: plan, isLoading } = useQuery<PersonalPlan>({
    queryKey: ['plan'],
    queryFn: () => apiFetch('/plan', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: refreshPlan, isPending: refreshing } = useMutation({
    mutationFn: () => apiFetch('/plan/refresh', { method: 'POST', token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan'] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <NoorOwl expression="studying" size={80} animate />
          <p className="text-brand font-bold">جاري تحميل خطتك الشخصية...</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const examDays = daysUntil(plan.upcomingExam.date);
  const readiness = plan.upcomingExam.readinessPercent;
  const readinessColor = readiness >= 70 ? 'text-green-600' : readiness >= 40 ? 'text-yellow-600' : 'text-red-500';
  const today = new Date().getDay();

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-brand text-white px-4 py-3 flex justify-between items-center shadow-lg">
        <span className="text-lg font-extrabold text-gold">خطتي الشخصية 📋</span>
        <button
          onClick={() => refreshPlan()}
          disabled={refreshing}
          className="text-sm text-gold/80 hover:text-gold transition-colors disabled:opacity-60"
        >
          {refreshing ? 'جاري التحديث...' : 'تحديث ↺'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-5 lg:mr-60">

        {/* Greeting */}
        <motion.div
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-md"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <NoorOwl expression="excited" size={70} animate />
          <div>
            <h1 className="text-lg font-extrabold text-brand leading-snug">{plan.greeting}</h1>
            <p className="text-sm text-muted-foreground mt-1">هذه خطتك المخصصة لهذا الأسبوع</p>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <h3 className="text-sm font-extrabold text-green-700 mb-2">💪 نقاط قوتك</h3>
            {plan.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-green-600 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {s}
              </div>
            ))}
          </div>
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <h3 className="text-sm font-extrabold text-orange-700 mb-2">🎯 ما تحتاج تحسينه</h3>
            {plan.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-orange-600 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Schedule */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <h2 className="text-base font-extrabold text-brand mb-4">📅 جدول الأسبوع</h2>
          <div className="flex flex-col gap-2">
            {plan.weeklySchedule.map((entry, i) => {
              const isToday = i === today;
              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all
                    ${entry.done ? 'bg-green-50 border-green-200 opacity-70' : isToday ? 'bg-brand/5 border-brand shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                >
                  <span className="text-lg w-7 text-center">{entry.done ? '✅' : isToday ? '▶️' : '📖'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isToday ? 'text-brand' : 'text-gray-700'}`}>
                      {entry.day} — {entry.lessonTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.subject}</p>
                  </div>
                  {!entry.done && (
                    <button
                      onClick={() => router.push(`/lesson/${entry.lessonId}`)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95
                        ${isToday ? 'bg-brand text-gold shadow' : 'bg-gray-200 text-gray-600 hover:bg-brand hover:text-gold'}`}
                    >
                      ابدأ
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Exam Countdown */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm border-2 border-brand/20"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-extrabold text-brand mb-4">🏆 الاختبار القادم</h2>
          <div className="flex items-center gap-4">
            <div className="text-center bg-brand/5 rounded-2xl p-4 min-w-[80px]">
              <p className="text-3xl font-extrabold text-brand">{examDays}</p>
              <p className="text-xs text-muted-foreground">يوم متبقي</p>
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-brand">{plan.upcomingExam.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(plan.upcomingExam.date)}</p>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">مستوى الاستعداد</span>
                  <span className={`text-xs font-extrabold ${readinessColor}`}>{readiness}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${readiness >= 70 ? 'bg-green-500' : readiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${readiness}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completion Forecast */}
        <motion.div
          className="bg-gradient-to-br from-brand to-blue-700 rounded-2xl p-5 text-white shadow-md"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <h2 className="text-base font-extrabold text-gold mb-1">🗓 توقع الإنجاز</h2>
          <p className="text-sm text-white/80">
            إذا واصلت الدراسة بهذا المعدل، ستنهي المنهج بحلول
          </p>
          <p className="text-xl font-extrabold text-gold mt-1">{formatDate(plan.completionForecast)}</p>
        </motion.div>

        {/* NoorOwl Recommendation */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm border-2 border-amber-200"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <NoorOwl expression="thinking" size={90} animate />
            <div className="flex-1">
              <h3 className="font-extrabold text-brand mb-1">توصية نور 🦉</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.recommendation.text}</p>
              <button
                className="mt-3 bg-brand text-gold font-bold text-sm px-4 py-2 rounded-xl shadow hover:opacity-90 active:scale-95 transition-all"
                onClick={() => router.push(`/lesson/${plan.recommendation.lessonId}`)}
              >
                ابدأ: {plan.recommendation.lessonTitle} →
              </button>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
