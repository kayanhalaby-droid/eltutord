/**
 * Phase 3 TDD tests — onboarding.test.tsx
 * These tests are written BEFORE the implementation.
 * They FAIL initially (red) and PASS after the new onboarding page is built.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Module mocks ───────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('@/store/auth', () => ({
  useAuthStore: () => ({ setAuth: jest.fn(), token: null, user: null }),
}));

jest.mock('@/hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({ playSound: jest.fn() }),
}));

jest.mock('@/components/NoorOwl', () => ({
  __esModule: true,
  default: ({ expression }: { expression?: string }) => (
    <div data-testid="noor-owl" data-expression={expression} />
  ),
}));

jest.mock('@/components/effects/Confetti', () => ({
  __esModule: true,
  default: () => <div data-testid="confetti" />,
}));

jest.mock('@/components/effects/XPCounter', () => ({
  __esModule: true,
  default: ({ amount }: { amount: number }) => <div data-testid="xp-counter">{amount}</div>,
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  const motion = new Proxy({} as Record<string, React.FC<Record<string, unknown>>>, {
    get: (_: unknown, tag: string) => {
      const C = ({ children, ...rest }: { children?: React.ReactNode; [key: string]: unknown }) =>
        React.createElement(tag, rest, children);
      C.displayName = `motion.${tag}`;
      return C;
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@/app/(student)/lesson/[lessonId]/components/QuestionTypes/MCQ', () => ({
  __esModule: true,
  default: ({ content, onAnswer, disabled }: {
    content: { questionText: string; options: Array<{ id: string; text: string }> };
    onAnswer: (ids: string[]) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="mcq">
      <p>{content.questionText}</p>
      {content.options.map((opt: { id: string; text: string }) => (
        <button key={opt.id} onClick={() => { if (!disabled) onAnswer([opt.id]); }} disabled={disabled}>
          {opt.text}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/app/(student)/lesson/[lessonId]/components/QuestionTypes/TrueFalse', () => ({
  __esModule: true,
  default: ({ onAnswer, disabled }: { onAnswer: (val: boolean) => void; disabled?: boolean }) => (
    <div data-testid="truefalse">
      <button onClick={() => { if (!disabled) onAnswer(true); }} disabled={disabled}>✓ صحيح</button>
      <button onClick={() => { if (!disabled) onAnswer(false); }} disabled={disabled}>✗ خطأ</button>
    </div>
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

import { apiFetch } from '@/lib/api';
const mockApiFetch = apiFetch as jest.Mock;

const MOCK_QUESTIONS = Array.from({ length: 7 }, (_, i) => ({
  id: `q-${i}`,
  type: 'MULTIPLE_CHOICE',
  content: { questionText: `سؤال ${i + 1}؟`, options: [{ id: 'a', text: 'خيار ١' }, { id: 'b', text: 'خيار ٢' }] },
  correctAnswer: { selectedOptionIds: ['a'] },
  difficulty: 1,
  order: i + 1,
}));

const HEBREW_QUESTIONS = Array.from({ length: 7 }, (_, i) => ({
  id: `hq-${i}`,
  type: 'MULTIPLE_CHOICE',
  content: { questionText: `שאלה ${i + 1}`, options: [{ id: 'a', text: 'כן' }, { id: 'b', text: 'לא' }] },
  correctAnswer: { selectedOptionIds: ['a'] },
  difficulty: 1,
  order: i + 1,
}));

async function advanceToStep(step: string, subject = 'عربي', grade = '3') {
  // Always: click age
  const ageBtn = await screen.findByText('8-9');
  fireEvent.click(ageBtn);

  if (step === 'age') return;

  // Subject step
  const subjectBtn = await screen.findByText(subject);
  fireEvent.click(subjectBtn);

  if (step === 'subject') return;

  // Grade step
  const gradeBtn = await screen.findByText(`الصف ${grade}`);
  fireEvent.click(gradeBtn);

  if (step === 'grade') return;

  // Motivation step
  const motivationBtn = await screen.findByText(/أنجح في المدرسة|אני רוצה|I want|أريد أن أكون متفوقاً/);
  fireEvent.click(motivationBtn);

  if (step === 'motivation') return;

  // Goal step
  const goalBtn = await screen.findByText(/١٥ دقيقة|15 min/);
  fireEvent.click(goalBtn);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

import OnboardingPage from '@/app/onboarding/page';

describe('OnboardingPage — Phase 3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
    mockApiFetch.mockResolvedValue(MOCK_QUESTIONS);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Splash screen
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 1: renders splash with NoorOwl expression="excited"', async () => {
    render(<OnboardingPage />);

    const owl = screen.getByTestId('noor-owl');
    expect(owl).toHaveAttribute('data-expression', 'excited');
    expect(screen.getByText('الموجه الذكي')).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Age selection
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 2: age selection step shows all 6 age group buttons', async () => {
    render(<OnboardingPage />);

    // Advance past splash (1500ms)
    act(() => { jest.advanceTimersByTime(1600); });

    const ageGroups = ['6-7', '8-9', '10-11', '12-13', '14-15', '16+'];
    for (const age of ageGroups) {
      expect(await screen.findByText(age)).toBeInTheDocument();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Grade selection step (NEW step — not in old page)
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 3: grade selection step appears after subject click, shows 12 grade buttons', async () => {
    render(<OnboardingPage />);
    act(() => { jest.advanceTimersByTime(1600); });

    const ageBtn = await screen.findByText('8-9');
    fireEvent.click(ageBtn);

    const subjectBtn = await screen.findByText('عربي');
    fireEvent.click(subjectBtn);

    // Grade step must have 12 grade buttons
    for (let i = 1; i <= 12; i++) {
      expect(await screen.findByText(`الصف ${i}`)).toBeInTheDocument();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: Trial fetches from API (not hardcoded)
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 4: trial_lesson step fetches questions from API with correct params', async () => {
    mockApiFetch.mockResolvedValue(MOCK_QUESTIONS);

    render(<OnboardingPage />);
    act(() => { jest.advanceTimersByTime(1600); });

    await advanceToStep('goal', 'عربي', '3');

    // After goal click, trial_lesson step loads and calls apiFetch
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/curriculum/onboarding-questions'),
        expect.anything(),
      );
    });

    // Verify query params contain subject and grade
    const call = mockApiFetch.mock.calls.find((c: unknown[]) =>
      typeof c[0] === 'string' && c[0].includes('/curriculum/onboarding-questions'),
    );
    expect(call?.[0]).toContain('subject=');
    expect(call?.[0]).toContain('grade=');

    // First question text from mock is shown (not hardcoded Arabic trial)
    expect(await screen.findByText('سؤال 1؟')).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 5: Hebrew subject shows Hebrew feedback
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 5: correct answer with Hebrew subject shows Hebrew feedback "מצוין"', async () => {
    mockApiFetch.mockResolvedValue(HEBREW_QUESTIONS);

    render(<OnboardingPage />);
    act(() => { jest.advanceTimersByTime(1600); });

    await advanceToStep('goal', 'עברית', '5');

    // Wait for Hebrew question to appear
    await screen.findByText('שאלה 1');

    // Click correct answer (option 'a' = 'כן')
    const correctOption = await screen.findByText('כן');
    fireEvent.click(correctOption);

    // Hebrew feedback must appear
    expect(await screen.findByText(/מצוין/)).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 6: Registration form submits to new endpoint
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 6: register form submits to POST /auth/register-with-onboarding', async () => {
    mockApiFetch
      .mockResolvedValueOnce(MOCK_QUESTIONS) // trial_lesson
      .mockResolvedValueOnce(MOCK_QUESTIONS) // placement_test
      .mockResolvedValueOnce({ access_token: 'tok', refresh_token: 'rt', user: { id: 'u1', firstName: 'أحمد', role: 'STUDENT', gradeLevel: 3 } }); // register

    render(<OnboardingPage />);
    act(() => { jest.advanceTimersByTime(1600); });

    // Navigate to register step directly by setting step
    // We find the "سجّل واحفظ تقدمك" button in celebrate step
    // For this test, let's click through to the register step by using celebrate
    // Advance to celebrate via a simpler path — look for register step
    // Actually let's navigate through celebration to register
    await advanceToStep('goal', 'عربي', '3');

    // Wait for trial to complete (skip all 7 questions by clicking through)
    for (let i = 0; i < 7; i++) {
      const option = await screen.findByText('خيار ١');
      fireEvent.click(option);
      // Wait for next question to load or for placement test
      await waitFor(() => new Promise(r => setTimeout(r, 100)));
      act(() => { jest.advanceTimersByTime(1600); });
    }

    // Wait for celebrate or register step
    // Click "سجّل واحفظ تقدمك" to reach register
    const registerBtn = await screen.findByText(/سجّل واحفظ/);
    fireEvent.click(registerBtn);

    // Fill in the registration form
    fireEvent.change(await screen.findByPlaceholderText(/اسم/), { target: { value: 'أحمد' } });
    fireEvent.change(await screen.findByPlaceholderText(/العائلة|الأخير/), { target: { value: 'محمود' } });
    fireEvent.change(await screen.findByPlaceholderText('0501234567'), { target: { value: '0501234567' } });
    fireEvent.change(await screen.findByPlaceholderText(/كلمة المرور/), { target: { value: 'pass123' } });

    const submitBtn = await screen.findByText(/إنشاء الحساب/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const calls = mockApiFetch.mock.calls;
      const registerCall = calls.find((c: unknown[]) =>
        typeof c[0] === 'string' && c[0].includes('/auth/register-with-onboarding'),
      );
      expect(registerCall).toBeDefined();

      const body = JSON.parse(registerCall?.[1]?.body ?? '{}');
      expect(body).toHaveProperty('firstName');
      expect(body).toHaveProperty('lastName');
      expect(body).toHaveProperty('phone');
      expect(body).toHaveProperty('password');
      expect(body).toHaveProperty('gradeLevel');
      expect(body).toHaveProperty('subject');
      expect(body).toHaveProperty('trialScore');
      expect(body).toHaveProperty('placementLevel');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 7: Guest mode saves to correct localStorage keys
  // ═══════════════════════════════════════════════════════════════════════════
  it('TEST 7: guest mode saves to elitutor-onboarding and elitutor-guest keys', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    render(<OnboardingPage />);
    act(() => { jest.advanceTimersByTime(1600); });

    await advanceToStep('goal', 'عربي', '3');

    // Flush pending microtasks so apiFetch mock resolves and questions load
    await act(async () => {});

    // Skip trial questions
    for (let i = 0; i < 7; i++) {
      try {
        const option = screen.getByText('خيار ١');
        fireEvent.click(option);
        act(() => { jest.advanceTimersByTime(1600); });
      } catch { break; }
    }

    // Flush placement_test fetch and transition to celebrate
    await act(async () => {});

    // Find and click the guest mode button in celebrate
    const guestBtn = await screen.findByText(/متابعة كضيف|كضيف/);
    fireEvent.click(guestBtn);

    expect(setItemSpy).toHaveBeenCalledWith('elitutor-onboarding', expect.any(String));
    expect(setItemSpy).toHaveBeenCalledWith('elitutor-guest', 'true');
  });
});
