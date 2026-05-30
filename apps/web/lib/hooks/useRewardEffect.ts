'use client';

import { useState, useCallback } from 'react';

const EFFECT_DURATION_MS = 2500;

export function useRewardEffect() {
  const [fireworksActive, setFireworksActive] = useState(false);
  const [starFallActive, setStarFallActive] = useState(false);

  const triggerFireworks = useCallback(() => {
    setFireworksActive(true);
    setTimeout(() => setFireworksActive(false), EFFECT_DURATION_MS);
  }, []);

  const triggerStarFall = useCallback(() => {
    setStarFallActive(true);
    setTimeout(() => setStarFallActive(false), EFFECT_DURATION_MS);
  }, []);

  return { fireworksActive, starFallActive, triggerFireworks, triggerStarFall };
}
