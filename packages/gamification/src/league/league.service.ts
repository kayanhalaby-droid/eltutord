export type LeagueTierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface LeagueTier {
  name: LeagueTierName;
  minXp: number;
  maxXp: number | null;
  promotionThreshold: number;
  relegationThreshold: number;
  weeklyGemReward: number;
  color: string;
  emoji: string;
}

export interface LeagueState {
  tier: LeagueTierName;
  weeklyXp: number;
  weeklyRank: number | null;
  promotionZone: boolean;
  relegationZone: boolean;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  {
    name: 'BRONZE',
    minXp: 0,
    maxXp: 499,
    promotionThreshold: 400,
    relegationThreshold: 0,
    weeklyGemReward: 10,
    color: '#CD7F32',
    emoji: '🥉',
  },
  {
    name: 'SILVER',
    minXp: 500,
    maxXp: 1499,
    promotionThreshold: 1200,
    relegationThreshold: 200,
    weeklyGemReward: 25,
    color: '#C0C0C0',
    emoji: '🥈',
  },
  {
    name: 'GOLD',
    minXp: 1500,
    maxXp: 3499,
    promotionThreshold: 3000,
    relegationThreshold: 600,
    weeklyGemReward: 50,
    color: '#FFD700',
    emoji: '🥇',
  },
  {
    name: 'PLATINUM',
    minXp: 3500,
    maxXp: 7499,
    promotionThreshold: 7000,
    relegationThreshold: 1500,
    weeklyGemReward: 100,
    color: '#E5E4E2',
    emoji: '💎',
  },
  {
    name: 'DIAMOND',
    minXp: 7500,
    maxXp: null,
    promotionThreshold: Infinity,
    relegationThreshold: 3500,
    weeklyGemReward: 200,
    color: '#B9F2FF',
    emoji: '🔷',
  },
];

export function getTierByName(name: LeagueTierName): LeagueTier {
  const tier = LEAGUE_TIERS.find((t) => t.name === name);
  if (!tier) throw new Error(`Unknown tier: ${name}`);
  return tier;
}

export function getTierByXp(totalXp: number): LeagueTier {
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= LEAGUE_TIERS[i].minXp) return LEAGUE_TIERS[i];
  }
  return LEAGUE_TIERS[0];
}

export function getNextTier(current: LeagueTierName): LeagueTier | null {
  const idx = LEAGUE_TIERS.findIndex((t) => t.name === current);
  return idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1] : null;
}

export function getPreviousTier(current: LeagueTierName): LeagueTier | null {
  const idx = LEAGUE_TIERS.findIndex((t) => t.name === current);
  return idx > 0 ? LEAGUE_TIERS[idx - 1] : null;
}

export function computeLeagueState(
  totalXp: number,
  weeklyXp: number,
  weeklyRank: number | null = null,
  leagueSize = 30
): LeagueState {
  const tier = getTierByXp(totalXp);

  const promotionZone = weeklyRank !== null && weeklyRank <= Math.ceil(leagueSize * 0.2);
  const relegationZone = weeklyRank !== null && weeklyRank > Math.floor(leagueSize * 0.8);

  return {
    tier: tier.name,
    weeklyXp,
    weeklyRank,
    promotionZone,
    relegationZone,
  };
}

export function evaluatePromotion(
  state: LeagueState,
  leagueSize = 30
): { action: 'PROMOTE' | 'RELEGATE' | 'STAY'; newTier: LeagueTierName } {
  const promotionCutoff = Math.ceil(leagueSize * 0.2);
  const relegationCutoff = Math.floor(leagueSize * 0.8);

  if (state.weeklyRank !== null && state.weeklyRank <= promotionCutoff) {
    const next = getNextTier(state.tier);
    return { action: 'PROMOTE', newTier: next ? next.name : state.tier };
  }

  if (state.weeklyRank !== null && state.weeklyRank > relegationCutoff) {
    const prev = getPreviousTier(state.tier);
    return { action: 'RELEGATE', newTier: prev ? prev.name : state.tier };
  }

  return { action: 'STAY', newTier: state.tier };
}

export function xpProgressInTier(totalXp: number): { current: number; needed: number; percent: number } {
  const tier = getTierByXp(totalXp);
  const current = totalXp - tier.minXp;
  const needed = tier.maxXp !== null ? tier.maxXp - tier.minXp : null;

  if (needed === null) {
    return { current, needed: Infinity, percent: 100 };
  }

  return { current, needed, percent: Math.min(Math.round((current / needed) * 100), 100) };
}
