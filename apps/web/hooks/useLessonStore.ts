import { create } from 'zustand';
import { QuestionDto } from '@/lib/types/lesson';

type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface LessonState {
  lessonId: string | null;
  questions: QuestionDto[];
  currentIndex: number;
  hearts: number;
  maxHearts: number;
  xpEarned: number;
  correctAnswers: number;
  answerState: AnswerState;
  isComplete: boolean;
  outOfHearts: boolean;

  initLesson: (lessonId: string, questions: QuestionDto[], hearts: number, maxHearts: number) => void;
  submitAnswer: (userAnswer: unknown) => boolean;
  nextQuestion: () => void;
  resetLesson: () => void;
}

// Safely evaluate simple arithmetic expressions like "5+3", "12-7", "4*3"
function evalMath(expr: string): number | null {
  const cleaned = expr.replace(/\s/g, '');
  if (!/^[\d+\-*/().]+$/.test(cleaned)) return null;
  try { return Function('"use strict"; return (' + cleaned + ')')(); } catch { return null; }
}

// Check if two expressions are mathematically equivalent
function mathEquivalent(a: string, b: string): boolean {
  const va = evalMath(a);
  const vb = evalMath(b);
  return va !== null && vb !== null && Math.abs(va - vb) < 0.0001;
}

