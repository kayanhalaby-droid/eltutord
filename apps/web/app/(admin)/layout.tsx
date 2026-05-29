'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import NoorOwl from '@/components/NoorOwl';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin/dashboard', label: 'الإحصائيات', icon: LayoutDashboard },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/curriculum', label: 'المناهج', icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (user && user.role !== 'ADMIN') router.replace('/home');
  }, [token, user, router]);

  if (!token || (user && user.role !== 'ADMIN')) return null;

  return (
    <div className="flex min-h-screen bg-slate-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-56 bg-brand text-white flex flex-col shadow-xl">
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <NoorOwl expression="happy" size={36} />
          <div>
            <p className="font-extrabold text-gold text-sm">إيليتوتور</p>
            <p className="text-xs text-white/60">لوحة الإدارة</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname.startsWith(href)
                  ? 'bg-white/20 text-gold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => { clearAuth(); router.replace('/login'); }}
          className="flex items-center gap-3 px-6 py-4 text-white/60 hover:text-white text-sm transition-colors border-t border-white/10"
        >
          <LogOut size={16} />
          خروج
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
