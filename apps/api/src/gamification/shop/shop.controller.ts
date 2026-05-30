import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GemsService } from '../gems/gems.service';
import { HeartsService } from '../hearts/hearts.service';
import { StreaksService } from '../streaks/streaks.service';
import { XpService } from '../xp/xp.service';
import { GamificationConfig } from '../../config/gamification.config';

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

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(
    private readonly gems: GemsService,
    private readonly hearts: HeartsService,
    private readonly streaks: StreaksService,
    private readonly xp: XpService,
  ) {}

  @Get('items')
  async getShopItems(@Req() req: { user: { id: string } }) {
    const userGems = await this.gems.getGems(req.user.id);
    return SHOP_CATALOG.map(item => ({
      ...item,
      canAfford: (item as any).isFree ? true : userGems >= item.cost,
    }));
  }

  @Post('purchase')
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
}
