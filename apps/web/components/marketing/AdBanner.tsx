'use client';

import Link from 'next/link';

type Plan = 'BASIC' | 'ELITE' | 'VIP';

interface AdBannerProps {
  plan: Plan;
}

export function AdBanner({ plan }: AdBannerProps) {
  if (plan !== 'BASIC') return null;

  return (
    <div
      data-testid="ad-banner"
      className="w-full bg-gradient-to-l from-[#1A1F5E] to-[#2D3580] rounded-2xl p-4 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">⚡</span>
        <div className="min-w-0">
          <p className="text-white font-extrabold text-sm">حوّل إلى Elite</p>
          <p className="text-white/60 text-xs truncate">احصل على الوصول الكامل لجميع الدروس والمواد</p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 px-4 py-2 bg-[#FFD700] text-[#1A1F5E] rounded-xl font-black text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap min-h-[44px] flex items-center"
      >
        ترقية الآن
      </Link>
    </div>
  );
}
