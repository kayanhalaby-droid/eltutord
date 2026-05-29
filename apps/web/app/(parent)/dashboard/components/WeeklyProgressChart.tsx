'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeeklyProgressData } from '@/lib/types/parent';

interface Props {
  data: WeeklyProgressData[];
}

const DAY_NAMES: Record<string, string> = {
  Sun: 'أحد', Mon: 'اثن', Tue: 'ثلا', Wed: 'أرب', Thu: 'خمي', Fri: 'جمع', Sat: 'سبت',
};

export default function WeeklyProgressChart({ data }: Props) {
  const chartData = data.map((item) => {
    const d = new Date(item.date);
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { ...item, name: DAY_NAMES[dayShort] ?? dayShort };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-brand font-extrabold">التقدم الأسبوعي</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] pr-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#1A1F5E', fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) =>
                    name === 'activities' ? [value, 'نشاط'] : [`${value.toFixed(0)}%`, 'متوسط']
                  }
                />
                <Legend formatter={(val) => val === 'activities' ? 'عدد الأنشطة' : 'متوسط الدرجة'} />
                <Bar yAxisId="left" dataKey="activities" fill="#1A1F5E" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="averageScore" fill="#FFD700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              لا توجد بيانات أسبوعية بعد
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
