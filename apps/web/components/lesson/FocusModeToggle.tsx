'use client';

interface FocusModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function FocusModeToggle({ isActive, onToggle }: FocusModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={isActive}
      aria-label={isActive ? 'إيقاف وضع التركيز' : 'تفعيل وضع التركيز'}
      title={isActive ? 'إيقاف وضع التركيز' : 'وضع التركيز'}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[44px]
        ${isActive
          ? 'bg-[#1A1F5E] text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      <span className="text-base">{isActive ? '🔇' : '🎯'}</span>
      <span className="hidden sm:inline">{isActive ? 'تركيز' : 'وضع التركيز'}</span>
    </button>
  );
}
