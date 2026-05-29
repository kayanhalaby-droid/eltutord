'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Gift, Settings, FileBarChart, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import NoorOwl from '@/components/NoorOwl';

const NAV = [
  { href: '/parent', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/parent/rewards', label: 'الجوائز', icon: Gift },
  { href: '/parent/report', label: 'التقارير', icon: FileBarChart },
  { href: '/parent/settings', label: 'الإعدادات', icon: Settings },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { token, user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (user && user.role !== 'PARENT') router.replace('/home');
  }, [token, user, router]);

  if (!token || (user && user.role !== 'PARENT')) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 right-0 h-screen w-56 bg-white border-l border-gray-200 shadow-sm z-40">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <NoorOwl expression="happy" size={36} />
          <div>
            <p className="font-extrabold text-brand text-[14px] leading-tight">الموجه الذكي</p>
            <p className="text-[11px] text-muted-foreground">لوحة الأهل</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1 mt-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href) && href !== '/parent';
            const isActive = exact ? pathname === href : pathname !== '/parent' && pathname?.startsWith(href);
            const finalActive = exact ? pathname === '/parent' : isActive;
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                  finalActive ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-brand',
                )}>
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-extrabold text-sm">
              {user?.firstName?.charAt(0)}
            </div>
            <p className="text-sm font-bold text-gray-700 truncate">{user?.firstName}</p>
          </div>
          <button
            onClick={() => { clearAuth(); router.replace('/login'); }}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 w-full px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex h-[64px]">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === '/parent' : pathname?.startsWith(href) && href !== '/parent';
            return (
              <Link key={href} href={href}
                className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors', active ? 'text-brand' : 'text-gray-400')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:mr-56 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
