'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { AdminSubject } from '@/lib/types/admin';
import CurriculumTree from '@/components/admin/curriculum/CurriculumTree';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const subjectSchema = z.object({
  name: z.string().min(2, 'اسم المادة مطلوب'),
  gradeLevel: z.coerce.number().int().min(1).max(12),
  description: z.string().optional(),
});
type SubjectValues = z.infer<typeof subjectSchema>;

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function CurriculumManagementPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: subjects, isLoading } = useQuery<AdminSubject[]>({
    queryKey: ['adminSubjects'],
    queryFn: () => apiFetch('/admin/curriculum/subjects', { token: token! }),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: (data: SubjectValues) => {
      if (editingSubject) {
        return apiFetch(`/admin/curriculum/subjects/${editingSubject.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
          token: token!,
        });
      }
      return apiFetch('/admin/curriculum/subjects', {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
      toast.success(editingSubject ? 'تم تحديث المادة' : 'تمت إضافة المادة');
      closeModal();
    },
    onError: () => toast.error('فشلت العملية'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectValues>({
    resolver: zodResolver(subjectSchema),
  });

  const openAdd = () => {
    setEditingSubject(null);
    reset({ name: '', gradeLevel: 1, description: '' });
    setIsModalOpen(true);
  };

  const openEdit = (subject: AdminSubject) => {
    setEditingSubject(subject);
    reset({ name: subject.name, gradeLevel: subject.gradeLevel, description: subject.description ?? '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand">إدارة المناهج</h1>
        <Button onClick={openAdd}>
          <Plus size={16} className="ml-2" />
          إضافة مادة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <CurriculumTree subjects={subjects ?? []} onEdit={openEdit} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
      >
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">اسم المادة</label>
            <Input placeholder="مثال: الرياضيات" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">الصف الدراسي</label>
            <select
              {...register('gradeLevel')}
              className="h-11 rounded-lg border-2 border-border bg-background px-4 text-sm focus:border-brand focus:outline-none"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>الصف {g}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">الوصف (اختياري)</label>
            <Input placeholder="وصف المادة..." {...register('description')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>إلغاء</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : editingSubject ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
