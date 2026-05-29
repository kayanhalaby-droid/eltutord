export interface StudentStats {
  totalXp: number;
  weeklyXp: number;
  level: number;
  hearts: number;
  maxHearts: number;
  nextRegenerationAt: string | null;
  currentStreak: number;
  gemsBalance: number;
}
