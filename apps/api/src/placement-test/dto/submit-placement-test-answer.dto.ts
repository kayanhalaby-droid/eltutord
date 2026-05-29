import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitPlacementTestAnswerDto {
  @IsString()
  @IsNotEmpty()
  attemptId: string;

  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
