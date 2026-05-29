'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ParentSettings {
  studyDays: number[];
  studyStartHour: number;
  studyEndHour: number;
  minDailyMinutes: number;
  maxDailyMinutes: number;
  homeworkAIGuide: boolean;
  notificationLevel: 'quiet' | 'medium' | 'following';
  weekGoalSubject: string | null;
  weekGoalType: string | null;
}

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const NOTIF_LEVELS = [
  { key: 'quiet',     label: 'هادئ',   desc: 'واتساب مرة أسبوعياً فقط' },
  { key: 'medium',    label: 'متوسط',  desc: 'عند الإنجازات المهمة' },
  { key: 'following', label: 'متابع',  desc: 'إشعار يومي كامل' },
] as const;

const SUBJECTS = ['عبري', 'عربي', 'رياضيات', 'إنجليزي'];
const GOAL_TYPES = [
  { key: 'unit',    label: 'إتقان وحدة' },
  { key: 'days',    label: '5 أيام دراسة' },
  { key: 'score',   label: 'نتيجة 80%+' },
];

export default function ParentSettingsPage() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const [settings, setSettings] = useState<ParentSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery<ParentSettings>({
    queryKey: ['parentSettings'],
    queryFn: () => apiFetch('/parents/settings', { token: token! }),
    enabled: !!token,
  });

  useEffect(() => { if (data) setSettings(data); }, [data]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (s: ParentSettings) => apiFetch('/parents/settings', { method: 'POST', token: token!, body: JSON.stringify(s) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parentSettings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const toggle = <K extends keyof ParentSettings>(key: K, val: ParentSettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const toggleDay = (day: number) =>
    setSettings(prev => {
      if (!prev) return prev;
      const days = prev.studyDays.includes(day) ? prev.studyDays.filter(d => d !== day) : [...prev.studyDays, day];
      return { ...prev, studyDays: days };
    });

  if (isLoading || !settings) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-brand text-white px-4 py-3 shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-base text-gold">⚙️ الإعدادات الأبوية</h1>
          <p className="text-xs opacity-70">تحكم في بيئة تعلم ابنك</p>
        </div>
        <button
          onClick={() => save(settings)}
          disabled={isPending}
          className={cn('text-sm font-bold px-4 py-2 rounded-xl transition-all', saved ? 'bg-green-500 text-white' : 'bg-gold text-brand hover:brightness-110 disabled:opacity-60')}
        >
          {saved ? 'تم الحفظ ✓' : isPending ? '...' : 'حفظ'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-5">

        {/* Study days */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-extrabold text-brand mb-3">📅 أيام الدراسة المسموحة</h2>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day, i) => (
              <button key={i} onClick={() => toggleDay(i)}
                className={cn('px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all', settings.studyDays.includes(i) ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-brand/40')}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">💡 الجمعة والسبت مفتوحان دائماً</p>
        </motion.div>

        {/* Study hours */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="font-extrabold text-brand mb-3">🕐 أوقات الدراسة</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">من الساعة</p>
              <select value={settings.studyStartHour} onChange={e => toggle('studyStartHour', +e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-brand">
                {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">حتى الساعة</p>
              <select value={settings.studyEndHour} onChange={e => toggle('studyEndHour', +e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-brand">
                {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Daily limits */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-extrabold text-brand mb-3">⏱ الحد اليومي</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحد الأدنى (إلزامي)</p>
              <div className="flex items-center gap-2">
                <input type="range" min={5} max={60} step={5} value={settings.minDailyMinutes}
                  onChange={e => toggle('minDailyMinutes', +e.target.value)}
                  className="flex-1 accent-brand" />
                <span className="text-sm font-bold text-brand w-14 text-center">{settings.minDailyMinutes} د</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحد الأقصى (ثم يوقف)</p>
              <div className="flex items-center gap-2">
                <input type="range" min={20} max={180} step={10} value={settings.maxDailyMinutes}
                  onChange={e => toggle('maxDailyMinutes', +e.target.value)}
                  className="flex-1 accent-brand" />
                <span className="text-sm font-bold text-brand w-14 text-center">{settings.maxDailyMinutes} د</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI guidance mode */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-extrabold text-brand mb-1">🤖 وضع AI في الواجبات</h2>
          <p className="text-xs text-muted-foreground mb-3">مفعّل = الذكاء الاصطناعي يوجه بأسئلة / معطّل = يعطي الجواب مباشرة</p>
          <button onClick={() => toggle('homeworkAIGuide', !settings.homeworkAIGuide)}
            className={cn('relative w-16 h-8 rounded-full transition-colors', settings.homeworkAIGuide ? 'bg-brand' : 'bg-gray-300')}>
            <span className={cn('absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform', settings.homeworkAIGuide ? 'translate-x-9' : 'translate-x-1')} />
          </button>
          <p className="text-sm font-bold text-brand mt-2">{settings.homeworkAIGuide ? 'وضع التوجيه ✓' : 'وضع الإجابة المباشرة'}</p>
        </motion.div>

        {/* Notification level */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-extrabold text-brand mb-3">🔔 مستوى الإشعارات</h2>
          <div className="flex flex-col gap-2">
            {NOTIF_LEVELS.map(({ key, label, desc }) => (
              <button key={key} onClick={() => toggle('notificationLevel', key)}
                className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-right', settings.notificationLevel === key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40')}>
                <div className={cn('w-4 h-4 rounded-full border-2 shrink-0', settings.notificationLevel === key ? 'bg-brand border-brand' : 'border-gray-300')} />
                <div>
                  <p className={cn('text-sm font-bold', settings.notificationLevel === key ? 'text-brand' : 'text-gray-700')}>{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Week goal */}
        <motion.div className="bg-white rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-extrabold text-brand mb-3">🎯 هدف هذا الأسبوع</h2>
          <p className="text-xs text-muted-foreground mb-3">حدد هدفاً للطالب هذا الأسبوع</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">المادة</p>
              <select value={settings.weekGoalSubject ?? ''} onChange={e => toggle('weekGoalSubject', e.target.value || null)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-brand">
                <option value="">بدون تحديد</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">نوع الهدف</p>
              <select value={settings.weekGoalType ?? ''} onChange={e => toggle('weekGoalType', e.target.value || null)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-brand">
                <option value="">بدون تحديد</option>
                {GOAL_TYPES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </div>
          </div>
          {settings.weekGoalSubject && settings.weekGoalType && (
            <div className="bg-brand/5 rounded-xl px-4 py-2 text-sm font-bold text-brand">
              هدف الأسبوع: {GOAL_TYPES.find(g => g.key === settings.weekGoalType)?.label} في {settings.weekGoalSubject}
            </div>
          )}
        </motion.div>

        {/* Save button */}
        <button
          onClick={() => save(settings)}
          disabled={isPending}
          className="w-full bg-brand text-gold font-extrabold py-4 rounded-2xl shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 text-base"
        >
          {saved ? '✓ تم الحفظ بنجاح!' : isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </main>
    </div>
  );
}
