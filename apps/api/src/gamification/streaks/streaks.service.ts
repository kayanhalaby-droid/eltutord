import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Jerusalem';

@Injectable()
export class StreaksService {
  private readonly logger = new Logger(StreaksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private streakKey = (userId: string) => `user:${userId}:streak`;
  private activityKey = (userId: string) => `user:${userId}:last_activity_date`;

  private today(): string {
    return dayjs().tz(TZ).format('YYYY-MM-DD');
  }

  async recordActivity(userId: string): Promise<{ currentStreak: number; longestStreak: number; streakMaintained: boolean }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastActivityDate: true, streakFreezes: true },
    });

    const todayStr = this.today();
    const lastStr = user.lastActivityDate
      ? dayjs(user.lastActivityDate).tz(TZ).format('YYYY-MM-DD')
      : null;

    if (lastStr === todayStr) {
      return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, streakMaintained: true };
    }

    let newStreak = user.currentStreak;
    let newLongest = user.longestStreak;
    let newFreezes = user.streakFreezes;
    let maintained = false;

    if (!lastStr) {
      newStreak = 1;
      maintained = true;
    } else {
      const todayDay = dayjs.tz(todayStr, TZ).startOf('day');
      const lastDay = dayjs.tz(lastStr, TZ).startOf('day');
      const diff = todayDay.diff(lastDay, 'day');

      if (diff === 1) {
        newStreak += 1;
        maintained = true;
      } else if (diff > 1) {
        const missed = diff - 1;
        if (user.streakFreezes >= missed) {
          newFreezes -= missed;
          newStreak += 1;
          maintained = true;
          this.logger.log(`User ${userId} used ${missed} streak freeze(s)`);
        } else {
          newStreak = 1;
          maintained = false;
        }
      }
    }

    if (newStreak > newLongest) newLongest = newStreak;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: dayjs.tz(todayStr, TZ).startOf('day').toDate(),
        streakFreezes: newFreezes,
      },
      select: { currentStreak: true, longestStreak: true },
    });

    await this.redis.set(this.streakKey(userId), String(updated.currentStreak));
    await this.redis.set(this.activityKey(userId), todayStr);

    return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, streakMaintained: maintained };
  }

  async getStreak(userId: string): Promise<number> {
    const cached = await this.redis.get(this.streakKey(userId));
    if (cached !== null) return parseInt(cached, 10);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { currentStreak: true },
    });
    await this.redis.set(this.streakKey(userId), String(user.currentStreak));
    return user.currentStreak;
  }
}
