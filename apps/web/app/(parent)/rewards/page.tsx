'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';
import { cn } from '@/lib/utils';

interface RewardLevel { gems: number; name: string; active: boolean; expiresAt: string | null }
interface Rewards { small: RewardLevel; medium: RewardLevel; large: RewardLevel }
interface PendingRequest { id: string; level: string; name: string; gems: number; requestedAt: string; status: string }

const LEVEL_META = {
  small:  { label: 'الصغيرة', desc: '~أسبوع من الجد', emoji: '🎁', gems: 200, color: 'from-emerald-400 to-green-600' },
  medium: { label: 'المتوسطة', desc: '~شهر من الجد', emoji: '🎮', gems: 500, color: 'from-blue-400 to-indigo-600' },
  large:  { label: 'الكبيرة', desc: '~4 أشهر من الجد', emoji: '🚗', gems: 2000, color: 'from-purple-400 to-pink-600' },
};

const SUGGESTIONS: Record<string, string[]> = {
  small:  ['وجبة بيتزا 🍕', 'ساعة جوال إضافية 📱', 'اختيار وجبة العشاء 🍽️', 'رحلة للبحر 🏖️'],
  medium: ['لعبة فيديو 🎮', 'كتاب اخترته 📚', 'حفلة مع أصدقاء 🎉', 'ملابس جديدة 👕'],
  large:  ['رحلة عائلية 🚗', 'جهاز جديد 📱', 'أي شيء تختاره ⭐', 'حفلة عيد ميلاد خاصة 🎂'],
};

function RewardCard({
  level, data, onSave,
}: { level: keyof typeof LEVEL_META; data: RewardLevel; onSave: (patch: Partial<RewardLevel>) => void }) {
  const meta = LEVEL_META[level];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.name);

  return (
    <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`bg-gradient-to-r ${meta.color} p-4 flex items-center gap-3 text-white`}>
        <span className="text-3xl">{meta.emoji}</span>
        <div>
          <p className="font-extrabold">الجائزة {meta.label}</p>
          <p className="text-xs opacity-80">💎 {meta.gems} جوهرة — {meta.desc}</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <button
            onClick={() => onSave({ active: !data.active })}
            className={cn('relative w-12 h-6 rounded-full transition-colors', data.active ? 'bg-white/30' : 'bg-black/20')}
          >
            <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', data.active ? 'translate-x-6' : 'translate-x-0.5')} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              className="border-2 border-brand rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none w-full"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="اكتب اسم الجائزة..."
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[level].map(s => (
                <button key={s} onClick={() => setDraft(s)}
                  className="text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-full font-bold hover:bg-brand/20 transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-2 rounded-xl text-sm">إلغاء</button>
              <button onClick={() => { onSave({ name: draft }); setEditing(false); }}
                className="flex-[2] bg-brand text-gold font-extrabold py-2 rounded-xl text-sm hover:opacity-90">
                حفظ ✓
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">الجائزة الحالية</p>
              <p className="font-extrabold text-brand text-base">{data.name}</p>
              {!data.active && <p className="text-xs text-red-400 mt-0.5">موقوفة مؤقتاً</p>}
            </div>
            <button onClick={() => setEditing(true)}
              className="text-sm border-2 border-brand text-brand font-bold px-4 py-1.5 rounded-xl hover:bg-brand/5 transition-colors">
              تعديل ✏️
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function RewardsPage() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();

  const { data: rewards, isLoading } = useQuery<Rewards>({
    queryKey: ['parentRewards'],
    queryFn: () => apiFetch('/parents/rewards', { token: token! }),
    enabled: !!token,
  });

  const { data: pendingData } = useQuery<{ requests: PendingRequest[] }>({
    queryKey: ['pendingRewards'],
    queryFn: () => apiFetch('/parents/pending-rewards', { token: token! }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { mutate: saveRewards } = useMutation({
    mutationFn: (patch: Partial<Rewards>) => apiFetch('/parents/rewards', { method: 'POST', token: token!, body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parentRewards'] }),
  });

  const { mutate: approveReward } = useMutation({
    mutationFn: (id: string) => apiFetch(`/parents/rewards/${id}/approve`, { method: 'POST', token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendingRewards'] }),
  });

  const { mutate: deferReward } = useMutation({
    mutationFn: (id: string) => apiFetch(`/parents/rewards/${id}/defer`, { method: 'POST', token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendingRewards'] }),
  });

  const pendingRequests = (pendingData?.requests ?? []).filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-brand text-white px-4 py-3 shadow-md">
        <h1 className="font-extrabold text-base text-gold">🏆 نظام الجوائز</h1>
        <p className="text-xs opacity-70">حفّز ابنك بجوائز حقيقية</p>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-5">

        {/* Pending requests */}
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-extrabold text-amber-800 mb-3">📬 طلبات جوائز معلقة ({pendingRequests.length})</p>
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 mb-2 shadow-sm">
                  <div className="flex-1">
                    <p className="font-bold text-brand text-sm">{req.name}</p>
                    <p className="text-xs text-muted-foreground">💎 {req.gems} جوهرة • {new Date(req.requestedAt).toLocaleDateString('ar')}</p>
                  </div>
                  <button onClick={() => approveReward(req.id)}
                    className="bg-green-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-green-600 active:scale-95 transition-all">
                    وافق ✅
                  </button>
                  <button onClick={() => deferReward(req.id)}
                    className="bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-gray-200 active:scale-95 transition-all">
                    أجّل ⏰
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        <div className="bg-brand/5 rounded-2xl p-4 border border-brand/20">
          <div className="flex items-start gap-3">
            <NoorOwl expression="encouraging" size={50} />
            <div>
              <p className="font-extrabold text-brand text-sm">كيف يعمل النظام؟</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                عندما يجمع ابنك الجواهر الكافية، يضغط "اطلب الجائزة" في المتجر.
                ستصلك إشعار واتساب للموافقة. بعد موافقتك تُخصم الجواهر تلقائياً.
              </p>
            </div>
          </div>
        </div>

        {/* Reward cards */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />)
        ) : rewards ? (
          (Object.keys(LEVEL_META) as Array<keyof typeof LEVEL_META>).map(level => (
            <RewardCard
              key={level}
              level={level}
              data={rewards[level]}
              onSave={patch => saveRewards({ [level]: patch } as Partial<Rewards>)}
            />
          ))
        ) : null}
      </main>
    </div>
  );
}
