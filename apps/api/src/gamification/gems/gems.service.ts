import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class GemsService {
  private readonly logger = new Logger(GemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private gemsKey = (userId: string) => `user:${userId}:gems`;

  async getGems(userId: string): Promise<number> {
    const cached = await this.redis.get(this.gemsKey(userId));
    if (cached !== null) return parseInt(cached, 10);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { gemsBalance: true } });
    await this.redis.set(this.gemsKey(userId), String(user.gemsBalance));
    return user.gemsBalance;
  }

  async awardGems(userId: string, amount: number): Promise<number> {
    if (amount <= 0) return this.getGems(userId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { gemsBalance: { increment: amount } },
      select: { gemsBalance: true },
    });
    await this.redis.set(this.gemsKey(userId), String(updated.gemsBalance));
    this.logger.log(`User ${userId} awarded ${amount} gems. Balance: ${updated.gemsBalance}`);
    return updated.gemsBalance;
  }

  async spendGems(userId: string, amount: number): Promise<number> {
    if (amount <= 0) return this.getGems(userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { gemsBalance: true } });
      if (user.gemsBalance < amount) throw new BadRequestException(`الجواهر غير كافية (لديك ${user.gemsBalance}، تحتاج ${amount})`);
      return tx.user.update({
        where: { id: userId },
        data: { gemsBalance: { decrement: amount } },
        select: { gemsBalance: true },
      });
    });
    await this.redis.set(this.gemsKey(userId), String(updated.gemsBalance));
    return updated.gemsBalance;
  }
}
