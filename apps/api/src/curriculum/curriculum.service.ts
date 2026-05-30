import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectDto } from './dto/subject.dto';
import { GradeDto } from './dto/grade.dto';
import { LessonDto, QuestionDto } from './dto/lesson.dto';
import { validateLanguagePurity, shouldSkipPurityCheck, SubjectLanguage } from '../common/utils/language-purity';
import { QuestsService } from '../gamification/quests/quests.service';

@Injectable()
export class CurriculumService {
  constructor(
    private prisma: PrismaService,
    @Optional() private questsService?: QuestsService,
  ) {}

  async findAllSubjects(): Promise<SubjectDto[]> {
    const subjects = await this.prisma.subject.findMany({ orderBy: { nameAr: 'asc' } });
    return subjects.map(s => ({ id: s.id, name: s.nameAr, curriculumId: s.curriculumId }));
  }

  async findSubjectById(id: string): Promise<SubjectDto | null> {
    const s = await this.prisma.subject.findUnique({ where: { id } });
    return s ? { id: s.id, name: s.nameAr, curriculumId: s.curriculumId } : null;
  }

  async findGradesBySubjectId(subjectId: string): Promise<GradeDto[]> {
    const grades = await this.prisma.grade.findMany({
      where: { subjectId },
      orderBy: { level: 'asc' },
    });
    return grades.map(g => ({ id: g.id, level: g.level, subjectId: g.subjectId }));
  }

  async findGradeById(id: string): Promise<GradeDto | null> {
    const g = await this.prisma.grade.findUnique({ where: { id } });
    return g ? { id: g.id, level: g.level, subjectId: g.subjectId } : null;
  }

  async findGradeBySubjectIdAndLevel(subjectId: string, level: number): Promise<GradeDto | null> {
    const g = await this.prisma.grade.findUnique({
      where: { level_subjectId: { level, subjectId } },
    });
    return g ? { id: g.id, level: g.level, subjectId: g.subjectId } : null;
  }

