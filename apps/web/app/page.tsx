'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';

/* ── Data ─────────────────────────────────────────── */

const SUBJECTS = [
  { emoji: '📖', name: 'اللغة العربية', desc: 'نحو، قراءة، كتابة، وإملاء', gradient: 'linear-gradient(135deg, #1A1F5E, #2D3580)', tag: 'الأكثر طلباً' },
  { emoji: '🔤', name: 'اللغة العبرية', desc: 'مفردات، قواعد، ومحادثة', gradient: 'linear-gradient(135deg, #1565C0, #0D47A1)', tag: 'جديد' },
  { emoji: '➗', name: 'الرياضيات',     desc: 'عمليات حسابية وحل مسائل', gradient: 'linear-gradient(135deg, #E65100, #BF360C)', tag: '' },
  { emoji: '🌍', name: 'اللغة الإنجليزية', desc: 'أساسيات وبناء مفردات', gradient: 'linear-gradient(135deg, #6A1B9A, #4A148C)', tag: '' },
];

const FEATURES = [
  { emoji: '🎮', title: 'تعلّم بالألعاب', desc: 'دروس تفاعلية بأسلوب ألعاب مصمّمة خصيصاً للأطفال' },
  { emoji: '🤖', title: 'مساعد ذكاء اصطناعي', desc: 'نور يشرح لكل طفل بأسلوبه الخاص ويتكيّف مع مستواه' },
  { emoji: '📊', title: 'تقارير للأهل', desc: 'تابع تقدّم طفلك بتقارير أسبوعية مفصّلة' },
  { emoji: '📚', title: 'منهاج إسرائيلي', desc: 'محتوى مُصمَّم وفق المنهاج الرسمي للمدارس العربية' },
  { emoji: '🔥', title: 'سلسلة يومية', desc: 'احتفظ بسلسلتك وتحفّز على التعلّم كل يوم' },
  { emoji: '🏆', title: 'الدوريات', desc: 'تنافس مع زملائك واصعد في جدول المتصدّرين' },
];

const TESTIMONIALS = [
  { name: 'أم أحمد', role: 'صف 3', text: 'ابني كان يكره المذاكرة. اليوم يطلب بنفسه يفتح التطبيق. التحوّل كان مذهلاً خلال أسبوعين فقط!' },
  { name: 'أب ليان', role: 'صف 5', text: 'نتائج بنتي تحسّنت من 70 لـ 94 في اللغة العربية. المنهج مرتبط بمنهاج المدرسة تماماً.' },
  { name: 'أم كريم', role: 'صف 2', text: 'البومة نور حلوة جداً وتشرح بأسلوب مبسّط. كريم لا يمل أبداً وبيتعلم وهو مبسوط.' },
];

/* ── Components ───────────────────────────────────── */

