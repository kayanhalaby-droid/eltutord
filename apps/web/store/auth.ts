import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role: 'STUDENT' | 'PARENT' | 'ADMIN';
  gradeLevel?: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isPremium: boolean;
  plan: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setSubscription: (isPremium: boolean, plan: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isPremium: false,
      plan: null,
      setAuth: (token, user) => {
        if (typeof document !== 'undefined') {
          document.cookie = `elitutor-token=${token}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `elitutor-role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
        }
        set({ token, user });
      },
      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'elitutor-token=; path=/; max-age=0';
          document.cookie = 'elitutor-role=; path=/; max-age=0';
        }
        set({ token: null, user: null, isPremium: false, plan: null });
      },
      isAuthenticated: () => !!get().token,
      setSubscription: (isPremium, plan) => set({ isPremium, plan }),
    }),
    {
      name: 'elitutor-auth',
    },
  ),
);
