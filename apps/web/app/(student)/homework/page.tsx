'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, XCircle, Loader2, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { HomeworkResult } from '@/lib/types/homework';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <CheckCircle2 size={18} className="text-green-500" />;
  if (status === 'FAILED') return <XCircle size={18} className="text-red-400" />;
  return <Loader2 size={18} className="text-brand animate-spin" />;
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span className={cn(
      'text-xs font-bold rounded-full px-2.5 py-0.5',
      score >= 85 ? 'bg-green-100 text-green-700' :
      score >= 60 ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-600'
    )}>
      {score}%
    </span>
  );
}

export default function HomeworkPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const { data: submissions, isLoading } = useQuery<HomeworkResult[]>({
    queryKey: ['homeworkHistory'],
    queryFn: () => apiFetch('/homework/history', { token: token! }),
    enabled: !!token,
    refetchInterval: 10_000,
  });

  const pending = submissions?.filter((s) => s.status === 'PENDING' || s.status === 'PROCESSING');
  const done = submissions?.filter((s) => s.status === 'COMPLETED' || s.status === 'FAILED');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-brand">الواجبات 📚</h1>
            <p className="text-sm text-gray-400 mt-0.5">سجل الواجبات المصحّحة</p>
          </div>
          <Button
            onClick={() => router.push('/homework/scan')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            فحص واجب
          </Button>
        </div>

        {/* Processing banner */}
        {(pending?.length ?? 0) > 0 && (
          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex items-center gap-3">
            <Loader2 size={20} className="text-brand animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-brand">
                {pending!.length} واجب قيد التحليل
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                سيتم إشعارك عند اكتمال التصحيح
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !submissions?.length && (
          <div className="flex flex-col items-center justify-center gap-5 py-20">
            <div className="text-6xl">📝</div>
            <div className="text-center">
              <p className="font-bold text-gray-700">لا يوجد واجبات محفوظة</p>
              <p className="text-sm text-gray-400 mt-1">ارفع صورة واجبك الأول الآن</p>
            </div>
            <Button onClick={() => router.push('/homework/scan')}>
              <Camera size={16} className="ml-2" />
              فحص واجبي الأول
            </Button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        )}

        {/* Pending submissions */}
        {(pending?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">قيد المعالجة</h2>
            {pending!.map((s) => (
              <SubmissionCard key={s.id} s={s} onClick={() => router.push(`/homework/${s.id}`)} />
            ))}
          </div>
        )}

        {/* Completed submissions */}
        {(done?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">مكتملة</h2>
            {done!.map((s) => (
              <SubmissionCard key={s.id} s={s} onClick={() => router.push(`/homework/${s.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ s, onClick }: { s: HomeworkResult; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-brand/30 hover:shadow-md transition-all"
    >
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <StatusIcon status={s.status} />
          <p className="font-bold text-gray-800 text-sm truncate">
            {s.assignmentTitle ?? 'واجب'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {s.subject && <span>{s.subject}</span>}
          {s.gradeLevel && <span>· الصف {s.gradeLevel}</span>}
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: ar })}
          </span>
        </div>
      </div>
      {s.score != null && <ScoreChip score={s.score} />}
    </button>
  );
}
