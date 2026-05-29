import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WhisperService {
  private readonly logger = new Logger(WhisperService.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY غير محدد — خدمة Whisper معطلة.');
    }
  }

  async transcribeAudio(audioFilePath: string, language = 'ar'): Promise<string> {
    if (!fs.existsSync(audioFilePath)) {
      throw new BadRequestException(`ملف الصوت غير موجود: ${audioFilePath}`);
    }

    try {
      const audioBuffer = fs.readFileSync(audioFilePath);
      const blob = new Blob([audioBuffer]);
      const formData = new FormData();
      formData.append('file', blob, path.basename(audioFilePath));
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'text');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Whisper API error: ${response.status} ${err}`);
      }

      const transcription = await response.text();
      if (!transcription) {
        throw new InternalServerErrorException('Whisper أعاد نصًا فارغًا.');
      }
      return transcription;
    } catch (e: any) {
      this.logger.error(`فشل تحويل الصوت لنص: ${e.message}`);
      throw new InternalServerErrorException(`فشل تحويل الصوت لنص: ${e.message}`);
    }
  }

  normalizeArabicText(text: string): string {
    // Remove Arabic diacritics (tashkeel)
    return text.replace(/[ً-ٟؐ-ؚۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, '');
  }

  calculateLevenshteinDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  calculateSimilarityPercentage(s1: string, s2: string): number {
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 100;
    return ((maxLen - this.calculateLevenshteinDistance(s1, s2)) / maxLen) * 100;
  }
}
