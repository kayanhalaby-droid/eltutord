'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const SUBJECTS = [
  { name: 'عربي',       progress: 80, color: 'bg-blue-500',   status: '🟢', tip: 'ممتاز — حافظ على الوتيرة' },
  { name: 'עברית',      progress: 60, color: 'bg-indigo-500', status: '🟡', tip: 'يحتاج تعزيز في القواعد' },
  { name: 'رياضيات',   progress: 40, color: 'bg-orange-500', status: '🔴', tip: '⚠️ يحتاج اهتماماً عاجلاً' },
  { name: 'English',    progress: 70, color: 'bg-purple-500', status: '🟡', tip: 'تحسّن — ركّز على المفردات' },
];

const DAYS_LEFT = 247;
const WEEKS_LEFT = Math.floor(DAYS_LEFT / 7);

export function WarRoom() {
  const [selected, setSelected] = useState<number | null>(null);

  const urgent = SUBJECTS.filter(s => s.progress < 50);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl">🗺️</span>
        <h3 className="font-bold text-xl mt-2">غرفة الحرب</h3>
      </div>

      {/* العد التنازلي */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-3 text-white text-center">
        <p className="text-red-100 text-xs">البجروت بعد</p>
        <p className="font-black text-3xl">{DAYS_LEFT}</p>
        <p className="text-red-100 text-xs">يوم ({WEEKS_LEFT} أسبوع)</p>
      </div>

      {/* شرائط التقدم */}
      <div className="space-y-2">
        {SUBJECTS.map((s, i) => (
          <motion.div
            key={i}
            layout
            onClick={() => setSelected(selected === i ? null : i)}
            className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span>{s.status}</span>
                <span className="text-sm font-bold text-gray-500">{s.progress}%</span>
              </div>
              <span className="font-bold text-gray-900">{s.name}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.progress}%` }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`${s.color} h-2.5 rounded-full`}
              />
            </div>
            {selected === i && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-gray-500 mt-2 text-right"
              >
                {s.tip}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      {/* تحذيرات عاجلة */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
          <p className="text-red-700 font-bold text-sm text-right">⚠️ يحتاج تدخلاً عاجلاً:</p>
          {urgent.map((s, i) => (
            <p key={i} className="text-red-500 text-xs text-right">
              • {s.name}: {s.progress}% — {WEEKS_LEFT} أسبوع فقط متبقٍ
            </p>
          ))}
        </div>
      )}

      {/* خطة الأسبوع المقترحة */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-blue-700 font-bold text-sm text-right mb-2">📋 خطة هذا الأسبوع:</p>
        <div className="space-y-1 text-right">
          {[
            { day: 'الأحد', task: 'رياضيات — وحدة الجبر' },
            { day: 'الاثنين', task: 'עברית — قواعد الفعل' },
            { day: 'الثلاثاء', task: 'رياضيات — مراجعة' },
          ].map((p, i) => (
            <p key={i} className="text-blue-600 text-xs">
              <strong>{p.day}:</strong> {p.task}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
