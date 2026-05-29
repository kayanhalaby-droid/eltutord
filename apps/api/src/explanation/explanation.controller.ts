import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { ExplanationService } from './explanation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('explanation')
@UseGuards(JwtAuthGuard)
export class ExplanationController {
  constructor(private readonly explanationService: ExplanationService) {}

  @Get()
  async getExplanation(
    @Query('concept') concept: string,
    @Query('subject') subject: string,
    @Query('gradeLevel') gradeLevel: string,
    @Query('language') language = 'ar',
  ) {
    if (!concept || !subject || !gradeLevel) {
      throw new BadRequestException('concept وsubject وgradeLevel مطلوبة.');
    }
    const grade = parseInt(gradeLevel, 10);
    if (isNaN(grade) || grade < 1 || grade > 12) {
      throw new BadRequestException('gradeLevel يجب أن يكون رقمًا بين 1 و12.');
    }
    if (!['ar', 'he', 'en'].includes(language.toLowerCase())) {
      throw new BadRequestException('language يجب أن تكون: ar أو he أو en.');
    }
    return this.explanationService.explainConcept(concept, subject, grade, language.toLowerCase());
  }
}
