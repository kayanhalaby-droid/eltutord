export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export function createStreakState(): StreakState {
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysDiff(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function recordActivity(state: StreakState, now = new Date()): StreakState {
  const today = toDateString(now);

  if (!state.lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, state.longestStreak),
      lastActivityDate: today,
    };
  }

  const diff = daysDiff(state.lastActivityDate, today);

  if (diff === 0) return state; // already recorded today

  if (diff === 1) {
    // consecutive day
    const newStreak = state.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, state.longestStreak),
      lastActivityDate: today,
    };
  }

  // streak broken
  return {
    currentStreak: 1,
    longestStreak: state.longestStreak,
    lastActivityDate: today,
  };
}

export function isStreakAlive(state: StreakState, now = new Date()): boolean {
  if (!state.lastActivityDate) return false;
  const today = toDateString(now);
  const diff = daysDiff(state.lastActivityDate, today);
  return diff <= 1;
}

export function streakMultiplier(currentStreak: number): number {
  if (currentStreak >= 30) return 2.0;
  if (currentStreak >= 14) return 1.5;
  if (currentStreak >= 7) return 1.25;
  if (currentStreak >= 3) return 1.1;
  return 1.0;
}
