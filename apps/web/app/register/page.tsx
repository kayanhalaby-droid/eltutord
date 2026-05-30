'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { buildRegisterPayload } from '@/lib/utm';

const schema = z
  .object({
    firstName: z.string().min(2, 'الاسم الأول مطلوب'),
    lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
    phone: z.string().min(9, 'رقم الهاتف غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string(),
    role: z.enum(['STUDENT', 'PARENT']),
    gradeLevel: z.coerce.number().int().min(1).max(12).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتان',
    path: ['confirmPassword'],
  })
  .refine((d) => d.role !== 'STUDENT' || (d.gradeLevel && d.gradeLevel >= 1), {
    message: 'الصف الدراسي مطلوب للطالب',
    path: ['gradeLevel'],
  });

type FormValues = z.infer<typeof schema>;

const GRADES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `الصف ${i + 1}` }));

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  const role = watch('role');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const payload = buildRegisterPayload({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        password: values.password,
        role: values.role,
        gradeLevel: values.gradeLevel,
      });
      const data = await apiFetch<{ access_token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuth(data.access_token, data.user);
      router.replace(data.user.role === 'PARENT' ? '/parent' : '/home');
    } catch (err: any) {
      setError(err.message || 'خطأ في التسجيل');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand to-brand-light p-4 py-8">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <NoorOwl expression="excited" size={80} animate />

        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-brand">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground mt-1 text-sm">انضم إلى الموجه الذكي</p>
        </div>

        {/* Role Toggle */}
        <div className="flex w-full rounded-xl border-2 border-brand overflow-hidden">
          {(['STUDENT', 'PARENT'] as const).map((r) => (
            <label
              key={r}
              className={cn(
                'flex-1 text-center py-2.5 text-sm font-bold cursor-pointer transition-all',
                role === r ? 'bg-brand text-gold' : 'bg-white text-brand',
              )}
            >
              <input type="radio" value={r} className="hidden" {...register('role')} />
              {r === 'STUDENT' ? '👨‍🎓 طالب' : '👨‍👩‍👧 ولي أمر'}
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-brand">الاسم الأول</label>
              <Input placeholder="أحمد" {...register('firstName')} className={cn(errors.firstName && 'border-destructive')} />
              {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-brand">الاسم الأخير</label>
              <Input placeholder="علي" {...register('lastName')} className={cn(errors.lastName && 'border-destructive')} />
              {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">رقم الهاتف</label>
            <Input type="tel" placeholder="0501234567" {...register('phone')} className={cn(errors.phone && 'border-destructive')} />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
          </div>

          {role === 'STUDENT' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-brand">الصف الدراسي</label>
              <div className="relative">
                <select
                  {...register('gradeLevel')}
                  className="w-full h-11 rounded-lg border-2 border-border bg-background px-4 py-2 text-sm appearance-none text-right focus:border-brand focus:outline-none"
                >
                  <option value="">اختر صفك</option>
                  {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
              {errors.gradeLevel && <p className="text-destructive text-xs">{errors.gradeLevel.message}</p>}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" {...register('password')} className={cn(errors.password && 'border-destructive')} />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">تأكيد كلمة المرور</label>
            <Input type="password" placeholder="••••••••" {...register('confirmPassword')} className={cn(errors.confirmPassword && 'border-destructive')} />
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
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

          <Button type="submit" size="lg" className="w-full mt-1" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
            إنشاء الحساب
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          لديك حساب؟{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
