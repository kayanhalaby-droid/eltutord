import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectDto } from './dto/subject.dto';
import { GradeDto } from './dto/grade.dto';
import { LessonDto, QuestionDto } from './dto/lesson.dto';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async findAllSubjects(): Promise<SubjectDto[]> {
    const subjects = await this.prisma.subject.findMany({ orderBy: { nameAr: 'asc' } });
    return subjects.map(s => ({ id: s.id, name: s.nameAr, curriculumId: s.curriculumId }));
  }

  async findSubjectById(id: string): Promise<SubjectDto | null> {
    const s = await this.prisma.subject.findUnique({ where: { id } });
    return s ? { id: s.id, name: s.nameAr, curriculumId: s.curriculumId } : null;
  }

  async findGradesBySubjectId(subjectId: string): Promise<GradeDto[]> {
    const grades = await this.prisma.grade.findMany({
      where: { subjectId },
      orderBy: { level: 'asc' },
    });
    return grades.map(g => ({ id: g.id, level: g.level, subjectId: g.subjectId }));
  }

  async findGradeById(id: string): Promise<GradeDto | null> {
    const g = await this.prisma.grade.findUnique({ where: { id } });
    return g ? { id: g.id, level: g.level, subjectId: g.subjectId } : null;
  }

  async findGradeBySubjectIdAndLevel(subjectId: string, level: number): Promise<GradeDto | null> {
    const g = await this.prisma.grade.findUnique({
      where: { level_subjectId: { level, subjectId } },
    });
    return g ? { id: g.id, level: g.level, subjectId: g.subjectId } : null;
  }

  async findLessonsByGradeId(gradeId: string): Promise<LessonDto[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { gradeId },
      orderBy: { order: 'asc' },
    });
    return lessons.map(l => this.mapLesson(l, gradeId));
  }

  async findLessonById(id: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findUnique({ where: { id } });
    if (!l || !l.gradeId) return null;
    return this.mapLesson(l, l.gradeId);
  }

  async findLessonWithQuestions(id: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!l) return null;
    const gradeId = l.gradeId ?? '';
    const dto = this.mapLesson(l, gradeId);
    dto.durationMin = l.durationMin;
    dto.questions = l.questions.map((q): QuestionDto => ({
      id: q.id,
      type: q.type,
      content: q.content as Record<string, unknown>,
      correctAnswer: q.correctAnswer as Record<string, unknown>,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: q.order,
    }));
    return dto;
  }

  async completLesson(userId: string, lessonId: string, score: number): Promise<void> {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return;
    await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: student.id, lessonId } },
      update: { status: 'COMPLETED', score, completedAt: new Date() },
      create: { studentId: student.id, lessonId, status: 'COMPLETED', score, completedAt: new Date() },
    });
  }

  async fetchPlacementTest(lessonId: string): Promise<LessonDto | null> {
    const l = await this.prisma.lesson.findFirst({
      where: { id: lessonId, type: 'PLACEMENT_TEST' },
    });
    if (!l || !l.gradeId) return null;
    return this.mapLesson(l, l.gradeId);
  }

  private mapLesson(l: { id: string; nameAr: string; description?: string | null; nameEn: string; order: number; type: import('@prisma/client').LessonType; gradeId?: string | null }, gradeId: string): LessonDto {
    return {
      id: l.id,
      title: l.nameAr,
      description: l.description,
      content: l.nameAr,
      gradeId,
      order: l.order,
      type: l.type,
    };
  }
}
