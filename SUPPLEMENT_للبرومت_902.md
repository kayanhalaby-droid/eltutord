# SUPPLEMENT — يُضاف في بداية البرومت قبل SECTION A
# الأولوية القصوى — هذه المتطلبات تتجاوز أي تعليمات في الـ 902 صفحة

---

## CRITICAL OVERRIDE #1: استخدم Cardcom بدل Stripe

الـ 902 صفحة تستخدم Stripe. هذا خطأ للسوق الإسرائيلي.
**يجب استبدال كل ذكر لـ Stripe بـ Cardcom.**

### Cardcom Integration — المواصفات الكاملة

```typescript
// PAYMENT PROVIDER: Cardcom (Israeli payment gateway)
// Documentation: https://secure.cardcom.solutions/Interface/LowProfile.aspx
// NOT Stripe — Cardcom only

const CARDCOM_LP_URL = "https://secure.cardcom.solutions/Interface/LowProfile.aspx";
const CARDCOM_API_URL = "https://secure.cardcom.solutions/api/v11";

// ENV variables required:
// CARDCOM_TERMINAL=your_terminal_number
// CARDCOM_API_NAME=your_api_name
// CARDCOM_SUCCESS_URL=/student (configurable — after payment redirect)
```

### Plan Prices (ILS — Israeli Shekel ₪)
```typescript
export const PLAN_PRICES = {
  basic:  { monthly: 95,  yearly: 950  },
  elite:  { monthly: 129, yearly: 89   }, // yearly = per month when billed annually
  vip:    { monthly: 199, yearly: 139  },
};
```

### Create Payment Page
```typescript
async function createCardcomPaymentPage(params: {
  userId: string;
  plan: 'basic' | 'elite' | 'vip';
  billingCycle: 'monthly' | 'yearly';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  const amount = PLAN_PRICES[params.plan][params.billingCycle];
  
  const formParams = new URLSearchParams({
    TerminalNumber: process.env.CARDCOM_TERMINAL!,
    UserName: process.env.CARDCOM_API_NAME!,
    APILevel: "10",
    Operation: "1", // ChargeOnly
    SumToBill: String(amount),
    CoinId: "1", // ILS
    Language: "he",
    ProductName: `اشتراك ${params.plan} - ${params.billingCycle}`,
    SuccessRedirectUrl: `${process.env.APP_URL}/api/cardcom/success`,
    ErrorRedirectUrl: `${process.env.APP_URL}/subscription?cancelled=1`,
    IndicatorUrl: `${process.env.APP_URL}/api/cardcom/webhook`,
    ReturnValue: `${params.userId}|${params.plan}|${params.billingCycle}`,
    Codepage: "65001",
  });
  
  if (params.customerName) formParams.set("CardOwnerName", params.customerName);
  if (params.customerEmail) formParams.set("CardOwnerEmail", params.customerEmail);
  if (params.customerPhone) formParams.set("CardOwnerPhone", params.customerPhone);

  const response = await fetch(CARDCOM_LP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formParams.toString(),
  });

  const text = await response.text();
  const parsed = new URLSearchParams(text);
  const responseCode = parsed.get("ResponseCode");
  
  if (responseCode !== "0") {
    throw new Error(`Cardcom error: ${parsed.get("Description")}`);
  }

  return {
    url: parsed.get("url")!,
    lowProfileId: parsed.get("LowProfileCode")!,
  };
}
```

### Webhook Handler
```typescript
// POST/GET /api/cardcom/webhook
// Cardcom sends payment confirmation here
async function handleCardcomWebhook(params: Record<string, string>) {
  const responseCode = params.ResponseCode ?? params.responsecode;
  if (responseCode !== "0") return; // Payment failed
  
  const returnValue = params.ReturnValue ?? params.returnvalue;
  const [userId, plan, billingCycle] = returnValue.split("|");
  const transactionId = params.TranzactionId ?? params.TransactionId;
  
  // Activate subscription in DB
  await activateSubscription({ userId, plan, billingCycle, transactionId });
}
```

### Success Redirect
```typescript
// GET /api/cardcom/success
// After payment, Cardcom redirects here
// Then redirect to the correct page based on user role:
async function handleCardcomSuccess(lowProfileCode: string) {
  const successUrl = process.env.CARDCOM_SUCCESS_URL || '/student';
  // Add query param to show success message
  return redirect(`${successUrl}?subscribed=1`);
}
```

### API Routes to Register
```
POST/GET /api/cardcom/webhook  → handleCardcomWebhook
GET      /api/cardcom/success  → handleCardcomSuccess  
GET      /api/cardcom/cancel   → redirect to /subscription?cancelled=1
```

### Subscription Schema
```prisma
// Replace Stripe fields with Cardcom fields
model Subscription {
  id                    String   @id @default(uuid())
  userId                String   @unique
  plan                  Plan     @default(BASIC)
  status                SubStatus @default(PENDING)
  billingCycle          BillingCycle @default(MONTHLY)
  cardcomTransactionId  String?
  cardcomToken          String?  // For recurring payments
  cardcomTokenExpiry    String?
  amount                Float?
  startedAt             DateTime @default(now())
  expiresAt             DateTime?
  cancelledAt           DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  @@map("subscriptions")
}

enum Plan { BASIC ELITE VIP }
enum SubStatus { ACTIVE CANCELLED EXPIRED PENDING }
enum BillingCycle { MONTHLY YEARLY }
```

---

## CRITICAL OVERRIDE #2: شخصية نور البومة 🦉

الـ 902 صفحة لا تحتوي على mascot. يجب إضافة شخصية نور في كل مكان.

### NoorOwl Component

