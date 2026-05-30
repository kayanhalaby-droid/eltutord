'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NoorOwl from './NoorOwl';

interface Props {
  subject: string | null;
  grade: number | null;
  placementLevel: string;
  lessonsCompleted: number;
  onRegister: () => void;
}

export default function GuestPaywallModal({ subject, grade, placementLevel, lessonsCompleted, onRegister }: Props) {
  const router = useRouter();

  const levelLabel =
    placementLevel === 'advanced' ? 'متقدم' :
    placementLevel === 'intermediate' ? 'متوسط' : 'مبتدئ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
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
          <h2 className="text-2xl font-extrabold text-[#1A1F5E]">أتممت {lessonsCompleted} دروس! 🎉</h2>
          <p className="text-muted-foreground text-sm mt-2">
            سجّل الآن لحفظ تقدمك وفتح المزيد من الدروس
          </p>
        </div>

        {(subject || grade) && (
          <div className="bg-[#1A1F5E]/5 rounded-2xl p-4 w-full">
            <p className="text-xs font-bold text-[#1A1F5E] mb-2">ملفك التعليمي:</p>
            <div className="flex flex-col gap-1 text-sm text-gray-700 text-right">
              {subject && <span>📚 المادة: {subject}</span>}
              {grade && <span>🎓 الصف: {grade}</span>}
              <span>📊 المستوى: {levelLabel}</span>
            </div>
          </div>
        )}

        <motion.button
          className="w-full py-4 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl text-lg shadow-lg"
          whileTap={{ scale: 0.97 }}
          onClick={onRegister}
        >
          سجّل واحفظ تقدمك ←
        </motion.button>

        <button
          className="text-sm text-muted-foreground underline underline-offset-2"
          onClick={() => router.push('/onboarding')}
        >
          إعادة الاختبار
        </button>
      </motion.div>
    </div>
  );
}
