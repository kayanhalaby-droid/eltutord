import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}
