import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { invokeLLM, storagePut } from '@elitutor/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AiProcessingStatus } from '@prisma/client';

interface ParsedHomeworkResult {
  studentName: string;
  subject: string;
  gradeLevel: number;
  assignmentTitle: string;
  questions: Array<{
    question: string;
    studentAnswer: string;
    isCorrect: boolean | null;
    feedback: string | null;
  }>;
  overallFeedback: string | null;
  score: number | null;
}

@Injectable()
export class HomeworkService {
  private readonly logger = new Logger(HomeworkService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processHomework(
    userId: string,
    imageBuffer: Buffer,
    imageFileName: string,
    imageMimeType: string,
  ): Promise<{ homeworkId: string; status: AiProcessingStatus }> {
    const storageKey = `homework/${userId}/${Date.now()}-${imageFileName}`;
    const { url: imageUrl } = await storagePut(storageKey, imageBuffer, imageMimeType);

    const record = await this.prisma.homeworkSubmission.create({
      data: { userId, imageUrl, originalFileName: imageFileName, mimeType: imageMimeType, status: AiProcessingStatus.PENDING },
    });

    this.processHomeworkWithAI(record.id, imageUrl).catch((err) =>
      this.logger.error(`Async AI processing failed for ${record.id}: ${err.message}`),
    );

    return { homeworkId: record.id, status: record.status };
  }

  private async processHomeworkWithAI(homeworkId: string, imageUrl: string): Promise<void> {
    try {
      await this.prisma.homeworkSubmission.update({
        where: { id: homeworkId },
        data: { status: AiProcessingStatus.PROCESSING },
      });

      const result = await invokeLLM({
        messages: [
          { role: 'system', content: this.getHomeworkSystemPrompt() },
          {
            role: 'user',
            content: [
              { type: 'text', text: '״­„„ ‡״°‡ ״§„״µˆ״±״© „ˆ״§״¬״¨ …†״²„ ˆ״§״³״×״®״±״¬ ״§„…״¹„ˆ…״§״× ״§„…״·„ˆ״¨״© ״¨״µ״÷״© JSON.' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        maxTokens: 1500,
        temperature: 0.2,
      });

      const aiContent = result.choices[0]?.message?.content;
      if (!aiContent) throw new InternalServerErrorException('״§„״°ƒ״§״¡ ״§„״§״µ״·†״§״¹ ״£״¹״§״¯ ״§״³״×״¬״§״¨״© ״§״±״÷״©.');

      const parsedData = this.validateAndCleanJson(aiContent);

      await this.prisma.homeworkSubmission.update({
        where: { id: homeworkId },
        data: { status: AiProcessingStatus.COMPLETED, parsedData: parsedData as any, processingLog: '״×… ״§„…״¹״§„״¬״© ״¨†״¬״§״­.' },
      });
    } catch (err: any) {
      this.logger.error(`AI processing failed for homework ${homeworkId}: ${err.message}`);
      await this.prisma.homeworkSubmission.update({
        where: { id: homeworkId },
        data: { status: AiProcessingStatus.FAILED, processingLog: `״´„ ״§„…״¹״§„״¬״©: ${err.message.substring(0, 500)}` },
      });
    }
  }

  async getHomeworkStatus(homeworkId: string) {
    const hw = await this.prisma.homeworkSubmission.findUnique({ where: { id: homeworkId } });
    if (!hw) throw new NotFoundException(`״·„״¨ ״§„ˆ״§״¬״¨ ${homeworkId} ״÷״± …ˆ״¬ˆ״¯.`);
    return hw;
  }

  private getHomeworkSystemPrompt(): string {
    return `״£†״× …״³״§״¹״¯ ״°ƒ …״×״®״µ״µ  ״×״­„„ ״§„ˆ״§״¬״¨״§״× ״§„…״¯״±״³״© ״§„…״µˆ״±״© „״·„״§״¨ ״§„…״¯״§״±״³  ״¥״³״±״§״¦„״ ˆ״×״­״¯״¯‹״§ „„״·„״§״¨ ״§„״¹״±״¨ (״§„״µˆ 1-12). …‡…״×ƒ ‡ ״§״³״×״®״±״§״¬ ״§„…״¹„ˆ…״§״× ״§„״£״³״§״³״© …† ״µˆ״±״© ״§„ˆ״§״¬״¨ ״§„…†״²„. ״¬״¨ ״£† ƒˆ† ״§„״¥״®״±״§״¬ ״¨״µ״÷״© JSON ״µ״§״±…״© ״×״×״¨״¹ ״§„‡ƒ„ ״§„״×״§„:
{
  "studentName": "[״§״³… ״§„״·״§„״¨]",
  "subject": "[״§„…״§״¯״©]",
  "gradeLevel": […״³״×ˆ‰ ״§„״µ ״±‚…],
  "assignmentTitle": "[״¹†ˆ״§† ״§„ˆ״§״¬״¨]",
  "questions": [{"question": "[†״µ ״§„״³״₪״§„]","studentAnswer": "[״¥״¬״§״¨״© ״§„״·״§„״¨]","isCorrect": true/false/null,"feedback": "[…„״§״­״¸״§״× ״£ˆ null]"}],
  "overallFeedback": "[…„״§״­״¸״§״× ״¹״§…״© ״£ˆ null]",
  "score": [0-100 ״£ˆ null]
}
״×״£ƒ״¯ …† ״£† ״¬…״¹ ״§„״­‚ˆ„ …ˆ״¬ˆ״¯״©. ״¥״°״§ „… ״×״×…ƒ† …† ״§״³״×״®״±״§״¬ ״­‚„ …״¹†״ ״§״³״×״®״¯… null.`;
  }

  async getHomeworkHistory(userId: string) {
    const submissions = await this.prisma.homeworkSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        status: true,
        imageUrl: true,
        parsedData: true,
        createdAt: true,
      },
    });

    return submissions.map((s) => {
      const parsed = s.parsedData as unknown as ParsedHomeworkResult | null;
      return {
        id: s.id,
        status: s.status,
        imageUrl: s.imageUrl,
        studentName: parsed?.studentName ?? null,
        subject: parsed?.subject ?? null,
        gradeLevel: parsed?.gradeLevel ?? null,
        assignmentTitle: parsed?.assignmentTitle ?? null,
        score: parsed?.score ?? null,
        createdAt: s.createdAt.toISOString(),
      };
    });
  }

  private validateAndCleanJson(jsonString: string): ParsedHomeworkResult {
    let obj: any;
    try {
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      obj = JSON.parse(jsonMatch ? jsonMatch[0] : jsonString);
    } catch {
      throw new BadRequestException('״§״³״×״¬״§״¨״© ״§„״°ƒ״§״¡ ״§„״§״µ״·†״§״¹ „״³״× JSON ״µ״§„״­.');
    }

    if (!obj.subject || !obj.gradeLevel || !obj.assignmentTitle || !Array.isArray(obj.questions) || obj.questions.length === 0) {
      throw new BadRequestException('‡ƒ„ JSON ״÷״± …ƒ״×…„ …† ״§„״°ƒ״§״¡ ״§„״§״µ״·†״§״¹.');
    }

    return obj as ParsedHomeworkResult;
  }
}
