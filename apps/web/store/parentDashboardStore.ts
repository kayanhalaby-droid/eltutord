import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ParentDashboardState {
  selectedChildId: string | null;
  setSelectedChildId: (childId: string | null) => void;
  activityDateRange: { from: Date | undefined; to: Date | undefined };
  setActivityDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  activitySubjectFilter: string | null;
  setActivitySubjectFilter: (subject: string | null) => void;
}

export const useParentDashboardStore = create<ParentDashboardState>()(
  persist(
    (set) => ({
      selectedChildId: null,
      setSelectedChildId: (childId) => set({ selectedChildId: childId }),
      activityDateRange: { from: undefined, to: undefined },
      setActivityDateRange: (range) => set({ activityDateRange: range }),
      activitySubjectFilter: null,
      setActivitySubjectFilter: (subject) => set({ activitySubjectFilter: subject }),
    }),
    {
      name: 'elitutor-parent-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedChildId: state.selectedChildId }),
    }
  )
);
