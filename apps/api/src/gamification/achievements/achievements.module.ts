import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { XpModule } from '../xp/xp.module';
import { GemsModule } from '../gems/gems.module';

@Module({
  imports: [XpModule, GemsModule],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
