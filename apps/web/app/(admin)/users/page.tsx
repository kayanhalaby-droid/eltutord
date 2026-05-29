'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, Coins } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { AdminUser } from '@/lib/types/admin';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const adjustSchema = z.object({
  xp: z.coerce.number().int(),
  gems: z.coerce.number().int(),
});
type AdjustValues = z.infer<typeof adjustSchema>;

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'مدير',
  STUDENT: 'طالب',
  PARENT: 'ولي أمر',
};

export default function UsersManagementPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['adminUsers'],
    queryFn: () => apiFetch('/admin/users', { token: token! }),
    enabled: !!token,
  });

  const adjustMutation = useMutation({
    mutationFn: (data: { userId: string; xp: number; gems: number }) =>
      apiFetch(`/admin/users/${data.userId}/resources`, {
        method: 'PUT',
        body: JSON.stringify({ xp: data.xp, gems: data.gems }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('تم تعديل الموارد بنجاح');
      setSelectedUser(null);
    },
    onError: () => toast.error('فشل تعديل الموارد'),
  });

  const { register, handleSubmit, reset } = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
  });

  const openModal = (user: AdminUser) => {
    setSelectedUser(user);
    reset({ xp: user.xp, gems: user.gems });
  };

  const onSubmit = (data: AdjustValues) => {
    if (selectedUser) adjustMutation.mutate({ userId: selectedUser.id, ...data });
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'firstName',
      header: 'الاسم',
      cell: ({ row }) => (
        <span className="font-medium text-brand">
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'الهاتف',
      cell: ({ getValue }) => <span className="text-muted-foreground" dir="ltr">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'role',
      header: 'الدور',
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return (
          <Badge variant={role === 'ADMIN' ? 'destructive' : role === 'PARENT' ? 'warning' : 'default'}>
            {ROLE_LABEL[role] ?? role}
          </Badge>
        );
      },
    },
    { accessorKey: 'xp', header: '⭐ XP' },
    { accessorKey: 'gems', header: '💎 جواهر' },
    { accessorKey: 'streak', header: '🔥 سلسلة' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openModal(row.original)}>
          <Coins size={14} className="ml-1" />
          تعديل
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand">إدارة المستخدمين</h1>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <DataTable columns={columns} data={users ?? []} searchKey="phone" searchPlaceholder="بحث برقم الهاتف..." />
        </div>
      )}

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`تعديل موارد: ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">XP</label>
            <Input type="number" {...register('xp')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-brand">جواهر</label>
            <Input type="number" {...register('gems')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>إلغاء</Button>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {adjustMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
