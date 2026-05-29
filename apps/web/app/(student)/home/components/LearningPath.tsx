'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { LearningPathNode } from './LearningPathNode';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LearningPathDto, LearningPathNodeDto } from '@/lib/types/lesson';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import NoorOwl from '@/components/NoorOwl';
import LessonStartModal from './LessonStartModal';

interface Props {
  subjectId: string;
  gradeLevel: number;
}

const NOOROWL_MESSAGES = [
  'أحسنت! استمر في التعلم 🌟',
  'نصف الطريق وصلت، واصل! 💪',
  'رائع! أنت تتقدم بسرعة 🚀',
  'تقريباً وصلت! لا تتوقف 🔥',
];

function generateSnakePath(nodes: LearningPathNodeDto[], svgWidth: number): string {
  if (nodes.length === 0) return '';
  const hOff = Math.min(svgWidth * 0.22, 120);
  const cx = svgWidth / 2;
  let d = '';

  nodes.forEach((_, index) => {
    const y = index * 150 + 75;
    const x = index % 2 === 0 ? cx - hOff : cx + hOff;

    if (index === 0) {
      d += `M ${x} ${y}`;
    } else {
      const prevX = (index - 1) % 2 === 0 ? cx - hOff : cx + hOff;
      const prevY = (index - 1) * 150 + 75;
      const midY = (prevY + y) / 2;
      d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
    }
  });

  return d;
}

export function LearningPath({ subjectId, gradeLevel }: Props) {
  const token = useAuthStore((s) => s.token);
  const { playSound } = useSoundEffects();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(400);
  const [pathLength, setPathLength] = useState(0);
  const [nodePositions, setNodePositions] = useState<Array<{ x: number; y: number }>>([]);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [startNode, setStartNode] = useState<LearningPathNodeDto | null>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const pathOffset = useTransform(scrollYProgress, [0, 1], [pathLength, 0]);

  const { data: learningPath, isLoading, isError } = useQuery<LearningPathDto>({
    queryKey: ['learningPath', subjectId, gradeLevel],
    queryFn: () => apiFetch(`/curriculum/path/${subjectId}/${gradeLevel}`, { token: token! }),
    enabled: !!token && !!subjectId,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setSvgWidth(el.offsetWidth));
    obs.observe(el);
    setSvgWidth(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!learningPath || !svgWidth) return;
    const hOff = Math.min(svgWidth * 0.22, 120);
    const cx = svgWidth / 2;
    const positions = learningPath.nodes.map((_, i) => ({
      x: i % 2 === 0 ? cx - hOff : cx + hOff,
      y: i * 150 + 75,
    }));
    setNodePositions(positions);

    const pathD = generateSnakePath(learningPath.nodes, svgWidth);
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttribute('d', pathD);
    tempSvg.style.position = 'absolute';
    tempSvg.style.visibility = 'hidden';
    tempSvg.appendChild(tempPath);
    document.body.appendChild(tempSvg);
    setPathLength(tempPath.getTotalLength());
    document.body.removeChild(tempSvg);

    // Auto-scroll to current node
    const currentIdx = learningPath.nodes.findIndex((n) => n.isCurrent);
    if (currentIdx >= 0) {
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const scrollTarget = currentIdx * 150 + 75 - 150;
        el.closest('[data-scroll-parent]')?.scrollTo({ top: el.offsetTop + scrollTarget, behavior: 'smooth' });
        // Fallback: scroll the window
        const rect = el.getBoundingClientRect();
        const nodeY = rect.top + window.scrollY + currentIdx * 150;
        window.scrollTo({ top: nodeY - 200, behavior: 'smooth' });
      });
    }
  }, [learningPath, svgWidth]);

  const handleNodeClick = useCallback((node: LearningPathNodeDto) => {
    playSound('click');
    setStartNode(node);
  }, [playSound]);

  const handleLockedClick = useCallback((message: string) => {
    playSound('wrong');
    setLockedMessage(message);
  }, [playSound]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !learningPath) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>تعذّر تحميل مسار التعلم</p>
      </div>
    );
  }

  if (learningPath.nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>لا توجد دروس في هذا المسار بعد</p>
      </div>
    );
  }

  const svgHeight = learningPath.nodes.length * 150 + 100;
  const pathD = generateSnakePath(learningPath.nodes, svgWidth);

  // NoorOwl positions: after every 3rd node (index 2, 5, 8…)
  const owlIndices = learningPath.nodes
    .map((_, i) => i)
    .filter((i) => (i + 1) % 3 === 0 && i < learningPath.nodes.length - 1);

  return (
    <>
      <div ref={containerRef} className="relative w-full" style={{ height: svgHeight }}>
        <svg
          className="absolute inset-0 w-full"
          style={{ height: svgHeight }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <path d={pathD} fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d={pathD}
            fill="none"
            stroke="#FFD700"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            style={{ strokeDashoffset: pathOffset }}
          />
        </svg>

        {learningPath.nodes.map((node, i) => {
          const pos = nodePositions[i];
          if (!pos) return null;
          return (
            <LearningPathNode
              key={node.id}
              node={node}
              position={pos}
              onClick={() => handleNodeClick(node)}
              onLockedClick={handleLockedClick}
            />
          );
        })}

        {/* NoorOwl every 3 nodes */}
        {owlIndices.map((idx, owlNum) => {
          const pos = nodePositions[idx];
          if (!pos) return null;
          const cx = svgWidth / 2;
          const msg = NOOROWL_MESSAGES[owlNum % NOOROWL_MESSAGES.length];
          return (
            <motion.div
              key={`owl-${idx}`}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: cx - 30, top: pos.y + 55 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + owlNum * 0.1, type: 'spring', stiffness: 200 }}
            >
              <NoorOwl expression="encouraging" size={50} animate />
              <p className="text-[10px] font-bold text-brand text-center max-w-[100px] leading-tight">{msg}</p>
            </motion.div>
          );
        })}

        {/* Locked unit overlay */}
        <AnimatePresence>
          {lockedMessage && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLockedMessage(null)}
            >
              <motion.div
                className="bg-white rounded-3xl p-7 max-w-xs w-full flex flex-col items-center gap-4 shadow-2xl"
                initial={{ scale: 0.7, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.7, y: 40 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <NoorOwl expression="encouraging" size={90} animate />
                <p className="text-brand font-extrabold text-center text-lg leading-snug">
                  {lockedMessage}
                </p>
                <button
                  className="bg-brand text-gold font-bold rounded-xl px-6 py-2 text-sm hover:opacity-90"
                  onClick={() => setLockedMessage(null)}
                >
                  حسناً!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pre-lesson start modal */}
      <AnimatePresence>
        {startNode && (
          <LessonStartModal node={startNode} onClose={() => setStartNode(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
