import { ApiProperty } from '@nestjs/swagger';

export class WeeklyReportDto {
  @ApiProperty({ example: 'cluid456' })
  id: string;

  @ApiProperty({ example: '2026-05-18' })
  weekStart: Date;

  @ApiProperty({ example: 'أحمد' })
  childName: string;

  @ApiProperty({ example: 450 })
  xpEarned: number;

  @ApiProperty({ example: 12 })
  lessonsCompleted: number;

  @ApiProperty({ example: 78 })
  averageScore: number;

  @ApiProperty({ example: 'أحسن أحمد هذا الأسبوع في الرياضيات...' })
  aiSummary: string;

  @ApiProperty({ example: ['يُنصح بمراجعة القسمة', 'حافظ على الـ streak'] })
  recommendations: string[];

  @ApiProperty()
  generatedAt: Date;
}
