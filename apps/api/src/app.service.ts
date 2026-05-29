import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): { status: string; platform: string } {
    return { status: 'ok', platform: 'الموجه الذكي — EliTutor' };
  }
}
