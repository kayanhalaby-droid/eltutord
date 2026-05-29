import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedQuestion {
  questionText: string;
  type: QuestionType;
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  correctAnswer?: string;
  explanation: string;
  difficulty: number;
  order: number;
}

// ─────────────────────────────────────────────────────
// Arabic Grade 1 Questions
// ─────────────────────────────────────────────────────
const arabicGrade1Questions: SeedQuestion[] = [
  {
    questionText: 'أي من هذه الحروف هو حرف الألف؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'أ' }, { id: 'b', text: 'ب' }, { id: 'c', text: 'ت' }, { id: 'd', text: 'ث' }],
    correctOptionId: 'a',
    explanation: 'أحسنت! هذا هو حرف الألف.',
    difficulty: 1, order: 1,
  },
  {
    questionText: 'أكمل الكلمة: كـ_ـاب',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'ت' }, { id: 'b', text: 'م' }, { id: 'c', text: 'ل' }, { id: 'd', text: 'ب' }],
    correctOptionId: 'a',
    explanation: 'ممتاز! كلمة "كتاب" تعني كتاب.',
    difficulty: 1, order: 2,
  },
  {
    questionText: 'ما هو الحرف ذو الفتحة في الكلمة؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'دْ' }, { id: 'b', text: 'دِ' }, { id: 'c', text: 'دَ' }, { id: 'd', text: 'دُ' }],
    correctOptionId: 'c',
    explanation: 'صحيح! الفتحة تجعل الحرف مفتوحًا.',
    difficulty: 1, order: 3,
  },
  {
    questionText: 'أي حرف هو حرف الباء؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'أ' }, { id: 'b', text: 'ب' }, { id: 'c', text: 'ت' }, { id: 'd', text: 'ث' }],
    correctOptionId: 'b',
    explanation: 'أحسنت! هذا هو حرف الباء.',
    difficulty: 1, order: 4,
  },
  {
    questionText: 'أكمل الكلمة: بـ_ـت',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'ن' }, { id: 'b', text: 'و' }, { id: 'c', text: 'ي' }, { id: 'd', text: 'ا' }],
    correctOptionId: 'c',
    explanation: 'ممتاز! كلمة "بيت" تعني منزل.',
    difficulty: 1, order: 5,
  },
  {
    questionText: 'ما الحرف الذي يملك كسرة؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'سْ' }, { id: 'b', text: 'سِ' }, { id: 'c', text: 'سَ' }, { id: 'd', text: 'سُ' }],
    correctOptionId: 'b',
    explanation: 'صحيح! الكسرة تجعل الحرف مكسورًا.',
    difficulty: 2, order: 6,
  },
  {
    questionText: 'أكمل الكلمة: شـ_ـس',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'ل' }, { id: 'b', text: 'ر' }, { id: 'c', text: 'م' }, { id: 'd', text: 'ن' }],
    correctOptionId: 'c',
    explanation: 'رائع! كلمة "شمس" تعني شمس.',
    difficulty: 2, order: 7,
  },
  {
    questionText: 'ما الحرف الذي يملك ضمة؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'فْ' }, { id: 'b', text: 'فِ' }, { id: 'c', text: 'فَ' }, { id: 'd', text: 'فُ' }],
    correctOptionId: 'd',
    explanation: 'صحيح! الضمة تجعل الحرف مضمومًا.',
    difficulty: 2, order: 8,
  },
  {
    questionText: 'أكمل الكلمة: و_د',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'م' }, { id: 'b', text: 'ل' }, { id: 'c', text: 'ر' }, { id: 'd', text: 'ن' }],
    correctOptionId: 'a',
    explanation: 'ممتاز! كلمة "ورد" تعني زهرة.',
    difficulty: 2, order: 9,
  },
  {
    questionText: 'أي حرف هو حرف التاء؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'أ' }, { id: 'b', text: 'ب' }, { id: 'c', text: 'ت' }, { id: 'd', text: 'ث' }],
    correctOptionId: 'c',
    explanation: 'أحسنت! هذا هو حرف التاء.',
    difficulty: 1, order: 10,
  },
];

