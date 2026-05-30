'use client';
import { useState, useCallback } from 'react';

export type AgeGroup = '6-7' | '8-9' | '10-11' | '12-13' | '14-15' | '16+';
export type Subject = 'رياضيات' | 'עברית' | 'عربي' | 'English';
export type DailyGoal = 5 | 15 | 30;
export type PlacementLevel = 'beginner' | 'intermediate' | 'advanced';

export interface OnboardingData {
  ageGroup: AgeGroup | null;
  subject: Subject | null;
  grade: number | null;
  motivation: string | null;
  dailyGoal: DailyGoal | null;
  trialScore: number;
  trialTotal: number;
  placementScore: number;
  placementLevel: PlacementLevel;
  guestProgress: Record<string, { score: number; completedAt: string }>;
}

const STORAGE_KEY = 'elitutor-onboarding';

function defaultState(): OnboardingData {
  return {
    ageGroup: null, subject: null, grade: null,
    motivation: null, dailyGoal: null,
    trialScore: 0, trialTotal: 0,
    placementScore: 0, placementLevel: 'beginner',
    guestProgress: {},
  };
}

function getInitialState(): OnboardingData {
  if (typeof window === 'undefined') return defaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultState(), ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultState();
}

export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(getInitialState);

  const update = useCallback((patch: Partial<OnboardingData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const addGuestLesson = useCallback((lessonId: string, score: number) => {
    setData(prev => {
      const next = {
        ...prev,
        guestProgress: {
          ...prev.guestProgress,
          [lessonId]: { score, completedAt: new Date().toISOString() },
        },
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setData(defaultState());
  }, []);

  const computePlacementLevel = useCallback((score: number, total: number): PlacementLevel => {
    const pct = total > 0 ? score / total : 0;
    if (pct >= 0.7) return 'advanced';
    if (pct >= 0.4) return 'intermediate';
    return 'beginner';
  }, []);

  return { data, update, addGuestLesson, clear, computePlacementLevel };
}