function FloatCard({ icon, value, label, delay = 0 }: { icon: string; value: string; label: string; delay?: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 min-w-[140px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-black text-[#1A1F5E] text-base leading-tight">{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ fontFamily: 'var(--font-cairo, Cairo, sans-serif)' }}>

      {/* ══════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <NoorOwl expression="happy" size={36} />
            <div>
              <p className="font-black text-[#1A1F5E] text-base leading-tight">الموجه الذكي</p>
              <p className="text-[10px] text-gray-400 leading-tight">منصة التعلم الذكي</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#subjects" className="text-sm font-bold text-gray-600 hover:text-[#1A1F5E] transition-colors">المواد</a>
            <a href="#features" className="text-sm font-bold text-gray-600 hover:text-[#1A1F5E] transition-colors">المميزات</a>
            <a href="#testimonials" className="text-sm font-bold text-gray-600 hover:text-[#1A1F5E] transition-colors">آراء الأهل</a>
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-gray-600 hover:text-[#1A1F5E] px-4 py-2 transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/onboarding"
              className="text-sm font-black text-[#1A1F5E] px-5 py-2.5 rounded-xl shadow-md transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FFD700, #F0C800)' }}
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section className="pt-[96px] pb-16 md:pt-[120px] md:pb-24 px-5"
          style={{ background: 'linear-gradient(160deg, #F5F6FA 0%, #EEF0FF 100%)' }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

            {/* Text side */}
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <span className="inline-block bg-[#FFD700] text-[#1A1F5E] text-xs font-black px-3 py-1.5 rounded-full mb-4 shadow-sm">
                  🎓 المنصة التعليمية رقم 1 للمدارس العربية في إسرائيل
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-[#1A1F5E] leading-tight mb-4">
                  تعلّم بطريقة<br />
                  <span style={{ background: 'linear-gradient(135deg, #FFD700, #F0A800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ممتعة وفعّالة
                  </span>
                </h1>
                <p className="text-gray-600 text-lg font-medium leading-relaxed mb-7 max-w-md">
                  منصة تعليمية تفاعلية مع المساعد الذكي <strong className="text-[#1A1F5E]">نور</strong>، تساعد طفلك على التفوّق في المدرسة بأسلوب ممتع كالألعاب.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 font-black text-[#1A1F5E] px-7 py-4 rounded-2xl shadow-lg text-base transition-transform hover:scale-[1.03] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #F0C800)' }}
                  >
                    ابدأ مجاناً ←
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-bold text-[#1A1F5E] px-7 py-4 rounded-2xl border-2 border-[#1A1F5E]/20 bg-white text-base hover:bg-[#EEF0FF] transition-colors"
                  >
                    لديّ حساب
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-4 mt-7 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">✅ <span>مجاناً للبدء</span></span>
                  <span className="flex items-center gap-1.5">✅ <span>بدون بطاقة ائتمان</span></span>
                  <span className="flex items-center gap-1.5">✅ <span>منهاج رسمي</span></span>
                </div>
              </motion.div>
            </div>

            {/* Owl side */}
            <div className="order-1 md:order-2 flex flex-col items-center justify-center relative">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.2 }}
                className="relative"
              >
                <NoorOwl expression="celebrating" size={220} animate loop />

                {/* Float cards */}
                <div className="absolute -top-4 -right-8 md:-right-16">
                  <FloatCard icon="👨‍👩‍👧‍👦" value="+275" label="طالب نشط" delay={0.5} />
                </div>
                <div className="absolute -bottom-2 -left-8 md:-left-12">
                  <FloatCard icon="⭐" value="4.9/5" label="تقييم الأهل" delay={0.7} />
                </div>
                <div className="absolute top-1/2 -right-4 md:-right-20 -translate-y-1/2">
                  <FloatCard icon="📚" value="156" label="درس متاح" delay={0.9} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════════════ */}
        <FadeInSection>
          <div style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3580)' }} className="py-8">
            <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '+275', label: 'طالب نشط' },
                { value: '4.9★', label: 'متوسط التقييم' },
                { value: '156', label: 'درس في المنهاج' },
                { value: '92%', label: 'نسبة التحسّن' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-black text-[#FFD700]">{s.value}</p>
                  <p className="text-white/70 text-sm font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* ══════════════════════════════════════════════
            SUBJECTS
        ══════════════════════════════════════════════ */}
        <section id="subjects" className="py-16 md:py-24 px-5 bg-[#F5F6FA]">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#1A1F5E] mb-3">المواد الدراسية</h2>
                <p className="text-gray-500 text-lg font-medium">محتوى شامل يغطّي جميع المواد الأساسية</p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SUBJECTS.map((s, i) => (
                <FadeInSection key={s.name} delay={i * 0.1}>
                  <motion.div
                    className="rounded-3xl p-6 text-white relative overflow-hidden cursor-pointer shadow-lg"
                    style={{ background: s.gradient, minHeight: 180 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    {s.tag && (
                      <span className="absolute top-4 left-4 bg-[#FFD700] text-[#1A1F5E] text-[10px] font-black px-2 py-0.5 rounded-full">
                        {s.tag}
                      </span>
                    )}
                    <span className="text-5xl leading-none block mb-3">{s.emoji}</span>
                    <h3 className="font-black text-xl mb-1">{s.name}</h3>
                    <p className="text-white/70 text-sm font-medium">{s.desc}</p>
                  </motion.div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════════ */}
        <section id="features" className="py-16 md:py-24 px-5 bg-white">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#1A1F5E] mb-3">لماذا الموجه الذكي؟</h2>
                <p className="text-gray-500 text-lg font-medium">كل ما يحتاجه طفلك للتفوّق في مكان واحد</p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <FadeInSection key={f.title} delay={i * 0.08}>
                  <motion.div
                    className="bg-[#F5F6FA] rounded-3xl p-6 hover:bg-[#EEF0FF] transition-colors group"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <span className="text-4xl leading-none block mb-4">{f.emoji}</span>
                    <h3 className="font-black text-lg text-[#1A1F5E] mb-2">{f.title}</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <FadeInSection>
          <section className="py-16 md:py-24 px-5" style={{ background: 'linear-gradient(160deg, #EEF0FF, #F5F6FA)' }}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-black text-[#1A1F5E] mb-3">كيف يعمل؟</h2>
              <p className="text-gray-500 text-lg font-medium mb-12">ثلاث خطوات بسيطة للبدء</p>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: '1', emoji: '📝', title: 'أنشئ حساباً مجاناً', desc: 'سجّل في دقيقة واحدة وحدّد مستوى طفلك' },
                  { step: '2', emoji: '🎯', title: 'اختر المادة', desc: 'ابدأ بأي مادة وتابع خطة التعلّم المخصّصة' },
                  { step: '3', emoji: '🏆', title: 'تقدّم وتألّق', desc: 'اكسب نقاط وشارات وتصعّد في الدوريات' },
                ].map((s, i) => (
                  <motion.div
                    key={s.step}
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3580)' }}
                    >
                      {s.emoji}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center font-black text-[#1A1F5E] text-sm -mt-1 shadow">
                      {s.step}
                    </div>
                    <h3 className="font-black text-[#1A1F5E] text-lg">{s.title}</h3>
                    <p className="text-gray-500 font-medium text-sm">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* ══════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════ */}
        <section id="testimonials" className="py-16 md:py-24 px-5 bg-white">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#1A1F5E] mb-3">ماذا يقول الأهل؟</h2>
                <p className="text-gray-500 text-lg font-medium">قصص نجاح حقيقية من أهالي طلابنا</p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <FadeInSection key={t.name} delay={i * 0.1}>
                  <motion.div
                    className="bg-[#F5F6FA] rounded-3xl p-6 flex flex-col gap-4 h-full"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-[#FFD700] text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <div className="w-10 h-10 rounded-full bg-[#1A1F5E] flex items-center justify-center text-white font-black text-sm shrink-0">
                        {t.name.slice(1, 3)}
                      </div>
                      <div>
                        <p className="font-black text-[#1A1F5E] text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs">ولي أمر — {t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════ */}
        <FadeInSection>
          <section
            className="py-16 md:py-24 px-5 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1A1F5E 0%, #2D3580 60%, #1565C0 100%)' }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: '#FFD700', filter: 'blur(80px)', transform: 'translate(30%, -40%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
              style={{ background: '#22C55E', filter: 'blur(60px)', transform: 'translate(-30%, 40%)' }} />

            <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center gap-6">
              <NoorOwl expression="celebrating" size={120} animate loop />
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                ابدأ رحلة التعلّم<br />
                <span className="text-[#FFD700]">اليوم مجاناً!</span>
              </h2>
              <p className="text-white/70 text-lg font-medium max-w-md">
                انضم لأكثر من 275 طالب وطالبة يتعلّمون مع نور كل يوم
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 font-black text-[#1A1F5E] px-10 py-4 rounded-2xl shadow-2xl text-lg transition-transform hover:scale-[1.05] active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #FFD700, #F0C800)' }}
              >
                ابدأ مجاناً ←
              </Link>
              <p className="text-white/40 text-sm">لا حاجة لبطاقة ائتمان · بدون التزام</p>
            </div>
          </section>
        </FadeInSection>

      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-[#0F1340] py-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <NoorOwl expression="happy" size={36} />
              <div>
                <p className="font-black text-white text-base leading-tight">الموجه الذكي</p>
                <p className="text-[10px] text-white/40 leading-tight">منصة التعلم الذكي</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {[
                { label: 'الرئيسية', href: '/' },
                { label: 'المواد',  href: '#subjects' },
                { label: 'المميزات', href: '#features' },
                { label: 'تسجيل الدخول', href: '/login' },
                { label: 'ابدأ مجاناً', href: '/onboarding' },
              ].map(l => (
                <a key={l.label} href={l.href} className="text-white/50 hover:text-white text-sm font-medium transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs font-medium">© 2026 الموجه الذكي. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
