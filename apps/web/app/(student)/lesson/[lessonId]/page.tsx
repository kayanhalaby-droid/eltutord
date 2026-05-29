'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { useLessonStore } from '@/hooks/useLessonStore';
import { useAwardXP } from '@/lib/hooks/useXP';
import { useHearts } from '@/lib/hooks/useHearts';
import { useRecordActivity } from '@/lib/hooks/useStreak';
import { useDepleteHeart } from '@/lib/hooks/useHearts';
import { useAddLessonFlashcards } from '@/lib/hooks/useFlashcards';
import { LessonDto } from '@/lib/types/lesson';
import QuestionPlayer from './components/QuestionPlayer';
import LessonComplete from './components/LessonComplete';
import OutOfHeartsModal from './components/OutOfHeartsModal';
import AITutorModal from './components/AITutorModal';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [aiConcept, setAiConcept] = useState<string | null>(null);
  const [unitUnlocked, setUnitUnlocked] = useState(false);
  const [unlockedUnitName, setUnlockedUnitName] = useState<string | undefined>();
  const [nextLessonId, setNextLessonId] = useState<string | undefined>();
  const [gemsEarned, setGemsEarned] = useState(0);
  const initialized = useRef(false);

  const {
    questions,
    currentIndex,
    hearts,
    maxHearts,
    xpEarned,
    correctAnswers,
    isComplete,
    outOfHearts,
    initLesson,
    resetLesson,
  } = useLessonStore();

  const { hearts: heartsData } = useHearts();
  const { mutate: awardXP } = useAwardXP();
  const { mutate: depleteHeart } = useDepleteHeart();
  const { mutate: recordActivity } = useRecordActivity();
  const { mutate: addFlashcards } = useAddLessonFlashcards();

  const { data: lesson, isLoading, isError } = useQuery<LessonDto>({
    queryKey: ['lesson-play', lessonId],
    queryFn: () => apiFetch(`/curriculum/lessons/${lessonId}/play`, { token: token! }),
    enabled: !!token && !!lessonId,
  });

  const { mutate: completeLesson } = useMutation({
    mutationFn: ({ score, correctAnswers, totalQuestions }: { score: number; correctAnswers: number; totalQuestions: number }) =>
      apiFetch<{ success: boolean; unitUnlocked: boolean; unlockedUnitName?: string; nextLessonId?: string; earnedGems?: number; earnedXP?: number }>(
        `/curriculum/lessons/${lessonId}/complete`,
        { method: 'POST', body: JSON.stringify({ score, correctAnswers, totalQuestions }), token: token! },
      ),
    onSuccess: (data) => {
      if (data?.unitUnlocked) {
        setUnitUnlocked(true);
        setUnlockedUnitName(data.unlockedUnitName);
      }
      if (data?.nextLessonId) setNextLessonId(data.nextLessonId);
      if (data?.earnedGems) setGemsEarned(data.earnedGems);
    },
  });

  // Init lesson once when lesson data arrives
  useEffect(() => {
    if (initialized.current || !lesson?.questions || !heartsData) return;
    initialized.current = true;
    initLesson(lessonId, lesson.questions, heartsData.hearts, heartsData.maxHearts);
  }, [lesson, heartsData]);

  // Cleanup only on unmount — never on hearts change (would reset currentIndex to 0)
  useEffect(() => {
    return () => { resetLesson(); initialized.current = false; };
  }, []);

  // On lesson complete
  useEffect(() => {
    if (!isComplete) return;
    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    if (xpEarned > 0) awardXP(xpEarned);
    completeLesson({ score, correctAnswers, totalQuestions: questions.length });
    addFlashcards(lessonId);
    recordActivity(undefined, {
      onSuccess: (data) => {
        if (data?.milestone) {
          sessionStorage.setItem(
            'pendingStreakMilestone',
            JSON.stringify({ milestone: data.milestone, whatsappSent: data.whatsappSent ?? false }),
          );
        }
      },
    });
  }, [isComplete]);

  if (!token) { router.replace('/login'); return null; }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <NoorOwl expression="studying" size={90} animate />
          <p className="text-brand font-bold">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <NoorOwl expression="sad" size={80} animate />
        <p className="text-red-500 font-bold">تعذّر تحميل الدرس</p>
        <Button onClick={() => router.push('/home')}>العودة</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const noQuestions = !questions.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-brand text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => router.push('/home')} className="p-1 hover:opacity-80">
          <ArrowRight size={22} />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-base leading-tight text-gold">{lesson.title}</h1>
          {lesson.durationMin && (
            <p className="text-xs opacity-70">{lesson.durationMin} دقيقة</p>
          )}
        </div>
        <NoorOwl expression="happy" size={40} />
      </header>

      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4 pb-6">
        {noQuestions ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <NoorOwl expression="encouraging" size={90} animate message="لا توجد أسئلة في هذا الدرس بعد!" />
            <Button onClick={() => router.push('/home')}>العودة</Button>
          </div>
        ) : (
          currentQuestion && (
            <QuestionPlayer
              question={currentQuestion}
              subject={lesson.title}
              gradeLevel={user?.gradeLevel ?? 3}
              onOpenAITutor={(concept) => setAiConcept(concept)}
            />
          )
        )}
      </main>

      {/* Lesson Complete Overlay — always shown on finish, hearts do not block progress */}
      <AnimatePresence>
        {isComplete && (
          <LessonComplete
            lessonTitle={lesson.title}
            xpEarned={xpEarned}
            gemsEarned={gemsEarned}
            correctAnswers={correctAnswers}
            totalQuestions={questions.length}
            hearts={hearts}
            unitUnlocked={unitUnlocked}
            unlockedUnitName={unlockedUnitName}
            onContinue={() => router.push(nextLessonId ? `/lesson/${nextLessonId}` : '/home')}
          />
        )}
      </AnimatePresence>

      {/* Out of Hearts Paywall — shown when hearts reach 0 before lesson ends */}
      <AnimatePresence>
        {outOfHearts && !isComplete && (
          <OutOfHeartsModal onClose={() => {}} />
        )}
      </AnimatePresence>

      {/* AI Tutor Modal */}
      <AnimatePresence>
        {aiConcept && (
          <AITutorModal
            concept={aiConcept}
            subject={lesson.title}
            gradeLevel={user?.gradeLevel ?? 3}
            onClose={() => setAiConcept(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
