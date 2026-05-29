'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_MISTAKES = [
  { word: 'אָחוֹת', wrong: 'אָח', correct: 'אָחוֹת', date: 'أمس', mastered: true },
  { word: 'מִשְׁפָּחָה', wrong: 'מִשְׁפָּח', correct: 'מִשְׁפָּחָה', date: 'منذ 3 أيام', mastered: false },
  { word: 'بَقَرَةٌ', wrong: 'بَقَر', correct: 'بَقَرَةٌ', date: 'الأسبوع الماضي', mastered: true },
];

export function MistakeMuseum() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl">🏛️</span>
        <h3 className="font-bold text-xl mt-2">مُتْحَف أَخْطَائِك</h3>
        <p className="text-gray-500 text-sm mt-1">كل خطأ = قطعة أثرية تعلّمتها</p>
      </div>

      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
        <p className="text-2xl font-black text-amber-700">{MOCK_MISTAKES.length}</p>
        <p className="text-amber-600 text-xs">قطعة أثرية في متحفك</p>
      </div>

      <div className="space-y-2">
        {MOCK_MISTAKES.map((m, i) => (
          <motion.div
            key={i}
            layout
            onClick={() => setFlipped(flipped === i ? null : i)}
            className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer select-none"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.mastered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {m.mastered ? '✅ أتقنتها' : '🔄 جارٍ'}
              </span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{m.word}</p>
                <p className="text-xs text-red-400 line-through">كتبت: {m.wrong}</p>
                <p className="text-xs text-gray-400">{m.date}</p>
              </div>
            </div>
            {flipped === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 pt-2 border-t border-gray-100 text-right"
              >
                <p className="text-xs text-gray-500">الصواب:</p>
                <p className="font-bold text-green-600 text-lg">{m.correct}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-purple-50 rounded-xl p-3 text-center">
        <p className="text-purple-700 text-sm font-medium">💡 كل خطأ = دماغك يقوى</p>
      </div>
    </div>
  );
}
