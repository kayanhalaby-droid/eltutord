import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface Flashcard {
  id: string;
  lessonId: string;
  front: string;
  back: string;
  transliteration: string;
  dueDate: string;
  interval: number;
  repetitions: number;
}

export interface FlashcardStats {
  total: number;
  dueToday: number;
  todayReviewed: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export function useFlashcardStats() {
  const token = useAuthStore((s) => s.token);
  return useQuery<FlashcardStats>({
    queryKey: ['flashcard-stats'],
    queryFn: () => apiFetch<FlashcardStats>('/flashcards/stats', { token: token! }),
    enabled: !!token,
    refetchInterval: 60_000,
  });
}

export function useDueFlashcards() {
  const token = useAuthStore((s) => s.token);
  return useQuery<{ cards: Flashcard[]; total: number }>({
    queryKey: ['flashcards-due'],
    queryFn: () => apiFetch('/flashcards/due', { token: token! }),
    enabled: !!token,
  });
}

export function useAddLessonFlashcards() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation<{ added: number; total?: number }, Error, string>({
    mutationFn: (lessonId: string) =>
      apiFetch(`/flashcards/add-lesson/${lessonId}`, { method: 'POST', token: token! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcard-stats'] });
      qc.invalidateQueries({ queryKey: ['flashcards-due'] });
    },
  });
}

export function useReviewCard() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation<{ id: string; nextDueDate: string; interval: number }, Error, { cardId: string; difficulty: Difficulty }>({
    mutationFn: ({ cardId, difficulty }) =>
      apiFetch('/flashcards/review', {
        method: 'POST',
        body: JSON.stringify({ cardId, difficulty }),
        token: token!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards-due'] });
      qc.invalidateQueries({ queryKey: ['flashcard-stats'] });
      qc.invalidateQueries({ queryKey: ['daily-quests'] });
    },
  });
}
