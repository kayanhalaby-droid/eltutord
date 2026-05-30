import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, ProgressStatus } from '@prisma/client';
import { invokeLLM } from '@elitutor/shared';
import { ParentChildrenDto } from './dto/parent-children.dto';
import { ChildProgressDto } from './dto/child-progress.dto';
import { WeeklyReportDto } from './dto/weekly-report.dto';

const SKILL_SUBJECTS = [
  { key: 'Mathematics', label: 'رياضيات' },
  { key: 'Arabic',      label: 'عربي' },
  { key: 'Science',     label: 'علوم' },
  { key: 'English',     label: 'إنجليزي' },
];

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── private helper ────────────────────────────────────────────────────────────

  private async verifyParentChildRelation(parentUserId: string, childId: string) {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId: parentUserId },
      select: { id: true },
    });
    if (!parentProfile) throw new NotFoundException('لم يُعثر على ملف الوالد/الوالدة');

    const child = await this.prisma.studentProfile.findFirst({
      where: { id: childId, parentProfileId: parentProfile.id },
    });
    if (!child) throw new ForbiddenException('هذا الطالب لا ينتمي إليك');
    return child;
  }

  // ── existing methods ──────────────────────────────────────────────────────────

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
      throw new NotFoundException('لم يُعثر على ملف الوالد/الوالدة');
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
      throw new NotFoundException('لم يُعثر على ملف الوالد/الوالدة');
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { parentCode },
    });
    if (!student) {
      throw new NotFoundException('الكود غير صحيح — لا يوجد طالب بهذا الكود');
    }
    if (student.parentProfileId) {
      throw new BadRequestException('هذا الطالب مرتبط بوالد/والدة آخر');
    }

    await this.prisma.studentProfile.update({
      where: { id: student.id },
      data: { parentProfileId: parentProfile.id },
    });

    this.logger.log(`Parent ${userId} linked to student ${student.id}`);
    return { message: `تم ربط ${student.firstName} بنجاح` };
  }

  async getChildProgress(userId: string, childId: string): Promise<ChildProgressDto> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!parentProfile) throw new NotFoundException('لم يُعثر على ملف الوالد/الوالدة');

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
      if (exists) throw new ForbiddenException('هذا الطالب لا ينتمي إليك');
      throw new NotFoundException('لا يوجد طالب بهذا المعرّف');
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
        lessonTitleAr: lp.lesson?.nameAr ?? 'درس',
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
    if (!parentProfile) throw new NotFoundException('لم يُعثر على ملف الوالد/الوالدة');

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

    if (!child) throw new ForbiddenException('لا يوجد طالب بهذا المعرّف أو لا ينتمي إليك');

    const completed = child.lessonProgresses.filter((lp) => lp.status === ProgressStatus.COMPLETED);
    const scores = completed.map((lp) => lp.score ?? 0).filter((s) => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const childName = `${child.firstName} ${child.lastName}`;

    const prompt = `أنت مساعد تعلم للمنصة الموجه الذكي.
اكتب تقريراً أسبوعياً باللغة العربية للوالدَيْن عن أداء الطالب.
اجعله مشجعاً وبنّاءً (3-4 جمل للملخص، 2-3 توصيات).

بيانات الطالب:
- الاسم: ${childName}
- الصف: ${child.gradeLevel}
- XP مكتسب هذا الأسبوع: ${child.user.weeklyXp}
- عدد الدروس المنجزة: ${completed.length}
- متوسط الدرجات: ${avgScore}%
- أبرز الدروس: ${completed.slice(0, 5).map((lp) => lp.lesson?.nameAr).join('، ')}

أجب بصيغة JSON:
{"summary": "...", "recommendations": ["...", "...", "..."]}`;

    let aiSummary = `أكمل ${childName} ${completed.length} درساً هذا الأسبوع بمعدل ${avgScore}%.`;
    let recommendations = ['واصل المثابرة', 'راجع الدروس السابقة'];

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

  // ── new Phase 8 methods ───────────────────────────────────────────────────────

  async getTodaySummary(parentUserId: string, childId: string) {
    const child = await this.verifyParentChildRelation(parentUserId, childId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const progresses = await this.prisma.lessonProgress.findMany({
      where: {
        studentId: child.id,
        completedAt: { gte: startOfDay },
        status: ProgressStatus.COMPLETED,
      },
      include: { lesson: { select: { nameAr: true, durationMin: true } } },
    });

    const totalActivities = progresses.length;
    const completedLessons = progresses.length;
    const totalDurationMinutes = progresses.reduce(
      (sum, lp) => sum + ((lp.lesson as any)?.durationMin ?? 5),
      0,
    );
    const scores = progresses.map((lp) => lp.score ?? 0).filter((s) => s > 0);
    const averageScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return { totalActivities, totalDurationMinutes, averageScore, completedLessons };
  }

  async getWeeklyProgress(parentUserId: string, childId: string) {
    const child = await this.verifyParentChildRelation(parentUserId, childId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const progresses = await this.prisma.lessonProgress.findMany({
      where: {
        studentId: child.id,
        completedAt: { gte: sevenDaysAgo },
        status: ProgressStatus.COMPLETED,
      },
      select: { completedAt: true, score: true },
    });

    const days: { date: string; xp: number; lessonsCompleted: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayLessons = progresses.filter(
        (lp) => lp.completedAt?.toISOString().split('T')[0] === dateStr,
      );

      days.push({
        date: dateStr,
        xp: dayLessons.length * 50,
        lessonsCompleted: dayLessons.length,
      });
    }

    return days;
  }

  async getSkillRadar(parentUserId: string, childId: string) {
    const child = await this.verifyParentChildRelation(parentUserId, childId);

    const progresses = await this.prisma.lessonProgress.findMany({
      where: { studentId: child.id, status: ProgressStatus.COMPLETED },
      include: {
        lesson: {
          include: {
            level: {
              include: {
                unit: {
                  include: {
                    section: {
                      include: {
                        subject: { select: { nameEn: true, nameAr: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const subjectMap = new Map<string, { completed: number; scores: number[] }>(
      SKILL_SUBJECTS.map((s) => [s.key, { completed: 0, scores: [] }]),
    );

    for (const lp of progresses) {
      const subjectNameEn = (lp as any).lesson?.level?.unit?.section?.subject?.nameEn as
        | string
        | undefined;
      if (subjectNameEn && subjectMap.has(subjectNameEn)) {
        const entry = subjectMap.get(subjectNameEn)!;
        entry.completed++;
        if (lp.score != null) entry.scores.push(lp.score);
      }
    }

    return SKILL_SUBJECTS.map((s) => {
      const entry = subjectMap.get(s.key)!;
      const masteryPercent = entry.scores.length
        ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length)
        : 0;
      return { subject: s.label, masteryPercent, lessonsCompleted: entry.completed };
    });
  }

  async getActivities(parentUserId: string, childId: string) {
    const child = await this.verifyParentChildRelation(parentUserId, childId);

    const progresses = await this.prisma.lessonProgress.findMany({
      where: { studentId: child.id, status: ProgressStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: {
        lesson: {
          select: {
            nameAr: true,
            level: {
              select: {
                unit: {
                  select: {
                    section: {
                      select: {
                        subject: { select: { nameAr: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return progresses.map((lp) => ({
      lessonNameAr: lp.lesson?.nameAr ?? 'درس',
      subjectNameAr: (lp as any).lesson?.level?.unit?.section?.subject?.nameAr ?? 'مادة',
      score: lp.score ?? 0,
      completedAt: lp.completedAt,
    }));
  }

  async sendEncouragement(
    parentUserId: string,
    childId: string,
    message: string,
    gems: number,
    fromName: string,
  ): Promise<{ success: boolean }> {
    const child = await this.verifyParentChildRelation(parentUserId, childId);

    await this.prisma.notification.create({
      data: {
        userId: child.userId,
        type: NotificationType.PARENT_MESSAGE,
        titleAr: `رسالة تشجيعية من ${fromName}`,
        messageAr: message,
      },
    });

    if (gems > 0) {
      await this.prisma.user.update({
        where: { id: child.userId },
        data: { gemsBalance: { increment: gems } },
      });
    }

    return { success: true };
  }
}
