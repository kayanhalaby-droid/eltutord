'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  { q: 'ما معنى אָחוֹת؟', options: ['أخت', 'أخ', 'أم', 'أب'], correct: 0 },
  { q: 'ما معنى מִשְׁפָּחָה؟', options: ['مدرسة', 'عائلة', 'بيت', 'كتاب'], correct: 1 },
  { q: 'ما معنى כֶּלֶב؟', options: ['قطة', 'فيل', 'كلب', 'طائر'], correct: 2 },
];

type Phase = 'intro' | 'battle' | 'win' | 'lose';

export function BossBattle() {
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const reset = () => { setBossHP(100); setPlayerHP(100); setPhase('intro'); setCurrentQ(0); };

  const answer = (idx: number) => {
    const isCorrect = idx === QUESTIONS[currentQ].correct;
    setFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFlash(null);
      if (isCorrect) {
        const nb = Math.max(0, bossHP - 34);
        setBossHP(nb);
        if (nb === 0) { setPhase('win'); return; }
      } else {
        const np = Math.max(0, playerHP - 34);
        setPlayerHP(np);
        if (np === 0) { setPhase('lose'); return; }
      }
      setCurrentQ(q => Math.min(q + 1, QUESTIONS.length - 1));
    }, 600);
  };

  if (phase === 'intro') return (
    <div className="text-center space-y-4">
      <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 }}>
        <span className="text-7xl block">👺</span>
      </motion.div>
      <h3 className="font-black text-xl text-red-600">سارق المعرفة ظهر!</h3>
      <p className="text-gray-600 text-sm leading-relaxed">سرق كل كلمات وحدة العائلة!<br />أجب بشكل صحيح لاسترداد المعرفة.</p>
      <button onClick={() => setPhase('battle')} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
        ابدأ المعركة ⚔️
      </button>
    </div>
  );

  if (phase === 'win') return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-3">
      <span className="text-6xl block">🏆</span>
      <h3 className="font-black text-2xl text-green-600">انتصرت!</h3>
      <p className="text-gray-600">حررت المعرفة المسروقة!</p>
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
        <p className="font-bold text-amber-700">+200 💎 جوهرة</p>
      </div>
      <button onClick={reset} className="w-full bg-green-500 text-white py-2 rounded-xl text-sm font-bold">العب مرة أخرى</button>
    </motion.div>
  );

  if (phase === 'lose') return (
    <div className="text-center space-y-3">
      <span className="text-6xl block">😢</span>
      <h3 className="font-black text-xl text-gray-700">الزعيم لا يزال قوياً</h3>
      <p className="text-gray-500 text-sm">راجع الوحدة وحاول مرة أخرى</p>
      <button onClick={reset} className="w-full bg-gray-800 text-white py-2 rounded-xl font-bold">حاول مرة أخرى</button>
    </div>
  );

  const q = QUESTIONS[currentQ % QUESTIONS.length];
  return (
    <div className={`space-y-3 transition-colors duration-300 rounded-xl p-1 ${flash === 'correct' ? 'bg-green-50' : flash === 'wrong' ? 'bg-red-50' : ''}`}>
      <div className="space-y-2">
        {[{ label: 'أنت ❤️', hp: playerHP, color: 'bg-green-500' }, { label: '👺 الزعيم', hp: bossHP, color: 'bg-red-500', reverse: true }].map(({ label, hp, color, reverse }) => (
          <div key={label}>
            <div className={`flex justify-between text-xs text-gray-500 mb-1 ${reverse ? 'flex-row-reverse' : ''}`}>
              <span>{label}</span><span>{hp}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <motion.div animate={{ width: `${hp}%` }} transition={{ duration: 0.4 }} className={`${color} h-3 rounded-full`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">سؤال {currentQ + 1} / {QUESTIONS.length}</p>
        <p className="font-bold text-gray-900 text-lg">{q.q}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(i)} disabled={!!flash}
            className="bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl py-3 font-medium transition-all text-sm disabled:opacity-60">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
