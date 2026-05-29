interface Exercise {
  id: string;
  type: string;
  difficulty: number;
  order: number;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  unit: string;
  questions: Exercise[];
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function seedFromId(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 31;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueNumericOptions(correct: number, count: number, rand: () => number): Array<{ id: string; text: string }> {
  const correctStr = String(correct);
  const allowNeg = correct < 0;
  const set = new Set<number>([correct]);
  let attempts = 0;
  while (set.size < count && attempts < 300) {
    attempts++;
    const delta = Math.floor(rand() * 21) - 10;
    const candidate = correct + delta;
    if (candidate !== correct && (allowNeg || candidate >= 0)) set.add(candidate);
  }
  let fill = 1;
  while (set.size < count) {
    const v = correct >= 0 ? correct + fill * 97 : correct - fill * 10;
    set.add(v);
    fill++;
  }
  const nums = Array.from(set);
  const shuffled = shuffle(nums, rand);
  let dIdx = 0;
  return shuffled.map((n) => ({
    id: String(n) === correctStr ? 'c' : `d${dIdx++}`,
    text: String(n),
  }));
}

interface MathProblem {
  question: string;
  answer: number;
  statement?: string;
}

let _exId = 0;
function exId(lessonId: string): string {
  return `${lessonId}-ex${++_exId}`;
}

function generateMathExercises(lessonId: string, problems: MathProblem[]): Exercise[] {
  _exId = 0;
  const rand = rng(seedFromId(lessonId));
  const isQuiz = lessonId.endsWith('-l10');
  const exercises: Exercise[] = [];

  const shuffled = shuffle(problems, rand);

  // 4× MULTIPLE_CHOICE
  for (let i = 0; i < Math.min(4, shuffled.length); i++) {
    const p = shuffled[i];
    const options = uniqueNumericOptions(p.answer, 4, rand);
    exercises.push({
      id: exId(lessonId),
      type: 'MULTIPLE_CHOICE',
      difficulty: 1,
      order: exercises.length,
      content: { questionText: p.question, options },
      correctAnswer: { selectedOptionIds: ['c'] },
      explanation: `الجواب: ${p.answer}`,
    });
  }

  // 3× TRUE_FALSE
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    const p = shuffled[i];
    const makeWrong = rand() > 0.5;
    const displayed = makeWrong ? p.answer + Math.floor(rand() * 5) + 1 : p.answer;
    const isTrue = displayed === p.answer;
    const stmt = p.statement ?? `${p.question.replace('؟', '')} = ${displayed}`;
    exercises.push({
      id: exId(lessonId),
      type: 'TRUE_FALSE',
      difficulty: 1,
      order: exercises.length,
      content: { statement: stmt },
      correctAnswer: { isTrue },
      explanation: `الجواب الصحيح: ${p.answer}`,
    });
  }

  // 3× FILL_BLANK_CHOICE
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    const p = shuffled[i % shuffled.length];
    // Fix double "= =" by checking if question already has "= ؟"
    const sentence = (p.question.includes('= ؟') || p.question.includes(' ؟'))
      ? p.question.replace('؟', '___')
      : p.question.replace('؟', ' = ___');
    const options = uniqueNumericOptions(p.answer, 4, rand);
    exercises.push({
      id: exId(lessonId),
      type: 'FILL_BLANK_CHOICE',
      difficulty: 2,
      order: exercises.length,
      content: {
        questionText: 'اختر الناتج الصحيح:',
        sentence,
        options,
      },
      correctAnswer: { selectedOptionId: 'c' },
      explanation: `الجواب: ${p.answer}`,
    });
  }

  // 1× WORD_ORDER — only for multi-digit answers
  const wordOrderProb = shuffled.find(p => String(Math.abs(p.answer)).length > 1);
  if (wordOrderProb) {
    const p = wordOrderProb;
    const answerStr = String(Math.abs(p.answer)); // positive digits only
    const words = answerStr.split('');
    const shuffledWords = shuffle([...words], rand);
    exercises.push({
      id: exId(lessonId),
      type: 'WORD_ORDER',
      difficulty: 3,
      order: exercises.length,
      content: {
        questionText: `رتّب أرقام ناتج: ${p.question}`,
        words: shuffledWords,
        correctOrder: words,
      },
      correctAnswer: { order: words },
      explanation: `الناتج: ${answerStr}`,
    });
  }

  // 2× FLASHCARD_EX
  for (let i = 0; i < Math.min(2, shuffled.length); i++) {
    const p = shuffled[i];
    const front = p.question.replace('؟', '').trim();
    exercises.push({
      id: exId(lessonId),
      type: 'FLASHCARD_EX',
      difficulty: 1,
      order: exercises.length,
      content: { front, back: String(p.answer), transliteration: '' },
      correctAnswer: { rated: true },
      explanation: '',
    });
  }

  // +3 MULTIPLE_CHOICE bonus for quiz lessons
  if (isQuiz) {
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const p = shuffled[(i + 2) % shuffled.length];
      const options = uniqueNumericOptions(p.answer, 4, rand);
      exercises.push({
        id: exId(lessonId),
        type: 'MULTIPLE_CHOICE',
        difficulty: 2,
        order: exercises.length,
        content: { questionText: `[مراجعة] ${p.question}`, options },
        correctAnswer: { selectedOptionIds: ['c'] },
        explanation: `الجواب: ${p.answer}`,
      });
    }
  }

  return exercises;
}

function addition(a: number, b: number): MathProblem {
  return { question: `كم ناتج ${a} + ${b}؟`, answer: a + b, statement: `${a} + ${b} = ${a + b}` };
}
function subtraction(a: number, b: number): MathProblem {
  const big = Math.max(a, b), small = Math.min(a, b);
  return { question: `كم ناتج ${big} - ${small}؟`, answer: big - small, statement: `${big} - ${small} = ${big - small}` };
}
function multiplication(a: number, b: number): MathProblem {
  return { question: `كم ناتج ${a} × ${b}؟`, answer: a * b, statement: `${a} × ${b} = ${a * b}` };
}
function division(a: number, b: number): MathProblem {
  return { question: `كم ناتج ${a * b} ÷ ${b}؟`, answer: a, statement: `${a * b} ÷ ${b} = ${a}` };
}

function buildMathUnit(grade: number, unitNum: number, title: string, problems: MathProblem[]): Lesson[] {
  return Array.from({ length: 10 }, (_, i) => {
    const l = i + 1;
    const id = `mt${grade}-u${unitNum}-l${l}`;
    const lessonTitle = l === 10 ? `اختبار الوحدة — ${title}` : `${title} (${l})`;
    return {
      id,
      title: lessonTitle,
      order: (unitNum - 1) * 10 + l,
      unit: title,
      questions: generateMathExercises(id, problems),
    };
  });
}

// ──────────── GRADE 1 ────────────
const MT1: Lesson[] = [
  ...buildMathUnit(1, 1, 'الأعداد 1-10', [
    addition(1,2), addition(2,3), addition(3,4), addition(4,5),
    subtraction(5,2), subtraction(8,3), addition(1,1), subtraction(6,4),
  ]),
  ...buildMathUnit(1, 2, 'الأعداد 10-20', [
    addition(10,2), addition(11,3), addition(12,4), addition(13,5),
    subtraction(15,2), subtraction(18,3), addition(10,7), subtraction(20,6),
  ]),
  ...buildMathUnit(1, 3, 'الجمع حتى 20', [
    addition(5,7), addition(8,9), addition(6,8), addition(7,9),
    addition(4,8), addition(9,9), addition(3,9), addition(6,7),
  ]),
  ...buildMathUnit(1, 4, 'الطرح حتى 20', [
    subtraction(15,7), subtraction(18,9), subtraction(16,8), subtraction(17,9),
    subtraction(14,8), subtraction(20,9), subtraction(13,9), subtraction(16,7),
  ]),
  ...buildMathUnit(1, 5, 'الأعداد 20-50', [
    addition(20,5), addition(30,10), addition(25,5), addition(40,8),
    subtraction(50,10), subtraction(45,5), addition(20,20), subtraction(40,15),
  ]),
  ...buildMathUnit(1, 6, 'الأعداد 50-100', [
    addition(50,10), addition(60,20), addition(70,15), addition(80,10),
    subtraction(100,10), subtraction(90,20), addition(55,25), subtraction(80,30),
  ]),
  ...buildMathUnit(1, 7, 'الأشكال الهندسية', [
    { question: 'كم ضلعاً للمثلث؟', answer: 3 },
    { question: 'كم ضلعاً للمربع؟', answer: 4 },
    { question: 'كم زاوية للمستطيل؟', answer: 4 },
    { question: 'كم ضلعاً للمستطيل؟', answer: 4 },
    { question: 'كم ضلعاً للمسدس؟', answer: 6 },
    { question: 'كم زاوية للمثلث؟', answer: 3 },
    { question: 'كم ضلعاً للخماسي؟', answer: 5 },
    { question: 'كم زاوية للمربع؟', answer: 4 },
  ]),
  ...buildMathUnit(1, 8, 'مراجعة شاملة — الصف الأول', [
    addition(7,8), subtraction(15,6), addition(20,15), subtraction(50,25),
    addition(30,40), subtraction(100,50), addition(12,13), subtraction(20,8),
  ]),
];

