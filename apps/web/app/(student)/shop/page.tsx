'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useShopItems, usePurchase } from '@/lib/hooks/useShop';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import NoorOwl from '@/components/NoorOwl';

interface RewardLevel { gems: number; name: string; active: boolean; expiresAt: string | null }
interface ParentRewards { small: RewardLevel; medium: RewardLevel; large: RewardLevel }
interface MyRequest { id: string; level: string; name: string; gems: number; status: 'pending' | 'approved' | 'claimed' | 'deferred' }

const REWARD_META: Record<string, { emoji: string; label: string; color: string; gems: number }> = {
  small:  { emoji: '🎁', label: 'الجائزة الصغيرة',  color: 'from-emerald-400 to-green-600',  gems: 200  },
  medium: { emoji: '🎮', label: 'الجائزة المتوسطة', color: 'from-blue-400 to-indigo-600',    gems: 500  },
  large:  { emoji: '🚗', label: 'الجائزة الكبيرة',  color: 'from-purple-400 to-pink-600',    gems: 2000 },
};

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; btn: string }> = {
  hearts: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    btn: 'bg-red-500 hover:bg-red-600' },
  streak: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-600',   btn: 'bg-blue-500 hover:bg-blue-600' },
  xp:     { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-600' },
  bonus:  { bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-600',   btn: 'bg-cyan-500 hover:bg-cyan-600' },
};

export default function ShopPage() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const [confirmItem, setConfirmItem] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [requestingLevel, setRequestingLevel] = useState<string | null>(null);

  const { data: items = [], isLoading } = useShopItems();
  const { data: gemsResp } = useQuery<{ gems: number }>({
    queryKey: ['gems'],
    queryFn: () => apiFetch('/gamification/gems', { token: token! }),
    enabled: !!token,
  });
  const gems = gemsResp?.gems ?? 0;

  const { data: parentRewards } = useQuery<ParentRewards>({
    queryKey: ['parentRewardsStudent'],
    queryFn: () => apiFetch('/parents/rewards', { token: token! }),
    enabled: !!token,
    staleTime: 60_000,
  });

  const { data: myRequestsData } = useQuery<{ requests: MyRequest[] }>({
    queryKey: ['myRewardRequests'],
    queryFn: () => apiFetch('/gamification/rewards/my-requests', { token: token! }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const myRequests = myRequestsData?.requests ?? [];

  const { mutate: requestReward, isPending: isRequesting } = useMutation({
    mutationFn: (level: string) => apiFetch('/gamification/rewards/request', { method: 'POST', token: token!, body: JSON.stringify({ level }) }),
    onSuccess: () => {
      toast.success('تم إرسال الطلب! سيُبلَّغ أهلك على واتساب 📲');
      qc.invalidateQueries({ queryKey: ['myRewardRequests'] });
      setRequestingLevel(null);
    },
    onError: () => { toast.error('حدث خطأ، حاول مجدداً'); setRequestingLevel(null); },
  });

  const { mutate: claimReward } = useMutation({
    mutationFn: (id: string) => apiFetch(`/gamification/rewards/claim/${id}`, { method: 'POST', token: token! }),
    onSuccess: () => {
      toast.success('🎉 تم استلام الجائزة! مبارك!');
      qc.invalidateQueries({ queryKey: ['myRewardRequests'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
    },
  });

  const { mutate: purchase, isPending } = usePurchase();

  const handleBuy = (itemId: string) => {
    purchase(itemId, {
      onSuccess: (res: any) => {
        toast.success(res.message ?? 'تم الشراء بنجاح!');
        setJustBought(itemId);
        setConfirmItem(null);
        qc.invalidateQueries({ queryKey: ['gems'] });
        qc.invalidateQueries({ queryKey: ['hearts'] });
        setTimeout(() => setJustBought(null), 2500);
      },
      onError: (err: any) => {
        toast.error(err?.message ?? 'جواهر غير كافية');
        setConfirmItem(null);
      },
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-50"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-brand flex items-center gap-2">
          <ShoppingBag size={20} />
          متجر نور
        </h1>
        <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 rounded-xl px-3 py-1.5">
          <span>💎</span>
          <span className="text-sm font-extrabold text-cyan-700">{gems}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-6 flex flex-col gap-5">

        {/* Gems balance card (desktop) */}
        <motion.div
          className="hidden lg:flex bg-gradient-to-r from-brand to-brand/80 text-white rounded-2xl p-5 items-center gap-4 shadow-md"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        >
          <NoorOwl expression="proud" size={70} message="استبدل جواهرك بمكافآت 💎" />
          <div className="flex-1">
            <p className="text-white/70 text-sm">رصيدك الحالي</p>
            <p className="text-3xl font-extrabold">💎 {gems} جوهرة</p>
          </div>
        </motion.div>

        <div className="bg-gradient-to-r from-gold/20 to-brand/10 border border-gold/30 rounded-2xl p-4 text-center">
          <p className="text-brand font-bold text-sm">🛒 استخدم جواهرك لشراء مكافآت رائعة!</p>
        </div>

        {/* Parent Rewards Section */}
        {parentRewards && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-base font-extrabold text-brand mb-3">🏆 جوائز من أهلك</h2>
            <div className="flex flex-col gap-3">
              {(Object.keys(REWARD_META) as Array<keyof typeof REWARD_META>).map(level => {
                const meta = REWARD_META[level];
                const data = parentRewards[level as keyof ParentRewards];
                if (!data?.active) return null;
                const existing = myRequests.find(r => r.level === level);
                const canAfford = gems >= meta.gems;
                return (
                  <motion.div
                    key={level}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  >
                    <div className={`bg-gradient-to-r ${meta.color} p-4 flex items-center gap-3 text-white`}>
                      <span className="text-2xl">{meta.emoji}</span>
                      <div className="flex-1">
                        <p className="font-extrabold text-sm">{meta.label}</p>
                        <p className="text-xs opacity-80">💎 {meta.gems} جوهرة</p>
                      </div>
                      {canAfford ? (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-bold">جاهز! ✅</span>
                      ) : (
                        <span className="text-xs bg-black/20 px-2 py-1 rounded-lg">
                          تحتاج {meta.gems - gems} 💎 أخرى
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">اسم الجائزة</p>
                        <p className="font-extrabold text-brand">{data.name}</p>
                        {existing?.status === 'pending' && (
                          <p className="text-xs text-amber-600 mt-0.5">⏳ في انتظار موافقة الأهل</p>
                        )}
                        {existing?.status === 'deferred' && (
                          <p className="text-xs text-gray-500 mt-0.5">⏰ تم التأجيل — حاول لاحقاً</p>
                        )}
                        {existing?.status === 'approved' && (
                          <p className="text-xs text-green-600 mt-0.5">✅ الأهل وافقوا!</p>
                        )}
                      </div>
                      {existing?.status === 'approved' ? (
                        <button
                          onClick={() => claimReward(existing.id)}
                          className="bg-green-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-sm hover:bg-green-600 active:scale-95 transition-all"
                        >
                          استلام الجائزة 🎉
                        </button>
                      ) : existing?.status === 'pending' ? (
                        <span className="text-2xl animate-pulse">⏳</span>
                      ) : (
                        <button
                          onClick={() => { setRequestingLevel(level); requestReward(level); }}
                          disabled={!canAfford || isRequesting || existing?.status === 'claimed'}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95',
                            existing?.status === 'claimed' ? 'bg-gray-100 text-gray-400' :
                            !canAfford ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            'bg-brand text-gold hover:opacity-90',
                          )}
                        >
                          {isRequesting && requestingLevel === level
                            ? <Loader2 size={16} className="animate-spin" />
                            : existing?.status === 'claimed' ? 'تم الاستلام ✓' : 'اطلب الجائزة 🎁'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Shop items */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, i) => {
              const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.bonus;
              const bought = justBought === item.id;
              return (
                <motion.div
                  key={item.id}
                  className={cn('rounded-2xl border-2 p-5 flex flex-col gap-3 bg-white shadow-sm', colors.border)}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl', colors.bg)}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={cn('font-extrabold text-base', colors.text)}>{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-1.5">
                      {item.isFree ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">مجاني! 🎁</span>
                      ) : (
                        <>
                          <span className="text-base">💎</span>
                          <span className="text-base font-extrabold text-gray-800">{item.cost}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => item.isFree ? handleBuy(item.id) : setConfirmItem(item.id)}
                      disabled={(!item.canAfford && !item.isFree) || isPending || bought}
                      className={cn(
                        'px-4 py-2 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center',
                        bought ? 'bg-green-500' :
                        (!item.canAfford && !item.isFree) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                        colors.btn,
                      )}
                    >
                      {bought ? <CheckCircle2 size={16} /> : 'شراء'}
                    </button>
                  </div>
                  {!item.canAfford && !item.isFree && (
                    <p className="text-[11px] text-red-400 text-center -mt-1">جواهر غير كافية</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirm purchase modal */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const item = items.find(x => x.id === confirmItem);
                if (!item) return null;
                const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.bonus;
                return (
                  <>
                    <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4', colors.bg)}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-extrabold text-brand text-center">{item.name}</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">{item.description}</p>
                    <div className="flex items-center justify-center gap-2 mt-3 bg-gray-50 rounded-xl py-3">
                      <span className="text-xl">💎</span>
                      <span className="text-xl font-extrabold">{item.cost}</span>
                      <span className="text-sm text-muted-foreground">من رصيدك ({gems})</span>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setConfirmItem(null)}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50">
                        إلغاء
                      </button>
                      <button onClick={() => handleBuy(confirmItem)} disabled={isPending}
                        className={cn('flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2', colors.btn)}>
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        تأكيد الشراء
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
