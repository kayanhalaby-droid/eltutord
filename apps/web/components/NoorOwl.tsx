// NoorOwl — thin wrapper around the full Noor character
// Keeps existing import paths working while the new Noor.tsx is the source of truth
export type { NoorExpression as NoorOwlExpression } from './characters/Noor';
export type NoorExpression =
  | 'default' | 'happy' | 'excited' | 'sad' | 'angry'
  | 'sleeping' | 'studying' | 'dancing' | 'encouraging'
  | 'celebrating' | 'thinking' | 'proud' | 'love' | 'phd';

export { default } from './characters/Noor';
