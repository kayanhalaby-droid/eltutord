import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { XpService } from '../xp/xp.service';
import { GemsService } from '../gems/gems.service';
import { Achievement, UserProgressStatus } from '@prisma/client';

interface StreakCondition { type: 'STREAK'; minStreak: number }
interface XpCondition { type: 'XP_MILESTONE'; minTotalXp: number }
interface LessonCondition { type: 'LESSON_COUNT'; minLessonsCompleted: number; subjectId?: string }
interface AnswersCondition { type: 'CORRECT_ANSWERS'; minCorrectAnswers: number }
type AchievementCondition = StreakCondition | XpCondition | LessonCondition | AnswersCondition;

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly xpService: XpService,
    private readonly gemsService: GemsService,
  ) {}

  private unlockedKey = (userId: string) => `user:${userId}:unlocked_achievements`;

  async grantAchievement(userId: string, achievementNameEn: string): Promise<boolean> {
    const achievement = await this.prisma.achievement.findFirst({
      where: { OR: [{ nameEn: achievementNameEn }, { nameAr: achievementNameEn }] },
    });
    if (!achievement) { this.logger.warn(`Achievement ${achievementNameEn} not found`); return false; }

    const already = await this.prisma.userAchievement.count({ where: { userId, achievementId: achievement.id } });
    if (already > 0) return false;

    if (achievement.condition) {
      const userProgress = await this.getUserProgressData(userId);
      const met = this.evaluateCondition(achievement.condition as unknown as AchievementCondition, userProgress);
      if (!met) return false;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userAchievement.create({ data: { userId, achievementId: achievement.id } });
    });

    if (achievement.xpReward > 0) await this.xpService.awardXp(userId, achievement.xpReward);
    if (achievement.gemsReward > 0) await this.gemsService.awardGems(userId, achievement.gemsReward);
    await this.redis.sadd(this.unlockedKey(userId), achievement.id);

    this.logger.log(`User ${userId} unlocked achievement: ${achievementNameEn}`);
    return true;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const cachedIds = await this.redis.smembers(this.unlockedKey(userId));
    if (cachedIds.length > 0) {
      return this.prisma.achievement.findMany({ where: { id: { in: cachedIds } } });
    }

    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const ids = userAchievements.map(ua => ua.achievementId);
    if (ids.length) await this.redis.sadd(this.unlockedKey(userId), ...ids);

    return userAchievements.map(ua => ua.achievement);
  }

  async checkAllAchievements(userId: string): Promise<string[]> {
    const all = await this.prisma.achievement.findMany({ where: { condition: { not: undefined } } });
    const unlocked: string[] = [];
    for (const ach of all) {
      const granted = await this.grantAchievement(userId, ach.nameEn);
      if (granted) unlocked.push(ach.nameEn);
    }
    return unlocked;
  }

  private async getUserProgressData(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { currentStreak: true, totalXp: true },
    });
    const lessonsCompleted = await this.prisma.userProgress.count({
      where: { userId, status: UserProgressStatus.COMPLETED },
    });
    return { currentStreak: user.currentStreak, totalXp: user.totalXp, lessonsCompleted, correctAnswers: 0 };
  }

  private evaluateCondition(condition: AchievementCondition, progress: { currentStreak: number; totalXp: number; lessonsCompleted: number; correctAnswers: number }): boolean {
    switch (condition.type) {
      case 'STREAK': return progress.currentStreak >= condition.minStreak;
      case 'XP_MILESTONE': return progress.totalXp >= condition.minTotalXp;
      case 'LESSON_COUNT': return progress.lessonsCompleted >= condition.minLessonsCompleted;
      case 'CORRECT_ANSWERS': return progress.correctAnswers >= condition.minCorrectAnswers;
      default: return false;
    }
  }
}
