import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  Child, TodaySummaryData, WeeklyProgressData,
  Skill, Activity, ParentDashboardData,
} from '@/lib/types/parent';

async function fetchAllDashboardData(
  childId: string,
  token: string
): Promise<ParentDashboardData> {
  const [children, todaySummary, weeklyProgress, skillRadar, activities] =
    await Promise.all([
      apiFetch<Child[]>('/parents/children', { token }),
      apiFetch<TodaySummaryData>(`/parents/children/${childId}/today-summary`, { token }).catch(
        () => ({ totalActivities: 0, totalDurationMinutes: 0, averageScore: 0, completedLessons: 0 })
      ),
      apiFetch<WeeklyProgressData[]>(`/parents/children/${childId}/weekly-progress`, { token }).catch(() => []),
      apiFetch<Skill[]>(`/parents/children/${childId}/skill-radar`, { token }).catch(() => []),
      apiFetch<Activity[]>(`/parents/children/${childId}/activities`, { token }).catch(() => []),
    ]);

  return { children, todaySummary, weeklyProgress, skillRadar, activities };
}

export function useParentDashboardData(childId: string | null) {
  const token = useAuthStore((s) => s.token);

  return useQuery<ParentDashboardData, Error>({
    queryKey: ['parentDashboard', childId],
    queryFn: () => fetchAllDashboardData(childId!, token!),
    enabled: !!childId && !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useChildren() {
  const token = useAuthStore((s) => s.token);

  return useQuery<Child[], Error>({
    queryKey: ['parentChildren'],
    queryFn: () => apiFetch<Child[]>('/parents/children', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });
}
