'use client';

import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skill } from '@/lib/types/parent';

interface Props {
  skills: Skill[];
}

export default function SkillRadar({ skills }: Props) {
  const data = skills.map((s) => ({ ...s, fullMark: 100 }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-brand font-extrabold">مستوى المهارات</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#1A1F5E', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="المستوى" dataKey="level" stroke="#1A1F5E" fill="#1A1F5E" fillOpacity={0.5} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'المستوى']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center">لا توجد بيانات مهارات بعد</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
