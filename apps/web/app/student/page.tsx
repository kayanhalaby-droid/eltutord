'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function StudentPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (user && user.role !== 'STUDENT') { router.replace('/parent'); return; }
    router.replace('/home');
  }, [token, user, router]);

  return null;
}
