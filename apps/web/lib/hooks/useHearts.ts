import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Hearts } from '@/lib/types/gamification';

export function useHearts() {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery<Hearts>({
    queryKey: ['hearts'],
    queryFn: () => apiFetch('/gamification/hearts', { token: token! }),
    enabled: !!token,
    refetchInterval: 60_000,
  });
  return { hearts: data, isLoading, isError };
}

export function useDepleteHeart() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/gamification/hearts/deplete', { method: 'POST', token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hearts'] }),
  });
}

export function useRefillHearts() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/gamification/hearts/refill', { method: 'POST', token: token! }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hearts'] }); qc.invalidateQueries({ queryKey: ['gems'] }); },
  });
}
