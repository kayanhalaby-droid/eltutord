'use client';

export type SceneName = 'school' | 'home' | 'market' | 'garden' | 'classroom';

interface SceneProps { scene: SceneName; width?: number; height?: number; className?: string }

function SchoolScene({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" fill="none">
      {/* Sky */}
      <rect width="400" height="300" fill="#E8F4FD" />
      {/* School building */}
      <rect x="60" y="80" width="280" height="180" rx="4" fill="#E8E0D0" />
      {/* Roof */}
      <polygon points="40,82 200,30 360,82" fill="#8B4513" />
      {/* Entrance */}
      <rect x="170" y="190" width="60" height="70" rx="4" fill="#8B6914" />
      <circle cx="200" cy="225" r="4" fill="#FFD700" />
      {/* Windows */}
      {[90, 160, 240, 310].map((x, i) => (
        <g key={i}>
          <rect x={x} y="100" width="50" height="60" rx="4" fill="#87CEEB" stroke="#555" strokeWidth="1.5" />
          <line x1={x + 25} y1="100" x2={x + 25} y2="160" stroke="#555" strokeWidth="1" />
          <line x1={x} y1="130" x2={x + 50} y2="130" stroke="#555" strokeWidth="1" />
        </g>
      ))}
      {/* Star board on wall */}
      <rect x="148" y="108" width="28" height="18" rx="2" fill="#2E7D32" />
      <text x="152" y="121" fontSize="10" fill="#FFD700">★★★</text>
      {/* Plants */}
      <rect x="60" y="240" width="12" height="30" rx="3" fill="#5D4037" />
      <circle cx="66" cy="235" r="18" fill="#2E7D32" />
      <rect x="325" y="240" width="12" height="30" rx="3" fill="#5D4037" />
      <circle cx="331" cy="235" r="18" fill="#2E7D32" />
      {/* Path */}
      <rect x="170" y="260" width="60" height="40" fill="#C9B99A" />
      {/* Ground */}
      <rect x="0" y="270" width="400" height="30" fill="#8BC34A" />
    </svg>
  );
}

function HomeScene({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" fill="none">
      {/* Wall */}
      <rect width="400" height="300" fill="#FFF8F0" />
      {/* Floor */}
      <rect x="0" y="240" width="400" height="60" fill="#D2B48C" />
      {/* Rug */}
      <ellipse cx="200" cy="250" rx="120" ry="18" fill="#E91E63" opacity="0.4" />
      <ellipse cx="200" cy="250" rx="90" ry="12" fill="#9C27B0" opacity="0.3" />
      {/* Sofa */}
      <rect x="80" y="190" width="180" height="55" rx="12" fill="#7B5EA7" />
      <rect x="75" y="170" width="192" height="30" rx="10" fill="#9575CD" />
      <rect x="75" y="180" width="20" height="65" rx="8" fill="#9575CD" />
      <rect x="247" y="180" width="20" height="65" rx="8" fill="#9575CD" />
      {/* TV */}
      <rect x="295" y="155" width="70" height="50" rx="5" fill="#222" />
      <rect x="300" y="158" width="60" height="43" rx="3" fill="#1A237E" />
      <rect x="320" y="205" width="20" height="8" rx="3" fill="#555" />
      {/* Family photos */}
      <rect x="30" y="90" width="35" height="28" rx="3" fill="white" stroke="#8B4513" strokeWidth="2" />
      <circle cx="40" cy="99" r="5" fill="#D4956A" />
      <rect x="30" y="104" width="35" height="10" fill="#1A1F5E" opacity="0.7" />
      <rect x="80" y="85" width="35" height="28" rx="3" fill="white" stroke="#8B4513" strokeWidth="2" />
      <circle cx="90" cy="94" r="5" fill="#E8C89A" />
      <rect x="80" y="99" width="35" height="10" fill="#2E7D32" opacity="0.7" />
      {/* Study table */}
      <rect x="290" y="215" width="80" height="8" rx="3" fill="#8B4513" />
      <rect x="295" y="223" width="8" height="30" fill="#8B4513" />
      <rect x="355" y="223" width="8" height="30" fill="#8B4513" />
      {/* Books on table */}
      <rect x="300" y="200" width="12" height="16" rx="1" fill="#F44336" />
      <rect x="313" y="198" width="12" height="18" rx="1" fill="#2196F3" />
      <rect x="326" y="202" width="12" height="14" rx="1" fill="#4CAF50" />
      {/* Window */}
      <rect x="155" y="50" width="90" height="80" rx="5" fill="#87CEEB" stroke="#8B4513" strokeWidth="3" />
      <line x1="200" y1="50" x2="200" y2="130" stroke="#8B4513" strokeWidth="2" />
      <line x1="155" y1="90" x2="245" y2="90" stroke="#8B4513" strokeWidth="2" />
    </svg>
  );
}

