'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: number;
  xp: number;
  streak: number;
  hearts: number;
  lastActive: string;
  masteryPercent: number;
  weakSubject?: string;
  completedLessons: number;
}

interface ClassInfo {
  id: string;
  name: string;
  joinCode: string;
  gradeLevel: number;
  subject: string;
  studentCount: number;
  students: Student[];
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  unitId: string;
  lessonId: string;
  dueDate: string;
  minScore: number;
  completedCount: number;
  totalCount: number;
}

interface Analytics {
  hardestQuestion: string;
  hardestQuestionErrorRate: number;
  commonErrors: string[];
  avgScore: number;
  recommendation: string;
  currentUnit: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col items-center gap-1`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-extrabold">{value}</span>
      <span className="text-xs text-muted-foreground font-semibold">{label}</span>
    </div>
  );
}

function StudentRow({ student, onMessage }: { student: Student; onMessage: (s: Student) => void }) {
  const isAtRisk = student.hearts === 0 || student.streak === 0 || student.masteryPercent < 30;
  const lastActiveDate = new Date(student.lastActive);
  const daysSince = Math.floor((Date.now() - lastActiveDate.getTime()) / 86400000);

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-xl border-2 ${isAtRisk ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}
      whileHover={{ x: -2 }}
    >
      <div className="w-10 h-10 rounded-full bg-[#1A1F5E]/10 flex items-center justify-center font-extrabold text-[#1A1F5E]">
        {student.firstName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-800 truncate">{student.firstName} {student.lastName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>❤️ {student.hearts}</span>
          <span>🔥 {student.streak}y</span>
          <span>⭐ {student.xp} XP</span>
          {daysSince > 3 && <span className="text-red-500 font-bold">!{daysSince}d غائب</span>}
        </div>
      </div>
      <div className="text-left">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#1A1F5E] rounded-full" style={{ width: `${student.masteryPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 text-left">{student.masteryPercent}%</p>
      </div>
      <button
        className="p-2 rounded-lg bg-[#FFD700]/20 hover:bg-[#FFD700]/40 transition-colors"
        onClick={() => onMessage(student)}
        title="أرسل تشجيعاً"
      >
        💌
      </button>
    </motion.div>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const progress = assignment.totalCount > 0 ? (assignment.completedCount / assignment.totalCount) * 100 : 0;
  const overdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className={`rounded-xl border-2 p-4 ${overdue && progress < 100 ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm text-gray-800">{assignment.title}</p>
          <p className="text-xs text-muted-foreground">{assignment.subject} · حد أدنى {assignment.minScore}%</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {new Date(assignment.dueDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#1A1F5E] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-bold text-[#1A1F5E]">{assignment.completedCount}/{assignment.totalCount}</span>
      </div>
    </div>
  );
}

// ─── Encouragement modal ──────────────────────────────────────────────────────
function SendEncouragementModal({ student, onClose, token }: { student: Student; onClose: () => void; token: string }) {
  const [message, setMessage] = useState('');
  const [gems, setGems] = useState(0);
  const qc = useQueryClient();

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => apiFetch('/gamification/encouragements', {
      method: 'POST', token,
      body: JSON.stringify({ studentId: student.id, message, gems }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['class'] }); onClose(); },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4"
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
      >
        <NoorOwl expression="love" size={60} animate />
        <h2 className="text-lg font-extrabold text-center text-[#1A1F5E]">
          أرسل تشجيعاً لـ {student.firstName}
        </h2>
        <textarea
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm resize-none focus:border-[#1A1F5E] outline-none"
          rows={3}
          placeholder="اكتب رسالة تشجيع..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          dir="rtl"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">💎 هدية جواهر:</label>
          <select
            className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm"
            value={gems}
            onChange={e => setGems(Number(e.target.value))}
          >
            {[0, 5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 bg-[#1A1F5E] text-[#FFD700] font-bold rounded-xl disabled:opacity-50"
            disabled={!message.trim() || isPending}
            onClick={() => send()}
          >
            {isPending ? '...' : 'إرسال 💌'}
          </button>
          <button className="px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Assignment modal ──────────────────────────────────────────────────
function CreateAssignmentModal({
  classId, token, onClose,
}: { classId: string; token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', subject: 'عربي', unitId: '', lessonId: '',
    dueDate: '', minScore: 70,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => apiFetch(`/teacher/classes/${classId}/assignments`, {
      method: 'POST', token, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments', classId] }); onClose(); },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4"
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
      >
        <h2 className="text-lg font-extrabold text-[#1A1F5E] text-center">📝 إنشاء واجب جديد</h2>
        <input
          className="border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#1A1F5E] outline-none"
          placeholder="عنوان الواجب"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          dir="rtl"
        />
        <select
          className="border-2 border-gray-200 rounded-xl p-3 text-sm"
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
        >
          {['عربي', 'עברית', 'رياضيات', 'English'].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#1A1F5E] outline-none"
            placeholder="الوحدة"
            value={form.unitId}
            onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
            dir="rtl"
          />
          <input
            className="border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#1A1F5E] outline-none"
            placeholder="الدرس"
            value={form.lessonId}
            onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
            dir="rtl"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">تاريخ التسليم</label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#1A1F5E] outline-none"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">الحد الأدنى %</label>
            <input
              type="number"
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#1A1F5E] outline-none"
              value={form.minScore}
              min={0} max={100}
              onChange={e => setForm(f => ({ ...f, minScore: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 bg-[#1A1F5E] text-[#FFD700] font-bold rounded-xl disabled:opacity-50"
            disabled={!form.title || !form.dueDate || isPending}
            onClick={() => create()}
          >
            {isPending ? '...' : 'إنشاء الواجب'}
          </button>
          <button className="px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'analytics'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: classInfo, isLoading } = useQuery<ClassInfo>({
    queryKey: ['class'],
    queryFn: () => apiFetch('/teacher/class', { token: token! }),
    enabled: !!token,
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['assignments', classInfo?.id],
    queryFn: () => apiFetch(`/teacher/classes/${classInfo!.id}/assignments`, { token: token! }),
    enabled: !!classInfo?.id,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['analytics', classInfo?.id],
    queryFn: () => apiFetch(`/teacher/classes/${classInfo!.id}/analytics`, { token: token! }),
    enabled: !!classInfo?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <NoorOwl expression="studying" size={70} animate />
      </div>
    );
  }

  const students = classInfo?.students ?? [];
  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const atRiskCount = students.filter(s => s.hearts === 0 || s.streak === 0 || s.masteryPercent < 30).length;
  const avgStreak = students.length ? Math.round(students.reduce((a, s) => a + s.streak, 0) / students.length) : 0;
  const avgMastery = students.length ? Math.round(students.reduce((a, s) => a + s.masteryPercent, 0) / students.length) : 0;

  const TABS = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'students', label: 'الطلاب', icon: '👥' },
    { id: 'assignments', label: 'الواجبات', icon: '📝' },
    { id: 'analytics', label: 'التحليل', icon: '🔬' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1A1F5E] text-white px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <NoorOwl expression="proud" size={36} animate />
          <div>
            <p className="text-xs opacity-70">لوحة المعلم</p>
            <p className="font-extrabold text-[#FFD700] text-sm">{user?.firstName}</p>
          </div>
        </div>
        {classInfo && (
          <div className="text-center">
            <p className="font-bold text-sm">{classInfo.name}</p>
            <p className="text-xs opacity-70">كود الانضمام: <span className="font-mono font-bold text-[#FFD700]">{classInfo.joinCode}</span></p>
          </div>
        )}
        <button
          className="text-xs border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/10"
          onClick={() => { clearAuth(); router.replace('/login'); }}
        >
          خروج
        </button>
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[60px] z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-0.5 transition-colors
              ${activeTab === tab.id ? 'text-[#1A1F5E] border-b-2 border-[#1A1F5E]' : 'text-gray-400'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon="👥" value={students.length} label="طالب" color="bg-blue-50" />
              <StatCard icon="⚠️" value={atRiskCount} label="بحاجة للمتابعة" color={atRiskCount > 0 ? 'bg-red-50' : 'bg-green-50'} />
              <StatCard icon="🔥" value={`${avgStreak}y`} label="متوسط السلسلة" color="bg-orange-50" />
              <StatCard icon="📈" value={`${avgMastery}%`} label="متوسط الإتقان" color="bg-purple-50" />
            </div>

            {/* At-risk students */}
            {atRiskCount > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="font-extrabold text-red-700 mb-3 flex items-center gap-2">
                  <span>⚠️</span> طلاب بحاجة لمتابعة عاجلة
                </p>
                <div className="flex flex-col gap-2">
                  {students.filter(s => s.hearts === 0 || s.streak === 0 || s.masteryPercent < 30).slice(0, 3).map(s => (
                    <StudentRow key={s.id} student={s} onMessage={setSelectedStudent} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick analytics */}
            {analytics && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                <p className="font-extrabold text-[#1A1F5E] mb-3">💡 توصية هذا الأسبوع</p>
                <p className="text-sm text-gray-700">{analytics.recommendation}</p>
                <div className="mt-3 bg-amber-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-800">السؤال الأصعب</p>
                  <p className="text-sm text-gray-700 mt-1">{analytics.hardestQuestion}</p>
                  <p className="text-xs text-red-600 font-bold">معدل الخطأ: {analytics.hardestQuestionErrorRate}%</p>
                </div>
              </div>
            )}

            {/* Weekly report button */}
            <button
              className="w-full py-3.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-bold rounded-2xl hover:bg-[#1A1F5E] hover:text-white transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                const subject = encodeURIComponent('تقرير أسبوعي — الموجه الذكي');
                const body = encodeURIComponent(
                  `السلام عليكم،\n\nإليكم التقرير الأسبوعي لصف ${classInfo?.name}:\n` +
                  `• عدد الطلاب: ${students.length}\n• متوسط الإتقان: ${avgMastery}%\n` +
                  `• متوسط السلسلة: ${avgStreak} يوم\n• طلاب بحاجة للمتابعة: ${atRiskCount}\n\n` +
                  `مع التحية،\n${user?.firstName}`,
                );
                window.open(`mailto:?subject=${subject}&body=${body}`);
              }}
            >
              📧 إرسال التقرير الأسبوعي
            </button>
          </motion.div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <input
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A1F5E] outline-none"
              placeholder="🔍 ابحث عن طالب..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              dir="rtl"
            />
            <div className="flex flex-col gap-2">
              {filteredStudents.map(student => (
                <StudentRow key={student.id} student={student} onMessage={setSelectedStudent} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab === 'assignments' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <button
              className="w-full py-3.5 bg-[#1A1F5E] text-[#FFD700] font-extrabold rounded-2xl shadow hover:opacity-90 flex items-center justify-center gap-2"
              onClick={() => setShowAssignmentModal(true)}
            >
              + إنشاء واجب جديد
            </button>
            {assignments.length === 0 ? (
              <div className="text-center py-10">
                <NoorOwl expression="thinking" size={70} animate />
                <p className="text-muted-foreground mt-3">لا توجد واجبات بعد</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assignments.map(a => <AssignmentCard key={a.id} assignment={a} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && analytics && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-5">
              <h3 className="font-extrabold text-[#1A1F5E] mb-4">📊 تحليل الأداء</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">متوسط الدرجة</span>
                  <span className="font-extrabold text-[#1A1F5E]">{analytics.avgScore}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A1F5E] rounded-full" style={{ width: `${analytics.avgScore}%` }} />
                </div>
                <div className="text-sm text-gray-600 mt-2">الوحدة الحالية: <span className="font-bold text-[#1A1F5E]">{analytics.currentUnit}</span></div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <h3 className="font-extrabold text-red-700 mb-3">⚠️ أصعب سؤال في الفصل</h3>
              <p className="text-sm text-gray-700 mb-2">{analytics.hardestQuestion}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${analytics.hardestQuestionErrorRate}%` }} />
                </div>
                <span className="text-sm font-bold text-red-700">{analytics.hardestQuestionErrorRate}% خطأ</span>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <h3 className="font-extrabold text-amber-800 mb-3">🔁 الأخطاء الشائعة</h3>
              <ul className="flex flex-col gap-2">
                {analytics.commonErrors.map((err, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span> {err}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
              <h3 className="font-extrabold text-green-700 mb-2">💡 توصية للمعلم</h3>
              <p className="text-sm text-gray-700">{analytics.recommendation}</p>
            </div>

            {/* Curriculum sync */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
              <h3 className="font-extrabold text-blue-700 mb-3">📚 مزامنة المنهج</h3>
              <p className="text-xs text-muted-foreground mb-3">حدد الوحدة الحالية ليضبط التطبيق ترتيب الدروس لجميع الطلاب تلقائياً</p>
              <select
                className="w-full border-2 border-blue-200 rounded-xl p-3 text-sm bg-white"
                defaultValue={analytics.currentUnit}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={`unit-${i + 1}`}>الوحدة {i + 1}</option>
                ))}
              </select>
              <button className="mt-3 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:opacity-90">
                مزامنة الآن
              </button>
            </div>
          </motion.div>
        )}

      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedStudent && (
          <SendEncouragementModal
            student={selectedStudent}
            token={token!}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAssignmentModal && classInfo && (
          <CreateAssignmentModal
            classId={classInfo.id}
            token={token!}
            onClose={() => setShowAssignmentModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
