'use client';

import { motion } from 'framer-motion';

export type CharacterName = 'sami' | 'lina' | 'yousef' | 'mariam' | 'karim' | 'nadine' | 'tariq' | 'iman';
export type CharacterExpression = 'happy' | 'surprised' | 'thinking' | 'studying' | 'proud' | 'excited' | 'calm' | 'helping' | 'love' | 'confident' | 'determined' | 'curious';

interface CharacterProps {
  character: CharacterName;
  expression?: CharacterExpression;
  size?: number;
  animate?: boolean;
  message?: string;
  flipped?: boolean;
}

// ─── Shared Face Parts ────────────────────────────────────────────────────────

function Eyes({ expr }: { expr: CharacterExpression }) {
  if (expr === 'surprised') return (
    <>
      <circle cx="32" cy="38" r="6" fill="white" /><circle cx="32" cy="38" r="3.5" fill="#222" /><circle cx="33.5" cy="36.5" r="1" fill="white" />
      <circle cx="48" cy="38" r="6" fill="white" /><circle cx="48" cy="38" r="3.5" fill="#222" /><circle cx="49.5" cy="36.5" r="1" fill="white" />
    </>
  );
  if (expr === 'thinking' || expr === 'calm') return (
    <>
      <ellipse cx="32" cy="38" rx="5" ry="4" fill="white" /><circle cx="32" cy="38" r="2.5" fill="#222" />
      <ellipse cx="48" cy="38" rx="5" ry="4" fill="white" /><circle cx="49" cy="38" r="2.5" fill="#222" />
    </>
  );
  if (expr === 'love') return (
    <>
      <text x="24" y="43" fontSize="10">♥</text>
      <text x="40" y="43" fontSize="10">♥</text>
    </>
  );
  // default happy/proud/excited/studying/etc
  return (
    <>
      <circle cx="32" cy="38" r="5" fill="white" /><circle cx="33" cy="38" r="3" fill="#222" /><circle cx="34" cy="37" r="1" fill="white" />
      <circle cx="48" cy="38" r="5" fill="white" /><circle cx="49" cy="38" r="3" fill="#222" /><circle cx="50" cy="37" r="1" fill="white" />
    </>
  );
}

function Mouth({ expr }: { expr: CharacterExpression }) {
  if (expr === 'surprised') return <ellipse cx="40" cy="51" rx="5" ry="6" fill="#222" />;
  if (expr === 'thinking') return <path d="M35,50 Q40,48 45,51" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
  if (expr === 'calm') return <line x1="35" y1="50" x2="45" y2="50" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />;
  if (expr === 'determined') return <path d="M34,51 Q40,47 46,51" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />;
  // happy default
  return <path d="M33,49 Q40,56 47,49" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />;
}

// ─── Sami ─────────────────────────────────────────────────────────────────────
function Sami({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      {/* Body */}
      <rect x="20" y="68" width="40" height="38" rx="8" fill="#1A1F5E" />
      {/* Neck */}
      <rect x="34" y="62" width="12" height="10" fill="#D4956A" />
      {/* Head */}
      <ellipse cx="40" cy="38" rx="24" ry="26" fill="#D4956A" />
      {/* Hair — messy black */}
      <ellipse cx="40" cy="14" rx="24" ry="10" fill="#1a1a1a" />
      <ellipse cx="20" cy="22" rx="8" ry="6" fill="#1a1a1a" />
      <ellipse cx="60" cy="22" rx="8" ry="6" fill="#1a1a1a" />
      <path d="M24,18 Q28,8 36,12" stroke="#1a1a1a" strokeWidth="4" fill="none" />
      <path d="M44,10 Q50,7 56,12" stroke="#1a1a1a" strokeWidth="4" fill="none" />
      {/* Ears */}
      <ellipse cx="16" cy="40" rx="5" ry="6" fill="#C4855A" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#C4855A" />
      {/* Face */}
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#C4855A" />
      <Mouth expr={expr} />
      {/* Arms */}
      <rect x="6" y="70" width="14" height="28" rx="7" fill="#1A1F5E" />
      <rect x="60" y="70" width="14" height="28" rx="7" fill="#1A1F5E" />
      {/* Hands */}
      <circle cx="13" cy="100" r="6" fill="#D4956A" />
      <circle cx="67" cy="100" r="6" fill="#D4956A" />
      {/* Legs */}
      <rect x="22" y="100" width="14" height="10" rx="4" fill="#444" />
      <rect x="44" y="100" width="14" height="10" rx="4" fill="#444" />
    </svg>
  );
}

