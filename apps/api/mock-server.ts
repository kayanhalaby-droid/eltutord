/**
 * Mock API server — للتطوير المحلي فقط بدون قاعدة بيانات
 * يعمل على port 3001 بنفس endpoints الـ API الحقيقية
 */
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { generateExercises, VocabItem } from './exercise-generator';
import { GRADE1_ARABIC } from './grade1-arabic-curriculum';
import { HEB2_UNIT1_LESSONS, HEB2_UNIT2_LESSONS, HEB2_UNIT3_LESSONS, HEB2_UNIT4_LESSONS, HEB2_UNIT5_LESSONS, HEB2_UNIT6_LESSONS, HEB2_UNIT7_LESSONS, HEB2_UNIT8_LESSONS } from './grade2-hebrew-curriculum';
import { ARABIC_BY_GRADE } from './arabic-curriculum-all';
import { HEBREW_BY_GRADE } from './hebrew-curriculum-all';
import { ENGLISH_BY_GRADE } from './english-curriculum-all';
import { MATH_BY_GRADE } from './math-curriculum-all';
import {
  getSections as loaderGetSections,
  buildLessonsForSection,
  getLesson as loaderGetLesson,
  getQuiz as loaderGetQuiz,
  parseLessonId,
  isQuizLesson,
  getStats as loaderGetStats,
} from './src/curriculum/curriculum-loader';

const PORT = 3001;

// ── In-memory State ──────────────────────────────────────────────
interface QuestEntry {
  id: string; type: string; title: string; description: string;
  target: number; progress: number; completed: boolean;
  xpReward: number; gemsReward: number;
}

interface FlashcardEntry {
  id: string; lessonId: string;
  front: string; back: string; transliteration: string;
  dueDate: string; interval: number; repetitions: number;
}

const state = {
  hearts: 5, maxHearts: 5,
  xp: 450, weeklyXp: 120, level: 3,
  gems: 250,
  streak: 7,
  dailyXp: 30,
  dailyGoalTarget: 50,
  hasStreakFreeze: false,
  xpBoostActive: false,
  completedLessons: new Set<string>(),
  lessonScores: {} as Record<string, number>,
  lastActivityDate: '',
  brokenStreakValue: 0,
  // Daily quests
  questsDate: '',
  dailyQuests: [] as QuestEntry[],
  allQuestsBonusClaimed: false,
  todayCorrectAnswers: 0,
  todayLessonsCompleted: 0,
  // Flashcards
  flashcards: [] as FlashcardEntry[],
  todayReviewedCards: 0,
  addedLessons: new Set<string>(),
  // Metzav (for testing overrides)
  metzavDateOverride: null as string | null,
  metzavGradeOverride: null as number | null,
  // Parent system
  parentRewards: {
    small:  { gems: 200,  name: 'وجبة بيتزا 🍕',   active: true, expiresAt: null as string | null },
    medium: { gems: 500,  name: 'لعبة جديدة 🎮',   active: true, expiresAt: null as string | null },
    large:  { gems: 2000, name: 'رحلة عائلية 🚗',  active: true, expiresAt: null as string | null },
  },
  parentSettings: {
    studyDays: [0, 1, 2, 3, 4] as number[],
    studyStartHour: 15,
    studyEndHour: 21,
    minDailyMinutes: 15,
    maxDailyMinutes: 60,
    homeworkAIGuide: true,
    notificationLevel: 'medium' as 'quiet' | 'medium' | 'following',
    weekGoalSubject: null as string | null,
    weekGoalType: null as string | null,
  },
  pendingRewardRequests: [] as Array<{ id: string; level: string; name: string; gems: number; requestedAt: string; status: 'pending' | 'approved' | 'deferred' }>,
  pendingEncouragements: [] as Array<{ id: string; message: string; gems: number; fromName: string; createdAt: string; read: boolean }>,
  todayStudyMinutes: 0,
  linkedChildrenIds: [] as string[],
};

// ── State Persistence ────────────────────────────────────────────
const STATE_FILE = path.join(__dirname, '.mock-state.json');
const PERSIST_KEYS = ['xp', 'weeklyXp', 'level', 'gems', 'streak', 'dailyXp', 'lastActivityDate', 'brokenStreakValue', 'hasStreakFreeze', 'todayCorrectAnswers', 'todayLessonsCompleted', 'todayStudyMinutes'] as const;

function loadPersistedState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const saved = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    for (const key of PERSIST_KEYS) {
      if (saved[key] !== undefined) (state as Record<string, unknown>)[key] = saved[key];
    }
    if (saved.savedDate && saved.savedDate !== today) {
      state.dailyXp = 0;
      state.todayCorrectAnswers = 0;
      state.todayLessonsCompleted = 0;
      state.todayStudyMinutes = 0;
    }
    if (saved.completedLessons) state.completedLessons = new Set(saved.completedLessons);
  } catch { /* first run — use defaults */ }
}

function saveState() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data: Record<string, unknown> = { savedDate: today };
    for (const key of PERSIST_KEYS) data[key] = (state as Record<string, unknown>)[key];
    data.completedLessons = [...state.completedLessons];
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
  } catch { /* ignore write errors */ }
}

loadPersistedState();
setInterval(saveState, 30_000);

// ── Fake Data ────────────────────────────────────────────────────
const FAKE_USER = {
  id: 'mock-user-1',
  firstName: 'أحمد',
  lastName: 'محمد',
  phone: '0501234567',
  email: 'ahmed@mock.dev',
  role: 'STUDENT',
  gradeLevel: 1, // Grade 1 for testing Arabic Grade-1 curriculum
};

// All possible children that parents can link by phone
const FAKE_CHILDREN_POOL = [
  {
    id: 'child-1', firstName: 'سارة', lastName: 'محمد', gradeLevel: 4,
    phone: '0501111111',
    xp: 320, weeklyXp: 120, streak: 5, gems: 180, role: 'STUDENT',
    studiedToday: true, todayDurationMinutes: 20,
    lastActivity: { subject: 'عبري', unit: 'وحدة الألوان', lessonTitle: 'الألوان — צבעים', score: 85 },
  },
  {
    id: 'child-2', firstName: 'يوسف', lastName: 'محمد', gradeLevel: 6,
    phone: '0502222222',
    xp: 650, weeklyXp: 340, streak: 12, gems: 420, role: 'STUDENT',
    studiedToday: false, todayDurationMinutes: 0,
    lastActivity: { subject: 'رياضيات', unit: 'وحدة الجمع', lessonTitle: 'الجمع البسيط', score: 62 },
  },
  {
    id: 'child-3', firstName: 'ليلى', lastName: 'محمد', gradeLevel: 2,
    phone: '0503333333',
    xp: 180, weeklyXp: 60, streak: 3, gems: 90, role: 'STUDENT',
    studiedToday: true, todayDurationMinutes: 15,
    lastActivity: { subject: 'عربي', unit: 'وحدة الحروف', lessonTitle: 'حرف الألف', score: 95 },
  },
];
// FAKE_CHILDREN is kept as alias for backward compat in report/encourage routes
const FAKE_CHILDREN = FAKE_CHILDREN_POOL;

const SUBJECTS = [
  { id: 'sub-arabic',  name: 'عربي',    curriculumId: null },
  { id: 'sub-hebrew',  name: 'عبري',    curriculumId: null },
  { id: 'sub-math',    name: 'رياضيات', curriculumId: null },
  { id: 'sub-english', name: 'إنجليزي', curriculumId: null },
];

// ── Grade-1 Arabic: flatten units → lessons for the learning path ──
const GRADE1_ARABIC_LESSONS: { id: string; title: string; order: number; unit: string }[] = [];
const GRADE1_ARABIC_QUESTIONS: Record<string, any[]> = {};
let g1Order = 1;
for (const unit of GRADE1_ARABIC.units) {
  for (const lesson of (unit as any).lessons) {
    GRADE1_ARABIC_LESSONS.push({ id: lesson.id, title: lesson.title, order: g1Order++, unit: unit.title });
    GRADE1_ARABIC_QUESTIONS[lesson.id] = lesson.questions;
  }
}

// ── Grade-2 Hebrew: flatten units → lessons ──
const HEB2_ALL_UNITS = [HEB2_UNIT1_LESSONS, HEB2_UNIT2_LESSONS, HEB2_UNIT3_LESSONS, HEB2_UNIT4_LESSONS, HEB2_UNIT5_LESSONS, HEB2_UNIT6_LESSONS, HEB2_UNIT7_LESSONS, HEB2_UNIT8_LESSONS];
const HEB2_LESSONS: { id: string; title: string; order: number; unit: string }[] = [];
const HEB2_QUESTIONS: Record<string, any[]> = {};
let hb2Order = 1;
for (const unit of HEB2_ALL_UNITS) {
  for (const lesson of (unit as any[])) {
    HEB2_LESSONS.push({ id: lesson.id, title: lesson.title, order: hb2Order++, unit: lesson.unitId });
    HEB2_QUESTIONS[lesson.id] = lesson.questions;
  }
}

// ── Build question lookup for all new curriculum lessons ──
const ALL_NEW_QUESTIONS: Record<string, any[]> = {};
for (const lessons of [
  ...Object.values(ARABIC_BY_GRADE),
  ...Object.values(HEBREW_BY_GRADE),
  ...Object.values(ENGLISH_BY_GRADE),
  ...Object.values(MATH_BY_GRADE),
]) {
  for (const lesson of lessons as Array<{ id: string; questions: any[] }>) {
    ALL_NEW_QUESTIONS[lesson.id] = lesson.questions;
  }
}

const LESSONS_BY_SUBJECT: Record<string, { id: string; title: string; order: number; unit?: string }[]> = {
  'sub-arabic-1': GRADE1_ARABIC_LESSONS,
  'sub-hebrew-2': HEB2_LESSONS,
  'sub-arabic': GRADE1_ARABIC_LESSONS,
  'sub-hebrew': HEB2_LESSONS,
  'sub-math': MATH_BY_GRADE[1] ?? [],
  'sub-english': ENGLISH_BY_GRADE[3] ?? [],
};

// Register all grades for each subject
for (let g = 2; g <= 12; g++) {
  if (ARABIC_BY_GRADE[g])  LESSONS_BY_SUBJECT[`sub-arabic-${g}`]  = ARABIC_BY_GRADE[g];
  if (HEBREW_BY_GRADE[g])  LESSONS_BY_SUBJECT[`sub-hebrew-${g}`]  = HEBREW_BY_GRADE[g];
  if (ENGLISH_BY_GRADE[g]) LESSONS_BY_SUBJECT[`sub-english-${g}`] = ENGLISH_BY_GRADE[g];
  if (MATH_BY_GRADE[g])    LESSONS_BY_SUBJECT[`sub-math-${g}`]    = MATH_BY_GRADE[g];
}
// Grade 1 math
if (MATH_BY_GRADE[1]) LESSONS_BY_SUBJECT['sub-math-1'] = MATH_BY_GRADE[1];
// Hebrew grade 1: use the existing HEB2 curriculum as best approximation
LESSONS_BY_SUBJECT['sub-hebrew-1'] = HEB2_LESSONS;
// English grades 1-2: no dedicated curriculum yet — leave as empty (show "قريباً")
LESSONS_BY_SUBJECT['sub-english-1'] = [];
LESSONS_BY_SUBJECT['sub-english-2'] = [];

