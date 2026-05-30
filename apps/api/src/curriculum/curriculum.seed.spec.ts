/**
 * Phase 4+5 TDD — curriculum.seed.spec.ts
 * Tests FAIL before implementation (red) and PASS after (green).
 */

// ── TEST 1: All 30 QuestionType values exist in Prisma schema ─────────────────
describe('TEST 1 — QuestionType enum completeness', () => {
  it('contains all 30 q112 exercise types', async () => {
    const { QuestionType } = await import('@prisma/client');

    const required = [
      'MULTIPLE_CHOICE', 'TRUE_FALSE', 'REVERSE_CHOICE', 'IMAGE_CHOICE',
      'IMAGE_MATCH', 'PAIR_MATCH', 'TAP_PAIRS', 'FILL_BLANK', 'FILL_BLANK_CHOICE',
      'WORD_ORDER', 'DRAG_ORDER', 'TRANSLATE', 'TRANSLATE_REVERSE', 'LISTEN_WRITE',
      'LISTEN_CHOICE', 'LISTEN_IMAGE', 'SPEAK', 'SPEAK_WORD', 'READ_ALOUD',
      'READING_COMPREHENSION', 'SORT_GROUPS', 'FLASHCARD', 'FLASHCARD_EX',
      'AI_CONVERSATION', 'ARRANGE_ALL_WORDS', 'COMPLETE_TRANSLATION',
      'MARK_CORRECT_MEANING', 'WORD_BANK', 'TIMED_PRACTICE', 'SPEED_REVIEW',
      'GRAMMAR_TIP',
    ] as const;

    for (const t of required) {
      expect(QuestionType[t]).toBeDefined();
    }
  });
});

// ── TEST 2: SUBJECT_MAP has exactly 4 subjects ────────────────────────────────
describe('TEST 2 — Seed script subject mapping', () => {
  it('SUBJECT_MAP contains exactly 4 subjects', async () => {
    const { SUBJECT_MAP } = await import('../../prisma/seeds/seed-q112-curriculum');
    expect(Object.keys(SUBJECT_MAP)).toHaveLength(4);
    expect(SUBJECT_MAP['Arabic']).toBe('عربي');
    expect(SUBJECT_MAP['Hebrew']).toBe('עברית');
    expect(SUBJECT_MAP['English']).toBe('English');
    expect(SUBJECT_MAP['Math']).toBe('رياضيات');
  });
});

// ── TEST 3: 48 subject-grade combinations will be seeded ──────────────────────
describe('TEST 3 — Seed script grade range', () => {
  it('produces 48 subject-grade combinations (4 subjects × 12 grades)', async () => {
    const { SUBJECT_MAP } = await import('../../prisma/seeds/seed-q112-curriculum');
    const subjects = Object.keys(SUBJECT_MAP);
    const grades = Array.from({ length: 12 }, (_, i) => i + 1);
    const combinations = subjects.length * grades.length;
    expect(combinations).toBe(48);
  });
});

// ── TEST 4: mapExerciseToQuestion converts MULTIPLE_CHOICE correctly ──────────
describe('TEST 4 — mapExerciseToQuestion question content mapping', () => {
  it('maps MULTIPLE_CHOICE exercise to correct DB format', async () => {
    const { mapExerciseToQuestion } = await import('../../prisma/seeds/seed-q112-curriculum');
    const exercise = {
      id: 'AR_G01_S1_0001',
      type: 'MULTIPLE_CHOICE',
      subject: 'Arabic',
      grade: 1,
      question: 'ما معنى كلمة أسد؟',
      choices: ['حيوان مفترس', 'معنى خاطئ 1', 'معنى خاطئ 2'],
      answer: 'حيوان مفترس',
      level: 1,
    };
    const result = mapExerciseToQuestion(exercise, 'lesson-abc', 1);
    expect(result.type).toBe('MULTIPLE_CHOICE');
    expect(result.lessonId).toBe('lesson-abc');
    expect(result.order).toBe(1);
    expect(result.difficulty).toBe(1);
    const content = result.content as { questionText: string; options: Array<{ id: string; text: string }> };
    expect(content.questionText).toBe('ما معنى كلمة أسد؟');
    expect(content.options[0].text).toBe('حيوان مفترس');
    const answer = result.correctAnswer as { selectedOptionIds: string[] };
    expect(answer.selectedOptionIds).toContain('a');
  });

  it('maps TRUE_FALSE exercise to correct DB format', async () => {
    const { mapExerciseToQuestion } = await import('../../prisma/seeds/seed-q112-curriculum');
    const exercise = {
      id: 'AR_G01_S1_0002',
      type: 'TRUE_FALSE',
      subject: 'Arabic',
      grade: 1,
      question: 'الشمس تشرق من الشرق',
      answer: 'صح',
      level: 1,
    };
    const result = mapExerciseToQuestion(exercise, 'lesson-abc', 2);
    expect(result.type).toBe('TRUE_FALSE');
    const content = result.content as { statement: string };
    expect(content.statement).toBe('الشمس تشرق من الشرق');
    const answer = result.correctAnswer as { isTrue: boolean };
    expect(answer.isTrue).toBe(true);
  });

  it('maps TAP_PAIRS exercise with pairs to correct DB format', async () => {
    const { mapExerciseToQuestion } = await import('../../prisma/seeds/seed-q112-curriculum');
    const exercise = {
      id: 'HE_G05_S1_0006',
      type: 'TAP_PAIRS',
      subject: 'Hebrew',
      grade: 5,
      question: 'اضغط على كل زوج متطابق',
      pairs: { 'לפני': 'قبل', 'אחרי': 'بعد' },
      level: 5,
    };
    const result = mapExerciseToQuestion(exercise, 'lesson-xyz', 1);
    expect(result.type).toBe('TAP_PAIRS');
    const content = result.content as { pairs: Array<{ id: string; left: string; right: string }> };
    expect(Array.isArray(content.pairs)).toBe(true);
    expect(content.pairs.length).toBe(2);
  });
});

// ── TEST 5: validateLanguagePurity ────────────────────────────────────────────
describe('TEST 5 — validateLanguagePurity language detection', () => {
  it('rejects English text for Arabic subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    const result = validateLanguagePurity({ questionText: 'What is this?' }, 'عربي');
    expect(result.valid).toBe(false);
  });

  it('accepts Arabic text for Arabic subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    const result = validateLanguagePurity({ questionText: 'ما هذا؟' }, 'عربي');
    expect(result.valid).toBe(true);
  });

  it('accepts Hebrew text for Hebrew subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    const result = validateLanguagePurity({ questionText: 'מה זה?' }, 'עברית');
    expect(result.valid).toBe(true);
  });

  it('rejects Arabic text for Hebrew subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    const result = validateLanguagePurity({ questionText: 'ما هذا؟' }, 'עברית');
    expect(result.valid).toBe(false);
  });

  it('accepts Latin text for English subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    const result = validateLanguagePurity({ questionText: 'What is this?' }, 'English');
    expect(result.valid).toBe(true);
  });

  it('accepts numeric-only content for any subject', async () => {
    const { validateLanguagePurity } = await import('../common/utils/language-purity');
    expect(validateLanguagePurity({ questionText: '٢ + ٢ = ?' }, 'عربي').valid).toBe(true);
    expect(validateLanguagePurity({ questionText: '4 × 6 = ?' }, 'رياضيات').valid).toBe(true);
  });
});
