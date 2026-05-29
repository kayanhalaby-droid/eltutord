'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'view' | 'recording' | 'done';

const PAST_CAPSULE = {
  date: 'منذ 3 أسابيع',
  text: '"أنا خايف من وحدة البلاغة... صعبة جداً وما فاهم إيش يعني مجاز 😟"',
  unit: 'البلاغة العربية',
};

export function TimeCapsule() {
  const [phase, setPhase] = useState<Phase>('view');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl">⏰</span>
        <h3 className="font-bold text-xl mt-2">كبسولة الزمن</h3>
        <p className="text-gray-500 text-sm mt-1">رسائل من نفسك الماضية</p>
      </div>

      {/* رسالة الماضي */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute top-2 left-2 text-3xl opacity-20">📼</div>
        <p className="text-xs text-amber-600 font-medium mb-2">📼 رسالة أنت من {PAST_CAPSULE.date}:</p>
        <p className="text-gray-700 italic text-sm text-right leading-relaxed">{PAST_CAPSULE.text}</p>
        <p className="text-xs text-amber-400 mt-2 text-right">{PAST_CAPSULE.unit}</p>
      </div>

      {/* الحاضر */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
      >
        <p className="text-green-700 font-bold">الآن أتقنت هذه الوحدة! ✅</p>
        <p className="text-green-600 text-sm mt-1">
          حصلت على <strong>94%</strong> في اختبار البلاغة 💪
        </p>
        <p className="text-green-400 text-xs mt-1">انظر كيف تطورت من خوف إلى إتقان!</p>
      </motion.div>

      {/* تسجيل رسالة جديدة */}
      <AnimatePresence mode="wait">
        {phase === 'view' && (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPhase('recording')}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            🎤 سجّل رسالة للمستقبل
          </motion.button>
        )}

        {phase === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-purple-50 rounded-xl p-4 border border-purple-200 space-y-3"
          >
            <p className="text-purple-700 text-sm text-center font-medium">
              ستصلك هذه الرسالة عند إكمال الوحدة القادمة!
            </p>
            <textarea
              className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-400 text-right"
              rows={3}
              placeholder="كيف تشعر الآن؟ ما الذي تخشاه؟ ما أمنيتك؟..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              dir="rtl"
            />
            <div className="flex gap-2">
              <button onClick={() => setPhase('view')} className="flex-1 border-2 border-gray-200 text-gray-500 py-2 rounded-xl text-sm font-bold">إلغاء</button>
              <button
                onClick={() => setPhase('done')}
                disabled={message.length < 5}
                className="flex-[2] bg-purple-600 text-white py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors"
              >
                حفظ الرسالة 💌
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-purple-600 rounded-xl p-4 text-white text-center space-y-2"
          >
            <span className="text-3xl">💌</span>
            <p className="font-bold">تم حفظ الرسالة!</p>
            <p className="text-purple-200 text-xs">ستجدها هنا عند إكمال الوحدة القادمة</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
