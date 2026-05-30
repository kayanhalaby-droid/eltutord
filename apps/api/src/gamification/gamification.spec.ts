import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { LeagueService } from './leagues/leagues.service';
import { StreaksService } from './streaks/streaks.service';
import { QuestsService } from './quests/quests.service';

// ── Shared mock helpers ───────────────────────────────────────────────────────

const makeHearts = (o: any = {}) => ({
  getHearts: jest.fn(), depleteHeart: jest.fn(),
  refillHearts: jest.fn().mockResolvedValue(5), ...o,
});
const makeStreaks = (o: any = {}) => ({
  getStreak: jest.fn(), recordActivity: jest.fn(),
  addStreakFreeze: jest.fn().mockResolvedValue(undefined), ...o,
});
const makeXp = (o: any = {}) => ({
  getUserXpInfo: jest.fn(), awardXp: jest.fn(),
  activateXpBoost: jest.fn().mockResolvedValue(undefined), ...o,
});
const makeGems = (gems = 500, o: any = {}) => ({
  getGems: jest.fn().mockResolvedValue(gems),
  spendGems: jest.fn().mockResolvedValue(gems - 100),
  awardGems: jest.fn().mockResolvedValue(gems + 20), ...o,
});
const makeLeague = () => ({ getUserLeagueInfo: jest.fn(), getLeaderboard: jest.fn(), updateLeagueXp: jest.fn() });
const makeAchievements = () => ({ getUserAchievements: jest.fn(), checkAllAchievements: jest.fn() });
const makeQuests = () => ({
  getDailyQuests: jest.fn().mockResolvedValue({
    quests: [
      { id: 'q1', title: 'اكسب 50 نقطة', description: 'desc', icon: '⭐', gemsReward: 10, progress: 0, target: 50, completed: false, claimed: false },
      { id: 'q2', title: 'أكمل درسين', description: 'desc', icon: '📚', gemsReward: 15, progress: 0, target: 2, completed: false, claimed: false },
      { id: 'q3', title: 'حافظ على سلسلتك', description: 'desc', icon: '🔥', gemsReward: 5, progress: 0, target: 1, completed: false, claimed: false },
    ],
    bonusGems: 0,
    allCompleted: false,
  }),
  incrementQuestProgress: jest.fn(),
  claimQuestBonus: jest.fn(),
});

function makeController(gems = 500, heartsO: any = {}, gemsO: any = {}) {
  return new GamificationController(
    makeHearts(heartsO) as any,
    makeStreaks() as any,
    makeXp() as any,
    makeGems(gems, gemsO) as any,
    makeLeague() as any,
    makeAchievements() as any,
    makeQuests() as any,
  );
}

// ── TEST 1: Shop items ────────────────────────────────────────────────────────

describe('TEST 1 — GET /gamification/shop/items returns shop items array', () => {
  it('returns at least 3 items each with a canAfford field', async () => {
    const ctrl = makeController(500);
    const result = await ctrl.getShopItems({ user: { id: 'u1' } } as any);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(3);
    for (const item of result) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('cost');
      expect(item).toHaveProperty('canAfford');
    }
  });
});

// ── TEST 2: Purchase deducts gems and applies effect ──────────────────────────

describe('TEST 2 — POST /gamification/shop/purchase deducts gems and refills hearts', () => {
  it('calls spendGems and refillHearts when purchasing hearts-refill', async () => {
    const hearts = makeHearts();
    const gems = makeGems(500);
    const ctrl = new GamificationController(
      hearts as any, makeStreaks() as any, makeXp() as any,
      gems as any, makeLeague() as any, makeAchievements() as any, makeQuests() as any,
    );

    const result = await ctrl.purchaseItem({ user: { id: 'u1' } } as any, { itemId: 'hearts-refill' });

    expect(gems.spendGems).toHaveBeenCalledWith('u1', 100);
    expect(hearts.refillHearts).toHaveBeenCalledWith('u1');
    expect(result).toHaveProperty('success', true);
  });
});

// ── TEST 3: Purchase fails on insufficient gems ───────────────────────────────

describe('TEST 3 — POST /gamification/shop/purchase fails if insufficient gems', () => {
  it('propagates BadRequestException when spendGems throws', async () => {
    const gems = makeGems(50, {
      spendGems: jest.fn().mockRejectedValue(new BadRequestException('الجواهر غير كافية')),
    });
    const ctrl = new GamificationController(
      makeHearts() as any, makeStreaks() as any, makeXp() as any,
      gems as any, makeLeague() as any, makeAchievements() as any, makeQuests() as any,
    );

    await expect(ctrl.purchaseItem({ user: { id: 'u1' } } as any, { itemId: 'hearts-refill' }))
      .rejects.toThrow(BadRequestException);
  });
});

// ── TEST 4: Daily quests ──────────────────────────────────────────────────────

describe('TEST 4 — GET /gamification/quests returns 3 daily quests', () => {
  it('returns quests array with exactly 3 items each with required fields', async () => {
    const ctrl = makeController();
    const result = await ctrl.getDailyQuests({ user: { id: 'u1' } } as any);

    expect(result).toHaveProperty('quests');
    expect(result.quests).toHaveLength(3);
    for (const q of result.quests) {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('title');
      expect(q).toHaveProperty('gemsReward');
      expect(q).toHaveProperty('progress');
      expect(q).toHaveProperty('target');
      expect(q).toHaveProperty('completed');
    }
  });
});

// ── TEST 5: League weekly reset @Cron decorator ───────────────────────────────

describe('TEST 5 — League weekly reset cron is registered', () => {
  it('runWeeklyReset has @Cron metadata set to Sunday 23:59 Jerusalem', () => {
    // NestJS SetMetadata stores on descriptor.value (the function itself)
    const fn = LeagueService.prototype.runWeeklyReset;
    const metaOnFn = Reflect.getMetadata('SCHEDULE_CRON_OPTIONS', fn);
    // Fallback: check on prototype with property key
    const metaOnProto = Reflect.getMetadata('SCHEDULE_CRON_OPTIONS', LeagueService.prototype, 'runWeeklyReset');
    const metadata = metaOnFn ?? metaOnProto;
    expect(metadata).toBeDefined();
    expect(metadata).toMatchObject({ cronTime: '59 23 * * 0' });
  });
});

// ── TEST 6: Streak milestone at 7 days ────────────────────────────────────────

describe('TEST 6 — Streak milestone triggers at 7 days', () => {
  it('recordActivity returns milestone=7 when streak reaches 7', async () => {
    const yesterday = new Date(Date.now() - 86400000);
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: yesterday,
          streakFreezes: 0,
        }),
        update: jest.fn().mockResolvedValue({ currentStreak: 7, longestStreak: 7 }),
      },
    };
    const redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };

    const service = new StreaksService(prisma as any, redis as any);
    const result = await service.recordActivity('u1');

    expect(result.milestone).toBe(7);
  });
});