function MarketScene({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" fill="none">
      {/* Background */}
      <rect width="400" height="300" fill="#FFF9E6" />
      {/* Tile floor */}
      {Array.from({ length: 8 }, (_, i) => Array.from({ length: 4 }, (_, j) => (
        <rect key={`${i}-${j}`} x={i * 50} y={220 + j * 20} width="48" height="18" rx="1" fill={((i + j) % 2 === 0) ? '#E0D0B0' : '#F0E8D0'} stroke="#D4C090" strokeWidth="0.5" />
      )))}
      {/* Shelves */}
      {[0, 1, 2].map(row => (
        <g key={row}>
          <rect x="20" y={60 + row * 55} width="160" height="8" rx="2" fill="#8B4513" />
          {/* Items on shelf */}
          {[35, 60, 85, 110, 135].map((x, i) => (
            <circle key={i} cx={x} cy={54 + row * 55} r={12} fill={['#FF5722', '#4CAF50', '#FFC107', '#2196F3', '#E91E63'][i]} />
          ))}
        </g>
      ))}
      {/* Right shelves */}
      {[0, 1, 2].map(row => (
        <g key={row}>
          <rect x="220" y={60 + row * 55} width="160" height="8" rx="2" fill="#8B4513" />
          {[235, 260, 285, 310, 335].map((x, i) => (
            <rect key={i} x={x - 10} y={44 + row * 55} width="20" height="18" rx="2" fill={['#FF9800', '#9C27B0', '#00BCD4', '#F44336', '#8BC34A'][i]} />
          ))}
        </g>
      ))}
      {/* Signs */}
      <rect x="30" y="20" width="80" height="20" rx="4" fill="#FF5722" />
      <text x="40" y="34" fontSize="9" fill="white" fontWeight="bold">خضروات</text>
      <rect x="240" y="20" width="80" height="20" rx="4" fill="#2196F3" />
      <text x="260" y="34" fontSize="9" fill="white" fontWeight="bold">فاكهة</text>
      {/* Hebrew + Arabic sign */}
      <rect x="150" y="200" width="100" height="24" rx="4" fill="#1A1F5E" />
      <text x="160" y="210" fontSize="7" fill="#FFD700">سوق / שוק</text>
      <text x="160" y="220" fontSize="6" fill="white">مفتوح 8:00–20:00</text>
    </svg>
  );
}

