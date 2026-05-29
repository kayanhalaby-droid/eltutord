import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { GamificationConfig } from '../../config/gamification.config';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Jerusalem';

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private totalXpKey = (id: string) => `user:${id}:total_xp`;
  private weeklyXpKey = (id: string) => `user:${id}:weekly_xp`;
  private levelKey = (id: string) => `user:${id}:level`;

  private calculateLevel(totalXp: number): number {
    const curve = GamificationConfig.xp.levelingCurve;
    for (let i = curve.length - 1; i >= 0; i--) {
      if (totalXp >= curve[i]) return i + 1;
    }
    return 1;
  }

  async awardXp(userId: string, xpAmount: number): Promise<{ totalXp: number; weeklyXp: number; level: number; levelUp: boolean }> {
    if (xpAmount <= 0) {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { totalXp: true, weeklyXp: true, level: true } });
      return { ...user, levelUp: false };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { totalXp: true, weeklyXp: true, lastWeeklyXpReset: true, level: true },
    });

    const now = dayjs().tz(TZ);
    const lastReset = dayjs(user.lastWeeklyXpReset).tz(TZ);
    const weekStart = now.startOf('week');
    const needsReset = lastReset.isBefore(weekStart);

    const newTotalXp = user.totalXp + xpAmount;
    const newWeeklyXp = (needsReset ? 0 : user.weeklyXp) + xpAmount;
    const newLevel = this.calculateLevel(newTotalXp);
    const levelUp = newLevel > user.level;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        weeklyXp: newWeeklyXp,
        level: newLevel,
        lastWeeklyXpReset: needsReset ? now.toDate() : user.lastWeeklyXpReset,
      },
      select: { totalXp: true, weeklyXp: true, level: true },
    });

    await this.redis.set(this.totalXpKey(userId), String(updated.totalXp));
    await this.redis.set(this.weeklyXpKey(userId), String(updated.weeklyXp));
    await this.redis.set(this.levelKey(userId), String(updated.level));

    if (levelUp) this.logger.log(`User ${userId} leveled up to ${updated.level}`);
    return { ...updated, levelUp };
  }

  async getUserXpInfo(userId: string): Promise<{ totalXp: number; weeklyXp: number; level: number }> {
    const [t, w, l] = await Promise.all([
      this.redis.get(this.totalXpKey(userId)),
      this.redis.get(this.weeklyXpKey(userId)),
      this.redis.get(this.levelKey(userId)),
    ]);

    if (t !== null && w !== null && l !== null) {
      return { totalXp: parseInt(t, 10), weeklyXp: parseInt(w, 10), level: parseInt(l, 10) };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { totalXp: true, weeklyXp: true, level: true, lastWeeklyXpReset: true },
    });

    const now = dayjs().tz(TZ);
    const weekStart = now.startOf('week');
    const needsReset = dayjs(user.lastWeeklyXpReset).tz(TZ).isBefore(weekStart);
    const weeklyXp = needsReset ? 0 : user.weeklyXp;

    if (needsReset) {
      this.prisma.user.update({ where: { id: userId }, data: { weeklyXp: 0, lastWeeklyXpReset: now.toDate() } }).catch(() => {});
    }

    await this.redis.set(this.totalXpKey(userId), String(user.totalXp));
    await this.redis.set(this.weeklyXpKey(userId), String(weeklyXp));
    await this.redis.set(this.levelKey(userId), String(user.level));

    return { totalXp: user.totalXp, weeklyXp, level: user.level };
  }

  async resetWeeklyXp(userId: string): Promise<void> {
    const now = dayjs().tz(TZ);
    await this.prisma.user.update({ where: { id: userId }, data: { weeklyXp: 0, lastWeeklyXpReset: now.toDate() } });
    await this.redis.set(this.weeklyXpKey(userId), '0');
  }
}
