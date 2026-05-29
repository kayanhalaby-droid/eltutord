import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlacementTestAttemptDto,
  PlacementTestQuestionDto,
  PlacementTestResultDto,
} from './dto/placement-test.dto';
import { SubmitPlacementTestAnswerDto } from './dto/submit-placement-test-answer.dto';
import { LessonType, PlacementTestAttempt, Prisma } from '@prisma/client';

@Injectable()
export class PlacementTestService {
  private readonly MAX_CONSECUTIVE_WRONG = 3;
  private readonly INITIAL_DIFFICULTY = 1;
  private readonly MAX_DIFFICULTY = 5;

  constructor(private prisma: PrismaService) {}

  async startPlacementTest(userId: string, lessonId: string): Promise<PlacementTestAttemptDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, type: LessonType.PLACEMENT_TEST },
    });
    if (!lesson) throw new NotFoundException(`اختبار التحديد للدرس ${lessonId} غير موجود`);

    const existing = await this.prisma.placementTestAttempt.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (existing && !existing.isCompleted) {
      throw new BadRequestException('يوجد اختبار تحديد نشط بالفعل لهذا المستخدم والدرس');
    }

    // Delete completed attempt to allow restart
    if (existing?.isCompleted) {
      await this.prisma.placementTestAttempt.delete({ where: { id: existing.id } });
    }

    const initialQuestion = this.fetchQuestionByDifficulty(this.INITIAL_DIFFICULTY);
    if (!initialQuestion) throw new NotFoundException('لا توجد أسئلة متاحة للمستوى الأولي');

    const attempt = await this.prisma.placementTestAttempt.create({
      data: {
        userId,
        lessonId,
        difficultyLevel: this.INITIAL_DIFFICULTY,
        consecutiveWrong: 0,
        questions: [initialQuestion] as unknown as Prisma.JsonArray,
        answers: [] as unknown as Prisma.JsonArray,
        results: [] as unknown as Prisma.JsonArray,
        isCompleted: false,
      },
    });

    return this.mapToDto(attempt);
  }

  async submitAnswer(userId: string, dto: SubmitPlacementTestAnswerDto): Promise<PlacementTestResultDto> {
    const { attemptId, questionId, answer } = dto;

    let attempt = await this.prisma.placementTestAttempt.findFirst({
      where: { id: attemptId, userId },
    });
    if (!attempt) throw new NotFoundException(`محاولة الاختبار ${attemptId} غير موجودة`);
    if (attempt.isCompleted) throw new BadRequestException('هذه المحاولة مكتملة بالفعل');

    const questions = attempt.questions as unknown as PlacementTestQuestionDto[];
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) throw new BadRequestException(`السؤال ${questionId} غير موجود في هذه المحاولة`);

    const isCorrect = currentQuestion.correctAnswer === answer;
    const updatedAnswers = [...(attempt.answers as Prisma.JsonArray), answer];
    const updatedResults = [...(attempt.results as Prisma.JsonArray), isCorrect];

    let newDifficulty = attempt.difficultyLevel;
    let newConsecutiveWrong = isCorrect ? 0 : attempt.consecutiveWrong + 1;
    let isCompleted = false;
    let finalScore: number | null = null;
    let nextQuestion: PlacementTestQuestionDto | null = null;

    newDifficulty = isCorrect
      ? Math.min(newDifficulty + 1, this.MAX_DIFFICULTY)
      : Math.max(newDifficulty - 1, this.INITIAL_DIFFICULTY);

    if (newConsecutiveWrong >= this.MAX_CONSECUTIVE_WRONG) {
      isCompleted = true;
      finalScore = this.calculateScore(updatedResults as boolean[]);
    } else {
      nextQuestion = this.fetchQuestionByDifficulty(newDifficulty);
      if (!nextQuestion) {
        isCompleted = true;
        finalScore = this.calculateScore(updatedResults as boolean[]);
      }
    }

    attempt = await this.prisma.placementTestAttempt.update({
      where: { id: attemptId },
      data: {
        difficultyLevel: newDifficulty,
        consecutiveWrong: newConsecutiveWrong,
        questions: nextQuestion ? ([...questions, nextQuestion] as unknown as Prisma.JsonArray) : (questions as unknown as Prisma.JsonArray),
        answers: updatedAnswers,
        results: updatedResults,
        isCompleted,
        score: finalScore,
      },
    });

    return {
      attemptId: attempt.id,
      isCorrect,
      nextQuestion: nextQuestion ?? undefined,
      isCompleted,
      finalScore: finalScore ?? undefined,
    };
  }

  private fetchQuestionByDifficulty(difficulty: number): PlacementTestQuestionDto | null {
    const bank: PlacementTestQuestionDto[] = [
      { id: 'q1-d1', questionText: 'ما هو الحرف الأول في كلمة "أرنب"؟', options: ['أ', 'ب', 'ت', 'ث'], correctAnswer: 'أ', difficulty: 1 },
      { id: 'q2-d1', questionText: 'ما هو لون السماء؟', options: ['أحمر', 'أزرق', 'أصفر', 'أخضر'], correctAnswer: 'أزرق', difficulty: 1 },
      { id: 'q3-d2', questionText: 'الأسد ملك الـ...', options: ['غابة', 'صحراء', 'بحر', 'جبل'], correctAnswer: 'غابة', difficulty: 2 },
      { id: 'q4-d2', questionText: 'كم عدد أيام الأسبوع؟', options: ['خمسة', 'ستة', 'سبعة', 'ثمانية'], correctAnswer: 'سبعة', difficulty: 2 },
      { id: 'q5-d3', questionText: 'ما هو جمع كلمة "قلم"؟', options: ['أقلام', 'قلمة', 'قالمات', 'قلمون'], correctAnswer: 'أقلام', difficulty: 3 },
      { id: 'q6-d3', questionText: 'ما هي عاصمة فلسطين؟', options: ['القدس', 'رام الله', 'نابلس', 'غزة'], correctAnswer: 'القدس', difficulty: 3 },
      { id: 'q7-d4', questionText: 'حل المعادلة: س + 5 = 10', options: ['س=5', 'س=10', 'س=15', 'س=2'], correctAnswer: 'س=5', difficulty: 4 },
      { id: 'q8-d4', questionText: 'من هو مؤلف كتاب "الأيام"؟', options: ['طه حسين', 'نجيب محفوظ', 'عباس العقاد', 'أحمد شوقي'], correctAnswer: 'طه حسين', difficulty: 4 },
      { id: 'q9-d5', questionText: 'ما هو الجذر التربيعي للعدد 144؟', options: ['10', '12', '14', '16'], correctAnswer: '12', difficulty: 5 },
      { id: 'q10-d5', questionText: 'ما هي وظيفة الكلى في جسم الإنسان؟', options: ['تنقية الدم', 'ضخ الدم', 'هضم الطعام', 'إنتاج الهرمونات'], correctAnswer: 'تنقية الدم', difficulty: 5 },
    ];

    const available = bank.filter(q => q.difficulty === difficulty);
    if (!available.length) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  private calculateScore(results: boolean[]): number {
    if (!results.length) return 0;
    return Math.round((results.filter(r => r).length / results.length) * 100);
  }

  private mapToDto(attempt: PlacementTestAttempt): PlacementTestAttemptDto {
    return {
      id: attempt.id,
      userId: attempt.userId,
      lessonId: attempt.lessonId,
      questions: attempt.questions as unknown as PlacementTestQuestionDto[],
      answers: attempt.answers as string[],
      results: attempt.results as boolean[],
      difficultyLevel: attempt.difficultyLevel,
      consecutiveWrong: attempt.consecutiveWrong,
      isCompleted: attempt.isCompleted,
      score: attempt.score,
    };
  }
}
