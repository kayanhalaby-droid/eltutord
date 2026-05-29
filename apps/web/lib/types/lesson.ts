export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'REVERSE_CHOICE'
  | 'TAP_PAIRS'
  | 'FILL_BLANK_CHOICE'
  | 'WORD_ORDER'
  | 'LISTEN_CHOICE'
  | 'LISTEN_WRITE'
  | 'SPEAK_WORD'
  | 'SPEAK'
  | 'READ_ALOUD'
  | 'TRUE_FALSE'
  | 'SORT_GROUPS'
  | 'TRANSLATE'
  | 'FLASHCARD_EX'
  | 'AI_CONVERSATION'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'ORDERING'
  | 'SHORT_ANSWER'
  | 'CODE_SNIPPET';

export type NodeStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

// MULTIPLE_CHOICE content
export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQContent {
  questionText: string;
  options: MCQOption[];
  isMultiSelect?: boolean;
}

export interface MCQAnswer {
  selectedOptionIds: string[];
}

// TRUE_FALSE content
export interface TrueFalseContent {
  statement: string;
}

export interface TrueFalseAnswer {
  isTrue: boolean;
}

// FILL_IN_THE_BLANK content
export interface FillBlankPart {
  type: 'text' | 'blank';
  value?: string;
  id?: string;
}

export interface FillBlankContent {
  textParts: FillBlankPart[];
}

export interface FillBlankAnswer {
  blanks: Record<string, string[]>;
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
}

// Question from backend
export interface QuestionDto {
  id: string;
  type: QuestionType;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  explanation?: string | null;
  difficulty: number;
  order: number;
}

// Lesson from backend
export interface LessonDto {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  gradeId: string;
  order: number;
  type: 'REGULAR' | 'PLACEMENT_TEST';
  durationMin?: number;
  questions?: QuestionDto[];
}

// Learning path node from backend
export interface LearningPathNodeDto {
  id: string;
  lesson: LessonDto;
  snakePathOrder: number;
  status: NodeStatus;
  score?: number | null;
  isUnlocked: boolean;
  isCurrent: boolean;
  unitLocked?: boolean;
}

// Learning path from backend
export interface LearningPathDto {
  id: string;
  subjectName: string;
  gradeLevel: number;
  nodes: LearningPathNodeDto[];
}
