'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';
import Confetti from '@/components/effects/Confetti';
import XPCounter from '@/components/effects/XPCounter';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { useAuthStore } from '@/store/auth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { apiFetch } from '@/lib/api';
import { QuestionDto, MCQContent, TrueFalseContent } from '@/lib/types/lesson';
import MCQ from '@/app/(student)/lesson/[lessonId]/components/QuestionTypes/MCQ';
import TrueFalse from '@/app/(student)/lesson/[lessonId]/components/QuestionTypes/TrueFalse';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step =
  | 'splash' | 'age' | 'subject' | 'grade' | 'motivation'
  | 'goal' | 'trial_lesson' | 'placement_test' | 'celebrate' | 'register';

type AgeGroup = '6-7' | '8-9' | '10-11' | '12-13' | '14-15' | '16+';
type Subject = 'رياضيات' | 'עברית' | 'عربي' | 'English';

// ── Language helpers ──────────────────────────────────────────────────────────
function getLang(subject: string | null) {
  if (subject === 'עברית') return 'he';
  if (subject === 'English') return 'en';
  return 'ar';
}

function getFeedbackText(subject: string | null, isCorrect: boolean, correctDisplay: string): string {
  const lang = getLang(subject);
  if (isCorrect) {
    if (lang === 'he') return 'מצוין! תשובה נכונה 🌟';
    if (lang === 'en') return 'Excellent! Correct answer 🌟';
    return 'ممتاز! إجابة صحيحة 🌟';
  }
  if (lang === 'he') return correctDisplay ? `התשובה: ${correctDisplay}` : 'כמעט! נסה שוב';
  if (lang === 'en') return correctDisplay ? `Answer: ${correctDisplay}` : 'Almost! Try again';
  return correctDisplay ? `الإجابة: ${correctDisplay}` : 'تقريباً! حاول مرة أخرى';
}

function getCounterText(subject: string | null, current: number, total: number): string {
  const lang = getLang(subject);
  if (lang === 'he') return `שאלה ${current} מתוך ${total}`;
  if (lang === 'en') return `Question ${current} of ${total}`;
  return `سؤال ${current} من ${total}`;
}

function getLoadingText(subject: string | null): string {
  const lang = getLang(subject);
  if (lang === 'he') return 'טוען שאלות...';
  if (lang === 'en') return 'Loading questions...';
  return 'جاري التحميل...';
}

// ── Answer helpers ────────────────────────────────────────────────────────────
function checkAnswer(question: QuestionDto, userAnswer: unknown): boolean {
  const correct = question.correctAnswer as Record<string, unknown>;
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'REVERSE_CHOICE': {
      const correctIds = ([...(correct.selectedOptionIds as string[])]).sort();
      const userIds = ([...(userAnswer as string[])]).sort();
      return JSON.stringify(userIds) === JSON.stringify(correctIds);
    }
    case 'TRUE_FALSE':
      return (userAnswer as boolean) === (correct.isTrue as boolean);
    default:
      return true;
  }
}

function getCorrectDisplay(question: QuestionDto): string {
  const correct = question.correctAnswer as Record<string, unknown>;
  switch (question.type) {
    case 'MULTIPLE_CHOICE': {
      const ids = correct.selectedOptionIds as string[];
      const opts = ((question.content as { options?: Array<{ id: string; text: string }> }).options) ?? [];
      return ids.map(id => opts.find(o => o.id === id)?.text ?? id).join('، ');
    }
    case 'TRUE_FALSE':
      return (correct.isTrue as boolean) ? 'صحيح ✅' : 'خطأ ❌';
    default:
      return '';
  }
}

