import { Module } from '@nestjs/common';
import { CardcomService } from './cardcom.service';
import { CardcomController } from './cardcom.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CardcomController],
  providers: [CardcomService],
  exports: [CardcomService],
})
export class PaymentModule {}
