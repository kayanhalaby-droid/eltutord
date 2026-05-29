import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const homeworkStorage = diskStorage({
  destination: './uploads/homework',
  filename: (_req, file, cb) => {
    const rand = Array(32).fill(null).map(() => Math.round(Math.random() * 15).toString(16)).join('');
    cb(null, `${rand}${extname(file.originalname)}`);
  },
});

@Controller('homework')
@UseGuards(JwtAuthGuard)
export class HomeworkController {
  private readonly logger = new Logger(HomeworkController.name);

  constructor(private readonly homeworkService: HomeworkService) {
    if (!fs.existsSync('./uploads/homework')) {
      fs.mkdirSync('./uploads/homework', { recursive: true });
    }
  }

  @Post('submit')
  @UseInterceptors(FileInterceptor('homeworkImage', { storage: homeworkStorage }))
  async submitHomework(
    @Req() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('لم يتم رفع صورة الواجب.');

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      fs.unlink(file.path, () => {});
      throw new BadRequestException('نوع الملف غير مدعوم. المقبول: JPG, PNG, WebP, PDF.');
    }

    try {
      const imageBuffer = fs.readFileSync(file.path);
      return await this.homeworkService.processHomework(req.user.id, imageBuffer, file.originalname, file.mimetype);
    } catch (err: any) {
      this.logger.error(`Error submitting homework: ${err.message}`);
      throw new InternalServerErrorException('فشل إرسال الواجب.');
    } finally {
      fs.unlink(file.path, (err) => {
        if (err) this.logger.warn(`فشل حذف الملف المؤقت: ${file.path}`);
      });
    }
  }

  @Get('history')
  async getHistory(@Req() req: { user: { id: string } }) {
    return this.homeworkService.getHomeworkHistory(req.user.id);
  }

  @Get('status/:homeworkId')
  async getStatus(@Param('homeworkId') homeworkId: string) {
    return this.homeworkService.getHomeworkStatus(homeworkId);
  }
}
