import {
  PrismaClient,
  QuestionType,
  UserRole,
  AchievementType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCurriculumQuestions } from './seeds/curriculum-questions';
import { seedArabicGrade3 } from './seeds/arabic-grade3-curriculum';
import { seedHebrewGrade3 } from './seeds/hebrew-grade3-curriculum';

const prisma = new PrismaClient();

async function main() {
  console.log('بدء تهيئة قاعدة البيانات...');

  // ──────────────────────────────────────────────────────
  // 1. Admin User
  // ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@elitutor.org' },
    update: {},
    create: {
      email: 'admin@elitutor.org',
      phone: '0500000000',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });
  console.log(`✅ Admin: ${adminUser.email}`);

  // ──────────────────────────────────────────────────────
  // 2. Demo Student
  // ──────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash('1234', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@elitutor.org' },
    update: {},
    create: {
      email: 'student@elitutor.org',
      phone: '0501234567',
      passwordHash: studentPassword,
      role: UserRole.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          firstName: 'محمد',
          lastName: 'أحمد',
          dateOfBirth: new Date('2015-03-15'),
          gradeLevel: 3,
          schoolName: 'مدرسة الناصرة الابتدائية',
          parentCode: 'PARENT-001',
          xp: 0,
          streak: 0,
          gems: 0,
        },
      },
    },
  });
  console.log(`✅ Student: ${studentUser.email}`);

  // ──────────────────────────────────────────────────────
  // 3. Demo Parent
  // ──────────────────────────────────────────────────────
  const parentPassword = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { email: 'parent@elitutor.org' },
    update: {},
    create: {
      email: 'parent@elitutor.org',
      phone: '0509876543',
      passwordHash: parentPassword,
      role: UserRole.PARENT,
      isVerified: true,
      parentProfile: {
        create: {
          firstName: 'فاطمة',
          lastName: 'أحمد',
          phoneNumber: '0509876543',
        },
      },
    },
  });
  console.log(`✅ Parent seeded`);

  // ──────────────────────────────────────────────────────
  // 4. Subjects (5 subjects)
  // ──────────────────────────────────────────────────────
  const subjects = [
    { nameEn: 'Math',    nameAr: 'رياضيات', iconUrl: '/icons/math.svg' },
    { nameEn: 'Arabic',  nameAr: 'عربي',    iconUrl: '/icons/arabic.svg' },
    { nameEn: 'Hebrew',  nameAr: 'عبري',    iconUrl: '/icons/hebrew.svg' },
    { nameEn: 'English', nameAr: 'إنجليزي', iconUrl: '/icons/english.svg' },
    { nameEn: 'Science', nameAr: 'علوم',    iconUrl: '/icons/science.svg' },
  ];

  const subjectMap: Record<string, string> = {};
  for (const s of subjects) {
    const subject = await prisma.subject.upsert({
      where: { nameEn: s.nameEn },
      update: {},
      create: s,
    });
    subjectMap[s.nameEn] = subject.id;
  }
  console.log(`✅ Subjects: ${subjects.length} created`);

  // ──────────────────────────────────────────────────────
  // 5. Sections (Grade 3 for Math & Arabic)
  // ──────────────────────────────────────────────────────
  const mathGrade3 = await prisma.section.upsert({
    where: { subjectId_gradeLevel: { subjectId: subjectMap['Math'], gradeLevel: 3 } },
    update: {},
    create: {
      subjectId: subjectMap['Math'],
      nameEn: 'Grade 3 Math',
      nameAr: 'رياضيات الصف الثالث',
      gradeLevel: 3,
      order: 1,
    },
  });

  const arabicGrade3 = await prisma.section.upsert({
    where: { subjectId_gradeLevel: { subjectId: subjectMap['Arabic'], gradeLevel: 3 } },
    update: {},
    create: {
      subjectId: subjectMap['Arabic'],
      nameEn: 'Grade 3 Arabic',
      nameAr: 'لغة عربية للصف الثالث',
      gradeLevel: 3,
      order: 1,
    },
  });
  console.log('✅ Sections: Grade 3 Math & Arabic');

  // ──────────────────────────────────────────────────────
  // 6. Units
  // ──────────────────────────────────────────────────────
  const mathUnit1 = await prisma.unit.upsert({
    where: { sectionId_nameEn: { sectionId: mathGrade3.id, nameEn: 'Numbers and Operations' } },
    update: {},
    create: { sectionId: mathGrade3.id, nameEn: 'Numbers and Operations', nameAr: 'الأعداد والعمليات', order: 1 },
  });

  const mathUnit2 = await prisma.unit.upsert({
    where: { sectionId_nameEn: { sectionId: mathGrade3.id, nameEn: 'Geometry and Measurement' } },
    update: {},
    create: { sectionId: mathGrade3.id, nameEn: 'Geometry and Measurement', nameAr: 'الهندسة والقياس', order: 2 },
  });

  const arabicUnit1 = await prisma.unit.upsert({
    where: { sectionId_nameEn: { sectionId: arabicGrade3.id, nameEn: 'Reading Comprehension' } },
    update: {},
    create: { sectionId: arabicGrade3.id, nameEn: 'Reading Comprehension', nameAr: 'فهم المقروء', order: 1 },
  });

  const arabicUnit2 = await prisma.unit.upsert({
    where: { sectionId_nameEn: { sectionId: arabicGrade3.id, nameEn: 'Grammar and Writing' } },
    update: {},
    create: { sectionId: arabicGrade3.id, nameEn: 'Grammar and Writing', nameAr: 'القواعد والكتابة', order: 2 },
  });
  console.log('✅ Units: 4 units created');

  // ──────────────────────────────────────────────────────
  // 7. Levels
  // ──────────────────────────────────────────────────────
  const mathLevel1 = await prisma.level.upsert({
    where: { unitId_levelNumber: { unitId: mathUnit1.id, levelNumber: 1 } },
    update: {},
    create: { unitId: mathUnit1.id, nameEn: 'Basic Addition', nameAr: 'الجمع الأساسي', levelNumber: 1, xpReward: 10 },
  });

  const mathLevel2 = await prisma.level.upsert({
    where: { unitId_levelNumber: { unitId: mathUnit1.id, levelNumber: 2 } },
    update: {},
    create: { unitId: mathUnit1.id, nameEn: 'Basic Subtraction', nameAr: 'الطرح الأساسي', levelNumber: 2, xpReward: 12 },
  });

  const arabicLevel1 = await prisma.level.upsert({
    where: { unitId_levelNumber: { unitId: arabicUnit1.id, levelNumber: 1 } },
    update: {},
    create: { unitId: arabicUnit1.id, nameEn: 'Simple Texts', nameAr: 'نصوص بسيطة', levelNumber: 1, xpReward: 10 },
  });

  const arabicLevel2 = await prisma.level.upsert({
    where: { unitId_levelNumber: { unitId: arabicUnit1.id, levelNumber: 2 } },
    update: {},
    create: { unitId: arabicUnit1.id, nameEn: 'Main Idea Identification', nameAr: 'تحديد الفكرة الرئيسية', levelNumber: 2, xpReward: 12 },
  });
  console.log('✅ Levels: 4 levels created');

  // ──────────────────────────────────────────────────────
  // 8. Lessons
  // ──────────────────────────────────────────────────────
  const mathLesson1 = await prisma.lesson.upsert({
    where: { levelId_nameEn: { levelId: mathLevel1.id, nameEn: 'Adding Single Digits' } },
    update: {},
    create: { levelId: mathLevel1.id, nameEn: 'Adding Single Digits', nameAr: 'جمع الأعداد الفردية', order: 1, durationMin: 10 },
  });

  const mathLesson2 = await prisma.lesson.upsert({
    where: { levelId_nameEn: { levelId: mathLevel1.id, nameEn: 'Adding Double Digits' } },
    update: {},
    create: { levelId: mathLevel1.id, nameEn: 'Adding Double Digits', nameAr: 'جمع الأعداد المزدوجة', order: 2, durationMin: 15 },
  });

  const arabicLesson1 = await prisma.lesson.upsert({
    where: { levelId_nameEn: { levelId: arabicLevel1.id, nameEn: 'Story: The Clever Fox' } },
    update: {},
    create: { levelId: arabicLevel1.id, nameEn: 'Story: The Clever Fox', nameAr: 'قصة: الثعلب الذكي', order: 1, durationMin: 15 },
  });

  const arabicLesson2 = await prisma.lesson.upsert({
    where: { levelId_nameEn: { levelId: arabicLevel1.id, nameEn: 'Story: The Farmer and His Sons' } },
    update: {},
    create: { levelId: arabicLevel1.id, nameEn: 'Story: The Farmer and His Sons', nameAr: 'قصة: الفلاح وأبناؤه', order: 2, durationMin: 15 },
  });
  console.log('✅ Lessons: 4 lessons created');

  // ──────────────────────────────────────────────────────
  // 9. Questions — 50 Math + 50 Arabic = 100 total
  // ──────────────────────────────────────────────────────
  console.log('جاري إنشاء 100 سؤال...');

  // Delete existing questions for these lessons to avoid duplicates on re-run
  await prisma.question.deleteMany({ where: { lessonId: { in: [mathLesson1.id, mathLesson2.id, arabicLesson1.id, arabicLesson2.id] } } });

  // Math questions (50 — distributed over 2 lessons)
  const mathQuestions = [];
  for (let i = 1; i <= 50; i++) {
    const lessonId = i <= 25 ? mathLesson1.id : mathLesson2.id;
    const typeIndex = i % 3;
    let type: QuestionType;
    let content: object;
    let correctAnswer: object;

    if (typeIndex === 0) {
      // MULTIPLE_CHOICE
      type = QuestionType.MULTIPLE_CHOICE;
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const sum = a + b;
      const options = [
        { id: 'a', text: `${sum}` },
        { id: 'b', text: `${sum + 1}` },
        { id: 'c', text: `${sum - 1}` },
        { id: 'd', text: `${sum + 2}` },
      ].sort(() => Math.random() - 0.5);
      const correctId = options.find((o) => o.text === `${sum}`)?.id || 'a';
      content = { questionText: `كم يساوي ${a} + ${b}؟`, options, isMultiSelect: false };
      correctAnswer = { selectedOptionIds: [correctId] };
    } else if (typeIndex === 1) {
      // TRUE_FALSE
      type = QuestionType.TRUE_FALSE;
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const isTrue = Math.random() > 0.5;
      const claimed = isTrue ? a + b : a + b + 1;
      content = { statement: `${a} + ${b} = ${claimed}` };
      correctAnswer = { isTrue };
    } else {
      // FILL_IN_THE_BLANK
      type = QuestionType.FILL_IN_THE_BLANK;
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      content = {
        textParts: [
          { type: 'text', value: `${a} + ` },
          { type: 'blank', id: 'blank1' },
          { type: 'text', value: ` = ${a + b}` },
        ],
      };
      correctAnswer = { blanks: { blank1: [`${b}`] }, caseSensitive: false, trimWhitespace: true };
    }

    mathQuestions.push({ lessonId, type, content, correctAnswer, difficulty: Math.ceil(i / 10), order: i });
  }

  // Arabic questions (50 — distributed over 2 lessons)
  const arabicQTexts = [
    'ما اسم بطل القصة؟', 'أين تجري أحداث القصة؟', 'ماذا فعل الثعلب؟',
    'ما الدرس المستفاد؟', 'كم عدد أبناء الفلاح؟', 'صِف شخصية الثعلب.',
    'ما معنى كلمة ذكي؟', 'ما مرادف كلمة فلاح؟', 'ما نقيض كلمة سعيد؟',
    'اكتب جملة تصف الطبيعة.', 'ما نوع الكلمة التالية: سريع؟',
    'أعرب الكلمة: الولدُ.', 'ما المبتدأ في جملة: الشمس مشرقة؟',
    'ما الخبر في جملة: الجو جميل؟', 'أكمل الجملة: ذهب الولد إلى...',
  ];

  const arabicQuestions = [];
  for (let i = 1; i <= 50; i++) {
    const lessonId = i <= 25 ? arabicLesson1.id : arabicLesson2.id;
    const qText = arabicQTexts[(i - 1) % arabicQTexts.length] + ` (${i})`;
    const options = [
      { id: 'a', text: 'الإجابة الأولى' },
      { id: 'b', text: 'الإجابة الثانية' },
      { id: 'c', text: 'الإجابة الثالثة' },
      { id: 'd', text: 'الإجابة الرابعة' },
    ];
    arabicQuestions.push({
      lessonId,
      type: QuestionType.MULTIPLE_CHOICE,
      content: { questionText: qText, options, isMultiSelect: false },
      correctAnswer: { selectedOptionIds: ['a'] },
      difficulty: Math.ceil(i / 10),
      order: i,
    });
  }

  await prisma.question.createMany({ data: [...mathQuestions, ...arabicQuestions] });
  console.log('✅ أسئلة: 100 سؤال (50 رياضيات + 50 عربي)');

  // ──────────────────────────────────────────────────────
  // 10. Achievements
  // ──────────────────────────────────────────────────────
  const achievements = [
    { nameEn: 'First Lesson', nameAr: 'أول درس', descriptionEn: 'Complete your first lesson', descriptionAr: 'أكمل أول درس لك', xpReward: 20, type: AchievementType.COMPLETION },
    { nameEn: 'Math Star', nameAr: 'نجم الرياضيات', descriptionEn: 'Complete 10 math lessons', descriptionAr: 'أكمل 10 دروس رياضيات', xpReward: 50, type: AchievementType.SUBJECT_MASTERY },
    { nameEn: '7-Day Streak', nameAr: 'سلسلة 7 أيام', descriptionEn: 'Study 7 days in a row', descriptionAr: 'ادرس 7 أيام متتالية', xpReward: 100, type: AchievementType.STREAK },
    { nameEn: 'Quick Learner', nameAr: 'متعلم سريع', descriptionEn: 'Score 100% on a lesson', descriptionAr: 'احصل على 100% في درس', xpReward: 30, type: AchievementType.GENERAL },
    { nameEn: 'Social Butterfly', nameAr: 'اجتماعي', descriptionEn: 'Join a league group', descriptionAr: 'انضم إلى مجموعة منافسة', xpReward: 15, type: AchievementType.SOCIAL },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { nameEn: a.nameEn },
      update: {},
      create: a,
    });
  }
  console.log(`✅ Achievements: ${achievements.length}`);

  // ──────────────────────────────────────────────────────
  // 11. League Group
  // ──────────────────────────────────────────────────────
  await prisma.leagueGroup.upsert({
    where: { name: 'أبطال الناصرة' },
    update: {},
    create: {
      name: 'أبطال الناصرة',
      description: 'مجموعة منافسة لطلاب الناصرة',
    },
  });
  console.log('✅ League: أبطال الناصرة');

  // ──────────────────────────────────────────────────────
  // 12. Section O — Multi-grade curriculum questions
  // ──────────────────────────────────────────────────────
  await seedCurriculumQuestions(subjectMap);

  // ──────────────────────────────────────────────────────
  // 13. Grade 3 Arabic full curriculum (4 units × 3 lessons × 3 questions)
  // ──────────────────────────────────────────────────────
  await seedArabicGrade3(subjectMap);
  await seedHebrewGrade3(subjectMap);

  console.log('\n🎉 اكتملت تهيئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ فشل seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
