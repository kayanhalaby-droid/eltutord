'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';
import Confetti from '@/components/effects/Confetti';

// ─── Types ───────────────────────────────────────────────────────────────────
type AgeGroup = '6-7' | '8-9' | '10-11' | '12-13' | '14-15' | '16+';
type Subject = 'عربي' | 'עברית' | 'رياضيات' | 'English';
type DailyGoal = 5 | 15 | 30;

interface OnboardingState {
  ageGroup: AgeGroup | null;
  subjects: Subject[];
  motivation: string | null;
  dailyGoal: DailyGoal | null;
  trialAnswers: Record<number, string>;
  trialCorrect: number;
}

// ─── Trial questions (simple IMAGE_CHOICE style, no hearts/XP) ───────────────
const TRIAL_QUESTIONS = [
  {
    id: 0, subject: 'عربي',
    question: 'أيّ الكلمتين تعني "شمس"؟',
    options: ['☀️ شمس', '🌙 قمر', '⭐ نجم', '🌧️ مطر'],
    correct: '☀️ شمس',
  },
  {
    id: 1, subject: 'رياضيات',
    question: '٣ + ٤ = ؟',
    options: ['٥', '٦', '٧', '٨'],
    correct: '٧',
  },
  {
    id: 2, subject: 'עברית',
    question: 'מה פירוש "שלום"?',
    options: ['🌍 عالم', '👋 سلام', '🏠 بيت', '🌸 زهرة'],
    correct: '👋 سلام',
  },
  {
    id: 3, subject: 'رياضيات',
    question: 'كم عدد الأضلاع في المثلث؟',
    options: ['٢', '٣', '٤', '٥'],
    correct: '٣',
  },
  {
    id: 4, subject: 'عربي',
    question: 'ما مفرد كلمة "كتب"؟',
    options: ['كتابان', 'كاتب', 'كتاب', 'مكتبة'],
    correct: 'كتاب',
  },
];

const MOTIVATION_BY_AGE: Record<string, { icon: string; label: string }[]> = {
  young: [
    { icon: '🌟', label: 'أريد أن أكون متفوقاً' },
    { icon: '🎮', label: 'التعلم ممتع' },
    { icon: '👨‍👩‍👧', label: 'أسعد أهلي' },
    { icon: '🏆', label: 'أريد أن أفوز' },
  ],
  middle: [
    { icon: '📚', label: 'أنجح في المدرسة' },
    { icon: '🧠', label: 'أطوّر نفسي' },
    { icon: '💼', label: 'أحضّر للمستقبل' },
    { icon: '🤝', label: 'أنافس أصدقائي' },
  ],
  high: [
    { icon: '🎓', label: 'التفوق في الثانوية' },
    { icon: '🏛️', label: 'الجامعة والمستقبل' },
    { icon: '💡', label: 'فهم حقيقي وعميق' },
    { icon: '⏱️', label: 'استغلال الوقت' },
  ],
};

function getMotivationOptions(age: AgeGroup | null) {
  if (!age) return MOTIVATION_BY_AGE.young;
  if (age === '6-7' || age === '8-9') return MOTIVATION_BY_AGE.young;
  if (age === '10-11' || age === '12-13') return MOTIVATION_BY_AGE.middle;
  return MOTIVATION_BY_AGE.high;
}

const GROWTH_MESSAGES = [
  'دماغك ينمو الآن 🧠',
  'كل خطأ هو فرصة تعلم 💡',
  'لا أحد وُلد خبيراً 🌱',
  'المحاولة هي الفوز الحقيقي 💪',
  'أنت أذكى مما تظن! ✨',
];

