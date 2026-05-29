'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, Trash2, Edit, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { AdminSubject } from '@/lib/types/admin';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  subjects: AdminSubject[];
  onEdit: (subject: AdminSubject) => void;
}

export default function CurriculumTree({ subjects, onEdit }: Props) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/curriculum/subjects/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
      toast.success('تم حذف المادة');
    },
    onError: () => toast.error('فشل الحذف'),
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (subjects.length === 0) {
    return <p className="text-center text-muted-foreground py-8">لا توجد مواد دراسية بعد</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {subjects.map((subject) => {
        const isOpen = openIds.has(subject.id);
        return (
          <div key={subject.id} className="rounded-xl border border-gray-200 overflow-hidden">
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors',
                isOpen ? 'bg-brand/5' : 'bg-white hover:bg-gray-50'
              )}
              onClick={() => toggle(subject.id)}
            >
              <BookOpen size={18} className="text-brand shrink-0" />
              <span className="flex-1 font-bold text-brand">{subject.name}</span>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                الصف {subject.gradeLevel}
              </span>
              {subject.lessonCount !== undefined && (
                <span className="text-xs text-muted-foreground">{subject.lessonCount} درس</span>
              )}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(subject)}
                  className="p-1.5 rounded-lg hover:bg-brand/10 text-brand transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('هل تريد حذف هذه المادة؟')) deleteMutation.mutate(subject.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {isOpen
                ? <ChevronDown size={16} className="text-muted-foreground" />
                : <ChevronLeft size={16} className="text-muted-foreground" />}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    {subject.description ? (
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">لا يوجد وصف</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <FileText size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {subject.lessonCount ?? 0} درس مرتبط
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
