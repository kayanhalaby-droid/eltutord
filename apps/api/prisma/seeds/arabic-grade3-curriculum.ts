import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Data — 4 units × 3 lessons × 3 questions = 36 questions total
// ─────────────────────────────────────────────────────────────────────────────

interface McQuestion {
  type: 'mc';
  text: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

interface TfQuestion {
  type: 'tf';
  statement: string;
  isTrue: boolean;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

type Q = McQuestion | TfQuestion;

interface LessonDef {
  nameEn: string;
  nameAr: string;
  durationMin: number;
  questions: Q[];
}

interface UnitDef {
  nameEn: string;
  nameAr: string;
  levelNameEn: string;
  levelNameAr: string;
  xpReward: number;
  lessons: LessonDef[];
}

// ── Unit 1: القراءة والفهم ────────────────────────────────────────────────────
const unit1: UnitDef = {
  nameEn: 'Reading Comprehension',
  nameAr: 'القراءة والفهم',
  levelNameEn: 'Reading Level 1',
  levelNameAr: 'القراءة - المستوى الأول',
  xpReward: 15,
  lessons: [
    {
      nameEn: 'Narrative Text',
      nameAr: 'النص السردي',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'ما الذي يميّز النص السردي عن غيره؟',
          options: [
            { id: 'a', text: 'يصف مكاناً أو شخصاً' },
            { id: 'b', text: 'يحكي أحداثاً وقصصاً' },
            { id: 'c', text: 'يعطي تعليمات' },
            { id: 'd', text: 'يطرح رأياً' },
          ],
          correct: 'b',
          explanation: 'النص السردي يروي أحداثاً وقصصاً بترتيب زمني.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'ما معنى كلمة "غادر" في جملة: غادر الطفلُ البيتَ صباحاً؟',
          options: [
            { id: 'a', text: 'عاد إلى' },
            { id: 'b', text: 'ترك وانصرف عن' },
            { id: 'c', text: 'دخل إلى' },
            { id: 'd', text: 'نظر نحو' },
          ],
          correct: 'b',
          explanation: '"غادر" تعني ترك المكان وانصرف عنه.',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: 'النص السردي يسرد الأحداث بترتيب زمني من البداية إلى النهاية.',
          isTrue: true,
          explanation: 'صحيح، النص السردي يتبع تسلسلاً زمنياً للأحداث.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Descriptive Text',
      nameAr: 'النص الوصفي',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'أي من الجمل التالية وصفية؟',
          options: [
            { id: 'a', text: 'ذهب أحمد إلى المدرسة.' },
            { id: 'b', text: 'السماء صافية وزرقاء جميلة.' },
            { id: 'c', text: 'افتح الكتاب وأكمل التمرين.' },
            { id: 'd', text: 'هل زرت المدينة؟' },
          ],
          correct: 'b',
          explanation: 'الجملة الوصفية تصف شيئاً بصفاته وألوانه.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'ما الهدف الرئيسي من النص الوصفي؟',
          options: [
            { id: 'a', text: 'إقناع القارئ بفكرة' },
            { id: 'b', text: 'رسم صورة حية في ذهن القارئ' },
            { id: 'c', text: 'حكاية أحداث متسلسلة' },
            { id: 'd', text: 'شرح خطوات عمل' },
          ],
          correct: 'b',
          explanation: 'النص الوصفي يرسم صورة واضحة في ذهن القارئ عبر الصفات والتفاصيل.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'يستخدم النص الوصفي الصفات لتصوير الأشياء والأماكن.',
          isTrue: true,
          explanation: 'صحيح، الصفات هي أداة النص الوصفي الأساسية.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Dialogue Text',
      nameAr: 'النص الحواري',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'ما العلامة التي تدل على بداية الحوار في النص؟',
          options: [
            { id: 'a', text: 'الفاصلة ،' },
            { id: 'b', text: 'الشرطة —' },
            { id: 'c', text: 'النقطة .' },
            { id: 'd', text: 'علامة الاستفهام ؟' },
          ],
          correct: 'b',
          explanation: 'الشرطة تُستخدم في بداية كلام كل شخصية في الحوار.',
          difficulty: 2,
        },
        {
          type: 'mc',
          text: 'في النص الحواري، ماذا نسمّي كل شخص يتكلم؟',
          options: [
            { id: 'a', text: 'راوياً' },
            { id: 'b', text: 'شخصيةً' },
            { id: 'c', text: 'كاتباً' },
            { id: 'd', text: 'قارئاً' },
          ],
          correct: 'b',
          explanation: 'كل من يتكلم في الحوار يُسمى شخصية.',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: 'يمكن أن يدور الحوار بين شخصين أو أكثر.',
          isTrue: true,
          explanation: 'صحيح، الحوار قد يكون بين شخصين أو مجموعة من الشخصيات.',
          difficulty: 1,
        },
      ],
    },
  ],
};

