'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    // TEACHER role will be added to auth store when teacher login is implemented
  }, [token, user]);

  if (!token) return null;
  return <>{children}</>;
}
