'use client';
import { useCallback } from 'react';

export type SoundName = 'correct' | 'wrong' | 'complete' | 'click' | 'levelup' | 'heartlost' | 'celebrate' | 'streak' | 'unlock' | 'coin';

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.28, delay = 0) {
  if (typeof window === 'undefined') return;
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.02);
    setTimeout(() => ctx.close(), (delay + dur + 0.1) * 1000);
  } catch {}
}

const SOUNDS: Record<SoundName, () => void> = {
  correct:   () => { tone(523, 0.1); tone(659, 0.1, 'sine', 0.28, 0.1); tone(784, 0.2, 'sine', 0.28, 0.2); },
  wrong:     () => { tone(330, 0.12, 'square', 0.22); tone(280, 0.25, 'square', 0.18, 0.13); },
  complete:  () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'sine', 0.3, i * 0.12)),
  click:     () => tone(900, 0.05, 'sine', 0.12),
  levelup:   () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.28, i * 0.09)),
  heartlost: () => { tone(220, 0.28, 'sawtooth', 0.22); tone(180, 0.35, 'sawtooth', 0.18, 0.28); },
  celebrate: () => [784, 659, 784, 880, 1047].forEach((f, i) => tone(f, 0.1, 'sine', 0.28, i * 0.09)),
  streak:    () => { tone(880, 0.15); tone(1047, 0.2, 'sine', 0.28, 0.15); },
  unlock:    () => [523, 784, 1047, 1319].forEach((f, i) => tone(f, 0.12, 'sine', 0.28, i * 0.1)),
  coin:      () => { tone(1047, 0.06); tone(1319, 0.08, 'sine', 0.22, 0.07); },
};

export function useSoundEffects() {
  const playSound = useCallback((name: SoundName) => { SOUNDS[name]?.(); }, []);
  return { playSound };
}
