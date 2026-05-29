import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface MetzavInfo {
  applicable: false;
}

export interface MetzavActive {
  applicable: true;
  gradeLevel: number;
  date: string;
  daysRemaining: number;
  urgency: 'green' | 'orange' | 'red';
  intensiveMode: boolean;
  progressPct: number;
}

export type MetzavData = MetzavInfo | MetzavActive;

export function useMetzav() {
  const token = useAuthStore((s) => s.token);
  return useQuery<MetzavData>({
    queryKey: ['metzav'],
    queryFn: () => apiFetch<MetzavData>('/metzav/info', { token: token! }),
    enabled: !!token,
    refetchInterval: 3_600_000, // re-check every hour
    staleTime: 1_800_000,
  });
}
