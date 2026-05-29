import { Module } from '@nestjs/common';
import { ExplanationService } from './explanation.service';
import { ExplanationController } from './explanation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExplanationController],
  providers: [ExplanationService],
  exports: [ExplanationService],
})
export class ExplanationModule {}
