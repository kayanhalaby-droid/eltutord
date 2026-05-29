import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { GamificationConfig } from '../../config/gamification.config';
import { XpService } from '../xp/xp.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

const TZ = 'Asia/Jerusalem';
const TIERS = GamificationConfig.leagues.leagueTiers;

@Injectable()
export class LeagueService {
  private readonly logger = new Logger(LeagueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly xpService: XpService,
  ) {}

  private leagueKey(name: string, week: number, year: number) { return `league:${name}:${week}:${year}`; }
  private leagueRedisKey = (userId: string) => `user:${userId}:current_league`;
  private rankRedisKey = (userId: string) => `user:${userId}:current_league_rank`;

  private weekYear() {
    const n = dayjs().tz(TZ);
    return { week: (n as any).week() as number, year: n.year() };
  }

  async assignDefaultLeague(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { league: true } });
    if (!TIERS.includes(user.league)) {
      await this.prisma.user.update({ where: { id: userId }, data: { league: TIERS[0] } });
      await this.redis.set(this.leagueRedisKey(userId), TIERS[0]);
    }
  }

  async updateLeagueXp(userId: string, weeklyXp: number, league: string): Promise<void> {
    const { week, year } = this.weekYear();
    const key = this.leagueKey(league, week, year);
    await this.redis.zadd(key, weeklyXp, userId);
    await this.redis.expire(key, 2 * 7 * 24 * 60 * 60);
  }

  async getLeaderboard(leagueName: string): Promise<{ userId: string; xp: number }[]> {
    const { week, year } = this.weekYear();
    const raw = await this.redis.zrevrange(this.leagueKey(leagueName, week, year), 0, -1, 'WITHSCORES');
    const result: { userId: string; xp: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      result.push({ userId: raw[i], xp: parseInt(raw[i + 1], 10) });
    }
    return result;
  }

  async getUserLeagueInfo(userId: string): Promise<{ league: string; rank: number } | null> {
    const [cachedLeague, cachedRank] = await Promise.all([
      this.redis.get(this.leagueRedisKey(userId)),
      this.redis.get(this.rankRedisKey(userId)),
    ]);
    if (cachedLeague && cachedRank) return { league: cachedLeague, rank: parseInt(cachedRank, 10) };

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { league: true } });
    if (!user?.league) return null;

    const { week, year } = this.weekYear();
    const rank = await this.redis.zrevrank(this.leagueKey(user.league, week, year), userId);
    const finalRank = rank ?? -1;

    await this.redis.set(this.leagueRedisKey(userId), user.league);
    await this.redis.set(this.rankRedisKey(userId), String(finalRank));

    return { league: user.league, rank: finalRank };
  }

  async runWeeklyReset(): Promise<void> {
    this.logger.log('Starting weekly league reset...');
    const allUsers = await this.prisma.user.findMany({ select: { id: true, league: true } });

    const usersByLeague: Record<string, string[]> = {};
    for (const u of allUsers) {
      if (!usersByLeague[u.league]) usersByLeague[u.league] = [];
      usersByLeague[u.league].push(u.id);
    }

    const updates: { id: string; league: string; rank: number }[] = [];

    for (let i = 0; i < TIERS.length; i++) {
      const tier = TIERS[i];
      const leaderboard = await this.getLeaderboard(tier);
      leaderboard.sort((a, b) => b.xp - a.xp);
      const count = leaderboard.length;
      const promote = Math.floor(count * GamificationConfig.leagues.promotionThreshold);
      const demote = Math.floor(count * GamificationConfig.leagues.demotionThreshold);

      for (let j = 0; j < count; j++) {
        const { userId } = leaderboard[j];
        let newLeague = tier;
        if (j < promote && TIERS[i + 1]) newLeague = TIERS[i + 1];
        else if (j >= count - demote && TIERS[i - 1]) newLeague = TIERS[i - 1];
        updates.push({ id: userId, league: newLeague, rank: j });
      }
    }

    await this.prisma.$transaction(
      updates.map(u => this.prisma.user.update({ where: { id: u.id }, data: { league: u.league, leagueRank: u.rank } })),
    );

    for (const u of updates) {
      await this.redis.set(this.leagueRedisKey(u.id), u.league);
      await this.redis.set(this.rankRedisKey(u.id), String(u.rank));
    }

    for (const u of allUsers) await this.xpService.resetWeeklyXp(u.id);
    this.logger.log('Weekly league reset complete');
  }
}
