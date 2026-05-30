import Link from 'next/link';

export const metadata = {
  title: 'شروط الاستخدام — EliTutor',
  description: 'شروط وأحكام استخدام منصة EliTutor التعليمية',
};

const SECTIONS = [
  {
    title: 'قبول شروط الاستخدام',
    content: `باستخدامك منصة EliTutor، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت تسجل لطفل قاصر، فأنت توافق نيابةً عنه وتتحمل المسؤولية الكاملة.`,
  },
  {
    title: 'وصف الخدمة',
    content: `EliTutor منصة تعليمية تفاعلية مخصصة للطلاب العرب في إسرائيل. تقدم المنصة:
• دروساً تفاعلية في الرياضيات والعربية والعلوم والإنجليزية
• نظام تشجيع ومكافآت يومية
• تقارير تقدم للوالدين
• مساعد ذكاء اصطناعي تعليمي (NoorOwl)`,
  },
  {
    title: 'الاشتراك والمدفوعات',
    content: `تقدم المنصة خططاً مدفوعة:
• الخطة الأساسية (Basic): وصول محدود
• خطة Elite: وصول كامل للمنهج
• خطة VIP: كل الميزات + دعم أولوية

تُعالج جميع المدفوعات بأمان عبر Cardcom. يمكن إلغاء الاشتراك في أي وقت؛ لا يُسترد الرسوم المدفوعة عن الفترة الحالية. الأسعار قابلة للتعديل مع إشعار مسبق 30 يوماً.`,
  },
  {
    title: 'المحتوى وحقوق الملكية',
    content: `جميع المحتويات التعليمية (نصوص، صور، فيديو، أسئلة) محمية بحقوق الملكية الفكرية لـ EliTutor. لا يُسمح بنسخ أو توزيع أي محتوى دون إذن كتابي مسبق.`,
  },
  {
    title: 'قواعد السلوك',
    content: `يُحظر على المستخدمين:
• مشاركة بيانات الدخول مع الآخرين
• استخدام المنصة لأغراض غير تعليمية
• محاولة اختراق أو تعطيل المنصة
• انتهاك خصوصية المستخدمين الآخرين

مخالفة هذه القواعد قد تؤدي إلى إيقاف الحساب.`,
  },
  {
    title: 'إخلاء المسؤولية',
    content: `تُقدَّم الخدمة "كما هي". لا تضمن EliTutor نتائج تعليمية محددة. لا نتحمل المسؤولية عن أي أضرار غير مباشرة ناتجة عن استخدام المنصة.`,
  },
  {
    title: 'التواصل معنا',
    content: `لأي استفسارات قانونية أو شكاوى:
• البريد الإلكتروني: legal@elitutor.com
• يُعدّ اختصاص المحاكم الإسرائيلية مختصاً بأي نزاعات`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
            ← العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-black">شروط الاستخدام</h1>
          <p className="text-white/60 mt-2 text-sm">آخر تحديث: مايو 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-extrabold text-[#1A1F5E] mb-3">{sec.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{sec.content}</p>
          </section>
        ))}

        <p className="text-center text-xs text-gray-400">
          © 2026 EliTutor — الموجه الذكي.{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">سياسة الخصوصية</Link>
        </p>
      </main>
    </div>
  );
}
