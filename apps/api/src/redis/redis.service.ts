import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: this.configService.get<number>('REDIS_PORT') ?? 6379,
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    this.client.on('error', (err: Error) => this.logger.warn(`Redis: ${err.message}`));
    this.client.connect().catch(() => this.logger.warn('Redis unavailable — cache disabled'));
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    try { return await this.client.get(key); } catch { return null; }
  }

  async set(key: string, value: string, exFlag?: string, ttl?: number): Promise<void> {
    try {
      if (exFlag === 'EX' && ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch { /* ignore */ }
  }

  async del(key: string): Promise<void> {
    try { await this.client.del(key); } catch { /* ignore */ }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try { await this.client.expire(key, seconds); } catch { /* ignore */ }
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    try { await this.client.zadd(key, score, member); } catch { /* ignore */ }
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: 'WITHSCORES'): Promise<string[]> {
    try {
      return withScores === 'WITHSCORES'
        ? await this.client.zrevrange(key, start, stop, 'WITHSCORES')
        : await this.client.zrevrange(key, start, stop);
    } catch { return []; }
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    try { return await this.client.zrevrank(key, member); } catch { return null; }
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    try { await this.client.sadd(key, ...members); } catch { /* ignore */ }
  }

  async smembers(key: string): Promise<string[]> {
    try { return await this.client.smembers(key); } catch { return []; }
  }
}
