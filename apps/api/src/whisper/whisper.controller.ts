import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // eslint-disable-next-line @typescript-eslint/no-var-requires
import { extname } from 'path';
import * as fs from 'fs';
import { WhisperService } from './whisper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../auth/guards/premium.guard';

const audioStorage = diskStorage({
  destination: './uploads/audio',
  filename: (_req, file, cb) => {
    const rand = Array(32).fill(null).map(() => Math.round(Math.random() * 15).toString(16)).join('');
    cb(null, `${rand}${extname(file.originalname)}`);
  },
});

@Controller('whisper')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class WhisperController {
  private readonly logger = new Logger(WhisperController.name);

  constructor(private readonly whisperService: WhisperService) {
    if (!fs.existsSync('./uploads/audio')) {
      fs.mkdirSync('./uploads/audio', { recursive: true });
    }
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio', { storage: audioStorage }))
  async transcribeAudioFile(
    @UploadedFile() file: any,
    @Query('language') language = 'ar',
  ): Promise<{ transcription: string }> {
    if (!file) throw new BadRequestException('لم يتم رفع ملف صوتي.');

    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    if (!allowed.includes(file.mimetype)) {
      fs.unlink(file.path, () => {});
      throw new BadRequestException('نوع الملف غير مدعوم. المقبول: MP3, WAV, M4A, OGG, WebM.');
    }

    try {
      const transcription = await this.whisperService.transcribeAudio(file.path, language.toLowerCase());
      return { transcription };
    } finally {
      fs.unlink(file.path, (err) => {
        if (err) this.logger.warn(`فشل حذف الملف المؤقت: ${file.path}`);
      });
    }
  }

  @Get('normalize-arabic')
  normalizeArabic(@Query('text') text: string): { normalizedText: string } {
    if (!text) throw new BadRequestException('النص مطلوب.');
    return { normalizedText: this.whisperService.normalizeArabicText(text) };
  }

  @Get('levenshtein-distance')
  levenshtein(
    @Query('s1') s1: string,
    @Query('s2') s2: string,
  ): { distance: number } {
    if (!s1 || !s2) throw new BadRequestException('s1 و s2 مطلوبان.');
    return { distance: this.whisperService.calculateLevenshteinDistance(s1, s2) };
  }

  @Get('similarity-percentage')
  similarity(
    @Query('s1') s1: string,
    @Query('s2') s2: string,
  ): { similarity: number } {
    if (!s1 || !s2) throw new BadRequestException('s1 و s2 مطلوبان.');
    return { similarity: this.whisperService.calculateSimilarityPercentage(s1, s2) };
  }
}
