'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { useDailyGoal } from '@/lib/hooks/useDailyGoal';
import { useStreak } from '@/lib/hooks/useStreak';
import { useXP } from '@/lib/hooks/useXP';
import NoorOwl from '@/components/NoorOwl';
import { LearningPath } from './components/LearningPath';
import StreakMilestoneModal from './components/StreakMilestoneModal';
import StreakBrokenModal from './components/StreakBrokenModal';
import DailyQuests from './components/DailyQuests';
import FlashcardsWidget from './components/FlashcardsWidget';
import MetzavCountdown from './components/MetzavCountdown';
import EncouragementModal from './components/EncouragementModal';
import DailyContentWidget from './components/DailyContentWidget';

interface Encouragement { id: string; message: string; gems: number; fromName: string }
interface Subject { id: string; name: string; lessonCount?: number; masteryPercent?: number }

const SUBJECT_THEMES: Record<string, { icon: string; from: string; to: string }> = {
  'عربي':     { icon: '✍️', from: '#1A1F5E', to: '#2D3580' },
  'عبري':     { icon: 'א',  from: '#1565C0', to: '#0D47A1' },
  'رياضيات': { icon: '🔢', from: '#E65100', to: '#BF360C' },
  'إنجليزي': { icon: '🌍', from: '#6A1B9A', to: '#4A148C' },
  'علوم':     { icon: '🔬', from: '#00695C', to: '#004D40' },
};

function StatCard({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="ds-stat">
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-xl font-black text-gray-900 leading-tight tabular-nums">{value}</span>
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
    </div>
  );
}

