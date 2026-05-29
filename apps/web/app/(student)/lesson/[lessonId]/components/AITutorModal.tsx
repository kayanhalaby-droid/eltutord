'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NoorOwl from '@/components/NoorOwl';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Props {
  concept: string;
  subject: string;
  gradeLevel: number;
  onClose: () => void;
}

interface ExplanationResponse {
  explanation: string;
  examples?: string[];
  tips?: string[];
}

export default function AITutorModal({ concept, subject, gradeLevel, onClose }: Props) {
  const token = useAuthStore((s) => s.token);

  const { data, isLoading, isError } = useQuery<ExplanationResponse>({
    queryKey: ['explanation', concept, subject, gradeLevel],
    queryFn: () =>
      apiFetch(`/explanation?concept=${encodeURIComponent(concept)}&subject=${encodeURIComponent(subject)}&gradeLevel=${gradeLevel}&language=ar`, { token: token! }),
    enabled: !!token,
    staleTime: Infinity,
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <NoorOwl expression="studying" size={50} animate />
            <div>
              <h3 className="font-extrabold text-brand text-lg">المعلمة نور</h3>
              <p className="text-xs text-muted-foreground">شرح: {concept}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-brand p-1">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex flex-col gap-3 py-4">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/5" />
          </div>
        )}

        {isError && (
          <p className="text-red-500 text-center py-4">تعذّر تحميل الشرح. حاول مجدداً.</p>
        )}

        {data && (
          <div className="flex flex-col gap-4 text-right" dir="rtl">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-brand leading-relaxed">{data.explanation}</p>
            </div>

            {data.examples && data.examples.length > 0 && (
              <div>
                <h4 className="font-bold text-brand mb-2">أمثلة:</h4>
                <ul className="flex flex-col gap-2">
                  {data.examples.map((ex, i) => (
                    <li key={i} className="bg-green-50 rounded-lg px-3 py-2 text-green-800 text-sm">
                      {i + 1}. {ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.tips && data.tips.length > 0 && (
              <div>
                <h4 className="font-bold text-brand mb-2">نصائح:</h4>
                <ul className="flex flex-col gap-2">
                  {data.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-gold">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
