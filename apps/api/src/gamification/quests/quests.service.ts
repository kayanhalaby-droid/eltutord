import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Jerusalem';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  gemsReward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

const QUEST_TEMPLATES = [
  { id: 'earn-xp-50',   title: 'اكسب 50 نقطة',        description: 'اكسب 50 XP اليوم',                     icon: '⭐', gemsReward: 10, target: 50,  metric: 'daily_xp' },
  { id: 'earn-xp-100',  title: 'اكسب 100 نقطة',       description: 'اكسب 100 XP اليوم',                    icon: '🌟', gemsReward: 20, target: 100, metric: 'daily_xp' },
  { id: 'lessons-2',    title: 'أكمل درسين',           description: 'أكمل درسين اليوم',                     icon: '📚', gemsReward: 15, target: 2,   metric: 'daily_lessons' },
  { id: 'lessons-3',    title: 'أكمل 3 دروس',          description: 'أكمل 3 دروس اليوم',                    icon: '🎓', gemsReward: 25, target: 3,   metric: 'daily_lessons' },
  { id: 'perfect-1',    title: 'درس مثالي',            description: 'أكمل درساً بنتيجة 100%',               icon: '💯', gemsReward: 20, target: 1,   metric: 'perfect_lessons' },
  { id: 'streak-keep',  title: 'حافظ على سلسلتك',     description: 'سجّل نشاطاً اليوم للحفاظ على سلسلتك',  icon: '🔥', gemsReward: 5,  target: 1,   metric: 'daily_activity' },
  { id: 'correct-10',   title: 'أجب على 10 أسئلة',    description: 'أجب على 10 أسئلة صحيحة اليوم',         icon: '✅', gemsReward: 10, target: 10,  metric: 'correct_answers' },
  { id: 'correct-20',   title: 'أجب على 20 سؤالاً',   description: 'أجب على 20 سؤالاً صحيحاً اليوم',       icon: '🎯', gemsReward: 20, target: 20,  metric: 'correct_answers' },
  { id: 'minutes-15',   title: 'تعلّم 15 دقيقة',       description: 'أمضِ 15 دقيقة في التعلم اليوم',        icon: '⏱️', gemsReward: 15, target: 15,  metric: 'study_minutes' },
];

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private todayStr(): string {
    return dayjs().tz(TZ).format('YYYY-MM-DD');
  }

  private todayKey(userId: string): string {
    return `user:${userId}:quests:${this.todayStr()}`;
  }

  private progressKey(userId: string, metric: string): string {
    return `user:${userId}:quest_progress:${metric}:${this.todayStr()}`;
  }

  private secondsUntilMidnight(): number {
    return dayjs().tz(TZ).endOf('day').diff(dayjs(), 'second');
  }

  async getDailyQuests(userId: string): Promise<{ quests: DailyQuest[]; bonusGems: number; allCompleted: boolean }> {
    const key = this.todayKey(userId);
    let questIds: string[];

    const cached = await this.redis.get(key);
    if (cached) {
      questIds = JSON.parse(cached);
    } else {
      // Deterministic daily selection: seed from userId + date
      const seed = userId.charCodeAt(0) + parseInt(this.todayStr().replace(/-/g, ''), 10) % 1000;
      const shuffled = [...QUEST_TEMPLATES].sort((a, b) => {
        const ha = (seed * a.id.charCodeAt(0)) % 1000;
        const hb = (seed * b.id.charCodeAt(0)) % 1000;
        return ha - hb;
      });
      questIds = shuffled.slice(0, 3).map(q => q.id);
      await this.redis.set(key, JSON.stringify(questIds), 'EX', this.secondsUntilMidnight());
    }

    const quests: DailyQuest[] = await Promise.all(
      questIds.map(async (id) => {
        const template = QUEST_TEMPLATES.find(t => t.id === id)!;
        const progressStr = await this.redis.get(this.progressKey(userId, template.metric));
        const progress = parseInt(progressStr ?? '0', 10);
        const completed = progress >= template.target;
        const claimedKey = `user:${userId}:quest_claimed:${id}:${this.todayStr()}`;
        const claimed = !!(await this.redis.get(claimedKey));
        return {
          id: template.id,
          title: template.title,
          description: template.description,
          icon: template.icon,
          gemsReward: template.gemsReward,
          progress: Math.min(progress, template.target),
          target: template.target,
          completed,
          claimed,
        };
      }),
    );

    const allCompleted = quests.every(q => q.completed);
    const bonusGems = allCompleted ? 30 : 0;

    return { quests, bonusGems, allCompleted };
  }

  async incrementQuestProgress(userId: string, metric: string, amount: number = 1): Promise<void> {
    const key = this.progressKey(userId, metric);
    const current = parseInt((await this.redis.get(key)) ?? '0', 10);
    await this.redis.set(key, String(current + amount), 'EX', this.secondsUntilMidnight());
  }

  async claimQuestBonus(userId: string): Promise<{ gemsAwarded: number }> {
    const { allCompleted, bonusGems } = await this.getDailyQuests(userId);
    if (!allCompleted) throw new BadRequestException('لم تُكمل جميع المهام اليومية بعد');
    const bonusClaimedKey = `user:${userId}:quests_bonus_claimed:${this.todayStr()}`;
    const alreadyClaimed = await this.redis.get(bonusClaimedKey);
    if (alreadyClaimed) throw new BadRequestException('تم استلام المكافأة اليومية بالفعل');
    await this.redis.set(bonusClaimedKey, '1', 'EX', 86400);
    return { gemsAwarded: bonusGems };
  }
}