// ─── Lina ─────────────────────────────────────────────────────────────────────
function Lina({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      {/* Dress */}
      <path d="M18,68 L15,108 L65,108 L62,68 Z" fill="#2E7D32" />
      {/* Neck */}
      <rect x="34" y="62" width="12" height="10" fill="#D4956A" />
      {/* Head */}
      <ellipse cx="40" cy="38" rx="23" ry="25" fill="#D4956A" />
      {/* Long hair */}
      <ellipse cx="40" cy="14" rx="24" ry="10" fill="#1a1a1a" />
      <rect x="14" y="20" width="10" height="50" rx="5" fill="#1a1a1a" />
      <rect x="56" y="20" width="10" height="50" rx="5" fill="#1a1a1a" />
      {/* Braid */}
      <path d="M16,65 Q12,75 16,85 Q20,75 16,65" fill="#1a1a1a" />
      {/* Ears */}
      <ellipse cx="17" cy="40" rx="5" ry="6" fill="#C4855A" />
      <ellipse cx="63" cy="40" rx="5" ry="6" fill="#C4855A" />
      {/* Face */}
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#C4855A" />
      <Mouth expr={expr} />
      {/* Arms */}
      <rect x="5" y="70" width="13" height="26" rx="6" fill="#2E7D32" />
      <rect x="62" y="70" width="13" height="26" rx="6" fill="#2E7D32" />
      <circle cx="11" cy="98" r="6" fill="#D4956A" />
      <circle cx="69" cy="98" r="6" fill="#D4956A" />
    </svg>
  );
}

// ─── Yousef ───────────────────────────────────────────────────────────────────
function Yousef({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      <rect x="20" y="68" width="40" height="38" rx="8" fill="#E67E22" />
      <rect x="34" y="62" width="12" height="10" fill="#E8C89A" />
      <ellipse cx="40" cy="38" rx="22" ry="24" fill="#E8C89A" />
      {/* Short hair */}
      <ellipse cx="40" cy="16" rx="22" ry="8" fill="#222" />
      <ellipse cx="17" cy="22" rx="6" ry="5" fill="#222" />
      <ellipse cx="63" cy="22" rx="6" ry="5" fill="#222" />
      <ellipse cx="16" cy="40" rx="5" ry="6" fill="#D9B890" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#D9B890" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#D9B890" />
      <Mouth expr={expr} />
      <rect x="6" y="70" width="14" height="26" rx="7" fill="#E67E22" />
      <rect x="60" y="70" width="14" height="26" rx="7" fill="#E67E22" />
      <circle cx="13" cy="98" r="6" fill="#E8C89A" />
      <circle cx="67" cy="98" r="6" fill="#E8C89A" />
      <rect x="22" y="100" width="14" height="10" rx="4" fill="#555" />
      <rect x="44" y="100" width="14" height="10" rx="4" fill="#555" />
    </svg>
  );
}

// ─── Mariam ───────────────────────────────────────────────────────────────────
function Mariam({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      <path d="M18,68 L15,108 L65,108 L62,68 Z" fill="#6A0DAD" />
      <rect x="34" y="62" width="12" height="10" fill="#D4956A" />
      <ellipse cx="40" cy="38" rx="23" ry="25" fill="#D4956A" />
      {/* Wavy long hair */}
      <ellipse cx="40" cy="14" rx="24" ry="10" fill="#1a1a1a" />
      <path d="M14,24 Q8,40 12,60 Q16,44 16,28 Z" fill="#1a1a1a" />
      <path d="M66,24 Q72,40 68,60 Q64,44 64,28 Z" fill="#1a1a1a" />
      {/* Colorful scarf hint */}
      <rect x="18" y="58" width="44" height="6" rx="3" fill="#FF9800" opacity="0.6" />
      <ellipse cx="17" cy="40" rx="5" ry="6" fill="#C4855A" />
      <ellipse cx="63" cy="40" rx="5" ry="6" fill="#C4855A" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#C4855A" />
      <Mouth expr={expr} />
      <rect x="5" y="70" width="13" height="26" rx="6" fill="#6A0DAD" />
      <rect x="62" y="70" width="13" height="26" rx="6" fill="#6A0DAD" />
      <circle cx="11" cy="98" r="6" fill="#D4956A" />
      <circle cx="69" cy="98" r="6" fill="#D4956A" />
    </svg>
  );
}

