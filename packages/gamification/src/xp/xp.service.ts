export const BASE_XP_PER_LEVEL = 100;
export const XP_SCALE_FACTOR = 1.5;

export interface XpState {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
}

export function xpRequiredForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_SCALE_FACTOR, level - 1));
}

export function computeXpState(totalXp: number): XpState {
  let level = 1;
  let accumulated = 0;

  while (true) {
    const needed = xpRequiredForLevel(level);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    level++;
  }

  const xpToNextLevel = xpRequiredForLevel(level);
  const currentLevelXp = totalXp - accumulated;

  return { totalXp, level, currentLevelXp, xpToNextLevel };
}

export function addXp(totalXp: number, amount: number): { newTotal: number; leveledUp: boolean; newState: XpState } {
  const before = computeXpState(totalXp);
  const newTotal = totalXp + Math.max(0, amount);
  const after = computeXpState(newTotal);
  return { newTotal, leveledUp: after.level > before.level, newState: after };
}

export function scoreToXp(score: number, maxScore: number, baseReward = 20): number {
  if (maxScore <= 0) return 0;
  const ratio = Math.min(score / maxScore, 1);
  return Math.round(baseReward * ratio);
}
