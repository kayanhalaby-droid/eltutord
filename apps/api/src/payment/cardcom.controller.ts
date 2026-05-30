import { Controller, Post, Get, Body, Query, Req, Res, All, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IsString, IsIn } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardcomService } from './cardcom.service';

class CreatePaymentDto {
  @IsString()
  @IsIn(['basic', 'elite', 'vip'])
  plan: 'basic' | 'elite' | 'vip';

  @IsString()
  @IsIn(['monthly', 'yearly'])
  billingCycle: 'monthly' | 'yearly';
}

interface AuthRequest extends Request {
  user: { id: string; firstName?: string; email?: string; phone?: string };
}

@ApiTags('Payments')
@Controller('api/cardcom')
export class CardcomController {
  constructor(
    private cardcomService: CardcomService,
    private configService: ConfigService,
  ) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'إنشاء رابط دفع Cardcom للاشتراك' })
  async createCheckout(@Req() req: AuthRequest, @Body() dto: CreatePaymentDto) {
    const user = req.user as any;
    return this.cardcomService.createPaymentPage({
      userId: user.id,
      plan: dto.plan,
      billingCycle: dto.billingCycle,
      customerName: user.firstName,
      customerEmail: user.email,
      customerPhone: user.phone,
    });
  }

  @All('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const params = { ...req.query, ...req.body } as Record<string, string>;
    await this.cardcomService.handleWebhook(params);
    res.status(200).send('OK');
  }

  @Get('success')
  success(@Query('LowProfileCode') code: string, @Res() res: Response) {
    const successUrl = this.configService.get<string>('CARDCOM_SUCCESS_URL') || '/student';
    res.redirect(`${successUrl}?subscribed=1`);
  }

  @Get('cancel')
  cancel(@Res() res: Response) {
    res.redirect('/subscription?cancelled=1');
  }

  @Get('subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'جلب تفاصيل الاشتراك الحالي' })
  getSubscription(@Req() req: AuthRequest) {
    return this.cardcomService.getSubscription(req.user.id);
  }

  @Get('subscription/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'فحص سريع للاشتراك النشط' })
  getSubscriptionStatus(@Req() req: AuthRequest) {
    return this.cardcomService.getSubscriptionStatus(req.user.id);
  }
}
