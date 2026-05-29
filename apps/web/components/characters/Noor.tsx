'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type NoorExpression =
  | 'default' | 'happy' | 'excited' | 'sad' | 'angry'
  | 'sleeping' | 'studying' | 'dancing' | 'encouraging'
  | 'celebrating' | 'thinking' | 'proud' | 'love' | 'phd';

export interface NoorProps {
  expression?: NoorExpression;
  size?: number;
  animate?: boolean;
  loop?: boolean;
  message?: string;
  onClick?: () => void;
}

const BODY_ANIMS: Record<NoorExpression, object> = {
  default:     { scale: [1, 1.025, 1],         transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
  happy:       { y: [0, -10, 0, -7, 0],        transition: { repeat: Infinity, duration: 1.2 } },
  excited:     { rotate: [-6, 6, -6], scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.45 } },
  sad:         { y: [0, 4, 0], rotate: [0, -2, 0], transition: { repeat: Infinity, duration: 2.8 } },
  angry:       { x: [-4, 4, -4],              transition: { repeat: Infinity, duration: 0.22 } },
  sleeping:    { rotate: [0, 3, 0], scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 4 } },
  studying:    { x: [0, 1.5, -1.5, 0],        transition: { repeat: Infinity, duration: 2.5 } },
  dancing:     { rotate: [-9, 9, -9], y: [0, -6, 0], transition: { repeat: Infinity, duration: 0.65 } },
  encouraging: { x: [0, 5, 0],                transition: { repeat: Infinity, duration: 1.1 } },
  celebrating: { y: [0, -13, 0], rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 0.75 } },
  thinking:    { rotate: [0, -3, 0],           transition: { repeat: Infinity, duration: 2.2 } },
  proud:       { scale: [1, 1.06, 1],          transition: { repeat: Infinity, duration: 2 } },
  love:        { rotate: [-3, 3, -3], scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 1.6 } },
  phd:         { y: [0, -5, 0],               transition: { repeat: Infinity, duration: 2 } },
};

function FloatingFx({ expression, s }: { expression: NoorExpression; s: number }) {
  if (expression === 'excited') return (
    <>
      {(['✨', '⭐', '✨'] as const).map((c, i) => (
        <motion.div key={i} style={{ position: 'absolute', fontSize: 12 * s, color: '#FFD700', pointerEvents: 'none', top: 0, left: '50%' }}
          animate={{ opacity: [0, 1, 0], y: [-8 * s, -30 * s], x: [(i - 1) * 22 * s, (i - 1) * 28 * s] }}
          transition={{ repeat: Infinity, duration: 1.3, delay: i * 0.35 }}>{c}</motion.div>
      ))}
    </>
  );
  if (expression === 'happy') return (
    <motion.div style={{ position: 'absolute', inset: -8 * s, borderRadius: '50%', border: `2.5px solid #FFD700`, pointerEvents: 'none' }}
      animate={{ opacity: [0.5, 0, 0.5], scale: [0.88, 1.18, 0.88] }}
      transition={{ repeat: Infinity, duration: 1.6 }} />
  );
  if (expression === 'love') return (
    <>
      {(['💙', '💙', '💙'] as const).map((h, i) => (
        <motion.div key={i} style={{ position: 'absolute', fontSize: 11 * s, pointerEvents: 'none', top: '30%', left: '50%' }}
          animate={{ opacity: [0, 1, 0], y: [0, -35 * s, -70 * s], x: [(i - 1) * 20 * s, (i - 1) * 26 * s, (i - 1) * 20 * s] }}
          transition={{ repeat: Infinity, duration: 1.9, delay: i * 0.55 }}>{h}</motion.div>
      ))}
    </>
  );
  if (expression === 'celebrating') return (
    <>
      {(['🎊', '⭐', '🎉', '✨'] as const).map((c, i) => (
        <motion.div key={i} style={{ position: 'absolute', fontSize: 11 * s, pointerEvents: 'none', top: '20%', left: '50%' }}
          animate={{ opacity: [0, 1, 0], y: [0, -40 * s, -80 * s], x: [Math.sin(i) * 22 * s, Math.sin(i + 1) * 32 * s, Math.sin(i) * 22 * s] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.3 }}>{c}</motion.div>
      ))}
    </>
  );
  if (expression === 'dancing') return (
    <>
      {(['🎵', '🎶'] as const).map((n, i) => (
        <motion.div key={i} style={{ position: 'absolute', fontSize: 13 * s, pointerEvents: 'none', top: '25%', left: i === 0 ? '10%' : '80%' }}
          animate={{ opacity: [0, 1, 0], y: [0, -25 * s] }}
          transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.55 }}>{n}</motion.div>
      ))}
    </>
  );
  if (expression === 'thinking') return (
    <motion.div style={{ position: 'absolute', top: -5 * s, right: -2 * s, fontSize: 16 * s, pointerEvents: 'none' }}
      animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>❓</motion.div>
  );
  if (expression === 'phd' || expression === 'proud') return (
    <>
      {(['✨', '⭐', '✨'] as const).map((p, i) => (
        <motion.div key={i} style={{ position: 'absolute', fontSize: 10 * s, color: '#FFD700', pointerEvents: 'none', top: '10%', left: `${20 + i * 30}%` }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.7, 1.3, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.45 }}>{p}</motion.div>
      ))}
    </>
  );
  return null;
}

