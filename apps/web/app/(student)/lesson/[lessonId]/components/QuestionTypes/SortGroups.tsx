'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Group { id: string; label: string }
interface Item  { id: string; label: string; group: string }
interface Props {
  content: { questionText: string; groups: Group[]; items: Item[] };
  onAnswer: (assignments: Record<string, string>) => void;
  disabled?: boolean;
  isCorrect?: boolean;
  correctAssignments?: Record<string, string>;
}

export default function SortGroups({ content, onAnswer, disabled, isCorrect, correctAssignments }: Props) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const assign = (itemId: string, groupId: string) => {
    if (disabled) return;
    setAssignments(prev => ({ ...prev, [itemId]: groupId }));
  };

  const submit = () => {
    if (Object.keys(assignments).length === content.items.length) {
      onAnswer(assignments);
    }
  };

  const unassigned = content.items.filter(i => !assignments[i.id]);
  const allAssigned = unassigned.length === 0;

  const itemColor = (itemId: string) => {
    if (!disabled) return 'bg-brand/10 border-brand/30 text-brand';
    const correct = correctAssignments?.[itemId] === assignments[itemId];
    return correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>

      {/* Unassigned items */}
      {unassigned.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[56px]">
          {unassigned.map(item => (
            <span key={item.id} className="px-3 py-1.5 rounded-lg border-2 bg-white border-gray-300 text-brand font-semibold text-sm">
              {item.label}
            </span>
          ))}
        </div>
      )}

      {/* Group columns */}
      <div className="grid grid-cols-2 gap-3">
        {content.groups.map(group => {
          const groupItems = content.items.filter(i => assignments[i.id] === group.id);
          return (
            <div key={group.id} className="flex flex-col gap-2">
              <div className="text-center font-bold text-sm text-brand bg-brand/10 rounded-lg py-2 px-3">
                {group.label}
              </div>
              <div className="min-h-[100px] rounded-xl border-2 border-dashed border-brand/30 p-2 flex flex-col gap-2">
                {groupItems.map(item => (
                  <motion.span
                    key={item.id}
                    className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm text-center cursor-pointer hover:opacity-80 ${itemColor(item.id)}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    onClick={() => !disabled && setAssignments(p => { const n = { ...p }; delete n[item.id]; return n; })}
                  >
                    {item.label}
                  </motion.span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment buttons for unassigned */}
      {!disabled && unassigned.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-center text-muted-foreground">اضغط على كلمة لتصنيفها:</p>
          {unassigned.map(item => (
            <div key={item.id} className="flex gap-2 items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
              <span className="font-bold text-brand">{item.label}</span>
              <div className="flex gap-2">
                {content.groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => assign(item.id, g.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white font-bold hover:brightness-110 active:scale-95 transition-all"
                  >
                    {g.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!disabled && allAssigned && (
        <button
          className="self-center px-8 py-2.5 bg-brand text-white font-bold rounded-xl hover:opacity-90 mt-2"
          onClick={submit}
        >
          تأكيد التصنيف
        </button>
      )}
    </div>
  );
}