// ─── Karim ────────────────────────────────────────────────────────────────────
function Karim({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      <rect x="20" y="68" width="40" height="38" rx="8" fill="#27AE60" />
      <rect x="34" y="62" width="12" height="10" fill="#E8D0B0" />
      <ellipse cx="40" cy="38" rx="22" ry="24" fill="#E8D0B0" />
      {/* Curly hair */}
      {[24,30,36,42,48,54].map((x, i) => (
        <circle key={i} cx={x} cy={16} r={7} fill="#222" />
      ))}
      <ellipse cx="40" cy="20" rx="22" ry="10" fill="#222" />
      {/* Round yellow glasses */}
      <circle cx="32" cy="39" r="9" stroke="#FFD700" strokeWidth="2.5" fill="none" />
      <circle cx="48" cy="39" r="9" stroke="#FFD700" strokeWidth="2.5" fill="none" />
      <line x1="41" y1="39" x2="39" y2="39" stroke="#FFD700" strokeWidth="2" />
      <ellipse cx="16" cy="40" rx="5" ry="6" fill="#D9C0A0" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#D9C0A0" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#D9C0A0" />
      <Mouth expr={expr} />
      <rect x="6" y="70" width="14" height="26" rx="7" fill="#27AE60" />
      <rect x="60" y="70" width="14" height="26" rx="7" fill="#27AE60" />
      <circle cx="13" cy="98" r="6" fill="#E8D0B0" />
      <circle cx="67" cy="98" r="6" fill="#E8D0B0" />
      <rect x="22" y="100" width="14" height="10" rx="4" fill="#555" />
      <rect x="44" y="100" width="14" height="10" rx="4" fill="#555" />
    </svg>
  );
}

// ─── Nadine ───────────────────────────────────────────────────────────────────
function Nadine({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      {/* Athletic top */}
      <rect x="18" y="68" width="44" height="38" rx="8" fill="#C0392B" />
      {/* White stripes */}
      <rect x="18" y="74" width="44" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="18" y="82" width="44" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="34" y="62" width="12" height="10" fill="#E8C89A" />
      <ellipse cx="40" cy="38" rx="22" ry="24" fill="#E8C89A" />
      {/* Short straight hair */}
      <rect x="16" y="14" width="48" height="18" rx="8" fill="#3a2510" />
      <rect x="14" y="22" width="8" height="20" rx="4" fill="#3a2510" />
      <rect x="58" y="22" width="8" height="20" rx="4" fill="#3a2510" />
      <ellipse cx="16" cy="40" rx="5" ry="6" fill="#D9B890" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#D9B890" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#D9B890" />
      <Mouth expr={expr} />
      <rect x="5" y="70" width="13" height="28" rx="6" fill="#C0392B" />
      <rect x="62" y="70" width="13" height="28" rx="6" fill="#C0392B" />
      <circle cx="11" cy="100" r="6" fill="#E8C89A" />
      <circle cx="69" cy="100" r="6" fill="#E8C89A" />
    </svg>
  );
}

// ─── Tariq ────────────────────────────────────────────────────────────────────
function Tariq({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      <rect x="20" y="68" width="40" height="38" rx="8" fill="#2C3E50" />
      <rect x="34" y="62" width="12" height="10" fill="#D4956A" />
      <ellipse cx="40" cy="38" rx="22" ry="24" fill="#D4956A" />
      {/* Neat combed hair */}
      <ellipse cx="40" cy="16" rx="22" ry="9" fill="#1a1a1a" />
      <ellipse cx="17" cy="24" rx="7" ry="6" fill="#1a1a1a" />
      <ellipse cx="63" cy="24" rx="7" ry="6" fill="#1a1a1a" />
      {/* Rectangular glasses */}
      <rect x="23" y="33" width="16" height="10" rx="3" stroke="#555" strokeWidth="2" fill="none" />
      <rect x="41" y="33" width="16" height="10" rx="3" stroke="#555" strokeWidth="2" fill="none" />
      <line x1="39" y1="38" x2="41" y2="38" stroke="#555" strokeWidth="2" />
      <ellipse cx="16" cy="40" rx="5" ry="6" fill="#C4855A" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#C4855A" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#C4855A" />
      <Mouth expr={expr} />
      <rect x="6" y="70" width="14" height="26" rx="7" fill="#2C3E50" />
      <rect x="60" y="70" width="14" height="26" rx="7" fill="#2C3E50" />
      <circle cx="13" cy="98" r="6" fill="#D4956A" />
      <circle cx="67" cy="98" r="6" fill="#D4956A" />
      <rect x="22" y="100" width="14" height="10" rx="4" fill="#444" />
      <rect x="44" y="100" width="14" height="10" rx="4" fill="#444" />
    </svg>
  );
}

