'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLessonStore } from '@/hooks/useLessonStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useDepleteHeart } from '@/lib/hooks/useHearts';
import { QuestionDto, MCQContent, TrueFalseContent, FillBlankContent } from '@/lib/types/lesson';
import MCQ from './QuestionTypes/MCQ';
import TrueFalse from './QuestionTypes/TrueFalse';
import FillBlank from './QuestionTypes/FillBlank';
import ShortAnswer from './QuestionTypes/ShortAnswer';
import Ordering from './QuestionTypes/Ordering';
import Matching from './QuestionTypes/Matching';
import TapPairs from './QuestionTypes/TapPairs';
import FillBlankChoice from './QuestionTypes/FillBlankChoice';
import ListenChoice from './QuestionTypes/ListenChoice';
import ListenWrite from './QuestionTypes/ListenWrite';
import SpeakExercise from './QuestionTypes/SpeakExercise';
import SortGroups from './QuestionTypes/SortGroups';
import FlashcardExercise from './QuestionTypes/FlashcardExercise';
import AIConversation from './QuestionTypes/AIConversation';
import SpeedReview from './QuestionTypes/SpeedReview';
import ImageChoice from '@/components/exercises/arabic/grade1/ImageChoice';
import ImageMatch from '@/components/exercises/arabic/grade1/ImageMatch';
import ListenImage from '@/components/exercises/arabic/grade1/ListenImage';
import Translate from '@/components/exercises/arabic/grade1/Translate';
import DragOrder from '@/components/exercises/arabic/grade1/DragOrder';
import ReadingComprehension from '@/components/exercises/arabic/grade1/ReadingComprehension';
import { Bot } from 'lucide-react';
import NoorOwl from '@/components/NoorOwl';

interface Props {
  question: QuestionDto;
  subject: string;
  gradeLevel: number;
  onOpenAITutor: (concept: string) => void;
}

function getCorrectAnswerDisplay(question: QuestionDto): string {
  const correct = question.correctAnswer as Record<string, unknown>;
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'REVERSE_CHOICE':
    case 'LISTEN_CHOICE': {
      const ids = (correct.selectedOptionIds as string[]) ?? [];
      const opts = ((question.content as { options?: Array<{ id: string; text: string }> }).options) ?? [];
      return ids.map(id => opts.find(o => o.id === id)?.text ?? id).join('، ');
    }
    case 'TRUE_FALSE':
      return (correct.isTrue as boolean) ? 'صَحِيحٌ ✅' : 'خَطَأٌ ❌';
    case 'IMAGE_CHOICE':
    case 'LISTEN_IMAGE': {
      const id = correct.selectedOptionId as string;
      const opts = ((question.content as { options?: Array<{ id: string; label?: string; emoji?: string }> }).options) ?? [];
      const opt = opts.find(o => o.id === id);
      return opt ? `${opt.emoji ?? ''} ${opt.label ?? ''}`.trim() : id;
    }
    case 'FILL_BLANK_CHOICE': {
      const id = correct.selectedOptionId as string;
      const opts = ((question.content as { options?: Array<{ id: string; text: string }> }).options) ?? [];
      return opts.find(o => o.id === id)?.text ?? id;
    }
    case 'SHORT_ANSWER':
    case 'LISTEN_WRITE':
    case 'TRANSLATE':
    case 'TRANSLATE_REVERSE': {
      const accepted = (correct.accepted as string[]) ?? [correct.text as string];
      return accepted[0] ?? '';
    }
    case 'WORD_ORDER':
    case 'ORDERING':
    case 'DRAG_ORDER': {
      const order = (correct.order ?? correct.correctOrder ?? correct.orderedIds) as string[];
      return Array.isArray(order) ? order.join(' ') : '';
    }
    default:
      return '';
  }
}

