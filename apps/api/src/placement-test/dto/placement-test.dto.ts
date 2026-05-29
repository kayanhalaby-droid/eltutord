export class PlacementTestQuestionDto {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
  difficulty: number;
}

export class PlacementTestAttemptDto {
  id: string;
  userId: string;
  lessonId: string;
  questions: PlacementTestQuestionDto[];
  answers: string[];
  results: boolean[];
  difficultyLevel: number;
  consecutiveWrong: number;
  isCompleted: boolean;
  score?: number | null;
}

export class PlacementTestResultDto {
  attemptId: string;
  isCorrect: boolean;
  nextQuestion?: PlacementTestQuestionDto;
  isCompleted: boolean;
  finalScore?: number;
}
