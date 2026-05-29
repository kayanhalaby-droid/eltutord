'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LEVELS = [
  { label: 'سهل',    bet: 10,  reward: 15,  emoji: '🟢', color: 'border-green-300 bg-green-50',  text: 'text-green-700' },
  { label: 'متوسط', bet: 30,  reward: 60,  emoji: '🟡', color: 'border-yellow-300 bg-yellow-50', text: 'text-yellow-700' },
  { label: 'صعب',   bet: 50,  reward: 150, emoji: '🟠', color: 'border-orange-300 bg-orange-50', text: 'text-orange-700' },
  { label: 'أسطوري',bet: 100, reward: 500, emoji: '🔴', color: 'border-red-300 bg-red-50',       text: 'text-red-700' },
];

const QUESTION = {
  q: 'ما معنى מִשְׁפָּחָה؟',
  options: ['مدرسة', 'عائلة', 'بيت', 'كتاب'],
  correct: 1,
};

type Phase = 'bet' | 'question' | 'result';

export function DifficultyAuction() {
  const [gems, setGems] = useState(250);
  const [bet, setBet] = useState(0);
  const [reward, setReward] = useState(0);
  const [phase, setPhase] = useState<Phase>('bet');
  const [isCorrect, setIsCorrect] = useState(false);

  const placeBet = (level: typeof LEVELS[0]) => {
    setBet(level.bet);
    setReward(level.reward);
    setPhase('question');
  };

  const answer = (idx: number) => {
    const correct = idx === QUESTION.correct;
    setIsCorrect(correct);
    setGems(g => correct ? g + reward : g - bet);
    setPhase('result');
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'bet' && (
        <motion.div key="bet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
          <div className="text-center">
            <span className="text-4xl">💰</span>
            <h3 className="font-bold text-xl mt-2">مزاد الصعوبة</h3>
            <div className="bg-blue-50 rounded-xl p-3 mt-3 border border-blue-200">
              <p className="text-blue-700 font-black text-2xl">{gems} 💎</p>
              <p className="text-blue-500 text-xs">رصيدك الحالي</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm text-center">اختر الصعوبة وراهن جواهرك:</p>
          <div className="space-y-2">
            {LEVELS.map((l, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => placeBet(l)}
                disabled={gems < l.bet}
                className={`w-full border-2 rounded-xl p-3 ${l.color} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-black text-sm ${l.text}`}>اربح: +{l.reward} 💎</span>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className={`font-bold ${l.text}`}>{l.label}</p>
                      <p className="text-gray-500 text-xs">راهن: {l.bet} 💎</p>
                    </div>
                    <span className="text-xl">{l.emoji}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'question' && (
        <motion.div key="question" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            <p className="text-amber-700 text-sm font-medium">راهنت {bet} 💎 — إذا أجبت صح تربح {reward} 💎</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="font-bold text-lg text-gray-900">{QUESTION.q}</p>
          </div>
          <div className="space-y-2">
            {QUESTION.options.map((o, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => answer(i)}
                className="w-full bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl py-3 font-medium transition-all"
              >
                {o}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'result' && (
        <motion.div
          key="result"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4 text-center"
        >
          <span className="text-6xl block">{isCorrect ? '🎉' : '😔'}</span>
          <h3 className={`font-black text-2xl ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? 'صحيح!' : 'خطأ!'}
          </h3>
          <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-black text-2xl ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {isCorrect ? `+${reward}` : `-${bet}`} 💎
            </p>
            <p className="text-gray-600 text-sm mt-1">رصيدك الآن: <strong>{gems}</strong> 💎</p>
          </div>
          {!isCorrect && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-right">
              <p className="text-blue-700 text-sm font-medium">الجواب الصحيح: <strong>عائلة</strong></p>
            </div>
          )}
          <button onClick={() => { setPhase('bet'); setBet(0); }} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
            راهن مجدداً 💰
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
