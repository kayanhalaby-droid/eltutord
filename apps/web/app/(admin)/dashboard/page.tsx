'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { DashboardMetrics, ChartDataPoint } from '@/lib/types/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const METRIC_CARDS = [
  { key: 'totalUsers', label: 'إجمالي المستخدمين', icon: Users, color: 'text-blue-500', growthKey: 'userGrowth' },
  { key: 'activeUsersToday', label: 'نشطون اليوم (DAU)', icon: Activity, color: 'text-green-500' },
  { key: 'activeUsersMonth', label: 'نشطون هذا الشهر (MAU)', icon: TrendingUp, color: 'text-purple-500' },
  { key: 'totalRevenue', label: 'الإيرادات ₪', icon: DollarSign, color: 'text-gold', growthKey: 'revenueGrowth' },
] as const;

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['adminMetrics'],
    queryFn: () => apiFetch('/admin/metrics', { token: token! }),
    enabled: !!token,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ['adminChartData'],
    queryFn: () => apiFetch('/admin/metrics/chart', { token: token! }),
    enabled: !!token,
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand">لوحة الإحصائيات</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map(({ key, label, icon: Icon, color, growthKey }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`${color} shrink-0`} size={20} />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <p className="text-2xl font-extrabold text-brand">
                    {metrics?.[key].toLocaleString('ar-SA')}
                  </p>
                  {growthKey && metrics?.[growthKey] !== undefined && (
                    <p className="text-xs text-green-600 mt-1">
                      +{metrics[growthKey]}% عن الشهر الماضي
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DAU/MAU Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand font-extrabold">المستخدمون النشطون (DAU / MAU)</CardTitle>
        </CardHeader>
        <CardContent className="h-[340px]">
          {chartLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend formatter={(val) => val === 'dau' ? 'يومي' : 'شهري'} />
                <Line type="monotone" dataKey="dau" name="dau" stroke="#1A1F5E" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="mau" name="mau" stroke="#FFD700" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
