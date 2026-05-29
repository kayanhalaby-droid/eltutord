import { Module } from '@nestjs/common';
import { HeartsModule } from './hearts/hearts.module';
import { StreaksModule } from './streaks/streaks.module';
import { XpModule } from './xp/xp.module';
import { GemsModule } from './gems/gems.module';
import { LeagueModule } from './leagues/leagues.module';
import { AchievementsModule } from './achievements/achievements.module';
import { GamificationController } from './gamification.controller';

@Module({
  imports: [HeartsModule, StreaksModule, XpModule, GemsModule, LeagueModule, AchievementsModule],
  controllers: [GamificationController],
  exports: [HeartsModule, StreaksModule, XpModule, GemsModule, LeagueModule, AchievementsModule],
})
export class GamificationModule {}
