'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NoorOwl from './NoorOwl';

type PaywallTrigger = 'hearts-empty' | 'unit-3' | 'streak-7' | 'quiz-95';

interface Props {
  trigger: PaywallTrigger;
  onClose: () => void;
  onContinueGuest?: () => void;
}

const TRIGGER_COPY: Record<PaywallTrigger, { title: string; body: string; icon: string }> = {
  'hearts-empty': {
    title: 'نفدت قلوبك 💔',
    body: 'اشترك الآن لتحصل على قلوب لا محدودة وتكمل تعلّمك بلا توقف!',
    icon: '❤️',
  },
  'unit-3': {
    title: 'وصلت للوحدة الثالثة! 🎯',
    body: 'أنت تتقدم بسرعة! فتح باقي الوحدات يتطلب اشتراكاً.',
    icon: '🔓',
  },
  'streak-7': {
    title: 'سلسلة ٧ أيام! 🔥',
    body: 'أنت ملتزم جداً! اشترك للحفاظ على سلسلتك وكسب مكافآت إضافية.',
    icon: '🔥',
  },
  'quiz-95': {
    title: 'نتيجة رائعة! ⭐',
    body: 'حصلت على ٩٥٪ أو أكثر! اشترك للوصول لمحتوى متقدم يناسب مستواك.',
    icon: '🌟',
  },
};

export default function PaywallModal({ trigger, onClose, onContinueGuest }: Props) {
  const router = useRouter();
  const copy = TRIGGER_COPY[trigger];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-7 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl text-center"
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <NoorOwl expression="proud" size={90} animate />
        </motion.div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1F5E]">{copy.title}</h2>
          <p className="text-muted-foreground text-sm mt-2">{copy.body}</p>
        </div>

        <div className="bg-[#1A1F5E]/5 rounded-2xl p-4 w-full">
          <p className="text-xs font-bold text-[#1A1F5E] mb-2">ما ستحصل عليه:</p>
          <ul className="text-sm text-gray-700 flex flex-col gap-1 text-right">
            <li>✅ قلوب لا محدودة</li>
            <li>✅ جميع الوحدات والدروس</li>
            <li>✅ تقارير أسبوعية للأهل</li>
            <li>✅ مساعد AI مخصص</li>
          </ul>
        </div>

        <motion.button
          className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow-lg"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/subscription')}
        >
          اشترك الآن — ١٩٩ ₪/شهر
        </motion.button>

        {onContinueGuest && (
          <button
            className="text-sm text-muted-foreground underline underline-offset-2"
            onClick={onContinueGuest}
          >
            متابعة بدون اشتراك (محدود)
          </button>
        )}

        <button
          className="text-xs text-gray-400"
          onClick={onClose}
        >
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  );
}
