import { Module } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';

@Module({
  providers: [LearningPathService],
  exports: [LearningPathService],
})
export class LearningPathModule {}