const LEAGUE_OTHERS = [
  { id: 'u1', name: 'ليلى',    avatar: 'ل', xp: 420 },
  { id: 'u2', name: 'كريم',    avatar: 'ك', xp: 380 },
  { id: 'u3', name: 'مريم',    avatar: 'م', xp: 290 },
  { id: 'u4', name: 'طارق',    avatar: 'ط', xp: 240 },
  { id: 'u5', name: 'نور',     avatar: 'ن', xp: 210 },
  { id: 'u6', name: 'ياسمين', avatar: 'ي', xp: 180 },
  { id: 'u7', name: 'سامي',   avatar: 'س', xp: 150 },
  { id: 'u8', name: 'رنا',     avatar: 'ر', xp: 120 },
  { id: 'u9', name: 'فارس',   avatar: 'ف', xp: 90 },
];

const ACHIEVEMENTS_DEF = [
  { id: 'first-lesson',   title: 'الخطوة الأولى',        description: 'أكمل أول درس',              icon: '🎯', target: 1,   category: 'lessons' },
  { id: 'five-lessons',   title: 'متعلم نشط',            description: 'أكمل ٥ دروس',               icon: '📚', target: 5,   category: 'lessons' },
  { id: 'ten-lessons',    title: 'الطالب المجتهد',        description: 'أكمل ١٠ دروس',              icon: '🏆', target: 10,  category: 'lessons' },
  { id: 'streak-3',       title: 'ثلاثة أيام',            description: 'حافظ على سلسلتك ٣ أيام',    icon: '🔥', target: 3,   category: 'streak' },
  { id: 'streak-7',       title: 'أسبوع كامل',           description: 'حافظ على سلسلتك ٧ أيام',    icon: '🌟', target: 7,   category: 'streak' },
  { id: 'streak-30',      title: 'شهر من الإخلاص',       description: 'حافظ على سلسلتك ٣٠ يوماً',  icon: '💎', target: 30,  category: 'streak' },
  { id: 'xp-100',         title: 'مئة نقطة',             description: 'اجمع ١٠٠ نقطة XP',          icon: '⭐', target: 100, category: 'xp' },
  { id: 'xp-500',         title: 'خمسمائة نقطة',         description: 'اجمع ٥٠٠ نقطة XP',          icon: '🌠', target: 500, category: 'xp' },
  { id: 'xp-1000',        title: 'ألف نقطة',             description: 'اجمع ١٠٠٠ نقطة XP',         icon: '🚀', target: 1000, category: 'xp' },
  { id: 'gems-100',       title: 'جامع الجواهر',          description: 'اجمع ١٠٠ جوهرة',            icon: '💍', target: 100, category: 'gems' },
  { id: 'perfect-lesson', title: 'درس مثالي',            description: 'أكمل درساً بدون أخطاء',     icon: '💯', target: 1,   category: 'accuracy' },
  { id: 'arabic-master',  title: 'إتقان العربية',         description: 'أكمل جميع دروس العربي',     icon: '📖', target: 6,   category: 'subject' },
];

const SHOP_ITEMS = [
  { id: 'hearts-refill', name: 'إعادة ملء القلوب', description: 'استرجع كل قلوبك فورًا',          icon: '❤️',  cost: 350, type: 'hearts' },
  { id: 'streak-freeze', name: 'تجميد السلسلة',    description: 'احمِ سلسلتك لمدة يوم كامل',      icon: '❄️',  cost: 200, type: 'streak' },
  { id: 'xp-boost',      name: 'مضاعف XP',         description: 'ضاعف نقاطك لمدة ساعة كاملة',   icon: '⚡',  cost: 400, type: 'xp' },
  { id: 'gems-bonus',    name: '+١٠٠ جوهرة',       description: 'احصل على ١٠٠ جوهرة مجاناً الآن', icon: '💎', cost: 0,   type: 'bonus', isFree: true },
];

// ── Daily Quests ──────────────────────────────────────────────────
const QUEST_POOL: Array<Omit<QuestEntry, 'id' | 'progress' | 'completed'>> = [
  { type: 'complete_lesson',    title: 'أكمل درساً',          description: 'أكمل درساً واحداً اليوم',         target: 1,  xpReward: 20, gemsReward: 10 },
  { type: 'two_lessons',        title: 'درسان في يوم',        description: 'أكمل درسين خلال اليوم',           target: 2,  xpReward: 40, gemsReward: 30 },
  { type: 'answer_correct',     title: 'عشرون إجابة صحيحة',  description: 'أجب على ٢٠ سؤالاً بشكل صحيح',     target: 20, xpReward: 30, gemsReward: 20 },
  { type: 'lesson_no_errors',   title: 'درس بلا أخطاء',      description: 'أكمل درساً بنسبة ١٠٠٪ صحيحة',     target: 1,  xpReward: 35, gemsReward: 25 },
  { type: 'high_score',         title: 'درجة ممتازة',         description: 'احصل على ٩٠٪ أو أكثر في درس',     target: 1,  xpReward: 30, gemsReward: 20 },
  { type: 'review_flashcards',  title: 'راجع البطاقات',       description: 'راجع ١٠ بطاقات مفردات عبرية',      target: 10, xpReward: 15, gemsReward: 5  },
];

function ensureDailyQuests() {
  const today = new Date().toISOString().split('T')[0];
  if (state.questsDate === today && state.dailyQuests.length === 3) return;
  if (state.questsDate !== today) {
    state.todayCorrectAnswers = 0;
    state.todayLessonsCompleted = 0;
    state.todayReviewedCards = 0;
    state.allQuestsBonusClaimed = false;
  }
  state.questsDate = today;
  const day = new Date().getDate();
  const chosen = [day % 6, (day + 2) % 6, (day + 4) % 6];
  state.dailyQuests = chosen.map((idx, i) => ({
    id: `quest-${today}-${i}`,
    ...QUEST_POOL[idx],
    progress: 0,
    completed: false,
  }));
}

function updateQuestProgress(correctAnswers: number, score: number) {
  ensureDailyQuests();
  state.todayLessonsCompleted++;
  state.todayCorrectAnswers += correctAnswers;
  for (const q of state.dailyQuests) {
    if (q.completed) continue;
    if (q.type === 'complete_lesson' || q.type === 'two_lessons')
      q.progress = Math.min(state.todayLessonsCompleted, q.target);
    if (q.type === 'answer_correct')
      q.progress = Math.min(state.todayCorrectAnswers, q.target);
    if (q.type === 'lesson_no_errors' && score === 100)
      q.progress = Math.min(q.progress + 1, q.target);
    if (q.type === 'high_score' && score >= 90)
      q.progress = Math.min(q.progress + 1, q.target);
    if (!q.completed && q.progress >= q.target) {
      q.completed = true;
      state.xp += q.xpReward;
      state.weeklyXp += q.xpReward;
      state.gems += q.gemsReward;
    }
  }
}

// ── Metzav Helpers ────────────────────────────────────────────────
// Grade 2 → February 15  |  Grade 5 → May 15
const METZAV_MONTH: Record<number, number> = { 2: 1, 5: 4 }; // 0-indexed months
const METZAV_DAY = 15;

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMetzavDate(grade: number): string | null {
  const month = METZAV_MONTH[grade];
  if (month === undefined) return null;
  const now = new Date();
  let d = new Date(now.getFullYear(), month, METZAV_DAY);
  if (d <= now) d = new Date(now.getFullYear() + 1, month, METZAV_DAY);
  return toLocalDateStr(d);
}

