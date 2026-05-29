import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressStatus } from '@prisma/client';
import { invokeLLM } from '@elitutor/shared';
import { ParentChildrenDto } from './dto/parent-children.dto';
import { ChildProgressDto } from './dto/child-progress.dto';
import { WeeklyReportDto } from './dto/weekly-report.dto';

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getChildren(userId: string): Promise<ParentChildrenDto[]> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            user: { select: { totalXp: true, currentStreak: true, gemsBalance: true } },
          },
        },
      },
    });

    if (!parentProfile) {
      throw new NotFoundException('„… ״¹״«״± ״¹„‰ …„ ״§„ˆ״§„״¯/״§„ˆ״§„״¯״©');
    }

    return parentProfile.children.map((child) => ({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      gradeLevel: child.gradeLevel,
      schoolName: child.schoolName ?? undefined,
      xp: child.user.totalXp,
      streak: child.user.currentStreak,
      gems: child.user.gemsBalance,
    }));
  }

  async linkChild(userId: string, parentCode: string): Promise<{ message: string }> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
    });
    if (!parentProfile) {
      throw new NotFoundException('„… ״¹״«״± ״¹„‰ …„ ״§„ˆ״§„״¯/״§„ˆ״§„״¯״©');
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { parentCode },
    });
    if (!student) {
      throw new NotFoundException('״§„ƒˆ״¯ ״÷״± ״µ״­״­ ג€” „״§ ˆ״¬״¯ ״·״§„״¨ ״¨‡״°״§ ״§„ƒˆ״¯');
    }
    if (student.parentProfileId) {
      throw new BadRequestException('‡״°״§ ״§„״·״§„״¨ …״±״×״¨״· ״¨ˆ״§„״¯/ˆ״§„״¯״© ״¢״®״±');
    }

    await this.prisma.studentProfile.update({
      where: { id: student.id },
      data: { parentProfileId: parentProfile.id },
    });

    this.logger.log(`Parent ${userId} linked to student ${student.id}`);
    return { message: `״×… ״±״¨״· ${student.firstName} ״¨†״¬״§״­` };
  }

  async getChildProgress(userId: string, childId: string): Promise<ChildProgressDto> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!parentProfile) throw new NotFoundException('„… ״¹״«״± ״¹„‰ …„ ״§„ˆ״§„״¯/״§„ˆ״§„״¯״©');

    const child = await this.prisma.studentProfile.findFirst({
      where: { id: childId, parentProfileId: parentProfile.id },
      include: {
        user: { select: { totalXp: true, currentStreak: true, gemsBalance: true } },
        lessonProgresses: {
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: { lesson: { select: { nameAr: true } } },
        },
      },
    });

    if (!child) {
      const exists = await this.prisma.studentProfile.findUnique({ where: { id: childId } });
      if (exists) throw new ForbiddenException('‡״°״§ ״§„״·״§„״¨ „״§ †״×… ״¥„ƒ');
      throw new NotFoundException('„״§ ˆ״¬״¯ ״·״§„״¨ ״¨‡״°״§ ״§„…״¹״±‘');
    }

    return {
      childId: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      gradeLevel: child.gradeLevel,
      totalXp: child.user.totalXp,
      currentStreak: child.user.currentStreak,
      gemsBalance: child.user.gemsBalance,
      recentProgress: child.lessonProgresses.map((lp) => ({
        lessonTitleAr: lp.lesson?.nameAr ?? '״¯״±״³',
        status: lp.status,
        score: lp.score ?? undefined,
        completedAt: lp.completedAt ?? undefined,
      })),
    };
  }

  async generateWeeklyReport(userId: string, childId: string): Promise<WeeklyReportDto> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!parentProfile) throw new NotFoundException('„… ״¹״«״± ״¹„‰ …„ ״§„ˆ״§„״¯/״§„ˆ״§„״¯״©');

    const child = await this.prisma.studentProfile.findFirst({
      where: { id: childId, parentProfileId: parentProfile.id },
      include: {
        user: { select: { totalXp: true, currentStreak: true, weeklyXp: true } },
        lessonProgresses: {
          orderBy: { updatedAt: 'desc' },
          take: 20,
          include: { lesson: { select: { nameAr: true } } },
        },
      },
    });

    if (!child) throw new ForbiddenException('„״§ ˆ״¬״¯ ״·״§„״¨ ״¨‡״°״§ ״§„…״¹״±‘ ״£ˆ „״§ †״×… ״¥„ƒ');

    const completed = child.lessonProgresses.filter((lp) => lp.status === ProgressStatus.COMPLETED);
    const scores = completed.map((lp) => lp.score ?? 0).filter((s) => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const childName = `${child.firstName} ${child.lastName}`;

    const prompt = `״£†״× …״³״§״¹״¯ ״×״¹„… „…†״µ״© ״§„…ˆ״¬‡ ״§„״°ƒ.
״§ƒ״×״¨ ״×‚״±״±‹״§ ״£״³״¨ˆ״¹‹״§ ״¨״§„„״÷״© ״§„״¹״±״¨״© „„ˆ״§„״¯† ״¹† ״£״¯״§״¡ ״§„״·״§„״¨.
״§״¬״¹„‡ …״´״¬״¹‹״§ ˆ״¨†‘״§״¡‹ (3-4 ״¬…„ „„…„״®״µ״ 2-3 ״×ˆ״µ״§״×).

״¨״§†״§״× ״§„״·״§„״¨:
- ״§„״§״³…: ${childName}
- ״§„״µ: ${child.gradeLevel}
- XP …ƒ״×״³״¨ ‡״°״§ ״§„״£״³״¨ˆ״¹: ${child.user.weeklyXp}
- ״¹״¯״¯ ״§„״¯״±ˆ״³ ״§„…†״¬״²״©: ${completed.length}
- …״×ˆ״³״· ״§„״¯״±״¬״§״×: ${avgScore}%
- ״£״¨״±״² ״§„״¯״±ˆ״³: ${completed.slice(0, 5).map((lp) => lp.lesson?.nameAr).join('״ ')}

״£״¬״¨ ״¨״µ״÷״© JSON:
{"summary": "...", "recommendations": ["...", "...", "..."]}`;

    let aiSummary = `״£ƒ…„ ${childName} ${completed.length} ״¯״±״³‹״§ ‡״°״§ ״§„״£״³״¨ˆ״¹ ״¨…״¹״¯„ ${avgScore}%.`;
    let recommendations = ['ˆ״§״µ„ ״§„…״«״§״¨״±״©', '״±״§״¬״¹ ״§„״¯״±ˆ״³ ״§„״³״§״¨‚״©'];

    try {
      const result = await invokeLLM({ messages: [{ role: 'user', content: prompt }] });
      const content = result.choices[0].message.content;
      const parsed = JSON.parse(content);
      if (parsed.summary) aiSummary = parsed.summary;
      if (parsed.recommendations) recommendations = parsed.recommendations;
    } catch (err) {
      this.logger.warn('AI report generation failed, using fallback', (err as any)?.message);
    }

    return {
      id: `report-${childId}-${Date.now()}`,
      weekStart: new Date(),
      childName,
      xpEarned: child.user.weeklyXp,
      lessonsCompleted: completed.length,
      averageScore: avgScore,
      aiSummary,
      recommendations,
      generatedAt: new Date(),
    };
  }
}
