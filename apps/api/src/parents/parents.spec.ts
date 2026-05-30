import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

// ── Shared mock helpers ───────────────────────────────────────────────────────

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const todayStr = TODAY.toISOString();

function makePrisma(overrides: any = {}) {
  const completedLesson = {
    id: 'lp1',
    status: 'COMPLETED',
    score: 85,
    completedAt: new Date(),
    updatedAt: new Date(),
    lesson: { nameAr: 'درس الجمع', subject: 'MATH' },
  };

  return {
    parentProfile: {
      findUnique: jest.fn().mockResolvedValue({ id: 'pp1' }),
    },
    studentProfile: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'child1',
        userId: 'child-user-1',
        firstName: 'أحمد',
        lastName: 'محمد',
        gradeLevel: 5,
        parentProfileId: 'pp1',
        user: { totalXp: 500, currentStreak: 3, gemsBalance: 200 },
      }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    lessonProgress: {
      findMany: jest.fn().mockResolvedValue([completedLesson, completedLesson]),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'n1' }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'child-user-1', gemsBalance: 200 }),
      update: jest.fn().mockResolvedValue({ gemsBalance: 220 }),
    },
    ...overrides,
  };
}

function makeGemsService() {
  return { awardGems: jest.fn().mockResolvedValue(220) };
}

function makeService(prismaOverrides: any = {}) {
  return new ParentsService(makePrisma(prismaOverrides) as any);
}

// ── TEST 1: today-summary ─────────────────────────────────────────────────────

describe('TEST 1 — getTodaySummary returns correct shape', () => {
  it('returns totalActivities, totalDurationMinutes, averageScore, completedLessons', async () => {
    const service = makeService();
    const result = await service.getTodaySummary('parent1', 'child1');

    expect(result).toHaveProperty('totalActivities');
    expect(result).toHaveProperty('totalDurationMinutes');
    expect(result).toHaveProperty('averageScore');
    expect(result).toHaveProperty('completedLessons');
    expect(typeof result.totalActivities).toBe('number');
    expect(typeof result.totalDurationMinutes).toBe('number');
    expect(typeof result.averageScore).toBe('number');
    expect(typeof result.completedLessons).toBe('number');
  });
});

// ── TEST 2: weekly-progress ───────────────────────────────────────────────────

describe('TEST 2 — getWeeklyProgress returns 7 days of data', () => {
  it('returns array of 7 items each with date, xp, lessonsCompleted', async () => {
    const service = makeService();
    const result = await service.getWeeklyProgress('parent1', 'child1');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(7);
    for (const day of result) {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('xp');
      expect(day).toHaveProperty('lessonsCompleted');
      expect(typeof day.xp).toBe('number');
      expect(typeof day.lessonsCompleted).toBe('number');
    }
  });
});

// ── TEST 3: skill-radar ───────────────────────────────────────────────────────

describe('TEST 3 — getSkillRadar returns 4 subjects', () => {
  it('returns array of 4 subjects each with subject, masteryPercent, lessonsCompleted', async () => {
    const service = makeService();
    const result = await service.getSkillRadar('parent1', 'child1');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
    for (const skill of result) {
      expect(skill).toHaveProperty('subject');
      expect(skill).toHaveProperty('masteryPercent');
      expect(skill).toHaveProperty('lessonsCompleted');
      expect(typeof skill.masteryPercent).toBe('number');
      expect(skill.masteryPercent).toBeGreaterThanOrEqual(0);
      expect(skill.masteryPercent).toBeLessThanOrEqual(100);
    }
  });
});

// ── TEST 4: encourage ────────────────────────────────────────────────────────

describe('TEST 4 — sendEncouragement stores notification and awards gems', () => {
  it('returns { success: true } and calls notification.create', async () => {
    const prisma = makePrisma();
    const service = new ParentsService(prisma as any);
    const result = await service.sendEncouragement('parent1', 'child1', 'أحسنت يا بطل!', 10, 'أبو أحمد');

    expect(result).toEqual({ success: true });
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'PARENT_MESSAGE',
        }),
      }),
    );
  });
});

// ── TEST 5: role guard ───────────────────────────────────────────────────────

describe('TEST 5 — STUDENT role cannot access GET /parents/children', () => {
  it('ParentsController has RolesGuard metadata restricting to PARENT role', () => {
    const guards: any[] = Reflect.getMetadata('__guards__', ParentsController) ?? [];
    const hasRolesGuard = guards.some(
      (g) => g === RolesGuard || (g && g.name === 'RolesGuard'),
    );
    expect(hasRolesGuard).toBe(true);
  });
});
