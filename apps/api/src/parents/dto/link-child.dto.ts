import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LinkChildDto {
  @ApiProperty({ example: 'ABC123', description: 'كود الطالب المكون من 6 أحرف' })
  @IsString()
  @Length(6, 6)
  parentCode: string;
}
