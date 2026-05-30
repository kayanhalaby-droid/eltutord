'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Metrics {
  totalUsers: number;
  activeToday: number;
  premiumSubscribers: number;
  weeklyXpAwarded: number;
}

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  totalXp: number;
  gemsBalance: number;
  hearts: number;
  createdAt: string;
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdjustResourcesDto {
  hearts?: number;
  gems?: number;
  xp?: number;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm opacity-80 text-right">{label}</p>
    </div>
  );
}

// ── Adjust Resources Modal ────────────────────────────────────────────────────

function AdjustModal({
  user,
  token,
  onClose,
}: {
  user: UserRow;
  token: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [hearts, setHearts] = useState(user.hearts);
  const [gems, setGems] = useState(user.gemsBalance);
  const [xp, setXp] = useState(user.totalXp);

  const mutation = useMutation({
    mutationFn: (dto: AdjustResourcesDto) =>
      apiFetch(`/api/admin/users/${user.id}/resources`, {
        method: 'PUT',
        body: JSON.stringify(dto),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" dir="rtl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          تعديل موارد {user.firstName} {user.lastName}
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">❤️ القلوب</label>
            <input
              type="number"
              min={0}
              max={10}
              value={hearts}
              onChange={(e) => setHearts(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">💎 الجواهر</label>
            <input
              type="number"
              min={0}
              value={gems}
              onChange={(e) => setGems(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">⭐ نقاط XP</label>
            <input
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => mutation.mutate({ hearts, gems, xp })}
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm mt-2 text-center">حدث خطأ، حاول مجدداً</p>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<UserRow | null>(null);

  // Role guard
  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (user?.role !== 'ADMIN') { router.replace('/'); }
  }, [token, user, router]);

  // KPI metrics
  const { data: metrics } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: () => apiFetch('/api/admin/metrics', { token: token! }),
    enabled: !!token,
    staleTime: 60_000,
  });

  // Users list
  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      apiFetch(
        `/api/admin/users?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        { token: token! },
      ),
    enabled: !!token,
  });

  if (!token || user?.role !== 'ADMIN') return null;

  const ROLE_LABELS: Record<string, string> = {
    STUDENT: 'طالب',
    PARENT: 'ولي أمر',
    ADMIN: 'مدير',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-gray-500 mt-1">مرحباً، {user.firstName} — إليك نظرة عامة على المنصة</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="إجمالي المستخدمين"
            value={metrics?.totalUsers ?? '—'}
            icon="👥"
            color="bg-blue-600"
          />
          <KpiCard
            label="نشطون اليوم"
            value={metrics?.activeToday ?? '—'}
            icon="🔥"
            color="bg-orange-500"
          />
          <KpiCard
            label="مشتركون بريميوم"
            value={metrics?.premiumSubscribers ?? '—'}
            icon="💎"
            color="bg-purple-600"
          />
          <KpiCard
            label="XP هذا الأسبوع"
            value={metrics?.weeklyXpAwarded?.toLocaleString('ar') ?? '—'}
            icon="⭐"
            color="bg-green-600"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">المستخدمون</h2>
            <input
              type="text"
              placeholder="بحث بالاسم أو الإيميل..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 text-right"
            />
          </div>

          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="p-10 text-center text-gray-400">جاري التحميل...</div>
            ) : usersData?.users.length === 0 ? (
              <div className="p-10 text-center text-gray-400">لا توجد نتائج</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">الاسم</th>
                    <th className="px-4 py-3 text-right font-medium">الدور</th>
                    <th className="px-4 py-3 text-right font-medium">XP</th>
                    <th className="px-4 py-3 text-right font-medium">جواهر</th>
                    <th className="px-4 py-3 text-right font-medium">قلوب</th>
                    <th className="px-4 py-3 text-center font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usersData?.users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{u.totalXp.toLocaleString('ar')}</td>
                      <td className="px-4 py-3 text-gray-700">💎 {u.gemsBalance}</td>
                      <td className="px-4 py-3 text-gray-700">❤️ {u.hearts}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setAdjustTarget(u)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <span>
                {(page - 1) * 20 + 1}–{Math.min(page * 20, usersData.total)} من {usersData.total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(usersData.totalPages, p + 1))}
                  disabled={page === usersData.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Resources Modal */}
      {adjustTarget && (
        <AdjustModal
          user={adjustTarget}
          token={token!}
          onClose={() => setAdjustTarget(null)}
        />
      )}
    </div>
  );
}
