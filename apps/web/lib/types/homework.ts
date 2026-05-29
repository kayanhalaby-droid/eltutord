export type HomeworkStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface HomeworkQuestion {
  question: string;
  studentAnswer: string;
  isCorrect: boolean | null;
  feedback: string | null;
}

export interface HomeworkResult {
  id: string;
  status: HomeworkStatus;
  imageUrl?: string;
  studentName?: string;
  subject?: string;
  gradeLevel?: number;
  assignmentTitle?: string;
  questions?: HomeworkQuestion[];
  overallFeedback?: string | null;
  score?: number | null;
  createdAt: string;
}
