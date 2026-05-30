import { CardcomService, PLAN_PRICES } from './cardcom.service';
import { PremiumGuard } from '../auth/guards/premium.guard';
import { ExecutionContext } from '@nestjs/common';

// ── Shared mock factories ──────────────────────────────────────────────────────

function makePrisma(overrides: Record<string, unknown> = {}) {
  return {
    subscription: {
      upsert: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    ...overrides,
  };
}

function makeNotifications() {
  return { send: jest.fn().mockResolvedValue(undefined) };
}

function makeConfig() {
  return { get: jest.fn().mockReturnValue('') };
}

// ── TEST 1: Webhook activates subscription on ResponseCode=0 ──────────────────

describe('TEST 1 — Webhook activates subscription on ResponseCode=0', () => {
  it('calls prisma.subscription.upsert with ACTIVE status', async () => {
    const prisma = makePrisma();
    const service = new CardcomService(makeConfig() as any, prisma as any, makeNotifications() as any);

    await service.handleWebhook({
      ResponseCode: '0',
      ReturnValue: 'user-abc|basic|monthly',
      TranzactionId: 'tx-123',
    });

    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-abc' },
        create: expect.objectContaining({ status: 'ACTIVE', plan: 'BASIC', billingCycle: 'MONTHLY' }),
        update: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });
});

// ── TEST 2: Webhook ignores failed payments ────────────────────────────────────

describe('TEST 2 — Webhook ignores failed payments (ResponseCode != 0)', () => {
  it('does NOT call upsert when ResponseCode is not 0', async () => {
    const prisma = makePrisma();
    const service = new CardcomService(makeConfig() as any, prisma as any, makeNotifications() as any);

    await service.handleWebhook({
      ResponseCode: '1',
      ReturnValue: 'user-abc|basic|monthly',
    });

    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
  });
});

// ── TEST 3: PremiumGuard blocks non-subscribers ───────────────────────────────

describe('TEST 3 — PremiumGuard blocks non-subscribers', () => {
  it('throws ForbiddenException when no active subscription', async () => {
    const prisma = makePrisma({
      subscription: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    });

    const guard = new PremiumGuard(prisma as any);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'user-no-sub' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });
});

// ── TEST 4: PremiumGuard allows active subscribers ────────────────────────────

describe('TEST 4 — PremiumGuard allows active subscribers', () => {
  it('returns true when subscription status is ACTIVE', async () => {
    const prisma = makePrisma({
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 86400000),
        }),
      },
    });

    const guard = new PremiumGuard(prisma as any);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'user-with-sub' } }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });
});

// ── TEST 5: Subscription expiry cron downgrades expired subscriptions ─────────

describe('TEST 5 — Subscription expiry check downgrades expired', () => {
  it('calls updateMany with EXPIRED status for past-expiry subscriptions', async () => {
    const prisma = makePrisma();
    const service = new CardcomService(makeConfig() as any, prisma as any, makeNotifications() as any);

    await service.checkAndDowngradeExpiredSubscriptions();

    expect(prisma.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          expiresAt: expect.objectContaining({ lt: expect.any(Date) }),
        }),
        data: { status: 'EXPIRED' },
      }),
    );
  });
});
