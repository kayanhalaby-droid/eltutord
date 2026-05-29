import { ApiProperty } from '@nestjs/swagger';

export class ParentChildrenDto {
  @ApiProperty({ example: 'cluid123' })
  id: string;

  @ApiProperty({ example: 'أحمد' })
  firstName: string;

  @ApiProperty({ example: 'علي' })
  lastName: string;

  @ApiProperty({ example: 5 })
  gradeLevel: number;

  @ApiProperty({ example: 'الناصرة' })
  schoolName?: string;

  @ApiProperty({ example: 320 })
  xp: number;

  @ApiProperty({ example: 7 })
  streak: number;

  @ApiProperty({ example: 150 })
  gems: number;
}
