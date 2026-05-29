import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationEmail(email: string, firstName: string, link: string): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey || apiKey.startsWith('re_...')) {
      this.logger.warn(`[DEV] Verification email to ${email}: ${link}`);
      return;
    }

    const name = firstName || 'طالبنا العزيز';
    const body = {
      from: 'EliTutor <noreply@elitutor.org>',
      to: [email],
      subject: 'تحقق من بريدك الإلكتروني — الموجه الذكي',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #1A1F5E; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #FFD700; margin: 0;">الموجه الذكي — EliTutor</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A1F5E;">أهلاً ${name}!</h2>
            <p style="color: #555; line-height: 1.6;">شكراً لتسجيلك في منصة الموجه الذكي. اضغط على الرابط أدناه لتحقق من بريدك الإلكتروني:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background: #1A1F5E; color: #FFD700; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                تحقق من بريدي الإلكتروني
              </a>
            </div>
            <p style="color: #888; font-size: 13px;">الرابط صالح لمدة 24 ساعة. إذا لم تطلب هذا، تجاهل الرسالة.</p>
          </div>
        </div>
      `,
    };

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, link: string): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey || apiKey.startsWith('re_...')) {
      this.logger.warn(`[DEV] Password reset email to ${email}: ${link}`);
      return;
    }

    const name = firstName || 'مستخدمنا العزيز';
    const body = {
      from: 'EliTutor <noreply@elitutor.org>',
      to: [email],
      subject: 'إعادة تعيين كلمة المرور — الموجه الذكي',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #1A1F5E; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #FFD700; margin: 0;">الموجه الذكي — EliTutor</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A1F5E;">أهلاً ${name}!</h2>
            <p style="color: #555; line-height: 1.6;">تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. اضغط على الرابط أدناه:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background: #1A1F5E; color: #FFD700; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                إعادة تعيين كلمة المرور
              </a>
            </div>
            <p style="color: #888; font-size: 13px;">الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا، تجاهل الرسالة.</p>
          </div>
        </div>
      `,
    };

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}
