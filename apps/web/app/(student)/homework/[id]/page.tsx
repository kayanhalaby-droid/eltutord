'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { HomeworkResult, HomeworkQuestion } from '@/lib/types/homework';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    'text-red-600 bg-red-50 border-red-200';
  return (
    <div className={cn('inline-flex items-center gap-1 border rounded-xl px-4 py-2 font-extrabold text-3xl', color)}>
      {score}%
    </div>
  );
}

function QuestionCard({ q, index }: { q: HomeworkQuestion; index: number }) {
  return (
    <div className={cn(
      'rounded-2xl border-2 p-4 flex flex-col gap-2',
      q.isCorrect === true ? 'border-green-200 bg-green-50' :
      q.isCorrect === false ? 'border-red-200 bg-red-50' :
      'border-gray-200 bg-white'
    )}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-gray-800 flex-1">{q.question}</p>
        {q.isCorrect === true && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />}
        {q.isCorrect === false && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
      </div>

      <div className="mr-10 flex flex-col gap-1">
        <div className="text-xs text-gray-500 font-medium">إجابة الطالب:</div>
        <div className="text-sm text-gray-700 bg-white/70 rounded-lg px-3 py-1.5 border border-gray-200">
          {q.studentAnswer || <span className="italic text-gray-400">لا توجد إجابة</span>}
        </div>
        {q.feedback && (
          <div className={cn(
            'text-xs rounded-lg px-3 py-1.5 mt-1',
            q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-orange-50 text-orange-800'
          )}>
            💬 {q.feedback}
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessingView() {
  const messages = [
    'جاري قراءة الواجب...',
    'جاري تحليل الأسئلة...',
    'جاري تصحيح الإجابات...',
    'جاري إعداد التقرير...',
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="text-6xl animate-bounce">🦉</div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 size={32} className="text-brand animate-spin" />
        <p className="text-lg font-bold text-brand">{messages[msgIdx]}</p>
        <p className="text-sm text-gray-400">المعلم الذكي يراجع الواجب</p>
      </div>
      <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

export default function HomeworkResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [result, setResult] = useState<HomeworkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!token || !id) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/homework/status/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('فشل جلب نتائج الواجب');
        const data: HomeworkResult = await res.json();
        setResult(data);

        if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          setPollCount((c) => {
            if (c >= MAX_POLLS) {
              setError('استغرق التحليل وقتًا طويلًا، حاول لاحقًا');
              return c;
            }
            return c + 1;
          });
        }
      } catch {
        setError('حدث خطأ في جلب النتائج');
      }
    };

    poll();
  }, [token, id]);

  useEffect(() => {
    if (!result) return;
    if (result.status !== 'PENDING' && result.status !== 'PROCESSING') return;
    if (pollCount >= MAX_POLLS) return;

    const timer = setTimeout(async () => {
      if (!token || !id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/homework/status/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data: HomeworkResult = await res.json();
        setResult(data);
        if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          setPollCount((c) => c + 1);
        }
      } catch {
        // silent — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [result, pollCount, token, id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-lg font-bold text-gray-700">{error}</p>
        <Button onClick={() => router.push('/homework')}>ارفع واجبًا جديدًا</Button>
      </div>
    );
  }

  if (!result || result.status === 'PENDING' || result.status === 'PROCESSING') {
    return <ProcessingView />;
  }

  if (result.status === 'FAILED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="text-5xl">😕</div>
        <p className="text-lg font-bold text-gray-700">لم نتمكن من تحليل الواجب</p>
        <p className="text-sm text-gray-400">تأكد من وضوح الصورة وحاول مجددًا</p>
        <Button onClick={() => router.push('/homework')}>حاول مجددًا</Button>
      </div>
    );
  }

  const questions = result.questions ?? [];
  const correctCount = questions.filter((q) => q.isCorrect === true).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors w-fit"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-extrabold text-brand">
                {result.assignmentTitle ?? 'نتائج الواجب'}
              </h1>
              {result.subject && (
                <p className="text-sm text-gray-500">
                  {result.subject}
                  {result.gradeLevel ? ` · الصف ${result.gradeLevel}` : ''}
                </p>
              )}
              {result.studentName && (
                <p className="text-sm font-semibold text-gray-700">👤 {result.studentName}</p>
              )}
            </div>
            {result.score != null && <ScoreBadge score={result.score} />}
          </div>

          {questions.length > 0 && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <Stat label="الأسئلة" value={questions.length} />
              <Stat label="صحيح" value={correctCount} color="text-green-600" />
              <Stat label="خطأ" value={questions.length - correctCount} color="text-red-500" />
            </div>
          )}
        </div>

        {/* Overall feedback */}
        {result.overallFeedback && (
          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4">
            <p className="text-sm font-bold text-brand mb-1">تعليق المعلم الذكي 🦉</p>
            <p className="text-sm text-gray-700">{result.overallFeedback}</p>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-gray-700">الأسئلة والإجابات</h2>
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/homework')}
          >
            واجب جديد
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/home')}
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn('text-xl font-extrabold', color ?? 'text-gray-800')}>{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
