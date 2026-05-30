'use client';

import { motion } from 'framer-motion';
import NoorOwl from './NoorOwl';

interface Props {
  plan: string;
  onContinue: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  BASIC: 'الأساسية',
  ELITE: 'المتميزة',
  VIP: 'VIP',
};

export default function SubscriptionCelebrationModal({ plan, onContinue }: Props) {
  const label = PLAN_LABELS[plan?.toUpperCase()] ?? plan;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl text-center"
        initial={{ scale: 0.5, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <NoorOwl expression="proud" size={110} animate />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-extrabold text-[#1A1F5E]">مبروك! 🎉</h2>
          <p className="text-[#FFD700] font-bold text-lg mt-1">باقة {label}</p>
          <p className="text-gray-600 text-sm mt-3">
            أصبحت الآن عضوًا مميزًا في EliTutor. استمتع بالوصول الكامل لجميع المحتويات والأدوات!
          </p>
        </motion.div>

        <div className="bg-[#1A1F5E]/5 rounded-2xl p-4 w-full text-right">
          <ul className="text-sm text-gray-700 flex flex-col gap-1">
            <li>🎯 وصول كامل لجميع الوحدات</li>
            <li>❤️ قلوب لا محدودة</li>
            <li>🤖 مساعد AI مخصص</li>
            <li>📊 تقارير أسبوعية للأهل</li>
          </ul>
        </div>

        <motion.button
          className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow-lg"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={onContinue}
        >
          ابدأ التعلم الآن! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
