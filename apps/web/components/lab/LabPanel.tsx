'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MistakeMuseum } from './ideas/MistakeMuseum';
import { BossBattle } from './ideas/BossBattle';
import { TeachNoor } from './ideas/TeachNoor';
import { TimeCapsule } from './ideas/TimeCapsule';
import { DifficultyAuction } from './ideas/DifficultyAuction';
import { WarRoom } from './ideas/WarRoom';

const IDEAS = [
  { id: 'museum',  label: 'متحف الأخطاء',   icon: '🏛️', age: '6–12',  component: MistakeMuseum },
  { id: 'boss',    label: 'معركة الزعيم',    icon: '⚔️', age: '6–14',  component: BossBattle },
  { id: 'teach',   label: 'علّم نور',         icon: '🦉', age: '8–18',  component: TeachNoor },
  { id: 'capsule', label: 'كبسولة الزمن',   icon: '⏰', age: '12–18', component: TimeCapsule },
  { id: 'auction', label: 'مزاد الصعوبة',   icon: '💰', age: '14–18', component: DifficultyAuction },
  { id: 'war',     label: 'غرفة الحرب',      icon: '🗺️', age: '16–18', component: WarRoom },
] as const;

type IdeaId = typeof IDEAS[number]['id'];

export function LabPanel({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<IdeaId | null>(null);

  const idea = active ? IDEAS.find(i => i.id === active) : null;
  const ActiveComponent = idea?.component ?? null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: -380, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -380, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-base">🧪 المختبر التجريبي</h2>
            <p className="text-purple-200 text-xs">أفكار لم تُطبَّق بعد — جرّبها!</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            ×
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* قائمة الأفكار */}
          {!active && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 space-y-2"
            >
              <p className="text-gray-400 text-xs text-center mb-3">اضغط على أي فكرة لتجربتها</p>
              {IDEAS.map(idea => (
                <motion.button
                  key={idea.id}
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActive(idea.id)}
                  className="w-full bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl p-3 text-right transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 text-xs font-medium bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      صف {idea.age}
                    </span>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{idea.label}</p>
                      </div>
                      <span className="text-2xl">{idea.icon}</span>
                    </div>
                  </div>
                </motion.button>
              ))}

              <div className="mt-4 bg-purple-50 rounded-xl p-3 border border-purple-100">
                <p className="text-purple-600 text-xs text-center font-medium">
                  💡 هذه أفكار تجريبية — رأيك يهمنا!
                </p>
              </div>
            </motion.div>
          )}

          {/* الفكرة المفعّلة */}
          {active && ActiveComponent && (
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              <button
                onClick={() => setActive(null)}
                className="shrink-0 px-4 py-2.5 text-right text-purple-600 text-sm font-medium hover:bg-purple-50 transition-colors border-b border-gray-100 flex items-center gap-1"
              >
                <span>→</span>
                <span>العودة للقائمة</span>
              </button>
              <div className="flex-1 p-4">
                <ActiveComponent />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