// ─────────────────────────────────────────────────────
// Math Grade 1 Questions
// ─────────────────────────────────────────────────────
const mathGrade1Questions: SeedQuestion[] = [
  {
    questionText: 'كم يساوي 2 + 3؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }, { id: 'c', text: '6' }, { id: 'd', text: '3' }],
    correctOptionId: 'b',
    explanation: '2 + 3 = 5. أحسنت!',
    difficulty: 1, order: 1,
  },
  {
    questionText: 'كم يساوي 5 + 4؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '8' }, { id: 'b', text: '9' }, { id: 'c', text: '10' }, { id: 'd', text: '7' }],
    correctOptionId: 'b',
    explanation: '5 + 4 = 9. ممتاز!',
    difficulty: 1, order: 2,
  },
  {
    questionText: 'كم يساوي 8 - 3؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '4' }, { id: 'b', text: '6' }, { id: 'c', text: '5' }, { id: 'd', text: '3' }],
    correctOptionId: 'c',
    explanation: '8 - 3 = 5. رائع!',
    difficulty: 1, order: 3,
  },
  {
    questionText: '3 + 3 = 6، صح أم خطأ؟',
    type: QuestionType.TRUE_FALSE,
    explanation: 'صحيح! 3 + 3 = 6.',
    correctOptionId: 'true',
    difficulty: 1, order: 4,
  },
  {
    questionText: 'كم يساوي 7 + 2؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '8' }, { id: 'b', text: '9' }, { id: 'c', text: '10' }, { id: 'd', text: '11' }],
    correctOptionId: 'b',
    explanation: '7 + 2 = 9. أحسنت!',
    difficulty: 1, order: 5,
  },
  {
    questionText: 'كم يساوي 10 - 4؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '5' }, { id: 'b', text: '6' }, { id: 'c', text: '7' }, { id: 'd', text: '4' }],
    correctOptionId: 'b',
    explanation: '10 - 4 = 6. ممتاز!',
    difficulty: 1, order: 6,
  },
  {
    questionText: 'أي رقم يأتي بعد 9؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '8' }, { id: 'b', text: '10' }, { id: 'c', text: '11' }, { id: 'd', text: '7' }],
    correctOptionId: 'b',
    explanation: 'الرقم 10 يأتي بعد 9. رائع!',
    difficulty: 1, order: 7,
  },
  {
    questionText: '5 > 3، صح أم خطأ؟',
    type: QuestionType.TRUE_FALSE,
    explanation: 'صحيح! 5 أكبر من 3.',
    correctOptionId: 'true',
    difficulty: 1, order: 8,
  },
  {
    questionText: 'كم يساوي 4 + 6؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '9' }, { id: 'b', text: '10' }, { id: 'c', text: '11' }, { id: 'd', text: '8' }],
    correctOptionId: 'b',
    explanation: '4 + 6 = 10. أحسنت!',
    difficulty: 1, order: 9,
  },
  {
    questionText: 'أي رقم هو أصغر عدد؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: '5' }, { id: 'b', text: '3' }, { id: 'c', text: '8' }, { id: 'd', text: '1' }],
    correctOptionId: 'd',
    explanation: 'الرقم 1 هو الأصغر. ممتاز!',
    difficulty: 2, order: 10,
  },
];

