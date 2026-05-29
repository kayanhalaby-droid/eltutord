import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto, AdjustResourcesDto } from './dto/admin.dto';
import { SubStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
  // Dashboard Metrics
  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

  async getDashboardMetrics() {
    const now = dayjs();
    const todayStart = now.startOf('day').toDate();
    const monthStart = now.subtract(30, 'day').startOf('day').toDate();

    const [
      totalUsers,
      activeUsersToday,
      activeUsersMonth,
      activeSubscriptions,
      lastMonthSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLogin: { gte: todayStart } } }),
      this.prisma.user.count({ where: { lastLogin: { gte: monthStart } } }),
      this.prisma.subscription.count({ where: { status: SubStatus.ACTIVE } }),
      this.prisma.subscription.count({
        where: {
          status: SubStatus.ACTIVE,
          createdAt: { lt: now.subtract(30, 'day').toDate() },
        },
      }),
    ]);

    const revenueGrowth = lastMonthSubscriptions > 0
      ? Math.round(((activeSubscriptions - lastMonthSubscriptions) / lastMonthSubscriptions) * 100)
      : 0;

    const prevMonthUsers = await this.prisma.user.count({
      where: { createdAt: { lt: now.subtract(30, 'day').toDate() } },
    });
    const userGrowth = prevMonthUsers > 0
      ? Math.round(((totalUsers - prevMonthUsers) / prevMonthUsers) * 100)
      : 0;

    return {
      totalUsers,
      activeUsersToday,
      activeUsersMonth,
      totalRevenue: activeSubscriptions * 95,
      revenueGrowth,
      userGrowth,
    };
  }

  async getMetricsChart() {
    const days = 30;
    const chart = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayStart = date.startOf('day').toDate();
      const dayEnd = date.endOf('day').toDate();
      const monthStart = date.subtract(30, 'day').startOf('day').toDate();

      const [dau, mau] = await Promise.all([
        this.prisma.user.count({
          where: { lastLogin: { gte: dayStart, lte: dayEnd } },
        }),
        this.prisma.user.count({
          where: { lastLogin: { gte: monthStart, lte: dayEnd } },
        }),
      ]);

      chart.push({ date: date.format('YYYY-MM-DD'), dau, mau });
    }

    return chart;
  }

  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
  // User Management
  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          role: true,
          totalXp: true,
          gemsBalance: true,
          currentStreak: true,
          lastLogin: true,
          createdAt: true,
          league: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        phone: u.phone ?? '',
        email: u.email,
        role: u.role,
        xp: u.totalXp,
        gems: u.gemsBalance,
        streak: u.currentStreak,
        league: u.league,
        lastLogin: u.lastLogin?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async adjustResources(userId: string, dto: AdjustResourcesDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('״§„…״³״×״®״¯… ״÷״± …ˆ״¬ˆ״¯');

    const updates: Record<string, number> = {};
    if (dto.xp !== undefined) {
      updates.totalXp = Math.max(0, user.totalXp + dto.xp);
    }
    if (dto.gems !== undefined) {
      updates.gemsBalance = Math.max(0, user.gemsBalance + dto.gems);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, totalXp: true, gemsBalance: true },
    });
  }

  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
  // Curriculum Management
  // ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

  async getSubjects() {
    const sections = await this.prisma.section.findMany({
      orderBy: [{ gradeLevel: 'asc' }, { order: 'asc' }],
      include: {
        subject: { select: { nameAr: true } },
        _count: { select: { units: true } },
      },
    });

    return sections.map((s) => ({
      id: s.id,
      name: s.nameAr || s.nameEn,
      gradeLevel: s.gradeLevel,
      description: s.description ?? undefined,
      order: s.order,
      lessonCount: s._count.units,
    }));
  }

  async createSubject(dto: CreateSubjectDto) {
    const nameEn = `${dto.name} Grade ${dto.gradeLevel}`;
    const existing = await this.prisma.section.findFirst({
      where: { nameAr: dto.name, gradeLevel: dto.gradeLevel },
    });
    if (existing) throw new ConflictException('‡״°‡ ״§„…״§״¯״© …ˆ״¬ˆ״¯״© ״¨״§„״¹„ „‡״°״§ ״§„״µ');

    // Find or create the parent Subject
    let subject = await this.prisma.subject.findFirst({
      where: { nameAr: dto.name },
    });
    if (!subject) {
      subject = await this.prisma.subject.create({
        data: {
          nameEn: dto.name,
          nameAr: dto.name,
          description: dto.description,
        },
      });
    }

    const section = await this.prisma.section.create({
      data: {
        subjectId: subject.id,
        nameEn,
        nameAr: dto.name,
        gradeLevel: dto.gradeLevel,
        description: dto.description,
        order: dto.gradeLevel,
      },
    });

    return {
      id: section.id,
      name: section.nameAr,
      gradeLevel: section.gradeLevel,
      description: section.description ?? undefined,
      order: section.order,
      lessonCount: 0,
    };
  }

  async updateSubject(id: string, dto: UpdateSubjectDto) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('״§„…״§״¯״© ״÷״± …ˆ״¬ˆ״¯״©');

    const updated = await this.prisma.section.update({
      where: { id },
      data: {
        ...(dto.name && { nameAr: dto.name, nameEn: `${dto.name} Grade ${dto.gradeLevel ?? section.gradeLevel}` }),
        ...(dto.gradeLevel && { gradeLevel: dto.gradeLevel, order: dto.gradeLevel }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return {
      id: updated.id,
      name: updated.nameAr,
      gradeLevel: updated.gradeLevel,
      description: updated.description ?? undefined,
      order: updated.order,
    };
  }

  async deleteSubject(id: string) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('״§„…״§״¯״© ״÷״± …ˆ״¬ˆ״¯״©');
    await this.prisma.section.delete({ where: { id } });
    return { success: true };
  }
}
