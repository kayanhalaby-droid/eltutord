import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface DailyQuest {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  gemsReward: number;
}

export interface DailyQuestsData {
  quests: DailyQuest[];
  allCompleted: boolean;
  bonusClaimed: boolean;
  bonusGems: number;
}

export function useDailyQuests() {
  const token = useAuthStore((s) => s.token);
  return useQuery<DailyQuestsData>({
    queryKey: ['daily-quests'],
    queryFn: () => apiFetch<DailyQuestsData>('/gamification/quests/daily', { token: token! }),
    enabled: !!token,
    refetchInterval: 30_000,
  });
}

export function useClaimQuestsBonus() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation<{ success: boolean; bonusGems: number; message: string }, Error, void>({
    mutationFn: () =>
      apiFetch('/gamification/quests/daily/claim-bonus', { method: 'POST', token: token! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-quests'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
      qc.invalidateQueries({ queryKey: ['xp'] });
    },
  });
}
