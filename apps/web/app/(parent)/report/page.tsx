'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Child { id: string; firstName: string; gradeLevel: number }
interface DayData { day: string; minutes: number; score: number }
interface WeeklyReport {
  childName: string; weekLabel: string;
  daysStudied: number; totalMinutes: number; lessonsCompleted: number; avgScore: number;
  bestSubject: { name: string; score: number };
  weakSubject: { name: string; score: number };
  streak: number; gemsEarned: number; weeklyXp: number;
  comparedToLastWeek: { minutesDelta: number; scoreDelta: number };
  recommendation: string;
  dailyBreakdown: DayData[];
}

function Delta({ val, suffix = '' }: { val: number; suffix?: string }) {
  if (val === 0) return <span className="text-gray-400">—</span>;
  return <span className={val > 0 ? 'text-green-600' : 'text-red-500'}>{val > 0 ? '↑' : '↓'} {Math.abs(val)}{suffix}</span>;
}

export default function ReportPage() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ['parentChildren'],
    queryFn: () => apiFetch('/parents/children', { token: token! }),
    enabled: !!token,
  });

  const childId = selectedChild ?? children[0]?.id ?? null;

  const { data: report, isLoading } = useQuery<WeeklyReport>({
    queryKey: ['parentReport', childId],
    queryFn: () => apiFetch(`/parents/children/${childId}/report`, { token: token! }),
    enabled: !!token && !!childId,
  });

  const maxMinutes = Math.max(...(report?.dailyBreakdown ?? []).map(d => d.minutes), 1);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-brand text-white px-4 py-3 shadow-md">
        <h1 className="font-extrabold text-base text-gold">📊 التقرير الأسبوعي</h1>
        {report && <p className="text-xs opacity-70">{report.weekLabel}</p>}
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-5">

        {/* Child selector */}
        {children.length > 1 && (
          <div className="flex gap-2">
            {children.map(c => (
              <button key={c.id} onClick={() => setSelectedChild(c.id)}
                className={cn('px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all', (selectedChild ?? children[0]?.id) === c.id ? 'bg-brand text-white border-brand' : 'border-gray-200 hover:border-brand/40')}>
                {c.firstName}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)
        ) : report ? (
          <>
            {/* Summary card */}
            <motion.div className="bg-white rounded-2xl p-5 shadow-sm border border-brand/10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-extrabold text-brand text-lg mb-3">📋 ملخص أسبوع {report.childName}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'أيام درس', value: `${report.daysStudied} من 7`, icon: '📅' },
                  { label: 'إجمالي الوقت', value: `${report.totalMinutes} دقيقة`, icon: '⏱' },
                  { label: 'دروس مكتملة', value: report.lessonsCompleted, icon: '📚' },
                  { label: 'متوسط النتيجة', value: `${report.avgScore}%`, icon: '⭐' },
                ].map(s => (
                  <div key={s.label} className="bg-brand/5 rounded-xl px-3 py-3 flex items-center gap-2">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-base font-extrabold text-brand">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Best/weak + streak */}
            <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-1">💪 الأقوى</p>
                <p className="font-extrabold text-brand text-sm">{report.bestSubject.name}</p>
                <p className="text-xl font-extrabold text-green-600">{report.bestSubject.score}%</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <p className="text-xs font-bold text-orange-700 mb-1">📈 يحتاج تحسين</p>
                <p className="font-extrabold text-brand text-sm">{report.weakSubject.name}</p>
                <p className="text-xl font-extrabold text-orange-600">{report.weakSubject.score}%</p>
              </div>
              <div className="bg-brand/5 rounded-2xl p-4 border border-brand/20">
                <p className="text-xs text-muted-foreground mb-1">🔥 Streak</p>
                <p className="text-xl font-extrabold text-brand">{report.streak} يوم</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="text-xs text-muted-foreground mb-1">💎 جواهر مكتسبة</p>
                <p className="text-xl font-extrabold text-amber-600">{report.gemsEarned}</p>
              </div>
            </motion.div>

            {/* Vs last week */}
            <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="font-extrabold text-brand mb-3">مقارنة بالأسبوع الماضي</h3>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">وقت الدراسة</p>
                  <Delta val={report.comparedToLastWeek.minutesDelta} suffix=" دقيقة" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">متوسط النتيجة</p>
                  <Delta val={report.comparedToLastWeek.scoreDelta} suffix="%" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <span className="text-brand font-bold">مستمر →</span>
                </div>
              </div>
            </motion.div>

            {/* Daily bar chart */}
            <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="font-extrabold text-brand mb-4">📈 أداء أيام الأسبوع</h3>
              <div className="flex items-end gap-2 h-28">
                {report.dailyBreakdown.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                      <motion.div
                        className={cn('rounded-t-lg w-full', d.minutes > 0 ? 'bg-brand' : 'bg-gray-100')}
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.minutes / maxMinutes) * 80}px` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">{d.day.slice(0, 3)}</p>
                    {d.minutes > 0 && <p className="text-[9px] font-bold text-brand">{d.minutes}د</p>}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommendation */}
            <motion.div className="bg-gradient-to-br from-brand to-blue-700 rounded-2xl p-5 text-white shadow-md" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-extrabold text-gold mb-1">🎯 توصية للأسبوع القادم</h3>
              <p className="text-sm text-white/90 mb-3">{report.recommendation}</p>
              <button
                onClick={() => router.push('/parent/settings')}
                className="bg-gold text-brand font-bold text-sm px-4 py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all"
              >
                ضبط هدف الأسبوع →
              </button>
            </motion.div>
          </>
        ) : null}
      </main>
    </div>
  );
}