function computeDays(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0); target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function schoolYearProgress(metzavDate: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const metzav = new Date(metzavDate); metzav.setHours(0, 0, 0, 0);
  // school year starts Sep 1
  const sep1 = new Date(metzav.getFullYear() - (metzav.getMonth() < 8 ? 1 : 0), 8, 1);
  const total = metzav.getTime() - sep1.getTime();
  const elapsed = now.getTime() - sep1.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

// ── Flashcard Helpers ─────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard';
const HLR_DAYS: Record<Difficulty, number> = { easy: 7, medium: 3, hard: 1 };

function nextDueDate(difficulty: Difficulty): string {
  const d = new Date();
  d.setDate(d.getDate() + HLR_DAYS[difficulty]);
  return toLocalDateStr(d);
}

const LESSON_VOCAB: Record<string, Array<{
  front: string; back: string; transliteration: string;
  gender?: 'male' | 'female'; example?: string; exampleAr?: string;
}>> = {
  'he-1':  [
    { front: 'אני',   back: 'أنا',        transliteration: 'ani',   example: 'אני לומד עברית',        exampleAr: 'أنا أتعلم العبرية' },
    { front: 'שמי',   back: 'اسمي',       transliteration: 'shmi',  example: 'שמי דניאל',             exampleAr: 'اسمي دانيال' },
    { front: 'בן',    back: 'ابن / ولد',  transliteration: 'ben',   gender: 'male' },
    { front: 'בת',    back: 'ابنة / بنت', transliteration: 'bat',   gender: 'female' },
    { front: 'גר',    back: 'يسكن',       transliteration: 'gar',   example: 'אני גר בבית גדול',      exampleAr: 'أنا أسكن في بيت كبير' },
  ],
  'he-2':  [
    { front: 'אבא',   back: 'أبو / بابا', transliteration: 'aba',   gender: 'male',   example: 'אבא שלי טוב',   exampleAr: 'أبي طيب' },
    { front: 'אמא',   back: 'أم / ماما',  transliteration: 'ima',   gender: 'female', example: 'אמא שלי יפה',   exampleAr: 'أمي جميلة' },
    { front: 'אח',    back: 'أخ',         transliteration: 'ach',   gender: 'male' },
    { front: 'אחות',  back: 'أخت',        transliteration: 'achot', gender: 'female' },
    { front: 'סבא',   back: 'جدّ',         transliteration: 'saba',  gender: 'male' },
    { front: 'סבתא',  back: 'جدّة',        transliteration: 'savta', gender: 'female' },
  ],
  'he-3':  [
    { front: 'בית',   back: 'بيت',        transliteration: 'bayit',   gender: 'male', example: 'הבית שלי גדול',  exampleAr: 'بيتي كبير' },
    { front: 'חדר',   back: 'غرفة',       transliteration: 'cheder',  gender: 'male' },
    { front: 'מטבח',  back: 'مطبخ',       transliteration: 'mitbach', gender: 'male' },
    { front: 'שולחן', back: 'طاولة',      transliteration: 'shulchan',gender: 'male', example: 'השולחן גדול',    exampleAr: 'الطاولة كبيرة' },
    { front: 'כיסא',  back: 'كرسي',       transliteration: 'kise',    gender: 'male' },
  ],
  'he-5':  [
    { front: 'אדום',  back: 'أحمر',       transliteration: 'adom',   example: 'התפוח אדום',    exampleAr: 'التفاحة حمراء' },
    { front: 'כחול',  back: 'أزرق',       transliteration: 'kachol', example: 'הים כחול',      exampleAr: 'البحر أزرق' },
    { front: 'ירוק',  back: 'أخضر',       transliteration: 'yarok',  example: 'העשב ירוק',     exampleAr: 'العشب أخضر' },
    { front: 'צהוב',  back: 'أصفر',       transliteration: 'tzahov', example: 'השמש צהובה',    exampleAr: 'الشمس صفراء' },
    { front: 'לבן',   back: 'أبيض',       transliteration: 'lavan' },
    { front: 'שחור',  back: 'أسود',       transliteration: 'shachor'},
  ],
  'he-6':  [
    { front: 'עיגול',   back: 'دائرة',    transliteration: 'igul' },
    { front: 'משולש',   back: 'مثلث',     transliteration: 'meshulash' },
    { front: 'ריבוע',   back: 'مربع',     transliteration: 'ribua' },
    { front: 'מלבן',    back: 'مستطيل',   transliteration: 'malben' },
  ],
  'he-7':  [
    { front: 'גדול',  back: 'كبير',       transliteration: 'gadol',  example: 'הבית גדול',     exampleAr: 'البيت كبير' },
    { front: 'קטן',   back: 'صغير',       transliteration: 'katan',  example: 'הכלב קטן',      exampleAr: 'الكلب صغير' },
    { front: 'יפה',   back: 'جميل',       transliteration: 'yafe',   example: 'הילדה יפה',     exampleAr: 'البنت جميلة' },
    { front: 'חדש',   back: 'جديد',       transliteration: 'chadash' },
    { front: 'ישן',   back: 'قديم',       transliteration: 'yashan' },
  ],
  'he-9':  [
    { front: 'ספר',     back: 'كتاب',     transliteration: 'sefer',    gender: 'male', example: 'הספר על השולחן', exampleAr: 'الكتاب على الطاولة' },
    { front: 'עט',      back: 'قلم',      transliteration: 'et',       gender: 'male' },
    { front: 'מחברת',   back: 'دفتر',     transliteration: 'machberet', gender: 'female' },
    { front: 'לוח',     back: 'سبورة',    transliteration: 'luach',    gender: 'male' },
    { front: 'תיק',     back: 'حقيبة',    transliteration: 'tik',      gender: 'male' },
  ],
  'he-10': [
    { front: 'מתמטיקה', back: 'رياضيات',  transliteration: 'matematika', gender: 'female' },
    { front: 'עברית',   back: 'لغة عبرية',transliteration: 'ivrit',      gender: 'female' },
    { front: 'ספורט',   back: 'رياضة',    transliteration: 'sport',      gender: 'male' },
    { front: 'מדעים',   back: 'علوم',     transliteration: 'madaim',     gender: 'male' },
  ],
  'he-11': [
    { front: 'מורה',      back: 'معلم/معلمة', transliteration: 'more',      gender: 'male', example: 'המורה טוב', exampleAr: 'المعلم جيد' },
    { front: 'תלמיד',     back: 'تلميذ',      transliteration: 'talmid',    gender: 'male' },
    { front: 'חבר',       back: 'صديق',       transliteration: 'chaver',    gender: 'male' },
    { front: 'כיתה',      back: 'صف / فصل',   transliteration: 'kita',      gender: 'female' },
    { front: 'בית ספר',   back: 'مدرسة',      transliteration: 'beit sefer', gender: 'male' },
  ],
  'he-13': [
    { front: 'תפוח',    back: 'تفاحة',    transliteration: 'tapuach',    gender: 'male', example: 'התפוח טעים',   exampleAr: 'التفاحة لذيذة' },
    { front: 'בננה',    back: 'موزة',     transliteration: 'banana',     gender: 'female' },
    { front: 'עגבנייה', back: 'طماطم',    transliteration: 'agvaniya',   gender: 'female' },
    { front: 'מלפפון',  back: 'خيار',     transliteration: 'melafefon',  gender: 'male' },
    { front: 'גזר',     back: 'جزرة',     transliteration: 'gezer',      gender: 'male' },
  ],
  'he-14': [
    { front: 'ארוחת בוקר',    back: 'وجبة الفطور', transliteration: 'aruchat boker',      gender: 'female' },
    { front: 'ארוחת צהריים',  back: 'وجبة الغداء', transliteration: 'aruchat tzohorayim', gender: 'female' },
    { front: 'ארוחת ערב',     back: 'وجبة العشاء', transliteration: 'aruchat erev',       gender: 'female' },
    { front: 'אוכל',          back: 'طعام',         transliteration: 'ochel',              gender: 'male' },
    { front: 'שתייה',         back: 'مشروب',        transliteration: 'shtiya',             gender: 'female' },
  ],
  'he-15': [
    { front: 'טעים',  back: 'لذيذ',   transliteration: 'taim',    example: 'האוכל טעים',  exampleAr: 'الطعام لذيذ' },
    { front: 'מתוק',  back: 'حلو',    transliteration: 'matok',   example: 'הגלידה מתוקה',exampleAr: 'الآيس كريم حلو' },
    { front: 'חמוץ',  back: 'حامض',   transliteration: 'chamuts' },
    { front: 'מלוח',  back: 'مالح',   transliteration: 'maluach' },
    { front: 'חריף',  back: 'حار',    transliteration: 'charif' },
  ],
  'he-17': [
    { front: 'קם',       back: 'يستيقظ', transliteration: 'kam',       example: 'אני קם בבוקר',     exampleAr: 'أنا أستيقظ في الصباح' },
    { front: 'מתרחץ',    back: 'يستحم',  transliteration: 'mitrakhets' },
    { front: 'הולך',     back: 'يذهب',   transliteration: 'holech',    example: 'אני הולך לבית ספר', exampleAr: 'أنا أذهب إلى المدرسة' },
    { front: 'לובש',     back: 'يرتدي',  transliteration: 'lovesh' },
    { front: 'אוכל',     back: 'يأكل',   transliteration: 'ochel',     example: 'אני אוכל ארוחת בוקר', exampleAr: 'أنا آكل الفطور' },
  ],
  'he-18': [
    { front: 'משחק',  back: 'يلعب',     transliteration: 'mesachek', example: 'אני משחק עם חברים', exampleAr: 'أنا ألعب مع الأصدقاء' },
    { front: 'לומד',  back: 'يدرس',     transliteration: 'lomed',    example: 'אני לומד עברית',    exampleAr: 'أنا أدرس العبرية' },
    { front: 'כותב',  back: 'يكتب',     transliteration: 'kotev' },
    { front: 'קורא',  back: 'يقرأ',     transliteration: 'kore' },
  ],
  'he-19': [
    { front: 'ישן',    back: 'ينام',    transliteration: 'yashen',  example: 'אני ישן בלילה',  exampleAr: 'أنا أنام في الليل' },
    { front: 'שוכב',   back: 'يستلقي', transliteration: 'shochev' },
    { front: 'מנוחה',  back: 'راحة',   transliteration: 'menucha' },
    { front: 'לילה',   back: 'ليل',    transliteration: 'layla',   example: 'הלילה חשוך',     exampleAr: 'الليل مظلم' },
  ],
};

// ── OpenAI Helpers ────────────────────────────────────────────────
async function openaiTTS(text: string): Promise<Buffer | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  // 'nova' has better Arabic pronunciation than 'shimmer'
  const body = JSON.stringify({ model: 'tts-1-hd', input: text, voice: 'nova', response_format: 'mp3' });
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/audio/speech', method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => res.statusCode === 200 ? resolve(Buffer.concat(chunks)) : resolve(null));
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

async function openaiWhisper(audioBase64: string, prompt?: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const boundary = `FormBoundary${Date.now()}`;
  const parts: Buffer[] = [
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\nhe\r\n`),
  ];
  if (prompt) parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}\r\n`));
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`));
  parts.push(audioBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const formBody = Buffer.concat(parts);

  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/audio/transcriptions', method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formBody.length,
      },
    }, res => {
      let data = '';
      res.on('data', (c: string) => { data += c; });
      res.on('end', () => { try { resolve(JSON.parse(data).text ?? null); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(formBody); req.end();
  });
}

async function openaiChat(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const body = JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 150, temperature: 0.7 });
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', (c: string) => { data += c; });
      res.on('end', () => { try { resolve(JSON.parse(data).choices?.[0]?.message?.content ?? null); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

function strAccuracy(transcript: string, target: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[.,!?״"']/g, '').trim();
  const a = clean(transcript).split(/\s+/);
  const b = clean(target).split(/\s+/);
  const hits = a.filter(w => b.includes(w)).length;
  return Math.min(100, Math.round((hits / Math.max(b.length, 1)) * 100));
}

// Quiz lessons aggregate vocab from their unit's regular lessons
const QUIZ_SOURCES: Record<string, string[]> = {
  'he-4':  ['he-1', 'he-2', 'he-3'],
  'he-8':  ['he-5', 'he-6', 'he-7'],
  'he-12': ['he-9', 'he-10', 'he-11'],
  'he-16': ['he-13', 'he-14', 'he-15'],
  'he-20': ['he-17', 'he-18', 'he-19'],
};

function toVocab(lessonId: string): VocabItem[] {
  const entries = LESSON_VOCAB[lessonId] ?? [];
  const sources = entries.length === 0 ? (QUIZ_SOURCES[lessonId] ?? []) : [];
  const all = entries.length > 0 ? entries : sources.flatMap(src => LESSON_VOCAB[src] ?? []);
  return all.map(e => ({
    word: e.front, translation: e.back, transliteration: e.transliteration,
    gender: e.gender, example: e.example, exampleAr: e.exampleAr,
  }));
}

function updateReviewQuestProgress(count: number) {
  ensureDailyQuests();
  state.todayReviewedCards += count;
  for (const q of state.dailyQuests) {
    if (q.completed || q.type !== 'review_flashcards') continue;
    q.progress = Math.min(state.todayReviewedCards, q.target);
    if (q.progress >= q.target) {
      q.completed = true;
      state.xp += q.xpReward;
      state.weeklyXp += q.xpReward;
      state.gems += q.gemsReward;
    }
  }
}

// ── Data Generators ───────────────────────────────────────────────
function generateCalendar() {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const active = i >= 23 || (i >= 10 && (i % 3 !== 0));
    return { date: d.toISOString().split('T')[0], active, xp: active ? Math.floor(Math.random() * 80) + 20 : 0 };
  });
}

function generateWeeklyProgress() {
  return ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => ({
    day,
    xp: Math.floor(Math.random() * 80) + 10,
    lessons: Math.floor(Math.random() * 3) + 1,
  }));
}

function generateSkillRadar() {
  return [
    { subject: 'عربي',    score: 78 },
    { subject: 'رياضيات', score: 65 },
    { subject: 'عبري',    score: 45 },
    { subject: 'إنجليزي', score: 82 },
  ];
}

function generateActivities() {
  const now = Date.now();
  return [
    { id: 'a1', type: 'LESSON_COMPLETE',    lessonTitle: 'الحروف الهجائية', subject: 'عربي',    score: 90, xpEarned: 15, timestamp: new Date(now - 30 * 60000).toISOString() },
    { id: 'a2', type: 'LESSON_COMPLETE',    lessonTitle: 'الجمع البسيط',    subject: 'رياضيات', score: 75, xpEarned: 10, timestamp: new Date(now - 120 * 60000).toISOString() },
    { id: 'a3', type: 'ACHIEVEMENT_UNLOCK', achievement: 'الخطوة الأولى', timestamp: new Date(now - 180 * 60000).toISOString() },
  ];
}

function generateHomeworkResult(id: string) {
  return {
    id, status: 'COMPLETED',
    assignmentTitle: 'واجب رياضيات — الجمع والطرح',
    subject: 'رياضيات', gradeLevel: 3, studentName: 'أحمد محمد',
    score: 80,
    overallFeedback: 'أداء جيد جداً! استمر في الممارسة لتحسين سرعتك في الحل.',
    questions: [
      { question: '٥ + ٣ = ؟',   studentAnswer: '٨',  isCorrect: true,  feedback: 'إجابة صحيحة!' },
      { question: '١٢ - ٧ = ؟',  studentAnswer: '٤',  isCorrect: false, feedback: 'الإجابة الصحيحة هي ٥' },
      { question: '٦ + ٤ = ؟',   studentAnswer: '١٠', isCorrect: true,  feedback: 'ممتاز!' },
      { question: '٩ - ٣ = ؟',   studentAnswer: '٦',  isCorrect: true,  feedback: 'صحيح!' },
      { question: '٨ + ٢ = ؟',   studentAnswer: '٩',  isCorrect: false, feedback: 'الإجابة الصحيحة هي ١٠' },
    ],
  };
}

function generateHomeworkHistory() {
  return [
    { id: 'hw-1', assignmentTitle: 'واجب رياضيات',    subject: 'رياضيات', score: 80, status: 'COMPLETED', submittedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'hw-2', assignmentTitle: 'قراءة عربية',      subject: 'عربي',    score: 95, status: 'COMPLETED', submittedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'hw-3', assignmentTitle: 'الأشكال الهندسية', subject: 'رياضيات', score: 70, status: 'COMPLETED', submittedAt: new Date(Date.now() - 259200000).toISOString() },
  ];
}

function generateAdminChartData() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toISOString().split('T')[0], dau: Math.floor(Math.random() * 50) + 60, mau: Math.floor(Math.random() * 100) + 380 };
  });
}

function generateAdminUsers() {
  const users = [
    { firstName: 'محمد', lastName: 'أحمد',   role: 'ADMIN' },
    { firstName: 'سارة', lastName: 'خالد',   role: 'STUDENT' },
    { firstName: 'يوسف', lastName: 'عمر',    role: 'STUDENT' },
    { firstName: 'ليلى', lastName: 'إبراهيم', role: 'STUDENT' },
    { firstName: 'كريم', lastName: 'منصور',   role: 'STUDENT' },
    { firstName: 'نور',  lastName: 'حسين',   role: 'STUDENT' },
    { firstName: 'طارق', lastName: 'علي',    role: 'PARENT' },
    { firstName: 'رنا',  lastName: 'جمال',   role: 'PARENT' },
  ];
  return users.map((u, i) => ({
    id: `user-${i + 1}`, ...u,
    phone: `050${String(1234567 + i).padStart(7, '0')}`,
    email: `user${i + 1}@school.edu`,
    xp: Math.floor(Math.random() * 1000),
    gems: Math.floor(Math.random() * 500),
    streak: Math.floor(Math.random() * 30),
    createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
  }));
}

function mockQuestions(lessonId: string) {
  return [
    {
      id: `${lessonId}-q1`, type: 'MULTIPLE_CHOICE', difficulty: 1, order: 1,
      content: { questionText: 'أيّ من الخيارات التالية صحيح؟', options: [
        { id: 'a', text: 'الخيار الأول' }, { id: 'b', text: 'الخيار الثاني' },
        { id: 'c', text: 'الخيار الثالث' }, { id: 'd', text: 'الخيار الرابع' },
      ]},
      correctAnswer: { selectedOptionIds: ['b'] },
      explanation: 'الخيار الثاني هو الإجابة الصحيحة.',
    },
    {
      id: `${lessonId}-q2`, type: 'TRUE_FALSE', difficulty: 1, order: 2,
      content: { statement: 'الشمس تشرق من الشرق وتغرب في الغرب.' },
      correctAnswer: { isTrue: true },
      explanation: 'نعم، الشمس تشرق من الشرق وتغرب في الغرب.',
    },
    {
      id: `${lessonId}-q3`, type: 'MULTIPLE_CHOICE', difficulty: 2, order: 3,
      content: { questionText: 'كم عدد أيام الأسبوع؟', options: [
        { id: 'a', text: '٥ أيام' }, { id: 'b', text: '٦ أيام' },
        { id: 'c', text: '٧ أيام' }, { id: 'd', text: '٨ أيام' },
      ]},
      correctAnswer: { selectedOptionIds: ['c'] },
      explanation: 'الأسبوع يتكون من ٧ أيام.',
    },
    {
      id: `${lessonId}-q4`, type: 'MATCHING', difficulty: 2, order: 4,
      content: {
        questionText: 'طابق كل كلمة مع معناها:',
        pairs: [
          { id: 'p1', right: 'كلب',  left: 'حيوان أليف' },
          { id: 'p2', right: 'شمس',  left: 'نجم يضيء النهار' },
          { id: 'p3', right: 'ماء',  left: 'سائل للشرب' },
          { id: 'p4', right: 'شجرة', left: 'نبات كبير' },
        ],
      },
      correctAnswer: { pairs: [['p1', 'p1'], ['p2', 'p2'], ['p3', 'p3'], ['p4', 'p4']] },
      explanation: 'كل كلمة تطابق تعريفها الصحيح.',
    },
    {
      id: `${lessonId}-q5`, type: 'SHORT_ANSWER', difficulty: 2, order: 5,
      content: { questionText: 'اكتب كلمة تبدأ بحرف "أ":' },
      correctAnswer: { accepted: ['أسد', 'أرنب', 'أحمد', 'أم', 'أب', 'أخ', 'أخت', 'أمل', 'أيام'] },
      explanation: 'أي كلمة تبدأ بحرف الألف.',
    },
  ];
}

function buildLearningPath(subjectId: string, gradeLevel: number) {
  // Extract subject keyword from subjectId like 'sub-arabic' → 'arabic'
  const subjectKey = subjectId.replace(/^sub-/, '');
  // Try real loader first (q112 data)
  const loaderSections = loaderGetSections(subjectKey, gradeLevel);
  if (loaderSections.length > 0) {
    const subjectName = SUBJECTS.find(s => s.id === subjectId)?.name ?? 'مادة';
    const allLessons = loaderSections.flatMap(sec => buildLessonsForSection(subjectKey, gradeLevel, sec.index));
    const nodes = allLessons.map((l, i) => {
      const done = state.completedLessons.has(l.id);
      const prevLesson = i > 0 ? allLessons[i - 1] : null;
      const prevDone = prevLesson ? state.completedLessons.has(prevLesson.id) : false;
      const isNewUnit = i > 0 && l.unit !== prevLesson?.unit;
      let isUnlocked: boolean;
      let unitLocked = false;
      if (i === 0) { isUnlocked = true; }
      else if (isNewUnit) {
        const prevScore = state.lessonScores[prevLesson!.id];
        isUnlocked = prevScore !== undefined && prevScore >= 70;
        unitLocked = !isUnlocked;
      } else { isUnlocked = prevDone || done; }
      const isCurrent = isUnlocked && !done && (i === 0 || prevDone);
      return {
        id: `node-${l.id}`, lesson: { id: l.id, title: l.title, description: null, content: l.title, gradeId: `grade-${subjectId}`, order: l.order, type: l.type, durationMin: l.type === 'QUIZ' ? 15 : 8 },
        snakePathOrder: i + 1, status: done ? 'COMPLETED' : isUnlocked ? 'UNLOCKED' : 'LOCKED',
        score: state.lessonScores[l.id] ?? null, isUnlocked, isCurrent, unitLocked,
      };
    });
    if (!nodes.some(n => n.isCurrent) && nodes.length > 0) nodes[0].isCurrent = true;
    return { id: `${subjectId}-${gradeLevel}-path`, subjectName, gradeLevel, nodes };
  }

  // Fallback: old LESSONS_BY_SUBJECT data
  const gradeKey = `${subjectId}-${gradeLevel}`;
  const allLessons = LESSONS_BY_SUBJECT[gradeKey] ?? LESSONS_BY_SUBJECT[subjectId] ?? LESSONS_BY_SUBJECT['sub-math'];
  const subjectName = SUBJECTS.find(s => s.id === subjectId)?.name ?? 'مادة';

  const nodes = allLessons.map((l, i) => {
    const done = state.completedLessons.has(l.id);
    const isFirst = i === 0;
    const prevLesson = i > 0 ? allLessons[i - 1] : null;
    const prevDone = prevLesson ? state.completedLessons.has(prevLesson.id) : false;

    // Detect unit boundary: first lesson of a new unit
    const isNewUnit = !isFirst && l.unit && prevLesson?.unit && l.unit !== prevLesson.unit;

    let isUnlocked: boolean;
    let unitLocked = false;

    if (isFirst) {
      isUnlocked = true;
    } else if (isNewUnit) {
      // Gate: previous unit's last lesson must score ≥ 70
      const prevUnitQuizScore = state.lessonScores[prevLesson!.id];
      isUnlocked = prevUnitQuizScore !== undefined && prevUnitQuizScore >= 70;
      unitLocked = !isUnlocked;
    } else {
      isUnlocked = prevDone || done;
    }

    // Is this the last lesson of its unit? (= quiz / gate lesson)
    const isQuiz = l.unit && (i === allLessons.length - 1 || allLessons[i + 1].unit !== l.unit);

    const isCurrent = isUnlocked && !done && (isFirst || prevDone);

    return {
      id: `node-${l.id}`,
      lesson: {
        id: l.id, title: l.title, description: null, content: l.title,
        gradeId: `grade-${subjectId}`, order: l.order,
        type: isQuiz ? 'QUIZ' : 'REGULAR', durationMin: 5,
      },
      snakePathOrder: i + 1,
      status: done ? 'COMPLETED' : isUnlocked ? 'UNLOCKED' : 'LOCKED',
      score: state.lessonScores[l.id] !== undefined ? state.lessonScores[l.id] : null,
      isUnlocked,
      isCurrent,
      unitLocked,
    };
  });

  if (!nodes.some(n => n.isCurrent) && nodes.length > 0) nodes[0].isCurrent = true;
  return { id: `${subjectId}-${gradeLevel}-path`, subjectName, gradeLevel, nodes };
}

// ── Simple Router ─────────────────────────────────────────────────
type Handler = (params: Record<string, string>, body: any, query: Record<string, string>) => [number, any] | Promise<[number, any]>;

function matchRoute(method: string, url: string, handlers: { m: string; re: RegExp; keys: string[]; fn: Handler }[]) {
  for (const h of handlers) {
    if (h.m !== method && h.m !== '*') continue;
    const m = url.match(h.re);
    if (!m) continue;
    const params: Record<string, string> = {};
    h.keys.forEach((k, i) => { params[k] = m[i + 1]; });
    return { fn: h.fn, params };
  }
  return null;
}

function route(method: string, pattern: string, fn: Handler) {
  const keys: string[] = [];
  const re = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '(?:\\?.*)?$');
  return { m: method, re, keys, fn };
}

const ROUTES = [
  // ── Auth ──────────────────────────────────────────────────────
  route('POST', '/auth/login', (_, body) => {
    if (!body?.phone || !body?.password) return [400, { message: 'بيانات ناقصة' }];
    // Phone starting with 055 → simulate parent login for testing
    const isParent = String(body.phone).startsWith('055');
    const user = isParent
      ? { id: 'mock-parent-1', firstName: 'محمد', lastName: 'حلبي', phone: body.phone, email: 'parent@mock.dev', role: 'PARENT', gradeLevel: 0 }
      : FAKE_USER;
    return [200, { access_token: 'mock-dev-token-2025', user }];
  }),
  route('POST', '/auth/register', (_, body) => [201, { access_token: 'mock-dev-token-2025', user: { ...FAKE_USER, ...body } }]),
  route('POST', '/auth/logout', () => [200, { success: true }]),

  // ── Curriculum ────────────────────────────────────────────────
  route('GET', '/curriculum/stats', () => [200, loaderGetStats()]),
  route('GET', '/curriculum/subjects/visuals', () => {
    const GRADIENTS: Record<string, string> = {
      'عربي':     'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'عبري':     'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      'رياضيات': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      'إنجليزي': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      'علوم':     'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    };
    return [200, Object.fromEntries(
      SUBJECTS.map(s => [s.name, { type: 'gradient', value: GRADIENTS[s.name] ?? 'linear-gradient(135deg,#1A1F5E,#3B4CB8)' }])
    )];
  }),
  route('GET', '/curriculum/subjects', () => [200, SUBJECTS.map(s => {
    const subjectKey = s.id.replace(/^sub-/, '');
    const loaderSecs = loaderGetSections(subjectKey, FAKE_USER.gradeLevel);
    const loaderLessonCount = loaderSecs.reduce((sum, sec) => sum + sec.lessonCount, 0);
    const lessonCount = loaderLessonCount > 0 ? loaderLessonCount : (LESSONS_BY_SUBJECT[s.id] ?? []).length;
    const oldLessons = LESSONS_BY_SUBJECT[s.id] ?? [];
    const done = oldLessons.filter(l => state.completedLessons.has(l.id)).length;
    const masteryPercent = lessonCount > 0 ? Math.round((done / lessonCount) * 100) : 0;
    return { ...s, lessonCount, masteryPercent };
  })]),
  route('GET', '/curriculum/subjects/:id', ({ id }) => {
    const s = SUBJECTS.find(x => x.id === id);
    return s ? [200, s] : [404, { message: 'غير موجود' }];
  }),
  route('GET', '/curriculum/path/:subjectId/:gradeLevel', ({ subjectId, gradeLevel }) =>
    [200, buildLearningPath(subjectId, parseInt(gradeLevel))]),
  route('GET', '/curriculum/lessons/:lessonId/play', ({ lessonId }) => {
    // Try q112 loader first (format: "arabic-1-s0-l3" or "sub-arabic-1-s0-l3")
    const parsed = parseLessonId(lessonId);
    if (parsed) {
      const { subject, grade, sectionIdx, lessonNum } = parsed;
      const isQuiz = isQuizLesson(subject, grade, sectionIdx, lessonNum);
      const questions = isQuiz
        ? loaderGetQuiz(subject, grade, sectionIdx)
        : loaderGetLesson(subject, grade, sectionIdx, lessonNum);
      if (questions.length > 0) {
        const sections = loaderGetSections(subject, grade);
        const secName = sections[sectionIdx]?.displayName ?? 'درس';
        const title = isQuiz ? `اختبار: ${secName}` : `درس ${lessonNum}: ${secName}`;
        return [200, { id: lessonId, title, description: null, content: title, gradeId: `grade-${subject}-${grade}`, order: lessonNum, type: isQuiz ? 'QUIZ' : 'REGULAR', durationMin: isQuiz ? 15 : 8, questions }];
      }
    }
    // Grade-1 Arabic lessons have pre-built questions
    const title = Object.values(LESSONS_BY_SUBJECT).flat().find(l => l.id === lessonId)?.title ?? 'درس تجريبي';
    if (GRADE1_ARABIC_QUESTIONS[lessonId]) {
      const questions = GRADE1_ARABIC_QUESTIONS[lessonId];
      return [200, { id: lessonId, title, description: null, content: title, gradeId: 'mock-grade-arabic-1', order: 1, type: 'REGULAR', durationMin: 8, questions }];
    }
    if (HEB2_QUESTIONS[lessonId]) {
      const questions = HEB2_QUESTIONS[lessonId];
      const durationMin = (questions.length <= 7) ? 12 : (questions.length <= 9) ? 18 : 25;
      return [200, { id: lessonId, title, description: null, content: title, gradeId: 'mock-grade-hebrew-2', order: 1, type: 'REGULAR', durationMin, questions }];
    }
    if (ALL_NEW_QUESTIONS[lessonId]) {
      const questions = ALL_NEW_QUESTIONS[lessonId];
      const isLegacyQuiz = lessonId.endsWith('-l10');
      return [200, { id: lessonId, title, description: null, content: title, gradeId: 'mock-grade', order: 1, type: isLegacyQuiz ? 'QUIZ' : 'REGULAR', durationMin: isLegacyQuiz ? 20 : 8, questions }];
    }
    const vocab = toVocab(lessonId);
    const questions = vocab.length > 0 ? generateExercises(lessonId, vocab) : mockQuestions(lessonId);
    return [200, { id: lessonId, title, description: null, content: title, gradeId: 'mock-grade', order: 1, type: 'REGULAR', durationMin: 5, questions }];
  }),
  route('POST', '/curriculum/lessons/:lessonId/complete', ({ lessonId }, body) => {
    const isNew = !state.completedLessons.has(lessonId);
    state.completedLessons.add(lessonId);
    const score = typeof body?.score === 'number' ? body.score : 0;
    const correctAnswers = typeof body?.correctAnswers === 'number' ? body.correctAnswers : 0;
    const totalQuestions = typeof body?.totalQuestions === 'number' ? body.totalQuestions : 1;
    state.lessonScores[lessonId] = score;
    state.todayStudyMinutes += 10; // approximate

    // XP/Gems — detect quiz via loader (last lesson of each section) or legacy -l10 pattern
    const parsed = parseLessonId(lessonId);
    const isQuiz = parsed
      ? isQuizLesson(parsed.subject, parsed.grade, parsed.sectionIdx, parsed.lessonNum)
      : lessonId.endsWith('-l10');
    const baseXP  = isQuiz ? 50 : 15;
    const bonusXP = score === 100 ? 25 : 0;
    const baseGems = isQuiz ? 25 : 3;
    const bonusGems = score === 100 ? 8 : 0;
    const earnedXP = baseXP + bonusXP + (correctAnswers * 2);
    const earnedGems = isNew ? baseGems + bonusGems : 0;

    state.xp += earnedXP; state.weeklyXp += earnedXP; state.dailyXp += earnedXP;
    state.gems += earnedGems;
    if (state.xp >= state.level * 200) state.level++;
    updateQuestProgress(correctAnswers, score);

    // Unit completion bonus + find next lesson
    let unitUnlocked = false;
    let unlockedUnitName: string | undefined;
    let unitGemsBonus = 0;
    let nextLessonId: string | undefined;
    const seenArrays = new Set<object>();
    for (const lessons of Object.values(LESSONS_BY_SUBJECT)) {
      if (seenArrays.has(lessons)) continue;
      seenArrays.add(lessons);
      const idx = lessons.findIndex(l => l.id === lessonId);
      if (idx === -1) continue;
      const cur = lessons[idx];
      const nxt = lessons[idx + 1];
      if (nxt) {
        nextLessonId = nxt.id;
        if (cur.unit && nxt.unit && nxt.unit !== cur.unit && score >= 70) {
          unitUnlocked = true;
          unlockedUnitName = nxt.unit;
          if (isNew) { unitGemsBonus = 100; state.gems += 100; }
        }
      }
      break;
    }

    saveState();
    return [200, { success: true, score, earnedXP, earnedGems: earnedGems + unitGemsBonus, unitUnlocked, unlockedUnitName, nextLessonId }];
  }),

  // ── Metzav ───────────────────────────────────────────────────
  route('GET', '/metzav/info', () => {
    const grade = state.metzavGradeOverride ?? FAKE_USER.gradeLevel;
    const dateStr = state.metzavDateOverride ?? getMetzavDate(grade);
    if (!dateStr) return [200, { applicable: false }];
    const days = computeDays(dateStr);
    const urgency: 'green' | 'orange' | 'red' = days < 30 ? 'red' : days < 60 ? 'orange' : 'green';
    return [200, {
      applicable: true,
      gradeLevel: grade,
      date: dateStr,
      daysRemaining: Math.max(0, days),
      urgency,
      intensiveMode: days < 30,
      progressPct: schoolYearProgress(dateStr),
    }];
  }),
  route('POST', '/metzav/simulate', (_, body) => {
    if (body?.date)       state.metzavDateOverride = body.date;
    if (body?.gradeLevel) state.metzavGradeOverride = Number(body.gradeLevel);
    return [200, { ok: true }];
  }),
  route('DELETE', '/metzav/simulate', () => {
    state.metzavDateOverride = null; state.metzavGradeOverride = null;
    return [200, { ok: true }];
  }),

  // ── Flashcards ────────────────────────────────────────────────
  route('GET', '/flashcards', () => {
    const today = new Date().toISOString().split('T')[0];
    const due = state.flashcards.filter(c => c.dueDate <= today).length;
    return [200, { cards: state.flashcards, dueCount: due }];
  }),
  route('GET', '/flashcards/due', () => {
    const today = new Date().toISOString().split('T')[0];
    const due = state.flashcards
      .filter(c => c.dueDate <= today)
      .slice(0, 10);
    return [200, { cards: due, total: due.length }];
  }),
  route('GET', '/flashcards/stats', () => {
    const today = new Date().toISOString().split('T')[0];
    const total = state.flashcards.length;
    const dueToday = state.flashcards.filter(c => c.dueDate <= today).length;
    return [200, { total, dueToday, todayReviewed: state.todayReviewedCards }];
  }),
  route('POST', '/flashcards/add-lesson/:lessonId', ({ lessonId }) => {
    if (state.addedLessons.has(lessonId)) return [200, { added: 0, message: 'already added' }];
    const vocab = LESSON_VOCAB[lessonId] ?? [];
    if (!vocab.length) return [200, { added: 0 }];
    const today = new Date().toISOString().split('T')[0];
    const newCards: FlashcardEntry[] = vocab.map((v, i) => ({
      id: `fc-${lessonId}-${i}`,
      lessonId,
      front: v.front,
      back: v.back,
      transliteration: v.transliteration,
      dueDate: today,
      interval: 1,
      repetitions: 0,
    }));
    state.flashcards.push(...newCards);
    state.addedLessons.add(lessonId);
    return [200, { added: newCards.length, total: state.flashcards.length }];
  }),
  route('POST', '/flashcards/review', (_, body) => {
    const { cardId, difficulty } = body ?? {};
    const card = state.flashcards.find(c => c.id === cardId);
    if (!card) return [404, { message: 'Card not found' }];
    const diff = (['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium') as Difficulty;
    card.dueDate = nextDueDate(diff);
    card.interval = HLR_DAYS[diff];
    card.repetitions++;
    updateReviewQuestProgress(1);
    return [200, { id: card.id, nextDueDate: card.dueDate, interval: card.interval }];
  }),

  // ── Gamification: Daily Quests ───────────────────────────────
  route('GET', '/gamification/quests/daily', () => {
    ensureDailyQuests();
    const allCompleted = state.dailyQuests.every(q => q.completed);
    return [200, {
      quests: state.dailyQuests,
      allCompleted,
      bonusClaimed: state.allQuestsBonusClaimed,
      bonusGems: 50,
    }];
  }),
  route('POST', '/gamification/quests/daily/claim-bonus', () => {
    ensureDailyQuests();
    if (!state.dailyQuests.every(q => q.completed))
      return [400, { message: 'لم تكتمل جميع المهام بعد' }];
    if (state.allQuestsBonusClaimed)
      return [400, { message: 'تم استلام المكافأة بالفعل' }];
    state.allQuestsBonusClaimed = true;
    state.gems += 50;
    return [200, { success: true, bonusGems: 50, message: '🎉 مبروك! حصلت على ٥٠ جوهرة إضافية!' }];
  }),

  // ── Gamification: Hearts ──────────────────────────────────────
  route('GET', '/gamification/hearts', () => [200, {
    hearts: state.hearts, maxHearts: state.maxHearts,
    nextRegenerationAt: state.hearts < state.maxHearts ? new Date(Date.now() + 25 * 60000).toISOString() : null,
  }]),
  route('POST', '/gamification/hearts/deplete', () => {
    if (state.hearts > 0) state.hearts--;
    return [200, { hearts: state.hearts, maxHearts: state.maxHearts }];
  }),
  route('POST', '/gamification/hearts/refill', () => {
    if (state.gems >= 100) { state.gems -= 100; state.hearts = state.maxHearts; }
    return [200, { hearts: state.hearts, maxHearts: state.maxHearts }];
  }),

  // ── Gamification: XP ─────────────────────────────────────────
  route('GET', '/gamification/xp', () => [200, { totalXp: state.xp, weeklyXp: state.weeklyXp, level: state.level }]),
  route('POST', '/gamification/xp/award', (_, body) => {
    const amount = (body?.amount ?? 10) * (state.xpBoostActive ? 2 : 1);
    state.xp += amount; state.weeklyXp += amount; state.dailyXp += amount;
    if (state.xp >= state.level * 200) state.level++;
    return [200, { totalXp: state.xp, weeklyXp: state.weeklyXp, level: state.level }];
  }),

  // ── Gamification: Streak ──────────────────────────────────────
  route('GET', '/gamification/streak', () => {
    const today = new Date().toISOString().split('T')[0];
    const streakAtRisk = state.lastActivityDate !== '' && state.lastActivityDate !== today && state.streak > 0;
    return [200, {
      streak: state.streak,
      hasFreeze: state.hasStreakFreeze,
      streakAtRisk,
      longestStreak: Math.max(state.streak, 12),
      brokenStreak: state.brokenStreakValue > 0 ? state.brokenStreakValue : null,
    }];
  }),
  route('POST', '/gamification/streak/activity', () => {
    const today = new Date().toISOString().split('T')[0];
    const MILESTONES = [3, 7, 14, 30, 60, 100];

    // Only advance streak once per day
    if (state.lastActivityDate === today) {
      return [200, { streak: state.streak, milestone: null, whatsappSent: false }];
    }

    // Detect streak break: last activity was more than 1 day ago (not yesterday)
    if (state.lastActivityDate) {
      const last = new Date(state.lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate.getTime() - last.getTime()) / 86400000);
      if (diffDays > 1) {
        if (state.hasStreakFreeze && state.streak > 0) {
          state.hasStreakFreeze = false;
        } else {
          state.brokenStreakValue = state.streak;
          state.streak = 0;
        }
      }
    }

    state.streak++;
    state.lastActivityDate = today;
    state.brokenStreakValue = 0;

    const milestone = MILESTONES.includes(state.streak) ? state.streak : null;
    const whatsappSent = [7, 30].includes(state.streak);

    saveState();
    return [200, { streak: state.streak, milestone, whatsappSent }];
  }),
  route('POST', '/gamification/streak/repair', () => {
    if (state.gems < 200) return [400, { message: 'جواهر غير كافية لإصلاح السلسلة (200 جوهرة)' }];
    if (!state.brokenStreakValue) return [400, { message: 'لا توجد سلسلة مكسورة للإصلاح' }];
    state.gems -= 200;
    state.streak = state.brokenStreakValue;
    state.brokenStreakValue = 0;
    state.lastActivityDate = new Date().toISOString().split('T')[0];
    return [200, { success: true, streak: state.streak, message: 'تم إصلاح سلسلتك! 🔥' }];
  }),
  route('POST', '/gamification/streak/simulate-break', () => {
    state.brokenStreakValue = state.streak;
    state.streak = 0;
    state.lastActivityDate = '';
    return [200, { success: true, brokenStreak: state.brokenStreakValue }];
  }),
  route('GET', '/gamification/streak/calendar', () => [200, {
    streak: state.streak,
    calendar: generateCalendar(),
    longestStreak: Math.max(state.streak, 12),
  }]),

  // ── Gamification: Gems ────────────────────────────────────────
  route('GET', '/gamification/gems', () => [200, { gems: state.gems }]),

  // ── Gamification: League ──────────────────────────────────────
  route('GET', '/gamification/league', () => {
    const all = [
      ...LEAGUE_OTHERS,
      { id: 'mock-user-1', name: FAKE_USER.firstName, avatar: FAKE_USER.firstName.charAt(0), xp: state.weeklyXp, isCurrentUser: true },
    ].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));

    const userRank = all.find(p => p.id === 'mock-user-1')?.rank ?? 5;
    const league = userRank <= 3 ? 'GOLD' : userRank <= 6 ? 'SILVER' : 'BRONZE';
    return [200, {
      league,
      leagueName: league === 'GOLD' ? 'الذهبية' : league === 'SILVER' ? 'الفضية' : 'البرونزية',
      leagueColor: league === 'GOLD' ? '#FFD700' : league === 'SILVER' ? '#C0C0C0' : '#CD7F32',
      weeklyXp: state.weeklyXp,
      rank: userRank,
      participants: all,
      promotionZone: 3,
      demotionZone: 8,
      daysLeft: 4,
      totalParticipants: all.length,
    }];
  }),

  // ── Gamification: Achievements ────────────────────────────────
  route('GET', '/gamification/achievements', () => {
    const count = state.completedLessons.size;
    return [200, ACHIEVEMENTS_DEF.map(a => {
      const progress =
        a.category === 'lessons'  ? count :
        a.category === 'streak'   ? state.streak :
        a.category === 'xp'       ? state.xp :
        a.category === 'gems'     ? state.gems :
        a.category === 'subject'  ? Math.min(count, a.target) :
        a.category === 'accuracy' ? (count > 0 ? 1 : 0) : 0;
      return { ...a, progress, isUnlocked: progress >= a.target };
    })];
  }),
  route('POST', '/gamification/achievements/check', () => [200, { newlyUnlocked: [] }]),

  // ── Gamification: Daily Goal ──────────────────────────────────
  route('GET', '/gamification/daily-goal', () => [200, {
    target: state.dailyGoalTarget,
    current: Math.min(state.dailyXp, state.dailyGoalTarget),
    completed: state.dailyXp >= state.dailyGoalTarget,
  }]),
  route('POST', '/gamification/daily-goal/set', (_, body) => {
    state.dailyGoalTarget = body?.target ?? 50;
    return [200, { target: state.dailyGoalTarget }];
  }),

  // ── Shop ──────────────────────────────────────────────────────
  route('GET', '/shop/items', () => [200, SHOP_ITEMS.map(item => ({
    ...item, canAfford: state.gems >= item.cost || (item as any).isFree,
  }))]),
  route('POST', '/shop/purchase', (_, body) => {
    const { itemId } = body ?? {};
    if (itemId === 'hearts-refill') {
      if (state.gems < 350) return [400, { message: 'جواهر غير كافية' }];
      state.gems -= 350; state.hearts = state.maxHearts;
      return [200, { success: true, message: 'تم إعادة ملء القلوب! ❤️' }];
    }
    if (itemId === 'streak-freeze') {
      if (state.gems < 200) return [400, { message: 'جواهر غير كافية' }];
      state.gems -= 200; state.hasStreakFreeze = true;
      return [200, { success: true, message: 'تم تفعيل تجميد السلسلة! ❄️' }];
    }
    if (itemId === 'xp-boost') {
      if (state.gems < 400) return [400, { message: 'جواهر غير كافية' }];
      state.gems -= 400; state.xpBoostActive = true;
      return [200, { success: true, message: 'تم تفعيل مضاعف XP لمدة ساعة! ⚡' }];
    }
    if (itemId === 'gems-bonus') {
      state.gems += 100;
      return [200, { success: true, message: 'تمت إضافة ١٠٠ جوهرة! 💎' }];
    }
    return [404, { message: 'عنصر غير موجود' }];
  }),

  // ── User Profile ──────────────────────────────────────────────
  route('GET', '/user/profile', () => [200, {
    ...FAKE_USER,
    xp: state.xp, level: state.level, streak: state.streak,
    gems: state.gems, hearts: state.hearts, weeklyXp: state.weeklyXp,
    completedLessons: state.completedLessons.size,
    joinedAt: '2025-09-01',
    longestStreak: Math.max(state.streak, 12),
  }]),

  // ── Explanation (AI Tutor) ────────────────────────────────────
  route('GET', '/explanation', () => [200, {
    explanation: 'هذا شرح تجريبي للمفهوم المطلوب. في النسخة الكاملة سيتم توليد شرح مخصص بالذكاء الاصطناعي.',
    examples: ['مثال أول على المفهوم', 'مثال ثاني على المفهوم'],
    tips: ['تذكّر أن تراجع هذا الدرس يومياً', 'حاول تطبيق ما تعلمته في حياتك اليومية'],
  }]),

  // ── Notifications ─────────────────────────────────────────────
  route('GET', '/notifications', () => [200, [
    { id: 'n1', title: 'سلسلتك في خطر! 🔥', body: 'أكمل درسًا اليوم للحفاظ على سلسلتك', type: 'STREAK', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n2', title: 'درس جديد متاح 📚', body: 'تم إضافة درس جديد في الرياضيات', type: 'LESSON', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'n3', title: 'إنجاز جديد! 🏆', body: 'حصلت على إنجاز "الخطوة الأولى"', type: 'ACHIEVEMENT', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]]),
  route('PATCH', '/notifications/:id/read', () => [200, { success: true }]),
  route('PATCH', '/notifications/read-all', () => [200, { success: true }]),

  // ── Homework ─────────────────────────────────────────────────
  route('POST', '/homework/submit', () => [201, { homeworkId: `hw-${Date.now()}` }]),
  route('GET', '/homework/history', () => [200, generateHomeworkHistory()]),
  route('GET', '/homework/status/:id', ({ id }) => [200, generateHomeworkResult(id)]),

  // ── Parents ──────────────────────────────────────────────────
  route('GET', '/parents/children', () => {
    const linked = FAKE_CHILDREN_POOL.filter(c => state.linkedChildrenIds.includes(c.id));
    return [200, linked];
  }),
  route('POST', '/parents/children/link', (_, body) => {
    const phone = String(body?.phone ?? '').replace(/\s|-/g, '');
    const found = FAKE_CHILDREN_POOL.find(c => c.phone === phone);
    if (!found) return [404, { message: 'لم يُعثر على طالب بهذا الرقم' }];
    if (state.linkedChildrenIds.includes(found.id)) return [409, { message: 'هذا الطفل مربوط مسبقاً' }];
    state.linkedChildrenIds.push(found.id);
    return [201, { success: true, child: found }];
  }),
  route('GET', '/parents/children/:childId/progress', () => [200, { totalLessons: 8, completedLessons: 5, avgScore: 78 }]),
  route('GET', '/parents/children/:childId/weekly-report', () => [200, { week: generateWeeklyProgress() }]),
  route('GET', '/parents/children/:childId/today-summary', () => [200, { totalActivities: 3, totalDurationMinutes: 25, averageScore: 78, completedLessons: 2 }]),
  route('GET', '/parents/children/:childId/weekly-progress', () => [200, generateWeeklyProgress()]),
  route('GET', '/parents/children/:childId/skill-radar', () => [200, generateSkillRadar()]),
  route('GET', '/parents/children/:childId/activities', () => [200, generateActivities()]),
  route('GET', '/parents/stats', () => [200, { totalSessions: 15, avgScore: 76, streak: 7 }]),

  // Parent: weekly report
  route('GET', '/parents/children/:childId/report', ({ childId }) => {
    const child = FAKE_CHILDREN.find(c => c.id === childId) ?? FAKE_CHILDREN[0];
    const now = Date.now();
    const weekStart = new Date(now - 7 * 86400000).toLocaleDateString('ar', { month: 'short', day: 'numeric' });
    const weekEnd   = new Date(now).toLocaleDateString('ar', { month: 'short', day: 'numeric' });
    return [200, {
      childName: child.firstName,
      weekLabel: `${weekStart} — ${weekEnd}`,
      daysStudied: child.studiedToday ? 5 : 3,
      totalMinutes: child.todayDurationMinutes * (child.studiedToday ? 5 : 3) + 15,
      lessonsCompleted: child.studiedToday ? 8 : 4,
      avgScore: child.lastActivity.score,
      bestSubject: { name: child.lastActivity.subject, score: child.lastActivity.score },
      weakSubject: { name: child.studiedToday ? 'وحدة الأسرة' : 'العبري', score: 61 },
      streak: child.streak,
      gemsEarned: child.weeklyXp > 200 ? 156 : 80,
      weeklyXp: child.weeklyXp,
      comparedToLastWeek: { minutesDelta: 15, scoreDelta: 4 },
      recommendation: 'ركّز على وحدة الأسرة في العبري لتحسين الأداء',
      dailyBreakdown: [0,1,2,3,4,5,6].map(i => ({
        day: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][i],
        minutes: i < 5 && child.studiedToday ? 15 + Math.round(Math.random() * 20) : 0,
        score: i < 5 && child.studiedToday ? 70 + Math.round(Math.random() * 25) : 0,
      })),
    }];
  }),

  // Parent: rewards system
  route('GET', '/parents/rewards', () => [200, state.parentRewards]),
  route('POST', '/parents/rewards', (_, body) => {
    if (body?.small)  state.parentRewards.small  = { ...state.parentRewards.small,  ...body.small };
    if (body?.medium) state.parentRewards.medium = { ...state.parentRewards.medium, ...body.medium };
    if (body?.large)  state.parentRewards.large  = { ...state.parentRewards.large,  ...body.large };
    return [200, { success: true, rewards: state.parentRewards }];
  }),
  route('GET', '/parents/pending-rewards', () => [200, { requests: state.pendingRewardRequests }]),
  route('POST', '/parents/rewards/:requestId/approve', ({ requestId }) => {
    const req = state.pendingRewardRequests.find(r => r.id === requestId);
    if (req) req.status = 'approved';
    return [200, { success: true }];
  }),
  route('POST', '/parents/rewards/:requestId/defer', ({ requestId }) => {
    const req = state.pendingRewardRequests.find(r => r.id === requestId);
    if (req) req.status = 'deferred';
    return [200, { success: true }];
  }),

  // Parent: encouragement
  route('POST', '/parents/encourage/:childId', (_, body) => {
    const gems = body?.gems ?? 0;
    const message = body?.message ?? 'أنا فخور/ة بك! ⭐';
    const fromName = body?.fromName ?? 'الأهل';
    state.pendingEncouragements.push({
      id: `enc-${Date.now()}`,
      message, gems, fromName,
      createdAt: new Date().toISOString(),
      read: false,
    });
    if (gems > 0) state.gems += gems;
    return [200, { success: true }];
  }),

  // Parent: settings
  route('GET', '/parents/settings', () => [200, state.parentSettings]),
  route('POST', '/parents/settings', (_, body) => {
    Object.assign(state.parentSettings, body);
    return [200, { success: true, settings: state.parentSettings }];
  }),

  // Parent: study time check (for student)
  route('GET', '/parents/study-allowed', () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const { studyDays, studyStartHour, studyEndHour, maxDailyMinutes } = state.parentSettings;
    const dayAllowed = studyDays.includes(day) || day === 5 || day === 6; // Fri/Sat always open
    const timeAllowed = hour >= studyStartHour && hour < studyEndHour;
    const minutesOk = state.todayStudyMinutes < maxDailyMinutes;
    const allowed = dayAllowed && timeAllowed && minutesOk;
    return [200, {
      allowed,
      reason: !dayAllowed ? 'يوم العطلة' : !timeAllowed ? `متاح من ${studyStartHour}:00 إلى ${studyEndHour}:00` : !minutesOk ? `وصلت حد ${maxDailyMinutes} دقيقة اليوم` : null,
      startHour: studyStartHour, endHour: studyEndHour,
      todayMinutes: state.todayStudyMinutes, maxMinutes: maxDailyMinutes,
    }];
  }),

  // Parent: week goal
  route('GET', '/parents/week-goal', () => [200, { subject: state.parentSettings.weekGoalSubject, type: state.parentSettings.weekGoalType }]),
  route('POST', '/parents/week-goal', (_, body) => {
    state.parentSettings.weekGoalSubject = body?.subject ?? null;
    state.parentSettings.weekGoalType = body?.type ?? null;
    return [200, { success: true }];
  }),

  // Student: check study allowed (same as parent)
  route('GET', '/study/allowed', () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const { studyDays, studyStartHour, studyEndHour, maxDailyMinutes } = state.parentSettings;
    const dayAllowed = studyDays.includes(day) || day === 5 || day === 6;
    const timeAllowed = hour >= studyStartHour && hour < studyEndHour;
    const minutesOk = state.todayStudyMinutes < maxDailyMinutes;
    return [200, {
      allowed: dayAllowed && timeAllowed && minutesOk,
      reason: !dayAllowed ? `اليوم عطلة ابدأ غداً ✨` : !timeAllowed ? `وقت الدراسة ${studyStartHour}:00–${studyEndHour}:00 😊` : `وصلت حد ${maxDailyMinutes} دقيقة اليوم، خذ راحة الآن 😊`,
    }];
  }),

  // Student: pending encouragements
  route('GET', '/gamification/encouragements/pending', () => [200, {
    encouragements: state.pendingEncouragements.filter(e => !e.read),
  }]),
  route('POST', '/gamification/encouragements/:id/read', ({ id }) => {
    const enc = state.pendingEncouragements.find(e => e.id === id);
    if (enc) enc.read = true;
    return [200, { success: true }];
  }),

  // Student: request reward
  route('POST', '/gamification/rewards/request', (_, body) => {
    const level = body?.level as 'small' | 'medium' | 'large';
    const reward = state.parentRewards[level];
    if (!reward) return [404, { error: 'Reward level not found' }];
    if (!reward.active) return [400, { error: 'هذه الجائزة غير متاحة حالياً' }];
    if (state.gems < reward.gems) return [400, { error: `تحتاج ${reward.gems} جوهرة` }];
    const reqId = `req-${Date.now()}`;
    state.pendingRewardRequests.push({ id: reqId, level, name: reward.name, gems: reward.gems, requestedAt: new Date().toISOString(), status: 'pending' });
    return [200, { success: true, requestId: reqId, reward: reward.name, gems: reward.gems }];
  }),

  // Student: check reward request status
  route('GET', '/gamification/rewards/my-requests', () => [200, {
    requests: state.pendingRewardRequests,
  }]),

  // Student: confirm reward approved (deduct gems)
  route('POST', '/gamification/rewards/claim/:requestId', ({ requestId }) => {
    const req = state.pendingRewardRequests.find(r => r.id === requestId && r.status === 'approved');
    if (!req) return [404, { error: 'Not found or not approved' }];
    if (state.gems < req.gems) return [400, { error: 'رصيد غير كافٍ' }];
    state.gems -= req.gems;
    req.status = 'deferred'; // mark as claimed (reuse status)
    return [200, { success: true, gemsDeducted: req.gems, remaining: state.gems }];
  }),

  // Parent: joint study session
  route('POST', '/parents/study-session/:childId', ({ childId }) => {
    const child = FAKE_CHILDREN.find(c => c.id === childId) ?? FAKE_CHILDREN[0];
    const sessionId = `session-${Date.now()}`;
    return [200, { sessionId, childName: child.firstName, gemsBonus: 50 }];
  }),
  route('POST', '/parents/study-session/:childId/complete', ({ childId }) => {
    const child = FAKE_CHILDREN.find(c => c.id === childId) ?? FAKE_CHILDREN[0];
    child.gems = (child.gems ?? 0) + 50;
    return [200, { success: true, gemsAdded: 50, childName: child.firstName }];
  }),

  // Parent: week question (Sunday tip + weak area question)
  route('GET', '/parents/week-question/:childId', ({ childId }) => {
    const child = FAKE_CHILDREN.find(c => c.id === childId) ?? FAKE_CHILDREN[0];
    return [200, {
      question: 'ما هو الفرق بين الجملة الاسمية والجملة الفعلية؟',
      subject: child.lastActivity?.subject ?? 'عربي',
      hint: 'الجملة الاسمية تبدأ باسم، والجملة الفعلية تبدأ بفعل',
      targetLesson: { id: 'ar-6', title: 'الجملة الاسمية والفعلية' },
      tip: `ساعد ${child.firstName} في الإجابة عن هذا السؤال قبل جلسة الدراسة!`,
    }];
  }),

  // ── Admin ────────────────────────────────────────────────────
  route('GET', '/admin/metrics', () => [200, {
    totalUsers: 1248, activeUsersToday: 87, activeUsersMonth: 431,
    totalRevenue: 15840, userGrowth: 12, revenueGrowth: 8,
  }]),
  route('GET', '/admin/metrics/chart', () => [200, generateAdminChartData()]),
  route('GET', '/admin/users', () => [200, generateAdminUsers()]),
  route('PUT', '/admin/users/:id/resources', () => [200, { success: true }]),
  route('GET', '/admin/curriculum/subjects', () => [200, SUBJECTS.map(s => ({ ...s, gradeLevel: 3, description: null, lessonsCount: 5 }))]),
  route('POST', '/admin/curriculum/subjects', (_, body) => [201, { id: `sub-${Date.now()}`, ...body }]),
  route('PATCH', '/admin/curriculum/subjects/:id', ({ id }, body) => [200, { id, ...body }]),
  route('DELETE', '/admin/curriculum/subjects/:id', () => [200, { success: true }]),

  // ── Personal Plan ────────────────────────────────────────────────
  route('GET', '/plan', () => {
    const lessons = LESSONS_BY_SUBJECT['sub-hebrew'] ?? [];
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const today = new Date().getDay();
    const weeklySchedule = days.map((day, i) => {
      const lesson = lessons[(i * 3) % lessons.length];
      return { day, subject: 'عبري', lessonId: lesson.id, lessonTitle: lesson.title, done: i < today };
    });
    const doneCount = state.completedLessons.size;
    const totalLessons = lessons.length;
    const forecastDays = Math.max(0, Math.round((totalLessons - doneCount) * 3.5));
    const forecastDate = new Date(Date.now() + forecastDays * 86400000).toISOString().split('T')[0];
    return [200, {
      greeting: `أهلاً يا ${FAKE_USER.firstName}! ${doneCount > 0 ? 'أحسنت على تقدمك! 🌟' : 'ابدأ رحلتك التعليمية اليوم! 🚀'}`,
      strengths: doneCount >= 3 ? ['المفردات الأساسية', 'الاستماع والتعرف'] : ['الاستماع'],
      weaknesses: ['الكتابة والإملاء', 'التعبير الشفهي'],
      weeklySchedule,
      completionForecast: forecastDate,
      upcomingExam: {
        name: 'מצב עברית',
        date: FAKE_USER.gradeLevel <= 3 ? '2027-02-15' : '2027-05-15',
        readinessPercent: Math.min(100, Math.round((doneCount / Math.max(totalLessons, 1)) * 100 * 1.5 + 10)),
      },
      recommendation: {
        text: 'ركز على تقوية مهارة الكتابة والإملاء في الوحدة القادمة',
        lessonId: lessons.find(l => !state.completedLessons.has(l.id))?.id ?? lessons[0]?.id,
        lessonTitle: lessons.find(l => !state.completedLessons.has(l.id))?.title ?? lessons[0]?.title,
      },
    }];
  }),

  route('POST', '/plan/refresh', () => [200, { success: true, message: 'تم تحديث الخطة' }]),

  // ── TTS ──────────────────────────────────────────────────────────
  route('POST', '/tts', async (_, body) => {
    const text = body?.text ?? '';
    if (!text) return [400, { error: 'text required' }];
    const audio = await openaiTTS(text);
    if (!audio) return [200, { audio: null, text }];
    return [200, { audio: `data:audio/mp3;base64,${audio.toString('base64')}`, text }];
  }),

  // ── Speech Evaluation (Whisper) ──────────────────────────────────
  route('POST', '/speech/evaluate', async (_, body) => {
    const { audio, targetText, minAccuracy = 60 } = body ?? {};
    if (!audio || !targetText) return [400, { error: 'audio and targetText required' }];
    const transcript = await openaiWhisper(audio, targetText);
    if (!transcript) return [200, { transcript: targetText, accuracy: 82, passed: true, mock: true }];
    const accuracy = strAccuracy(transcript, targetText);
    return [200, { transcript, accuracy, passed: accuracy >= (minAccuracy as number) }];
  }),

  // ── AI Conversation ───────────────────────────────────────────────
  route('POST', '/ai/chat', async (_, body) => {
    const { messages, systemPrompt } = body ?? {};
    if (!messages?.length) return [400, { error: 'messages required' }];
    const reply = await openaiChat([
      { role: 'system', content: systemPrompt ?? 'أنت مدرس عبري لطيف.' },
      ...messages,
    ]);
    if (!reply) {
      const idx = Math.min(messages.length - 1, 3);
      const mocks = [
        'أحسنت! هل تعرف معنى هذه الكلمة بالكامل؟',
        'ممتاز! في العبرية نستخدم هذه الكلمة كثيراً. حاول مرة أخرى!',
        'رائع جداً! أنت تتعلم بسرعة. هل لديك سؤال آخر؟',
        'شكراً على المحادثة الجميلة! استمر في التدريب يومياً. 🌟',
      ];
      return [200, { reply: mocks[idx] }];
    }
    return [200, { reply }];
  }),

  // ── addUnit ───────────────────────────────────────────────────────
  route('POST', '/curriculum/addUnit', (_, body) => {
    const { subject, grade, unit, title, vocab } = body ?? {};
    if (!subject || !grade || !unit || !title || !vocab?.length)
      return [400, { error: 'subject, grade, unit, title, vocab[] required' }];

    const subjectId = `sub-${subject.toLowerCase().replace(/\s+/g, '-')}`;
    if (!SUBJECTS.find(s => s.id === subjectId))
      (SUBJECTS as any[]).push({ id: subjectId, name: subject, curriculumId: null });

    const baseId = `custom-${subjectId}-${grade}-${unit.replace(/\s+/g, '-').toLowerCase()}`;
    const fullVocab = vocab.map((v: any) => ({
      front: v.word, back: v.translation,
      transliteration: v.transliteration ?? v.word, gender: v.gender,
    }));
    const chunkSize = Math.max(2, Math.ceil(fullVocab.length / 4));
    const newLessons: { id: string; title: string; order: number; unit: string }[] = [];

    for (let i = 0; i < 4; i++) {
      const id = `${baseId}-l${i + 1}`;
      const isQuiz = i === 3;
      const lessonVocab = isQuiz ? fullVocab : fullVocab.slice(i * chunkSize, (i + 1) * chunkSize);
      newLessons.push({ id, title: isQuiz ? `اختبار — ${title}` : `${title} (${i + 1})`, order: i + 1, unit });
      LESSON_VOCAB[id] = lessonVocab;
    }

    if (!LESSONS_BY_SUBJECT[subjectId]) LESSONS_BY_SUBJECT[subjectId] = [];
    LESSONS_BY_SUBJECT[subjectId].push(...newLessons);

    return [201, {
      success: true, subjectId, unit,
      lessons: newLessons.map(l => ({ id: l.id, title: l.title })),
      totalExercises: newLessons.length * 8,
    }];
  }),

  // ── Debug / Testing ──────────────────────────────────────────
  route('POST', '/debug/set-grade', (_, body) => {
    if (typeof body?.gradeLevel === 'number') FAKE_USER.gradeLevel = body.gradeLevel;
    return [200, { gradeLevel: FAKE_USER.gradeLevel }];
  }),
  route('POST', '/debug/reset', () => {
    state.hearts = 5; state.maxHearts = 5;
    state.xp = 450; state.weeklyXp = 120; state.level = 3;
    state.gems = 500;
    state.streak = 3;
    state.dailyXp = 0; state.dailyGoalTarget = 50;
    state.hasStreakFreeze = false; state.xpBoostActive = false;
    state.completedLessons = new Set();
    state.lessonScores = {};
    state.lastActivityDate = new Date().toISOString().split('T')[0];
    state.brokenStreakValue = 0;
    state.questsDate = ''; state.dailyQuests = [];
    state.allQuestsBonusClaimed = false;
    state.todayCorrectAnswers = 0; state.todayLessonsCompleted = 0;
    state.flashcards = []; state.todayReviewedCards = 0;
    state.addedLessons = new Set();
    state.metzavDateOverride = null; state.metzavGradeOverride = null;
    state.pendingRewardRequests = []; state.pendingEncouragements = []; state.todayStudyMinutes = 0;
    FAKE_USER.gradeLevel = 1;
    return [200, { reset: true }];
  }),

  // ── Subscription ─────────────────────────────────────────────
  route('GET', '/api/cardcom/subscription', () => [200, { plan: 'basic', status: 'ACTIVE', expiresAt: null, billingCycle: 'MONTHLY' }]),
  route('POST', '/api/cardcom/checkout', () => [200, { paymentUrl: 'http://localhost:3000/home' }]),
  route('GET', '/api/cardcom/success', () => [200, { success: true }]),
  route('GET', '/api/cardcom/cancel', () => [200, { cancelled: true }]),

  // ── Daily Content ─────────────────────────────────────────────
  route('GET', '/curriculum/daily-content', () => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.replace(/-/g, '').slice(-4);
    const WORDS = [
      { word: 'الفجر', meaning: 'أول ضوء النهار قبل شروق الشمس', example: 'استيقظت عند الفجر لأذاكر', subject: 'عربي' },
      { word: 'المعادلة', meaning: 'تعبير رياضي يحتوي على مجهول', example: 'حللت المعادلة في خمس دقائق', subject: 'رياضيات' },
      { word: 'Perseverance', meaning: 'المثابرة والإصرار', example: 'Perseverance leads to success', subject: 'English' },
    ];
    const CHALLENGES = [
      { question: 'ما ناتج ٧ × ٨ ؟', answer: '٥٦', hint: 'فكر في ٧ × ٤ × ٢', duration: 60 },
      { question: 'أكمل: "من جدّ ..."', answer: 'وجد', hint: 'مثل عربي مشهور', duration: 60 },
      { question: 'ما مساحة مربع طول ضلعه ٥ سم؟', answer: '٢٥ سم²', hint: 'المساحة = الضلع²', duration: 60 },
    ];
    const FACTS = [
      { text: 'دماغ الإنسان يولد طاقة كهربائية كافية لإضاءة مصباح صغير!', emoji: '🧠', source: 'علم الأعصاب' },
      { text: 'عدد الكلمات في اللغة العربية يتجاوز ١٢ مليون كلمة', emoji: '📚', source: 'اللغويات' },
      { text: 'مجموع زوايا أي مثلث دائماً ١٨٠ درجة', emoji: '📐', source: 'الرياضيات' },
    ];
    const wi = parseInt(seed.slice(0, 2), 10) % WORDS.length;
    const ci = parseInt(seed.slice(2, 4), 10) % CHALLENGES.length;
    return [200, { date: today, wordOfDay: WORDS[wi], challenge: CHALLENGES[ci], funFact: FACTS[(wi + ci) % FACTS.length] }];
  }),

  // ── Teacher ───────────────────────────────────────────────────
  route('GET', '/teacher/class', () => [200, {
    id: 'cls1', name: 'الصف الخامس أ', joinCode: 'ELI-2026', gradeLevel: 5, subject: 'عربي', studentCount: 3,
    students: [
      { id: 's1', firstName: 'أحمد', lastName: 'حلبي', gradeLevel: 5, xp: 320, streak: 7, hearts: 5, lastActive: new Date().toISOString(), masteryPercent: 72, completedLessons: 12 },
      { id: 's2', firstName: 'سارة', lastName: 'نصر', gradeLevel: 5, xp: 180, streak: 0, hearts: 0, lastActive: new Date(Date.now() - 5 * 86400000).toISOString(), masteryPercent: 22, weakSubject: 'عربي', completedLessons: 5 },
      { id: 's3', firstName: 'يوسف', lastName: 'عمر', gradeLevel: 5, xp: 510, streak: 14, hearts: 3, lastActive: new Date().toISOString(), masteryPercent: 88, completedLessons: 20 },
    ],
  }]),
  route('GET', '/teacher/classes/:classId/assignments', () => [200, [
    { id: 'a1', title: 'واجب الوحدة الثالثة', subject: 'عربي', unitId: 'u3', lessonId: 'l1', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), minScore: 70, completedCount: 2, totalCount: 3 },
    { id: 'a2', title: 'تمرين المعادلات', subject: 'رياضيات', unitId: 'u2', lessonId: 'l4', dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), minScore: 80, completedCount: 1, totalCount: 3 },
  ]]),
  route('POST', '/teacher/classes/:classId/assignments', (_, body) => [201, { id: 'a' + Date.now(), ...body }]),
  route('GET', '/teacher/classes/:classId/analytics', () => [200, {
    hardestQuestion: 'حدد المبتدأ والخبر في الجملة التالية: "الطالبُ مجتهدٌ"',
    hardestQuestionErrorRate: 67,
    commonErrors: ['الخلط بين المبتدأ والخبر', 'عدم التمييز بين الضمير المتصل والمنفصل', 'أخطاء في الإعراب'],
    avgScore: 74,
    recommendation: 'ركز على تمارين تحليل الجملة الاسمية هذا الأسبوع — ٦٧٪ من الطلاب يخطئون في تحديد المبتدأ.',
    currentUnit: 'unit-3',
  }]),
];

// ── HTTP Server ───────────────────────────────────────────────────
function cors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function send(res: http.ServerResponse, status: number, data: any, method = 'GET') {
  cors(res);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (method === 'GET' && status === 200) {
    headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=300';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsed: any = {};
    try { parsed = body ? JSON.parse(body) : {}; } catch {}
    const rawUrl = req.url ?? '/';
    const [urlPath, queryStr] = rawUrl.split('?');
    const query: Record<string, string> = {};
    if (queryStr) {
      for (const part of queryStr.split('&')) {
        const eqIdx = part.indexOf('=');
        if (eqIdx > 0) query[part.slice(0, eqIdx)] = decodeURIComponent(part.slice(eqIdx + 1));
      }
    }
    const match = matchRoute(req.method ?? 'GET', urlPath, ROUTES);
    if (match) {
      try {
        const result = match.fn(match.params, parsed, query);
        if (result instanceof Promise) {
          result
            .then(([status, data]) => send(res, status, data, req.method ?? 'GET'))
            .catch((e: any) => send(res, 500, { message: e.message }));
        } else {
          const [status, data] = result;
          send(res, status, data, req.method ?? 'GET');
        }
      } catch (e: any) {
        send(res, 500, { message: e.message });
      }
    } else {
      send(res, 404, { message: `Route not found: ${req.method} ${rawUrl}` });
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n✅  Mock API running → http://localhost:${PORT}`);
  console.log(`   تسجيل الدخول: هاتف = أي رقم، كلمة المرور = أي نص\n`);
});
