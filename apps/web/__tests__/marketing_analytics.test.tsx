/**
 * Phase 5: Marketing & Analytics TDD Tests — RED → GREEN
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, initial, exit, transition, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ── TEST 1: UTM reader utility ────────────────────────────────────────────────

describe('TEST 1 — getUtmData() reads from sessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns null when no UTM data in sessionStorage', () => {
    const { getUtmData } = require('@/lib/utm');
    expect(getUtmData()).toBeNull();
  });

  it('returns parsed UTM object when present in sessionStorage', () => {
    const { getUtmData } = require('@/lib/utm');
    sessionStorage.setItem('utm', JSON.stringify({ utm_source: 'facebook', utm_medium: 'cpc', utm_campaign: 'summer' }));
    const utm = getUtmData();
    expect(utm).not.toBeNull();
    expect(utm?.utm_source).toBe('facebook');
    expect(utm?.utm_campaign).toBe('summer');
  });
});

// ── TEST 2: AdBanner component ────────────────────────────────────────────────

describe('TEST 2 — AdBanner renders for free-plan users', () => {
  it('renders ad banner when plan is "BASIC"', () => {
    const { AdBanner } = require('@/components/marketing/AdBanner');
    const { container } = render(<AdBanner plan="BASIC" />);
    expect(container.querySelector('[data-testid="ad-banner"]')).not.toBeNull();
  });

  it('renders nothing for ELITE/VIP users', () => {
    const { AdBanner } = require('@/components/marketing/AdBanner');
    const { container } = render(<AdBanner plan="ELITE" />);
    expect(container.querySelector('[data-testid="ad-banner"]')).toBeNull();
  });
});

// ── TEST 3: Privacy & Terms links exist ──────────────────────────────────────

describe('TEST 3 — Footer links to privacy and terms', () => {
  it('privacy page module exports a default React component', () => {
    const PrivacyPage = require('@/app/(marketing)/privacy/page').default;
    expect(typeof PrivacyPage).toBe('function');
  });

  it('terms page module exports a default React component', () => {
    const TermsPage = require('@/app/(marketing)/terms/page').default;
    expect(typeof TermsPage).toBe('function');
  });
});

// ── TEST 4: UTM payload included in register body ─────────────────────────────

describe('TEST 4 — buildRegisterPayload includes UTM when available', () => {
  beforeEach(() => sessionStorage.clear());

  it('returns payload without utm when sessionStorage is empty', () => {
    const { buildRegisterPayload } = require('@/lib/utm');
    const payload = buildRegisterPayload({ firstName: 'أحمد', phone: '0501234567' });
    expect(payload).not.toHaveProperty('utm_source');
  });

  it('merges utm fields into register payload when present', () => {
    sessionStorage.setItem('utm', JSON.stringify({ utm_source: 'google', utm_medium: 'organic', utm_campaign: null }));
    const { buildRegisterPayload } = require('@/lib/utm');
    const payload = buildRegisterPayload({ firstName: 'أحمد', phone: '0501234567' });
    expect(payload).toHaveProperty('utm_source', 'google');
  });
});

// ── TEST 5: Security — no sensitive keys in client bundle ────────────────────

describe('TEST 5 — No server-only secrets in client env', () => {
  it('NEXT_PUBLIC vars should not contain DATABASE_URL', () => {
    const publicKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
    const hasDatabaseUrl = publicKeys.some(k => process.env[k]?.toLowerCase().includes('postgresql'));
    expect(hasDatabaseUrl).toBe(false);
  });

  it('NEXT_PUBLIC vars should not contain JWT_SECRET', () => {
    const publicKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
    const hasJwtSecret = publicKeys.some(k => (process.env[k] ?? '').length > 40 && !/^http/.test(process.env[k] ?? ''));
    expect(hasJwtSecret).toBe(false);
  });
});