// ─── Iman ─────────────────────────────────────────────────────────────────────
function Iman({ size, expr }: { size: number; expr: CharacterExpression }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
      <path d="M18,68 L15,108 L65,108 L62,68 Z" fill="#FADADD" />
      <rect x="34" y="62" width="12" height="10" fill="#F0C0A0" />
      <ellipse cx="40" cy="38" rx="23" ry="25" fill="#F0C0A0" />
      {/* Hair with pink bow */}
      <ellipse cx="40" cy="14" rx="24" ry="10" fill="#3a2510" />
      <rect x="14" y="20" width="9" height="42" rx="4.5" fill="#3a2510" />
      <rect x="57" y="20" width="9" height="42" rx="4.5" fill="#3a2510" />
      {/* Pink bow */}
      <path d="M32,12 Q36,8 40,12 Q36,16 32,12 Z" fill="#FF6B9D" />
      <path d="M40,12 Q44,8 48,12 Q44,16 40,12 Z" fill="#FF6B9D" />
      <circle cx="40" cy="12" r="3" fill="#FF4488" />
      <ellipse cx="17" cy="40" rx="5" ry="6" fill="#E0B090" />
      <ellipse cx="63" cy="40" rx="5" ry="6" fill="#E0B090" />
      <Eyes expr={expr} />
      <ellipse cx="40" cy="44" rx="2" ry="1.5" fill="#E0B090" />
      <Mouth expr={expr} />
      {/* Rosy cheeks */}
      <ellipse cx="28" cy="46" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="52" cy="46" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
      <rect x="5" y="70" width="13" height="26" rx="6" fill="#FADADD" />
      <rect x="62" y="70" width="13" height="26" rx="6" fill="#FADADD" />
      <circle cx="11" cy="98" r="6" fill="#F0C0A0" />
      <circle cx="69" cy="98" r="6" fill="#F0C0A0" />
    </svg>
  );
}

// ─── Character Map ─────────────────────────────────────────────────────────────
const CHARACTER_MAP: Record<CharacterName, React.FC<{ size: number; expr: CharacterExpression }>> = {
  sami:   Sami,
  lina:   Lina,
  yousef: Yousef,
  mariam: Mariam,
  karim:  Karim,
  nadine: Nadine,
  tariq:  Tariq,
  iman:   Iman,
};

export const CHARACTER_LABELS: Record<CharacterName, string> = {
  sami: 'سامي', lina: 'لينا', yousef: 'يوسف', mariam: 'مريم',
  karim: 'كريم', nadine: 'نادين', tariq: 'طارق', iman: 'إيمان',
};

export default function StudentCharacter({ character, expression = 'happy', size = 100, animate: anim = false, message, flipped = false }: CharacterProps) {
  const Component = CHARACTER_MAP[character];

  const bodyAnim = anim ? {
    animate: expression === 'excited' ? { y: [0, -8, 0], rotate: [-3, 3, -3] } : { scale: [1, 1.02, 1] },
    transition: { repeat: Infinity, duration: expression === 'excited' ? 0.6 : 2 },
  } : {};

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {message && (
        <div style={{ background: 'white', border: '2px solid #1A1F5E', borderRadius: 10, padding: '6px 12px', fontSize: 13, color: '#1A1F5E', fontWeight: 700, maxWidth: size * 2.5, textAlign: 'center', position: 'relative', direction: 'rtl' }}>
          {message}
          <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #1A1F5E' }} />
        </div>
      )}
      <motion.div style={{ transform: flipped ? 'scaleX(-1)' : 'none' }} {...bodyAnim}>
        <Component size={size} expr={expression} />
      </motion.div>
    </div>
  );
}
