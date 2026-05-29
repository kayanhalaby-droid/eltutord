import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearningPathDto, LearningPathNodeDto } from './dto/learning-path.dto';
import { LessonDto } from '../curriculum/dto/lesson.dto';
import { UserProgressStatus, Lesson, UserProgress, LearningPathNode } from '@prisma/client';

type LessonWithNode = Lesson & { learningPathNode: LearningPathNode | null };

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  async fetchLearningPath(userId: string, subjectId: string, gradeLevel: number): Promise<LearningPathDto> {
    const grade = await this.prisma.grade.findUnique({
      where: { level_subjectId: { level: gradeLevel, subjectId } },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        subject: true,
      },
    });

    if (!grade) throw new NotFoundException(`Grade ${gradeLevel} for subject ${subjectId} not found`);

    const userProgress = await this.prisma.userProgress.findMany({
      where: { userId, lessonId: { in: grade.lessons.map(l => l.id) } },
    });

    const progressMap = new Map<string, UserProgress>();
    userProgress.forEach(p => progressMap.set(p.lessonId, p));

    await this.ensureLearningPathNodes(grade.lessons);

    const lessonsWithNodes = await this.prisma.lesson.findMany({
      where: { gradeId: grade.id },
      include: { learningPathNode: true },
      orderBy: [{ learningPathNode: { snakePathOrder: 'asc' } }, { order: 'asc' }],
    }) as LessonWithNode[];

    let foundCurrent = false;
    const nodes: LearningPathNodeDto[] = lessonsWithNodes.map((lesson, index) => {
      const progress = progressMap.get(lesson.id);
      const lessonDto: LessonDto = {
        id: lesson.id,
        title: lesson.nameAr,
        description: lesson.description,
        content: lesson.nameAr,
        gradeId: grade.id,
        order: lesson.order,
        type: lesson.type,
      };
      const nodeStatus = this.calculateNodeStatus(lesson, progress, lessonsWithNodes, index, progressMap);
      if (nodeStatus.isCurrent && !foundCurrent) foundCurrent = true;

      return {
        id: lesson.learningPathNode?.id ?? `node-${lesson.id}`,
        lesson: lessonDto,
        snakePathOrder: lesson.learningPathNode?.snakePathOrder ?? lesson.order,
        status: nodeStatus.status,
        score: progress?.score ?? null,
        isUnlocked: nodeStatus.isUnlocked,
        isCurrent: nodeStatus.isCurrent,
      };
    });

    if (!foundCurrent && nodes.length > 0) {
      const firstUnlocked = nodes.find(n => n.isUnlocked && n.status !== UserProgressStatus.COMPLETED);
      if (firstUnlocked) {
        firstUnlocked.isCurrent = true;
      } else if (nodes.every(n => n.status === UserProgressStatus.COMPLETED)) {
        nodes[nodes.length - 1].isCurrent = true;
      } else {
        const firstLocked = nodes.find(n => n.status === UserProgressStatus.LOCKED);
        if (firstLocked) firstLocked.isCurrent = true;
      }
    }

    return {
      id: `${subjectId}-${gradeLevel}-path`,
      subjectName: grade.subject.nameAr,
      gradeLevel: grade.level,
      nodes,
    };
  }

  async updateUserProgress(userId: string, lessonId: string, status: UserProgressStatus, score?: number): Promise<UserProgress> {
    return this.prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        status,
        score,
        lastAccessed: new Date(),
        completedAt: status === UserProgressStatus.COMPLETED ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId,
        status,
        score,
        lastAccessed: new Date(),
        completedAt: status === UserProgressStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }

  private async ensureLearningPathNodes(lessons: Lesson[]): Promise<void> {
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      const lesson = sorted[i];
      const existing = await this.prisma.learningPathNode.findUnique({ where: { lessonId: lesson.id } });
      if (!existing) {
        await this.prisma.learningPathNode.create({
          data: { lessonId: lesson.id, snakePathOrder: i + 1 },
        });
      } else if (existing.snakePathOrder === null) {
        await this.prisma.learningPathNode.update({
          where: { id: existing.id },
          data: { snakePathOrder: i + 1 },
        });
      }
    }
  }

  private calculateNodeStatus(
    lesson: Lesson,
    userProgress: UserProgress | undefined,
    allLessons: LessonWithNode[],
    index: number,
    progressMap: Map<string, UserProgress>,
  ): { status: UserProgressStatus; isUnlocked: boolean; isCurrent: boolean } {
    let status: UserProgressStatus = UserProgressStatus.LOCKED;
    let isUnlocked = false;
    let isCurrent = false;

    if (userProgress) {
      status = userProgress.status;
      if (status === UserProgressStatus.COMPLETED || status === UserProgressStatus.IN_PROGRESS) {
        isUnlocked = true;
      }
    }

    if (index === 0) {
      isUnlocked = true;
      if (!userProgress) status = UserProgressStatus.UNLOCKED;
    } else {
      const prevLesson = allLessons[index - 1];
      const prevProgress = prevLesson ? progressMap.get(prevLesson.id) : undefined;
      if (prevProgress?.status === UserProgressStatus.COMPLETED) {
        isUnlocked = true;
        if (!userProgress) status = UserProgressStatus.UNLOCKED;
      } else if (lesson.type === 'PLACEMENT_TEST') {
        for (let i = index - 1; i >= 0; i--) {
          const prev = allLessons[i];
          if (prev.type === 'REGULAR' && progressMap.get(prev.id)?.status === UserProgressStatus.COMPLETED) {
            isUnlocked = true;
            if (!userProgress) status = UserProgressStatus.UNLOCKED;
            break;
          }
        }
      }
    }

    if (isUnlocked && status !== UserProgressStatus.COMPLETED) {
      const hasIncompletePrev = allLessons.slice(0, index).some(prev => {
        const p = progressMap.get(prev.id);
        return !p || (p.status !== UserProgressStatus.COMPLETED && p.status !== UserProgressStatus.IN_PROGRESS);
      });
      if (!hasIncompletePrev) isCurrent = true;
    }

    if (
      allLessons.every(l => progressMap.get(l.id)?.status === UserProgressStatus.COMPLETED) &&
      index === allLessons.length - 1
    ) {
      isCurrent = true;
    }

    return { status, isUnlocked, isCurrent };
  }
}
