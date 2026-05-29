import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { GamificationConfig } from '../../config/gamification.config';

@Injectable()
export class HeartsService {
  private readonly logger = new Logger(HeartsService.name);
  private readonly REGEN_INTERVAL_MS = GamificationConfig.hearts.regenerationIntervalMs;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private heartsKey = (userId: string) => `user:${userId}:hearts`;
  private regenKey = (userId: string) => `user:${userId}:last_heart_regen`;

  async getHearts(userId: string): Promise<{ hearts: number; maxHearts: number; nextRegenerationAt: Date | null }> {
    const cachedHearts = await this.redis.get(this.heartsKey(userId));
    const cachedRegen = await this.redis.get(this.regenKey(userId));

    let hearts: number;
    let maxHearts: number;
    let lastRegen: Date;

    if (cachedHearts !== null && cachedRegen !== null) {
      hearts = parseInt(cachedHearts, 10);
      maxHearts = GamificationConfig.hearts.maxHearts;
      lastRegen = new Date(cachedRegen);
    } else {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { hearts: true, maxHearts: true, lastHeartRegenerationAt: true },
      });
      hearts = user.hearts;
      maxHearts = user.maxHearts;
      lastRegen = user.lastHeartRegenerationAt;
      await this.redis.set(this.heartsKey(userId), String(hearts));
      await this.redis.set(this.regenKey(userId), lastRegen.toISOString());
    }

    const { hearts: updatedHearts, lastHeartRegenerationAt: updatedRegen, maxHearts: updatedMax } =
      await this.regenerateHearts(userId, hearts, maxHearts, lastRegen);

    const nextRegenerationAt =
      updatedHearts < updatedMax
        ? new Date(updatedRegen.getTime() + this.REGEN_INTERVAL_MS)
        : null;

    return { hearts: updatedHearts, maxHearts: updatedMax, nextRegenerationAt };
  }

  async depleteHeart(userId: string): Promise<number> {
    const { hearts, maxHearts } = await this.getHearts(userId);
    if (hearts <= 0) throw new BadRequestException('لا توجد قلوب متبقية');

    const newHearts = hearts - 1;
    const now = new Date();
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { hearts: newHearts, lastHeartRegenerationAt: newHearts < maxHearts ? now : undefined },
      select: { hearts: true, lastHeartRegenerationAt: true },
    });

    await this.redis.set(this.heartsKey(userId), String(updated.hearts));
    await this.redis.set(this.regenKey(userId), updated.lastHeartRegenerationAt.toISOString());
    this.logger.log(`User ${userId} depleted a heart. Remaining: ${updated.hearts}`);
    return updated.hearts;
  }

  async refillHearts(userId: string): Promise<number> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { maxHearts: true } });
    const now = new Date();
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { hearts: user.maxHearts, lastHeartRegenerationAt: now },
      select: { hearts: true },
    });
    await this.redis.set(this.heartsKey(userId), String(updated.hearts));
    await this.redis.set(this.regenKey(userId), now.toISOString());
    return updated.hearts;
  }

  private async regenerateHearts(
    userId: string,
    hearts: number,
    maxHearts: number,
    lastRegen: Date,
  ): Promise<{ hearts: number; maxHearts: number; lastHeartRegenerationAt: Date }> {
    if (hearts >= maxHearts) return { hearts, maxHearts, lastHeartRegenerationAt: lastRegen };

    const elapsed = Date.now() - lastRegen.getTime();
    const toRegen = Math.floor(elapsed / this.REGEN_INTERVAL_MS);
    if (toRegen <= 0) return { hearts, maxHearts, lastHeartRegenerationAt: lastRegen };

    const newHearts = Math.min(hearts + toRegen, maxHearts);
    const newRegen =
      newHearts < maxHearts
        ? new Date(lastRegen.getTime() + toRegen * this.REGEN_INTERVAL_MS)
        : new Date();

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { hearts: newHearts, lastHeartRegenerationAt: newRegen },
      select: { hearts: true, maxHearts: true, lastHeartRegenerationAt: true },
    });

    await this.redis.set(this.heartsKey(userId), String(updated.hearts));
    await this.redis.set(this.regenKey(userId), updated.lastHeartRegenerationAt.toISOString());
    return updated;
  }
}
