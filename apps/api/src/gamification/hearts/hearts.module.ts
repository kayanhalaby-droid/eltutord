import { Module } from '@nestjs/common';
import { HeartsService } from './hearts.service';

@Module({
  providers: [HeartsService],
  exports: [HeartsService],
})
export class HeartsModule {}
