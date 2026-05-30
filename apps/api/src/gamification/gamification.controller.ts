import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { HeartsService } from './hearts/hearts.service';
import { StreaksService } from './streaks/streaks.service';
import { XpService } from './xp/xp.service';
import { GemsService } from './gems/gems.service';
import { LeagueService } from './leagues/leagues.service';
import { AchievementsService } from './achievements/achievements.service';
import { QuestsService } from './quests/quests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamificationConfig } from '../config/gamification.config';
import { IsNumber, IsPositive } from 'class-validator';

class AwardXpDto {
  @IsNumber() @IsPositive() amount: number;
}

// Avatar customization catalog
const AVATAR_CATALOG_API = [
  { id: 'hat-graduation', nameAr: 'قبعة التخرج',   nameEn: 'Graduation Cap',   slot: 'HAT',        emoji: '🎓', cost: 80  },
  { id: 'hat-crown',      nameAr: 'تاج ملكي',       nameEn: 'Crown',            slot: 'HAT',        emoji: '👑', cost: 150 },
  { id: 'hat-cowboy',     nameAr: 'قبعة كاوبوي',    nameEn: 'Cowboy Hat',       slot: 'HAT',        emoji: '🤠', cost: 60  },
  { id: 'hat-wizard',     nameAr: 'قبعة ساحر',      nameEn: 'Wizard Hat',       slot: 'HAT',        emoji: '🧙', cost: 120 },
  { id: 'acc-glasses',    nameAr: 'نظارات',          nameEn: 'Glasses',          slot: 'ACCESSORY',  emoji: '🕶️', cost: 50  },
  { id: 'acc-bow',        nameAr: 'ربطة عنق',        nameEn: 'Bow Tie',          slot: 'ACCESSORY',  emoji: '🎀', cost: 40  },
  { id: 'acc-star',       nameAr: 'نجمة ذهبية',      nameEn: 'Gold Star',        slot: 'ACCESSORY',  emoji: '⭐', cost: 30  },
  { id: 'color-gold',     nameAr: 'لون ذهبي',        nameEn: 'Gold',             slot: 'COLOR',      emoji: '🟡', cost: 100 },
  { id: 'color-purple',   nameAr: 'لون بنفسجي',      nameEn: 'Purple',           slot: 'COLOR',      emoji: '🟣', cost: 90  },
  { id: 'bg-stars',       nameAr: 'خلفية النجوم',    nameEn: 'Starry Night',     slot: 'BACKGROUND', emoji: '🌌', cost: 200 },
  { id: 'bg-rainbow',     nameAr: 'خلفية قوس قزح',   nameEn: 'Rainbow',          slot: 'BACKGROUND', emoji: '🌈', cost: 150 },
];

// Also used by ShopController — kept here for GamificationController shop routes
const SHOP_CATALOG = [
  {
    id: 'hearts-refill',
    name: 'إعادة تعبئة القلوب',
    description: 'استعد قلوبك الخمسة كاملة',
    icon: '❤️',
    cost: GamificationConfig.gems.costHeartRefill,
    type: 'hearts' as const,
  },
  {
    id: 'streak-freeze',
    name: 'تجميد السلسلة',
    description: 'احمِ سلسلتك ليوم واحد إذا نسيت',
    icon: '❄️',
    cost: GamificationConfig.gems.costStreakFreeze,
    type: 'streak' as const,
  },
  {
    id: 'xp-boost-1h',
    name: 'مضاعف XP لساعة',
    description: 'اكسب ضعف نقاط الخبرة لمدة ساعة',
    icon: '⚡',
    cost: 150,
    type: 'xp' as const,
  },
  {
    id: 'gems-bonus-daily',
    name: 'مكافأة الجواهر اليومية',
    description: 'احصل على 20 جوهرة إضافية اليوم',
    icon: '💎',
    cost: 0,
    type: 'bonus' as const,
    isFree: true as const,
  },
];

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
    private readonly quests: QuestsService,
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
    await this.gems.spendGems(req.user.id, 100);
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

  // ─── Shop (also served at /shop/* by ShopController) ─────────
  @Get('shop/items')
  async getShopItems(@Req() req: { user: { id: string } }) {
    const userGems = await this.gems.getGems(req.user.id);
    return SHOP_CATALOG.map(item => ({
      ...item,
      canAfford: (item as any).isFree ? true : userGems >= item.cost,
    }));
  }

  @Post('shop/purchase')
  @HttpCode(HttpStatus.OK)
  async purchaseItem(
    @Req() req: { user: { id: string } },
    @Body() body: { itemId: string },
  ) {
    const item = SHOP_CATALOG.find(i => i.id === body.itemId);
    if (!item) throw new BadRequestException('المنتج غير موجود');

    if (!(item as any).isFree && item.cost > 0) {
      await this.gems.spendGems(req.user.id, item.cost);
    }

    switch (item.id) {
      case 'hearts-refill':
        await this.hearts.refillHearts(req.user.id);
        return { success: true, message: 'تم إعادة تعبئة القلوب! ❤️' };
      case 'streak-freeze':
        await this.streaks.addStreakFreeze(req.user.id);
        return { success: true, message: 'تم شراء تجميد السلسلة! ❄️' };
      case 'xp-boost-1h':
        await this.xp.activateXpBoost(req.user.id, 60);
        return { success: true, message: 'تم تفعيل مضاعف XP لساعة! ⚡' };
      case 'gems-bonus-daily':
        await this.gems.awardGems(req.user.id, 20);
        return { success: true, message: 'تم إضافة 20 جوهرة! 💎' };
      default:
        return { success: true, message: 'تم الشراء بنجاح' };
    }
  }

  // ─── Avatar Shop ────────────────────────────────────
  @Get('shop/avatar-items')
  async getAvatarItems(@Req() req: { user: { id: string } }) {
    const userGems = await this.gems.getGems(req.user.id);
    return AVATAR_CATALOG_API.map(item => ({
      ...item,
      canAfford: userGems >= item.cost,
    }));
  }

  @Post('shop/purchase-avatar')
  @HttpCode(HttpStatus.OK)
  async purchaseAvatarItem(
    @Req() req: { user: { id: string } },
    @Body() body: { itemId: string },
  ) {
    const item = AVATAR_CATALOG_API.find(i => i.id === body.itemId);
    if (!item) throw new BadRequestException('العنصر غير موجود');
    await this.gems.spendGems(req.user.id, item.cost);
    return { success: true, message: `تم شراء ${item.nameAr}! ${item.emoji}`, itemId: item.id };
  }

  // ─── Daily Quests ────────────────────────────────
  @Get('quests/daily')
  getDailyQuests(@Req() req: { user: { id: string } }) {
    return this.quests.getDailyQuests(req.user.id);
  }

  @Post('quests/daily/claim-bonus')
  @HttpCode(HttpStatus.OK)
  async claimQuestsBonus(@Req() req: { user: { id: string } }) {
    const result = await this.quests.claimQuestBonus(req.user.id);
    if (result.gemsAwarded > 0) {
      await this.gems.awardGems(req.user.id, result.gemsAwarded);
    }
    return result;
  }

  // ─── Encouragements ──────────────────────────────
  @Get('encouragements/pending')
  getPendingEncouragements() {
    // ParentReward tracks XP-based goals set by parents, not real-time messages.
    return { encouragements: [] };
  }
}