// ─────────────────────────────────────────────────────
// Science Grade 4 Questions
// ─────────────────────────────────────────────────────
const scienceGrade4Questions: SeedQuestion[] = [
  {
    questionText: 'ما هي العملية التي تصنع بها النباتات غذاءها باستخدام ضوء الشمس؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'التنفس' }, { id: 'b', text: 'النتح' }, { id: 'c', text: 'التركيب الضوئي' }, { id: 'd', text: 'التبخر' }],
    correctOptionId: 'c',
    explanation: 'أحسنت! التركيب الضوئي هو العملية التي تحول بها النباتات ضوء الشمس إلى طاقة.',
    difficulty: 2, order: 1,
  },
  {
    questionText: 'أي من هذه الكائنات الحية ينتج غذاءه بنفسه؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'الأسد' }, { id: 'b', text: 'الفطر' }, { id: 'c', text: 'النبات' }, { id: 'd', text: 'الإنسان' }],
    correctOptionId: 'c',
    explanation: 'رائع! النباتات هي كائنات حية ذاتية التغذية تصنع غذاءها بنفسها.',
    difficulty: 2, order: 2,
  },
  {
    questionText: 'ما هو الجزء الذي يمتص الماء والمعادن من التربة في النبات؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'الأوراق' }, { id: 'b', text: 'الزهور' }, { id: 'c', text: 'الجذور' }, { id: 'd', text: 'الساق' }],
    correctOptionId: 'c',
    explanation: 'إجابة صحيحة! الجذور هي المسؤولة عن امتصاص الماء والمعادن.',
    difficulty: 2, order: 3,
  },
  {
    questionText: 'ما هي الحالة التي تكون فيها جزيئات المادة متقاربة جداً وتهتز في مكانها؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'سائلة' }, { id: 'b', text: 'غازية' }, { id: 'c', text: 'صلبة' }, { id: 'd', text: 'بلازما' }],
    correctOptionId: 'c',
    explanation: 'صحيح! في الحالة الصلبة تكون الجزيئات متراصة وتهتز في مواضعها.',
    difficulty: 2, order: 4,
  },
  {
    questionText: 'أي من هذه العمليات تحول الماء من الحالة السائلة إلى الغازية؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'التجمد' }, { id: 'b', text: 'التكثف' }, { id: 'c', text: 'التبخر' }, { id: 'd', text: 'الانصهار' }],
    correctOptionId: 'c',
    explanation: 'أحسنت! التبخر هو العملية التي يتحول فيها السائل إلى غاز.',
    difficulty: 2, order: 5,
  },
  {
    questionText: 'ما هي الظاهرة التي تحدث بسبب دوران الأرض حول محورها؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'الفصول الأربعة' }, { id: 'b', text: 'الليل والنهار' }, { id: 'c', text: 'المد والجزر' }, { id: 'd', text: 'كسوف الشمس' }],
    correctOptionId: 'b',
    explanation: 'أحسنت! تعاقب الليل والنهار ينتج عن دوران الأرض حول محورها.',
    difficulty: 3, order: 6,
  },
  {
    questionText: 'ما هو الكوكب المعروف باسم الكوكب الأحمر؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'الزهرة' }, { id: 'b', text: 'المريخ' }, { id: 'c', text: 'المشتري' }, { id: 'd', text: 'زحل' }],
    correctOptionId: 'b',
    explanation: 'رائع! المريخ يشتهر بلونه الأحمر بسبب وجود أكسيد الحديد على سطحه.',
    difficulty: 2, order: 7,
  },
  {
    questionText: 'النباتات تنتج الأكسجين خلال عملية التركيب الضوئي، صح أم خطأ؟',
    type: QuestionType.TRUE_FALSE,
    explanation: 'صحيح! النباتات تنتج الأكسجين كناتج ثانوي لعملية التركيب الضوئي.',
    correctOptionId: 'true',
    difficulty: 2, order: 8,
  },
  {
    questionText: 'أي من هذه الحيوانات يعتبر من آكلات اللحوم؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'الأرنب' }, { id: 'b', text: 'البقرة' }, { id: 'c', text: 'الذئب' }, { id: 'd', text: 'الغزال' }],
    correctOptionId: 'c',
    explanation: 'ممتاز! الذئب يتغذى على اللحوم وهو مثال على الحيوانات آكلة اللحوم.',
    difficulty: 2, order: 9,
  },
  {
    questionText: 'ما هو شكل الطاقة الذي نشعر به كدفء؟',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ id: 'a', text: 'طاقة صوتية' }, { id: 'b', text: 'طاقة ضوئية' }, { id: 'c', text: 'طاقة حرارية' }, { id: 'd', text: 'طاقة حركية' }],
    correctOptionId: 'c',
    explanation: 'صحيح! الطاقة الحرارية هي التي تسبب الإحساس بالدفء.',
    difficulty: 2, order: 10,
  },
];

