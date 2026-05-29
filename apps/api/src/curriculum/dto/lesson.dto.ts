import { LessonType, QuestionType } from '@prisma/client';

export class QuestionDto {
  id: string;
  type: QuestionType;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  explanation?: string | null;
  difficulty: number;
  order: number;
}

export class LessonDto {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  gradeId: string;
  order: number;
  type: LessonType;
  durationMin?: number;
  questions?: QuestionDto[];
}
