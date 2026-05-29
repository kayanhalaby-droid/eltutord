'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  phone: z.string().min(9, 'رقم الهاتف غير صحيح').max(15),
  password: z.string().min(4, 'كلمة المرور قصيرة جداً'),
});
type FormValues = z.infer<typeof schema>;

type LoginMode = 'student' | 'parent';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<LoginMode>('student');

  const handleGuestLogin = () => {
    setAuth('guest-dev-token', {
      id: 'guest-user',
      firstName: 'زائر',
      lastName: '',
      role: 'STUDENT',
      gradeLevel: 3,
    });
    router.replace('/home');
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const data = await apiFetch<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setAuth(data.access_token, data.user);
      router.replace(data.user.role === 'PARENT' ? '/parent' : '/home');
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    }
  };

  const switchMode = (m: LoginMode) => {
    setMode(m);
    reset();
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand to-brand-light p-4" dir="rtl">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <NoorOwl
          expression={mode === 'parent' ? 'proud' : 'happy'}
          size={110}
          animate
          message={mode === 'parent' ? 'مرحباً وليّ الأمر! 🦉' : 'أهلاً! أنا نور 🦉 موجّهتك الذكية'}
        />

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-brand">الموجه الذكي</h1>
          <p className="text-muted-foreground mt-1 text-sm">تسجيل الدخول</p>
        </div>

        {/* Mode switcher */}
        <div className="flex w-full bg-gray-100 rounded-2xl p-1 gap-1">
          <button
            className={cn(
              'flex-1 py-2.5 rounded-xl font-bold text-sm transition-all',
              mode === 'student' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
            onClick={() => switchMode('student')}
          >
            🎒 أنا طالب
          </button>
          <button
            className={cn(
              'flex-1 py-2.5 rounded-xl font-bold text-sm transition-all',
              mode === 'parent' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
            onClick={() => switchMode('parent')}
          >
            👨‍👩‍👧 أنا وليّ أمر
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'parent' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {mode === 'parent' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-800 font-semibold text-center">
                ستصل لـ لوحة الأهل بعد الدخول
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-brand">رقم الهاتف</label>
                <Input
                  type="tel"
                  placeholder="0501234567"
                  autoComplete="tel"
                  {...register('phone')}
                  className={cn(errors.phone && 'border-destructive')}
                />
                {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-brand">كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(errors.password && 'border-destructive')}
                />
                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm text-center bg-red-50 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                size="lg"
                className={cn(
                  'w-full mt-1 font-extrabold',
                  mode === 'parent' && 'bg-amber-500 hover:bg-amber-600',
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
                {mode === 'parent' ? '🏠 دخول لوحة الأهل' : 'دخول'}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>

        {mode === 'student' && (
          <>
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-muted-foreground">أو</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-dashed border-brand/40 text-brand hover:bg-brand/5"
              onClick={handleGuestLogin}
            >
              🦉 جرّب بدون تسجيل دخول
            </Button>
          </>
        )}

        <p className="text-sm text-muted-foreground">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-brand font-semibold hover:underline">
            سجّل الآن
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
