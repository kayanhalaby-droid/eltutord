# قاعدة البيانات — EliTutor

## البدء السريع

```bash
# 1. انسخ ملف البيئة
cp ../../.env.example ../../.env
# عدّل DATABASE_URL ليشير لقاعدة بياناتك

# 2. شغّل قاعدة البيانات (Docker)
cd ../..
docker-compose up -d db

# 3. أنشئ الجداول
pnpm prisma:migrate

# 4. أنشئ Prisma Client
pnpm prisma:generate

# 5. أدخل البيانات الأولية (100 سؤال + مستخدمين تجريبيين)
pnpm prisma:seed
```

## المستخدمون التجريبيون

| الدور  | البريد                  | الهاتف        | كلمة المرور |
|--------|-------------------------|---------------|-------------|
| Admin  | admin@elitutor.org      | 0500000000    | admin123    |
| طالب   | student@elitutor.org    | 0501234567    | 1234        |
| ولي    | parent@elitutor.org     | 0509876543    | 1234        |

## أوامر مفيدة

```bash
pnpm prisma:studio    # واجهة مرئية لقاعدة البيانات
pnpm prisma:generate  # تحديث Prisma Client بعد تعديل schema
pnpm prisma:migrate   # تطبيق migrations جديدة
pnpm prisma:seed      # إعادة تهيئة البيانات الأولية
```

## الجداول الرئيسية

| الجدول | الوصف |
|--------|-------|
| users | المستخدمون (student/parent/admin/teacher) |
| student_profiles | ملفات الطلاب (XP, streak, gems) |
| parent_profiles | ملفات الأهل |
| subscriptions | اشتراكات Cardcom (بدل Stripe) |
| subjects | المواد (رياضيات/عربي/عبري/إنجليزي/علوم) |
| sections | الفصول (صف 1-12 لكل مادة) |
| units | الوحدات |
| levels | المستويات (XP reward) |
| lessons | الدروس |
| questions | الأسئلة (7 أنواع، محتوى JSON) |
| lesson_progresses | تقدم الطلاب |
| achievements | الإنجازات |
| notifications | الإشعارات |
| league_groups | مجموعات المنافسة |
