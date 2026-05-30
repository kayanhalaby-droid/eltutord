import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;

    if (!userId) throw new ForbiddenException('مطلوب تسجيل الدخول');

    const sub = await this.prisma.subscription.findUnique({ where: { userId } });

    if (!sub || sub.status !== 'ACTIVE' || sub.expiresAt < new Date()) {
      throw new ForbiddenException('هذه الميزة متاحة للمشتركين فقط');
    }

    return true;
  }
}
