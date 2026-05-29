'use client';

import { useState, useCallback } from 'react';

type PaywallTrigger = 'hearts-empty' | 'unit-3' | 'streak-7' | 'quiz-95';

export function usePaywall() {
  const [activeTrigger, setActiveTrigger] = useState<PaywallTrigger | null>(null);

  const checkPaywall = useCallback((trigger: PaywallTrigger, isSubscribed: boolean) => {
    if (isSubscribed) return false;
    // Don't re-show same trigger twice per session
    const shown = sessionStorage.getItem(`paywall_shown_${trigger}`);
    if (shown) return false;
    sessionStorage.setItem(`paywall_shown_${trigger}`, '1');
    setActiveTrigger(trigger);
    return true;
  }, []);

  const closePaywall = useCallback(() => setActiveTrigger(null), []);

  return { activeTrigger, checkPaywall, closePaywall };
}
