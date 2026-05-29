import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Plan, BillingCycle, SubStatus, NotificationType } from '@prisma/client';

const CARDCOM_LP_URL = 'https://secure.cardcom.solutions/Interface/LowProfile.aspx';

export const PLAN_PRICES = {
  basic: { monthly: 95, yearly: 950 },
  elite: { monthly: 129, yearly: 89 },
  vip: { monthly: 199, yearly: 139 },
};

// Subscription duration in days
const BILLING_DAYS: Record<BillingCycle, number> = {
  MONTHLY: 30,
  YEARLY: 365,
};

interface CreatePaymentParams {
  userId: string;
  plan: 'basic' | 'elite' | 'vip';
  billingCycle: 'monthly' | 'yearly';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

@Injectable()
export class CardcomService {
  private readonly logger = new Logger(CardcomService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createPaymentPage(params: CreatePaymentParams): Promise<{ url: string; lowProfileId: string }> {
    const amount = PLAN_PRICES[params.plan][params.billingCycle];
    const appUrl = this.configService.get<string>('APP_URL') || 'https://elitutor.org';

    const formParams = new URLSearchParams({
      TerminalNumber: this.configService.get<string>('CARDCOM_TERMINAL') || '',
      UserName: this.configService.get<string>('CARDCOM_API_NAME') || '',
      APILevel: '10',
      Operation: '1',
      SumToBill: String(amount),
      CoinId: '1', // ILS ₪
      Language: 'he',
      ProductName: `اشتراك ${params.plan} - ${params.billingCycle}`,
      SuccessRedirectUrl: `${appUrl}/api/cardcom/success`,
      ErrorRedirectUrl: `${appUrl}/subscription?cancelled=1`,
      IndicatorUrl: `${appUrl}/api/cardcom/webhook`,
      ReturnValue: `${params.userId}|${params.plan}|${params.billingCycle}`,
      Codepage: '65001',
    });

    if (params.customerName) formParams.set('CardOwnerName', params.customerName);
    if (params.customerEmail) formParams.set('CardOwnerEmail', params.customerEmail);
    if (params.customerPhone) formParams.set('CardOwnerPhone', params.customerPhone);

    const response = await fetch(CARDCOM_LP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formParams.toString(),
    });

    const text = await response.text();
    const parsed = new URLSearchParams(text);
    const responseCode = parsed.get('ResponseCode');

    if (responseCode !== '0') {
      throw new BadRequestException(`Cardcom error: ${parsed.get('Description')}`);
    }

    return {
      url: parsed.get('url') || '',
      lowProfileId: parsed.get('LowProfileCode') || '',
    };
  }

  async handleWebhook(params: Record<string, string>): Promise<void> {
    const responseCode = params.ResponseCode ?? params.responsecode;
    if (responseCode !== '0') {
      this.logger.warn('Cardcom payment failed', { code: responseCode });
      return;
    }

    const returnValue = params.ReturnValue ?? params.returnvalue;
    if (!returnValue) {
      this.logger.warn('Cardcom webhook missing ReturnValue');
      return;
    }

    const [userId, planRaw, billingCycleRaw] = returnValue.split('|');
    const transactionId = params.TranzactionId ?? params.TransactionId ?? '';
    const cardcomToken = params.Token ?? params.token ?? undefined;
    const cardcomTokenExpiry = params.TokenExDate ?? params.tokenexdate ?? undefined;

    const plan = planRaw?.toUpperCase() as Plan;
    const billingCycle = billingCycleRaw?.toUpperCase() as BillingCycle;
    const amount = PLAN_PRICES[planRaw?.toLowerCase()]?.[billingCycleRaw?.toLowerCase()] ?? 0;

    if (!userId || !plan || !billingCycle) {
      this.logger.error('Cardcom webhook invalid ReturnValue', returnValue);
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (BILLING_DAYS[billingCycle] ?? 30));

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        billingCycle,
        status: SubStatus.ACTIVE,
        cardcomTransactionId: transactionId,
        cardcomToken,
        cardcomTokenExpiry,
        amount,
        startedAt: new Date(),
        expiresAt,
      },
      update: {
        plan,
        billingCycle,
        status: SubStatus.ACTIVE,
        cardcomTransactionId: transactionId,
        cardcomToken,
        cardcomTokenExpiry,
        amount,
        startedAt: new Date(),
        expiresAt,
        cancelledAt: null,
      },
    });

    this.logger.log(`Subscription activated: userId=${userId}, plan=${plan}, cycle=${billingCycle}, tx=${transactionId}`);

    // Send confirmation notification
    await this.notificationsService
      .send(userId, NotificationType.PAYMENT_CONFIRMATION, { amount: `${amount}` })
      .catch((err) => this.logger.warn(`Notification failed: ${err.message}`));
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }
}
