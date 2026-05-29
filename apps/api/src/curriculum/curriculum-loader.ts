import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, 'data');

// ── Types ───────────────────────────────────────────────────────
interface RawExercise {
  id: string; type: string; question?: string; choices?: string[]; answer?: string;
  pairs?: Record<string, string>; bank?: string[]; correct_order?: string[];
  passage?: string; text?: string; front?: string; back?: string;
  audio_url?: string; explanation?: string; example?: string; ai_role?: string;
  prompt?: string; text_to_speak?: string; word?: string; hint?: string;
  image_query?: string; groups?: Record<string, string[]>; level?: number;
  time_limit?: number; name?: string; section?: string;
}

export interface QuestionDto {
  id: string; type: string; difficulty: number; order: number;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  explanation?: string;
}

export interface SectionMeta {
  index: number; name: string; displayName: string; lessonCount: number;
}

export interface LessonMeta {
  id: string; title: string; order: number; unit: string; type: 'REGULAR' | 'QUIZ';
}

// ── Cache ────────────────────────────────────────────────────────
const fileCache = new Map<string, { sections: Array<{ name: string; displayName: string; exercises: RawExercise[] }> }>();

function subjectFileName(subject: string): string {
  const map: Record<string, string> = { arabic: 'Arabic', hebrew: 'Hebrew', math: 'Math', english: 'English' };
  return map[subject.toLowerCase()] ?? subject;
}

