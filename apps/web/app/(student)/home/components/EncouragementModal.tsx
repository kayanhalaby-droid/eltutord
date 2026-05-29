'use client';

import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import NoorOwl from '@/components/NoorOwl';
import HeartFloat from '@/components/effects/HeartFloat';

interface Encouragement {
  id: string;
  message: string;
  gems: number;
  fromName: string;
}

interface Props {
  encouragement: Encouragement;
  onClose: () => void;
}

export default function EncouragementModal({ encouragement, onClose }: Props) {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();

  const { mutate: markRead } = useMutation({
    mutationFn: () => apiFetch(`/gamification/encouragements/${encouragement.id}/read`, { method: 'POST', token: token! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pendingEncouragements'] });
      qc.invalidateQueries({ queryKey: ['gems'] });
    },
  });

  const handleClose = () => { markRead(); onClose(); };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-7 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl text-center"
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 40 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        {/* Noor holding a letter */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <NoorOwl expression="love" size={90} animate />
        <HeartFloat count={6} />
        </motion.div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-1">💌 رسالة من {encouragement.fromName}</p>
          <h2 className="text-xl font-extrabold text-brand leading-snug">{encouragement.message}</h2>
        </div>

        {encouragement.gems > 0 && (
          <motion.div
            className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-6 py-3 flex items-center gap-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <span className="text-2xl">💎</span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">هدية جواهر</p>
              <p className="text-xl font-extrabold text-amber-600">+{encouragement.gems}</p>
            </div>
          </motion.div>
        )}

        <button
          className="w-full bg-brand text-gold font-extrabold rounded-2xl py-3.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
          onClick={handleClose}
        >
          شكراً! 💙
        </button>
      </motion.div>
    </motion.div>
  );
}
