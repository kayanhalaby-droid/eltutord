'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity } from '@/lib/types/parent';
import { useParentDashboardStore } from '@/store/parentDashboardStore';

interface Props {
  activities: Activity[];
}

type SortKey = keyof Activity;
type SortDir = 'asc' | 'desc';

const TYPE_LABEL: Record<string, string> = {
  lesson: 'درس',
  quiz: 'اختبار',
  game: 'لعبة',
};

export default function ActivityLog({ activities: initialActivities }: Props) {
  const { activitySubjectFilter, setActivitySubjectFilter } = useParentDashboardStore();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allSubjects = useMemo(() => {
    const s = new Set(initialActivities.map((a) => a.subject));
    return ['all', ...Array.from(s).sort()];
  }, [initialActivities]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...initialActivities];
    if (activitySubjectFilter && activitySubjectFilter !== 'all') {
      list = list.filter((a) => a.subject === activitySubjectFilter);
    }
    list.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return 0;
    });
    return list;
  }, [initialActivities, activitySubjectFilter, sortKey, sortDir]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <CardTitle className="text-brand font-extrabold">سجل الأنشطة</CardTitle>
          <select
            value={activitySubjectFilter || 'all'}
            onChange={(e) => setActivitySubjectFilter(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:border-brand"
          >
            {allSubjects.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'كل المواد' : s}</option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد أنشطة</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm text-right">
                <thead className="bg-brand/5">
                  <tr>
                    {[
                      { key: 'date', label: 'التاريخ' },
                      { key: 'type', label: 'النوع' },
                      { key: 'subject', label: 'المادة' },
                      { key: 'topic', label: 'الموضوع' },
                      { key: 'score', label: 'الدرجة' },
                      { key: 'durationMinutes', label: 'المدة' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-3 font-bold text-brand cursor-pointer hover:bg-brand/10 transition-colors"
                        onClick={() => handleSort(key as SortKey)}
                      >
                        <span className="flex items-center justify-end gap-1">
                          {label}
                          <ArrowUpDown size={12} className="opacity-50" />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(a.date)}</td>
                      <td className="px-4 py-2.5">{TYPE_LABEL[a.type] ?? a.type}</td>
                      <td className="px-4 py-2.5 font-medium text-brand">{a.subject}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.topic}</td>
                      <td className="px-4 py-2.5 text-center font-bold">
                        <span className={a.score / a.maxScore >= 0.7 ? 'text-green-600' : 'text-red-500'}>
                          {a.score}/{a.maxScore}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{a.durationMinutes}د</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