export default function Noor({ expression = 'default', size = 100, animate: anim = true, loop = true, message, onClick }: NoorProps) {
  const [msgVisible, setMsgVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setMsgVisible(true);
      const t = setTimeout(() => setMsgVisible(false), 3500);
      return () => clearTimeout(t);
    } else {
      setMsgVisible(false);
    }
  }, [message]);

  const svgW = size;
  const svgH = size * 1.25;
  const s = size / 100;

  // Pupil offset by expression
  const px = expression === 'studying' ? 3 : 0;
  const py = expression === 'thinking' ? -3 : expression === 'sad' ? 2 : 0;

  // Eye scale
  const es = expression === 'excited' ? 1.15 : expression === 'sad' ? 0.8 : 1;

  const heartEyes = expression === 'love';
  const starEyes = expression === 'happy' || expression === 'celebrating';
  const closedEyes = expression === 'sleeping';

  const bodyAnim = anim
    ? loop
      ? BODY_ANIMS[expression]
      : { ...BODY_ANIMS[expression], transition: { ...((BODY_ANIMS[expression] as any).transition ?? {}), repeat: 0 } }
    : {};

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 * s, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      {/* Speech bubble */}
      <AnimatePresence>
        {msgVisible && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 8 }}
            onClick={e => { e.stopPropagation(); setMsgVisible(false); }}
            style={{ background: 'white', border: '2.5px solid #1A1F5E', borderRadius: 12, padding: `${6 * s}px ${12 * s}px`, fontSize: Math.max(11, 13 * s), color: '#1A1F5E', fontWeight: 700, maxWidth: size * 2.8, textAlign: 'center', position: 'relative', boxShadow: '0 4px 14px rgba(26,31,94,0.18)', direction: 'rtl', lineHeight: 1.4 }}>
            {message}
            <div style={{ position: 'absolute', bottom: -9, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '9px solid #1A1F5E' }} />
            <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid white' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owl container */}
      <div style={{ position: 'relative', width: svgW, height: svgH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', pointerEvents: 'none' }}>
          <FloatingFx expression={expression} s={s} />
        </div>

        <motion.div animate={bodyAnim as any} style={{ transformOrigin: 'center 85%' }}>
          <svg width={svgW} height={svgH} viewBox="0 0 100 125" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* ── PHD HAT ── */}
            {expression === 'phd' && <>
              <rect x="26" y="10" width="48" height="7" rx="2" fill="#1a1a1a" />
              <rect x="18" y="6" width="64" height="6" rx="1.5" fill="#2a2a2a" />
              <line x1="74" y1="9" x2="81" y2="22" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx="81" cy="24" r="3" fill="#FFD700" />
            </>}

            {/* ── EAR TUFTS ── */}
            <polygon points="29,13 23,3 36,8" fill="#1A1F5E" />
            <polygon points="71,13 77,3 64,8" fill="#1A1F5E" />

            {/* ── HEAD ── */}
            <ellipse cx="50" cy="38" rx="28" ry="26" fill="#1A1F5E" />

            {/* ── BODY ── */}
            <ellipse cx="50" cy="83" rx="27" ry="31" fill="#1A1F5E" />

            {/* ── WINGS ── */}
            <path d={expression === 'celebrating' ? 'M23,68 Q8,52 10,36 Q15,52 23,62 Z' : 'M23,70 Q8,58 10,44 Q15,58 23,64 Z'} fill="#131748" />
            <path d={expression === 'celebrating' ? 'M77,68 Q92,52 90,36 Q85,52 77,62 Z' : 'M77,70 Q92,58 90,44 Q85,58 77,64 Z'} fill="#131748" />

            {/* ── CHEST ── */}
            <ellipse cx="50" cy="87" rx="16" ry="21" fill="white" opacity="0.93" />

            {/* ── BOOK (studying) ── */}
            {expression === 'studying' && (
              <g transform="translate(64, 70)">
                <rect width="23" height="19" rx="2" fill="#FFD700" />
                <rect width="11.5" height="19" rx="2" fill="#e6b800" />
                <line x1="11.5" y1="0" x2="11.5" y2="19" stroke="#1A1F5E" strokeWidth="1" />
                <line x1="3" y1="6" x2="9" y2="6" stroke="#1A1F5E" strokeWidth="0.7" />
                <line x1="3" y1="9" x2="9" y2="9" stroke="#1A1F5E" strokeWidth="0.7" />
                <line x1="14" y1="6" x2="20" y2="6" stroke="#1A1F5E" strokeWidth="0.7" />
                <line x1="14" y1="9" x2="20" y2="9" stroke="#1A1F5E" strokeWidth="0.7" />
              </g>
            )}

            {/* ── DIPLOMA (phd) ── */}
            {expression === 'phd' && (
              <g transform="translate(64, 74)">
                <rect width="22" height="15" rx="2" fill="white" stroke="#1A1F5E" strokeWidth="1" />
                <line x1="3" y1="6" x2="19" y2="6" stroke="#1A1F5E" strokeWidth="0.8" />
                <line x1="3" y1="9" x2="15" y2="9" stroke="#1A1F5E" strokeWidth="0.8" />
                <text x="6" y="14" fontSize="5" fill="#FFD700">★</text>
              </g>
            )}

            {/* ── THINKING HAND ── */}
            {expression === 'thinking' && (
              <g transform="translate(24, 66)">
                <ellipse cx="5" cy="5" rx="8" ry="5" fill="#131748" />
                <ellipse cx="5" cy="2" rx="5" ry="3.5" fill="#131748" />
              </g>
            )}

            {/* ── PROUD HAND ON CHEST ── */}
            {expression === 'proud' && (
              <ellipse cx="50" cy="77" rx="10" ry="6" fill="#131748" />
            )}

            {/* ── POINTING WING (encouraging) ── */}
            {expression === 'encouraging' && (
              <g transform="translate(76, 54) rotate(-35)">
                <ellipse cx="0" cy="6" rx="5" ry="8" fill="#1A1F5E" />
                <ellipse cx="3" cy="-2" rx="3.5" ry="5" fill="#1A1F5E" transform="rotate(-40 3 -2)" />
              </g>
            )}

            {/* ── ZZZ (sleeping) ── */}
            {expression === 'sleeping' && <>
              <motion.text x="63" y="24" fontSize="10" fill="#94a3b8" fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [24, 14] }} transition={{ repeat: Infinity, duration: 2 }}>Z</motion.text>
              <motion.text x="70" y="16" fontSize="7" fill="#cbd5e1" fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [16, 8] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}>z</motion.text>
            </>}

            {/* ── EYEBROWS ── */}
            {expression === 'angry'
              ? <><line x1="23" y1="24" x2="36" y2="29" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="77" y1="24" x2="64" y2="29" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" /></>
              : (expression === 'happy' || expression === 'excited' || expression === 'celebrating')
              ? <><path d="M23,26 Q30,21 37,26" stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M63,26 Q70,21 77,26" stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" /></>
              : expression === 'sad'
              ? <><path d="M23,26 Q30,29 37,26" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" />
                  <path d="M63,26 Q70,29 77,26" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" /></>
              : <><line x1="25" y1="25" x2="37" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  <line x1="63" y1="25" x2="75" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" /></>
            }

            {/* ── LEFT EYE ── */}
            <g transform="translate(35, 37)">
              {closedEyes
                ? <line x1="-9" y1="0" x2="9" y2="0" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
                : heartEyes
                ? <text x="-9" y="7" fontSize="15" fill="#60a5fa">♥</text>
                : starEyes
                ? <text x="-9" y="7" fontSize="15" fill="#FFD700">★</text>
                : <>
                    <circle cx="0" cy="0" r={10 * es} fill="#FFD700" />
                    {expression === 'angry' && <circle cx="0" cy="0" r={10 * es} fill="#FF5555" opacity="0.18" />}
                    <motion.circle cx={px} cy={py} r={5 * es} fill="#111"
                      animate={expression === 'studying' ? { cx: [0, 3, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }} />
                    <circle cx={1.5 + px} cy={-1.5 + py} r={2} fill="white" />
                  </>
              }
            </g>

            {/* ── RIGHT EYE ── */}
            <g transform="translate(65, 37)">
              {closedEyes
                ? <line x1="-9" y1="0" x2="9" y2="0" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
                : heartEyes
                ? <text x="-9" y="7" fontSize="15" fill="#60a5fa">♥</text>
                : starEyes
                ? <text x="-9" y="7" fontSize="15" fill="#FFD700">★</text>
                : <>
                    <circle cx="0" cy="0" r={10 * es} fill="#FFD700" />
                    {expression === 'angry' && <circle cx="0" cy="0" r={10 * es} fill="#FF5555" opacity="0.18" />}
                    <motion.circle cx={px} cy={py} r={5 * es} fill="#111"
                      animate={expression === 'studying' ? { cx: [0, 3, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }} />
                    <circle cx={1.5 + px} cy={-1.5 + py} r={2} fill="white" />
                  </>
              }
            </g>

            {/* ── BEAK ── */}
            <polygon points="50,46 44,55 56,55" fill="#FFD700" />
            <line x1="47" y1="49" x2="53" y2="49" stroke="#e6b800" strokeWidth="0.8" opacity="0.6" />

            {/* ── TEAR (sad) ── */}
            {expression === 'sad' && (
              <motion.ellipse cx="27" cy="48" rx="2.5" ry="4" fill="#60a5fa"
                animate={{ cy: [48, 62], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeIn' }} />
            )}

            {/* ── FEET ── */}
            <ellipse cx="40" cy="112" rx="9.5" ry="4.5" fill="#FFD700" />
            <ellipse cx="60" cy="112" rx="9.5" ry="4.5" fill="#FFD700" />
            <line x1="34" y1="114" x2="36" y2="117" stroke="#e6b800" strokeWidth="1.2" />
            <line x1="38" y1="115" x2="39" y2="118" stroke="#e6b800" strokeWidth="1.2" />
            <line x1="40" y1="115" x2="40" y2="118" stroke="#e6b800" strokeWidth="1.2" />
            <line x1="54" y1="114" x2="56" y2="117" stroke="#e6b800" strokeWidth="1.2" />
            <line x1="58" y1="115" x2="59" y2="118" stroke="#e6b800" strokeWidth="1.2" />
            <line x1="60" y1="115" x2="60" y2="118" stroke="#e6b800" strokeWidth="1.2" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
