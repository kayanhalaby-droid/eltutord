import { Module } from '@nestjs/common';
import { WhisperService } from './whisper.service';
import { WhisperController } from './whisper.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PremiumGuard } from '../auth/guards/premium.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [WhisperController],
  providers: [WhisperService, PremiumGuard],
  exports: [WhisperService],
})
export class WhisperModule {}
