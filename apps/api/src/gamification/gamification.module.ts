import { Module } from '@nestjs/common';
import { HeartsModule } from './hearts/hearts.module';
import { StreaksModule } from './streaks/streaks.module';
import { XpModule } from './xp/xp.module';
import { GemsModule } from './gems/gems.module';
import { LeagueModule } from './leagues/leagues.module';
import { AchievementsModule } from './achievements/achievements.module';
import { QuestsModule } from './quests/quests.module';
import { GamificationController } from './gamification.controller';
import { ShopController } from './shop/shop.controller';

@Module({
  imports: [HeartsModule, StreaksModule, XpModule, GemsModule, LeagueModule, AchievementsModule, QuestsModule],
  controllers: [GamificationController, ShopController],
  exports: [HeartsModule, StreaksModule, XpModule, GemsModule, LeagueModule, AchievementsModule, QuestsModule],
})
export class GamificationModule {}