// ──────────── GRADE 2 ────────────
const MT2: Lesson[] = [
  ...buildMathUnit(2, 1, 'الجمع والطرح حتى 100', [
    addition(23,45), addition(56,38), subtraction(85,27), subtraction(93,46),
    addition(47,36), subtraction(72,38), addition(64,29), subtraction(81,54),
  ]),
  ...buildMathUnit(2, 2, 'جداول الضرب 2 و5', [
    multiplication(2,3), multiplication(2,5), multiplication(2,7), multiplication(2,9),
    multiplication(5,2), multiplication(5,4), multiplication(5,6), multiplication(5,8),
  ]),
  ...buildMathUnit(2, 3, 'جداول الضرب 3 و4', [
    multiplication(3,2), multiplication(3,4), multiplication(3,6), multiplication(3,8),
    multiplication(4,2), multiplication(4,4), multiplication(4,6), multiplication(4,8),
  ]),
  ...buildMathUnit(2, 4, 'القسمة البسيطة', [
    division(2,2), division(3,2), division(4,2), division(5,2),
    division(2,3), division(3,3), division(4,3), division(5,3),
  ]),
  ...buildMathUnit(2, 5, 'الأعداد حتى 1000', [
    addition(100,200), addition(300,450), subtraction(800,350), addition(250,375),
    subtraction(900,400), addition(125,250), subtraction(750,325), addition(475,200),
  ]),
  ...buildMathUnit(2, 6, 'القياس — الطول والوزن', [
    { question: 'كم سم في المتر الواحد؟', answer: 100 },
    { question: 'كم مم في السم الواحد؟', answer: 10 },
    { question: 'كم غ في الكيلو الواحد؟', answer: 1000 },
    { question: 'كم سم في نصف متر؟', answer: 50 },
    { question: 'كم م في 200 سم؟', answer: 2 },
    { question: 'كم كيلو في 2000 غ؟', answer: 2 },
    { question: 'كم سم في ربع متر؟', answer: 25 },
    { question: 'كم مم في 5 سم؟', answer: 50 },
  ]),
  ...buildMathUnit(2, 7, 'الوقت والنقود', [
    { question: 'كم دقيقة في الساعة؟', answer: 60 },
    { question: 'كم ساعة في اليوم؟', answer: 24 },
    { question: 'كم ثانية في الدقيقة؟', answer: 60 },
    { question: 'كم يوم في الأسبوع؟', answer: 7 },
    { question: 'كم شهر في السنة؟', answer: 12 },
    { question: 'كم يوم في السنة العادية؟', answer: 365 },
    { question: 'كم دقيقة في نصف ساعة؟', answer: 30 },
    { question: 'كم ساعة في نصف يوم؟', answer: 12 },
  ]),
  ...buildMathUnit(2, 8, 'مراجعة شاملة — الصف الثاني', [
    addition(56,78), subtraction(134,67), multiplication(3,7), multiplication(4,6),
    division(2,4), division(3,5), addition(250,375), subtraction(800,425),
  ]),
];

