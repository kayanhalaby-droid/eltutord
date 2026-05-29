import {
  createStreakState,
  recordActivity,
  isStreakAlive,
  streakMultiplier,
} from './streak.service';

const day = (offset: number) => new Date(`2024-01-${String(1 + offset).padStart(2, '0')}T12:00:00Z`);

describe('StreakService', () => {
  describe('createStreakState', () => {
    it('starts at 0 with no last activity', () => {
      const state = createStreakState();
      expect(state.currentStreak).toBe(0);
      expect(state.lastActivityDate).toBeNull();
    });
  });

  describe('recordActivity', () => {
    it('sets streak to 1 on first activity', () => {
      const state = recordActivity(createStreakState(), day(0));
      expect(state.currentStreak).toBe(1);
      expect(state.lastActivityDate).toBe('2024-01-01');
    });

    it('increments streak on consecutive days', () => {
      let state = recordActivity(createStreakState(), day(0));
      state = recordActivity(state, day(1));
      expect(state.currentStreak).toBe(2);
    });

    it('does not change streak when activity is same day', () => {
      let state = recordActivity(createStreakState(), day(0));
      state = recordActivity(state, day(0));
      expect(state.currentStreak).toBe(1);
    });

    it('resets streak to 1 when a day is skipped', () => {
      let state = recordActivity(createStreakState(), day(0));
      state = recordActivity(state, day(2));
      expect(state.currentStreak).toBe(1);
    });

    it('tracks longest streak correctly', () => {
      let state = createStreakState();
      for (let i = 0; i < 5; i++) state = recordActivity(state, day(i));
      state = recordActivity(state, day(7)); // break
      expect(state.longestStreak).toBe(5);
      expect(state.currentStreak).toBe(1);
    });
  });

  describe('isStreakAlive', () => {
    it('returns false for fresh state', () => {
      expect(isStreakAlive(createStreakState(), day(0))).toBe(false);
    });

    it('returns true when activity was today', () => {
      const state = recordActivity(createStreakState(), day(0));
      expect(isStreakAlive(state, day(0))).toBe(true);
    });

    it('returns true when activity was yesterday', () => {
      const state = recordActivity(createStreakState(), day(0));
      expect(isStreakAlive(state, day(1))).toBe(true);
    });

    it('returns false when two days have passed', () => {
      const state = recordActivity(createStreakState(), day(0));
      expect(isStreakAlive(state, day(2))).toBe(false);
    });
  });

  describe('streakMultiplier', () => {
    it('returns 1.0 below threshold', () => {
      expect(streakMultiplier(1)).toBe(1.0);
      expect(streakMultiplier(2)).toBe(1.0);
    });

    it('returns 1.1 for 3+ day streak', () => {
      expect(streakMultiplier(3)).toBe(1.1);
      expect(streakMultiplier(6)).toBe(1.1);
    });

    it('returns 1.25 for 7+ day streak', () => {
      expect(streakMultiplier(7)).toBe(1.25);
    });

    it('returns 1.5 for 14+ day streak', () => {
      expect(streakMultiplier(14)).toBe(1.5);
    });

    it('returns 2.0 for 30+ day streak', () => {
      expect(streakMultiplier(30)).toBe(2.0);
    });
  });
});
