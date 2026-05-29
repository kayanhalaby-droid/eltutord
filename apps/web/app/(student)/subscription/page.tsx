'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Star, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BillingCycle = 'MONTHLY' | 'YEARLY';
type PlanId = 'basic' | 'elite' | 'vip';

interface Plan {
  id: PlanId;
  name: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  badgeColor: string;
  monthlyPrice: number;
  yearlyPricePerMonth: number;
  yearlyTotal: number;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'الأساسية',
    icon: <Star size={22} />,
    color: 'text-blue-600',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    monthlyPrice: 95,
    yearlyPricePerMonth: 79,
    yearlyTotal: 950,
    features: [
      'وصول لجميع الدروس',
      'تصحيح واجبات ذكي (10/شهر)',
      'تقارير التقدم الأسبوعية',
      'دعم عبر واتساب',
    ],
  },
  {
    id: 'elite',
    name: 'النخبة',
    icon: <Zap size={22} />,
    color: 'text-brand',
    borderColor: 'border-brand',
    badgeColor: 'bg-brand text-white',
    monthlyPrice: 129,
    yearlyPricePerMonth: 89,
    yearlyTotal: 1068,
    features: [
      'كل مزايا الأساسية',
      'تصحيح واجبات غير محدود',
      'تقارير يومية للأهل',
      'جلسات مراجعة مباشرة',
      'خصم 20% على الاشتراك السنوي',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    icon: <Crown size={22} />,
    color: 'text-amber-600',
    borderColor: 'border-amber-300',
    badgeColor: 'bg-amber-100 text-amber-700',
    monthlyPrice: 199,
    yearlyPricePerMonth: 139,
    yearlyTotal: 1668,
    features: [
      'كل مزايا النخبة',
      'مدرس خاص مخصص',
      'خطة دراسية فردية',
      'أولوية الدعم على مدار الساعة',
      'وصول مبكر للميزات الجديدة',
    ],
  },
];

interface CurrentSubscription {
  plan: string | null;
  billingCycle: BillingCycle | null;
  expiresAt: string | null;
}

export default function SubscriptionPage() {
  const token = useAuthStore((s) => s.token);
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  const { data: current } = useQuery<CurrentSubscription>({
    queryKey: ['subscription'],
    queryFn: () => apiFetch('/api/cardcom/subscription', { token: token! }),
    enabled: !!token,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan: PlanId) => {
      const res = await apiFetch('/api/cardcom/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, billingCycle: cycle }),
        token: token!,
      });
      return res as { paymentUrl: string };
    },
    onSuccess: ({ paymentUrl }) => {
      window.location.href = paymentUrl;
    },
    onError: () => toast.error('فشل إنشاء رابط الدفع، حاول لاحقًا'),
  });

  const handleSubscribe = (planId: PlanId) => {
    setSelectedPlan(planId);
    checkoutMutation.mutate(planId);
  };

  const yearlySavings = (plan: Plan) =>
    Math.round((plan.monthlyPrice * 12 - plan.yearlyTotal) / (plan.monthlyPrice * 12) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-16">
      <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="text-4xl">🎓</div>
          <h1 className="text-3xl font-extrabold text-brand">اختر خطتك</h1>
          <p className="text-gray-500 text-sm">استثمر في مستقبل طفلك مع أفضل تعليم ذكي</p>
        </div>

        {/* Current subscription banner */}
        {current?.plan && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold text-green-800">اشتراكك الحالي: </span>
              <span className="text-green-700">
                {PLANS.find((p) => p.id === current.plan?.toLowerCase())?.name}
                {current.expiresAt && ` · ينتهي ${new Date(current.expiresAt).toLocaleDateString('ar-IL')}`}
              </span>
            </div>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setCycle('MONTHLY')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-bold transition-all',
                cycle === 'MONTHLY' ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              شهري
            </button>
            <button
              onClick={() => setCycle('YEARLY')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
                cycle === 'YEARLY' ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              سنوي
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                وفّر حتى 30%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const price = cycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPricePerMonth;
            const isCurrent = current?.plan === plan.id;
            const isLoading = checkoutMutation.isPending && selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative bg-white rounded-2xl border-2 p-6 flex flex-col gap-5 transition-all',
                  plan.borderColor,
                  plan.popular ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-1/2 translate-x-1/2">
                    <span className="bg-brand text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                      الأكثر شيوعًا
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="flex flex-col gap-2">
                  <div className={cn('flex items-center gap-2 font-bold text-lg', plan.color)}>
                    {plan.icon}
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">{price}₪</span>
                    <span className="text-sm text-gray-400 mb-1">/شهر</span>
                  </div>
                  {cycle === 'YEARLY' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">{plan.monthlyPrice}₪</span>
                      <span className={cn('text-xs font-bold rounded-full px-2 py-0.5', plan.badgeColor)}>
                        وفّر {yearlySavings(plan)}%
                      </span>
                    </div>
                  )}
                  {cycle === 'YEARLY' && (
                    <p className="text-xs text-gray-400">يُدفع {plan.yearlyTotal}₪ سنويًا</p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || checkoutMutation.isPending}
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn('w-full font-bold', plan.popular && 'bg-brand hover:bg-brand/90')}
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="ml-2 animate-spin" /> جاري التوجيه...</>
                  ) : isCurrent ? (
                    'اشتراكك الحالي ✓'
                  ) : (
                    'اشترك الآن'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Cardcom trust badge */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>الدفع آمن ومشفر عبر بوابة Cardcom الإسرائيلية</span>
          </div>
          <p className="text-xs text-gray-400">
            يمكنك إلغاء اشتراكك في أي وقت — لا رسوم خفية
          </p>
        </div>
      </div>
    </div>
  );
}
