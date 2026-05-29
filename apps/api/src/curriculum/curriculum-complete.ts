/**
 * Complete curriculum scaffold — grades 1-12, all subjects.
 * Each entry follows inspector standards:
 *   Arabic:  tashkeel mandatory 1-4, grammar sequence enforced
 *   Hebrew:  nikud mandatory 1-6, binyanim order קל→נפעל→פיעל→פועל→הפעיל→הופעל→התפעל
 *   English: Can-Do statements, 25/25/25/25 skills split, COBE prep gr 10-12
 *   Math:    3 representations (image/symbol/word-problem), Israeli shekel examples
 */

export interface CurriculumUnit {
  unitId: string;
  title: string;
  titleHe?: string;
  gradeLevel: number;
  subject: string;
  order: number;
  inspectorNote?: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLesson {
  lessonId: string;
  title: string;
  titleHe?: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  canDoStatement?: string;
  questionTypes: string[];
  requiresTashkeel?: boolean;
  requiresNikud?: boolean;
  binyan?: string;
  mathRepresentations?: ('image' | 'symbol' | 'word-problem')[];
}

// ─── ARABIC ──────────────────────────────────────────────────────────────────
export const ARABIC_CURRICULUM: CurriculumUnit[] = [
  // Grade 1
  { unitId: 'ar-1-1', title: 'الحروف الهجائية', gradeLevel: 1, subject: 'عربي', order: 1,
    inspectorNote: 'تشكيل كامل إلزامي — الصف 1-4', lessons: [
      { lessonId: 'ar-1-1-1', title: 'حروف المد', order: 1, xpReward: 10, estimatedMinutes: 8, questionTypes: ['MULTIPLE_CHOICE', 'MATCHING'], requiresTashkeel: true },
      { lessonId: 'ar-1-1-2', title: 'الحروف الشمسية والقمرية', order: 2, xpReward: 15, estimatedMinutes: 10, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
      { lessonId: 'ar-1-1-3', title: 'التنوين', order: 3, xpReward: 15, estimatedMinutes: 10, questionTypes: ['LISTEN_WRITE', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
    ]},
  { unitId: 'ar-1-2', title: 'الكلمة والجملة', gradeLevel: 1, subject: 'عربي', order: 2, lessons: [
    { lessonId: 'ar-1-2-1', title: 'الاسم والفعل والحرف', order: 1, xpReward: 20, estimatedMinutes: 12, questionTypes: ['SORT_GROUPS', 'MULTIPLE_CHOICE'], requiresTashkeel: true },
    { lessonId: 'ar-1-2-2', title: 'الجملة الاسمية البسيطة', order: 2, xpReward: 20, estimatedMinutes: 12, questionTypes: ['ORDERING', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
  ]},
  // Grade 2
  { unitId: 'ar-2-1', title: 'القراءة والفهم — الصف الثاني', gradeLevel: 2, subject: 'عربي', order: 1, lessons: [
    { lessonId: 'ar-2-1-1', title: 'فهم المقروء — نصوص قصيرة', order: 1, xpReward: 20, estimatedMinutes: 12, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'], requiresTashkeel: true },
    { lessonId: 'ar-2-1-2', title: 'الفكرة الرئيسية والتفاصيل', order: 2, xpReward: 25, estimatedMinutes: 15, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'], requiresTashkeel: true },
  ]},
  { unitId: 'ar-2-2', title: 'النحو — المبتدأ والخبر', gradeLevel: 2, subject: 'عربي', order: 2, lessons: [
    { lessonId: 'ar-2-2-1', title: 'المبتدأ والخبر', order: 1, xpReward: 25, estimatedMinutes: 15, questionTypes: ['SORT_GROUPS', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
    { lessonId: 'ar-2-2-2', title: 'الجملة الفعلية — الفاعل والمفعول', order: 2, xpReward: 30, estimatedMinutes: 18, questionTypes: ['ORDERING', 'MULTIPLE_CHOICE'], requiresTashkeel: true },
  ]},
  // Grade 3
  { unitId: 'ar-3-1', title: 'الإملاء والكتابة الصحيحة', gradeLevel: 3, subject: 'عربي', order: 1, lessons: [
    { lessonId: 'ar-3-1-1', title: 'همزة الوصل والقطع', order: 1, xpReward: 25, estimatedMinutes: 15, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE'], requiresTashkeel: true },
    { lessonId: 'ar-3-1-2', title: 'التاء المربوطة والمفتوحة', order: 2, xpReward: 25, estimatedMinutes: 15, questionTypes: ['FILL_BLANK_CHOICE', 'MULTIPLE_CHOICE'], requiresTashkeel: true },
    { lessonId: 'ar-3-1-3', title: 'الألف اللينة', order: 3, xpReward: 25, estimatedMinutes: 12, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE'], requiresTashkeel: true },
  ]},
  { unitId: 'ar-3-2', title: 'البلاغة الأساسية', gradeLevel: 3, subject: 'عربي', order: 2, lessons: [
    { lessonId: 'ar-3-2-1', title: 'التشبيه وأركانه', order: 1, xpReward: 30, estimatedMinutes: 18, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
    { lessonId: 'ar-3-2-2', title: 'الاستعارة', order: 2, xpReward: 30, estimatedMinutes: 18, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'], requiresTashkeel: true },
  ]},
  // Grade 4
  { unitId: 'ar-4-1', title: 'الإعراب — الضمة والفتحة والكسرة', gradeLevel: 4, subject: 'عربي', order: 1, lessons: [
    { lessonId: 'ar-4-1-1', title: 'المرفوعات — الفاعل ونائبه', order: 1, xpReward: 35, estimatedMinutes: 20, questionTypes: ['FILL_IN_THE_BLANK', 'SORT_GROUPS'], requiresTashkeel: true },
    { lessonId: 'ar-4-1-2', title: 'المنصوبات — المفعول به والحال', order: 2, xpReward: 35, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresTashkeel: true },
    { lessonId: 'ar-4-1-3', title: 'المجرورات — الإضافة وحروف الجر', order: 3, xpReward: 35, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'ORDERING'], requiresTashkeel: true },
  ]},
  // Grade 5
  { unitId: 'ar-5-1', title: 'الأدب والنصوص', gradeLevel: 5, subject: 'عربي', order: 1, lessons: [
    { lessonId: 'ar-5-1-1', title: 'القصة القصيرة — العناصر', order: 1, xpReward: 40, estimatedMinutes: 22, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'] },
    { lessonId: 'ar-5-1-2', title: 'الشعر الحديث — التحليل', order: 2, xpReward: 40, estimatedMinutes: 25, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'] },
    { lessonId: 'ar-5-1-3', title: 'كتابة المقال القصير', order: 3, xpReward: 50, estimatedMinutes: 30, questionTypes: ['SHORT_ANSWER'] },
  ]},
  { unitId: 'ar-5-2', title: 'أساليب اللغة', gradeLevel: 5, subject: 'عربي', order: 2, lessons: [
    { lessonId: 'ar-5-2-1', title: 'أسلوب الاستفهام', order: 1, xpReward: 35, estimatedMinutes: 18, questionTypes: ['FILL_BLANK_CHOICE', 'MULTIPLE_CHOICE'] },
    { lessonId: 'ar-5-2-2', title: 'أسلوب الشرط', order: 2, xpReward: 40, estimatedMinutes: 20, questionTypes: ['FILL_IN_THE_BLANK', 'ORDERING'] },
    { lessonId: 'ar-5-2-3', title: 'أسلوب التوكيد', order: 3, xpReward: 40, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'] },
  ]},
  // Grades 6-12 — abbreviated
  ...([6,7,8,9,10,11,12] as const).map((g, gi) => ({
    unitId: `ar-${g}-1`, title: `النحو والبلاغة — الصف ${g}`, gradeLevel: g, subject: 'عربي', order: 1,
    lessons: [
      { lessonId: `ar-${g}-1-1`, title: 'مراجعة وتطوير', order: 1, xpReward: 40 + gi * 5, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'] },
      { lessonId: `ar-${g}-1-2`, title: 'الأسلوب الأدبي', order: 2, xpReward: 45 + gi * 5, estimatedMinutes: 25, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'] },
      { lessonId: `ar-${g}-1-3`, title: 'التعبير الكتابي', order: 3, xpReward: 50 + gi * 5, estimatedMinutes: 30, questionTypes: ['SHORT_ANSWER'] },
    ],
  })),
];

// ─── HEBREW ───────────────────────────────────────────────────────────────────
export const HEBREW_CURRICULUM: CurriculumUnit[] = [
  // Grade 2 (earliest Hebrew grade)
  { unitId: 'he-2-1', title: 'אותיות ומילים — כיתה ב', gradeLevel: 2, subject: 'עברית', order: 1,
    inspectorNote: 'ניקוד חובה כיתות 1-6 — מקור: מילון ספיר', lessons: [
      { lessonId: 'he-2-1-1', title: 'אותיות הא"ב', order: 1, xpReward: 10, estimatedMinutes: 8, questionTypes: ['MATCHING', 'MULTIPLE_CHOICE'], requiresNikud: true },
      { lessonId: 'he-2-1-2', title: 'ניקוד — קמץ ופתח', order: 2, xpReward: 15, estimatedMinutes: 10, questionTypes: ['LISTEN_WRITE', 'MULTIPLE_CHOICE'], requiresNikud: true },
      { lessonId: 'he-2-1-3', title: 'מין דקדוקי ז׳/נ׳', order: 3, xpReward: 20, estimatedMinutes: 12, questionTypes: ['SORT_GROUPS', 'MULTIPLE_CHOICE'], requiresNikud: true },
    ]},
  // Grade 3 — בניין קל
  { unitId: 'he-3-1', title: 'בניין קַל — שלמים ונחי ל״ה', gradeLevel: 3, subject: 'עברית', order: 1,
    inspectorNote: 'בניין קל ראשון — לפני נפעל ופיעל', lessons: [
      { lessonId: 'he-3-1-1', title: 'שורש ובניין — מושגי יסוד', order: 1, xpReward: 25, estimatedMinutes: 15, questionTypes: ['MULTIPLE_CHOICE', 'MATCHING'], requiresNikud: true, binyan: 'קל' },
      { lessonId: 'he-3-1-2', title: 'פועל קל — עבר הווה עתיד', order: 2, xpReward: 30, estimatedMinutes: 18, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE'], requiresNikud: true, binyan: 'קל' },
      { lessonId: 'he-3-1-3', title: 'הטיה לפי גוף ומין', order: 3, xpReward: 30, estimatedMinutes: 18, questionTypes: ['FILL_BLANK_CHOICE', 'MATCHING'], requiresNikud: true, binyan: 'קל' },
    ]},
  // Grade 4 — נפעל
  { unitId: 'he-4-1', title: 'בניין נִפְעַל', gradeLevel: 4, subject: 'עברית', order: 1, lessons: [
    { lessonId: 'he-4-1-1', title: 'מאפייני נפעל — פועל סביל', order: 1, xpReward: 35, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'SORT_GROUPS'], requiresNikud: true, binyan: 'נפעל' },
    { lessonId: 'he-4-1-2', title: 'הטיית נפעל', order: 2, xpReward: 35, estimatedMinutes: 20, questionTypes: ['FILL_IN_THE_BLANK', 'ORDERING'], requiresNikud: true, binyan: 'נפעל' },
  ]},
  // Grade 5 — פיעל ופועל
  { unitId: 'he-5-1', title: 'בניינים פִּיעֵל ופֻּעַל', gradeLevel: 5, subject: 'עברית', order: 1, lessons: [
    { lessonId: 'he-5-1-1', title: 'בניין פיעל — הגברה ורבוי', order: 1, xpReward: 40, estimatedMinutes: 22, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresNikud: true, binyan: 'פיעל' },
    { lessonId: 'he-5-1-2', title: 'בניין פועל — גזרות', order: 2, xpReward: 40, estimatedMinutes: 22, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresNikud: true, binyan: 'פועל' },
  ]},
  // Grade 6 — הפעיל
  { unitId: 'he-6-1', title: 'בניין הִפְעִיל', gradeLevel: 6, subject: 'עברית', order: 1, lessons: [
    { lessonId: 'he-6-1-1', title: 'הפעיל — פועל יוצא', order: 1, xpReward: 45, estimatedMinutes: 25, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], requiresNikud: true, binyan: 'הפעיל' },
    { lessonId: 'he-6-1-2', title: 'הטיית הפעיל — כל הגופים', order: 2, xpReward: 45, estimatedMinutes: 25, questionTypes: ['FILL_BLANK_CHOICE', 'ORDERING'], requiresNikud: true, binyan: 'הפעיל' },
  ]},
  // Grade 7 — הופעל
  { unitId: 'he-7-1', title: 'בניין הוּפְעַל', gradeLevel: 7, subject: 'עברית', order: 1, lessons: [
    { lessonId: 'he-7-1-1', title: 'הופעל — הבניין הסביל', order: 1, xpReward: 50, estimatedMinutes: 25, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'], binyan: 'הופעל' },
  ]},
  // Grade 8 — התפעל
  { unitId: 'he-8-1', title: 'בניין הִתְפַּעֵל', gradeLevel: 8, subject: 'עברית', order: 1, lessons: [
    { lessonId: 'he-8-1-1', title: 'התפעל — פועל חוזר', order: 1, xpReward: 55, estimatedMinutes: 28, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'], binyan: 'התפעל' },
    { lessonId: 'he-8-1-2', title: 'כל הבניינים — חזרה', order: 2, xpReward: 60, estimatedMinutes: 30, questionTypes: ['SORT_GROUPS', 'MULTIPLE_CHOICE'], binyan: 'כל הבניינים' },
  ]},
  // Grades 9-12
  ...([9,10,11,12] as const).map((g, gi) => ({
    unitId: `he-${g}-1`, title: `ספרות ולשון — כיתה ${g}`, gradeLevel: g, subject: 'עברית', order: 1,
    inspectorNote: `CEFR ישראלי: כיתה ${g} — ${g <= 10 ? 'A2→B1' : 'B1→B2'}`,
    lessons: [
      { lessonId: `he-${g}-1-1`, title: 'קריאה והבנה — טקסט ספרותי', order: 1, xpReward: 55 + gi * 5, estimatedMinutes: 28, questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'] },
      { lessonId: `he-${g}-1-2`, title: 'כתיבה יצירתית', order: 2, xpReward: 60 + gi * 5, estimatedMinutes: 35, questionTypes: ['SHORT_ANSWER'] },
    ],
  })),
];

// ─── ENGLISH ──────────────────────────────────────────────────────────────────
export const ENGLISH_CURRICULUM: CurriculumUnit[] = [
  // Grade 3
  { unitId: 'en-3-1', title: 'Hello World — Greetings', gradeLevel: 3, subject: 'English', order: 1, lessons: [
    { lessonId: 'en-3-1-1', title: 'Greetings & Introductions', order: 1, xpReward: 15, estimatedMinutes: 10, canDoStatement: 'I can greet someone and say my name', questionTypes: ['LISTEN_CHOICE', 'SPEAK_WORD', 'MATCHING', 'FILL_IN_THE_BLANK'] },
    { lessonId: 'en-3-1-2', title: 'Numbers 1-20', order: 2, xpReward: 15, estimatedMinutes: 10, canDoStatement: 'I can count to 20 in English', questionTypes: ['LISTEN_WRITE', 'ORDERING', 'MULTIPLE_CHOICE'] },
  ]},
  { unitId: 'en-3-2', title: 'Colors & School Objects', gradeLevel: 3, subject: 'English', order: 2, lessons: [
    { lessonId: 'en-3-2-1', title: 'Colors', order: 1, xpReward: 15, estimatedMinutes: 10, canDoStatement: 'I can name 10 colors', questionTypes: ['MATCHING', 'LISTEN_CHOICE', 'MULTIPLE_CHOICE'] },
    { lessonId: 'en-3-2-2', title: 'School Vocabulary', order: 2, xpReward: 20, estimatedMinutes: 12, canDoStatement: 'I can name classroom objects', questionTypes: ['MATCHING', 'FLASHCARD_EX', 'MULTIPLE_CHOICE'] },
  ]},
  // Grade 4-5
  ...([4,5] as const).map((g, gi) => ({
    unitId: `en-${g}-1`, title: `Reading & Writing — Grade ${g}`, gradeLevel: g, subject: 'English', order: 1,
    lessons: [
      { lessonId: `en-${g}-1-1`, title: 'Short Texts — Comprehension', order: 1, xpReward: 25 + gi * 5, estimatedMinutes: 15, canDoStatement: `I can understand a ${g === 4 ? '50' : '80'}-word text`, questionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'LISTEN_CHOICE'] },
      { lessonId: `en-${g}-1-2`, title: 'Present Simple', order: 2, xpReward: 25 + gi * 5, estimatedMinutes: 15, canDoStatement: 'I can write 5 sentences about my daily routine', questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'ORDERING', 'SHORT_ANSWER'] },
    ],
  })),
  // Grades 6-9
  ...([6,7,8,9] as const).map((g, gi) => ({
    unitId: `en-${g}-1`, title: `Grammar & Skills — Grade ${g}`, gradeLevel: g, subject: 'English', order: 1,
    lessons: [
      { lessonId: `en-${g}-1-1`, title: 'Tenses Review', order: 1, xpReward: 35 + gi * 5, estimatedMinutes: 20, canDoStatement: 'I can use past, present and future tenses correctly', questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER', 'SPEAK'] },
      { lessonId: `en-${g}-1-2`, title: 'Reading Strategies', order: 2, xpReward: 35 + gi * 5, estimatedMinutes: 22, canDoStatement: 'I can identify main idea and supporting details', questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'LISTEN_CHOICE', 'TRUE_FALSE'] },
    ],
  })),
  // Grades 10-12 — COBE prep
  ...([10,11,12] as const).map((g, gi) => ({
    unitId: `en-${g}-1`, title: `COBE Preparation — Grade ${g}`, gradeLevel: g, subject: 'English', order: 1,
    inspectorNote: 'COBE bagrut prep — 25% listening/speaking/reading/writing each',
    lessons: [
      { lessonId: `en-${g}-1-1`, title: 'Listening Comprehension', order: 1, xpReward: 50 + gi * 5, estimatedMinutes: 25, canDoStatement: 'I can answer comprehension questions from an audio passage', questionTypes: ['LISTEN_CHOICE', 'LISTEN_WRITE', 'MULTIPLE_CHOICE'] },
      { lessonId: `en-${g}-1-2`, title: 'Reading — Article Analysis', order: 2, xpReward: 50 + gi * 5, estimatedMinutes: 28, canDoStatement: 'I can analyse an article and identify author\'s purpose', questionTypes: ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'TRUE_FALSE'] },
      { lessonId: `en-${g}-1-3`, title: 'Writing — Essay Structure', order: 3, xpReward: 60 + gi * 5, estimatedMinutes: 35, canDoStatement: 'I can write a structured 5-paragraph essay', questionTypes: ['SHORT_ANSWER'] },
      { lessonId: `en-${g}-1-4`, title: 'Speaking Practice', order: 4, xpReward: 55 + gi * 5, estimatedMinutes: 20, canDoStatement: 'I can speak fluently on a given topic for 2 minutes', questionTypes: ['SPEAK', 'READ_ALOUD', 'AI_CONVERSATION'] },
    ],
  })),
];

// ─── MATH ─────────────────────────────────────────────────────────────────────
export const MATH_CURRICULUM: CurriculumUnit[] = [
  // Grade 1
  { unitId: 'ma-1-1', title: 'أعداد ١-١٠٠', gradeLevel: 1, subject: 'رياضيات', order: 1,
    inspectorNote: '٣ تمثيلات: صورة + رمز + مسألة لفظية', lessons: [
      { lessonId: 'ma-1-1-1', title: 'الأعداد ١-١٠', order: 1, xpReward: 10, estimatedMinutes: 8, questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_THE_BLANK'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
      { lessonId: 'ma-1-1-2', title: 'الجمع حتى ٢٠', order: 2, xpReward: 15, estimatedMinutes: 10, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'FILL_BLANK_CHOICE'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
      { lessonId: 'ma-1-1-3', title: 'الطرح حتى ٢٠', order: 3, xpReward: 15, estimatedMinutes: 10, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'FILL_BLANK_CHOICE'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    ]},
  // Grade 2
  { unitId: 'ma-2-1', title: 'الجمع والطرح حتى ١٠٠', gradeLevel: 2, subject: 'رياضيات', order: 1, lessons: [
    { lessonId: 'ma-2-1-1', title: 'الجمع مع حمل', order: 1, xpReward: 20, estimatedMinutes: 12, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-2-1-2', title: 'الطرح مع استلاف', order: 2, xpReward: 20, estimatedMinutes: 12, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-2-1-3', title: 'مسائل بالشيكل — الأسواق المحلية', order: 3, xpReward: 25, estimatedMinutes: 15, questionTypes: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['word-problem'] },
  ]},
  // Grade 3
  { unitId: 'ma-3-1', title: 'الضرب حتى ١٠٠', gradeLevel: 3, subject: 'رياضيات', order: 1, lessons: [
    { lessonId: 'ma-3-1-1', title: 'جدول الضرب ١-٥', order: 1, xpReward: 25, estimatedMinutes: 15, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'ORDERING'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-3-1-2', title: 'جدول الضرب ٦-١٠', order: 2, xpReward: 25, estimatedMinutes: 15, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'ORDERING'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-3-1-3', title: 'مسائل حياتية — شراء في البقالة', order: 3, xpReward: 30, estimatedMinutes: 18, questionTypes: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['word-problem'] },
  ]},
  // Grade 4
  { unitId: 'ma-4-1', title: 'الكسور الاعتيادية', gradeLevel: 4, subject: 'رياضيات', order: 1, lessons: [
    { lessonId: 'ma-4-1-1', title: 'مفهوم الكسر', order: 1, xpReward: 30, estimatedMinutes: 18, questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_THE_BLANK'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-4-1-2', title: 'جمع الكسور ذات القواسم المتساوية', order: 2, xpReward: 35, estimatedMinutes: 20, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-4-1-3', title: 'مسألة: تقسيم التسوق — شيكل وأجزاؤه', order: 3, xpReward: 35, estimatedMinutes: 20, questionTypes: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['word-problem'] },
  ]},
  // Grade 5
  { unitId: 'ma-5-1', title: 'الكسور العشرية', gradeLevel: 5, subject: 'رياضيات', order: 1, lessons: [
    { lessonId: 'ma-5-1-1', title: 'مفهوم العشري — من الكسر للعشري', order: 1, xpReward: 35, estimatedMinutes: 20, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-5-1-2', title: 'العمليات على الكسور العشرية', order: 2, xpReward: 40, estimatedMinutes: 22, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'], mathRepresentations: ['symbol', 'word-problem'] },
  ]},
  { unitId: 'ma-5-2', title: 'المساحات والمحيطات', gradeLevel: 5, subject: 'رياضيات', order: 2, lessons: [
    { lessonId: 'ma-5-2-1', title: 'محيط ومساحة المستطيل', order: 1, xpReward: 40, estimatedMinutes: 22, questionTypes: ['FILL_IN_THE_BLANK', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-5-2-2', title: 'مسألة: تبليط الغرفة بالشيكل', order: 2, xpReward: 40, estimatedMinutes: 22, questionTypes: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['word-problem'] },
  ]},
  // Grade 6
  { unitId: 'ma-6-1', title: 'النسب والتناسب', gradeLevel: 6, subject: 'رياضيات', order: 1, lessons: [
    { lessonId: 'ma-6-1-1', title: 'مفهوم النسبة', order: 1, xpReward: 40, estimatedMinutes: 22, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'TRUE_FALSE'], mathRepresentations: ['image', 'symbol', 'word-problem'] },
    { lessonId: 'ma-6-1-2', title: 'التناسب المباشر والعكسي', order: 2, xpReward: 45, estimatedMinutes: 25, questionTypes: ['FILL_IN_THE_BLANK', 'SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['symbol', 'word-problem'] },
  ]},
  // Grades 7-12
  ...([7,8,9,10,11,12] as const).map((g, gi) => ({
    unitId: `ma-${g}-1`,
    title: [
      'الجبر — المعادلات الخطية',
      'الهندسة — النظريات والبراهين',
      'الإحصاء والاحتمالات',
      'الجبر — المعادلات التربيعية',
      'المثلثات والدوال',
      'التفاضل والتكامل',
    ][gi],
    gradeLevel: g, subject: 'رياضيات', order: 1,
    lessons: [
      { lessonId: `ma-${g}-1-1`, title: 'مفاهيم أساسية', order: 1, xpReward: 50 + gi * 5, estimatedMinutes: 25, questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'SHORT_ANSWER'], mathRepresentations: ['image', 'symbol', 'word-problem'] as ('image'|'symbol'|'word-problem')[] },
      { lessonId: `ma-${g}-1-2`, title: 'تطبيقات عملية', order: 2, xpReward: 55 + gi * 5, estimatedMinutes: 30, questionTypes: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'], mathRepresentations: ['word-problem'] as ('word-problem')[] },
    ],
  })),
];

// ─── Combined export ──────────────────────────────────────────────────────────
export const COMPLETE_CURRICULUM: CurriculumUnit[] = [
  ...ARABIC_CURRICULUM,
  ...HEBREW_CURRICULUM,
  ...ENGLISH_CURRICULUM,
  ...MATH_CURRICULUM,
];

export function getUnitsForSubjectGrade(subject: string, gradeLevel: number): CurriculumUnit[] {
  return COMPLETE_CURRICULUM.filter(u => u.subject === subject && u.gradeLevel === gradeLevel)
    .sort((a, b) => a.order - b.order);
}
