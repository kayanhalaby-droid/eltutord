/**
 * Phase 2: Mascot & Rewards TDD Tests — RED → GREEN
 */
import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => {
  const strip = ({ animate, initial, exit, transition, whileHover, whileTap, variants, layout, layoutId, onAnimationComplete, ...rest }: any) => rest;
  return {
    motion: {
      div: ({ children, ...p }: any) => <div {...strip(p)}>{children}</div>,
      span: ({ children, ...p }: any) => <span {...strip(p)}>{children}</span>,
      button: ({ children, ...p }: any) => <button {...strip(p)}>{children}</button>,
      text: ({ children, ...p }: any) => <text {...strip(p)}>{children}</text>,
      circle: ({ children, ...p }: any) => <circle {...strip(p)}>{children}</circle>,
      ellipse: ({ children, ...p }: any) => <ellipse {...strip(p)}>{children}</ellipse>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useAnimation: () => ({ start: jest.fn() }),
  };
});

jest.mock('@/components/NoorOwl', () => ({
  __esModule: true,
  default: ({ message, expression }: any) => (
    <div data-testid="noor-owl" data-expression={expression}>{message ?? ''}</div>
  ),
}));

// ── TEST 1: Fireworks component ───────────────────────────────────────────────

describe('TEST 1 — Fireworks component', () => {
  it('renders overlay when active=true', () => {
    const { Fireworks } = require('@/components/effects/Fireworks');
    const { container } = render(<Fireworks active={true} />);
    expect(container.querySelector('[data-testid="fireworks"]')).not.toBeNull();
  });

  it('renders nothing when active=false', () => {
    const { Fireworks } = require('@/components/effects/Fireworks');
    const { container } = render(<Fireworks active={false} />);
    expect(container.querySelector('[data-testid="fireworks"]')).toBeNull();
  });
});

// ── TEST 2: StarFall component ────────────────────────────────────────────────

describe('TEST 2 — StarFall component', () => {
  it('renders star container when active=true', () => {
    const { StarFall } = require('@/components/effects/StarFall');
    const { container } = render(<StarFall active={true} />);
    expect(container.querySelector('[data-testid="starfall"]')).not.toBeNull();
  });

  it('renders nothing when active=false', () => {
    const { StarFall } = require('@/components/effects/StarFall');
    const { container } = render(<StarFall active={false} />);
    expect(container.querySelector('[data-testid="starfall"]')).toBeNull();
  });
});

// ── TEST 3: Noor tap/hover interaction ───────────────────────────────────────

describe('TEST 3 — Noor tap interaction', () => {
  it('calls onTap when the owl is clicked', () => {
    const Noor = require('@/components/characters/Noor').default;
    const onTap = jest.fn();
    const { container } = render(<Noor expression="default" size={80} onTap={onTap} />);
    const el = container.querySelector('[data-testid="noor-body"]')!;
    fireEvent.click(el);
    expect(onTap).toHaveBeenCalled();
  });

  it('renders celebrating particles when expression is celebrating', () => {
    const Noor = require('@/components/characters/Noor').default;
    const { container } = render(<Noor expression="celebrating" size={80} />);
    expect(container.textContent).toMatch(/🎊|🎉|⭐|✨/);
  });
});

// ── TEST 4: FeedbackPanel shows correct/wrong icons ───────────────────────────

describe('TEST 4 — FeedbackPanel shows correct/wrong icons', () => {
  it('shows ✓ and success styling for correct answer', () => {
    const { FeedbackPanel } = require('@/components/lesson/FeedbackPanel');
    const { container } = render(
      <FeedbackPanel isCorrect={true} correctAnswerText="" onNext={jest.fn()} />
    );
    expect(container.textContent).toMatch(/✓|✅|ممتاز/);
  });

  it('shows ✗ and error styling for wrong answer', () => {
    const { FeedbackPanel } = require('@/components/lesson/FeedbackPanel');
    const { container } = render(
      <FeedbackPanel isCorrect={false} correctAnswerText="الجواب الصح" onNext={jest.fn()} />
    );
    expect(container.textContent).toMatch(/✗|❌|تقريباً/);
  });

  it('shows correct answer text when wrong', () => {
    const { FeedbackPanel } = require('@/components/lesson/FeedbackPanel');
    const { container } = render(
      <FeedbackPanel isCorrect={false} correctAnswerText="كلب" onNext={jest.fn()} />
    );
    expect(container.textContent).toContain('كلب');
  });
});

// ── TEST 5: useRewardEffect hook ──────────────────────────────────────────────

describe('TEST 5 — useRewardEffect hook', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('exports triggerFireworks, triggerStarFall, and boolean active flags', () => {
    const { useRewardEffect } = require('@/lib/hooks/useRewardEffect');
    const { result } = renderHook(() => useRewardEffect());
    expect(typeof result.current.triggerFireworks).toBe('function');
    expect(typeof result.current.triggerStarFall).toBe('function');
    expect(typeof result.current.fireworksActive).toBe('boolean');
    expect(typeof result.current.starFallActive).toBe('boolean');
  });

  it('sets fireworksActive=true after triggerFireworks()', () => {
    const { useRewardEffect } = require('@/lib/hooks/useRewardEffect');
    const { result } = renderHook(() => useRewardEffect());
    act(() => result.current.triggerFireworks());
    expect(result.current.fireworksActive).toBe(true);
  });

  it('sets starFallActive=true after triggerStarFall()', () => {
    const { useRewardEffect } = require('@/lib/hooks/useRewardEffect');
    const { result } = renderHook(() => useRewardEffect());
    act(() => result.current.triggerStarFall());
    expect(result.current.starFallActive).toBe(true);
  });
});
