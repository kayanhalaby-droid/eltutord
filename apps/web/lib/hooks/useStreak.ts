import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface StreakInfo {
  streak: number;
  hasFreeze: boolean;
  streakAtRisk: boolean;
  longestStreak: number;
  brokenStreak?: number | null;
}

export interface ActivityResult {
  streak: number;
  milestone?: number | null;
  whatsappSent?: boolean;
}

export interface RepairResult {
  success: boolean;
  streak: number;
  message: string;
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function milestoneLabel(days: number): string {
  const labels: Record<number, string> = {
    3:   '٣ أيام متتالية! 🔥',
    7:   'أسبوع كامل! 🌟',
    14:  'أسبوعان! 💪',
    30:  'شهر من الإخلاص! 💎',
    60:  'شهران متواصلان! 🚀',
    100: '١٠٠ يوم أسطوري! 👑',
  };
  return labels[days] ?? `${days} يوم! 🔥`;
}

export function milestoneGems(days: number): number {
  const rewards: Record<number, number> = { 3: 30, 7: 75, 14: 150, 30: 300, 60: 600, 100: 1000 };
  return rewards[days] ?? 0;
}

export function useStreak() {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: () => apiFetch<StreakInfo>('/gamification/streak', { token: token! }),
    enabled: !!token,
    refetchInterval: 60_000,
  });
  return {
    streak: data?.streak ?? 0,
    hasFreeze: data?.hasFreeze ?? false,
    streakAtRisk: data?.streakAtRisk ?? false,
    longestStreak: data?.longestStreak ?? 0,
    brokenStreak: data?.brokenStreak ?? null,
    isLoading,
    isError,
  };
}

export function useRecordActivity() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation<ActivityResult, Error, void>({
    mutationFn: () =>
      apiFetch<ActivityResult>('/gamification/streak/activity', { method: 'POST', token: token! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streak'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
    },
  });
}

export function useRepairStreak() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation<RepairResult, Error, void>({
    mutationFn: () =>
      apiFetch<RepairResult>('/gamification/streak/repair', { method: 'POST', token: token! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streak'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
    },
  });
}
