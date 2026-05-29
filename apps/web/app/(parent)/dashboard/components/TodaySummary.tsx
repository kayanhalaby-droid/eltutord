'use client';

import { motion } from 'framer-motion';
import { Book, Clock, Award, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TodaySummaryData } from '@/lib/types/parent';

interface Props {
  summary: TodaySummaryData;
}

export default function TodaySummary({ summary }: Props) {
  const stats = [
    { icon: Book, color: 'text-blue-500', label: 'نشاط اليوم', value: summary.totalActivities, suffix: '' },
    { icon: Clock, color: 'text-green-500', label: 'الدقائق', value: summary.totalDurationMinutes, suffix: 'د' },
    { icon: Award, color: 'text-gold', label: 'متوسط الدرجة', value: summary.averageScore.toFixed(0), suffix: '%' },
    { icon: CheckCircle, color: 'text-purple-500', label: 'دروس مكتملة', value: summary.completedLessons, suffix: '' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-brand font-extrabold">ملخص اليوم</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {stats.map(({ icon: Icon, color, label, value, suffix }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className={`${color} shrink-0`} size={22} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-extrabold text-brand">{value}{suffix}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
