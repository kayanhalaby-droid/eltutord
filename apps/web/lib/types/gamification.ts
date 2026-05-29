export interface Hearts {
  hearts: number;
  maxHearts: number;
  nextRegenerationAt: string | null;
}

export interface XPInfo {
  totalXp: number;
  weeklyXp: number;
  level: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  streakMaintained: boolean;
}
