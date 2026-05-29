import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'ADAPTIVE';

interface PerformanceWindow {
  correctRate: number;
  avgResponseTimeMs: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  hintsUsed: number;
}

@Injectable()
export class AdaptiveDifficultyService {
  constructor(private readonly prisma: PrismaService) {}

  // Hearts threshold per grade: younger students get more hearts
  static heartsForGrade(grade: number): number {
    if (grade <= 3) return 6;
    if (grade <= 6) return 5;
    return 4;
  }

  // Recommend next difficulty based on recent performance window
  recommendDifficulty(current: DifficultyLevel, perf: PerformanceWindow): DifficultyLevel {
    const { correctRate, consecutiveCorrect, consecutiveWrong, hintsUsed } = perf;

    // Bump up: strong consecutive streak + high accuracy + no hints
    if (consecutiveCorrect >= 3 && correctRate >= 0.85 && hintsUsed === 0) {
      return this.bump(current, +1);
    }
    // Bump up moderately: good accuracy
    if (consecutiveCorrect >= 5 && correctRate >= 0.75) {
      return this.bump(current, +1);
    }
    // Drop down: struggling
    if (consecutiveWrong >= 2 || correctRate < 0.4) {
      return this.bump(current, -1);
    }
    // Drop to adaptive: hints crutch
    if (hintsUsed >= 3 && correctRate < 0.6) {
      return 'ADAPTIVE';
    }
    return current;
  }

  private bump(level: DifficultyLevel, delta: 1 | -1): DifficultyLevel {
    const ladder: DifficultyLevel[] = ['EASY', 'ADAPTIVE', 'MEDIUM', 'HARD'];
    const idx = ladder.indexOf(level);
    const next = idx + delta;
    return ladder[Math.max(0, Math.min(ladder.length - 1, next))];
  }

  // ADAPTIVE mode: scaffold hints, partial credit, sub-questions
  adaptiveOptions(grade: number): { showHint: boolean; allowPartialCredit: boolean; breakIntoSteps: boolean } {
    return {
      showHint: true,
      allowPartialCredit: grade <= 5,
      breakIntoSteps: grade <= 4,
    };
  }

  // Recovery flow after 3 wrong answers in a row
  recoveryOptions(grade: number): Array<{ type: string; label: string }> {
    const base = [
      { type: 'hint',    label: 'أعطني تلميحاً 💡' },
      { type: 'example', label: 'أرني مثالاً 📖' },
      { type: 'skip',    label: 'تخطَّ هذا السؤال ⏭️' },
    ];
    if (grade <= 4) {
      base.unshift({ type: 'simplify', label: 'سؤال أسهل 🌱' });
    }
    return base;
  }

  async getRecentPerformance(userId: string, lessonId: string): Promise<PerformanceWindow> {
    // Fetch last 10 answers for this lesson from the database
    const answers = await this.prisma.lessonAttempt
      .findMany({
        where: { userId, lessonId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      .catch(() => []);

    if (!answers.length) {
      return { correctRate: 0.5, avgResponseTimeMs: 5000, consecutiveCorrect: 0, consecutiveWrong: 0, hintsUsed: 0 };
    }

    const correct = answers.filter((a: any) => a.isCorrect).length;
    const correctRate = correct / answers.length;

    let consecutiveCorrect = 0;
    let consecutiveWrong = 0;
    for (const a of answers) {
      if ((a as any).isCorrect) { consecutiveCorrect++; consecutiveWrong = 0; }
      else { consecutiveWrong++; break; }
    }

    return {
      correctRate,
      avgResponseTimeMs: 4000,
      consecutiveCorrect,
      consecutiveWrong,
      hintsUsed: 0,
    };
  }
}
