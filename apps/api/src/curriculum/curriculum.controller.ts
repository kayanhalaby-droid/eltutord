import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurriculumService } from './curriculum.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { ImageGeneratorService } from './image-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { SubjectDto } from './dto/subject.dto';
import { GradeDto } from './dto/grade.dto';
import { LessonDto } from './dto/lesson.dto';

@Controller('curriculum')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly learningPathService: LearningPathService,
    private readonly imageGeneratorService: ImageGeneratorService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('onboarding-questions')
  async getOnboardingQuestions(
    @Query('subject') subject: string,
    @Query('grade') grade: string,
  ) {
    const gradeLevel = parseInt(grade, 10) || 1;
    return this.curriculumService.getOnboardingQuestions(subject ?? '', gradeLevel);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('onboarding-questions/placement')
  async getPlacementQuestions(
    @Query('subject') subject: string,
    @Query('grade') grade: string,
  ) {
    const gradeLevel = parseInt(grade, 10) || 1;
    return this.curriculumService.getPlacementQuestions(subject ?? '', gradeLevel);
  }

  @Get('subjects/visuals')
  getSubjectVisuals() {
    const subjects = ['عربي', 'عبري', 'رياضيات', 'إنجليزي', 'علوم'];
    return subjects.reduce<Record<string, { type: string; url?: string; value?: string }>>((acc, name) => {
      acc[name] = this.imageGeneratorService.getSubjectVisual(name);
      return acc;
    }, {});
  }

  @Get('subjects')
  async findAllSubjects(): Promise<SubjectDto[]> {
    try {
      return await this.curriculumService.findAllSubjects();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve subjects');
    }
  }

  @Get('subjects/:subjectId')
  async findSubjectById(@Param('subjectId') subjectId: string): Promise<SubjectDto> {
    try {
      const subject = await this.curriculumService.findSubjectById(subjectId);
      if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);
      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve subject');
    }
  }

  @Get('subjects/:subjectId/grades')
  async findGradesBySubjectId(@Param('subjectId') subjectId: string): Promise<GradeDto[]> {
    try {
      const subject = await this.curriculumService.findSubjectById(subjectId);
      if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);
      return await this.curriculumService.findGradesBySubjectId(subjectId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve grades');
    }
  }

  @Get('grades/:gradeId/lessons')
  async findLessonsByGradeId(@Param('gradeId') gradeId: string): Promise<LessonDto[]> {
    try {
      const grade = await this.curriculumService.findGradeById(gradeId);
      if (!grade) throw new NotFoundException(`Grade ${gradeId} not found`);
      return await this.curriculumService.findLessonsByGradeId(gradeId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve lessons');
    }
  }

  @Get('lessons/:lessonId')
  async findLessonById(@Param('lessonId') lessonId: string): Promise<LessonDto> {
    try {
      const lesson = await this.curriculumService.findLessonById(lessonId);
      if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve lesson');
    }
  }

  @Get('lessons/:lessonId/play')
  async getLessonForPlay(@Param('lessonId') lessonId: string): Promise<LessonDto> {
    try {
      const lesson = await this.curriculumService.findLessonWithQuestions(lessonId);
      if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve lesson');
    }
  }

  @Post('lessons/:lessonId/complete')
  async completeLesson(
    @Req() req: { user: { id: string } },
    @Param('lessonId') lessonId: string,
    @Body() body: { score: number },
  ): Promise<{ success: boolean }> {
    try {
      await this.curriculumService.completLesson(req.user.id, lessonId, body.score ?? 0);
      return { success: true };
    } catch {
      throw new InternalServerErrorException('Failed to record lesson completion');
    }
  }

  @Get('path/:subjectId/:gradeLevel')
  async getLearningPath(
    @Req() req: { user: { id: string } },
    @Param('subjectId') subjectId: string,
    @Param('gradeLevel') gradeLevel: string,
  ) {
    try {
      const subject = await this.curriculumService.findSubjectById(subjectId);
      if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);

      const level = parseInt(gradeLevel, 10);
      const grade = await this.curriculumService.findGradeBySubjectIdAndLevel(subjectId, level);
      if (!grade) throw new NotFoundException(`Grade ${gradeLevel} for subject ${subjectId} not found`);

      return await this.learningPathService.fetchLearningPath(req.user.id, subjectId, level);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve learning path');
    }
  }
}
