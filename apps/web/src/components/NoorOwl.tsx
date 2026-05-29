import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type NoorExpression =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'sleeping'
  | 'angry'
  | 'studying'
  | 'dancing'
  | 'encouraging'
  | 'default';

interface NoorOwlProps {
  expression?: NoorExpression;
  size?: number;
  animate?: boolean;
  message?: string;
}

const expressionVariants: Record<NoorExpression, object> = {
  happy: { y: [0, -12, 0], transition: { repeat: Infinity, duration: 1 } },
  excited: { rotate: [-5, 5, -5], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.5 } },
  sad: { y: [0, 4, 0], transition: { repeat: Infinity, duration: 2 } },
  sleeping: { rotate: [0, 2, 0], transition: { repeat: Infinity, duration: 3 } },
  dancing: { rotate: [-10, 10, -10], y: [0, -6, 0], transition: { repeat: Infinity, duration: 0.7 } },
  encouraging: { x: [0, 4, 0], transition: { repeat: Infinity, duration: 1 } },
  angry: { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.3 } },
  studying: {},
  default: {},
};

function getEyeStyle(expression: NoorExpression): React.CSSProperties {
  if (expression === 'sleeping') return { transform: 'scaleY(0.1)' };
  if (expression === 'angry') return { transform: 'translateY(2px)' };
  return {};
}

function getStars(expression: NoorExpression) {
  if (expression !== 'excited') return null;
  return (
    <>
      {['★', '✦', '★'].map((s, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            color: '#FFD700',
            fontSize: 12,
            top: -8 - i * 4,
            left: i === 0 ? -12 : i === 1 ? '50%' : 'auto',
            right: i === 2 ? -12 : 'auto',
          }}
          animate={{ opacity: [0, 1, 0], y: [-4, -12, -4] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
        >
          {s}
        </motion.span>
      ))}
    </>
  );
}

export default function NoorOwl({ expression = 'default', size = 80, animate = true, message }: NoorOwlProps) {
  const scale = size / 80;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <motion.div
        style={{ position: 'relative', width: size, height: size * 1.1 }}
        animate={animate ? expressionVariants[expression] : {}}
      >
        {getStars(expression)}

        {/* Body */}
        <svg width={size} height={size * 1.1} viewBox="0 0 80 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main body */}
          <ellipse cx="40" cy="52" rx="32" ry="34" fill="#1A1F5E" />

          {/* Chest */}
          <ellipse cx="40" cy="58" rx="18" ry="20" fill="white" opacity="0.9" />

          {/* Left wing */}
          <ellipse cx="14" cy="52" rx="10" ry="16" fill="#13174a" transform="rotate(-10 14 52)" />

          {/* Right wing */}
          <ellipse cx="66" cy="52" rx="10" ry="16" fill="#13174a" transform="rotate(10 66 52)" />

          {/* Head */}
          <ellipse cx="40" cy="26" rx="26" ry="24" fill="#1A1F5E" />

          {/* Ear tufts */}
          <polygon points="18,8 14,0 24,6" fill="#1A1F5E" />
          <polygon points="62,8 66,0 56,6" fill="#1A1F5E" />

          {/* Left eye outer */}
          <circle cx="28" cy="26" r="10" fill="#FFD700" style={getEyeStyle(expression)} />
          {/* Right eye outer */}
          <circle cx="52" cy="26" r="10" fill="#FFD700" style={getEyeStyle(expression)} />

          {/* Left pupil */}
          <circle cx="28" cy="26" r="5" fill="#111" />
          {/* Right pupil */}
          <circle cx="52" cy="26" r="5" fill="#111" />

          {/* Eye shine */}
          <circle cx="30" cy="24" r="2" fill="white" />
          <circle cx="54" cy="24" r="2" fill="white" />

          {/* Beak */}
          <polygon
            points="40,32 35,40 45,40"
            fill="#FFD700"
            style={expression === 'angry' ? { transform: 'rotate(5deg)', transformOrigin: '40px 36px' } : {}}
          />

          {/* Angry brows */}
          {expression === 'angry' && (
            <>
              <line x1="18" y1="18" x2="28" y2="22" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="62" y1="18" x2="52" y2="22" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Sad tear */}
          {expression === 'sad' && (
            <motion.ellipse
              cx="22"
              cy="36"
              rx="2"
              ry="4"
              fill="#4fc3f7"
              animate={{ cy: [36, 48], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Sleeping ZZZ marks */}
          {expression === 'sleeping' && (
            <>
              <text x="58" y="16" fontSize="8" fill="#aaa" fontWeight="bold">Z</text>
              <text x="62" y="10" fontSize="6" fill="#bbb" fontWeight="bold">z</text>
            </>
          )}

          {/* Book for studying */}
          {expression === 'studying' && (
            <rect x="24" y="68" width="32" height="18" rx="3" fill="#FFD700" opacity="0.9" />
          )}

          {/* Pointing finger for encouraging */}
          {expression === 'encouraging' && (
            <text x="58" y="50" fontSize="16">👆</text>
          )}

          {/* Feet */}
          <ellipse cx="32" cy="84" rx="8" ry="4" fill="#FFD700" />
          <ellipse cx="48" cy="84" rx="8" ry="4" fill="#FFD700" />
        </svg>
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: 'white',
              border: '2px solid #1A1F5E',
              borderRadius: 12,
              padding: '8px 14px',
              fontSize: 13 * scale,
              color: '#1A1F5E',
              fontWeight: 600,
              maxWidth: size * 2.5,
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(26,31,94,0.12)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -8,
                right: size * 0.3,
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid #1A1F5E',
              }}
            />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
