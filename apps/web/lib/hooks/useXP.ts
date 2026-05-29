import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { XPInfo } from '@/lib/types/gamification';

export function useXP() {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery<XPInfo>({
    queryKey: ['xp'],
    queryFn: () => apiFetch('/gamification/xp', { token: token! }),
    enabled: !!token,
    refetchInterval: 300_000,
  });
  return { xp: data, isLoading, isError };
}

export function useAwardXP() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      apiFetch('/gamification/xp/award', { method: 'POST', body: JSON.stringify({ amount }), token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['xp'] }),
  });
}
