import Link from 'next/link';

export const metadata = {
  title: 'سياسة الخصوصية — EliTutor',
  description: 'سياسة الخصوصية وحماية بيانات الأطفال (COPPA)',
};

const SECTIONS = [
  {
    title: 'مقدمة',
    content: `مرحباً بكم في EliTutor — الموجه الذكي. نحن نأخذ خصوصية أطفالكم على محمل الجد. تصف هذه السياسة كيفية جمعنا للمعلومات واستخدامها وحمايتها وفقاً لـ قانون حماية خصوصية الأطفال عبر الإنترنت (COPPA) والتشريعات الإسرائيلية ذات الصلة.`,
  },
  {
    title: 'المعلومات التي نجمعها',
    content: `نجمع المعلومات الضرورية فقط لتشغيل الخدمة التعليمية:
• الاسم وعنوان البريد الإلكتروني (للوالدين/الأوصياء)
• المستوى الدراسي وتقدم التعلم
• بيانات الاستخدام واللعب (النتائج، الخطوط الزمنية)
• معلومات الاشتراك ومعالجة المدفوعات عبر Cardcom

لا نجمع أي بيانات حساسة من الأطفال دون موافقة صريحة من الوالدين.`,
  },
  {
    title: 'حماية خصوصية الأطفال (COPPA)',
    content: `وفقاً لـ COPPA ومتطلبات حماية الأطفال:
• لا نجمع معلومات شخصية من الأطفال دون الثالثة عشرة دون موافقة الوالدين
• يتحكم الوالدون/الأوصياء الكاملون في بيانات أطفالهم
• يمكن للوالدين طلب مراجعة أو حذف بيانات أطفالهم في أي وقت
• لا نشارك البيانات مع جهات تسويقية خارجية
• يتم تشفير جميع البيانات أثناء النقل والتخزين`,
  },
  {
    title: 'كيف نستخدم البيانات',
    content: `• تخصيص تجربة التعلم وفق مستوى الطالب
• إرسال تقارير التقدم للوالدين
• تحسين المنهج الدراسي والمحتوى
• معالجة الاشتراكات والمدفوعات
• الاتصال بك في حالات الدعم الفني`,
  },
  {
    title: 'حقوق الوالدين والأوصياء',
    content: `يحق لكم كوالدين أو أوصياء:
• الاطلاع على البيانات الشخصية التي جمعناها عن أطفالكم
• تصحيح أي معلومات غير دقيقة
• طلب حذف بيانات أطفالكم بالكامل
• سحب الموافقة على معالجة البيانات

لممارسة هذه الحقوق، تواصلوا معنا عبر: privacy@elitutor.com`,
  },
  {
    title: 'الاتصال بنا',
    content: `إذا كان لديكم أسئلة حول سياسة الخصوصية أو بيانات أطفالكم:
• البريد الإلكتروني: privacy@elitutor.com
• خلال 30 يوماً من الطلب، سنرد على جميع الاستفسارات المتعلقة بالخصوصية`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
            ← العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-black">سياسة الخصوصية</h1>
          <p className="text-white/60 mt-2 text-sm">آخر تحديث: مايو 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* COPPA badge */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">🛡️</span>
          <div>
            <p className="font-extrabold text-blue-800 text-sm">متوافق مع COPPA</p>
            <p className="text-xs text-blue-600 mt-1">
              نلتزم بقانون حماية خصوصية الأطفال عبر الإنترنت (COPPA) وجميع اللوائح الإسرائيلية لحماية بيانات الأطفال.
            </p>
          </div>
        </div>

        {SECTIONS.map((sec) => (
          <section key={sec.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-extrabold text-[#1A1F5E] mb-3">{sec.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{sec.content}</p>
          </section>
        ))}

        <p className="text-center text-xs text-gray-400">
          © 2026 EliTutor — الموجه الذكي. جميع الحقوق محفوظة.{' '}
          <Link href="/terms" className="underline hover:text-gray-600">شروط الاستخدام</Link>
        </p>
      </main>
    </div>
  );
}
