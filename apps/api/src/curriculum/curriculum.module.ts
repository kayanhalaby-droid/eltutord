import { Module } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { LearningPathModule } from '../learning-path/learning-path.module';
import { ImageGeneratorService } from './image-generator.service';
import { AdaptiveDifficultyService } from './adaptive-difficulty.service';
import { DailyContentService } from './daily-content.service';

@Module({
  imports: [LearningPathModule],
  controllers: [CurriculumController],
  providers: [CurriculumService, ImageGeneratorService, AdaptiveDifficultyService, DailyContentService],
  exports: [CurriculumService, ImageGeneratorService, AdaptiveDifficultyService, DailyContentService],
})
export class CurriculumModule {}