// ── Motivation options ────────────────────────────────────────────────────────
const MOTIVATION_YOUNG = [
  { icon: '🌟', label: 'أريد أن أكون متفوقاً' },
  { icon: '🎮', label: 'التعلم ممتع' },
  { icon: '👨‍👩‍👧', label: 'أسعد أهلي' },
  { icon: '🏆', label: 'أريد أن أفوز' },
];
const MOTIVATION_MIDDLE = [
  { icon: '📚', label: 'أنجح في المدرسة' },
  { icon: '🧠', label: 'أطوّر نفسي' },
  { icon: '💼', label: 'أحضّر للمستقبل' },
  { icon: '🤝', label: 'أنافس أصدقائي' },
];
const MOTIVATION_HIGH = [
  { icon: '🎓', label: 'التفوق في الثانوية' },
  { icon: '🏛️', label: 'الجامعة والمستقبل' },
  { icon: '💡', label: 'فهم حقيقي وعميق' },
  { icon: '⏱️', label: 'استغلال الوقت' },
];

function getMotivationOptions(age: AgeGroup | null) {
  if (!age || age === '6-7' || age === '8-9') return MOTIVATION_YOUNG;
  if (age === '10-11' || age === '12-13') return MOTIVATION_MIDDLE;
  return MOTIVATION_HIGH;
}

// ── TrialLesson ───────────────────────────────────────────────────────────────
interface TrialProps {
  subject: string;
  grade: number;
  onComplete: (score: number, total: number, guestProgress: Record<string, { score: number; completedAt: string }>) => void;
}

