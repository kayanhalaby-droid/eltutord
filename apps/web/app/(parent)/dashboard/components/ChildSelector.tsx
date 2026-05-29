'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Child } from '@/lib/types/parent';
import { useParentDashboardStore } from '@/store/parentDashboardStore';
import NoorOwl from '@/components/NoorOwl';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  children: Child[];
}

export default function ChildSelector({ children }: Props) {
  const { selectedChildId, setSelectedChildId } = useParentDashboardStore();
  const router = useRouter();

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm flex flex-col items-center gap-4">
        <NoorOwl expression="encouraging" size={80} animate message="أضف ابنك بكوده الخاص!" />
        <p className="text-muted-foreground">لم تربط أي طالب بعد</p>
        <Button onClick={() => router.push('/parent/link-child')}>ربط طالب</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-brand mb-3">اختر الطالب</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {children.map((child) => (
          <motion.button
            key={child.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedChildId(child.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 min-w-[120px] transition-all',
              child.id === selectedChildId
                ? 'border-brand bg-brand text-white shadow-lg'
                : 'border-gray-200 bg-white text-brand hover:border-brand/50'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center text-xl font-extrabold text-brand">
              {child.firstName.charAt(0)}
            </div>
            <span className="font-bold text-sm">{child.firstName}</span>
            <span className={cn('text-xs', child.id === selectedChildId ? 'text-white/70' : 'text-muted-foreground')}>
              الصف {child.gradeLevel}
            </span>
            <div className={cn('flex gap-2 text-xs', child.id === selectedChildId ? 'text-white/80' : 'text-muted-foreground')}>
              <span>⭐{child.xp}</span>
              <span>🔥{child.streak}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
