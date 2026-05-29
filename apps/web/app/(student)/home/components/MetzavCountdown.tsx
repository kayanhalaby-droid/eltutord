'use client';

import { motion } from 'framer-motion';
import { useMetzav, MetzavActive } from '@/lib/hooks/useMetzav';

const GRADE_LABEL: Record<number, string> = {
  2: 'الصف الثاني',
  5: 'الصف الخامس',
};

const URGENCY = {
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-800',  ring: 'bg-green-500',  label: 'وقت كافٍ للاستعداد' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', ring: 'bg-orange-500', label: 'ابدأ المراجعة الآن' },
  red:    { bg: 'bg-red-50',    border: 'border-red-400',    text: 'text-red-800',    ring: 'bg-red-500',    label: 'مراجعة مكثفة مطلوبة!' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CompactWidget({ info }: { info: MetzavActive }) {
  const u = URGENCY[info.urgency];
  const emoji = info.urgency === 'red' ? '🚨' : info.urgency === 'orange' ? '⚠️' : '📅';

  return (
    <motion.div
      className={`${u.bg} ${u.text} border-2 ${u.border} rounded-2xl p-4 flex items-center gap-4 shadow-sm`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Day counter */}
      <div className="flex flex-col items-center bg-white/60 rounded-xl px-4 py-2 flex-shrink-0 shadow-sm">
        <motion.span
          className="text-4xl font-extrabold leading-tight"
          animate={info.urgency === 'red' ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {info.daysRemaining}
        </motion.span>
        <span className="text-xs font-bold opacity-70">يوم</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-base leading-tight">
          {emoji} الميتساف — {GRADE_LABEL[info.gradeLevel] ?? `الصف ${info.gradeLevel}`}
        </p>
        <p className="text-xs opacity-70 mt-0.5">{formatDate(info.date)}</p>
        <p className={`text-xs font-bold mt-1 ${info.urgency === 'red' ? 'text-red-600' : ''}`}>
          {u.label}
        </p>

        {/* Progress bar: elapsed % of school year → metzav */}
        <div className="mt-2 h-1.5 bg-white/40 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${u.ring} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${info.progressPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs opacity-50 mt-0.5">
          {info.progressPct}% من العام الدراسي
        </p>
      </div>
    </motion.div>
  );
}

function IntensiveBanner({ info }: { info: MetzavActive }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      {/* Red gradient header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <motion.p
              className="text-2xl font-extrabold"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🚨 {info.daysRemaining} يوم للميتساف!
            </motion.p>
            <p className="text-sm text-white/80 mt-0.5">
              {GRADE_LABEL[info.gradeLevel] ?? `الصف ${info.gradeLevel}`} — {formatDate(info.date)}
            </p>
          </div>
          <div className="flex flex-col items-center bg-white/20 rounded-2xl px-4 py-2">
            <span className="text-3xl font-extrabold">{info.daysRemaining}</span>
            <span className="text-xs">يوم</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${info.progressPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-white/60 mt-1">{info.progressPct}% من العام الدراسي انقضى</p>
      </div>

      {/* Action area */}
      <div className="bg-red-50 border-t-2 border-red-300 p-3 flex items-center justify-between gap-3">
        <p className="text-red-800 text-sm font-bold">
          ابدأ المراجعة المكثفة اليوم — كل يوم مهم!
        </p>
        <button
          className="bg-red-600 text-white font-extrabold text-sm px-4 py-2 rounded-xl shadow hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
          onClick={() => {
            document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          راجع الآن
        </button>
      </div>
    </motion.div>
  );
}

export default function MetzavCountdown() {
  const { data, isLoading } = useMetzav();

  if (isLoading || !data || !data.applicable) return null;

  const info = data as MetzavActive;

  return info.intensiveMode ? (
    <IntensiveBanner info={info} />
  ) : (
    <CompactWidget info={info} />
  );
}