function loadFile(subject: string, grade: number) {
  const key = `${subject}-${grade}`;
  if (fileCache.has(key)) return fileCache.get(key)!;
  const gradeStr = String(grade).padStart(2, '0');
  const filePath = path.join(DATA_DIR, `G${gradeStr}_${subjectFileName(subject)}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sections = Object.entries(raw.sections as Record<string, RawExercise[]>).map(([name, exercises], idx) => ({
    name,
    displayName: name.replace(/^Section_\d+_/, '').replace(/_/g, ' '),
    exercises,
  }));
  const result = { sections };
  fileCache.set(key, result);
  return result;
}

// ── shuffle (seeded) ─────────────────────────────────────────────
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Convert raw exercise → QuestionDto ──────────────────────────
function convert(ex: RawExercise, order: number): QuestionDto {
  const base = { id: ex.id, difficulty: ex.level ?? 1, order, explanation: ex.answer ? `الجواب: ${ex.answer}` : '' };

  switch (ex.type) {
    case 'MULTIPLE_CHOICE':
    case 'REVERSE_CHOICE':
    case 'MARK_CORRECT_MEANING':
    case 'TIMED_PRACTICE': {
      const choices = ex.choices ?? [];
      let dIdx = 0;
      const options = choices.map(c => ({ id: c === ex.answer ? 'c' : `d${dIdx++}`, text: c }));
      return { ...base, type: ex.type === 'TIMED_PRACTICE' ? 'MULTIPLE_CHOICE' : ex.type,
        content: { questionText: ex.question ?? '', options },
        correctAnswer: { selectedOptionIds: ['c'] } };
    }
    case 'TRUE_FALSE':
      return { ...base, type: 'TRUE_FALSE',
        content: { statement: ex.question ?? '' },
        correctAnswer: { isTrue: ex.answer === 'صح' || ex.answer === 'صحيح' || ex.answer === 'true' } };

    case 'FILL_BLANK':
    case 'COMPLETE_TRANSLATION':
    case 'TRANSLATE':
    case 'TRANSLATE_REVERSE':
      return { ...base, type: ex.type,
        content: { question: ex.question ?? '', source: ex.question ?? '', correct: ex.answer ?? '', hint: ex.hint },
        correctAnswer: { text: ex.answer ?? '', accepted: [ex.answer ?? ''] } };

    case 'FILL_BLANK_CHOICE': {
      const choices = ex.choices ?? [];
      let dIdx = 0;
      const options = choices.map(c => ({ id: c === ex.answer ? 'c' : `d${dIdx++}`, text: c }));
      return { ...base, type: 'FILL_BLANK_CHOICE',
        content: { questionText: ex.question ?? '', sentence: ex.question ?? '', options },
        correctAnswer: { selectedOptionId: 'c' } };
    }
    case 'LISTEN_CHOICE': {
      const choices = ex.choices ?? [];
      let dIdx = 0;
      const options = choices.map(c => ({ id: c === ex.answer ? 'c' : `d${dIdx++}`, text: c }));
      return { ...base, type: 'LISTEN_CHOICE',
        content: { questionText: ex.question ?? '', audioText: ex.answer ?? '', options },
        correctAnswer: { selectedOptionIds: ['c'] } };
    }
    case 'LISTEN_WRITE':
      return { ...base, type: 'LISTEN_WRITE',
        content: { questionText: ex.question ?? '', audioText: ex.answer ?? '', hint: ex.hint },
        correctAnswer: { text: ex.answer ?? '', accepted: [ex.answer ?? ''] } };

    case 'WORD_ORDER':
    case 'ARRANGE_ALL_WORDS':
    case 'WORD_BANK':
    case 'DRAG_ORDER': {
      const correctOrder = ex.correct_order ?? ex.bank ?? [];
      const words = shuffle([...correctOrder], correctOrder.join('').length);
      return { ...base, type: 'WORD_ORDER',
        content: { questionText: ex.question ?? '', words, correctOrder },
        correctAnswer: { order: correctOrder } };
    }
    case 'TAP_PAIRS':
    case 'PAIR_MATCH': {
      const pairs = Object.entries(ex.pairs ?? {}).map(([k, v], i) => ({ id: `p${i}`, hebrew: k, arabic: v }));
      return { ...base, type: 'TAP_PAIRS',
        content: { questionText: ex.question ?? '', pairs },
        correctAnswer: { pairs: Object.fromEntries(pairs.map(p => [p.id, p.id])) } };
    }
    case 'IMAGE_CHOICE': {
      const choices = ex.choices ?? [];
      let dIdx = 0;
      const options = choices.map(c => ({ id: c === ex.answer ? 'c' : `d${dIdx++}`, imageQuery: c, label: c }));
      return { ...base, type: 'IMAGE_CHOICE',
        content: { questionText: ex.question ?? '', audioText: ex.answer ?? '', imageQuery: ex.image_query ?? ex.answer ?? '', options },
        correctAnswer: { selectedOptionId: 'c' } };
    }
    case 'IMAGE_MATCH': {
      const pairs = Object.entries(ex.pairs ?? {}).map(([k, v], i) => ({ id: `p${i}`, image: k, word: v as string, imageQuery: k }));
      return { ...base, type: 'IMAGE_MATCH',
        content: { questionText: ex.question ?? '', pairs },
        correctAnswer: { matches: Object.fromEntries(pairs.map(p => [p.id, p.id])) } };
    }
    case 'LISTEN_IMAGE': {
      const choices = ex.choices ?? [];
      let dIdx = 0;
      const options = choices.map(c => ({ id: c === ex.answer ? 'c' : `d${dIdx++}`, imageQuery: c, label: c }));
      return { ...base, type: 'LISTEN_IMAGE',
        content: { question: ex.question ?? '', audioText: ex.answer ?? '', options },
        correctAnswer: { selectedOptionId: 'c' } };
    }
    case 'SORT_GROUPS': {
      const rawGroups = ex.groups ?? {};
      const groups = Object.keys(rawGroups).map((label, i) => ({ id: `g${i}`, label }));
      const items = Object.entries(rawGroups).flatMap(([label, words], gi) =>
        words.map((w, wi) => ({ id: `i${gi}_${wi}`, label: w, group: `g${gi}` }))
      );
      return { ...base, type: 'SORT_GROUPS',
        content: { questionText: ex.question ?? '', groups, items },
        correctAnswer: { assignments: Object.fromEntries(items.map(item => [item.id, item.group])) } };
    }
    case 'FLASHCARD':
    case 'FLASHCARD_EX':
      return { ...base, type: 'FLASHCARD_EX',
        content: { front: ex.front ?? ex.question ?? '', back: ex.back ?? ex.answer ?? '', transliteration: '' },
        correctAnswer: { rated: true } };

    case 'AI_CONVERSATION':
      return { ...base, type: 'AI_CONVERSATION',
        content: { questionText: ex.question ?? '', systemPrompt: ex.prompt ?? '', startMessage: ex.question ?? '', vocab: ex.word },
        correctAnswer: { completed: true } };

    case 'SPEAK':
    case 'SPEAK_WORD':
    case 'READ_ALOUD':
      return { ...base, type: ex.type,
        content: { questionText: ex.question ?? '', targetWord: ex.word ?? ex.text_to_speak ?? ex.answer ?? '',
          targetText: ex.text ?? ex.text_to_speak ?? '', translation: ex.hint ?? '' },
        correctAnswer: { rated: true } };

    case 'READING_COMPREHENSION':
      return { ...base, type: 'READING_COMPREHENSION',
        content: { text: ex.passage ?? ex.text ?? ex.question ?? '',
          questions: [{ q: ex.question ?? '', options: ex.choices ?? [ex.answer ?? ''], correct: 0 }] },
        correctAnswer: { answers: [0] } };

    case 'GRAMMAR_TIP':
      return { ...base, type: 'GRAMMAR_TIP',
        content: { explanation: ex.explanation ?? ex.question ?? '', example: ex.example ?? '' },
        correctAnswer: { acknowledged: true } };

    case 'SPEED_REVIEW': {
      const pairs = Object.entries(ex.pairs ?? {}).map(([k, v], i) => ({ id: `p${i}`, left: k, right: v }));
      return { ...base, type: 'SPEED_REVIEW',
        content: { questionText: ex.question ?? '', pairs, timeLimitSeconds: 30 },
        correctAnswer: { completed: true } };
    }
    default:
      return { ...base, type: ex.type,
        content: { questionText: ex.question ?? '', statement: ex.question ?? '' },
        correctAnswer: { text: ex.answer ?? '', accepted: [ex.answer ?? ''] } };
  }
}

const EXERCISES_PER_LESSON = 10;

function sectionLessonCount(exercises: RawExercise[]): number {
  return Math.max(1, Math.floor(exercises.length / EXERCISES_PER_LESSON));
}

// ── Public API ───────────────────────────────────────────────────

export function getSections(subject: string, grade: number): SectionMeta[] {
  const data = loadFile(subject, grade);
  if (!data) return [];
  return data.sections.map((s, idx) => ({
    index: idx,
    name: s.name,
    displayName: s.displayName,
    lessonCount: sectionLessonCount(s.exercises),
  }));
}

export function buildLessonsForSection(subject: string, grade: number, sectionIdx: number): LessonMeta[] {
  const data = loadFile(subject, grade);
  if (!data || !data.sections[sectionIdx]) return [];
  const sec = data.sections[sectionIdx];
  const totalLessons = sectionLessonCount(sec.exercises);
  const lessons: LessonMeta[] = [];
  for (let l = 1; l <= totalLessons; l++) {
    const isQuiz = l === totalLessons;
    lessons.push({
      id: `${subject.toLowerCase()}-${grade}-s${sectionIdx}-l${l}`,
      title: isQuiz ? `اختبار: ${sec.displayName}` : `درس ${l}: ${sec.displayName}`,
      order: sectionIdx * totalLessons + l,
      unit: sec.displayName,
      type: isQuiz ? 'QUIZ' : 'REGULAR',
    });
  }
  return lessons;
}

export function getLesson(subject: string, grade: number, sectionIdx: number, lessonNum: number): QuestionDto[] {
  const data = loadFile(subject, grade);
  if (!data || !data.sections[sectionIdx]) return [];
  const exercises = data.sections[sectionIdx].exercises;
  const totalLessons = sectionLessonCount(exercises);
  if (lessonNum >= totalLessons) return []; // quiz handled separately
  const start = (lessonNum - 1) * EXERCISES_PER_LESSON;
  const slice = exercises.slice(start, start + EXERCISES_PER_LESSON);
  return slice.map((ex, i) => convert(ex, i));
}

export function getQuiz(subject: string, grade: number, sectionIdx: number): QuestionDto[] {
  const data = loadFile(subject, grade);
  if (!data || !data.sections[sectionIdx]) return [];
  const exercises = data.sections[sectionIdx].exercises;
  // Last 12 exercises of the section — diverse types
  const last = exercises.slice(-50);
  const byType = new Map<string, RawExercise[]>();
  last.forEach(ex => {
    if (!byType.has(ex.type)) byType.set(ex.type, []);
    byType.get(ex.type)!.push(ex);
  });
  const picked: RawExercise[] = [];
  while (picked.length < 12) {
    let allEmpty = true;
    for (const [, arr] of byType) {
      if (arr.length > 0) {
        picked.push(arr.shift()!);
        allEmpty = false;
        if (picked.length === 12) break;
      }
    }
    if (allEmpty) break;
  }
  return picked.map((ex, i) => convert(ex, i));
}

export function parseLessonId(lessonId: string): { subject: string; grade: number; sectionIdx: number; lessonNum: number } | null {
  // Format: "arabic-1-s0-l3" or "sub-arabic-1-s0-l3"
  const clean = lessonId.replace(/^sub-/, '');
  const m = clean.match(/^([a-z]+)-(\d+)-s(\d+)-l(\d+)$/);
  if (!m) return null;
  return { subject: m[1], grade: parseInt(m[2]), sectionIdx: parseInt(m[3]), lessonNum: parseInt(m[4]) };
}

export function isQuizLesson(subject: string, grade: number, sectionIdx: number, lessonNum: number): boolean {
  const data = loadFile(subject, grade);
  if (!data || !data.sections[sectionIdx]) return false;
  return lessonNum >= sectionLessonCount(data.sections[sectionIdx].exercises);
}

export function getStats(): { total: number; subjects: string[]; grades: number[]; files: number } {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return { total: files.length * 3000, subjects: ['arabic', 'hebrew', 'math', 'english'], grades: Array.from({ length: 12 }, (_, i) => i + 1), files: files.length };
}
