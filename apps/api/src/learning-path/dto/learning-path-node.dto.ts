import { UserProgressStatus } from '@prisma/client';
import { LessonDto } from '../../curriculum/dto/lesson.dto';

export class LearningPathNodeDto {
  id: string;
  lesson: LessonDto;
  snakePathOrder: number;
  status: UserProgressStatus;
  score?: number | null;
  isUnlocked: boolean;
  isCurrent: boolean;
}