```tsx
// File: components/NoorOwl.tsx
// Owl mascot with expressions using SVG + Framer Motion

type NoorExpression = 
  | 'happy'       // تقفز وتحتفل
  | 'sad'         // حزينة + دمعة
  | 'excited'     // نجوم حول الرأس
  | 'sleeping'    // عيون مغلقة + ZZZ
  | 'angry'       // حاجبان منخفضان
  | 'studying'    // تحمل كتابًا
  | 'dancing'     // تتمايل
  | 'encouraging' // تشير بإصبع
  | 'default';    // وضع طبيعي

interface NoorOwlProps {
  expression?: NoorExpression;
  size?: number;
  animate?: boolean;
  message?: string; // إذا موجودة، تعرض speech bubble
}
```

**التصميم:**
- جسم: بيضاوي، لون #1A1F5E (أزرق داكن)
- عيون: دائرتان ذهبيتان #FFD700 مع بؤبؤ أسود
- منقار: مثلث ذهبي صغير
- صدر: بيضاوي أبيض
- أجنحة: صغيرة على الجانبين

**أماكن ظهور نور (إلزامية):**
1. صفحة Login — أعلى النموذج (expression: default)
2. Student Home — في الـ hero card (expression: happy أو excited)
3. Lesson Page — جانب الشرح (expression: studying)
4. نتائج الكويز — (expression: happy إذا >70% وإلا encouraging)
5. Landing Page — في الـ hero section
6. عند فقدان Streak — modal بـ (expression: sad)
7. إنجاز شارة جديدة — (expression: excited)
8. Subscription page — (expression: excited)

**Speech Bubble:**
```tsx
// نور مع فقاعة حوار
<NoorOwl expression="encouraging" message="هيا! تستطيع الإجابة!" />
```

---

## CRITICAL OVERRIDE #3: إشعارات واتساب

الـ 902 صفحة تستخدم Email فقط. للسوق العربي الإسرائيلي، واتساب أهم.

### WhatsApp Business API Integration

```typescript
// ENV required:
// WHATSAPP_TOKEN=your_whatsapp_business_token
// WHATSAPP_PHONE_ID=your_phone_number_id
// WHATSAPP_FROM_NUMBER=your_business_number

async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/^0/, "972"), // Convert Israeli number
        type: "text",
        text: { body: message },
      }),
    }
  );
  return response.json();
}

// Parent notification examples:
const PARENT_MESSAGES = {
  dailySummary: (childName: string, minutes: number, subject: string) =>
    `السلام عليكم! ${childName} درس اليوم ${minutes} دقيقة وأكمل وحدة في ${subject} 🎉`,
  
  streakAlert: (childName: string, streak: number) =>
    `تحذير: ${childName} قد يفقد سلسلة ${streak} يوم! يحتاج تذكير 🔥`,
  
  weeklyReport: (childName: string, units: number, accuracy: number) =>
    `تقرير الأسبوع: ${childName} أكمل ${units} وحدات بدقة ${accuracy}% ⭐`,
  
  rewardRequest: (childName: string, reward: string, gems: number) =>
    `${childName} يطلب مكافأة "${reward}" مقابل ${gems} جوهرة 💎`,
};
```

---

## CRITICAL OVERRIDE #4: هوية المنصة

```
اسم المنصة: الموجه الذكي / Elite Tutor
الموقع: elitutor.org
اللغة الأساسية: عربي (RTL)
العملة: شيكل إسرائيلي ₪ (ILS)
السوق: الطلاب العرب في إسرائيل (مناطق الـ 48)
المنهج: כותר (Kotar) — المنهج الإسرائيلي الرسمي للمدارس العربية
الألوان: #1A1F5E (أزرق داكن) + #FFD700 (ذهبي)
المرجع الديني/الثقافي: عربي إسرائيلي (لا فلسطيني ولا إسرائيلي خالص)
```

---

## CRITICAL OVERRIDE #5: خطة نقل البيانات (Migration)

المنصة الحالية عندها **275+ عائلة مشتركة** يجب الحفاظ عليها.

```typescript
// migration script — run once
// Migrates users from old MySQL DB to new PostgreSQL

async function migrateUsers() {
  // 1. Export from MySQL:
  //    SELECT * FROM users, students, parents, subscriptions
  // 2. Transform to new schema
  // 3. Import to PostgreSQL
  // 4. Send WhatsApp message to all users:
  //    "تم تحديث المنصة! رابط الدخول الجديد: elitutor.org/login"
  //    "كلمة المرور الجديدة: [phone_last_4_digits]"
}
```

---

## CRITICAL OVERRIDE #6: الإعدادات البيئية الكاملة

```env
# Application
APP_URL=https://elitutor.org
APP_NAME=الموجه الذكي

# Database (PostgreSQL — per the 902-page prompt)
DATABASE_URL=postgresql://...

# AI
OPENAI_API_KEY=sk-...  # Already have this

# Payment (Cardcom — NOT Stripe)
CARDCOM_TERMINAL=your_terminal_number
CARDCOM_API_NAME=your_api_name
CARDCOM_SUCCESS_URL=/student

# WhatsApp Business API
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id

# Storage (AWS S3 — already have this)
AWS_BUCKET_NAME=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...

# Email (Resend — already have this)
RESEND_API_KEY=...
```

---

## ملاحظة للـ Claude Code / Manus

عند تعارض أي تعليمة في الـ 902 صفحة مع هذا الـ Supplement:
**هذا الـ Supplement يأخذ الأولوية.**

تحديدًا:
- Cardcom > Stripe في كل مكان
- نور البومة موجودة في كل الصفحات المذكورة
- واتساب مع Email للإشعارات
- ₪ ليس $ للأسعار
