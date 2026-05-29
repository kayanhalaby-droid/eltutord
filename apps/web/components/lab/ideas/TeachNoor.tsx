'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import NoorOwl from '@/components/NoorOwl';

type Phase = 'intro' | 'recording' | 'result';

const CRITERIA = [
  { label: 'ذكرت المعنى الصحيح', ok: true },
  { label: 'الشرح واضح ومترابط', ok: true },
  { label: 'ذكرت مثالاً من الحياة', ok: false },
];

export function TeachNoor() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [seconds, setSeconds] = useState(0);

  const startRecording = () => {
    setPhase('recording');
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    (window as any).__labTimer = t;
  };

  const stopRecording = () => {
    clearInterval((window as any).__labTimer);
    setPhase('result');
  };

  if (phase === 'intro') return (
    <div className="space-y-4 text-center">
      <NoorOwl expression="sad" size={80} animate />
      <h3 className="font-bold text-xl">علّم نور</h3>
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-right">
        <p className="text-gray-700 text-sm leading-relaxed">
          نور تقول: <strong>"أنا لا أفهم كلمة אָחוֹת 😢 ممكن تشرح لي؟"</strong>
        </p>
      </div>
      <p className="text-gray-500 text-xs">كلّما شرحت بوضوح، كلّما ثبتت المعلومة في دماغك</p>
      <button onClick={startRecording} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
        🎤 ابدأ الشرح
      </button>
    </div>
  );

  if (phase === 'recording') return (
    <div className="space-y-4 text-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-200"
      >
        <span className="text-white text-2xl">🎤</span>
      </motion.div>
      <p className="font-black text-3xl text-gray-800 font-mono">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
      </p>
      <p className="font-bold text-gray-900">جارٍ التسجيل...</p>
      <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200 text-right">
        <p className="text-gray-600 text-sm">اشرح لنور: <strong>ما معنى אָחוֹת؟</strong></p>
        <p className="text-gray-400 text-xs mt-1">تلميح: اذكر المعنى، ثم مثالاً من حياتك</p>
      </div>
      <button onClick={stopRecording} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors">
        انتهيت ✓
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center">
        <NoorOwl expression="excited" size={80} animate />
      </div>
      <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
        <p className="text-4xl font-black text-green-600">85%</p>
        <p className="text-green-700 font-bold mt-1">نور فهمت شرحك! 🌟</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-2">
        <p className="text-xs text-gray-500 text-right font-medium mb-2">تقييم الشرح:</p>
        {CRITERIA.map((c, i) => (
          <div key={i} className="flex items-center gap-2 justify-end text-sm">
            <span className="text-gray-700">{c.label}</span>
            <span>{c.ok ? '✅' : '⚠️'}</span>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 rounded-xl p-3 text-right border border-orange-200">
        <p className="text-orange-700 text-xs font-medium">💡 للمرة القادمة: أضف مثالاً من حياتك</p>
        <p className="text-orange-500 text-xs mt-0.5">مثال: "أختي اسمها ليلى — וְהִיא הָאָחוֹת שֶׁלִי"</p>
      </div>

      <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-200">
        <p className="text-purple-700 font-bold">+150 XP + شارة "المعلم" 🏅</p>
      </div>

      <button onClick={() => setPhase('intro')} className="w-full border-2 border-purple-300 text-purple-600 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors">
        جرّب مرة أخرى
      </button>
    </motion.div>
  );
}