// ── Unit 2: القواعد النحوية ───────────────────────────────────────────────────
const unit2: UnitDef = {
  nameEn: 'Arabic Grammar',
  nameAr: 'القواعد النحوية',
  levelNameEn: 'Grammar Level 1',
  levelNameAr: 'النحو - المستوى الأول',
  xpReward: 20,
  lessons: [
    {
      nameEn: 'Noun Verb Particle',
      nameAr: 'الاسم والفعل والحرف',
      durationMin: 15,
      questions: [
        {
          type: 'mc',
          text: 'أي من الكلمات التالية اسمٌ؟',
          options: [
            { id: 'a', text: 'ذهب' },
            { id: 'b', text: 'في' },
            { id: 'c', text: 'كتاب' },
            { id: 'd', text: 'يلعب' },
          ],
          correct: 'c',
          explanation: '"كتاب" اسم لأنه يدل على شيء ملموس ويقبل التنوين.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'أي من الكلمات التالية فعلٌ؟',
          options: [
            { id: 'a', text: 'مدرسة' },
            { id: 'b', text: 'كتب' },
            { id: 'c', text: 'على' },
            { id: 'd', text: 'حديقة' },
          ],
          correct: 'b',
          explanation: '"كتب" فعل ماضٍ يدل على حدث وقع في الماضي.',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: 'الحرف "في" له معنى مستقل بدون أن يرتبط بكلمة أخرى.',
          isTrue: false,
          explanation: 'خطأ، الحرف لا معنى له إلا مع غيره من الكلمات.',
          difficulty: 2,
        },
      ],
    },
    {
      nameEn: 'Subject and Predicate',
      nameAr: 'المبتدأ والخبر',
      durationMin: 15,
      questions: [
        {
          type: 'mc',
          text: 'ما المبتدأ في جملة: الطالبُ مجتهدٌ؟',
          options: [
            { id: 'a', text: 'مجتهدٌ' },
            { id: 'b', text: 'الطالبُ' },
            { id: 'c', text: 'الجملة كلها' },
            { id: 'd', text: 'لا مبتدأ فيها' },
          ],
          correct: 'b',
          explanation: 'المبتدأ هو "الطالب"، وهو الاسم الذي نتحدث عنه.',
          difficulty: 2,
        },
        {
          type: 'mc',
          text: 'ما الخبر في جملة: السماءُ صافيةٌ؟',
          options: [
            { id: 'a', text: 'السماءُ' },
            { id: 'b', text: 'صافيةٌ' },
            { id: 'c', text: 'السماءُ صافيةٌ' },
            { id: 'd', text: 'لا خبر فيها' },
          ],
          correct: 'b',
          explanation: 'الخبر هو "صافيةٌ"، وهو ما نخبر به عن المبتدأ.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'الجملة الاسمية تبدأ باسم يُسمى المبتدأ.',
          isTrue: true,
          explanation: 'صحيح، الجملة الاسمية تبدأ بمبتدأ ثم تأتي بعده الخبر.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Nominal and Verbal Sentences',
      nameAr: 'الجملة الاسمية والفعلية',
      durationMin: 15,
      questions: [
        {
          type: 'mc',
          text: 'أي من الجمل التالية جملة فعلية؟',
          options: [
            { id: 'a', text: 'الجوُّ باردٌ.' },
            { id: 'b', text: 'المعلمُ حاضرٌ.' },
            { id: 'c', text: 'لعب الأطفالُ في الملعب.' },
            { id: 'd', text: 'البيتُ كبيرٌ.' },
          ],
          correct: 'c',
          explanation: '"لعب الأطفال" جملة فعلية لأنها تبدأ بفعل.',
          difficulty: 2,
        },
        {
          type: 'mc',
          text: 'ما الفرق بين الجملة الاسمية والجملة الفعلية؟',
          options: [
            { id: 'a', text: 'الاسمية أطول من الفعلية' },
            { id: 'b', text: 'الاسمية تبدأ باسم والفعلية تبدأ بفعل' },
            { id: 'c', text: 'لا فرق بينهما' },
            { id: 'd', text: 'الفعلية تنتهي بنقطة' },
          ],
          correct: 'b',
          explanation: 'الاسمية تبدأ باسم (مبتدأ) والفعلية تبدأ بفعل.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'جملة "يدرس علي الدرس" جملة اسمية.',
          isTrue: false,
          explanation: 'خطأ، هي جملة فعلية لأنها تبدأ بالفعل "يدرس".',
          difficulty: 2,
        },
      ],
    },
  ],
};

// ── Unit 3: الإملاء والكتابة ──────────────────────────────────────────────────
const unit3: UnitDef = {
  nameEn: 'Spelling and Writing',
  nameAr: 'الإملاء والكتابة',
  levelNameEn: 'Spelling Level 1',
  levelNameAr: 'الإملاء - المستوى الأول',
  xpReward: 15,
  lessons: [
    {
      nameEn: 'Hamzas',
      nameAr: 'الهمزات',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'كيف تكتب همزة الكلمة: _كل (أمر من الأكل)؟',
          options: [
            { id: 'a', text: 'إكل' },
            { id: 'b', text: 'أكل' },
            { id: 'c', text: 'اكل' },
            { id: 'd', text: 'ئكل' },
          ],
          correct: 'b',
          explanation: 'فعل الأمر "أكل" يُكتب بهمزة مفتوحة على ألف.',
          difficulty: 2,
        },
        {
          type: 'mc',
          text: 'أي الكلمات فيها همزة وصل؟',
          options: [
            { id: 'a', text: 'أحمد' },
            { id: 'b', text: 'إنسان' },
            { id: 'c', text: 'اسم' },
            { id: 'd', text: 'أكل' },
          ],
          correct: 'c',
          explanation: '"اسم" فيها همزة وصل تُكتب بدون مدة وتُنطق عند البداية فقط.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'همزة القطع تُنطق دائماً سواء كانت في بداية الجملة أم في وسطها.',
          isTrue: true,
          explanation: 'صحيح، همزة القطع تُنطق في كل الأحوال خلافاً لهمزة الوصل.',
          difficulty: 2,
        },
      ],
    },
    {
      nameEn: 'Taa Marbuta and Maftuha',
      nameAr: 'التاء المربوطة والمفتوحة',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'أي من الكلمات التالية تنتهي بتاء مربوطة؟',
          options: [
            { id: 'a', text: 'بيت' },
            { id: 'b', text: 'مدرسة' },
            { id: 'c', text: 'وقت' },
            { id: 'd', text: 'صوت' },
          ],
          correct: 'b',
          explanation: '"مدرسة" تنتهي بتاء مربوطة تُنطق هاءً عند الوقف.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'كيف تعرف أن التاء في نهاية الكلمة مربوطة وليست مفتوحة؟',
          options: [
            { id: 'a', text: 'عندما تُنطق تاءً في كل الأحوال' },
            { id: 'b', text: 'عندما تُنطق هاءً حين الوقف عليها' },
            { id: 'c', text: 'عندما تكون في أول الكلمة' },
            { id: 'd', text: 'عندما يأتي بعدها تنوين' },
          ],
          correct: 'b',
          explanation: 'التاء المربوطة تُنطق هاءً عند الوقف، والمفتوحة تبقى تاءً.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'كلمة "وقت" تنتهي بتاء مربوطة.',
          isTrue: false,
          explanation: 'خطأ، "وقت" تنتهي بتاء مفتوحة لأنها تُنطق تاءً دائماً.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Punctuation Marks',
      nameAr: 'علامات الترقيم',
      durationMin: 10,
      questions: [
        {
          type: 'mc',
          text: 'أي علامة ترقيم توضع في نهاية الجملة الاستفهامية؟',
          options: [
            { id: 'a', text: '.' },
            { id: 'b', text: '،' },
            { id: 'c', text: '؟' },
            { id: 'd', text: '!' },
          ],
          correct: 'c',
          explanation: 'علامة الاستفهام ؟ توضع في نهاية كل جملة تتضمن سؤالاً.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'متى نستخدم علامة التعجب (!) ؟',
          options: [
            { id: 'a', text: 'في نهاية كل جملة' },
            { id: 'b', text: 'عند التعبير عن الدهشة أو الفرح أو الأمر' },
            { id: 'c', text: 'للفصل بين الجمل الطويلة' },
            { id: 'd', text: 'قبل الاقتباس' },
          ],
          correct: 'b',
          explanation: 'علامة التعجب تُستخدم للتعبير عن انفعال كالدهشة أو الفرح أو الأمر.',
          difficulty: 2,
        },
        {
          type: 'tf',
          statement: 'الفاصلة (،) تُستخدم للوقف الكامل في نهاية الجملة.',
          isTrue: false,
          explanation: 'خطأ، الفاصلة للوقف القصير، أما الوقف الكامل فتشير إليه النقطة (.).',
          difficulty: 2,
        },
      ],
    },
  ],
};

