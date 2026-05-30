const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿ]/;
const HEBREW_RANGE = /[א-תװ-״יִ-פֿ]/;
const LATIN_RANGE = /[a-zA-Z]/;
const MIN_LANGUAGE_RATIO = 0.3;

export type SubjectLanguage = 'עברית' | 'عربي' | 'English' | 'رياضيات';

export interface PurityResult {
  valid: boolean;
  reason?: string;
  detectedLanguage?: 'arabic' | 'hebrew' | 'latin' | 'numeric' | 'mixed';
}

function detectPrimaryLanguage(text: string): 'arabic' | 'hebrew' | 'latin' | 'numeric' | 'mixed' {
  const clean = text.replace(/[\s\d\p{P}]/gu, '');
  if (clean.length === 0) return 'numeric';

  const arabicCount = (clean.match(new RegExp(ARABIC_RANGE.source, 'g')) ?? []).length;
  const hebrewCount = (clean.match(new RegExp(HEBREW_RANGE.source, 'g')) ?? []).length;
  const latinCount  = (clean.match(new RegExp(LATIN_RANGE.source, 'g'))  ?? []).length;
  const total = arabicCount + hebrewCount + latinCount;

  if (total === 0) return 'numeric';

  const ar = arabicCount / total;
  const he = hebrewCount / total;
  const la = latinCount  / total;

  if (ar >= MIN_LANGUAGE_RATIO && he < 0.1 && la < 0.1) return 'arabic';
  if (he >= MIN_LANGUAGE_RATIO && ar < 0.1 && la < 0.1) return 'hebrew';
  if (la >= MIN_LANGUAGE_RATIO && ar < 0.1 && he < 0.1) return 'latin';
  return 'mixed';
}

export function validateLanguagePurity(
  content: Record<string, unknown>,
  subject: SubjectLanguage,
): PurityResult {
  const texts: string[] = [];

  function extractText(obj: unknown): void {
    if (typeof obj === 'string' && obj.length > 2) texts.push(obj);
    else if (Array.isArray(obj)) obj.forEach(extractText);
    else if (obj && typeof obj === 'object') Object.values(obj as Record<string, unknown>).forEach(extractText);
  }
  extractText(content);

  if (texts.length === 0) return { valid: true };

  const combined = texts.join(' ');
  const detected = detectPrimaryLanguage(combined);

  if (subject === 'رياضيات') {
    if (detected === 'arabic' || detected === 'numeric') return { valid: true, detectedLanguage: detected };
    return { valid: false, reason: `Math questions must be in Arabic. Detected: ${detected}`, detectedLanguage: detected };
  }

  if (subject === 'عربي') {
    if (detected === 'arabic' || detected === 'numeric') return { valid: true, detectedLanguage: detected };
    return { valid: false, reason: `Arabic subject must use Arabic text. Detected: ${detected}`, detectedLanguage: detected };
  }

  if (subject === 'עברית') {
    if (detected === 'hebrew' || detected === 'numeric') return { valid: true, detectedLanguage: detected };
    return { valid: false, reason: `Hebrew subject must use Hebrew text. Detected: ${detected}`, detectedLanguage: detected };
  }

  if (subject === 'English') {
    if (detected === 'latin' || detected === 'numeric') return { valid: true, detectedLanguage: detected };
    return { valid: false, reason: `English subject must use Latin text. Detected: ${detected}`, detectedLanguage: detected };
  }

  return { valid: true };
}

export const TRANSLATION_TYPES = [
  'TRANSLATE', 'TRANSLATE_REVERSE', 'COMPLETE_TRANSLATION',
  'TAP_PAIRS', 'PAIR_MATCH', 'FLASHCARD', 'FLASHCARD_EX',
];

export function shouldSkipPurityCheck(questionType: string): boolean {
  return TRANSLATION_TYPES.includes(questionType);
}
