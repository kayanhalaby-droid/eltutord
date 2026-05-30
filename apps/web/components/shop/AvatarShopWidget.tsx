'use client';

import { motion } from 'framer-motion';
import { AVATAR_CATALOG, type AvatarSlot } from '@/lib/avatar-catalog';

const SLOT_LABELS: Record<AvatarSlot, string> = {
  hat:        'قبعات',
  accessory:  'إكسسوارات',
  color:      'ألوان',
  background: 'خلفيات',
};

interface AvatarShopWidgetProps {
  gemsBalance: number;
  ownedIds?: string[];
  onPurchase: (itemId: string) => void;
}

export function AvatarShopWidget({ gemsBalance, ownedIds = [], onPurchase }: AvatarShopWidgetProps) {
  const slots = (Object.keys(SLOT_LABELS) as AvatarSlot[]);

  return (
    <div className="flex flex-col gap-6">
      {slots.map((slot) => {
        const items = AVATAR_CATALOG.filter((i) => i.slot === slot);
        return (
          <div key={slot}>
            <h3 className="font-extrabold text-[#1A1F5E] text-sm mb-3">{SLOT_LABELS[slot]}</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const owned = ownedIds.includes(item.id);
                const canAfford = gemsBalance >= item.cost;
                return (
                  <div
                    key={item.id}
                    data-testid="avatar-item"
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all
                      ${owned
                        ? 'border-[#22C55E] bg-green-50'
                        : 'border-gray-200 bg-white hover:border-[#1A1F5E]'}`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-xs font-bold text-gray-700 text-center leading-tight">{item.nameAr}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#1A1F5E]">
                      <span>💎</span>
                      <span>{item.cost}</span>
                    </div>
                    {owned ? (
                      <span className="text-xs text-[#22C55E] font-bold">✓ مملوك</span>
                    ) : (
                      <motion.button
                        data-testid="buy-btn"
                        whileTap={{ scale: 0.95 }}
                        disabled={!canAfford}
                        onClick={() => onPurchase(item.id)}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors
                          ${canAfford
                            ? 'bg-[#1A1F5E] text-white hover:bg-[#2D3580]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        {canAfford ? 'شراء' : 'لا يكفي'}
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
