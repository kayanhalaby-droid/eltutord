import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface DailyGoal {
  target: number;
  current: number;
  completed: boolean;
}

export function useDailyGoal() {
  const token = useAuthStore(s => s.token);
  return useQuery<DailyGoal>({
    queryKey: ['dailyGoal'],
    queryFn: () => apiFetch('/gamification/daily-goal', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useSetDailyGoal() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (target: number) =>
      apiFetch('/gamification/daily-goal/set', {
        method: 'POST',
        body: JSON.stringify({ target }),
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailyGoal'] }),
  });
}
