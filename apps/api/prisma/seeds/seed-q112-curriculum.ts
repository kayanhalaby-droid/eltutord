/**
 * Full curriculum seed — q112 JSON → PostgreSQL
 * 4 subjects × 12 grades × 8 sections × 375 exercises = 144,000 questions
 */
import { PrismaClient, QuestionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { validateLanguagePurity, shouldSkipPurityCheck, SubjectLanguage } from '../../src/common/utils/language-purity';

const prisma = new PrismaClient();

export const SUBJECT_MAP: Record<string, string> = {
  Arabic:  'عربي',
  Hebrew:  'עברית',
  English: 'English',
  Math:    'رياضيات',
};

const Q112_DIR = path.join(__dirname, '..', '..', '..', '..', 'q112');
const BATCH_SIZE = 500;
const LESSON_SIZE = 10;
const CURRICULUM_NAME = 'المنهج الإسرائيلي للمدارس العربية — Kotar';

// ── Content/answer mapping ────────────────────────────────────────────────────

export function mapExerciseToQuestion(
  exercise: Record<string, unknown>,
  lessonId: string,
  order: number,
): {
  lessonId: string;
  type: QuestionType;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  difficulty: number;
  order: number;
  explanation: string | null;
} {
  const type = String(exercise.type ?? 'MULTIPLE_CHOICE');
  const level = typeof exercise.level === 'number' ? exercise.level : 1;
  const difficulty = level <= 4 ? 1 : level <= 8 ? 2 : 3;

  const choices = Array.isArray(exercise.choices) ? (exercise.choices as string[]) : [];
  const answer  = String(exercise.answer ?? '');
  const question = String(exercise.question ?? '');

  function optionsFromChoices() {
    return choices.map((c, i) => ({ id: String.fromCharCode(97 + i), text: c }));
  }
  function correctIdFromAnswer() {
    const idx = choices.indexOf(answer);
    return idx >= 0 ? String.fromCharCode(97 + idx) : 'a';
  }

  let content: Record<string, unknown>;
  let correctAnswer: Record<string, unknown>;

  switch (type) {
    case 'MULTIPLE_CHOICE':
    case 'IMAGE_CHOICE':
    case 'MARK_CORRECT_MEANING':
    case 'REVERSE_CHOICE': {
      const opts = optionsFromChoices();
      content       = { questionText: question, options: opts };
      correctAnswer = { selectedOptionIds: [correctIdFromAnswer()] };
      break;
    }

    case 'TRUE_FALSE': {
      content       = { statement: question };
      correctAnswer = { isTrue: answer === 'صح' || answer === 'true' || answer === 'True' };
      break;
    }

    case 'FILL_BLANK':
    case 'FILL_BLANK_CHOICE': {
      const opts = optionsFromChoices();
      content       = { questionText: question, sentence: question, options: opts };
      correctAnswer = { selectedOptionId: correctIdFromAnswer(), accepted: [answer] };
      break;
    }

    case 'TAP_PAIRS':
    case 'PAIR_MATCH':
    case 'IMAGE_MATCH': {
      const pairs = exercise.pairs && typeof exercise.pairs === 'object'
        ? Object.entries(exercise.pairs as Record<string, string>).map(([k, v], i) => ({
            id: String(i), left: k, right: v,
          }))
        : [];
      const correctPairs = Object.fromEntries(
        (exercise.pairs ? Object.keys(exercise.pairs as object) : []).map((_, i) => [String(i), String(i)])
      );
      content       = { questionText: question, pairs };
      correctAnswer = { pairs: correctPairs };
      break;
    }

    case 'WORD_ORDER':
    case 'DRAG_ORDER':
    case 'ARRANGE_ALL_WORDS':
    case 'WORD_BANK': {
      const words = Array.isArray(exercise.bank)
        ? exercise.bank
        : Array.isArray(exercise.correct_order)
          ? exercise.correct_order
          : choices;
      const order_ = Array.isArray(exercise.correct_order) ? exercise.correct_order : words;
      content       = { questionText: question, words };
      correctAnswer = { order: order_ };
      break;
    }

    case 'TRANSLATE':
    case 'TRANSLATE_REVERSE':
    case 'COMPLETE_TRANSLATION': {
      content       = { questionText: question };
      correctAnswer = { accepted: [answer], text: answer };
      break;
    }

    case 'FLASHCARD':
    case 'FLASHCARD_EX': {
      const front = exercise.word ? String(exercise.word) : question;
      const back  = exercise.hint ? String(exercise.hint) : answer;
      content       = { front, back };
      correctAnswer = {};
      break;
    }

    case 'SPEAK':
    case 'SPEAK_WORD':
    case 'READ_ALOUD': {
      const textToSpeak = exercise.word ? String(exercise.word) : question;
      content       = { questionText: question, textToSpeak };
      correctAnswer = { passed: true };
      break;
    }

    case 'LISTEN_WRITE':
    case 'LISTEN_CHOICE':
    case 'LISTEN_IMAGE': {
      const opts = optionsFromChoices();
      const audioUrl = exercise.audio_url ? String(exercise.audio_url) : '';
      content       = { questionText: question, audioUrl, options: opts };
      correctAnswer = { selectedOptionIds: [correctIdFromAnswer()], accepted: [answer] };
      break;
    }

    case 'SORT_GROUPS': {
      const groups = exercise.groups && typeof exercise.groups === 'object'
        ? exercise.groups as Record<string, string[]>
        : {};
      const groupDefs = Object.keys(groups).map((k, i) => ({ id: String(i), label: k }));
      const items = Object.entries(groups).flatMap(([, vals], gi) =>
        (Array.isArray(vals) ? vals : []).map((item, ii) => ({
          id: `${gi}-${ii}`, label: item, group: String(gi),
        }))
      );
      const assignments = Object.fromEntries(
        Object.entries(groups).flatMap(([, vals], gi) =>
          (Array.isArray(vals) ? vals : []).map((_, ii) => [`${gi}-${ii}`, String(gi)])
        )
      );
      content       = { questionText: question, groups: groupDefs, items };
      correctAnswer = { assignments };
      break;
    }

    case 'READING_COMPREHENSION': {
      const passage = exercise.passage ? String(exercise.passage) : '';
      const opts    = optionsFromChoices();
      content       = { questionText: question, passage, options: opts };
      correctAnswer = { selectedOptionIds: [correctIdFromAnswer()] };
      break;
    }

    case 'AI_CONVERSATION': {
      content = {
        questionText: question,
        aiRole: exercise.ai_role ? String(exercise.ai_role) : 'معلم',
        prompt: exercise.prompt ? String(exercise.prompt) : question,
      };
      correctAnswer = {};
      break;
    }

    case 'GRAMMAR_TIP': {
      content = {
        questionText: question,
        explanation: exercise.explanation ? String(exercise.explanation) : question,
        example: exercise.example ? String(exercise.example) : '',
      };
      correctAnswer = {};
      break;
    }

    case 'SPEED_REVIEW':
    case 'TIMED_PRACTICE': {
      const opts = optionsFromChoices();
      const pairsRaw = exercise.pairs && typeof exercise.pairs === 'object' ? exercise.pairs : {};
      content = {
        questionText: question,
        pairs: pairsRaw,
        timeLimit: typeof exercise.time_limit === 'number' ? exercise.time_limit : 30,
        options: opts,
      };
      correctAnswer = {
        selectedOptionIds: answer ? [answer] : [],
        pairs: pairsRaw,
      };
      break;
    }

    default: {
      content       = { questionText: question };
      correctAnswer = { accepted: [answer] };
    }
  }

  return {
    lessonId,
    type: type as QuestionType,
    content,
    correctAnswer,
    difficulty,
    order,
    explanation: null,
  };
}

// ── Per subject+grade seeding ─────────────────────────────────────────────────

export async function seedSubjectGrade(subjectName: string, gradeLevel: number): Promise<void> {
  const fileName = `G${String(gradeLevel).padStart(2, '0')}_${subjectName}.json`;
  const filePath = path.join(Q112_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${fileName}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const subjectNameAr = SUBJECT_MAP[subjectName];

  const curriculum = await prisma.curriculum.upsert({
    where:  { name: CURRICULUM_NAME },
    create: { name: CURRICULUM_NAME, description: 'المنهج الرسمي للمدارس العربية في إسرائيل' },
    update: {},
  });

  const subject = await prisma.subject.upsert({
    where:  { nameAr: subjectNameAr },
    create: { nameEn: subjectName, nameAr: subjectNameAr, curriculumId: curriculum.id },
    update: {},
  });

  const grade = await prisma.grade.upsert({
    where:  { level_subjectId: { level: gradeLevel, subjectId: subject.id } },
    create: { level: gradeLevel, subjectId: subject.id },
    update: {},
  });

  let totalQuestions = 0;
  const sections = Object.entries(data.sections) as [string, Record<string, unknown>[]][];
  let purityWarnings = 0;

  for (let secIdx = 0; secIdx < sections.length; secIdx++) {
    const [sectionKey, exercises] = sections[secIdx];
    const sectionNameParts = sectionKey.split('_');
    const sectionNameAr = sectionNameParts.slice(2).join(' ') || `القسم ${secIdx + 1}`;
    const sectionNameEn = `Section ${secIdx + 1}`;

    const section = await prisma.section.upsert({
      where:  { subjectId_gradeLevel_order: { subjectId: subject.id, gradeLevel, order: secIdx + 1 } },
      create: { nameEn: sectionNameEn, nameAr: sectionNameAr, subjectId: subject.id, gradeLevel, order: secIdx + 1 },
      update: { nameAr: sectionNameAr },
    });

    let unit = await prisma.unit.findFirst({ where: { sectionId: section.id, nameEn: sectionNameEn } });
    if (!unit) {
      unit = await prisma.unit.create({
        data: { nameEn: sectionNameEn, nameAr: sectionNameAr, sectionId: section.id, order: secIdx + 1 },
      });
    }

    let level = await prisma.level.findFirst({ where: { unitId: unit.id, levelNumber: 1 } });
    if (!level) {
      level = await prisma.level.create({
        data: {
          nameEn: `${sectionNameEn} Level 1`,
          nameAr: `${sectionNameAr} — المستوى 1`,
          unitId: unit.id,
          levelNumber: 1,
          xpReward: 20,
        },
      });
    }

    const numLessons = Math.ceil(exercises.length / LESSON_SIZE);
    for (let lessonIdx = 0; lessonIdx < numLessons; lessonIdx++) {
      const lessonExercises = exercises.slice(lessonIdx * LESSON_SIZE, (lessonIdx + 1) * LESSON_SIZE);
      const lessonNum  = lessonIdx + 1;
      const lessonNameEn = `Lesson ${lessonNum}`;
      const lessonNameAr =
        subjectName === 'Hebrew'  ? `שיעור ${lessonNum}` :
        subjectName === 'English' ? `Lesson ${lessonNum}` :
                                    `الدرس ${lessonNum}`;

      let lesson = await prisma.lesson.findFirst({
        where: { levelId: level.id, nameEn: lessonNameEn },
      });
      if (!lesson) {
        lesson = await prisma.lesson.create({
          data: {
            nameEn: lessonNameEn,
            nameAr: lessonNameAr,
            levelId: level.id,
            gradeId: grade.id,
            order: lessonNum,
            durationMin: 5,
          },
        });
      }

      const questionData: ReturnType<typeof mapExerciseToQuestion>[] = [];
      for (let i = 0; i < lessonExercises.length; i++) {
        const ex = lessonExercises[i];
        const mapped = mapExerciseToQuestion(ex, lesson.id, i + 1);

        if (!shouldSkipPurityCheck(String(ex.type ?? ''))) {
          const purity = validateLanguagePurity(mapped.content, subjectNameAr as SubjectLanguage);
          if (!purity.valid) {
            purityWarnings++;
            if (purityWarnings <= 5) {
              console.warn(`  ⚠ Purity: ${String(ex.id ?? '')} — ${purity.reason}`);
            }
          }
        }

        questionData.push(mapped);
      }

      // Check if lesson already has questions to enable idempotency
      const existingCount = await prisma.question.count({ where: { lessonId: lesson.id } });
      if (existingCount === 0) {
        for (let b = 0; b < questionData.length; b += BATCH_SIZE) {
          await (prisma.question.createMany as Function)({
            data: questionData.slice(b, b + BATCH_SIZE),
            skipDuplicates: true,
          });
        }
      }

      totalQuestions += lessonExercises.length;
    }
  }

  console.log(`  ✓ ${subjectName} Grade ${gradeLevel}: ${totalQuestions} questions (${purityWarnings} purity warnings)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting full curriculum seed (q112)…\n');

  const subjects = ['Arabic', 'Hebrew', 'English', 'Math'];
  for (const subject of subjects) {
    for (let grade = 1; grade <= 12; grade++) {
      await seedSubjectGrade(subject, grade);
    }
  }

  const total     = await prisma.question.count();
  const subjects_ = await prisma.subject.count();
  const grades_   = await prisma.grade.count();

  console.log(`\n✅ Seed complete.`);
  console.log(`   Subjects: ${subjects_} | Grades: ${grades_} | Questions: ${total.toLocaleString()}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
