import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useGems() {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery<{ gems: number }>({
    queryKey: ['gems'],
    queryFn: () => apiFetch<{ gems: number }>('/gamification/gems', { token: token! }),
    enabled: !!token,
    refetchInterval: 300_000,
  });
  return { gems: data?.gems ?? 0, isLoading, isError };
}

export function useGemsBalance(): number | undefined {
  const { gems, isLoading } = useGems();
  return isLoading ? undefined : gems;
}