// ──────────── GRADE 3 ────────────
const MT3: Lesson[] = [
  ...buildMathUnit(3, 1, 'الجمع والطرح حتى 10000', [
    addition(1234,2345), addition(3567,4321), subtraction(8765,3421), subtraction(9000,4567),
    addition(4567,3890), subtraction(7654,2987), addition(5432,2876), subtraction(6543,3210),
  ]),
  ...buildMathUnit(3, 2, 'جداول الضرب 6 و7', [
    multiplication(6,3), multiplication(6,5), multiplication(6,7), multiplication(6,9),
    multiplication(7,3), multiplication(7,5), multiplication(7,7), multiplication(7,9),
  ]),
  ...buildMathUnit(3, 3, 'جداول الضرب 8 و9', [
    multiplication(8,3), multiplication(8,5), multiplication(8,7), multiplication(8,9),
    multiplication(9,3), multiplication(9,5), multiplication(9,7), multiplication(9,9),
  ]),
  ...buildMathUnit(3, 4, 'القسمة المطوّلة', [
    division(3,4), division(4,4), division(5,4), division(6,4),
    division(3,5), division(4,5), division(5,5), division(6,5),
  ]),
  ...buildMathUnit(3, 5, 'الكسور — المفهوم والتمثيل', [
    { question: 'كم نصف (½) في الكامل؟', answer: 2 },
    { question: 'كم ربع (¼) في الكامل؟', answer: 4 },
    { question: 'كم ثلث (⅓) في الكامل؟', answer: 3 },
    { question: '½ + ½ = ؟', answer: 1 },
    { question: '¼ + ¼ + ¼ + ¼ = ؟', answer: 1 },
    { question: 'كم ربع في النصف؟', answer: 2 },
    { question: '⅓ + ⅓ + ⅓ = ؟', answer: 1 },
    { question: 'كم ثمن في النصف؟', answer: 4 },
  ]),
  ...buildMathUnit(3, 6, 'المحيط والمساحة', [
    { question: 'محيط مربع طوله 5؟', answer: 20 },
    { question: 'مساحة مربع طوله 5؟', answer: 25 },
    { question: 'محيط مستطيل 4×6؟', answer: 20 },
    { question: 'مساحة مستطيل 4×6؟', answer: 24 },
    { question: 'محيط مربع طوله 3؟', answer: 12 },
    { question: 'مساحة مربع طوله 3؟', answer: 9 },
    { question: 'محيط مستطيل 5×8؟', answer: 26 },
    { question: 'مساحة مستطيل 5×8؟', answer: 40 },
  ]),
  ...buildMathUnit(3, 7, 'الأعداد الزوجية والفردية', [
    { question: 'هل 24 عدد زوجي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: 'هل 37 عدد فردي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: 'ما أصغر عدد زوجي موجب؟', answer: 2 },
    { question: 'ما أصغر عدد فردي موجب؟', answer: 1 },
    { question: '4 × 3 — هل الناتج زوجي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: '3 × 5 — هل الناتج فردي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: 'هل 100 زوجي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: 'هل 99 فردي؟ (1=نعم، 0=لا)', answer: 1 },
  ]),
  ...buildMathUnit(3, 8, 'مراجعة شاملة — الصف الثالث', [
    addition(3456,2987), subtraction(8765,3210), multiplication(7,8), division(4,6),
    { question: 'محيط مربع طوله 7؟', answer: 28 },
    { question: 'مساحة مستطيل 3×9؟', answer: 27 },
    multiplication(9,9), division(5,7),
  ]),
];

// ──────────── GRADE 4 ────────────
const MT4: Lesson[] = [
  ...buildMathUnit(4, 1, 'الضرب بعدد مكوّن من رقمين', [
    multiplication(12,3), multiplication(14,5), multiplication(23,4), multiplication(32,3),
    multiplication(21,7), multiplication(43,2), multiplication(15,6), multiplication(24,4),
  ]),
  ...buildMathUnit(4, 2, 'القسمة الطويلة', [
    division(4,12), division(5,13), division(6,14), division(7,12),
    division(8,11), division(9,12), division(3,21), division(4,22),
  ]),
  ...buildMathUnit(4, 3, 'الكسور — الجمع والطرح', [
    { question: '1/4 + 2/4 = ؟ (بالأجزاء من 4)', answer: 3 },
    { question: '3/5 + 1/5 = ؟ (بالأجزاء من 5)', answer: 4 },
    { question: '5/6 - 2/6 = ؟ (بالأجزاء من 6)', answer: 3 },
    { question: '7/8 - 3/8 = ؟ (بالأجزاء من 8)', answer: 4 },
    { question: '2/3 + 0 = ؟ (بالأجزاء من 3)', answer: 2 },
    { question: '4/5 - 1/5 = ؟ (بالأجزاء من 5)', answer: 3 },
    { question: '1/2 + 1/2 = ؟ (كامل = 2 نصف)', answer: 2 },
    { question: '6/7 - 2/7 = ؟ (بالأجزاء من 7)', answer: 4 },
  ]),
  ...buildMathUnit(4, 4, 'الأعداد العشرية — المفهوم', [
    { question: '0.5 = ؟/10', answer: 5 },
    { question: '0.3 + 0.4 = ؟ (×10)', answer: 7 },
    { question: '1.0 - 0.6 = ؟ (×10)', answer: 4 },
    { question: '0.1 × 10 = ؟', answer: 1 },
    { question: '0.25 × 4 = ؟', answer: 1 },
    { question: '1.5 + 1.5 = ؟', answer: 3 },
    { question: '2.5 - 0.5 = ؟', answer: 2 },
    { question: '0.2 + 0.8 = ؟', answer: 1 },
  ]),
  ...buildMathUnit(4, 5, 'القياس — المساحة والحجم', [
    { question: 'مساحة مستطيل 7×9؟', answer: 63 },
    { question: 'مساحة مربع طوله 8؟', answer: 64 },
    { question: 'حجم مكعب طوله 2؟', answer: 8 },
    { question: 'حجم مكعب طوله 3؟', answer: 27 },
    { question: 'مساحة مثلث قاعدته 6 وارتفاعه 4؟', answer: 12 },
    { question: 'مساحة مثلث قاعدته 8 وارتفاعه 6؟', answer: 24 },
    { question: 'مساحة مستطيل 6×10؟', answer: 60 },
    { question: 'محيط مثلث 3-4-5؟', answer: 12 },
  ]),
  ...buildMathUnit(4, 6, 'الزوايا والأشكال الهندسية', [
    { question: 'كم درجة في الزاوية القائمة؟', answer: 90 },
    { question: 'كم درجة في المثلث؟', answer: 180 },
    { question: 'كم درجة في المستطيل؟', answer: 360 },
    { question: 'كم درجة في الدائرة الكاملة؟', answer: 360 },
    { question: 'كم زاوية في المثلث؟', answer: 3 },
    { question: 'كم درجة في الزاوية المستقيمة؟', answer: 180 },
    { question: 'كم زاوية قائمة في المستطيل؟', answer: 4 },
    { question: 'كم ضلعاً في المعين؟', answer: 4 },
  ]),
  ...buildMathUnit(4, 7, 'النسبة والتناسب — مقدمة', [
    { question: 'إذا كان 1 دولار = 3 ريال، فـ2 دولار = ؟ ريال', answer: 6 },
    { question: 'إذا كان 1 كغ = 2 كتاب، فـ5 كغ = ؟ كتاب', answer: 10 },
    { question: 'إذا اشتريت 3 قلم بـ9 ريال، فسعر القلم؟', answer: 3 },
    { question: 'إذا قطعت 5كم في ساعة، كم في 3 ساعات؟', answer: 15 },
    { question: 'إذا كان 2 = 4 فـ3 = ؟', answer: 6 },
    { question: 'نصف العدد 48 = ؟', answer: 24 },
    { question: 'ثلث العدد 99 = ؟', answer: 33 },
    { question: 'ربع العدد 80 = ؟', answer: 20 },
  ]),
  ...buildMathUnit(4, 8, 'مراجعة شاملة — الصف الرابع', [
    multiplication(23,4), division(7,13), { question: 'مساحة مربع طوله 9؟', answer: 81 },
    { question: 'كم درجة في المثلث؟', answer: 180 },
    multiplication(15,6), division(8,12), { question: 'حجم مكعب طوله 4؟', answer: 64 },
    { question: 'ربع العدد 120؟', answer: 30 },
  ]),
];

// ──────────── GRADE 5 ────────────
const MT5: Lesson[] = [
  ...buildMathUnit(5, 1, 'الأعداد الصحيحة الكبيرة', [
    addition(12345,23456), addition(34567,45678), subtraction(98765,43210), subtraction(87654,23456),
    addition(56789,23456), subtraction(75432,34567), addition(45678,34567), subtraction(93456,45678),
  ]),
  ...buildMathUnit(5, 2, 'الكسور المتكافئة', [
    { question: '1/2 = ؟/4', answer: 2 },
    { question: '2/3 = ؟/6', answer: 4 },
    { question: '3/4 = ؟/8', answer: 6 },
    { question: '1/3 = ؟/9', answer: 3 },
    { question: '2/5 = ؟/10', answer: 4 },
    { question: '4/6 مبسوطة = ؟/3', answer: 2 },
    { question: '6/8 مبسوطة = ؟/4', answer: 3 },
    { question: '9/12 مبسوطة = ؟/4', answer: 3 },
  ]),
  ...buildMathUnit(5, 3, 'جمع وطرح الكسور بمقامات مختلفة', [
    { question: '1/2 + 1/4 = ؟/4', answer: 3 },
    { question: '2/3 + 1/6 = ؟/6', answer: 5 },
    { question: '3/4 - 1/2 = ؟/4', answer: 1 },
    { question: '5/6 - 1/3 = ؟/6', answer: 3 },
    { question: '1/3 + 1/6 = ؟/6', answer: 3 },
    { question: '3/4 + 1/8 = ؟/8', answer: 7 },
    { question: '5/6 - 2/3 = ؟/6', answer: 1 },
    { question: '7/8 - 3/4 = ؟/8', answer: 1 },
  ]),
  ...buildMathUnit(5, 4, 'ضرب الكسور', [
    { question: '1/2 × 1/2 = ؟ (×4)', answer: 1 },
    { question: '2/3 × 3/4 = ؟ (×2)', answer: 1 },
    { question: '1/3 × 3 = ؟', answer: 1 },
    { question: '2/5 × 5 = ؟', answer: 2 },
    { question: '1/4 × 8 = ؟', answer: 2 },
    { question: '3/4 × 4 = ؟', answer: 3 },
    { question: '1/2 × 6 = ؟', answer: 3 },
    { question: '2/3 × 6 = ؟', answer: 4 },
  ]),
  ...buildMathUnit(5, 5, 'الأعداد العشرية — العمليات', [
    { question: '1.5 + 2.3 = ؟ (×10)', answer: 38 },
    { question: '4.7 - 2.3 = ؟ (×10)', answer: 24 },
    { question: '2.5 × 2 = ؟', answer: 5 },
    { question: '3.6 ÷ 3 = ؟ (×10)', answer: 12 },
    { question: '0.5 × 4 = ؟', answer: 2 },
    { question: '1.2 + 3.8 = ؟', answer: 5 },
    { question: '5.5 - 2.5 = ؟', answer: 3 },
    { question: '0.25 × 8 = ؟', answer: 2 },
  ]),
  ...buildMathUnit(5, 6, 'النسبة المئوية — مقدمة', [
    { question: '50% من 100 = ؟', answer: 50 },
    { question: '25% من 100 = ؟', answer: 25 },
    { question: '10% من 200 = ؟', answer: 20 },
    { question: '50% من 60 = ؟', answer: 30 },
    { question: '25% من 80 = ؟', answer: 20 },
    { question: '10% من 500 = ؟', answer: 50 },
    { question: '75% من 100 = ؟', answer: 75 },
    { question: '20% من 50 = ؟', answer: 10 },
  ]),
  ...buildMathUnit(5, 7, 'حساب المساحات المعقدة', [
    { question: 'مساحة مثلث قاعدته 10 وارتفاعه 6؟', answer: 30 },
    { question: 'مساحة متوازي أضلاع 8×5؟', answer: 40 },
    { question: 'مساحة مثلث قاعدته 12 وارتفاعه 8؟', answer: 48 },
    { question: 'مساحة شبه منحرف (6+4)×5 ÷2؟', answer: 25 },
    { question: 'مساحة مثلث قاعدته 14 وارتفاعه 6؟', answer: 42 },
    { question: 'مساحة متوازي أضلاع 9×7؟', answer: 63 },
    { question: 'مساحة شبه منحرف (8+4)×6 ÷2؟', answer: 36 },
    { question: 'مساحة مثلث قاعدته 16 وارتفاعه 10؟', answer: 80 },
  ]),
  ...buildMathUnit(5, 8, 'مراجعة شاملة — الصف الخامس', [
    { question: '50% من 80؟', answer: 40 },
    { question: '1/2 + 1/4 = ؟/4', answer: 3 },
    { question: 'مساحة مثلث 8×6؟', answer: 24 },
    { question: '2/3 × 6 = ؟', answer: 4 },
    { question: '10% من 350؟', answer: 35 },
    { question: '3/4 - 1/2 = ؟/4', answer: 1 },
    { question: '2.5 × 4 = ؟', answer: 10 },
    { question: '25% من 120؟', answer: 30 },
  ]),
];

// ──────────── GRADE 6 ────────────
const MT6: Lesson[] = [
  ...buildMathUnit(6, 1, 'الأعداد الصحيحة الموجبة والسالبة', [
    { question: '(-3) + 5 = ؟', answer: 2 },
    { question: '4 + (-7) = ؟', answer: -3 },
    { question: '(-5) - (-3) = ؟', answer: -2 },
    { question: '(-4) × 3 = ؟', answer: -12 },
    { question: '(-6) ÷ 2 = ؟', answer: -3 },
    { question: '(-2) × (-5) = ؟', answer: 10 },
    { question: '8 + (-8) = ؟', answer: 0 },
    { question: '(-9) + 4 = ؟', answer: -5 },
  ]),
  ...buildMathUnit(6, 2, 'النسبة والتناسب', [
    { question: 'إذا كان 3:4 = 9:؟', answer: 12 },
    { question: 'إذا كان 5:2 = 15:؟', answer: 6 },
    { question: 'إذا كان 2:7 = 6:؟', answer: 21 },
    { question: 'إذا كان 4:3 = 12:؟', answer: 9 },
    { question: 'إذا كان 1:5 = 3:؟', answer: 15 },
    { question: 'إذا كان 3:5 = 9:؟', answer: 15 },
    { question: 'إذا كان 2:9 = 4:؟', answer: 18 },
    { question: 'إذا كان 7:2 = 14:؟', answer: 4 },
  ]),
  ...buildMathUnit(6, 3, 'النسبة المئوية — التطبيقات', [
    { question: '30% من 90 = ؟', answer: 27 },
    { question: '15% من 200 = ؟', answer: 30 },
    { question: '40% من 150 = ؟', answer: 60 },
    { question: '20% من 350 = ؟', answer: 70 },
    { question: '5% من 400 = ؟', answer: 20 },
    { question: '12% من 100 = ؟', answer: 12 },
    { question: '75% من 200 = ؟', answer: 150 },
    { question: '8% من 500 = ؟', answer: 40 },
  ]),
  ...buildMathUnit(6, 4, 'الجبر — مقدمة', [
    { question: 'إذا x + 3 = 7، فـx = ؟', answer: 4 },
    { question: 'إذا x - 4 = 6، فـx = ؟', answer: 10 },
    { question: 'إذا 2x = 12، فـx = ؟', answer: 6 },
    { question: 'إذا x/3 = 5، فـx = ؟', answer: 15 },
    { question: 'إذا x + 8 = 15، فـx = ؟', answer: 7 },
    { question: 'إذا 3x = 21، فـx = ؟', answer: 7 },
    { question: 'إذا x - 9 = 4، فـx = ؟', answer: 13 },
    { question: 'إذا x/4 = 6، فـx = ؟', answer: 24 },
  ]),
  ...buildMathUnit(6, 5, 'المعادلات الخطية البسيطة', [
    { question: 'إذا 2x + 1 = 9، فـx = ؟', answer: 4 },
    { question: 'إذا 3x - 2 = 7، فـx = ؟', answer: 3 },
    { question: 'إذا 4x + 4 = 16، فـx = ؟', answer: 3 },
    { question: 'إذا 5x - 5 = 20، فـx = ؟', answer: 5 },
    { question: 'إذا 2x + 6 = 14، فـx = ؟', answer: 4 },
    { question: 'إذا 3x + 3 = 18، فـx = ؟', answer: 5 },
    { question: 'إذا 4x - 8 = 8، فـx = ؟', answer: 4 },
    { question: 'إذا 6x + 6 = 36، فـx = ؟', answer: 5 },
  ]),
  ...buildMathUnit(6, 6, 'الأشكال الهندسية ثلاثية الأبعاد', [
    { question: 'حجم مكعب طوله 5؟', answer: 125 },
    { question: 'مساحة سطح مكعب طوله 3؟', answer: 54 },
    { question: 'حجم متوازي مستطيلات 3×4×5؟', answer: 60 },
    { question: 'حجم متوازي مستطيلات 2×6×5؟', answer: 60 },
    { question: 'حجم مكعب طوله 4؟', answer: 64 },
    { question: 'مساحة سطح مكعب طوله 2؟', answer: 24 },
    { question: 'حجم متوازي مستطيلات 3×3×9؟', answer: 81 },
    { question: 'مساحة سطح مكعب طوله 4؟', answer: 96 },
  ]),
  ...buildMathUnit(6, 7, 'الإحصاء — الوسط والوسيط', [
    { question: 'وسط حسابي: 2+4+6 ÷ 3 = ؟', answer: 4 },
    { question: 'وسط حسابي: 5+10+15 ÷ 3 = ؟', answer: 10 },
    { question: 'وسط حسابي: 1+3+5+7 ÷ 4 = ؟', answer: 4 },
    { question: 'وسط حسابي: 10+20+30+40 ÷ 4 = ؟', answer: 25 },
    { question: 'وسيط: 1,3,5 = ؟', answer: 3 },
    { question: 'وسيط: 2,4,6,8 = ؟', answer: 5 },
    { question: 'منوال: 1,2,2,3,4 = ؟', answer: 2 },
    { question: 'مدى: 3,7,12,15 = ؟', answer: 12 },
  ]),
  ...buildMathUnit(6, 8, 'مراجعة شاملة — الصف السادس', [
    { question: '(-4) + 9 = ؟', answer: 5 },
    { question: '3:5 = 9:؟', answer: 15 },
    { question: '30% من 120 = ؟', answer: 36 },
    { question: 'إذا 2x + 2 = 10، فـx = ؟', answer: 4 },
    { question: 'حجم مكعب 4؟', answer: 64 },
    { question: 'وسط: 4+8+12 ÷3 = ؟', answer: 8 },
    { question: '(-3) × (-4) = ؟', answer: 12 },
    { question: '20% من 250 = ؟', answer: 50 },
  ]),
];

// ──────────── GRADE 7 ────────────
const MT7: Lesson[] = [
  ...buildMathUnit(7, 1, 'الأعداد الصحيحة والعمليات', [
    { question: '(-7) × (-8) = ؟', answer: 56 },
    { question: '(-15) ÷ 3 = ؟', answer: -5 },
    { question: '(-6) + (-9) = ؟', answer: -15 },
    { question: '12 - (-8) = ؟', answer: 20 },
    { question: '(-4) × 7 = ؟', answer: -28 },
    { question: '(-18) ÷ (-6) = ؟', answer: 3 },
    { question: '(-5) - 8 = ؟', answer: -13 },
    { question: '(-3) × (-3) × (-3) = ؟', answer: -27 },
  ]),
  ...buildMathUnit(7, 2, 'الكسور والأعداد العشرية', [
    { question: '2/3 ÷ 1/3 = ؟', answer: 2 },
    { question: '3/4 × 8 = ؟', answer: 6 },
    { question: '1.5 × 4 = ؟', answer: 6 },
    { question: '2.4 ÷ 0.8 = ؟', answer: 3 },
    { question: '5/6 × 12 = ؟', answer: 10 },
    { question: '4/5 ÷ 2/5 = ؟', answer: 2 },
    { question: '3.6 × 5 = ؟', answer: 18 },
    { question: '7.2 ÷ 0.9 = ؟', answer: 8 },
  ]),
  ...buildMathUnit(7, 3, 'الجبر — المعادلات والمتباينات', [
    { question: '3x + 7 = 22، x = ؟', answer: 5 },
    { question: '4x - 9 = 11، x = ؟', answer: 5 },
    { question: '5x + 3 = 28، x = ؟', answer: 5 },
    { question: '2x - 6 = 14، x = ؟', answer: 10 },
    { question: '6x + 12 = 42، x = ؟', answer: 5 },
    { question: '7x - 14 = 21، x = ؟', answer: 5 },
    { question: '3x + 15 = 30، x = ؟', answer: 5 },
    { question: '8x - 24 = 16، x = ؟', answer: 5 },
  ]),
  ...buildMathUnit(7, 4, 'النسبة المئوية — الزيادة والنقصان', [
    { question: 'زيادة 100 بنسبة 20% = ؟', answer: 120 },
    { question: 'نقصان 200 بنسبة 10% = ؟', answer: 180 },
    { question: 'زيادة 50 بنسبة 40% = ؟', answer: 70 },
    { question: 'نقصان 500 بنسبة 30% = ؟', answer: 350 },
    { question: 'زيادة 80 بنسبة 25% = ؟', answer: 100 },
    { question: 'نقصان 300 بنسبة 20% = ؟', answer: 240 },
    { question: 'زيادة 60 بنسبة 50% = ؟', answer: 90 },
    { question: 'نقصان 400 بنسبة 25% = ؟', answer: 300 },
  ]),
  ...buildMathUnit(7, 5, 'المثلثات والزوايا', [
    { question: 'مجموع زوايا المثلث = ؟ درجة', answer: 180 },
    { question: 'مجموع زوايا المربع = ؟ درجة', answer: 360 },
    { question: 'مجموع زوايا المثلث إذا كانت زاويتان 60 و60 = ؟', answer: 60 },
    { question: 'زاوية المثلث القائم الثالثة إذا كانت 30 = ؟', answer: 60 },
    { question: 'مجموع زوايا المضلع 5 أضلاع = ؟ درجة', answer: 540 },
    { question: 'الزاوية المجاورة لـ70 على مستقيم = ؟', answer: 110 },
    { question: 'مجموع زوايا المسدس = ؟ درجة', answer: 720 },
    { question: 'الزاوية الرأسية لـ45 = ؟', answer: 45 },
  ]),
  ...buildMathUnit(7, 6, 'مساحة الدائرة ومحيطها', [
    { question: 'محيط دائرة نصف قطرها 7 (× 1/22 ≈ 44)؟', answer: 44 },
    { question: 'مساحة دائرة نصف قطرها 7 (≈154)؟', answer: 154 },
    { question: 'محيط دائرة قطرها 14 (≈44)؟', answer: 44 },
    { question: 'نصف قطر دائرة محيطها 44 (≈7)؟', answer: 7 },
    { question: 'محيط دائرة نصف قطرها 3.5 (≈22)؟', answer: 22 },
    { question: 'مساحة دائرة نصف قطرها 3.5 (≈38)؟', answer: 38 },
    { question: 'محيط نصف دائرة نصف قطرها 7 (≈36)؟', answer: 36 },
    { question: 'مساحة نصف دائرة نصف قطرها 7 (≈77)؟', answer: 77 },
  ]),
  ...buildMathUnit(7, 7, 'الإحصاء والاحتمالات', [
    { question: 'احتمال رأس عند رمي عملة = ؟/2', answer: 1 },
    { question: 'احتمال الحصول على 6 في نرد = ؟/6', answer: 1 },
    { question: 'احتمال حدث مستحيل = ؟', answer: 0 },
    { question: 'احتمال حدث مؤكد = ؟', answer: 1 },
    { question: 'وسط: 10,20,30,40,50 = ؟', answer: 30 },
    { question: 'وسيط: 3,5,7,9,11 = ؟', answer: 7 },
    { question: 'مدى: 5,15,25,35 = ؟', answer: 30 },
    { question: 'منوال: 2,3,3,4,5 = ؟', answer: 3 },
  ]),
  ...buildMathUnit(7, 8, 'مراجعة شاملة — الصف السابع', [
    { question: '(-7)×(-6) = ؟', answer: 42 },
    { question: '3x+9=30، x=؟', answer: 7 },
    { question: 'زيادة 80 بـ25% = ؟', answer: 100 },
    { question: 'مجموع زوايا المثلث = ؟', answer: 180 },
    { question: 'محيط دائرة نصف قطرها 7 ≈؟', answer: 44 },
    { question: 'احتمال مؤكد = ؟', answer: 1 },
    { question: '2/3 ÷ 1/3 = ؟', answer: 2 },
    { question: 'وسط: 2,4,6,8,10 = ؟', answer: 6 },
  ]),
];

// ──────────── GRADE 8 ────────────
const MT8: Lesson[] = [
  ...buildMathUnit(8, 1, 'الجبر — المعادلات التربيعية', [
    { question: 'x² = 25، x = ؟ (الموجبة)', answer: 5 },
    { question: 'x² = 49، x = ؟ (الموجبة)', answer: 7 },
    { question: 'x² - 16 = 0، x = ؟ (الموجبة)', answer: 4 },
    { question: 'x² = 100، x = ؟ (الموجبة)', answer: 10 },
    { question: '(x+2)² = 9، x = ؟ (الموجبة)', answer: 1 },
    { question: 'x² - 4 = 0، x = ؟ (الموجبة)', answer: 2 },
    { question: 'x² = 36، x = ؟ (الموجبة)', answer: 6 },
    { question: 'x² - 81 = 0، x = ؟ (الموجبة)', answer: 9 },
  ]),
  ...buildMathUnit(8, 2, 'نظرية فيثاغورس', [
    { question: 'وتر مثلث 3-4 = ؟', answer: 5 },
    { question: 'وتر مثلث 5-12 = ؟', answer: 13 },
    { question: 'وتر مثلث 6-8 = ؟', answer: 10 },
    { question: 'وتر مثلث 8-15 = ؟', answer: 17 },
    { question: 'وتر مثلث 7-24 = ؟', answer: 25 },
    { question: 'وتر مثلث 9-12 = ؟', answer: 15 },
    { question: 'وتر مثلث 20-21 = ؟', answer: 29 },
    { question: 'الضلع المجهول في مثلث وتره 10 وضلع 6 = ؟', answer: 8 },
  ]),
  ...buildMathUnit(8, 3, 'الأس والجذر التربيعي', [
    { question: '√64 = ؟', answer: 8 },
    { question: '√121 = ؟', answer: 11 },
    { question: '√144 = ؟', answer: 12 },
    { question: '2³ = ؟', answer: 8 },
    { question: '3³ = ؟', answer: 27 },
    { question: '4³ = ؟', answer: 64 },
    { question: '√225 = ؟', answer: 15 },
    { question: '√256 = ؟', answer: 16 },
  ]),
  ...buildMathUnit(8, 4, 'المعادلات ذات المتغيرين', [
    { question: 'x+y=10 و x=6، y=؟', answer: 4 },
    { question: 'x+y=15 و y=7، x=؟', answer: 8 },
    { question: '2x+y=14 و x=4، y=؟', answer: 6 },
    { question: 'x+3y=13 و y=3، x=؟', answer: 4 },
    { question: 'x-y=5 و y=3، x=؟', answer: 8 },
    { question: '3x+2y=20 و x=4، y=؟', answer: 4 },
    { question: 'x+y=20 و x=12، y=؟', answer: 8 },
    { question: '4x-y=11 و x=3، y=؟', answer: 1 },
  ]),
  ...buildMathUnit(8, 5, 'تحليل المقدار الجبري', [
    { question: 'عوامل 6 هي 1,2,3,؟', answer: 6 },
    { question: 'عوامل 12 هي 1,2,3,4,6,؟', answer: 12 },
    { question: 'القاسم المشترك الأكبر لـ12 و18 = ؟', answer: 6 },
    { question: 'القاسم المشترك الأكبر لـ20 و30 = ؟', answer: 10 },
    { question: 'المضاعف المشترك الأصغر لـ4 و6 = ؟', answer: 12 },
    { question: 'المضاعف المشترك الأصغر لـ5 و7 = ؟', answer: 35 },
    { question: 'القاسم المشترك الأكبر لـ8 و12 = ؟', answer: 4 },
    { question: 'المضاعف المشترك الأصغر لـ3 و9 = ؟', answer: 9 },
  ]),
  ...buildMathUnit(8, 6, 'الدوال والعلاقات', [
    { question: 'إذا f(x)=2x+3، فـf(4) = ؟', answer: 11 },
    { question: 'إذا f(x)=x²، فـf(5) = ؟', answer: 25 },
    { question: 'إذا f(x)=3x-2، فـf(3) = ؟', answer: 7 },
    { question: 'إذا f(x)=x+7، فـf(6) = ؟', answer: 13 },
    { question: 'إذا f(x)=5x، فـf(4) = ؟', answer: 20 },
    { question: 'إذا f(x)=x²+1، فـf(3) = ؟', answer: 10 },
    { question: 'إذا f(x)=2x-5، فـf(7) = ؟', answer: 9 },
    { question: 'إذا f(x)=4x+4، فـf(4) = ؟', answer: 20 },
  ]),
  ...buildMathUnit(8, 7, 'الاحتمالات — التجارب والنتائج', [
    { question: 'احتمال عدد زوجي بنرد = ؟/6', answer: 3 },
    { question: 'احتمال عدد أكبر من 4 بنرد = ؟/6', answer: 2 },
    { question: 'احتمال سحب كرة حمراء من 3حمراء+7زرقاء = ؟/10', answer: 3 },
    { question: 'عدد نتائج رمي عملتين = ؟', answer: 4 },
    { question: 'احتمال الحصول على أقل من 3 بنرد = ؟/6', answer: 2 },
    { question: 'مجموع احتمال حدث + ضد الحدث = ؟', answer: 1 },
    { question: 'احتمال رمي عملتين وخروج رأسين = ؟/4', answer: 1 },
    { question: 'احتمال سحب ورقة ملكة من 52 ورقة = ؟/13', answer: 1 },
  ]),
  ...buildMathUnit(8, 8, 'مراجعة شاملة — الصف الثامن', [
    { question: 'وتر مثلث 3-4 = ؟', answer: 5 },
    { question: '√169 = ؟', answer: 13 },
    { question: '2x+y=16 و x=5، y=؟', answer: 6 },
    { question: 'القاسم المشترك الأكبر لـ24 و36 = ؟', answer: 12 },
    { question: 'إذا f(x)=3x+1، فـf(6) = ؟', answer: 19 },
    { question: 'احتمال عدد فردي بنرد = ؟/6', answer: 3 },
    { question: '3³ = ؟', answer: 27 },
    { question: 'x² = 64، x = ؟ (الموجبة)', answer: 8 },
  ]),
];

// ──────────── GRADE 9 ────────────
const MT9: Lesson[] = [
  ...buildMathUnit(9, 1, 'الجبر المتقدم — المتعددات الحدود', [
    { question: '(x+2)(x+3) = x²+5x+؟', answer: 6 },
    { question: '(x+4)(x+4) = x²+8x+؟', answer: 16 },
    { question: '(x-3)(x-3) = x²-6x+؟', answer: 9 },
    { question: '(x+5)(x-5) = x²-؟', answer: 25 },
    { question: '(2x+1)(x+3) = 2x²+7x+؟', answer: 3 },
    { question: '(x+2)² = x²+4x+؟', answer: 4 },
    { question: '(x-7)(x+7) = x²-؟', answer: 49 },
    { question: '(3x+2)(x+1) = 3x²+5x+؟', answer: 2 },
  ]),
  ...buildMathUnit(9, 2, 'المعادلات التربيعية — الحل', [
    { question: 'x²-5x+6=0 → x=2 أو x=؟', answer: 3 },
    { question: 'x²-7x+12=0 → x=3 أو x=؟', answer: 4 },
    { question: 'x²-9x+20=0 → x=4 أو x=؟', answer: 5 },
    { question: 'x²+x-6=0 → x=2 أو x=؟', answer: -3 },
    { question: 'x²-4x+4=0 → x=؟', answer: 2 },
    { question: 'x²-6x+9=0 → x=؟', answer: 3 },
    { question: 'x²+5x+6=0 → x=-2 أو x=؟', answer: -3 },
    { question: 'x²-3x-10=0 → x=5 أو x=؟', answer: -2 },
  ]),
  ...buildMathUnit(9, 3, 'المثلثات — نسب مثلثية', [
    { question: 'sin30° = ؟ (×2)', answer: 1 },
    { question: 'cos60° = ؟ (×2)', answer: 1 },
    { question: 'sin90° = ؟', answer: 1 },
    { question: 'cos0° = ؟', answer: 1 },
    { question: 'sin45° = cos؟°', answer: 45 },
    { question: 'tan45° = ؟', answer: 1 },
    { question: 'sin0° = ؟', answer: 0 },
    { question: 'cos90° = ؟', answer: 0 },
  ]),
  ...buildMathUnit(9, 4, 'الهندسة التحليلية — الإحداثيات', [
    { question: 'بُعد النقطة (3,4) عن الأصل = ؟', answer: 5 },
    { question: 'بُعد النقطة (5,12) عن الأصل = ؟', answer: 13 },
    { question: 'منتصف (0,0) و(4,6) هو (2,؟)', answer: 3 },
    { question: 'منتصف (2,4) و(6,8) هو (4,؟)', answer: 6 },
    { question: 'ميل خط (0,0) و(3,6) = ؟', answer: 2 },
    { question: 'ميل خط (1,2) و(3,6) = ؟', answer: 2 },
    { question: 'بُعد (6,8) عن الأصل = ؟', answer: 10 },
    { question: 'ميل خط (0,0) و(5,10) = ؟', answer: 2 },
  ]),
  ...buildMathUnit(9, 5, 'الدوال — الأسية واللوغاريتم', [
    { question: '2⁴ = ؟', answer: 16 },
    { question: '2⁵ = ؟', answer: 32 },
    { question: '3⁴ = ؟', answer: 81 },
    { question: '10² = ؟', answer: 100 },
    { question: '10³ = ؟', answer: 1000 },
    { question: '2¹⁰ = ؟', answer: 1024 },
    { question: 'log₁₀(1000) = ؟', answer: 3 },
    { question: 'log₂(8) = ؟', answer: 3 },
  ]),
  ...buildMathUnit(9, 6, 'الإحصاء — التوزيع والتمثيل', [
    { question: 'وسط 5,10,15,20,25 = ؟', answer: 15 },
    { question: 'وسيط 3,6,9,12,15 = ؟', answer: 9 },
    { question: 'مدى 7,14,21,28 = ؟', answer: 21 },
    { question: 'الانحراف المعياري لـ{1,1,1} = ؟', answer: 0 },
    { question: 'التباين لـ{0,2,4} = ؟', answer: 4 },
    { question: 'وسط {6,8,10,12} = ؟', answer: 9 },
    { question: 'وسيط {2,4,6,8} = ؟', answer: 5 },
    { question: 'منوال {1,1,2,3,3,3,4} = ؟', answer: 3 },
  ]),
  ...buildMathUnit(9, 7, 'تطبيقات حياتية رياضية', [
    { question: 'قرض 10000 بفائدة 5%/سنة لسنة = ؟ فائدة', answer: 500 },
    { question: 'خصم 20% على 150 = السعر بعد الخصم = ؟', answer: 120 },
    { question: 'ربح 30% على تكلفة 200 = سعر البيع = ؟', answer: 260 },
    { question: 'ضريبة 15% على 400 = ؟ ضريبة', answer: 60 },
    { question: 'فائدة مركبة: 100 × (1+0.1)² = ؟ تقريبا', answer: 121 },
    { question: 'خصم 25% على 200 = السعر = ؟', answer: 150 },
    { question: 'ربح 50% على 80 = سعر البيع = ؟', answer: 120 },
    { question: 'ضريبة 10% على 500 = ؟ ضريبة', answer: 50 },
  ]),
  ...buildMathUnit(9, 8, 'مراجعة شاملة — الصف التاسع', [
    { question: '(x+3)(x+4) = x²+7x+؟', answer: 12 },
    { question: 'sin90° = ؟', answer: 1 },
    { question: 'بُعد (3,4) عن الأصل = ؟', answer: 5 },
    { question: '2⁵ = ؟', answer: 32 },
    { question: 'وسط 2,4,6,8,10 = ؟', answer: 6 },
    { question: 'خصم 20% على 250 = ؟', answer: 200 },
    { question: 'x²-5x+6=0 → حل أصغر = ؟', answer: 2 },
    { question: 'log₁₀(100) = ؟', answer: 2 },
  ]),
];

// ──────────── GRADE 10 ────────────
const MT10: Lesson[] = [
  ...buildMathUnit(10, 1, 'حساب المثلثات المتقدم', [
    { question: 'sin²θ + cos²θ = ؟', answer: 1 },
    { question: 'sin60° = ؟ (×√3 ≈1.73، ×2=؟)', answer: 2 },
    { question: '1 + tan²θ = sec²θ، إذا tanθ=1 فـsecθ = ؟ (تقريبا ×10)', answer: 14 },
    { question: 'cos(A+B) = cosAcosB - sinAsinB، إذا A=B=60 فالناتج (×4) = ؟', answer: -2 },
    { question: 'sin2θ = 2sinθcosθ، إذا sinθcosθ=0.5 فـsin2θ = ؟', answer: 1 },
    { question: 'إذا sinθ=0.6 فـcosθ=0.8، فـtanθ = ؟ (×10)', answer: 8 },
    { question: 'tan30° = 1/√3 ≈ 0.577 × 100 = ؟ تقريبا', answer: 58 },
    { question: 'sin(90°-θ) = cosθ، إذا sinθ=0.7 فـcos(90°-θ) = ؟ (×10)', answer: 7 },
  ]),
  ...buildMathUnit(10, 2, 'الجبر المتقدم — الدوال', [
    { question: 'إذا f(x)=x²-4، فـf(3) = ؟', answer: 5 },
    { question: 'إذا f(x)=2x²+3x-5، فـf(2) = ؟', answer: 9 },
    { question: 'إذا g(x)=x³، فـg(3) = ؟', answer: 27 },
    { question: 'إذا f(x)=√x، فـf(25) = ؟', answer: 5 },
    { question: 'إذا f(x)=|x-3|، فـf(7) = ؟', answer: 4 },
    { question: 'إذا f(x)=1/x، فـf(5) = ؟ (×10)', answer: 2 },
    { question: 'إذا f(x)=log₁₀(x)، فـf(100) = ؟', answer: 2 },
    { question: 'إذا f(x)=2ˣ، فـf(6) = ؟', answer: 64 },
  ]),
  ...buildMathUnit(10, 3, 'الهندسة — الدائرة والمماس', [
    { question: 'مساحة دائرة نصف قطرها 10 ≈؟ (π≈3.14، تقريب للعشرات)', answer: 314 },
    { question: 'محيط دائرة نصف قطرها 10 ≈؟', answer: 63 },
    { question: 'طول قوس بزاوية 90° في دائرة نصف قطرها 4 ≈؟', answer: 6 },
    { question: 'مساحة قطاع 60° في دائرة نصف قطرها 6 ≈؟', answer: 19 },
    { question: 'المماس من نقطة خارجية على بُعد 10 من المركز (نصف قطر 6) ≈؟', answer: 8 },
    { question: 'زاوية المركز ضعف زاوية المحيط على نفس القوس، إذا زاوية المحيط 40° فزاوية المركز = ؟', answer: 80 },
    { question: 'قطر دائرة محيطها 62.8 ≈؟', answer: 20 },
    { question: 'مساحة دائرة قطرها 14 ≈؟ (تقريب)', answer: 154 },
  ]),
  ...buildMathUnit(10, 4, 'حساب التفاضل — المشتقات', [
    { question: 'd/dx(x²) = ؟x', answer: 2 },
    { question: 'd/dx(x³) = ؟x²', answer: 3 },
    { question: 'd/dx(5x) = ؟', answer: 5 },
    { question: 'd/dx(x⁴) = ؟x³', answer: 4 },
    { question: 'd/dx(3x²) = ؟x', answer: 6 },
    { question: 'd/dx(7) = ؟', answer: 0 },
    { question: 'd/dx(x⁵) = ؟x⁴', answer: 5 },
    { question: 'd/dx(2x³) = ؟x²', answer: 6 },
  ]),
  ...buildMathUnit(10, 5, 'المتتاليات والمتسلسلات', [
    { question: 'حد رقم 5 في متتالية 2,4,6,8,... = ؟', answer: 10 },
    { question: 'مجموع 1+2+3+...+10 = ؟', answer: 55 },
    { question: 'مجموع 1+3+5+...+9 (5 حدود) = ؟', answer: 25 },
    { question: 'الحد الأول في 3,6,12,24 = ؟', answer: 3 },
    { question: 'حد رقم 6 في 1,2,4,8,... = ؟', answer: 32 },
    { question: 'مجموع 2+4+6+8+10 = ؟', answer: 30 },
    { question: 'الأساس في 3,6,12,24 = ؟', answer: 2 },
    { question: 'مجموع أول 5 حدود: 1+4+9+16+25 = ؟', answer: 55 },
  ]),
  ...buildMathUnit(10, 6, 'حساب التكامل — مقدمة', [
    { question: '∫x dx = x²/2 + C، إذا x=4 فالقيمة × 2 = ؟', answer: 16 },
    { question: '∫2x dx = ؟x² + C', answer: 1 },
    { question: '∫3x² dx = ؟x³ + C', answer: 1 },
    { question: 'مساحة تحت f(x)=2 من x=0 إلى x=5 = ؟', answer: 10 },
    { question: 'مساحة تحت f(x)=x من x=0 إلى x=4 = ؟', answer: 8 },
    { question: '∫5 dx = ؟x + C', answer: 5 },
    { question: 'مساحة تحت f(x)=3 من x=0 إلى x=6 = ؟', answer: 18 },
    { question: 'مساحة تحت f(x)=x من x=0 إلى x=6 = ؟', answer: 18 },
  ]),
  ...buildMathUnit(10, 7, 'الاحتمالات المتقدمة', [
    { question: 'C(5,2) = ؟ (التوافيق)', answer: 10 },
    { question: 'C(6,3) = ؟', answer: 20 },
    { question: 'P(5,2) = ؟ (التباديل)', answer: 20 },
    { question: 'C(4,2) = ؟', answer: 6 },
    { question: 'P(4,2) = ؟', answer: 12 },
    { question: 'احتمال سحب ورقتين حمراوتين من 52 ≈ C(26,2)/C(52,2) × 100 ≈ ؟', answer: 24 },
    { question: 'C(7,3) = ؟', answer: 35 },
    { question: 'P(6,2) = ؟', answer: 30 },
  ]),
  ...buildMathUnit(10, 8, 'مراجعة شاملة — الصف العاشر', [
    { question: 'sin²θ+cos²θ = ؟', answer: 1 },
    { question: 'إذا f(x)=x²-4، فـf(5) = ؟', answer: 21 },
    { question: 'مجموع 1+2+...+10 = ؟', answer: 55 },
    { question: 'd/dx(4x²) = ؟x', answer: 8 },
    { question: 'C(5,3) = ؟', answer: 10 },
    { question: 'مساحة تحت f(x)=4 من 0 إلى 5 = ؟', answer: 20 },
    { question: 'g(x)=x³، g(4) = ؟', answer: 64 },
    { question: 'زاوية المركز إذا زاوية المحيط 35° = ؟', answer: 70 },
  ]),
];

// ──────────── GRADE 11 ────────────
const MT11: Lesson[] = [
  ...buildMathUnit(11, 1, 'الجبر المتقدم — الدوال المركبة', [
    { question: 'إذا f(x)=2x+1 وg(x)=x²، فـf(g(3)) = ؟', answer: 19 },
    { question: 'إذا f(x)=x+4 وg(x)=3x، فـg(f(2)) = ؟', answer: 18 },
    { question: 'الدالة العكسية لـf(x)=2x → f⁻¹(x) = x/؟', answer: 2 },
    { question: 'إذا f(x)=x-5، فـf⁻¹(3) = ؟', answer: 8 },
    { question: 'إذا f(x)=3x+6، فـf⁻¹(x) = (x-؟)/3', answer: 6 },
    { question: 'إذا f(x)=x² وg(x)=x+1، فـg(f(3)) = ؟', answer: 10 },
    { question: 'إذا f(x)=2x وg(x)=x+3، فـf(g(4)) = ؟', answer: 14 },
    { question: 'الدالة العكسية لـf(x)=5x → f⁻¹(15) = ؟', answer: 3 },
  ]),
  ...buildMathUnit(11, 2, 'حساب التفاضل — القواعد المتقدمة', [
    { question: 'd/dx(sin x) = cos x، إذا x=0 فالمشتقة = ؟', answer: 1 },
    { question: 'd/dx(cos x) = -sin x، إذا x=90° فالمشتقة = ؟', answer: -1 },
    { question: 'd/dx(eˣ) = eˣ، إذا x=0 فالقيمة = ؟', answer: 1 },
    { question: 'd/dx(ln x) = 1/x، إذا x=1 فالمشتقة = ؟', answer: 1 },
    { question: 'قاعدة السلسلة: d/dx(u²) = 2u·u\'، إذا u=3x² وu\'=6x، فعند x=1: ؟', answer: 18 },
    { question: 'd/dx(x·sin x) = sin x + x·cos x، عند x=0: ؟', answer: 0 },
    { question: 'نقطة الحدية لـf(x)=x²-4x+3 عند f\'(x)=0 → x = ؟', answer: 2 },
    { question: 'd/dx(x⁶) = ؟x⁵', answer: 6 },
  ]),
  ...buildMathUnit(11, 3, 'حساب التكامل المتقدم', [
    { question: '∫₀¹ x dx = ؟ (×2)', answer: 1 },
    { question: '∫₀² x² dx = ؟ (≈8/3 × 3 = 8)', answer: 8 },
    { question: '∫₀³ 2 dx = ؟', answer: 6 },
    { question: '∫₁² x dx = ؟ (×2=3)', answer: 3 },
    { question: '∫₀⁴ 3 dx = ؟', answer: 12 },
    { question: '∫₀² 2x dx = ؟', answer: 4 },
    { question: '∫₀³ x dx = ؟ (×2=9)', answer: 9 },
    { question: '∫₁³ 2 dx = ؟', answer: 4 },
  ]),
  ...buildMathUnit(11, 4, 'المتتاليات الحسابية والهندسية', [
    { question: 'الحد العام للمتتالية الحسابية 2,5,8,11,... = 2+؟(n-1)', answer: 3 },
    { question: 'مجموع 10 حدود لـ2+5+8+11+... = ؟', answer: 155 },
    { question: 'الحد رقم 8 في 1,2,4,8,... = ؟', answer: 128 },
    { question: 'مجموع أول 5 حدود لـ1+2+4+8+... = ؟', answer: 31 },
    { question: 'الفرق المشترك في 3,7,11,15 = ؟', answer: 4 },
    { question: 'الأساس في 2,6,18,54 = ؟', answer: 3 },
    { question: 'الحد رقم 5 في 3,7,11,15,... = ؟', answer: 19 },
    { question: 'مجموع أول 6 حدود لـ1+3+9+27+... = ؟', answer: 364 },
  ]),
  ...buildMathUnit(11, 5, 'الفيزياء الرياضية — الحركة', [
    { question: 'السرعة = مسافة/زمن، مسافة 120 في زمن 3 = ؟', answer: 40 },
    { question: 'التسارع = Δسرعة/زمن، Δسرعة=30 في 5 ثوان = ؟', answer: 6 },
    { question: 'الفرق في السرعة من 0 إلى 60 في 10 ثوان = تسارع ؟', answer: 6 },
    { question: 'زمن السقوط الحر h=5t² → t إذا h=80 = ؟', answer: 4 },
    { question: 'الشغل = قوة × مسافة، قوة 50 × مسافة 6 = ؟', answer: 300 },
    { question: 'الطاقة الحركية = ½mv²، m=2 v=4 → KE=؟', answer: 16 },
    { question: 'الضغط = قوة/مساحة، قوة 200 على مساحة 4 = ؟', answer: 50 },
    { question: 'الكثافة = كتلة/حجم، كتلة 120 على حجم 3 = ؟', answer: 40 },
  ]),
  ...buildMathUnit(11, 6, 'نظرية ذات الحدين', [
    { question: 'معامل x² في (1+x)⁴ = C(4,2) = ؟', answer: 6 },
    { question: 'معامل x في (1+x)⁵ = C(5,1) = ؟', answer: 5 },
    { question: 'C(5,2) = ؟', answer: 10 },
    { question: '(1+x)³ الحد المستقل = ؟', answer: 1 },
    { question: 'C(6,3) = ؟', answer: 20 },
    { question: 'معامل x³ في (1+x)⁶ = C(6,3) = ؟', answer: 20 },
    { question: 'C(7,2) = ؟', answer: 21 },
    { question: '(a+b)² = a²+2ab+b²، معامل ab = ؟', answer: 2 },
  ]),
  ...buildMathUnit(11, 7, 'الإحصاء الرياضي المتقدم', [
    { question: 'وسط {4,6,8,10,12} = ؟', answer: 8 },
    { question: 'تباين {2,4,6} = ؟', answer: 4 },
    { question: 'انحراف معياري {4,4,4} = ؟', answer: 0 },
    { question: 'معامل الارتباط بين متغيرين متطابقين = ؟', answer: 1 },
    { question: 'وسيط {1,2,3,4,5} = ؟', answer: 3 },
    { question: 'أعلى قيمة - أدنى قيمة في {3,7,12,18} = المدى = ؟', answer: 15 },
    { question: 'الربيع الأول Q1 في {1,2,3,4,5,6,7} = ؟', answer: 2 },
    { question: 'الربيع الثالث Q3 في {1,2,3,4,5,6,7} = ؟', answer: 6 },
  ]),
  ...buildMathUnit(11, 8, 'مراجعة شاملة — الصف الحادي عشر', [
    { question: 'إذا f(x)=2x+1 وg(x)=x², فـf(g(2)) = ؟', answer: 9 },
    { question: 'نقطة حدية لـf(x)=x²-6x+5 → x = ؟', answer: 3 },
    { question: '∫₀² 3 dx = ؟', answer: 6 },
    { question: 'الحد رقم 6 في 2,5,8,... = ؟', answer: 17 },
    { question: 'C(6,2) = ؟', answer: 15 },
    { question: 'وسط {5,10,15,20,25} = ؟', answer: 15 },
    { question: 'زمن سقوط h=5t² إذا h=45 → t = ؟', answer: 3 },
    { question: 'd/dx(x⁷) = ؟x⁶', answer: 7 },
  ]),
];

// ──────────── GRADE 12 ────────────
const MT12: Lesson[] = [
  ...buildMathUnit(12, 1, 'حساب التفاضل والتكامل — الموضوعات المتقدمة', [
    { question: 'حد (x²-1)/(x-1) عندما x→1 = ؟', answer: 2 },
    { question: 'حد (2x+3) عندما x→2 = ؟', answer: 7 },
    { question: 'حد x²/x عندما x→3 = ؟', answer: 3 },
    { question: 'd²/dx²(x³) = ؟x', answer: 6 },
    { question: '∫₀¹ x² dx = ؟ (×3)', answer: 1 },
    { question: 'حد (sin x)/x عندما x→0 = ؟', answer: 1 },
    { question: 'd/dx(x·eˣ) = eˣ(x+؟)', answer: 1 },
    { question: '∫₀² x³ dx = ؟', answer: 4 },
  ]),
  ...buildMathUnit(12, 2, 'الأعداد المركبة', [
    { question: 'i² = ؟', answer: -1 },
    { question: '(2+3i)(2-3i) = ؟', answer: 13 },
    { question: '|3+4i| = ؟', answer: 5 },
    { question: 'i⁴ = ؟', answer: 1 },
    { question: '(1+i)² = ؟i', answer: 2 },
    { question: '(3+4i) + (1-2i) = (4+؟i)', answer: 2 },
    { question: '|5+12i| = ؟', answer: 13 },
    { question: 'i³ = ؟ (×i)', answer: -1 },
  ]),
  ...buildMathUnit(12, 3, 'المصفوفات والمحددات', [
    { question: 'محدد [[2,1],[1,2]] = ؟', answer: 3 },
    { question: 'محدد [[3,0],[0,3]] = ؟', answer: 9 },
    { question: 'محدد [[4,2],[1,3]] = ؟', answer: 10 },
    { question: 'ناتج [[1,0],[0,1]] × [[5,6],[7,8]] — العنصر (1,1) = ؟', answer: 5 },
    { question: 'مصفوفة صفرية 2×2: مجموع عناصرها = ؟', answer: 0 },
    { question: 'محدد [[1,2],[3,4]] = ؟', answer: -2 },
    { question: 'عكس [[2,0],[0,2]]: العنصر (1,1) × 4 = ؟', answer: 2 },
    { question: 'محدد [[5,3],[2,1]] = ؟', answer: -1 },
  ]),
  ...buildMathUnit(12, 4, 'المعادلات التفاضلية — مقدمة', [
    { question: 'حل dy/dx=2، y=؟x+C', answer: 2 },
    { question: 'حل dy/dx=3x²، y=؟x³+C', answer: 1 },
    { question: 'إذا y\'=y وy(0)=1، فـy=eˣ، y(1)≈؟ (أقرب صحيح)', answer: 3 },
    { question: 'حل y\'=4x، y=؟x²+C', answer: 2 },
    { question: 'إذا y\'=2y، y(0)=5، فـy(1)≈؟ (أقرب عشرة)', answer: 37 },
    { question: 'dy/dx=1 → y=x+C، إذا y(0)=3 فـC=؟', answer: 3 },
    { question: 'dy/dx=6x² → y=2x³+C، عند x=2: 2×8+C=؟ إذا C=0', answer: 16 },
    { question: 'dy/dx=0 → y=؟ (ثابت)', answer: 0 },
  ]),
  ...buildMathUnit(12, 5, 'التحليل الحقيقي — التسلسلات والتقارب', [
    { question: 'هل المتتالية 1,1/2,1/4,... تتقارب إلى ؟', answer: 0 },
    { question: 'مجموع متسلسلة هندسية لانهائية: a=1، r=0.5 → مجموع = ؟', answer: 2 },
    { question: 'مجموع 1+1/2+1/4+... = ؟', answer: 2 },
    { question: 'حد n→∞ لـ1/n = ؟', answer: 0 },
    { question: 'حد n→∞ لـ(n+1)/n = ؟', answer: 1 },
    { question: 'مجموع 1+1/3+1/9+... (r=1/3) = a/(1-r) = ؟ (×2)', answer: 3 },
    { question: 'حد n→∞ لـ2n/(n+1) = ؟', answer: 2 },
    { question: 'مجموع 2+1+0.5+0.25+... = ؟', answer: 4 },
  ]),
  ...buildMathUnit(12, 6, 'الجبر الخطي — الفضاءات المتجهة', [
    { question: 'طول المتجه (3,4) = ؟', answer: 5 },
    { question: 'طول المتجه (5,12) = ؟', answer: 13 },
    { question: 'حاصل ضرب (2,3)·(1,2) = ؟', answer: 8 },
    { question: 'حاصل ضرب (1,0)·(0,1) = ؟', answer: 0 },
    { question: '2×(3,4) = (6,؟)', answer: 8 },
    { question: '(1,2)+(3,4) = (4,؟)', answer: 6 },
    { question: 'طول المتجه (0,0,5) = ؟', answer: 5 },
    { question: 'حاصل ضرب (2,1,2)·(2,1,2) = ؟', answer: 9 },
  ]),
  ...buildMathUnit(12, 7, 'نظرية الأعداد والمنطق الرياضي', [
    { question: 'برهان بالاستقراء: P(1)=1، P(n)=n(n+1)/2، P(3)=؟', answer: 6 },
    { question: 'مجموع الأعداد الأولى أقل من 10: 2+3+5+7=؟', answer: 17 },
    { question: 'عدد الأعداد الأولى بين 1 و20 = ؟', answer: 8 },
    { question: 'القسمة الإقليدية: 17 ÷ 5 = 3 باقي ؟', answer: 2 },
    { question: 'القسمة الإقليدية: 23 ÷ 7 = 3 باقي ؟', answer: 2 },
    { question: 'هل 97 أولي؟ (1=نعم، 0=لا)', answer: 1 },
    { question: 'عدد مقسوم على 3 إذا مجموع أرقامه مقسوم على 3، 123: مجموع = ؟', answer: 6 },
    { question: 'م.م.أ(48,36) = ؟', answer: 12 },
  ]),
  ...buildMathUnit(12, 8, 'مراجعة شاملة — الصف الثاني عشر', [
    { question: 'i² = ؟', answer: -1 },
    { question: 'محدد [[3,1],[2,4]] = ؟', answer: 10 },
    { question: 'طول المتجه (6,8) = ؟', answer: 10 },
    { question: 'مجموع 1+1/2+1/4+... = ؟', answer: 2 },
    { question: 'حد (x²-9)/(x-3) عند x→3 = ؟', answer: 6 },
    { question: 'd²/dx²(x⁴) = ؟x²', answer: 12 },
    { question: 'عدد الأعداد الأولى بين 1 و10 = ؟', answer: 4 },
    { question: '(3+4i)·(3-4i) = ؟', answer: 25 },
  ]),
];

export const MATH_BY_GRADE: Record<number, Lesson[]> = {
  1: MT1,
  2: MT2,
  3: MT3,
  4: MT4,
  5: MT5,
  6: MT6,
  7: MT7,
  8: MT8,
  9: MT9,
  10: MT10,
  11: MT11,
  12: MT12,
};
