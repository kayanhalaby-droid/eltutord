# REUSE SUPPLEMENT — انسخ هذا من المشروع القديم ولا تعد بناءه

## المبدأ الأساسي
المشروع القديم (elitetutor-master) يحتوي على integrations تعمل فعلًا.
**لا تعيد بناء ما هو موجود — انسخه وكيّفه فقط.**

---

## 1. الذكاء الاصطناعي (LLM + Vision + TTS)

### كيف يعمل في المشروع القديم
```
المشروع يستخدم Manus Forge API كـ proxy لـ OpenAI.
الـ API key هو: BUILT_IN_FORGE_API_KEY
الـ URL هو: BUILT_IN_FORGE_API_URL
النموذج: gemini-2.5-flash (يُعاد توجيهه تلقائيًا)
```

### الملفات القابلة للنسخ المباشر

**`server/_core/llm.ts`** — استدعاء AI (نص + صور)
```typescript
// هذا الملف يعمل بالفعل — انسخه كما هو
// invokeLLM(params) — يدعم النص والصور
// مثال الاستخدام في المشروع الجديد (NestJS):

import { invokeLLM } from '../shared/llm';

// حل واجب بصورة:
const result = await invokeLLM({
  messages: [
    { role: 'system', content: 'أنت مساعد تعليمي...' },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: 'ساعدني في حل هذا الواجب' }
      ]
    }
  ]
});
const answer = result.choices[0].message.content;
```

**`server/_core/tts.ts`** — تحويل نص لصوت عربي
```typescript
// هذا الملف يستخدم OpenAI TTS مباشرة — انسخه كما هو
// generateSpeech({ text, voice: 'onyx', speed: 0.9 })
// يرجع: { audioBase64: string }

import { generateSpeech } from '../shared/tts';

const audio = await generateSpeech({
  text: 'أحسنت! إجابة صحيحة',
  voice: 'onyx', // أفضل صوت للعربية
  speed: 0.9,    // أبطأ قليلًا للأطفال
});
// أرسل audio.audioBase64 للـ frontend
```

### ENV Variables المطلوبة
```env
OPENAI_API_KEY=sk-...          # للـ TTS مباشرة
BUILT_IN_FORGE_API_KEY=...     # للـ LLM عبر Manus
BUILT_IN_FORGE_API_URL=...     # Manus Forge endpoint
```

---

## 2. بوابة الدفع Cardcom

### الملف القابل للنسخ
**`server/cardcom.ts`** — كامل ويعمل

```typescript
// هذا الملف جاهز 100% — انسخه مباشرة
// الدوال الموجودة:
// createCardcomPaymentPage(params) → { url, lowProfileId }
// getCardcomPaymentResult(lowProfileId) → result
// registerCardcomRoutes(app) → يسجل /api/cardcom/*

// في NestJS، كيّف registerCardcomRoutes لـ NestJS Controller:
@Controller('api/cardcom')
export class CardcomController {
  @All('webhook')
  async webhook(@Req() req, @Res() res) {
    // نفس منطق الـ webhook الموجود في cardcom.ts
  }

  @Get('success')
  async success(@Query('LowProfileCode') code, @Res() res) {
    // redirect حسب role المستخدم
    const successUrl = process.env.CARDCOM_SUCCESS_URL || '/student';
    res.redirect(`${successUrl}?subscribed=1`);
  }
}
```

### الأسعار الموجودة (لا تغيرها)
```typescript
export const PLAN_PRICES = {
  basic: { monthly: 95, yearly: 950 },
  elite: { monthly: 129, yearly: 89 },  // yearly = شهري عند دفع سنوي
  vip:   { monthly: 199, yearly: 139 },
};
```

### ENV Variables
```env
CARDCOM_TERMINAL=your_terminal
CARDCOM_API_NAME=your_api_name
CARDCOM_API_PASSWORD=your_password
CARDCOM_SUCCESS_URL=/student
```

---

## 3. التخزين (Storage)

### الملف القابل للنسخ
**`server/storage.ts`** — يستخدم Manus Forge Storage

```typescript
// هذا الملف يعمل — انسخه كما هو
// storagePut(key, data, contentType) → { key, url }
// storageGet(key) → { key, url }

// مثال:
import { storagePut, storageGet } from '../shared/storage';

// رفع صورة واجب:
const { url } = await storagePut(
  `homework/${studentId}/${Date.now()}.jpg`,
  imageBuffer,
  'image/jpeg'
);
```

### ENV Variables
```env
BUILT_IN_FORGE_API_URL=...  # نفس الـ LLM
BUILT_IN_FORGE_API_KEY=...  # نفس الـ LLM
```

---

## 4. البريد الإلكتروني (Email)

### الملف القابل للنسخ
**`server/emailService.ts`** — يستخدم Resend

