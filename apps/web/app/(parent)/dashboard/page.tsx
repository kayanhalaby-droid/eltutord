'use client';

import { useState } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';
import { cn } from '@/lib/utils';

interface Child {
  id: string; firstName: string; lastName: string; gradeLevel: number;
  xp: number; weeklyXp: number; streak: number; gems: number;
  studiedToday: boolean; todayDurationMinutes: number;
  lastActivity: { subject: string; unit: string; lessonTitle: string; score: number };
}

const QUICK_MESSAGES = [
  { text: 'أنا فخور/ة بك! ⭐', emoji: '⭐' },
  { text: 'استمر، أنت رائع! 💪', emoji: '💪' },
  { text: 'أحبك ومعك دائماً 💙', emoji: '💙' },
];
const GEM_AMOUNTS = [50, 100, 200];

function scoreStars(score: number) {
  if (score >= 90) return '⭐⭐⭐';
  if (score >= 70) return '⭐⭐';
  return '⭐';
}

function EncouragementModal({ child, onClose }: { child: Child; onClose: () => void }) {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [gems, setGems] = useState(0);
  const [sent, setSent] = useState(false);
  const user = useAuthStore(s => s.user);

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => apiFetch(`/parents/encourage/${child.id}`, {
      method: 'POST',
      token: token!,
      body: JSON.stringify({ message: message || QUICK_MESSAGES[0].text, gems, fromName: user?.firstName ?? 'الأهل' }),
    }),
    onSuccess: () => { setSent(true); qc.invalidateQueries({ queryKey: ['parentChildren'] }); },
  });

  if (sent) return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div className="bg-white rounded-3xl p-7 max-w-xs w-full flex flex-col items-center gap-4 shadow-2xl" initial={{ scale: 0.7 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
        <NoorOwl expression="excited" size={80} animate />
        <h2 className="text-xl font-extrabold text-brand text-center">وُصل التشجيع! 🎉</h2>
        <p className="text-sm text-muted-foreground text-center">سيرى {child.firstName} رسالتك قبل درسه القادم</p>
        <button onClick={onClose} className="w-full bg-brand text-gold font-extrabold py-3 rounded-2xl">ممتاز!</button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <NoorOwl expression="happy" size={50} animate />
          <div>
            <h2 className="font-extrabold text-brand">أرسل تشجيعاً</h2>
            <p className="text-xs text-muted-foreground">إلى {child.firstName} 💙</p>
          </div>
        </div>

        {/* Quick messages */}
        <div className="flex flex-col gap-2">
          {QUICK_MESSAGES.map(m => (
            <button key={m.text} onClick={() => setMessage(m.text)}
              className={cn('w-full px-4 py-3 rounded-xl border-2 text-right text-sm font-bold transition-all', message === m.text ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 hover:border-brand/40')}>
              {m.text}
            </button>
          ))}
          <div className="relative">
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand transition-colors"
              rows={2} placeholder="✏️ اكتب رسالة خاصة..."
              value={!QUICK_MESSAGES.find(m => m.text === message) ? message : ''}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Gem bonus */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">+ هدية جواهر (اختياري)</p>
          <div className="flex gap-2">
            <button onClick={() => setGems(0)} className={cn('px-3 py-1.5 rounded-xl border-2 text-sm font-bold transition-all', gems === 0 ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200')}>بدون</button>
            {GEM_AMOUNTS.map(g => (
              <button key={g} onClick={() => setGems(g)}
                className={cn('flex-1 py-1.5 rounded-xl border-2 text-sm font-bold transition-all', gems === g ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 hover:border-brand/40')}>
                💎 {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl text-sm">إلغاء</button>
          <button onClick={() => send()} disabled={isPending}
            className="flex-[2] bg-brand text-gold font-extrabold py-3 rounded-2xl shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
            {isPending ? 'جاري الإرسال...' : '💌 أرسل التشجيع'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WeekQuestionWidget({ childId }: { childId: string }) {
  const token = useAuthStore(s => s.token);
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery<{ question: string; subject: string; hint: string; tip: string }>({
    queryKey: ['weekQuestion', childId],
    queryFn: () => apiFetch(`/parents/week-question/${childId}`, { token: token! }),
    enabled: !!token,
    staleTime: 3_600_000,
  });

  if (!data) return null;

  return (
    <motion.div
      className="bg-gradient-to-br from-brand/10 to-blue-50 border-2 border-brand/20 rounded-2xl p-4"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <span className="text-2xl">📅</span>
        <div className="flex-1">
          <p className="font-extrabold text-brand text-sm">سؤال هذا الأسبوع</p>
          <p className="text-xs text-muted-foreground">{data.tip}</p>
        </div>
        <span className="text-brand font-bold text-lg">{expanded ? '▲' : '▼'}</span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div className="mt-3 flex flex-col gap-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="bg-white rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">السؤال ({data.subject})</p>
              <p className="font-bold text-brand">{data.question}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <p className="text-xs text-amber-700 font-bold">💡 تلميح للأهل: {data.hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LinkChildModal({ onClose }: { onClose: () => void }) {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const [phone, setPhone] = useState('');
  const [phase, setPhase] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [linkedChild, setLinkedChild] = useState<{ firstName: string; gradeLevel: number } | null>(null);

  const { mutate: linkChild, isPending } = useMutation({
    mutationFn: () => apiFetch('/parents/children/link', {
      method: 'POST',
      token: token!,
      body: JSON.stringify({ phone: phone.trim() }),
    }),
    onSuccess: (data: any) => {
      setLinkedChild(data.child);
      setPhase('success');
      qc.invalidateQueries({ queryKey: ['parentChildren'] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
      setPhase('error');
    },
  });

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={e => e.stopPropagation()}>
        {phase === 'success' ? (
          <>
            <NoorOwl expression="excited" size={80} animate />
            <h2 className="text-xl font-extrabold text-brand text-center">تم الربط! 🎉</h2>
            <p className="text-sm text-muted-foreground text-center">
              تم ربط <span className="font-bold text-brand">{linkedChild?.firstName}</span> (الصف {linkedChild?.gradeLevel}) بحسابك
            </p>
            <button onClick={onClose} className="w-full bg-brand text-gold font-extrabold py-3 rounded-2xl">ممتاز!</button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <NoorOwl expression="happy" size={50} />
              <div>
                <h2 className="font-extrabold text-brand">ربط طفل جديد</h2>
                <p className="text-xs text-muted-foreground">أدخل رقم هاتف الطالب</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700">
              💡 للتجربة: أرقام تجريبية: 0501111111 أو 0502222222 أو 0503333333
            </div>

            <input
              type="tel"
              dir="ltr"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand transition-colors text-center font-mono tracking-widest"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhase('idle'); setErrorMsg(''); }}
              maxLength={15}
            />

            {phase === 'error' && (
              <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl text-sm">إلغاء</button>
              <button
                onClick={() => linkChild()}
                disabled={isPending || phone.length < 9}
                className="flex-[2] bg-brand text-gold font-extrabold py-3 rounded-2xl shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? 'جاري البحث...' : '🔗 ربط الطفل'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function StudyWithMeModal({ child, onClose }: { child: Child; onClose: () => void }) {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const [phase, setPhase] = useState<'intro' | 'active' | 'done'>('intro');
  const [seconds, setSeconds] = useState(0);

  const { mutate: completeSession } = useMutation({
    mutationFn: () => apiFetch(`/parents/study-session/${child.id}/complete`, { method: 'POST', token: token! }),
    onSuccess: () => { setPhase('done'); qc.invalidateQueries({ queryKey: ['parentChildren'] }); },
  });

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = () => {
    setPhase('active');
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    completeSession();
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={phase === 'intro' ? onClose : undefined}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl text-center"
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {phase === 'intro' && (
          <>
            <NoorOwl expression="excited" size={80} animate />
            <h2 className="text-xl font-extrabold text-brand">درّس مع {child.firstName}! 📚</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              اجلس مع ابنك/ابنتك خلال الجلسة. عند الانتهاء يحصل {child.firstName} على <span className="font-bold text-amber-600">+50 💎</span> مكافأة خاصة!
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl text-sm">لاحقاً</button>
              <button onClick={startTimer} className="flex-[2] bg-brand text-gold font-extrabold py-3 rounded-2xl shadow hover:opacity-90 active:scale-95 transition-all">
                ابدأ الجلسة 🚀
              </button>
            </div>
          </>
        )}
        {phase === 'active' && (
          <>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <NoorOwl expression="studying" size={80} animate={false} />
            </motion.div>
            <h2 className="text-xl font-extrabold text-brand">جلسة نشطة 🟢</h2>
            <div className="text-5xl font-extrabold text-brand font-mono">{fmt(seconds)}</div>
            <p className="text-sm text-muted-foreground">أنت مع {child.firstName} الآن 💙</p>
            <button onClick={stopTimer}
              className="w-full bg-green-500 text-white font-extrabold py-3.5 rounded-2xl shadow hover:bg-green-600 active:scale-95 transition-all">
              انتهت الجلسة ✅
            </button>
          </>
        )}
        {phase === 'done' && (
          <>
            <NoorOwl expression="happy" size={80} animate />
            <h2 className="text-xl font-extrabold text-brand">أحسنتم! 🎉</h2>
            <p className="text-sm text-muted-foreground">
              حصل {child.firstName} على <span className="font-extrabold text-amber-600">+50 💎</span> مكافأة على الجلسة المشتركة!
            </p>
            <button onClick={onClose} className="w-full bg-brand text-gold font-extrabold py-3.5 rounded-2xl shadow hover:opacity-90 active:scale-95 transition-all">رائع!</button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function ChildCard({ child, onEncourage, onReport, onStudyWithMe }: { child: Child; onEncourage: () => void; onReport: () => void; onStudyWithMe: () => void }) {
  const notStudied = !child.studiedToday;
  return (
    <motion.div
      className={cn('bg-white rounded-3xl p-5 shadow-md border-2 transition-all', notStudied ? 'border-red-200 bg-red-50/30' : 'border-green-200')}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl font-extrabold', notStudied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}>
          {child.firstName.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-brand text-base">{child.firstName} {child.lastName}</h3>
          <p className="text-xs text-muted-foreground">الصف {child.gradeLevel}</p>
        </div>
        <div className={cn('text-xs font-bold px-2.5 py-1 rounded-full', notStudied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}>
          {notStudied ? 'لم يدرس اليوم ⚠️' : `✅ درس ${child.todayDurationMinutes} دقيقة`}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Streak', value: `🔥 ${child.streak} يوم` },
          { label: 'XP الأسبوع', value: `⭐ ${child.weeklyXp}` },
          { label: 'جواهر', value: `💎 ${child.gems}` },
        ].map(s => (
          <div key={s.label} className="bg-brand/5 rounded-xl px-2 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-extrabold text-brand">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Last activity */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-4">
        <p className="text-xs text-muted-foreground mb-0.5">آخر نشاط</p>
        <p className="text-sm font-bold text-brand">{child.lastActivity.subject} — {child.lastActivity.unit}</p>
        <p className="text-xs text-muted-foreground">{child.lastActivity.lessonTitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-extrabold text-brand">{child.lastActivity.score}%</span>
          <span className="text-sm">{scoreStars(child.lastActivity.score)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={onEncourage}
          className="flex-1 min-w-[44px] bg-brand text-gold font-extrabold py-2.5 rounded-2xl text-sm shadow hover:opacity-90 active:scale-95 transition-all">
          💌 تشجيع
        </button>
        <button onClick={onStudyWithMe}
          className="flex-1 min-w-[44px] bg-amber-500 text-white font-extrabold py-2.5 rounded-2xl text-sm shadow hover:bg-amber-600 active:scale-95 transition-all">
          📚 درّس معي
        </button>
        <button onClick={onReport}
          className="flex-1 min-w-[44px] border-2 border-brand text-brand font-bold py-2.5 rounded-2xl text-sm hover:bg-brand/5 active:scale-95 transition-all">
          📊 تقرير
        </button>
      </div>
    </motion.div>
  );
}

export default function ParentDashboardPage() {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const [encourageChild, setEncourageChild] = useState<Child | null>(null);
  const [reportChildId, setReportChildId] = useState<string | null>(null);
  const [studyWithChild, setStudyWithChild] = useState<Child | null>(null);
  const [showLinkChild, setShowLinkChild] = useState(false);

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ['parentChildren'],
    queryFn: () => apiFetch('/parents/children', { token: token! }),
    enabled: !!token,
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const pendingCount = children.filter(c => !c.studiedToday).length;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-brand text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <NoorOwl expression="happy" size={38} />
        <div className="flex-1">
          <h1 className="font-extrabold text-base text-gold">لوحة الأهل</h1>
          <p className="text-xs opacity-70">مرحباً، {user?.firstName}</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {pendingCount} لم يدرسوا
          </div>
        )}
        <button
          onClick={() => setShowLinkChild(true)}
          className="bg-gold text-brand text-xs font-extrabold px-3 py-1.5 rounded-full shadow hover:opacity-90 active:scale-95 transition-all"
        >
          + ربط طفل
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">

        {/* سؤال الأسبوع — week question widget */}
        {children.length > 0 && (
          <WeekQuestionWidget childId={children[0].id} />
        )}

        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />
          ))
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-16">
            <NoorOwl expression="encouraging" size={90} animate />
            <div className="text-center">
              <p className="text-brand font-extrabold text-lg mb-1">لم يتم ربط أي طفل بعد</p>
              <p className="text-muted-foreground text-sm">أضف رقم هاتف طفلك لمتابعة تقدمه</p>
            </div>
            <button
              onClick={() => setShowLinkChild(true)}
              className="bg-brand text-gold font-extrabold px-8 py-3.5 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all text-base"
            >
              🔗 ربط طفل الآن
            </button>
          </div>
        ) : (
          children.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              onEncourage={() => setEncourageChild(child)}
              onReport={() => setReportChildId(child.id)}
              onStudyWithMe={() => setStudyWithChild(child)}
            />
          ))
        )}
      </main>

      <AnimatePresence>
        {encourageChild && (
          <EncouragementModal child={encourageChild} onClose={() => setEncourageChild(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {studyWithChild && (
          <StudyWithMeModal child={studyWithChild} onClose={() => setStudyWithChild(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLinkChild && (
          <LinkChildModal onClose={() => setShowLinkChild(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
