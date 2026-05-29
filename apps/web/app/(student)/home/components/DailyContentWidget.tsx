'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';

interface DailyContent {
  date: string;
  wordOfDay: { word: string; meaning: string; example: string; subject: string };
  challenge: { question: string; answer: string; hint: string; duration: number };
  funFact: { text: string; emoji: string; source: string };
}

export default function DailyContentWidget() {
  const { token } = useAuthStore();
  const [activePanel, setActivePanel] = useState<'word' | 'challenge' | 'fact'>('word');
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeRevealed, setChallengeRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const { data } = useQuery<DailyContent>({
    queryKey: ['dailyContent'],
    queryFn: () => apiFetch('/curriculum/daily-content', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (!data) return null;

  const startChallenge = () => {
    setChallengeStarted(true);
    setTimeLeft(data.challenge.duration);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const PANELS = [
    { id: 'word', icon: '📖', label: 'كلمة اليوم' },
    { id: 'challenge', icon: '⚡', label: 'تحدي ٦٠ ث' },
    { id: 'fact', icon: '🌟', label: 'هل تعلم؟' },
  ] as const;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border-2 border-[#1A1F5E]/10 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-[#1A1F5E] px-4 py-3 flex items-center justify-between">
        <p className="text-[#FFD700] font-extrabold text-sm">🌟 اليوم — تعلّم في دقيقة</p>
        <p className="text-white/50 text-xs">{new Date(data.date).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      </div>

      {/* Panel selector */}
      <div className="flex border-b border-gray-100">
        {PANELS.map(p => (
          <button
            key={p.id}
            className={`flex-1 py-2.5 text-xs font-bold flex flex-col items-center gap-0.5 transition-colors
              ${activePanel === p.id ? 'text-[#1A1F5E] border-b-2 border-[#1A1F5E] -mb-px' : 'text-gray-400'}`}
            onClick={() => setActivePanel(p.id)}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">

          {/* Word of the day */}
          {activePanel === 'word' && (
            <motion.div
              key="word"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                  {data.wordOfDay.subject}
                </span>
              </div>
              <div className="text-center py-2">
                <p className="text-3xl font-extrabold text-[#1A1F5E]">{data.wordOfDay.word}</p>
                <p className="text-sm text-gray-600 mt-1">{data.wordOfDay.meaning}</p>
              </div>
              <div className="bg-[#1A1F5E]/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">مثال:</p>
                <p className="text-sm font-semibold text-gray-800">"{data.wordOfDay.example}"</p>
              </div>
            </motion.div>
          )}

          {/* 60s challenge */}
          {activePanel === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <div className="text-center py-2">
                <p className="text-base font-extrabold text-[#1A1F5E]">{data.challenge.question}</p>
              </div>

              {!challengeStarted && !challengeRevealed && (
                <button
                  className="w-full py-3 bg-[#1A1F5E] text-[#FFD700] font-bold rounded-xl"
                  onClick={startChallenge}
                >
                  ابدأ التحدي ⚡
                </button>
              )}

              {challengeStarted && !challengeRevealed && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-400 rounded-full"
                        animate={{ width: `${(timeLeft / data.challenge.duration) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>
                    <span className={`mr-3 font-extrabold text-sm ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center font-bold focus:border-[#1A1F5E] outline-none"
                    placeholder="إجابتك..."
                    value={challengeAnswer}
                    onChange={e => setChallengeAnswer(e.target.value)}
                    dir="rtl"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-3 bg-[#1A1F5E] text-white font-bold rounded-xl"
                      onClick={() => setChallengeRevealed(true)}
                    >
                      تحقق
                    </button>
                    {!showHint && (
                      <button
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-600"
                        onClick={() => setShowHint(true)}
                      >
                        💡
                      </button>
                    )}
                  </div>
                  {showHint && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-2 text-center">
                      💡 {data.challenge.hint}
                    </p>
                  )}
                </div>
              )}

              {challengeRevealed && (
                <div className="flex flex-col gap-2">
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 font-bold mb-1">الإجابة الصحيحة</p>
                    <p className="text-lg font-extrabold text-green-700">{data.challenge.answer}</p>
                  </div>
                  {challengeAnswer && (
                    <p className={`text-center text-sm font-bold ${
                      challengeAnswer.trim() === data.challenge.answer.trim() ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {challengeAnswer.trim() === data.challenge.answer.trim() ? '🎉 أحسنت!' : '🧠 دماغك ينمو!'}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Fun fact */}
          {activePanel === 'fact' && (
            <motion.div
              key="fact"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <div className="text-center py-3">
                <span className="text-5xl">{data.funFact.emoji}</span>
              </div>
              <p className="text-base font-bold text-[#1A1F5E] text-center leading-relaxed">
                {data.funFact.text}
              </p>
              <p className="text-xs text-muted-foreground text-center">المصدر: {data.funFact.source}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
