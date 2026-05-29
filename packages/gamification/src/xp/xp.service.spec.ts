import { computeXpState, addXp, scoreToXp, xpRequiredForLevel } from './xp.service';

describe('XpService', () => {
  describe('xpRequiredForLevel', () => {
    it('level 1 requires BASE_XP_PER_LEVEL', () => {
      expect(xpRequiredForLevel(1)).toBe(100);
    });

    it('scales up for higher levels', () => {
      expect(xpRequiredForLevel(2)).toBeGreaterThan(xpRequiredForLevel(1));
      expect(xpRequiredForLevel(3)).toBeGreaterThan(xpRequiredForLevel(2));
    });
  });

  describe('computeXpState', () => {
    it('starts at level 1 with 0 XP', () => {
      const state = computeXpState(0);
      expect(state.level).toBe(1);
      expect(state.currentLevelXp).toBe(0);
      expect(state.xpToNextLevel).toBe(100);
    });

    it('levels up at exactly the threshold', () => {
      const state = computeXpState(100);
      expect(state.level).toBe(2);
      expect(state.currentLevelXp).toBe(0);
    });

    it('partial progress within a level', () => {
      const state = computeXpState(50);
      expect(state.level).toBe(1);
      expect(state.currentLevelXp).toBe(50);
    });

    it('handles multi-level jumps', () => {
      const state = computeXpState(10_000);
      expect(state.level).toBeGreaterThan(5);
    });
  });

  describe('addXp', () => {
    it('adds XP and returns new total', () => {
      const { newTotal } = addXp(0, 50);
      expect(newTotal).toBe(50);
    });

    it('detects level-up', () => {
      const { leveledUp } = addXp(90, 20);
      expect(leveledUp).toBe(true);
    });

    it('no level-up when staying in same level', () => {
      const { leveledUp } = addXp(0, 50);
      expect(leveledUp).toBe(false);
    });

    it('ignores negative XP amounts', () => {
      const { newTotal } = addXp(100, -50);
      expect(newTotal).toBe(100);
    });
  });

  describe('scoreToXp', () => {
    it('perfect score gives full reward', () => {
      expect(scoreToXp(10, 10, 20)).toBe(20);
    });

    it('zero score gives 0 XP', () => {
      expect(scoreToXp(0, 10, 20)).toBe(0);
    });

    it('half score gives half reward', () => {
      expect(scoreToXp(5, 10, 20)).toBe(10);
    });

    it('score above max is capped', () => {
      expect(scoreToXp(15, 10, 20)).toBe(20);
    });

    it('handles zero maxScore gracefully', () => {
      expect(scoreToXp(5, 0)).toBe(0);
    });
  });
});
