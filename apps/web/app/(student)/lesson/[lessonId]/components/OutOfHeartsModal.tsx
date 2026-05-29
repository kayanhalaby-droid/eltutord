'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';
import { useRefillHearts } from '@/lib/hooks/useHearts';

interface Props {
  onClose: () => void;
}

export default function OutOfHeartsModal({ onClose }: Props) {
  const router = useRouter();
  const { mutate: refill, isPending } = useRefillHearts();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl"
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      >
        <NoorOwl expression="sad" size={90} animate />

        <h2 className="text-2xl font-extrabold text-red-500 text-center">انتهت القلوب! 💔</h2>
        <p className="text-muted-foreground text-center text-sm">
          لا توجد قلوب متبقية. يمكنك إعادة ملء القلوب بـ 100 جوهرة أو الانتظار حتى تتجدد.
        </p>

        <div className="flex gap-3 w-full flex-col">
          <Button
            className="w-full bg-brand text-gold font-bold"
            onClick={() => refill(undefined, { onSuccess: onClose })}
            disabled={isPending}
          >
            {isPending ? '...' : '💎 إعادة ملء القلوب (100 جوهرة)'}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/home')}>
            العودة للرئيسية
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
