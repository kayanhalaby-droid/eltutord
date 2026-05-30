import { IsString, MinLength, IsOptional, IsInt, Min, Max, IsIn, IsObject } from 'class-validator';

export class RegisterWithOnboardingDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel: number;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  motivation?: string;

  @IsOptional()
  @IsInt()
  dailyGoalMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  trialScore?: number;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  placementLevel?: string;

  @IsOptional()
  @IsObject()
  guestProgress?: Record<string, unknown>;
}
