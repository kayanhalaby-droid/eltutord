import { ApiProperty } from '@nestjs/swagger';

export class LessonProgressItemDto {
  @ApiProperty({ example: 'الجمع والطرح' })
  lessonTitleAr: string;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ example: 85 })
  score?: number;

  @ApiProperty()
  completedAt?: Date;
}

export class ChildProgressDto {
  @ApiProperty({ example: 'cluid123' })
  childId: string;

  @ApiProperty({ example: 'أحمد' })
  firstName: string;

  @ApiProperty({ example: 'علي' })
  lastName: string;

  @ApiProperty({ example: 5 })
  gradeLevel: number;

  @ApiProperty({ example: 320 })
  totalXp: number;

  @ApiProperty({ example: 7 })
  currentStreak: number;

  @ApiProperty({ example: 150 })
  gemsBalance: number;

  @ApiProperty({ type: [LessonProgressItemDto] })
  recentProgress: LessonProgressItemDto[];

  @ApiProperty({ example: 'لا توجد بيانات حتى الآن', required: false })
  message?: string;
}