// ── Unit 4: المفردات والمعجم ──────────────────────────────────────────────────
const unit4: UnitDef = {
  nameEn: 'Vocabulary and Lexicon',
  nameAr: 'المفردات والمعجم',
  levelNameEn: 'Vocabulary Level 1',
  levelNameAr: 'المفردات - المستوى الأول',
  xpReward: 15,
  lessons: [
    {
      nameEn: 'Synonyms',
      nameAr: 'المترادفات',
      durationMin: 10,
      questions: [
        {
          type: 'mc',
          text: 'ما مرادف كلمة "سريع"؟',
          options: [
            { id: 'a', text: 'بطيء' },
            { id: 'b', text: 'خفيف' },
            { id: 'c', text: 'عاجل' },
            { id: 'd', text: 'ثقيل' },
          ],
          correct: 'c',
          explanation: '"عاجل" مرادف "سريع" لأن كلتيهما تدلان على قِصَر الوقت.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'ما مرادف كلمة "فرحان"؟',
          options: [
            { id: 'a', text: 'حزين' },
            { id: 'b', text: 'مسرور' },
            { id: 'c', text: 'خائف' },
            { id: 'd', text: 'غاضب' },
          ],
          correct: 'b',
          explanation: '"مسرور" تعني "فرحان"، فكلتاهما تعبران عن السعادة.',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: '"جميل" و"قبيح" كلمتان مترادفتان.',
          isTrue: false,
          explanation: 'خطأ، "جميل" و"قبيح" متضادان وليسا مترادفين.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Antonyms',
      nameAr: 'الأضداد',
      durationMin: 10,
      questions: [
        {
          type: 'mc',
          text: 'ما ضد كلمة "ضوء"؟',
          options: [
            { id: 'a', text: 'نور' },
            { id: 'b', text: 'ظلام' },
            { id: 'c', text: 'شمس' },
            { id: 'd', text: 'شعاع' },
          ],
          correct: 'b',
          explanation: '"ظلام" هو ضد "ضوء".',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'ما ضد كلمة "قريب"؟',
          options: [
            { id: 'a', text: 'صديق' },
            { id: 'b', text: 'جار' },
            { id: 'c', text: 'بعيد' },
            { id: 'd', text: 'مجاور' },
          ],
          correct: 'c',
          explanation: '"بعيد" هو نقيض "قريب".',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: 'المتضادان هما كلمتان تتفقان في المعنى.',
          isTrue: false,
          explanation: 'خطأ، المتضادان كلمتان تتعاكسان في المعنى مثل: كبير/صغير.',
          difficulty: 1,
        },
      ],
    },
    {
      nameEn: 'Words in Context',
      nameAr: 'الكلمات في السياق',
      durationMin: 12,
      questions: [
        {
          type: 'mc',
          text: 'في الجملة: "جلس الطفل على الكرسي"، ما معنى كلمة "جلس"؟',
          options: [
            { id: 'a', text: 'وقف بشكل مستقيم' },
            { id: 'b', text: 'اتخذ وضع القعود' },
            { id: 'c', text: 'تمدد على الأرض' },
            { id: 'd', text: 'قفز إلى الأعلى' },
          ],
          correct: 'b',
          explanation: '"جلس" تعني أخذ وضع القعود.',
          difficulty: 1,
        },
        {
          type: 'mc',
          text: 'في الجملة: "أضاءت الشمسُ الغرفة"، ما الذي أضاء الغرفة؟',
          options: [
            { id: 'a', text: 'المصباح' },
            { id: 'b', text: 'القمر' },
            { id: 'c', text: 'الشمس' },
            { id: 'd', text: 'النجوم' },
          ],
          correct: 'c',
          explanation: 'الفاعل في الجملة هو "الشمس" وهي التي أضاءت الغرفة.',
          difficulty: 1,
        },
        {
          type: 'tf',
          statement: 'يمكن فهم معنى الكلمة الغريبة من السياق الذي وردت فيه.',
          isTrue: true,
          explanation: 'صحيح، السياق يساعد كثيراً على فهم الكلمات الجديدة.',
          difficulty: 1,
        },
      ],
    },
  ],
};

const allUnits: UnitDef[] = [unit1, unit2, unit3, unit4];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildQuestionPayload(q: Q, lessonId: string, order: number) {
  if (q.type === 'tf') {
    return {
      lessonId,
      type: QuestionType.TRUE_FALSE,
      content: { statement: q.statement },
      correctAnswer: { isTrue: q.isTrue },
      difficulty: q.difficulty,
      order,
    };
  }
  return {
    lessonId,
    type: QuestionType.MULTIPLE_CHOICE,
    content: { questionText: q.text, options: q.options, isMultiSelect: false },
    correctAnswer: { selectedOptionIds: [q.correct] },
    difficulty: q.difficulty,
    order,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export async function seedArabicGrade3(subjectMap: Record<string, string>) {
  console.log('\n📚 بدء seed عربي صف 3...');

  const subjectId = subjectMap['Arabic'];
  if (!subjectId) throw new Error('Arabic subject not found in subjectMap');

  const section = await prisma.section.upsert({
    where: { subjectId_gradeLevel: { subjectId, gradeLevel: 3 } },
    update: {},
    create: {
      subjectId,
      nameEn: 'Grade 3 Arabic',
      nameAr: 'لغة عربية - الصف الثالث',
      gradeLevel: 3,
      order: 3,
    },
  });

  // Grade record links lessons to the learning-path service
  const grade = await prisma.grade.upsert({
    where: { level_subjectId: { level: 3, subjectId } },
    update: {},
    create: { level: 3, subjectId },
  });

  let totalQuestions = 0;

  for (let ui = 0; ui < allUnits.length; ui++) {
    const unitDef = allUnits[ui];

    const unit = await prisma.unit.upsert({
      where: { sectionId_nameEn: { sectionId: section.id, nameEn: unitDef.nameEn } },
      update: {},
      create: {
        sectionId: section.id,
        nameEn: unitDef.nameEn,
        nameAr: unitDef.nameAr,
        order: ui + 1,
      },
    });

    const level = await prisma.level.upsert({
      where: { unitId_levelNumber: { unitId: unit.id, levelNumber: 1 } },
      update: {},
      create: {
        unitId: unit.id,
        nameEn: unitDef.levelNameEn,
        nameAr: unitDef.levelNameAr,
        levelNumber: 1,
        xpReward: unitDef.xpReward,
      },
    });

    for (let li = 0; li < unitDef.lessons.length; li++) {
      const lessonDef = unitDef.lessons[li];

      const lesson = await prisma.lesson.upsert({
        where: { levelId_nameEn: { levelId: level.id, nameEn: lessonDef.nameEn } },
        update: { gradeId: grade.id },
        create: {
          levelId: level.id,
          nameEn: lessonDef.nameEn,
          nameAr: lessonDef.nameAr,
          order: li + 1,
          durationMin: lessonDef.durationMin,
          gradeId: grade.id,
        },
      });

      await prisma.question.deleteMany({ where: { lessonId: lesson.id } });

      await prisma.question.createMany({
        data: lessonDef.questions.map((q, qi) => buildQuestionPayload(q, lesson.id, qi + 1)),
      });

      totalQuestions += lessonDef.questions.length;
      console.log(`  ✅ ${unitDef.nameAr} › ${lessonDef.nameAr}: ${lessonDef.questions.length} أسئلة`);
    }
  }

  console.log(`\n✅ عربي صف 3 اكتمل: ${allUnits.length} وحدات، ${allUnits.reduce((s, u) => s + u.lessons.length, 0)} دروس، ${totalQuestions} سؤال`);
}
