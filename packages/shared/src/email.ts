// Email via Resend — copied from elitetutor-master server/emailService.ts

interface WelcomeEmailOpts {
  to: string;
  name: string;
  phone: string;
  pin: string;
  role: 'student' | 'parent' | 'teacher';
  grade?: string;
  city?: string;
}

export async function sendWelcomeEmail(opts: WelcomeEmailOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  const subject = `مرحباً بك في الموجه الذكي — EliTutor`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1A1F5E;">أهلاً ${opts.name}! 🦉</h1>
      <p>مرحباً بك في منصة <strong>الموجه الذكي</strong>.</p>
      <p><strong>رقم هاتفك:</strong> ${opts.phone}</p>
      <p><strong>كلمة المرور:</strong> ${opts.pin}</p>
      ${opts.grade ? `<p><strong>الصف:</strong> ${opts.grade}</p>` : ''}
      ${opts.city ? `<p><strong>المدينة:</strong> ${opts.city}</p>` : ''}
      <p><a href="https://elitutor.org/login" style="background:#1A1F5E;color:#FFD700;padding:12px 24px;border-radius:8px;text-decoration:none;">ادخل للمنصة</a></p>
      <p style="color:#666;font-size:12px;">elitutor.org</p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'الموجه الذكي <noreply@elitutor.org>',
      to: [opts.to],
      subject,
      html,
    }),
  });
}

export async function sendOwnerNotification(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'الموجه الذكي <noreply@elitutor.org>',
      to: ['kayanhalaby@gmail.com'],
      subject,
      html: `<div dir="rtl">${body}</div>`,
    }),
  });
}
