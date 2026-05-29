import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Request {
  user: { id: string };
}

class SavePushTokenDto {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'جلب إشعارات المستخدم' })
  getNotifications(@Req() req: AuthRequest) {
    return this.notificationsService.getForUser(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'تعليم الإشعار كمقروء' })
  @ApiResponse({ status: 200 })
  markRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.markRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'تعليم جميع الإشعارات كمقروءة' })
  markAllRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Post('push-token')
  @ApiOperation({ summary: 'حفظ web-push subscription للإشعارات الفورية' })
  savePushToken(@Req() req: AuthRequest, @Body() dto: SavePushTokenDto) {
    return this.notificationsService.savePushToken(req.user.id, dto);
  }
}