function GardenScene({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" fill="none">
      {/* Sky */}
      <rect width="400" height="200" fill="#87CEEB" />
      {/* Ground */}
      <rect x="0" y="195" width="400" height="105" fill="#5D8A3C" />
      {/* Sun */}
      <circle cx="340" cy="45" r="30" fill="#FFD700" />
      {/* Sun rays */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = i * 45 * Math.PI / 180;
        return <line key={i} x1={340 + Math.cos(angle) * 32} y1={45 + Math.sin(angle) * 32} x2={340 + Math.cos(angle) * 44} y2={45 + Math.sin(angle) * 44} stroke="#FFD700" strokeWidth="3" />;
      })}
      {/* Smiley sun */}
      <circle cx="332" cy="42" r="3" fill="#E6B800" />
      <circle cx="348" cy="42" r="3" fill="#E6B800" />
      <path d="M333,51 Q340,56 347,51" stroke="#E6B800" strokeWidth="2" fill="none" />
      {/* Trees */}
      <rect x="55" y="140" width="14" height="65" rx="4" fill="#5D4037" />
      <circle cx="62" cy="130" r="38" fill="#2E7D32" />
      <circle cx="45" cy="140" r="22" fill="#388E3C" />
      <circle cx="80" cy="138" r="24" fill="#1B5E20" />
      <rect x="295" y="150" width="14" height="55" rx="4" fill="#5D4037" />
      <circle cx="302" cy="140" r="36" fill="#2E7D32" />
      {/* Flowers */}
      {[100, 150, 200, 250, 320, 350].map((x, i) => (
        <g key={i} transform={`translate(${x}, 205)`}>
          <rect x="-2" y="-20" width="4" height="22" rx="2" fill="#4CAF50" />
          <circle cx="0" cy="-22" r="8" fill={['#FF5722', '#E91E63', '#FFC107', '#9C27B0', '#FF5722', '#E91E63'][i]} />
          <circle cx="0" cy="-22" r="4" fill="#FFD700" />
        </g>
      ))}
      {/* Wooden bench */}
      <rect x="160" y="215" width="80" height="8" rx="3" fill="#795548" />
      <rect x="168" y="223" width="8" height="16" rx="2" fill="#795548" />
      <rect x="224" y="223" width="8" height="16" rx="2" fill="#795548" />
      <rect x="158" y="200" width="84" height="8" rx="3" fill="#8D6E63" />
      {/* Small birds */}
      <path d="M120,80 Q125,75 130,80" stroke="#555" strokeWidth="1.5" fill="none" />
      <path d="M135,70 Q140,65 145,70" stroke="#555" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ClassroomScene({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" fill="none">
      {/* Wall */}
      <rect width="400" height="300" fill="#FFF8F0" />
      {/* Floor */}
      <rect x="0" y="240" width="400" height="60" fill="#D2B48C" />
      {/* Blackboard */}
      <rect x="40" y="40" width="220" height="120" rx="4" fill="#1B5E20" />
      <rect x="44" y="44" width="212" height="112" rx="2" fill="#2E7D32" />
      {/* Board content */}
      <text x="60" y="75" fontSize="14" fill="white" fontWeight="bold" fontFamily="serif">أَهْلاً وَسَهْلاً</text>
      <text x="80" y="100" fontSize="11" fill="#90EE90">שלום לכולם!</text>
      <line x1="55" y1="115" x2="240" y2="115" stroke="#90EE90" strokeWidth="1" opacity="0.5" />
      <text x="70" y="130" fontSize="10" fill="#FFD700">✓ واجب: صفحة ١٥</text>
      {/* Chalk tray */}
      <rect x="40" y="158" width="220" height="8" rx="2" fill="#795548" />
      <rect x="50" y="159" width="15" height="4" rx="1" fill="white" />
      <rect x="70" y="159" width="15" height="4" rx="1" fill="#FFD700" />
      {/* Map on wall */}
      <rect x="275" y="40" width="100" height="80" rx="3" fill="#E8E0D0" stroke="#8B4513" strokeWidth="2" />
      <ellipse cx="325" cy="80" rx="30" ry="22" fill="#87CEEB" />
      <path d="M305,72 Q315,60 325,68 Q335,58 345,70 Q335,82 325,90 Q315,82 305,72 Z" fill="#4CAF50" />
      {/* Bookshelf */}
      <rect x="0" y="130" width="30" height="110" rx="2" fill="#8B4513" />
      {['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'].map((c, i) => (
        <rect key={i} x="3" y={133 + i * 17} width="24" height="15" rx="1" fill={c} />
      ))}
      {/* Student desks */}
      {[[90, 200], [180, 200], [270, 200], [90, 255], [180, 255], [270, 255]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 25} y={y - 8} width="50" height="30" rx="3" fill="#D2B48C" />
          <rect x={x - 18} y={y + 22} width="8" height="20" rx="2" fill="#8B4513" />
          <rect x={x + 10} y={y + 22} width="8" height="20" rx="2" fill="#8B4513" />
        </g>
      ))}
      {/* Teacher desk */}
      <rect x="280" y="170" width="100" height="45" rx="4" fill="#A0522D" />
      <rect x="285" y="175" width="40" height="25" rx="2" fill="white" />
      <rect x="330" y="178" width="20" height="10" rx="1" fill="#F44336" />
    </svg>
  );
}

const SCENE_MAP: Record<SceneName, React.FC<{ w: number; h: number }>> = {
  school:    SchoolScene,
  home:      HomeScene,
  market:    MarketScene,
  garden:    GardenScene,
  classroom: ClassroomScene,
};

export default function Scene({ scene, width = 400, height = 300, className }: SceneProps) {
  const Component = SCENE_MAP[scene];
  return (
    <div className={className} style={{ width, height, overflow: 'hidden', borderRadius: 16 }}>
      <Component w={width} h={height} />
    </div>
  );
}
