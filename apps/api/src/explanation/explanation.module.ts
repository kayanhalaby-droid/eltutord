import { Module } from '@nestjs/common';
import { ExplanationService } from './explanation.service';
import { ExplanationController } from './explanation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PremiumGuard } from '../auth/guards/premium.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ExplanationController],
  providers: [ExplanationService, PremiumGuard],
  exports: [ExplanationService],
})
export class ExplanationModule {}
