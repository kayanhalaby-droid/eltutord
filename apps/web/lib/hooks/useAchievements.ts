import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  isUnlocked: boolean;
  category: 'lessons' | 'streak' | 'xp' | 'gems' | 'accuracy' | 'subject';
}

export function useAchievements() {
  const token = useAuthStore(s => s.token);
  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: () => apiFetch('/gamification/achievements', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}
