import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerOptionsFactory, ThrottlerModuleOptions } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const ttl = this.configService.get<number>('THROTTLE_TTL') || 60000;
    const limit = this.configService.get<number>('THROTTLE_LIMIT') || 100;
    return [{ ttl, limit }];
  }
}
