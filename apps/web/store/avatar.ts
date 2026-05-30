import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarSlot } from '@/lib/avatar-catalog';

interface EquippedItems {
  hat: string | null;
  accessory: string | null;
  color: string | null;
  background: string | null;
}

interface AvatarState {
  inventory: string[];
  equipped: EquippedItems;
  addToInventory: (itemId: string) => void;
  setEquipped: (slot: AvatarSlot, itemId: string | null) => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      inventory: [],
      equipped: { hat: null, accessory: null, color: null, background: null },
      addToInventory: (itemId) =>
        set((s) => ({
          inventory: s.inventory.includes(itemId) ? s.inventory : [...s.inventory, itemId],
        })),
      setEquipped: (slot, itemId) =>
        set((s) => ({ equipped: { ...s.equipped, [slot]: itemId } })),
    }),
    { name: 'elitutor-avatar' },
  ),
);
