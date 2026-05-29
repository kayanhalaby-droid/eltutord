'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
  LESSON_COMPLETE: '🎉',
  XP_EARNED: '⭐',
  STREAK: '🔥',
  HOMEWORK_RESULT: '📝',
  BADGE_EARNED: '🏅',
  PARENT_MESSAGE: '💬',
  SYSTEM: '📢',
};

function NotificationItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <div
      onClick={() => !n.isRead && onRead(n.id)}
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer',
        n.isRead
          ? 'bg-white border-gray-100'
          : 'bg-brand/5 border-brand/20 hover:bg-brand/10'
      )}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">
        {TYPE_ICON[n.type] ?? '🔔'}
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-bold', n.isRead ? 'text-gray-700' : 'text-brand')}>
            {n.title}
          </p>
          {!n.isRead && (
            <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-gray-500">{n.body}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ar })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiFetch('/notifications', { token: token! }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const readOneMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast.error('فشل تحديث الإشعار'),
  });

  const readAllMutation = useMutation({
    mutationFn: () =>
      apiFetch('/notifications/read-all', { method: 'PATCH', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('تم تعليم الكل كمقروء');
    },
    onError: () => toast.error('فشلت العملية'),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-brand">الإشعارات</h1>
            {unreadCount > 0 && (
              <span className="bg-brand text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="text-xs gap-1.5"
            >
              {readAllMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              تعليم الكل كمقروء
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : !notifications?.length ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <BellOff size={40} className="text-gray-300" />
            <p className="text-gray-400 font-semibold">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                onRead={(id) => readOneMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