  async findLessonsByGradeId(gradeId: string): Promise<LessonDto[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { gradeId },
      orderBy: { order: 'asc' },
    });
    return lessons.map(l => this.mapLesson(l, gradeId));
  }

  async findLessonById(id: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findUnique({ where: { id } });
    if (!l || !l.gradeId) return null;
    return this.mapLesson(l, l.gradeId);
  }

  async findLessonWithQuestions(id: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!l) return null;
    const gradeId = l.gradeId ?? '';
    const dto = this.mapLesson(l, gradeId);
    dto.durationMin = l.durationMin;
    dto.questions = l.questions.map((q): QuestionDto => ({
      id: q.id,
      type: q.type,
      content: q.content as Record<string, unknown>,
      correctAnswer: q.correctAnswer as Record<string, unknown>,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: q.order,
    }));
    return dto;
  }

  async getOnboardingQuestions(subjectNameAr: string, gradeLevel: number): Promise<QuestionDto[]> {
    const subject = await this.prisma.subject.findFirst({
      where: { nameAr: subjectNameAr },
    });

    if (!subject) return this.getFallbackOnboardingQuestions();

    const grade = await this.prisma.grade.findUnique({
      where: { level_subjectId: { level: gradeLevel, subjectId: subject.id } },
    });

    if (!grade) return this.getFallbackOnboardingQuestions();

    const EXCLUDED_TYPES = ['SPEAK', 'SPEAK_WORD', 'READ_ALOUD', 'AI_CONVERSATION', 'LISTEN_WRITE'];

    const questions = await this.prisma.question.findMany({
      where: {
        lesson: { gradeId: grade.id },
        difficulty: { lte: 2 },
        NOT: { type: { in: EXCLUDED_TYPES as any } },
      },
      orderBy: { difficulty: 'asc' },
      take: 50,
    });

    if (questions.length < 7) return this.getFallbackOnboardingQuestions();

    const pure = questions.filter(q => {
      if (shouldSkipPurityCheck(q.type as string)) return true;
      return validateLanguagePurity(q.content as Record<string, unknown>, subjectNameAr as SubjectLanguage).valid;
    });

    if (pure.length < 7) return this.getFallbackOnboardingQuestions();

    const typeOrder = [
      'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK_CHOICE',
      'TAP_PAIRS', 'IMAGE_CHOICE', 'SORT_GROUPS', 'FLASHCARD_EX',
    ];

    const selected: typeof pure = [];
    for (const type of typeOrder) {
      const match = pure.find(q => q.type === type && !selected.includes(q));
      if (match) selected.push(match);
      if (selected.length === 7) break;
    }

    while (selected.length < 7) {
      const remaining = pure.find(q => !selected.includes(q));
      if (!remaining) break;
      selected.push(remaining);
    }

    return selected.slice(0, 7).map((q, i): QuestionDto => ({
      id: q.id,
      type: q.type,
      content: q.content as Record<string, unknown>,
      correctAnswer: q.correctAnswer as Record<string, unknown>,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: i + 1,
    }));
  }

  async getPlacementQuestions(subjectNameAr: string, gradeLevel: number): Promise<QuestionDto[]> {
    const subject = await this.prisma.subject.findFirst({
      where: { nameAr: subjectNameAr },
    });

    if (!subject) return [];

    const EXCLUDED_TYPES = ['SPEAK', 'SPEAK_WORD', 'READ_ALOUD', 'AI_CONVERSATION', 'LISTEN_WRITE'];

    const [easy, medium, hard] = await Promise.all([
      this.prisma.question.findMany({
        where: {
          lesson: { grade: { subjectId: subject.id } },
          difficulty: 1,
          NOT: { type: { in: EXCLUDED_TYPES as any } },
        },
        take: 3,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.question.findMany({
        where: {
          lesson: { grade: { subjectId: subject.id } },
          difficulty: { in: [2, 3] },
          NOT: { type: { in: EXCLUDED_TYPES as any } },
        },
        take: 4,
        orderBy: { difficulty: 'asc' },
      }),
      this.prisma.question.findMany({
        where: {
          lesson: { grade: { subjectId: subject.id } },
          difficulty: { in: [4, 5] },
          NOT: { type: { in: EXCLUDED_TYPES as any } },
        },
        take: 3,
        orderBy: { difficulty: 'asc' },
      }),
    ]);

    return [...easy, ...medium, ...hard].map((q, i): QuestionDto => ({
      id: q.id,
      type: q.type,
      content: q.content as Record<string, unknown>,
      correctAnswer: q.correctAnswer as Record<string, unknown>,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: i + 1,
    }));
  }

  private async getFallbackOnboardingQuestions(): Promise<QuestionDto[]> {
    return [
      {
        id: 'fallback-1',
        type: 'MULTIPLE_CHOICE' as any,
        content: { questionText: 'ما هو ناتج ٢ + ٢؟', options: [{ id: 'a', text: '٣' }, { id: 'b', text: '٤' }, { id: 'c', text: '٥' }, { id: 'd', text: '٦' }] },
        correctAnswer: { selectedOptionIds: ['b'] },
        explanation: null,
        difficulty: 1,
        order: 1,
      },
      {
        id: 'fallback-2',
        type: 'TRUE_FALSE' as any,
        content: { statement: 'الشمس تشرق من الشرق' },
        correctAnswer: { isTrue: true },
        explanation: null,
        difficulty: 1,
        order: 2,
      },
      {
        id: 'fallback-3',
        type: 'MULTIPLE_CHOICE' as any,
        content: { questionText: 'أيّ من هذه الكلمات تعني "كتاب"؟', options: [{ id: 'a', text: 'كتاب' }, { id: 'b', text: 'قلم' }, { id: 'c', text: 'مدرسة' }, { id: 'd', text: 'باب' }] },
        correctAnswer: { selectedOptionIds: ['a'] },
        explanation: null,
        difficulty: 1,
        order: 3,
      },
      {
        id: 'fallback-4',
        type: 'TRUE_FALSE' as any,
        content: { statement: 'المثلث له ٤ أضلاع' },
        correctAnswer: { isTrue: false },
        explanation: 'المثلث له ٣ أضلاع فقط',
        difficulty: 1,
        order: 4,
      },
      {
        id: 'fallback-5',
        type: 'MULTIPLE_CHOICE' as any,
        content: { questionText: 'ما هو عكس كلمة "كبير"؟', options: [{ id: 'a', text: 'طويل' }, { id: 'b', text: 'صغير' }, { id: 'c', text: 'سريع' }, { id: 'd', text: 'جميل' }] },
        correctAnswer: { selectedOptionIds: ['b'] },
        explanation: null,
        difficulty: 1,
        order: 5,
      },
      {
        id: 'fallback-6',
        type: 'MULTIPLE_CHOICE' as any,
        content: { questionText: 'كم عدد أيام الأسبوع؟', options: [{ id: 'a', text: '٥' }, { id: 'b', text: '٦' }, { id: 'c', text: '٧' }, { id: 'd', text: '٨' }] },
        correctAnswer: { selectedOptionIds: ['c'] },
        explanation: null,
        difficulty: 1,
        order: 6,
      },
      {
        id: 'fallback-7',
        type: 'TRUE_FALSE' as any,
        content: { statement: '١٠ - ٣ = ٧' },
        correctAnswer: { isTrue: true },
        explanation: null,
        difficulty: 1,
        order: 7,
      },
    ];
  }

  async completLesson(
    userId: string,
    lessonId: string,
    score: number,
    correctAnswers?: number,
  ): Promise<void> {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return;
    await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: student.id, lessonId } },
      update: { status: 'COMPLETED', score, completedAt: new Date() },
      create: { studentId: student.id, lessonId, status: 'COMPLETED', score, completedAt: new Date() },
    });

    if (this.questsService) {
      const xpAwarded = 50; // baseline lesson XP per GamificationConfig
      await Promise.allSettled([
        this.questsService.incrementQuestProgress(userId, 'daily_lessons', 1),
        this.questsService.incrementQuestProgress(userId, 'daily_xp', xpAwarded),
        this.questsService.incrementQuestProgress(userId, 'daily_activity', 1),
        score >= 100
          ? this.questsService.incrementQuestProgress(userId, 'perfect_lessons', 1)
          : Promise.resolve(),
        correctAnswers != null
          ? this.questsService.incrementQuestProgress(userId, 'correct_answers', correctAnswers)
          : Promise.resolve(),
      ]);
    }
  }

  async fetchPlacementTest(lessonId: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findFirst({
      where: { id: lessonId, type: 'PLACEMENT_TEST' },
    });
    if (!l || !l.gradeId) return null;
    return this.mapLesson(l, l.gradeId);
  }

  private mapLesson(l: { id: string; nameAr: string; description?: string | null; nameEn: string; order: number; type: import('@prisma/client').LessonType; gradeId?: string | null }, gradeId: string): LessonDto {
    return {
      id: l.id,
      title: l.nameAr,
      description: l.description,
      content: l.nameAr,
      gradeId,
      order: l.order,
      type: l.type,
    };
  }
}