function checkAnswer(question: QuestionDto, userAnswer: unknown): boolean {
  const correct = question.correctAnswer as Record<string, unknown>;

  switch (question.type) {
    // ── Existing types ────────────────────────────────────────
    case 'MULTIPLE_CHOICE':
    case 'REVERSE_CHOICE':
    case 'LISTEN_CHOICE': {
      const ids = (correct.selectedOptionIds as string[]) ?? [];
      const user = (userAnswer as string[]) ?? [];
      return ids.length === user.length && ids.every((id) => user.includes(id));
    }
    case 'TRUE_FALSE':
      return (userAnswer as boolean) === correct.isTrue;
    case 'FILL_IN_THE_BLANK': {
      const blanks = correct.blanks as Record<string, string[]>;
      const userBlanks = userAnswer as Record<string, string>;
      return Object.entries(blanks).every(([key, accepted]) => {
        const userVal = (userBlanks[key] ?? '').trim();
        return accepted.some((a) => {
          const aStr = a.trim();
          if (aStr.toLowerCase() === userVal.toLowerCase()) return true;
          return mathEquivalent(aStr, userVal);
        });
      });
    }
    case 'SHORT_ANSWER':
    case 'LISTEN_WRITE':
    case 'TRANSLATE': {
      const accepted = (correct.accepted as string[]) ?? [correct.text as string];
      const userStr = String(userAnswer).trim();
      return accepted.some((a) => {
        const aStr = a.trim();
        if (aStr.toLowerCase() === userStr.toLowerCase()) return true;
        // Math equivalence: 5+3 === 3+5, but 5-3 !== 3-5
        return mathEquivalent(aStr, userStr);
      });
    }
    case 'ORDERING':
    case 'WORD_ORDER': {
      const expected = correct.order as string[];
      const user = userAnswer as string[];
      return JSON.stringify(expected) === JSON.stringify(user);
    }
    case 'MATCHING': {
      const correctPairs = (correct.pairs as string[][]) ?? [];
      const userMatches = userAnswer as Record<string, string>;
      return correctPairs.every(([leftId, rightId]) => userMatches[leftId] === rightId);
    }
    // ── New types ────────────────────────────────────────────
    case 'FILL_BLANK_CHOICE': {
      return (userAnswer as string) === (correct.selectedOptionId as string);
    }
    case 'TAP_PAIRS':
    case 'PAIR_MATCH': {
      // correctAnswer uses { pairs: { id: id, ... } }
      const expected = (correct.pairs ?? correct.matches) as Record<string, string>;
      const user = userAnswer as Record<string, string>;
      if (!expected || !user) return false;
      return Object.entries(expected).every(([k, v]) => user[k] === v);
    }
    case 'SORT_GROUPS': {
      const expected = (correct.assignments ?? {}) as Record<string, string>;
      const user = userAnswer as Record<string, string>;
      if (!user) return false;
      return Object.entries(expected).every(([k, v]) => user[k] === v);
    }
    case 'SPEAK_WORD':
    case 'SPEAK':
    case 'READ_ALOUD':
      return !!(userAnswer as { passed?: boolean })?.passed;
    // ── Grade-1 Arabic types ─────────────────────────────────────
    case 'IMAGE_CHOICE':
    case 'LISTEN_IMAGE':
      return (userAnswer as string) === (correct.selectedOptionId as string);
    case 'IMAGE_MATCH': {
      const expected = (correct.matches ?? {}) as Record<string, string>;
      const user = userAnswer as Record<string, string>;
      if (!user) return false;
      return Object.entries(expected).every(([k, v]) => user[k] === v);
    }
    case 'DRAG_ORDER': {
      const expected = (correct.order ?? correct.orderedIds ?? correct.correctOrder) as string[];
      const user = userAnswer as string[];
      return JSON.stringify(expected) === JSON.stringify(user);
    }
    case 'TRANSLATE_REVERSE':
    case 'COMPLETE_TRANSLATION': {
      const accepted = (correct.accepted as string[]) ?? [correct.text as string];
      return accepted.some((a) => a.trim().toLowerCase() === String(userAnswer).trim().toLowerCase());
    }
    case 'READING_COMPREHENSION': {
      const expected = correct.answers as number[];
      const user = userAnswer as number[];
      return Array.isArray(expected) && Array.isArray(user) &&
        expected.length === user.length &&
        expected.every((ans, i) => ans === user[i]);
    }
    case 'MARK_CORRECT_MEANING': {
      const ids = (correct.selectedOptionIds as string[]) ?? [];
      const user = (userAnswer as string[]) ?? [];
      return ids.length === user.length && ids.every((id) => user.includes(id));
    }
    case 'ARRANGE_ALL_WORDS':
    case 'WORD_BANK': {
      const expected = (correct.order ?? correct.correctOrder) as string[];
      const user = userAnswer as string[];
      return JSON.stringify(expected) === JSON.stringify(user);
    }
    case 'FLASHCARD':
    case 'FLASHCARD_EX':
    case 'AI_CONVERSATION':
    case 'GRAMMAR_TIP':
    case 'SPEED_REVIEW':
      return true; // self-assessment — always mark correct
    default:
      return false;
  }
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessonId: null,
  questions: [],
  currentIndex: 0,
  hearts: 5,
  maxHearts: 5,
  xpEarned: 0,
  correctAnswers: 0,
  answerState: 'unanswered',
  isComplete: false,
  outOfHearts: false,

  initLesson: (lessonId, questions, hearts, maxHearts) =>
    set({ lessonId, questions, currentIndex: 0, hearts, maxHearts, xpEarned: 0, correctAnswers: 0, answerState: 'unanswered', isComplete: false, outOfHearts: false }),

  submitAnswer: (userAnswer) => {
    const { questions, currentIndex, hearts } = get();
    const question = questions[currentIndex];
    if (!question) return false;

    const isCorrect = checkAnswer(question, userAnswer);
    const xpGain = isCorrect ? 10 + question.difficulty * 2 : 0;
    const newHearts = isCorrect ? hearts : Math.max(0, hearts - 1);

    set((s) => ({
      answerState: isCorrect ? 'correct' : 'wrong',
      hearts: newHearts,
      xpEarned: s.xpEarned + xpGain,
      correctAnswers: s.correctAnswers + (isCorrect ? 1 : 0),
      outOfHearts: newHearts <= 0,
    }));

    return isCorrect;
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex >= questions.length - 1) { set({ isComplete: true }); return; }
    set({ currentIndex: currentIndex + 1, answerState: 'unanswered' });
  },

  resetLesson: () =>
    set({ lessonId: null, questions: [], currentIndex: 0, hearts: 5, maxHearts: 5, xpEarned: 0, correctAnswers: 0, answerState: 'unanswered', isComplete: false, outOfHearts: false }),
}));