function TrialLesson({ subject, grade, onComplete }: TrialProps) {
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [userAnswer, setUserAnswer] = useState<unknown>(null);
  const [score, setScore] = useState(0);
  const [guestProgress, setGuestProgress] = useState<Record<string, { score: number; completedAt: string }>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSound } = useSoundEffects();

  useEffect(() => {
    apiFetch<QuestionDto[]>(
      `/curriculum/onboarding-questions?subject=${encodeURIComponent(subject)}&grade=${grade}`,
      {},
    )
      .then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleAnswer = useCallback((answer: unknown) => {
    if (feedback !== null || !questions.length) return;
    const q = questions[idx];
    const isCorrect = checkAnswer(q, answer);
    setUserAnswer(answer);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    playSound(isCorrect ? 'correct' : 'wrong');
    const newScore = isCorrect ? score + 1 : score;
    const newProgress = {
      ...guestProgress,
      [q.id]: { score: isCorrect ? 1 : 0, completedAt: new Date().toISOString() },
    };

    timerRef.current = setTimeout(() => {
      setFeedback(null);
      setUserAnswer(null);
      if (idx < questions.length - 1) {
        setIdx(i => i + 1);
        setScore(newScore);
        setGuestProgress(newProgress);
      } else {
        onComplete(newScore, questions.length, newProgress);
      }
    }, 900);
  }, [feedback, questions, idx, score, guestProgress, playSound, onComplete]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">{getLoadingText(subject)}</p>
      </div>
    );
  }
  if (!questions.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد أسئلة متاحة</p>
      </div>
    );
  }

  const q = questions[idx];
  const isAnswered = feedback !== null;
  const correct = q.correctAnswer as Record<string, unknown>;

  const renderQuestion = () => {
    switch (q.type) {
      case 'MULTIPLE_CHOICE': {
        const mc = q.content as unknown as MCQContent;
        return (
          <MCQ
            content={mc}
            onAnswer={(ids) => handleAnswer(ids)}
            disabled={isAnswered}
            correctIds={isAnswered ? (correct.selectedOptionIds as string[]) : undefined}
            selectedIds={isAnswered ? (userAnswer as string[]) : undefined}
          />
        );
      }
      case 'TRUE_FALSE': {
        const tf = q.content as unknown as TrueFalseContent;
        return (
          <TrueFalse
            content={tf}
            onAnswer={(val) => handleAnswer(val)}
            disabled={isAnswered}
            correctAnswer={isAnswered ? (correct.isTrue as boolean) : undefined}
            userAnswer={isAnswered ? (userAnswer as boolean) : null}
          />
        );
      }
      default: {
        const mc = q.content as unknown as MCQContent;
        if (mc?.options) {
          return (
            <MCQ
              content={mc}
              onAnswer={(ids) => handleAnswer(ids)}
              disabled={isAnswered}
              correctIds={isAnswered ? (correct.selectedOptionIds as string[]) : undefined}
              selectedIds={isAnswered ? (userAnswer as string[]) : undefined}
            />
          );
        }
        return null;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="text-center">
        <NoorOwl
          expression={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'encouraging' : 'studying'}
          size={60}
          animate
        />
        <p className="text-xs text-muted-foreground mt-2 font-semibold">
          {getCounterText(subject, idx + 1, questions.length)}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div
            className="h-full bg-[#FFD700] rounded-full transition-all"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`rounded-2xl p-4 flex items-center gap-3 ${
              feedback === 'correct'
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-orange-50 border-2 border-orange-300'
            }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-2xl">{feedback === 'correct' ? '✨' : '🧠'}</span>
            {feedback === 'correct' && <XPCounter amount={10} />}
            <p className="font-bold text-sm">
              {getFeedbackText(subject, feedback === 'correct', getCorrectDisplay(q))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PlacementTest (auto-advance, no user interaction) ─────────────────────────
interface PlacementTestProps {
  subject: string;
  grade: number;
  trialScore: number;
  trialTotal: number;
  onComplete: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

function PlacementTest({ subject, grade, trialScore, trialTotal, onComplete }: PlacementTestProps) {
  useEffect(() => {
    apiFetch(
      `/curriculum/onboarding-questions/placement?subject=${encodeURIComponent(subject)}&grade=${grade}`,
      {},
    )
      .then(() => {
        const pct = trialTotal > 0 ? trialScore / trialTotal : 0;
        const level: 'beginner' | 'intermediate' | 'advanced' =
          pct >= 0.7 ? 'advanced' : pct >= 0.4 ? 'intermediate' : 'beginner';
        onComplete(level);
      })
      .catch(() => onComplete('beginner'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 py-10">
      <NoorOwl expression="studying" size={80} animate />
      <p className="text-muted-foreground">{getLoadingText(subject)}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { data, update, clear } = useOnboardingState();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('splash');
  const [showConfetti, setShowConfetti] = useState(false);
  const splashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    if (step === 'splash') {
      splashTimer.current = setTimeout(() => setStep('age'), 1500);
    }
    return () => { if (splashTimer.current) clearTimeout(splashTimer.current); };
  }, [step]);

  const handleTrialComplete = useCallback(
    (score: number, total: number, guestProgress: Record<string, { score: number; completedAt: string }>) => {
      update({ trialScore: score, trialTotal: total, guestProgress });
      setStep('placement_test');
    },
    [update],
  );

  const handlePlacementComplete = useCallback(
    (placementLevel: 'beginner' | 'intermediate' | 'advanced') => {
      update({ placementLevel, placementScore: 0 });
      setShowConfetti(true);
      setStep('celebrate');
      setTimeout(() => setShowConfetti(false), 3000);
    },
    [update],
  );

  const handleGuestMode = () => {
    try { localStorage.setItem('elitutor-guest', 'true'); } catch { /* ignore */ }
    router.push('/home');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setRegisterError('');
    try {
      const res = await apiFetch<{
        access_token: string;
        user: { id: string; firstName: string; role: 'STUDENT'; gradeLevel: number };
      }>('/auth/register-with-onboarding', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          password,
          gradeLevel: data.grade ?? 1,
          subject: data.subject ?? '',
          motivation: data.motivation,
          dailyGoalMinutes: data.dailyGoal,
          trialScore: data.trialScore,
          placementLevel: data.placementLevel,
          guestProgress: data.guestProgress,
        }),
      });
      setAuth(res.access_token, res.user);
      clear();
      router.replace('/home');
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : 'حدث خطأ. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── SPLASH ────────────────────────────────────────────────────────────────
  if (step === 'splash') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1F5E]" dir="rtl">
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        >
          <NoorOwl expression="excited" size={120} animate />
        </motion.div>
        <motion.h1
          className="text-3xl font-extrabold text-[#FFD700] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          الموجه الذكي
        </motion.h1>
        <motion.p
          className="text-white/70 mt-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          تعلّم بذكاء، تفوّق بثقة
        </motion.p>
      </div>
    );
  }

  const stepProgress: Record<string, string> = {
    age: '12%', subject: '24%', grade: '36%', motivation: '48%',
    goal: '60%', trial_lesson: '72%', placement_test: '88%',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {step !== 'celebrate' && step !== 'register' && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-[#1A1F5E]"
            animate={{ width: stepProgress[step] ?? '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-5">

        {/* ── AGE ── */}
        {step === 'age' && (
          <div className="flex flex-col flex-1">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="thinking" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">كم عمرك؟</h1>
              <p className="text-muted-foreground text-sm mt-1">سأكيّف الدروس لمستواك</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['6-7', '8-9', '10-11', '12-13', '14-15', '16+'] as AgeGroup[]).map((age) => (
                <motion.button
                  key={age}
                  className="rounded-2xl p-5 border-2 border-gray-200 bg-white text-[#1A1F5E] font-extrabold text-lg hover:border-[#1A1F5E]/40"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { update({ ageGroup: age }); setStep('subject'); }}
                >
                  <div className="text-2xl mb-1">
                    {age === '6-7' ? '🐣' : age === '8-9' ? '🌱' : age === '10-11' ? '📚'
                      : age === '12-13' ? '🧠' : age === '14-15' ? '🚀' : '🎓'}
                  </div>
                  {age}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── SUBJECT ── */}
        {step === 'subject' && (
          <div className="flex flex-col flex-1">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="excited" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">ما المادة التي تريد تحسينها؟</h1>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'عربي' as Subject, icon: '📖', gradient: 'from-emerald-500 to-emerald-700' },
                { id: 'עברית' as Subject, icon: '✡️', gradient: 'from-blue-500 to-blue-700' },
                { id: 'رياضيات' as Subject, icon: '🔢', gradient: 'from-purple-500 to-purple-700' },
                { id: 'English' as Subject, icon: '🇬🇧', gradient: 'from-orange-500 to-orange-700' },
              ]).map((s) => (
                <motion.button
                  key={s.id}
                  className={`rounded-2xl p-5 bg-gradient-to-br ${s.gradient} text-white font-extrabold text-base shadow-md hover:opacity-90`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { update({ subject: s.id }); setStep('grade'); }}
                >
                  <div className="text-3xl mb-1">{s.icon}</div>
                  {s.id}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── GRADE ── */}
        {step === 'grade' && (
          <div className="flex flex-col flex-1">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="thinking" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">في أيّ صف أنت؟</h1>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <motion.button
                  key={g}
                  className="rounded-2xl p-4 border-2 border-gray-200 bg-white text-[#1A1F5E] font-extrabold text-sm hover:border-[#1A1F5E]/40"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { update({ grade: g }); setStep('motivation'); }}
                >
                  {`الصف ${g}`}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── MOTIVATION ── */}
        {step === 'motivation' && (
          <div className="flex flex-col flex-1">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="studying" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">لماذا تريد التعلم؟</h1>
              <p className="text-muted-foreground text-sm mt-1">سأساعدك في تحقيق هدفك</p>
            </div>
            <div className="flex flex-col gap-3">
              {getMotivationOptions(data.ageGroup).map((m) => (
                <motion.button
                  key={m.label}
                  className="rounded-2xl p-4 border-2 border-gray-200 bg-white text-gray-800 font-bold text-base text-right flex items-center gap-3 hover:border-[#1A1F5E]/40"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { update({ motivation: m.label }); setStep('goal'); }}
                >
                  <span className="text-2xl">{m.icon}</span>
                  {m.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── GOAL ── */}
        {step === 'goal' && (
          <div className="flex flex-col flex-1">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="proud" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">كم دقيقة ستتعلم يومياً؟</h1>
              <p className="text-muted-foreground text-sm mt-1">الاتساق أهم من المدة</p>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { mins: 5 as const, label: '٥ دقائق', desc: 'خفيف ومنتظم 🌱' },
                { mins: 15 as const, label: '١٥ دقيقة', desc: 'الخيار المثالي ⭐', recommended: true },
                { mins: 30 as const, label: '٣٠ دقيقة+', desc: 'تفوّق سريع 🚀' },
              ]).map((g) => (
                <motion.button
                  key={g.mins}
                  className="rounded-2xl p-4 border-2 border-gray-200 bg-white text-gray-800 font-bold text-right flex items-center justify-between hover:border-[#1A1F5E]/40"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { update({ dailyGoal: g.mins }); setStep('trial_lesson'); }}
                >
                  <div>
                    <p className="text-lg font-extrabold">{g.label}</p>
                    <p className="text-sm opacity-70">{g.desc}</p>
                  </div>
                  {g.recommended && (
                    <span className="text-xs bg-[#FFD700] text-[#1A1F5E] font-extrabold px-2 py-1 rounded-full">موصى</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── TRIAL LESSON ── */}
        {step === 'trial_lesson' && (
          <TrialLesson
            subject={data.subject ?? 'عربي'}
            grade={data.grade ?? 1}
            onComplete={handleTrialComplete}
          />
        )}

        {/* ── PLACEMENT TEST ── */}
        {step === 'placement_test' && (
          <PlacementTest
            subject={data.subject ?? 'عربي'}
            grade={data.grade ?? 1}
            trialScore={data.trialScore}
            trialTotal={data.trialTotal}
            onComplete={handlePlacementComplete}
          />
        )}

        {/* ── CELEBRATE ── */}
        {step === 'celebrate' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-5 py-8">
            {showConfetti && <Confetti />}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <NoorOwl expression="celebrating" size={110} animate />
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#1A1F5E]">رائع! 🎉</h1>
              <p className="text-muted-foreground mt-2">
                أجبت على {data.trialScore} من {data.trialTotal} إجابات صحيحة
              </p>
              <p className="text-[#1A1F5E] font-bold mt-1">
                {data.trialScore >= 5
                  ? 'أداء ممتاز — أنت جاهز! 🌟'
                  : data.trialScore >= 3
                    ? 'بداية جيدة — سنبني معاً! 💪'
                    : 'الجميع يبدأ من نقطة — أنا هنا لأساعدك! 🦉'}
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full">
              <p className="text-sm font-bold text-amber-800 mb-1">هديتك الأولى</p>
              <p className="text-2xl font-extrabold text-amber-600">💎 ٥٠ جوهرة</p>
              <p className="text-xs text-muted-foreground">تنتظرك عند التسجيل</p>
            </div>

            <button
              className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow-lg hover:opacity-90"
              onClick={() => setStep('register')}
            >
              سجّل واحفظ تقدمك ←
            </button>

            <button
              className="text-sm text-muted-foreground underline underline-offset-2"
              onClick={handleGuestMode}
            >
              متابعة كضيف (بدون حفظ)
            </button>
          </div>
        )}

        {/* ── REGISTER ── */}
        {step === 'register' && (
          <div className="flex flex-col gap-5 py-6">
            <div className="text-center">
              <NoorOwl expression="love" size={80} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">ابدأ رحلتك الآن!</h1>
              <p className="text-muted-foreground text-sm mt-1">أنشئ حسابك واحفظ تقدمك</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 text-right font-medium focus:border-[#1A1F5E] outline-none"
                  placeholder="الاسم"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
                <input
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 text-right font-medium focus:border-[#1A1F5E] outline-none"
                  placeholder="العائلة"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
              <input
                className="rounded-xl border-2 border-gray-200 px-4 py-3 text-right font-medium focus:border-[#1A1F5E] outline-none"
                placeholder="0501234567"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <input
                className="rounded-xl border-2 border-gray-200 px-4 py-3 text-right font-medium focus:border-[#1A1F5E] outline-none"
                placeholder="كلمة المرور"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {registerError && (
                <p className="text-red-500 text-sm text-center">{registerError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow-lg hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'جاري التسجيل...' : 'إنشاء الحساب'}
              </button>
            </form>

            <button
              className="text-sm text-muted-foreground underline underline-offset-2 text-center"
              onClick={handleGuestMode}
            >
              متابعة كضيف
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
