import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface LeagueParticipant {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface LeagueData {
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  leagueName: string;
  leagueColor: string;
  weeklyXp: number;
  rank: number;
  participants: LeagueParticipant[];
  promotionZone: number;
  demotionZone: number;
  daysLeft: number;
  totalParticipants: number;
}

export function useLeague() {
  const token = useAuthStore(s => s.token);
  return useQuery<LeagueData>({
    queryKey: ['league'],
    queryFn: () => apiFetch('/gamification/league', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });
}
