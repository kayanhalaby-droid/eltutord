/**
 * Phase 4: Parent Portal, PDF, Legal TDD Tests — RED → GREEN
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => {
  const strip = ({ animate, initial, exit, transition, whileHover, whileTap, variants, layout, layoutId, ...rest }: any) => rest;
  return {
    motion: {
      div: ({ children, ...p }: any) => <div {...strip(p)}>{children}</div>,
      button: ({ children, ...p }: any) => <button {...strip(p)}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/privacy',
}));

// ── TEST 1: Privacy policy page exports ──────────────────────────────────────

describe('TEST 1 — Privacy page renders COPPA-compliant content', () => {
  it('renders page with required COPPA sections', () => {
    const PrivacyPage = require('@/app/(marketing)/privacy/page').default;
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/خصوصية|بيانات|COPPA|أطفال|معلومات/i);
  });

  it('has a contact/parent section', () => {
    const PrivacyPage = require('@/app/(marketing)/privacy/page').default;
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).toMatch(/تواصل|الوالدين|اتصل/i);
  });
});

// ── TEST 2: Terms of service page ────────────────────────────────────────────

describe('TEST 2 — Terms page renders required sections', () => {
  it('renders terms of service with usage section', () => {
    const TermsPage = require('@/app/(marketing)/terms/page').default;
    const { container } = render(<TermsPage />);
    expect(container.textContent).toMatch(/شروط|استخدام|الخدمة/i);
  });

  it('has subscription/payment section', () => {
    const TermsPage = require('@/app/(marketing)/terms/page').default;
    const { container } = render(<TermsPage />);
    expect(container.textContent).toMatch(/اشتراك|دفع|رسوم|مدفوع/i);
  });
});

// ── TEST 3: PrintReport component ────────────────────────────────────────────

describe('TEST 3 — PrintReport component', () => {
  it('renders print button', () => {
    const { PrintReport } = require('@/components/reports/PrintReport');
    const data = { studentName: 'أحمد', accuracy: 87, lessonsCompleted: 12, xpEarned: 450, period: 'أسبوع' };
    const { container } = render(<PrintReport data={data} />);
    expect(container.querySelector('[data-testid="print-btn"]')).not.toBeNull();
  });

  it('renders student name in printable area', () => {
    const { PrintReport } = require('@/components/reports/PrintReport');
    const data = { studentName: 'ليلى', accuracy: 95, lessonsCompleted: 20, xpEarned: 800, period: 'شهر' };
    const { container } = render(<PrintReport data={data} />);
    expect(container.textContent).toContain('ليلى');
  });
});

// ── TEST 4: Certificate component ────────────────────────────────────────────

describe('TEST 4 — Certificate of Excellence', () => {
  it('renders with student name', () => {
    const { Certificate } = require('@/components/reports/Certificate');
    const { container } = render(
      <Certificate studentName="محمد" achievement="إتمام وحدة الرياضيات" date="2026-05-30" />
    );
    expect(container.textContent).toContain('محمد');
    expect(container.textContent).toContain('الرياضيات');
  });

  it('has a print/download button', () => {
    const { Certificate } = require('@/components/reports/Certificate');
    const { container } = render(
      <Certificate studentName="سارة" achievement="إتمام مستوى 5" date="2026-05-30" />
    );
    expect(container.querySelector('[data-testid="print-cert-btn"]')).not.toBeNull();
  });
});

// ── TEST 5: FocusMode toggle ──────────────────────────────────────────────────

describe('TEST 5 — FocusMode toggle', () => {
  it('renders focus mode button', () => {
    const { FocusModeToggle } = require('@/components/lesson/FocusModeToggle');
    const { container } = render(<FocusModeToggle isActive={false} onToggle={jest.fn()} />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('calls onToggle when clicked', () => {
    const { FocusModeToggle } = require('@/components/lesson/FocusModeToggle');
    const onToggle = jest.fn();
    const { container } = render(<FocusModeToggle isActive={false} onToggle={onToggle} />);
    fireEvent.click(container.querySelector('button')!);
    expect(onToggle).toHaveBeenCalled();
  });
});
