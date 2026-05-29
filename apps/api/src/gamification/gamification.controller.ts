import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { HeartsService } from './hearts/hearts.service';
import { StreaksService } from './streaks/streaks.service';
import { XpService } from './xp/xp.service';
import { GemsService } from './gems/gems.service';
import { LeagueService } from './leagues/leagues.service';
import { AchievementsService } from './achievements/achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNumber, IsPositive } from 'class-validator';

class AwardXpDto {
  @IsNumber() @IsPositive() amount: number;
}

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private readonly hearts: HeartsService,
    private readonly streaks: StreaksService,
    private readonly xp: XpService,
    private readonly gems: GemsService,
    private readonly league: LeagueService,
    private readonly achievements: AchievementsService,
  ) {}

  // ─── Hearts ────────────────────────────────────
  @Get('hearts')
  getHearts(@Req() req: { user: { id: string } }) {
    return this.hearts.getHearts(req.user.id);
  }

  @Post('hearts/deplete')
  @HttpCode(HttpStatus.OK)
  depleteHeart(@Req() req: { user: { id: string } }) {
    return this.hearts.depleteHeart(req.user.id);
  }

  @Post('hearts/refill')
  @HttpCode(HttpStatus.OK)
  async refillHearts(@Req() req: { user: { id: string } }) {
    await this.gems.spendGems(req.user.id, 100); // costs 100 gems
    return this.hearts.refillHearts(req.user.id);
  }

  // ─── Streak ────────────────────────────────────
  @Get('streak')
  getStreak(@Req() req: { user: { id: string } }) {
    return this.streaks.getStreak(req.user.id);
  }

  @Post('streak/activity')
  @HttpCode(HttpStatus.OK)
  recordActivity(@Req() req: { user: { id: string } }) {
    return this.streaks.recordActivity(req.user.id);
  }

  // ─── XP ────────────────────────────────────────
  @Get('xp')
  getXp(@Req() req: { user: { id: string } }) {
    return this.xp.getUserXpInfo(req.user.id);
  }

  @Post('xp/award')
  @HttpCode(HttpStatus.OK)
  awardXp(@Req() req: { user: { id: string } }, @Body() body: AwardXpDto) {
    return this.xp.awardXp(req.user.id, body.amount);
  }

  // ─── Gems ───────────────────────────────────────
  @Get('gems')
  getGems(@Req() req: { user: { id: string } }) {
    return this.gems.getGems(req.user.id);
  }

  // ─── League ─────────────────────────────────────
  @Get('league')
  getLeagueInfo(@Req() req: { user: { id: string } }) {
    return this.league.getUserLeagueInfo(req.user.id);
  }

  @Get('league/:name/leaderboard')
  getLeaderboard(@Param('name') name: string) {
    return this.league.getLeaderboard(name);
  }

  // ─── Achievements ────────────────────────────────
  @Get('achievements')
  getAchievements(@Req() req: { user: { id: string } }) {
    return this.achievements.getUserAchievements(req.user.id);
  }

  @Post('achievements/check')
  @HttpCode(HttpStatus.OK)
  checkAchievements(@Req() req: { user: { id: string } }) {
    return this.achievements.checkAllAchievements(req.user.id);
  }
}
