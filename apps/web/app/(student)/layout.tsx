'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import NoorOwl from '@/components/NoorOwl';

const NAV = [
  { href: '/home',         emoji: '🏠', label: 'الرئيسية' },
  { href: '/leagues',      emoji: '🏆', label: 'الدوريات' },
  { href: '/plan',         emoji: '📋', label: 'خطتي'     },
  { href: '/shop',         emoji: '💎', label: 'المتجر'    },
  { href: '/profile',      emoji: '👤', label: 'ملفي'      },
];

const FULLSCREEN = ['/lesson/'];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { token, user, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) router.replace('/login');
    else if (user && user.role !== 'STUDENT') router.replace('/parent');
  }, [token, user, router]);

  if (!token || !user) return null;

  const hideNav = FULLSCREEN.some(p => pathname?.includes(p));

  return (
    <div className="min-h-screen bg-[#F5F6FA]" dir="rtl">

      {/* ── Desktop Sidebar ───────────────────────────── */}
      {!hideNav && (
        <aside className="hidden lg:flex flex-col fixed top-0 right-0 h-screen w-64 bg-white border-l border-gray-100 shadow-sm z-40">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
            <NoorOwl expression="happy" size={40} />
            <div>
              <p className="font-black text-[#1A1F5E] text-base leading-tight">الموجه الذكي</p>
              <p className="text-[11px] text-gray-400">منصة التعلم الذكي</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 p-3 flex-1 mt-2">
            {NAV.map(({ href, emoji, label }) => {
              const active = pathname === href || (href !== '/home' && (pathname?.startsWith(href) ?? false));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                    active
                      ? 'bg-[#1A1F5E] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#1A1F5E]',
                  )}
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-9 h-9 rounded-full bg-[#EEF0FF] flex items-center justify-center text-[#1A1F5E] font-black text-sm shrink-0">
                {user.firstName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-gray-400">الصف {user.gradeLevel}</p>
              </div>
            </div>
            <button
              onClick={() => { clearAuth(); router.replace('/login'); }}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut size={13} />
              تسجيل الخروج
            </button>
          </div>
        </aside>
      )}

      {/* ── Main content ─────────────────────────────── */}
      <main className={cn(
        'min-h-screen',
        !hideNav && 'lg:mr-64 pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0',
      )}>
        {children}
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────── */}
      {!hideNav && (
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 shadow-xl"
          dir="rtl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex h-[68px] max-w-lg mx-auto px-1">
            {NAV.map(({ href, emoji, label }) => {
              const active = pathname === href || (href !== '/home' && (pathname?.startsWith(href) ?? false));
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative"
                >
                  <motion.span
                    className="text-2xl leading-none"
                    animate={{ scale: active ? 1.15 : 1, opacity: active ? 1 : 0.5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {emoji}
                  </motion.span>
                  <span className={cn(
                    'text-[10px] font-semibold transition-colors',
                    active ? 'text-[#1A1F5E]' : 'text-gray-400',
                  )}>
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#1A1F5E]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