async function ensureLesson(
  subjectNameEn: string,
  gradeLevel: number,
  lessonNameEn: string,
  lessonNameAr: string,
  subjectMap: Record<string, string>
): Promise<string> {
  const subjectId = subjectMap[subjectNameEn];
  if (!subjectId) throw new Error(`Subject not found: ${subjectNameEn}`);

  const section = await prisma.section.upsert({
    where: { subjectId_gradeLevel: { subjectId, gradeLevel } },
    update: {},
    create: {
      subjectId,
      nameEn: `Grade ${gradeLevel} ${subjectNameEn}`,
      nameAr: `${subjectNameEn === 'Arabic' ? 'لغة عربية' : subjectNameEn === 'Math' ? 'رياضيات' : 'علوم'} الصف ${gradeLevel}`,
      gradeLevel,
      order: gradeLevel,
    },
  });

  const unit = await prisma.unit.upsert({
    where: { sectionId_nameEn: { sectionId: section.id, nameEn: `${lessonNameEn} Unit` } },
    update: {},
    create: {
      sectionId: section.id,
      nameEn: `${lessonNameEn} Unit`,
      nameAr: `وحدة ${lessonNameAr}`,
      order: 1,
    },
  });

  const level = await prisma.level.upsert({
    where: { unitId_levelNumber: { unitId: unit.id, levelNumber: 1 } },
    update: {},
    create: {
      unitId: unit.id,
      nameEn: `${lessonNameEn} Level 1`,
      nameAr: `${lessonNameAr} - المستوى الأول`,
      levelNumber: 1,
      xpReward: 15,
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { levelId_nameEn: { levelId: level.id, nameEn: lessonNameEn } },
    update: {},
    create: {
      levelId: level.id,
      nameEn: lessonNameEn,
      nameAr: lessonNameAr,
      order: 1,
      durationMin: 10,
    },
  });

  return lesson.id;
}

function buildQuestionData(q: SeedQuestion, lessonId: string) {
  if (q.type === QuestionType.TRUE_FALSE) {
    return {
      lessonId,
      type: q.type,
      content: { statement: q.questionText },
      correctAnswer: { isTrue: q.correctOptionId === 'true' },
      difficulty: q.difficulty,
      order: q.order,
    };
  }
  return {
    lessonId,
    type: q.type,
    content: {
      questionText: q.questionText,
      options: q.options!,
      isMultiSelect: false,
    },
    correctAnswer: { selectedOptionIds: [q.correctOptionId!] },
    difficulty: q.difficulty,
    order: q.order,
  };
}

export async function seedCurriculumQuestions(subjectMap: Record<string, string>) {
  console.log('جاري إضافة أسئلة المناهج الدراسية (Section O)...');

  // Arabic Grade 1
  const arabicGrade1LessonId = await ensureLesson('Arabic', 1, 'Arabic Alphabet', 'الحروف العربية', subjectMap);
  await prisma.question.deleteMany({ where: { lessonId: arabicGrade1LessonId } });
  await prisma.question.createMany({
    data: arabicGrade1Questions.map((q) => buildQuestionData(q, arabicGrade1LessonId)),
  });
  console.log(`✅ عربي صف 1: ${arabicGrade1Questions.length} سؤال`);

  // Math Grade 1
  const mathGrade1LessonId = await ensureLesson('Math', 1, 'Basic Numbers', 'الأعداد الأساسية', subjectMap);
  await prisma.question.deleteMany({ where: { lessonId: mathGrade1LessonId } });
  await prisma.question.createMany({
    data: mathGrade1Questions.map((q) => buildQuestionData(q, mathGrade1LessonId)),
  });
  console.log(`✅ رياضيات صف 1: ${mathGrade1Questions.length} سؤال`);

  // Science Grade 4
  const scienceGrade4LessonId = await ensureLesson('Science', 4, 'Living Things and Matter', 'الكائنات الحية والمادة', subjectMap);
  await prisma.question.deleteMany({ where: { lessonId: scienceGrade4LessonId } });
  await prisma.question.createMany({
    data: scienceGrade4Questions.map((q) => buildQuestionData(q, scienceGrade4LessonId)),
  });
  console.log(`✅ علوم صف 4: ${scienceGrade4Questions.length} سؤال`);

  console.log('✅ اكتملت إضافة أسئلة المناهج!');
}