export default function StudentHomePage() {
  const { user, token } = useAuthStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const learningPathRef = useRef<HTMLDivElement>(null);
  const [milestoneData, setMilestoneData] = useState<{ milestone: number; whatsappSent: boolean } | null>(null);
  const [streakModal, setStreakModal] = useState<'at-risk' | 'broken' | null>(null);
  const [activeEncouragement, setActiveEncouragement] = useState<Encouragement | null>(null);

  const { streakAtRisk, brokenStreak, streak } = useStreak();
  const { data: dailyGoal } = useDailyGoal();
  const { xp: xpData } = useXP();

  const { data: encouragementsData } = useQuery<{ encouragements: Encouragement[] }>({
    queryKey: ['pendingEncouragements'],
    queryFn: () => apiFetch('/gamification/encouragements/pending', { token: token! }),
    enabled: !!token,
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const { data: gemsData } = useQuery<{ gems: number }>({
    queryKey: ['gems'],
    queryFn: () => apiFetch('/gamification/gems', { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
  });

  useEffect(() => {
    const first = encouragementsData?.encouragements?.[0];
    if (first && !activeEncouragement) setActiveEncouragement(first);
  }, [encouragementsData]);

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingStreakMilestone');
    if (raw) {
      try { setMilestoneData(JSON.parse(raw)); } catch {}
      sessionStorage.removeItem('pendingStreakMilestone');
    }
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    if (localStorage.getItem('streak_warning_shown_date') === today) return;
    if (brokenStreak && brokenStreak > 0) {
      localStorage.setItem('streak_warning_shown_date', today);
      setStreakModal('broken');
    } else if (streakAtRisk) {
      localStorage.setItem('streak_warning_shown_date', today);
      setStreakModal('at-risk');
    }
  }, [streakAtRisk, brokenStreak]);

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => apiFetch('/curriculum/subjects', { token: token! }),
    enabled: !!token,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!selectedSubjectId) return;
    const t = setTimeout(() => {
      learningPathRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(t);
  }, [selectedSubjectId]);

  const gradeLevel = user?.gradeLevel ?? 3;
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const streakVal = typeof streak === 'number' ? streak : 0;
  const progressPct = dailyGoal
    ? Math.min(Math.round((dailyGoal.current / dailyGoal.target) * 100), 100)
    : 0;

  return (
    <motion.div
      className="min-h-screen bg-[#F5F6FA]"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28 flex flex-col gap-5">

        {/* ── Hero Card ─────────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden rounded-[24px] p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1A1F5E 0%, #2D3580 100%)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/5 -translate-x-20 -translate-y-20 pointer-events-none" />
          <div className="absolute bottom-0 right-4 w-24 h-24 rounded-full bg-white/5 translate-y-10 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white/70 text-sm font-medium">مرحباً 👋</p>
              <h2 className="text-2xl font-black mt-0.5">{user?.firstName || 'طالب'}!</h2>
              <p className="text-[#FFD700] text-sm font-semibold mt-1.5">استمر في رحلتك 🚀</p>
            </div>
            <NoorOwl
              expression={streakVal > 5 ? 'excited' : streakAtRisk ? 'encouraging' : 'happy'}
              size={88}
              animate
            />
          </div>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatCard icon="🔥" value={streakVal} label="يوم متتالي" />
          <StatCard icon="💎" value={gemsData?.gems ?? 0} label="جوهرة" />
          <StatCard icon="⭐" value={xpData?.totalXp ?? 0} label="XP" />
        </motion.div>

        {/* ── Daily Goal ────────────────────────────────── */}
        {dailyGoal && (
          <motion.div
            className="rounded-[20px] p-4 border border-[#FFD700]/40"
            style={{ background: '#FFF9E0' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-bold text-gray-700 text-sm">
                {dailyGoal.completed ? '✅ هدف اليوم مكتمل!' : '🎯 هدف اليوم'}
              </span>
              <span className="text-xs text-gray-500 font-semibold tabular-nums">
                {dailyGoal.current} / {dailyGoal.target} XP
              </span>
            </div>
            <div className="ds-progress-track">
              <motion.div
                className="ds-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Metzav / Quests / Content / Flashcards ────── */}
        <MetzavCountdown />
        <DailyQuests />
        <DailyContentWidget />
        <FlashcardsWidget />

        {/* ── Subjects ─────────────────────────────────── */}
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-3">المواد الدراسية</h3>
          {subjectsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="h-36 rounded-[20px] bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject, i) => {
                const theme = SUBJECT_THEMES[subject.name] ?? { icon: '📚', from: '#374151', to: '#1F2937' };
                const isSelected = selectedSubjectId === subject.id;
                const mastery = subject.masteryPercent ?? 0;
                return (
                  <motion.button
                    key={subject.id}
                    className="relative overflow-hidden rounded-[20px] p-5 text-white text-right w-full shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                      outline: isSelected ? '3px solid #FFD700' : 'none',
                      outlineOffset: '2px',
                    }}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedSubjectId(subject.id === selectedSubjectId ? null : subject.id)}
                  >
                    <div className="absolute top-2 left-2 bg-white/20 rounded-full px-2 py-0.5">
                      <span className="text-[11px] font-bold text-white">{subject.lessonCount ?? 0} درس</span>
                    </div>
                    <span className="text-4xl block mb-2 leading-none">{theme.icon}</span>
                    <p className="text-lg font-black leading-tight">{subject.name}</p>
                    <div className="mt-3 bg-white/25 rounded-full h-1.5">
                      <motion.div
                        className="bg-white rounded-full h-1.5"
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                      />
                    </div>
                    <p className="text-white/70 text-xs mt-1 font-medium">{mastery}% مكتمل</p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Learning Path ─────────────────────────────── */}
        <div ref={learningPathRef} />
        <AnimatePresence>
          {selectedSubjectId && (
            <motion.div
              key={selectedSubjectId}
              className="ds-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <h3 className="text-base font-black text-gray-900 mb-4">
                مسار {selectedSubject?.name ?? ''} — الصف {gradeLevel}
              </h3>
              <LearningPath subjectId={selectedSubjectId} gradeLevel={gradeLevel} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ── Modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {milestoneData && (
          <StreakMilestoneModal
            milestone={milestoneData.milestone}
            whatsappSent={milestoneData.whatsappSent}
            onClose={() => setMilestoneData(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {streakModal && !milestoneData && (
          <StreakBrokenModal
            mode={streakModal}
            brokenStreak={brokenStreak ?? undefined}
            onClose={() => setStreakModal(null)}
            onRepaired={() => setStreakModal(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeEncouragement && !milestoneData && !streakModal && (
          <EncouragementModal
            encouragement={activeEncouragement}
            onClose={() => setActiveEncouragement(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
