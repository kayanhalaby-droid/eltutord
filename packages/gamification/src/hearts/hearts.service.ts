export const MAX_HEARTS = 5;
export const HEART_REFILL_MINUTES = 30;

export interface HeartsState {
  current: number;
  max: number;
  lastLostAt: Date | null;
}

export function createHeartsState(): HeartsState {
  return { current: MAX_HEARTS, max: MAX_HEARTS, lastLostAt: null };
}

export function loseHeart(state: HeartsState, now = new Date()): HeartsState {
  if (state.current <= 0) return state;
  return { ...state, current: state.current - 1, lastLostAt: now };
}

export function refillHearts(state: HeartsState, now = new Date()): HeartsState {
  if (state.current >= MAX_HEARTS || !state.lastLostAt) return state;

  const minutesElapsed = (now.getTime() - state.lastLostAt.getTime()) / 60_000;
  const heartsToRefill = Math.floor(minutesElapsed / HEART_REFILL_MINUTES);

  if (heartsToRefill <= 0) return state;

  const newCurrent = Math.min(state.current + heartsToRefill, MAX_HEARTS);
  // Advance lastLostAt by the refilled intervals so partial time is preserved
  const minutesUsed = heartsToRefill * HEART_REFILL_MINUTES;
  const newLastLostAt =
    newCurrent >= MAX_HEARTS
      ? null
      : new Date(state.lastLostAt.getTime() + minutesUsed * 60_000);

  return { ...state, current: newCurrent, lastLostAt: newLastLostAt };
}

export function minutesUntilNextHeart(state: HeartsState, now = new Date()): number {
  if (state.current >= MAX_HEARTS || !state.lastLostAt) return 0;
  const minutesElapsed = (now.getTime() - state.lastLostAt.getTime()) / 60_000;
  return Math.max(0, HEART_REFILL_MINUTES - (minutesElapsed % HEART_REFILL_MINUTES));
}
