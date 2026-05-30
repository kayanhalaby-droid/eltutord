export type AvatarSlot = 'hat' | 'color' | 'accessory' | 'background';

export interface AvatarItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slot: AvatarSlot;
  emoji: string;
  cost: number;
  isDefault?: boolean;
}

export const AVATAR_CATALOG: AvatarItem[] = [
  // ── Hats ─────────────────────────────────────────
  { id: 'hat-graduation', nameAr: 'قبعة التخرج',   nameEn: 'Graduation Cap',   slot: 'hat',        emoji: '🎓', cost: 80  },
  { id: 'hat-crown',      nameAr: 'تاج ملكي',       nameEn: 'Crown',            slot: 'hat',        emoji: '👑', cost: 150 },
  { id: 'hat-cowboy',     nameAr: 'قبعة كاوبوي',    nameEn: 'Cowboy Hat',       slot: 'hat',        emoji: '🤠', cost: 60  },
  { id: 'hat-wizard',     nameAr: 'قبعة ساحر',      nameEn: 'Wizard Hat',       slot: 'hat',        emoji: '🧙', cost: 120 },
  // ── Accessories ───────────────────────────────────
  { id: 'acc-glasses',    nameAr: 'نظارات',          nameEn: 'Glasses',          slot: 'accessory',  emoji: '🕶️', cost: 50  },
  { id: 'acc-bow',        nameAr: 'ربطة عنق',        nameEn: 'Bow Tie',          slot: 'accessory',  emoji: '🎀', cost: 40  },
  { id: 'acc-star',       nameAr: 'نجمة ذهبية',      nameEn: 'Gold Star',        slot: 'accessory',  emoji: '⭐', cost: 30  },
  { id: 'acc-mic',        nameAr: 'ميكروفون',        nameEn: 'Microphone',       slot: 'accessory',  emoji: '🎤', cost: 70  },
  // ── Colors ────────────────────────────────────────
  { id: 'color-gold',     nameAr: 'لون ذهبي',        nameEn: 'Gold',             slot: 'color',      emoji: '🟡', cost: 100 },
  { id: 'color-purple',   nameAr: 'لون بنفسجي',      nameEn: 'Purple',           slot: 'color',      emoji: '🟣', cost: 90  },
  { id: 'color-green',    nameAr: 'لون أخضر',        nameEn: 'Green',            slot: 'color',      emoji: '🟢', cost: 60  },
  // ── Backgrounds ───────────────────────────────────
  { id: 'bg-stars',       nameAr: 'خلفية النجوم',    nameEn: 'Starry Night',     slot: 'background', emoji: '🌌', cost: 200 },
  { id: 'bg-rainbow',     nameAr: 'خلفية قوس قزح',   nameEn: 'Rainbow',          slot: 'background', emoji: '🌈', cost: 150 },
  { id: 'bg-desert',      nameAr: 'خلفية صحراوية',   nameEn: 'Desert',           slot: 'background', emoji: '🏜️', cost: 80  },
];
