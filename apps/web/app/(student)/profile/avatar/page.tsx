'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useAvatarStore } from '@/store/avatar';
import { apiFetch } from '@/lib/api';
import { AVATAR_CATALOG, type AvatarSlot } from '@/lib/avatar-catalog';
import { AvatarShopWidget } from '@/components/shop/AvatarShopWidget';
import NoorOwl from '@/components/NoorOwl';
import { toast } from 'sonner';

const SLOT_EMOJI: Record<AvatarSlot, string> = {
  hat:        '🎩',
  accessory:  '💍',
  color:      '🎨',
  background: '🌌',
};

export default function AvatarPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { inventory, equipped, addToInventory, setEquipped } = useAvatarStore();

  const { data: gemsData } = useQuery<{ gems: number }>({
    queryKey: ['gems'],
    queryFn: () => apiFetch('/gamification/gems', { token: token! }),
    enabled: !!token,
  });
  const gems = gemsData?.gems ?? 0;

  const purchaseMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiFetch('/gamification/shop/purchase-avatar', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ itemId }),
      }),
    onSuccess: (_data, itemId) => {
      addToInventory(itemId);
      const item = AVATAR_CATALOG.find((i) => i.id === itemId);
      toast.success(`تم شراء ${item?.nameAr ?? 'العنصر'}! ${item?.emoji ?? ''}`);
    },
    onError: () => toast.error('حدث خطأ أثناء الشراء'),
  });

  const equippedItems = Object.entries(equipped)
    .filter(([, id]) => id !== null)
    .map(([slot, id]) => AVATAR_CATALOG.find((i) => i.id === id)?.emoji ?? '')
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white px-4 pt-safe pb-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="رجوع"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black">تخصيص نور</h1>
            <p className="text-white/60 text-xs">اشترِ إكسسوارات وزيّن بومة نور</p>
          </div>
          <div className="mr-auto flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-lg">💎</span>
            <span className="font-black text-[#FFD700]">{gems}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Preview */}
        <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium">معاينة نور</p>
          <div className="relative">
            <NoorOwl
              expression={equipped.hat ? 'phd' : equipped.accessory ? 'proud' : 'happy'}
              size={120}
              animate
            />
            {equippedItems && (
              <div className="absolute -top-2 -right-2 bg-[#FFD700] rounded-full px-2 py-0.5 text-xs font-black text-[#1A1F5E] shadow">
                {equippedItems}
              </div>
            )}
          </div>
          {/* Equipped slots row */}
          <div className="flex gap-3 flex-wrap justify-center">
            {(Object.keys(SLOT_EMOJI) as AvatarSlot[]).map((slot) => {
              const eqId = equipped[slot];
              const item = eqId ? AVATAR_CATALOG.find((i) => i.id === eqId) : null;
              return (
                <button
                  key={slot}
                  onClick={() => eqId && setEquipped(slot, null)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-colors min-h-[44px]
                    ${item ? 'border-[#1A1F5E] bg-[#EEF0FF] text-[#1A1F5E]' : 'border-gray-200 bg-gray-50 text-gray-400'}`}
                  title={item ? `إزالة ${item.nameAr}` : `لا يوجد ${SLOT_EMOJI[slot]}`}
                >
                  <span>{SLOT_EMOJI[slot]}</span>
                  <span className="text-xs">{item ? item.emoji : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Owned Items — equip from inventory */}
        {inventory.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-extrabold text-[#1A1F5E] mb-3">مخزونك ({inventory.length})</h2>
            <div className="flex flex-wrap gap-3">
              {inventory.map((id) => {
                const item = AVATAR_CATALOG.find((i) => i.id === id);
                if (!item) return null;
                const isEquipped = equipped[item.slot] === id;
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setEquipped(item.slot, isEquipped ? null : id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 min-h-[44px] transition-all
                      ${isEquipped ? 'border-[#FFD700] bg-[#FFFBE6]' : 'border-gray-200 bg-white hover:border-[#1A1F5E]'}`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-bold text-gray-600">{item.nameAr}</span>
                    {isEquipped && <span className="text-[10px] text-[#FFD700] font-black">مُرتدى</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shop */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-[#1A1F5E] mb-4">المتجر</h2>
          <AvatarShopWidget
            gemsBalance={gems}
            ownedIds={inventory}
            onPurchase={(itemId) => purchaseMutation.mutate(itemId)}
          />
        </div>
      </div>
    </div>
  );
}
