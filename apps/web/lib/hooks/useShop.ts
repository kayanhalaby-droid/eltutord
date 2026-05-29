import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'hearts' | 'streak' | 'xp' | 'bonus';
  isFree?: boolean;
  canAfford: boolean;
}

export function useShopItems() {
  const token = useAuthStore(s => s.token);
  return useQuery<ShopItem[]>({
    queryKey: ['shopItems'],
    queryFn: () => apiFetch('/shop/items', { token: token! }),
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

export function usePurchase() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<{ success: boolean; message: string }>('/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ itemId }),
        token: token!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopItems'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
      qc.invalidateQueries({ queryKey: ['hearts'] });
    },
  });
}
