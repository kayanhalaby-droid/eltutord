import { Module } from '@nestjs/common';
import { LeagueService } from './leagues.service';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [XpModule],
  providers: [LeagueService],
  exports: [LeagueService],
})
export class LeagueModule {}
