import { LearningPathNodeDto } from './learning-path-node.dto';

export class LearningPathDto {
  id: string;
  subjectName: string;
  gradeLevel: number;
  nodes: LearningPathNodeDto[];
}

export { LearningPathNodeDto };