export default function QuestionPlayer({ question, subject, gradeLevel, onOpenAITutor }: Props) {
  const { answerState, hearts, maxHearts, correctAnswers, currentIndex, questions, submitAnswer, nextQuestion } = useLessonStore();
  const { playSound } = useSoundEffects();
  const { mutate: depleteHeart } = useDepleteHeart();
  const [userAnswer, setUserAnswer] = useState<unknown>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAnswered = answerState !== 'unanswered';
  const isCorrect = answerState === 'correct';

  // Auto-advance 1.5 s after any answer — lesson always moves forward
  useEffect(() => {
    if (!isAnswered) return;
    autoAdvanceTimer.current = setTimeout(() => {
      handleNext();
    }, 1500);
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [isAnswered, question.id]);

  const handleAnswer = (answer: unknown) => {
    if (isAnswered) return;
    setUserAnswer(answer);
    const correct = submitAnswer(answer);
    playSound(correct ? 'correct' : 'wrong');
    if (!correct) depleteHeart();
  };

  const handleNext = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setUserAnswer(null);
    nextQuestion();
  };

  const renderQuestion = () => {
    const content = question.content;
    const correctAnswer = question.correctAnswer;

    switch (question.type) {
      case 'MULTIPLE_CHOICE': {
        const mc = content as unknown as MCQContent;
        const correctIds = (correctAnswer as { selectedOptionIds: string[] }).selectedOptionIds;
        return (
          <MCQ
            content={mc}
            onAnswer={(ids) => handleAnswer(ids)}
            disabled={isAnswered}
            correctIds={isAnswered ? correctIds : undefined}
            selectedIds={userAnswer as string[] | undefined}
          />
        );
      }
      case 'TRUE_FALSE': {
        const tf = content as unknown as TrueFalseContent;
        return (
          <TrueFalse
            content={tf}
            onAnswer={(val) => handleAnswer(val)}
            disabled={isAnswered}
            correctAnswer={isAnswered ? (correctAnswer as { isTrue: boolean }).isTrue : undefined}
            userAnswer={isAnswered ? (userAnswer as boolean) : null}
          />
        );
      }
      case 'FILL_IN_THE_BLANK': {
        const fb = content as unknown as FillBlankContent;
        return (
          <FillBlank
            content={fb}
            onAnswer={(blanks) => handleAnswer(blanks)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'ORDERING': {
        const items = (content as { items?: string[] }).items ?? [];
        return (
          <Ordering
            questionText={(content as { questionText?: string }).questionText ?? ''}
            items={items}
            onAnswer={(ordered) => handleAnswer(ordered)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'MATCHING': {
        const matchContent = content as { questionText?: string; pairs: { id: string; right: string; left: string }[] };
        return (
          <Matching
            content={matchContent}
            onAnswer={(matches) => handleAnswer(matches)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      // ── New exercise types ───────────────────────────────────────
      case 'REVERSE_CHOICE': {
        const mc = content as unknown as MCQContent;
        const correctIds = (correctAnswer as { selectedOptionIds: string[] }).selectedOptionIds;
        return (
          <MCQ
            content={{ ...mc, questionText: mc.questionText }}
            onAnswer={(ids) => handleAnswer(ids)}
            disabled={isAnswered}
            correctIds={isAnswered ? correctIds : undefined}
            selectedIds={userAnswer as string[] | undefined}
          />
        );
      }
      case 'TAP_PAIRS': {
        const c = content as { questionText: string; pairs: Array<{ id: string; hebrew: string; arabic: string }> };
        return (
          <TapPairs
            content={c}
            onAnswer={(matches) => handleAnswer(matches)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'FILL_BLANK_CHOICE': {
        const c = content as { questionText: string; sentence: string; options: Array<{ id: string; text: string }> };
        const correct = isAnswered ? (correctAnswer as { selectedOptionId: string }).selectedOptionId : undefined;
        return (
          <FillBlankChoice
            content={c}
            onAnswer={(id) => handleAnswer(id)}
            disabled={isAnswered}
            correctOptionId={correct}
            selectedOptionId={isAnswered ? (userAnswer as string) : undefined}
          />
        );
      }
      case 'WORD_ORDER': {
        const c = content as { questionText: string; words: string[]; correctOrder: string[] };
        return (
          <Ordering
            questionText={c.questionText}
            items={c.words}
            onAnswer={(ordered) => handleAnswer(ordered)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'LISTEN_CHOICE': {
        const c = content as { questionText: string; audioText: string; options: Array<{ id: string; text: string }> };
        const correctIds = isAnswered ? (correctAnswer as { selectedOptionIds: string[] }).selectedOptionIds : undefined;
        return (
          <ListenChoice
            content={c}
            onAnswer={(ids) => handleAnswer(ids)}
            disabled={isAnswered}
            correctIds={correctIds}
            selectedIds={isAnswered ? (userAnswer as string[]) : undefined}
          />
        );
      }
      case 'LISTEN_WRITE': {
        const c = content as { questionText: string; audioText: string; hint?: string };
        return (
          <ListenWrite
            content={c}
            onAnswer={(text) => handleAnswer(text)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'SPEAK_WORD':
      case 'SPEAK':
      case 'READ_ALOUD': {
        const c = content as {
          questionText: string; targetWord?: string; targetText?: string;
          transliteration?: string; translation?: string; minAccuracy?: number;
        };
        return (
          <SpeakExercise
            content={c}
            onAnswer={(result) => handleAnswer(result)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'SORT_GROUPS': {
        const c = content as {
          questionText: string;
          groups: Array<{ id: string; label: string }>;
          items: Array<{ id: string; label: string; group: string }>;
        };
        const correctAss = isAnswered ? (correctAnswer as { assignments: Record<string, string> }).assignments : undefined;
        return (
          <SortGroups
            content={c}
            onAnswer={(assignments) => handleAnswer(assignments)}
            disabled={isAnswered}
            isCorrect={isCorrect}
            correctAssignments={correctAss}
          />
        );
      }
      case 'FLASHCARD_EX': {
        const c = content as { front: string; back: string; transliteration: string };
        return (
          <FlashcardExercise
            content={c}
            onAnswer={(result) => handleAnswer(result)}
            disabled={isAnswered}
          />
        );
      }
      case 'AI_CONVERSATION': {
        const c = content as {
          questionText: string; systemPrompt: string; startMessage: string;
          maxTurns?: number; vocab?: string;
        };
        return (
          <AIConversation
            content={c}
            onAnswer={(result) => handleAnswer(result)}
            disabled={isAnswered}
          />
        );
      }
      // ── Grade-1 Arabic exercise types ────────────────────────────
      case 'IMAGE_CHOICE': {
        const c = content as { questionText: string; audioText: string; options: Array<{ id: string; emoji: string; label: string }> };
        const correctId = isAnswered ? (correctAnswer as { selectedOptionId: string }).selectedOptionId : undefined;
        return (
          <ImageChoice
            content={c}
            onAnswer={(id) => handleAnswer(id)}
            disabled={isAnswered}
            correctId={correctId}
            selectedId={isAnswered ? (userAnswer as string) : undefined}
          />
        );
      }
      case 'IMAGE_MATCH': {
        const c = content as { questionText: string; pairs: Array<{ id: string; image: string; word: string }> };
        return (
          <ImageMatch
            content={c}
            onAnswer={(matches) => handleAnswer(matches)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'LISTEN_IMAGE': {
        const c = content as { question: string; audioText: string; options: Array<{ id: string; emoji: string; label?: string }> };
        const correctId = isAnswered ? (correctAnswer as { selectedOptionId: string }).selectedOptionId : undefined;
        return (
          <ListenImage
            content={c}
            onAnswer={(id) => handleAnswer(id)}
            disabled={isAnswered}
            correctId={correctId}
            selectedId={isAnswered ? (userAnswer as string) : undefined}
          />
        );
      }
      case 'TRANSLATE':
      case 'TRANSLATE_REVERSE': {
        const c = content as { question: string; source: string; sourceLabel?: string; hint?: string; options?: string[]; correct: string; emoji?: string };
        return (
          <Translate
            content={c}
            onAnswer={(answer) => handleAnswer(answer)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'DRAG_ORDER': {
        const c = content as { question: string; items: Array<{ id: string; text: string; order?: number }>; correctOrder?: string[] };
        return (
          <DragOrder
            content={c}
            onAnswer={(orderedIds) => handleAnswer(orderedIds)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'READING_COMPREHENSION': {
        const c = content as { text: string; audioText?: string; questions: Array<{ q: string; options: string[]; correct: number }> };
        return (
          <ReadingComprehension
            content={c}
            onAnswer={(answers) => handleAnswer(answers)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      // ── q112 new types ───────────────────────────────────────────
      case 'ARRANGE_ALL_WORDS':
      case 'WORD_BANK': {
        const c = content as { questionText: string; words: string[]; correctOrder: string[] };
        return (
          <Ordering
            questionText={c.questionText}
            items={c.words}
            onAnswer={(ordered) => handleAnswer(ordered)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'COMPLETE_TRANSLATION': {
        const c = content as { question: string; correct: string };
        return (
          <ShortAnswer
            questionText={c.question}
            onAnswer={(text) => handleAnswer(text)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'MARK_CORRECT_MEANING': {
        const mc = content as unknown as MCQContent;
        const correctIds = (correctAnswer as { selectedOptionIds: string[] }).selectedOptionIds;
        return (
          <MCQ
            content={mc}
            onAnswer={(ids) => handleAnswer(ids)}
            disabled={isAnswered}
            correctIds={isAnswered ? correctIds : undefined}
            selectedIds={userAnswer as string[] | undefined}
          />
        );
      }
      case 'PAIR_MATCH': {
        const c = content as { questionText: string; pairs: Array<{ id: string; hebrew: string; arabic: string }> };
        return (
          <TapPairs
            content={c}
            onAnswer={(matches) => handleAnswer(matches)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
      case 'FLASHCARD': {
        const c = content as { front: string; back: string; transliteration: string };
        return (
          <FlashcardExercise
            content={c}
            onAnswer={(result) => handleAnswer(result)}
            disabled={isAnswered}
          />
        );
      }
      case 'GRAMMAR_TIP': {
        const c = content as { explanation: string; example: string };
        return (
          <div className="flex flex-col gap-4 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <p className="font-extrabold text-blue-800 text-base">قاعدة مهمة</p>
            </div>
            <p className="text-gray-800 text-base leading-relaxed">{c.explanation}</p>
            {c.example && (
              <div className="bg-white rounded-xl px-4 py-3 border border-blue-200">
                <p className="text-xs text-blue-500 font-medium mb-1">مثال</p>
                <p className="text-gray-700 font-bold">{c.example}</p>
              </div>
            )}
            <button
              onClick={() => handleAnswer({ acknowledged: true })}
              disabled={isAnswered}
              className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              فهمت ✓
            </button>
          </div>
        );
      }
      case 'SPEED_REVIEW': {
        const c = content as { questionText: string; pairs: Array<{ id: string; left: string; right: string }>; timeLimitSeconds: number };
        return (
          <SpeedReview
            content={c}
            onAnswer={(result) => handleAnswer(result)}
            disabled={isAnswered}
          />
        );
      }
      case 'SHORT_ANSWER':
      default: {
        const qText = (content as { questionText?: string; statement?: string }).questionText
          ?? (content as { statement?: string }).statement
          ?? '';
        return (
          <ShortAnswer
            questionText={qText}
            onAnswer={(text) => handleAnswer(text)}
            disabled={isAnswered}
            isCorrect={isCorrect}
          />
        );
      }
    }
  };

  const progressPct = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5 flex-1">

      {/* ── Top bar: Noor + Hearts + Counter + AI ── */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isAnswered ? (
            <motion.div key="fn" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 320 }}>
              <NoorOwl expression={isCorrect ? 'happy' : 'encouraging'} size={44} animate loop={false} />
            </motion.div>
          ) : (
            <motion.div key="sn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <NoorOwl expression="studying" size={44} animate />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Hearts */}
          <div className="flex gap-0.5">
            {Array.from({ length: maxHearts }).map((_, i) => (
              <span key={i} className={`text-lg transition-all ${i < hearts ? 'opacity-100' : 'opacity-20 grayscale'}`}>❤️</span>
            ))}
          </div>
          {/* Counter */}
          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
          {/* AI Tutor */}
          <button
            onClick={() => {
              const qText = (question.content as { questionText?: string; statement?: string }).questionText
                ?? (question.content as { statement?: string }).statement
                ?? 'السؤال الحالي';
              onOpenAITutor(qText);
            }}
            className="p-2 rounded-xl bg-[#EEF0FF] hover:bg-[#DDE0FF] text-[#1A1F5E] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="اشرح لي"
          >
            <Bot size={16} />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="ds-progress-track">
        <motion.div
          className="ds-progress-fill"
          animate={{ width: `${progressPct}%` }}
          transition={{ ease: 'easeOut', duration: 0.35 }}
        />
      </div>

      {/* ── Question content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>

      {/* ── Feedback ── */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            className={`rounded-[20px] p-4 flex items-center justify-between gap-3
              ${isCorrect
                ? 'border-2 border-[#22C55E] bg-[#DCFCE7]'
                : 'border-2 border-[#EF4444] bg-[#FEE2E2]'}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl shrink-0">{isCorrect ? '✨' : '🧠'}</span>
              <div className="min-w-0">
                <p className={`font-extrabold text-sm ${isCorrect ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                  {isCorrect ? 'ممتاز! إجابة صحيحة 🌟' : 'تقريباً!'}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-[#15803D] font-bold mt-0.5 truncate">
                    الإجابة: {getCorrectAnswerDisplay(question) || question.explanation || ''}
                  </p>
                )}
                {question.explanation && (isCorrect || getCorrectAnswerDisplay(question)) && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{question.explanation}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95
                ${isCorrect ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
            >
              التالي
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
