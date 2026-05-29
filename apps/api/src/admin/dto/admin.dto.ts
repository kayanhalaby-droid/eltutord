import { IsString, IsNumber, IsOptional, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  gradeLevel: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  gradeLevel?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AdjustResourcesDto {
  @IsOptional()
  @IsNumber()
  xp?: number;

  @IsOptional()
  @IsNumber()
  gems?: number;
}