```typescript
// sendWelcomeEmail(opts) — جاهز للنسخ
// sendActivationCodeEmail(opts) — موجود
// sendOwnerNotification(subject, body) — موجود

import { sendWelcomeEmail } from '../shared/email';

await sendWelcomeEmail({
  to: user.email,
  name: user.name,
  phone: user.phone,
  pin: user.password,
  role: 'student',
  grade: 'الصف الخامس',
  city: 'الناصرة',
});
```

### ENV Variables
```env
RESEND_API_KEY=re_...
```

---

## 5. Push Notifications

### الملف القابل للنسخ
**`server/pushNotifications.ts`** — يستخدم web-push

```typescript
// sendPushToUser(userId, payload) — يرسل للمستخدم
// broadcastPush(payload) — يرسل للجميع
// savePushSubscription(userId, subscription) — يحفظ subscription

import { sendPushToUser } from '../shared/push';

await sendPushToUser(studentId, {
  title: '🔥 لا تنسَ درسك اليوم!',
  body: 'نور تنتظرك',
  url: '/student',
});
```

### ENV Variables
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## 6. المنهج الإسرائيلي (Curriculum Data)

### الملف القابل للنسخ المباشر
**`shared/curriculum.ts`** — منهج كوتر صفوف 2-6 كامل

```typescript
// يحتوي على:
// ARABIC_UNITS: Record<number, CurriculumUnit[]>  — صفوف 2-6
// HEBREW_UNITS: Record<number, CurriculumUnit[]>  — صفوف 2-6
// ENGLISH_UNITS: Record<number, CurriculumUnit[]> — صفوف 2-6
// MATH_UNITS: Record<number, CurriculumUnit[]>    — صفوف 2-6
// SUBJECTS: subject config array

// انسخ هذا الملف كما هو إلى المشروع الجديد
// وأضف صفوف 1 و 7-12 لاحقًا
```

---

## 7. نظام التحقق من الجلسة (Auth Helpers)

### الملف القابل للاستفادة منه
**`server/phoneAuth.ts`** — تسجيل الدخول بالهاتف + كلمة مرور

```typescript
// المنطق الموجود:
// 1. المستخدم يدخل رقم هاتف + كلمة مرور
// 2. يتحقق من DB
// 3. يرجع JWT token
// كيّف هذا المنطق لـ NestJS AuthService
```

---

## 8. خطة النسخ العملية

### الترتيب الصحيح عند البناء

```
الخطوة 1: أنشئ مجلد shared/ في المشروع الجديد
الخطوة 2: انسخ هذه الملفات مباشرة:
  - server/_core/llm.ts        → packages/shared/src/llm.ts
  - server/_core/tts.ts        → packages/shared/src/tts.ts
  - server/storage.ts          → packages/shared/src/storage.ts
  - server/emailService.ts     → packages/shared/src/email.ts
  - server/pushNotifications.ts → packages/shared/src/push.ts
  - server/cardcom.ts          → packages/backend/src/payment/cardcom.ts
  - shared/curriculum.ts       → packages/shared/src/curriculum.ts

الخطوة 3: كيّف الـ imports فقط (العلاقات بين الملفات)
الخطوة 4: لا تعيد كتابة المنطق — هو يعمل
```

---

## 9. قاعدة البيانات — نقل البيانات

### الـ Schema الحالي (MySQL + Drizzle)
الجداول الموجودة والمليئة ببيانات حقيقية:
```
users           — بيانات تسجيل دخول
app_profiles    — أدوار: student/parent/admin
students        — ملفات الطلاب + XP + Streak
parents         — ملفات الأهل
subscriptions   — اشتراكات Cardcom الفعلية
assignments     — واجبات محلولة بالذكاء الاصطناعي
rewards         — مكافآت المتجر
curriculum_units — محتوى المنهج
```

### سكريبت النقل للـ PostgreSQL الجديد
```bash
# 1. تصدير من MySQL
mysqldump -u user -p elitutor_db > backup.sql

# 2. تحويل SQL syntax
# MySQL → PostgreSQL: تغيير AUTO_INCREMENT → SERIAL، إلخ

# 3. استيراد لـ PostgreSQL
psql -U user -d elitutor_new -f backup_converted.sql

# 4. أرسل لـ 275 عائلة:
# "تم تحديث المنصة! رابط الدخول: elitutor.org/login"
```

---

## ملاحظة لـ Claude Code / Manus

**عند مصادفة أي من هذه الوظائف في MASTER_PROMPT:**
- LLM/AI calls → استخدم `invokeLLM()` من الملف المنسوخ
- TTS → استخدم `generateSpeech()` من الملف المنسوخ
- File upload → استخدم `storagePut()` من الملف المنسوخ
- Email → استخدم `sendWelcomeEmail()` من الملف المنسوخ
- Push notifications → استخدم `sendPushToUser()` من الملف المنسوخ
- Payment → استخدم Cardcom من الملف المنسوخ (لا Stripe)

**لا تعيد بناء هذه الـ integrations من الصفر.**
