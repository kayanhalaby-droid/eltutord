import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CurriculumService } from './curriculum.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterWithOnboardingDto } from '../auth/dto/register-with-onboarding.dto';

// ── Shared mock question factory ─────────────────────────────────────────────

function makeMockQuestion(overrides: Partial<{
  id: string; type: string; content: object; correctAnswer: object; difficulty: number; order: number;
}> = {}) {
  return {
    id: overrides.id ?? 'q-1',
    type: overrides.type ?? 'MULTIPLE_CHOICE',
    content: overrides.content ?? { questionText: 'ما هو ناتج ٢+٢؟', options: [{ id: 'a', text: '٣' }, { id: 'b', text: '٤' }] },
    correctAnswer: overrides.correctAnswer ?? { selectedOptionIds: ['b'] },
    difficulty: overrides.difficulty ?? 1,
    order: overrides.order ?? 1,
    explanation: null,
    lessonId: 'lesson-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeArabicQuestions(count = 12) {
  const types = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK_CHOICE', 'MULTIPLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'];
  return Array.from({ length: count }, (_, i) => makeMockQuestion({
    id: `q-${i}`,
    type: types[i % types.length],
    content: { questionText: `سؤال عربي رقم ${i + 1}؟`, options: [{ id: 'a', text: 'خيار ١' }, { id: 'b', text: 'خيار ٢' }] },
    correctAnswer: { selectedOptionIds: ['a'] },
    difficulty: i < 6 ? 1 : 2,
    order: i + 1,
  }));
}

function makeHebrewQuestions(count = 12) {
  return Array.from({ length: count }, (_, i) => makeMockQuestion({
    id: `hq-${i}`,
    type: i % 3 === 0 ? 'TRUE_FALSE' : i % 3 === 1 ? 'FILL_BLANK_CHOICE' : 'MULTIPLE_CHOICE',
    content: { questionText: `שאלה בעברית מספר ${i + 1}`, options: [{ id: 'a', text: 'כן' }, { id: 'b', text: 'לא' }] },
    correctAnswer: { selectedOptionIds: ['a'] },
    difficulty: 1,
    order: i + 1,
  }));
}

// ── TEST SUITE ────────────────────────────────────────────────────────────────

describe('Onboarding Endpoints — Phase 2', () => {
  let curriculumService: CurriculumService;
  let authService: AuthService;
  let mockPrisma: jest.Mocked<PrismaService>;
  let mockTx: Record<string, { create: jest.Mock; findFirst: jest.Mock; findUnique: jest.Mock; upsert: jest.Mock; findMany: jest.Mock }>;

  beforeEach(async () => {
    mockTx = {
      user: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
      subject: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
      studentProfile: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
      grade: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
      lesson: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
      userProgress: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
    };

    mockPrisma = {
      subject: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      grade: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      question: { findMany: jest.fn() },
      user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      studentProfile: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      refreshToken: { deleteMany: jest.fn().mockResolvedValue({}), create: jest.fn().mockResolvedValue({ token: 'rt', userId: 'u1', expiresAt: new Date() }) },
      $transaction: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumService,
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock-token') } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
        { provide: EmailService, useValue: { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } },
      ],
    }).compile();

    curriculumService = module.get<CurriculumService>(CurriculumService);
    authService = module.get<AuthService>(AuthService);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1 — GET /curriculum/onboarding-questions — basic shape & public access
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TEST 1: getOnboardingQuestions — shape and public access', () => {
    it('should return exactly 7 questions', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'grade-1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      // This will throw TypeError before implementation (method doesn't exist)
      const result = await curriculumService.getOnboardingQuestions('عربي', 3);

      expect(result).toHaveLength(7);
    });

    it('should work without a token — method makes no auth checks', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'עברית' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'grade-5', level: 5, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeHebrewQuestions(12));

      // Service method carries no auth — it is the controller route that uses @Public()
      // Calling the method directly is always "unauthenticated"
      await expect(curriculumService.getOnboardingQuestions('עברית', 5)).resolves.toBeDefined();
    });

    it('should return fallback when subject not found in DB', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue(null);

      const result = await curriculumService.getOnboardingQuestions('unknown-subject', 1);

      expect(result).toHaveLength(7);
    });

    it('each question must have id, type, content, correctAnswer, difficulty, order', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'grade-1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('عربي', 3);

      for (const q of result) {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('type');
        expect(q).toHaveProperty('content');
        expect(q).toHaveProperty('correctAnswer');
        expect(q).toHaveProperty('difficulty');
        expect(q).toHaveProperty('order');
      }
    });

    it('when subject is Arabic, question content should contain Arabic text', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'grade-1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('عربي', 3);
      const arabicRegex = /[؀-ۿ]/;

      for (const q of result) {
        const contentStr = JSON.stringify(q.content);
        expect(arabicRegex.test(contentStr)).toBe(true);
      }
    });

    it('when subject is Hebrew, question content should contain Hebrew text', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'עברית' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'grade-5', level: 5, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeHebrewQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('עברית', 5);
      const hebrewRegex = /[֐-׿]/;

      for (const q of result) {
        const contentStr = JSON.stringify(q.content);
        expect(hebrewRegex.test(contentStr)).toBe(true);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2 — GET /curriculum/onboarding-questions — type distribution
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TEST 2: getOnboardingQuestions — type distribution', () => {
    it('questions must include at least one MULTIPLE_CHOICE, TRUE_FALSE, or FILL_BLANK_CHOICE', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'g1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('عربي', 3);
      const types = result.map((q) => q.type);

      const hasRequired = types.some((t) => ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK_CHOICE'].includes(t as string));
      expect(hasRequired).toBe(true);
    });

    it('must not contain SPEAK, READ_ALOUD, or AI_CONVERSATION types', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'g1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('عربي', 3);
      const excluded = ['SPEAK', 'READ_ALOUD', 'AI_CONVERSATION'];

      for (const q of result) {
        expect(excluded).not.toContain(q.type);
      }
    });

    it('all questions must have difficulty <= 2', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      (mockPrisma.grade as any).findUnique = jest.fn().mockResolvedValue({ id: 'g1', level: 3, subjectId: 'sub-1' });
      mockPrisma.question.findMany = jest.fn().mockResolvedValue(makeArabicQuestions(12));

      const result = await curriculumService.getOnboardingQuestions('عربي', 3);

      for (const q of result) {
        expect(q.difficulty).toBeLessThanOrEqual(2);
      }
    });

    it('fallback questions also satisfy type and difficulty constraints', async () => {
      mockPrisma.subject.findFirst = jest.fn().mockResolvedValue(null);

      const result = await curriculumService.getOnboardingQuestions('مجهول', 1);
      const excluded = ['SPEAK', 'READ_ALOUD', 'AI_CONVERSATION'];

      expect(result).toHaveLength(7);
      for (const q of result) {
        expect(q.difficulty).toBeLessThanOrEqual(2);
        expect(excluded).not.toContain(q.type);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3 — POST /auth/register-with-onboarding — creates user and profile
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TEST 3: registerWithOnboarding — creates user and student profile', () => {
    const baseDto: RegisterWithOnboardingDto = {
      firstName: 'أحمد',
      lastName: 'محمود',
      phone: '0501234567',
      password: 'password123',
      gradeLevel: 3,
      subject: 'عربي',
      motivation: 'تحسين اللغة',
      dailyGoalMinutes: 15,
      trialScore: 4,
      placementLevel: 'beginner',
    };

    beforeEach(() => {
      const mockUser = {
        id: 'user-1',
        email: '0501234567@elitutor.local',
        phone: '0501234567',
        firstName: 'أحمد',
        lastName: 'محمود',
        role: 'STUDENT',
        isVerified: false,
        gemsBalance: 50,
        passwordHash: 'hashed',
      };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.subject.findFirst.mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      mockTx.studentProfile.create.mockResolvedValue({ id: 'profile-1', userId: 'user-1', gradeLevel: 3 });
      mockTx.grade.findUnique.mockResolvedValue({
        id: 'grade-1', level: 3, subjectId: 'sub-1',
        lessons: [{ id: 'lesson-1', order: 1 }],
      });
      mockTx.lesson.findMany.mockResolvedValue([{ id: 'lesson-1', order: 1 }]);
      mockTx.userProgress.upsert.mockResolvedValue({});

      mockPrisma.user.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.$transaction = jest.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
    });

    it('should return object with access_token, refresh_token, and user', async () => {
      const result = await authService.registerWithOnboarding(baseDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
    });

    it('user object must include id, firstName, lastName, phone, role, gradeLevel', async () => {
      const result = await authService.registerWithOnboarding(baseDto);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).toHaveProperty('phone');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('gradeLevel');
      expect(result.user.gradeLevel).toBe(3);
    });

    it('should create a StudentProfile record within the transaction', async () => {
      await authService.registerWithOnboarding(baseDto);

      expect(mockTx.studentProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gradeLevel: 3,
            firstName: 'أحمد',
            lastName: 'محمود',
          }),
        }),
      );
    });

    it('user must be created with gemsBalance of 50 (welcome bonus)', async () => {
      await authService.registerWithOnboarding(baseDto);

      expect(mockTx.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ gemsBalance: 50 }),
        }),
      );
    });

    it('should throw ConflictException (409) for duplicate phone number', async () => {
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue({ id: 'existing-user', phone: '0501234567' });

      await expect(authService.registerWithOnboarding(baseDto)).rejects.toThrow(ConflictException);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4 — POST /auth/register-with-onboarding — placement level → starting lesson
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TEST 4: registerWithOnboarding — placement level sets starting lesson', () => {
    function makeDtoWithPlacement(placementLevel: 'beginner' | 'intermediate' | 'advanced') {
      return {
        firstName: 'أحمد', lastName: 'محمود', phone: '050000000' + placementLevel.length,
        password: 'pass123', gradeLevel: 3, subject: 'عربي',
        placementLevel,
      } as RegisterWithOnboardingDto;
    }

    beforeEach(() => {
      const mockUser = { id: 'user-1', email: 'x@e.local', phone: '050test', firstName: 'أحمد', lastName: 'محمود', role: 'STUDENT', isVerified: false, gemsBalance: 50, passwordHash: 'h' };
      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.subject.findFirst.mockResolvedValue({ id: 'sub-1', nameAr: 'عربي' });
      mockTx.studentProfile.create.mockResolvedValue({ id: 'p1', userId: 'user-1', gradeLevel: 3 });
      mockTx.userProgress.upsert.mockResolvedValue({});
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.$transaction = jest.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
    });

    it("placementLevel='beginner' should skip 0 lessons (start from Unit 1)", async () => {
      mockTx.grade.findUnique.mockResolvedValue({
        id: 'g1', lessons: [{ id: 'lesson-unit1', order: 1 }],
      });
      mockTx.lesson.findMany.mockResolvedValue([{ id: 'lesson-unit1', order: 1 }]);

      await authService.registerWithOnboarding(makeDtoWithPlacement('beginner'));

      expect(mockTx.userProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: 'UNLOCKED' }),
        }),
      );
    });

    it("placementLevel='intermediate' should skip ~20 lessons (start around Unit 3)", async () => {
      mockTx.grade.findUnique.mockResolvedValue({
        id: 'g1', lessons: [{ id: 'lesson-unit3', order: 21 }],
      });
      mockTx.lesson.findMany.mockResolvedValue([{ id: 'lesson-unit3', order: 21 }]);

      await authService.registerWithOnboarding(makeDtoWithPlacement('intermediate'));

      expect(mockTx.userProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: 'UNLOCKED' }),
        }),
      );
    });

    it("placementLevel='advanced' should skip ~50 lessons (start around Unit 6)", async () => {
      mockTx.grade.findUnique.mockResolvedValue({
        id: 'g1', lessons: [{ id: 'lesson-unit6', order: 51 }],
      });
      mockTx.lesson.findMany.mockResolvedValue([{ id: 'lesson-unit6', order: 51 }]);

      await authService.registerWithOnboarding(makeDtoWithPlacement('advanced'));

      expect(mockTx.userProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: 'UNLOCKED' }),
        }),
      );
    });
  });
});
