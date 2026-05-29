import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { invokeLLM } from '@elitutor/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ExplanationResponse {
  explanation: string;
  fromCache: boolean;
  fromFallback: boolean;
}

@Injectable()
export class ExplanationService {
  private readonly logger = new Logger(ExplanationService.name);
  private readonly CACHE_TTL = 30 * 24 * 60 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async explainConcept(
    concept: string,
    subject: string,
    gradeLevel: number,
    language = 'ar',
  ): Promise<ExplanationResponse> {
    const cacheKey = `explanation:${language}:${subject}:${gradeLevel}:${concept}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for concept '${concept}'`);
        return { explanation: cached, fromCache: true, fromFallback: false };
      }
    } catch (e: any) {
      this.logger.warn(`Cache read failed: ${e.message}`);
    }

    try {
      const result = await invokeLLM({
        messages: [
          { role: 'system', content: this.getSystemPrompt(subject, gradeLevel, language) },
          {
            role: 'user',
            content: `״§״´״±״­ „ …‡ˆ…: ${concept} ״¨״§„״×״µ„ ˆ״¨״´ƒ„ …״¨״³״· ˆ…†״§״³״¨ „״·״§„״¨ ״§„״µ ${gradeLevel}  …״§״¯״© ${subject}.`,
          },
        ],
        maxTokens: 500,
        temperature: 0.7,
      });
      const aiExplanation: string | null = result.choices[0]?.message?.content || null;
      if (aiExplanation) {
        this.redis.set(cacheKey, aiExplanation, 'EX', this.CACHE_TTL).catch(() => {});
        return { explanation: aiExplanation, fromCache: false, fromFallback: false };
      }
    } catch (e: any) {
      this.logger.error(`AI call failed for '${concept}': ${e.message}`);
    }

    try {
      const fallback = await this.prisma.preWrittenExplanation.findFirst({
        where: {
          concept: { equals: concept, mode: 'insensitive' },
          subject: { equals: subject, mode: 'insensitive' },
          gradeLevel,
          language,
        },
        select: { content: true },
      });
      if (fallback) {
        return { explanation: fallback.content, fromCache: false, fromFallback: true };
      }
    } catch (e: any) {
      this.logger.error(`DB fallback failed for '${concept}': ${e.message}`);
    }

    throw new ServiceUnavailableException(`״´„ ״§״³״×״±״¬״§״¹ ״´״±״­ „„…‡ˆ… '${concept}'. ״­״§ˆ„ …״±״© ״£״®״±‰.`);
  }

  private getSystemPrompt(subject: string, gradeLevel: number, language: string): string {
    const langInstruction =
      language === 'he' ? '״¨״§„„״÷״© ״§„״¹״¨״±״©' : language === 'en' ? 'in English' : '״¨״§„„״÷״© ״§„״¹״±״¨״© ״§„״µ״­‰';
    return `״£†״× …״¹„… ״°ƒ ˆ…״³״§״¹״¯ „״·„״§״¨ ״§„…״¯״§״±״³  ״¥״³״±״§״¦„״ ˆ״×״­״¯״¯‹״§ „„״·„״§״¨ ״§„״¹״±״¨. …‡…״×ƒ ‡ ״´״±״­ ״§„…״§‡… ״§„״×״¹„…״© ״¨ˆ״¶ˆ״­ ˆ״¯‚״©״ …״¹ ״§„״×״±ƒ״² ״¹„‰ ״×״¨״³״· ״§„…״¹„ˆ…״§״× „״×†״§״³״¨ …״³״×ˆ‰ ‡… ״·״§„״¨ ״§„״µ ${gradeLevel}  …״§״¯״© ${subject}. ״¬״¨ ״£† ״×ƒˆ† ״§„״´״±ˆ״­״§״× ״´״§…„״©״ ״³‡„״© ״§„‡…״ ˆ״×״³״×״®״¯… ״£…״«„״© ˆ״§‚״¹״© ״¥† ״£…ƒ†. ״×״¬†״¨ ״§„…״µ״·„״­״§״× ״§„…״¹‚״¯״© ‚״¯״± ״§„״¥…ƒ״§†. ״¬״¨ ״£† ״×ƒˆ† ״§„״¥״¬״§״¨״© ${langInstruction} ‚״·.`;
  }
}
