import {
  createHeartsState,
  loseHeart,
  refillHearts,
  minutesUntilNextHeart,
  MAX_HEARTS,
  HEART_REFILL_MINUTES,
} from './hearts.service';

describe('HeartsService', () => {
  const baseTime = new Date('2024-01-01T12:00:00Z');

  describe('createHeartsState', () => {
    it('starts with max hearts and no lastLostAt', () => {
      const state = createHeartsState();
      expect(state.current).toBe(MAX_HEARTS);
      expect(state.lastLostAt).toBeNull();
    });
  });

  describe('loseHeart', () => {
    it('decrements current by 1', () => {
      const state = createHeartsState();
      const next = loseHeart(state, baseTime);
      expect(next.current).toBe(MAX_HEARTS - 1);
      expect(next.lastLostAt).toEqual(baseTime);
    });

    it('does not go below 0', () => {
      let state = createHeartsState();
      for (let i = 0; i < MAX_HEARTS + 2; i++) {
        state = loseHeart(state, baseTime);
      }
      expect(state.current).toBe(0);
    });

    it('does not mutate the original state', () => {
      const state = createHeartsState();
      loseHeart(state, baseTime);
      expect(state.current).toBe(MAX_HEARTS);
    });
  });

  describe('refillHearts', () => {
    it('returns same state if already at max', () => {
      const state = createHeartsState();
      const next = refillHearts(state, baseTime);
      expect(next).toBe(state);
    });

    it('does not refill before interval elapses', () => {
      let state = loseHeart(createHeartsState(), baseTime);
      const soonAfter = new Date(baseTime.getTime() + 10 * 60_000);
      state = refillHearts(state, soonAfter);
      expect(state.current).toBe(MAX_HEARTS - 1);
    });

    it('refills one heart after HEART_REFILL_MINUTES', () => {
      let state = loseHeart(createHeartsState(), baseTime);
      const later = new Date(baseTime.getTime() + HEART_REFILL_MINUTES * 60_000);
      state = refillHearts(state, later);
      expect(state.current).toBe(MAX_HEARTS);
      expect(state.lastLostAt).toBeNull();
    });

    it('refills multiple hearts proportionally', () => {
      let state = createHeartsState();
      for (let i = 0; i < 3; i++) state = loseHeart(state, baseTime);
      const later = new Date(baseTime.getTime() + 2 * HEART_REFILL_MINUTES * 60_000);
      state = refillHearts(state, later);
      expect(state.current).toBe(MAX_HEARTS - 1);
    });

    it('does not exceed MAX_HEARTS', () => {
      let state = loseHeart(createHeartsState(), baseTime);
      const wayLater = new Date(baseTime.getTime() + 10 * HEART_REFILL_MINUTES * 60_000);
      state = refillHearts(state, wayLater);
      expect(state.current).toBe(MAX_HEARTS);
    });
  });

  describe('minutesUntilNextHeart', () => {
    it('returns 0 when at max hearts', () => {
      const state = createHeartsState();
      expect(minutesUntilNextHeart(state, baseTime)).toBe(0);
    });

    it('returns remaining minutes correctly', () => {
      const state = loseHeart(createHeartsState(), baseTime);
      const tenMinutesLater = new Date(baseTime.getTime() + 10 * 60_000);
      const remaining = minutesUntilNextHeart(state, tenMinutesLater);
      expect(remaining).toBeCloseTo(HEART_REFILL_MINUTES - 10, 0);
    });
  });
});
