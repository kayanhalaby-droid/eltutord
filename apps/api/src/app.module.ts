import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { PlacementTestModule } from './placement-test/placement-test.module';
import { GamificationModule } from './gamification/gamification.module';
import { RedisModule } from './redis/redis.module';
import { ExplanationModule } from './explanation/explanation.module';
import { WhisperModule } from './whisper/whisper.module';
import { HomeworkModule } from './homework/homework.module';
import { ParentsModule } from './parents/parents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerConfigService } from './config/throttler-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PaymentModule,
    CurriculumModule,
    LearningPathModule,
    PlacementTestModule,
    GamificationModule,
    ExplanationModule,
    WhisperModule,
    HomeworkModule,
    ParentsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