// ─── Page transition wrapper ──────────────────────────────────────────────────
const StepWrap = ({ children, k }: { children: React.ReactNode; k: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={k}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<
    'splash' | 'age' | 'subject' | 'motivation' | 'goal' | 'trial' | 'celebrate' | 'register'
  >('splash');
  const [state, setState] = useState<OnboardingState>({
    ageGroup: null,
    subjects: [],
    motivation: null,
    dailyGoal: null,
    trialAnswers: {},
    trialCorrect: 0,
  });
  const [trialIdx, setTrialIdx] = useState(0);
  const [trialFeedback, setTrialFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guestLessons, setGuestLessons] = useState(0);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Splash: auto-advance after 1.5s ──────────────────────────────────────
  useEffect(() => {
    if (step === 'splash') {
      splashTimerRef.current = setTimeout(() => setStep('age'), 1500);
    }
    return () => {
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    };
  }, [step]);

  // ── Guest lesson counter from localStorage ────────────────────────────────
  useEffect(() => {
    const count = parseInt(localStorage.getItem('guestLessons') ?? '0', 10);
    setGuestLessons(count);
  }, []);

  // ── Trial answer handler ──────────────────────────────────────────────────
  const handleTrialAnswer = (option: string) => {
    if (trialFeedback !== null) return;
    const q = TRIAL_QUESTIONS[trialIdx];
    const correct = option === q.correct;
    setTrialFeedback(correct ? 'correct' : 'wrong');
    const newAnswers = { ...state.trialAnswers, [trialIdx]: option };
    const newCorrect = state.trialCorrect + (correct ? 1 : 0);
    setState(s => ({ ...s, trialAnswers: newAnswers, trialCorrect: newCorrect }));

    setTimeout(() => {
      setTrialFeedback(null);
      if (trialIdx < TRIAL_QUESTIONS.length - 1) {
        setTrialIdx(i => i + 1);
      } else {
        setStep('celebrate');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 900);
  };

  // ── Save onboarding data to localStorage ─────────────────────────────────
  const saveToStorage = () => {
    localStorage.setItem('onboarding', JSON.stringify({
      ageGroup: state.ageGroup,
      subjects: state.subjects,
      motivation: state.motivation,
      dailyGoal: state.dailyGoal,
      trialCorrect: state.trialCorrect,
      completedAt: new Date().toISOString(),
    }));
  };

  const handleGuestMode = () => {
    saveToStorage();
    localStorage.setItem('isGuest', 'true');
    router.push('/');
  };

  const goToRegister = (method: 'phone' | 'google') => {
    saveToStorage();
    router.push(`/register?method=${method}&from=onboarding`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STEPS
  // ─────────────────────────────────────────────────────────────────────────

  if (step === 'splash') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1F5E]" dir="rtl">
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        >
          <NoorOwl expression="happy" size={120} animate />
        </motion.div>
        <motion.h1
          className="text-3xl font-extrabold text-[#FFD700] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          الموجه الذكي 🦉
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Progress bar */}
      {step !== 'celebrate' && step !== 'register' && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-[#1A1F5E]"
            animate={{
              width: {
                age: '16%', subject: '32%', motivation: '48%',
                goal: '64%', trial: `${64 + (trialIdx / TRIAL_QUESTIONS.length) * 36}%`,
              }[step] ?? '100%',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-5">

        {/* ── STEP: AGE ── */}
        {step === 'age' && (
          <StepWrap k="age">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="thinking" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">كم عمرك؟</h1>
              <p className="text-muted-foreground text-sm mt-1">سأكيّف الدروس لمستواك</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['6-7', '8-9', '10-11', '12-13', '14-15', '16+'] as AgeGroup[]).map((age) => (
                <motion.button
                  key={age}
                  className={`rounded-2xl p-5 border-2 font-extrabold text-lg transition-all
                    ${state.ageGroup === age
                      ? 'border-[#1A1F5E] bg-[#1A1F5E] text-white shadow-lg'
                      : 'border-gray-200 bg-white text-[#1A1F5E] hover:border-[#1A1F5E]/40'}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setState(s => ({ ...s, ageGroup: age }));
                    setTimeout(() => setStep('subject'), 300);
                  }}
                >
                  <div className="text-2xl mb-1">
                    {age === '6-7' ? '🐣' : age === '8-9' ? '🌱' : age === '10-11' ? '📚'
                      : age === '12-13' ? '🧠' : age === '14-15' ? '🚀' : '🎓'}
                  </div>
                  {age}
                </motion.button>
              ))}
            </div>
          </StepWrap>
        )}

        {/* ── STEP: SUBJECT ── */}
        {step === 'subject' && (
          <StepWrap k="subject">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="excited" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">ما المادة التي تريد تحسينها؟</h1>
              <p className="text-muted-foreground text-sm mt-1">يمكنك اختيار أكثر من مادة</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'عربي', icon: '📖', color: 'bg-emerald-50 border-emerald-200', active: 'bg-emerald-500 border-emerald-500 text-white' },
                { id: 'עברית', icon: '✡️', color: 'bg-blue-50 border-blue-200', active: 'bg-blue-500 border-blue-500 text-white' },
                { id: 'رياضيات', icon: '🔢', color: 'bg-purple-50 border-purple-200', active: 'bg-purple-500 border-purple-500 text-white' },
                { id: 'English', icon: '🇬🇧', color: 'bg-orange-50 border-orange-200', active: 'bg-orange-500 border-orange-500 text-white' },
              ] as { id: Subject; icon: string; color: string; active: string }[]).map((s) => {
                const isSelected = state.subjects.includes(s.id);
                return (
                  <motion.button
                    key={s.id}
                    className={`rounded-2xl p-5 border-2 font-extrabold text-base transition-all
                      ${isSelected ? s.active : `${s.color} text-gray-800 hover:opacity-80`}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        subjects: isSelected
                          ? prev.subjects.filter(x => x !== s.id)
                          : [...prev.subjects, s.id],
                      }));
                    }}
                  >
                    <div className="text-3xl mb-1">{s.icon}</div>
                    {s.id}
                  </motion.button>
                );
              })}
            </div>
            <button
              className="mt-6 w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl disabled:opacity-40"
              disabled={state.subjects.length === 0}
              onClick={() => setStep('motivation')}
            >
              التالي ←
            </button>
          </StepWrap>
        )}

        {/* ── STEP: MOTIVATION ── */}
        {step === 'motivation' && (
          <StepWrap k="motivation">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="studying" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">لماذا تريد التعلم؟</h1>
              <p className="text-muted-foreground text-sm mt-1">سأساعدك في تحقيق هدفك</p>
            </div>
            <div className="flex flex-col gap-3">
              {getMotivationOptions(state.ageGroup).map((m) => (
                <motion.button
                  key={m.label}
                  className={`rounded-2xl p-4 border-2 font-bold text-base text-right flex items-center gap-3 transition-all
                    ${state.motivation === m.label
                      ? 'border-[#1A1F5E] bg-[#1A1F5E] text-white'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-[#1A1F5E]/40'}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setState(s => ({ ...s, motivation: m.label }));
                    setTimeout(() => setStep('goal'), 300);
                  }}
                >
                  <span className="text-2xl">{m.icon}</span>
                  {m.label}
                </motion.button>
              ))}
            </div>
          </StepWrap>
        )}

        {/* ── STEP: DAILY GOAL ── */}
        {step === 'goal' && (
          <StepWrap k="goal">
            <div className="text-center mb-6 mt-4">
              <NoorOwl expression="proud" size={70} animate />
              <h1 className="text-2xl font-extrabold text-[#1A1F5E] mt-3">كم دقيقة ستتعلم يومياً؟</h1>
              <p className="text-muted-foreground text-sm mt-1">الاتساق أهم من المدة</p>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { mins: 5, label: '٥ دقائق', desc: 'خفيف ومنتظم 🌱', color: 'border-emerald-300 bg-emerald-50' },
                { mins: 15, label: '١٥ دقيقة', desc: 'الخيار المثالي ⭐', color: 'border-[#1A1F5E] bg-[#1A1F5E]/5', recommended: true },
                { mins: 30, label: '٣٠ دقيقة+', desc: 'تفوّق سريع 🚀', color: 'border-amber-300 bg-amber-50' },
              ] as { mins: DailyGoal; label: string; desc: string; color: string; recommended?: boolean }[]).map((g) => (
                <motion.button
                  key={g.mins}
                  className={`rounded-2xl p-4 border-2 font-bold text-right flex items-center justify-between transition-all
                    ${state.dailyGoal === g.mins ? 'border-[#1A1F5E] bg-[#1A1F5E] text-white' : `${g.color} text-gray-800`}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setState(s => ({ ...s, dailyGoal: g.mins }));
                    setTimeout(() => setStep('trial'), 300);
                  }}
                >
                  <div>
                    <p className="text-lg font-extrabold">{g.label}</p>
                    <p className="text-sm opacity-80">{g.desc}</p>
                  </div>
                  {g.recommended && (
                    <span className="text-xs bg-[#FFD700] text-[#1A1F5E] font-extrabold px-2 py-1 rounded-full">موصى</span>
                  )}
                </motion.button>
              ))}
            </div>
          </StepWrap>
        )}

        {/* ── STEP: TRIAL LESSON ── */}
        {step === 'trial' && (
          <StepWrap k={`trial-${trialIdx}`}>
            <div className="text-center mb-4 mt-4">
              <NoorOwl
                expression={trialFeedback === 'correct' ? 'happy' : trialFeedback === 'wrong' ? 'encouraging' : 'studying'}
                size={60}
                animate
              />
              <p className="text-xs text-muted-foreground mt-2 font-semibold">
                سؤال {trialIdx + 1} من {TRIAL_QUESTIONS.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-[#FFD700] rounded-full transition-all"
                  style={{ width: `${(trialIdx / TRIAL_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
              <p className="text-lg font-extrabold text-[#1A1F5E] text-center">
                {TRIAL_QUESTIONS[trialIdx].question}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {TRIAL_QUESTIONS[trialIdx].options.map((opt) => {
                const isSelected = state.trialAnswers[trialIdx] === opt;
                const correct = opt === TRIAL_QUESTIONS[trialIdx].correct;
                let style = 'border-gray-200 bg-white text-gray-800 hover:border-[#1A1F5E]/40';
                if (trialFeedback !== null) {
                  if (correct) style = 'border-green-500 bg-green-50 text-green-700 font-bold';
                  else if (isSelected) style = 'border-red-400 bg-red-50 text-red-700';
                  else style = 'border-gray-200 bg-gray-50 opacity-60';
                }
                return (
                  <motion.button
                    key={opt}
                    className={`rounded-xl px-5 py-3.5 border-2 font-bold text-base text-right transition-all ${style}`}
                    whileTap={trialFeedback !== null ? {} : { scale: 0.97 }}
                    onClick={() => handleTrialAnswer(opt)}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {trialFeedback && (
                <motion.div
                  className={`mt-4 rounded-2xl p-4 flex items-center gap-3 ${trialFeedback === 'correct' ? 'bg-green-50 border-2 border-green-300' : 'bg-orange-50 border-2 border-orange-300'}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-2xl">{trialFeedback === 'correct' ? '🎉' : '🧠'}</span>
                  <p className="font-bold text-sm">
                    {trialFeedback === 'correct'
                      ? 'ممتاز! إجابة صحيحة 🌟'
                      : GROWTH_MESSAGES[Math.floor(Math.random() * GROWTH_MESSAGES.length)]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </StepWrap>
        )}

        {/* ── STEP: CELEBRATE ── */}
        {step === 'celebrate' && (
          <StepWrap k="celebrate">
            {showConfetti && <Confetti />}
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-5 py-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <NoorOwl expression="celebrating" size={110} animate />
              </motion.div>
              <div>
                <h1 className="text-3xl font-extrabold text-[#1A1F5E]">رائع! 🎉</h1>
                <p className="text-muted-foreground mt-2">
                  أجبت على {state.trialCorrect} من {TRIAL_QUESTIONS.length} إجابات صحيحة
                </p>
                <p className="text-[#1A1F5E] font-bold mt-1">
                  {state.trialCorrect >= 4 ? 'أداء ممتاز — أنت جاهز! 🌟'
                    : state.trialCorrect >= 2 ? 'بداية جيدة — سنبني معاً! 💪'
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
          </StepWrap>
        )}

        {/* ── STEP: REGISTER ── */}
        {step === 'register' && (
          <StepWrap k="register">
            <div className="flex flex-col items-center gap-6 py-10">
              <NoorOwl expression="love" size={80} animate />
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-[#1A1F5E]">ابدأ رحلتك الآن!</h1>
                <p className="text-muted-foreground text-sm mt-1">اختر طريقة التسجيل</p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <motion.button
                  className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-base flex items-center justify-center gap-3 shadow-md hover:opacity-90"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToRegister('phone')}
                >
                  <span className="text-xl">📱</span>
                  سجّل برقم الجوال
                </motion.button>

                <motion.button
                  className="w-full py-4 bg-white border-2 border-gray-200 text-gray-800 font-extrabold rounded-2xl text-base flex items-center justify-center gap-3 shadow-sm hover:border-[#1A1F5E]/40"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToRegister('google')}
                >
                  <span className="text-xl">🌐</span>
                  سجّل بحساب Google
                </motion.button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-slate-50 px-2">أو</span>
                  </div>
                </div>

                <button
                  className="w-full py-3.5 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-2xl text-sm hover:border-gray-400"
                  onClick={handleGuestMode}
                >
                  تابع كضيف — سأسألك لاحقاً
                </button>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 w-full text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 بياناتك خاصة وآمنة. لا إعلانات. لا مشاركة مع أطراف ثالثة.
                </p>
              </div>

              {/* Guest paywall hint */}
              {guestLessons >= 3 && (
                <motion.div
                  className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 w-full text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-sm font-bold text-amber-800">
                    أتممت {guestLessons} دروس! سجّل الآن لحفظ تقدمك 💎
                  </p>
                </motion.div>
              )}
            </div>
          </StepWrap>
        )}

      </div>
    </div>
  );
}
