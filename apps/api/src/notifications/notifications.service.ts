import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Notification } from '@prisma/client';
import { sendWhatsAppMessage } from '@elitutor/shared';

// Arabic notification templates (Override #3 ג€” WhatsApp priority)
const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; body: (data?: any) => string }> = {
  ACHIEVEMENT_UNLOCKED: {
    title: '״¥†״¬״§״² ״¬״¯״¯! נ†',
    body: (d) => `״×… ״×״­ ״¥†״¬״§״² ״¬״¯״¯: ${d?.title ?? ''}`,
  },
  WEEKLY_REPORT_READY: {
    title: '״×‚״±״±ƒ ״§„״£״³״¨ˆ״¹ ״¬״§‡״²! נ“',
    body: (d) => `״×‚״±״± ${d?.childName ?? '״§״¨†ƒ/״§״¨†״×ƒ'} ״§„״£״³״¨ˆ״¹ ״¬״§‡״² „„…״±״§״¬״¹״©`,
  },
  NEW_ASSIGNMENT: {
    title: '…‡…״© ״¬״¯״¯״©! נ“',
    body: (d) => `„״¯ƒ …‡…״© ״¬״¯״¯״©: ${d?.title ?? ''}`,
  },
  ASSIGNMENT_REMINDER: {
    title: '״×״°ƒ״± ״¨…‡…״© ‚״§״¯…״© ג°',
    body: (d) => `״×״°ƒ״±: …‡…״© "${d?.title ?? ''}" ״×״³״×״­‚ ״÷״¯‹״§`,
  },
  PARENT_MESSAGE: {
    title: '״±״³״§„״© ״¬״¯״¯״© …† ˆ„ ״§„״£…״± נ’¬',
    body: () => '„״¯ƒ ״±״³״§„״© ״¬״¯״¯״© …† ˆ„ ״£…״±ƒ',
  },
  PAYMENT_DUE: {
    title: '״§״×ˆ״±״×ƒ …״³״×״­‚״© ״§„״¯״¹ נ’³',
    body: (d) => `״§״´״×״±״§ƒƒ ״³״×״­‚ ״§„״¯״¹. ״§„…״¨„״÷: ${d?.amount ?? ''} ג‚×`,
  },
  PAYMENT_CONFIRMATION: {
    title: '״×… ״×״£ƒ״¯ ״¯״¹״×ƒ ג…',
    body: (d) => `״×… ״§״³״×„״§… ״¯״¹״×ƒ ״¨…״¨„״÷ ${d?.amount ?? ''} ג‚×. ״´ƒ״±‹״§ „ƒ!`,
  },
  SUBSCRIPTION_EXPIRED: {
    title: '״§†״×‡‰ ״§״´״×״±״§ƒƒ ג ן¸',
    body: () => '״§†״×‡״× ״µ„״§״­״© ״§״´״×״±״§ƒƒ. ״¬״¯‘״¯ ״§„״§״´״×״±״§ƒ „„״§״³״×…״±״§״±  ״§„״×״¹„…',
  },
  ADMIN_MESSAGE: {
    title: '״±״³״§„״© …† ״§„״¥״¯״§״±״© נ“¢',
    body: (d) => d?.message ?? '„״¯ƒ ״±״³״§„״© ״¬״¯״¯״© …† ״¥״¯״§״±״© ״§„…ˆ״¬‡ ״§„״°ƒ',
  },
  STREAK_WARNING: {
    title: '„״§ ״×‚״¯ ״³„״³„״×ƒ! נ”¥',
    body: (d) => `${d?.childName ?? '״§״¨†ƒ/״§״¨†״×ƒ'} ‚״¯ ‚״¯ ״³„״³„״© ${d?.streak ?? 0} ˆ…! ״­״×״§״¬ ״×״°ƒ״±`,
  },
  DAILY_REMINDER: {
    title: 'ˆ‚״× ״§„״¯״±״§״³״©! נ“–',
    body: (d) => `‡״§ ${d?.name ?? ''}, †ˆ״± ״×†״×״¸״±ƒ „„״¯״±״³ ״§„ˆ…!`,
  },
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async send(
    userId: string,
    type: NotificationType,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, role: true },
    });
    if (!user) throw new NotFoundException('״§„…״³״×״®״¯… ״÷״± …ˆ״¬ˆ״¯');

    const template = NOTIFICATION_TEMPLATES[type];
    const titleAr = template.title;
    const messageAr = template.body(metadata);

    const notification = await this.prisma.notification.create({
      data: { userId, type, titleAr, messageAr, metadata: metadata ?? {} },
    });

    // WhatsApp ג€” „„״£‡„ (Override #3: WhatsApp ״£‡… …† Email „„״³ˆ‚ ״§„״¹״±״¨ ״§„״¥״³״±״§״¦„)
    if (user.role === 'PARENT' && user.phone) {
      await sendWhatsAppMessage(user.phone, `${titleAr}\n${messageAr}`).catch((err) =>
        this.logger.warn(`WhatsApp failed for ${userId}: ${err.message}`),
      );
    }

    // Email ג€” „„״¥״´״¹״§״±״§״× ״§„…״§„״© ˆ״§„״×‚״§״±״±
    if (this.shouldSendEmail(type) && user.email) {
      await this.sendEmail(user.email, titleAr, messageAr).catch((err) =>
        this.logger.warn(`Email failed for ${userId}: ${err.message}`),
      );
    }

    // Web Push ג€” „״¬…״¹ ״§„…״³״×״®״¯…†
    await this.sendWebPush(userId, titleAr, messageAr).catch((err) =>
      this.logger.warn(`Push failed for ${userId}: ${err.message}`),
    );

    return notification;
  }

  async getForUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('״§„״¥״´״¹״§״± ״÷״± …ˆ״¬ˆ״¯');
    if (notification.userId !== userId) throw new ForbiddenException('״÷״± …״µ״±״­');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async savePushToken(
    userId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  ): Promise<void> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
    });
    if (!parentProfile) return;

    await this.prisma.pushToken.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        parentId: parentProfile.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  // ג”€ג”€ג”€ Email via Resend ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey || apiKey.startsWith('re_...')) {
      this.logger.debug(`[DEV] Email to ${to}: ${subject}`);
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EliTutor <noreply@elitutor.org>',
        to: [to],
        subject,
        html: `<div dir="rtl" style="font-family:Arial;max-width:600px;margin:0 auto;">
          <div style="background:#1A1F5E;padding:20px;text-align:center;">
            <h2 style="color:#FFD700;margin:0;">״§„…ˆ״¬‡ ״§„״°ƒ</h2>
          </div>
          <div style="padding:20px;background:#fff;">
            <p style="font-size:16px;color:#333;">${body}</p>
          </div>
        </div>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }
  }

  // ג”€ג”€ג”€ Web Push (VAPID) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

  private async sendWebPush(userId: string, title: string, body: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        parentProfile: { include: { pushTokens: true } },
      },
    });

    const tokens = user?.parentProfile?.pushTokens ?? [];
    if (tokens.length === 0) return;

    const vapidPublic = this.config.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivate = this.config.get<string>('VAPID_PRIVATE_KEY');
    if (!vapidPublic || !vapidPrivate) return;

    // Lazy-load web-push to avoid startup errors if not configured
    try {
      // @ts-ignore
      const webpush = await import('web-push');
      webpush.setVapidDetails('mailto:admin@elitutor.org', vapidPublic, vapidPrivate);

      const payload = JSON.stringify({ title, body, icon: '/noor-owl.png', url: '/student' });

      for (const token of tokens) {
        try {
          await webpush.sendNotification(
            { endpoint: token.endpoint, keys: { p256dh: token.p256dh, auth: token.auth } },
            payload,
          );
        } catch (err) {
          if ((err as any).statusCode === 410) {
            // Expired subscription ג€” remove
            await this.prisma.pushToken.delete({ where: { id: token.id } }).catch(() => null);
          }
        }
      }
    } catch {
      this.logger.debug('web-push not configured, skipping');
    }
  }

  private shouldSendEmail(type: NotificationType): boolean {
    return [
      NotificationType.WEEKLY_REPORT_READY,
      NotificationType.PAYMENT_DUE,
      NotificationType.PAYMENT_CONFIRMATION,
      NotificationType.SUBSCRIPTION_EXPIRED,
      NotificationType.ADMIN_MESSAGE,
    ].includes(type as any);
  }
}
