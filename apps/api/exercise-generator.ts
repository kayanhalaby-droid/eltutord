/**
 * Adaptive Hebrew Exercise Generator
 * Generates exercises from vocabulary with no external dependencies.
 */

export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'REVERSE_CHOICE'
  | 'TAP_PAIRS'
  | 'FILL_BLANK_CHOICE'
  | 'WORD_ORDER'
  | 'LISTEN_CHOICE'
  | 'LISTEN_WRITE'
  | 'SPEAK_WORD'
  | 'SPEAK'
  | 'READ_ALOUD'
  | 'TRUE_FALSE'
  | 'SORT_GROUPS'
  | 'TRANSLATE'
  | 'FLASHCARD_EX'
  | 'AI_CONVERSATION';

export interface VocabItem {
  word: string;           // Hebrew
  translation: string;    // Arabic
  transliteration: string;
  gender?: 'male' | 'female';
  example?: string;       // Hebrew example sentence
  exampleAr?: string;     // Arabic translation of example
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  content: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  explanation?: string;
  difficulty: number;
  order: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function distractors(vocab: VocabItem[], exclude: string, count: number): VocabItem[] {
  return vocab.filter(v => v.word !== exclude).slice(0, count);
}

// ── Generators ───────────────────────────────────────────────────────

function mcq(vocab: VocabItem[], item: VocabItem, id: string): Exercise {
  const seed = hash(id);
  const wrong = distractors(vocab, item.word, 3);
  const options = seededShuffle([
    { id: 'c', text: item.translation },
    ...wrong.map((d, i) => ({ id: `d${i}`, text: d.translation })),
  ], seed);

  return {
    id, type: 'MULTIPLE_CHOICE', difficulty: 1, order: 0,
    content: {
      questionText: `ما معنى كلمة "${item.word}" (${item.transliteration})؟`,
      options,
    },
    correctAnswer: { selectedOptionIds: ['c'] },
    explanation: `"${item.word}" تعني "${item.translation}".`,
  };
}

function reverseChoice(vocab: VocabItem[], item: VocabItem, id: string): Exercise {
  const seed = hash(id);
  const wrong = distractors(vocab, item.word, 3);
  const options = seededShuffle([
    { id: 'c', text: item.word },
    ...wrong.map((d, i) => ({ id: `d${i}`, text: d.word })),
  ], seed);

  return {
    id, type: 'REVERSE_CHOICE', difficulty: 1, order: 0,
    content: {
      questionText: `اختر الكلمة العبرية لـ "${item.translation}":`,
      options,
      hebrewOptions: true,
    },
    correctAnswer: { selectedOptionIds: ['c'] },
    explanation: `"${item.translation}" بالعبرية: "${item.word}" (${item.transliteration}).`,
  };
}

function tapPairs(vocab: VocabItem[], id: string): Exercise {
  const items = vocab.slice(0, 4);
  const pairs = items.map((v, i) => ({ id: `p${i}`, hebrew: v.word, arabic: v.translation }));

  return {
    id, type: 'TAP_PAIRS', difficulty: 2, order: 0,
    content: {
      questionText: 'اضغط على الأزواج المتطابقة:',
      pairs,
    },
    correctAnswer: { matches: Object.fromEntries(pairs.map(p => [p.id, p.id])) },
    explanation: 'طابق كل كلمة عبرية مع مقابلها العربي.',
  };
}

function fillBlankChoice(vocab: VocabItem[], item: VocabItem, id: string): Exercise {
  const seed = hash(id);
  const wrong = distractors(vocab, item.word, 3);
  const options = seededShuffle([
    { id: 'c', text: item.word },
    ...wrong.map((d, i) => ({ id: `d${i}`, text: d.word })),
  ], seed);

  const sentence = item.example
    ? item.example.replace(item.word, '___')
    : `___ تعني "${item.translation}".`;

  return {
    id, type: 'FILL_BLANK_CHOICE', difficulty: 2, order: 0,
    content: {
      questionText: item.example
        ? `أكمل الجملة العبرية (${item.exampleAr ?? ''})`
        : 'اختر الكلمة الصحيحة:',
      sentence,
      options,
    },
    correctAnswer: { selectedOptionId: 'c' },
    explanation: item.example
      ? `الجملة الكاملة: "${item.example}"`
      : `الكلمة الصحيحة: "${item.word}".`,
  };
}

function wordOrder(item: VocabItem, id: string): Exercise {
  const sentence = item.example ?? `${item.word} = ${item.translation}`;
  const words = sentence.split(' ').filter(Boolean);
  const seed = hash(id);

  return {
    id, type: 'WORD_ORDER', difficulty: 3, order: 0,
    content: {
      questionText: `رتّب الكلمات (${item.exampleAr ?? item.translation}):`,
      words: seededShuffle(words, seed),
      correctOrder: words,
    },
    correctAnswer: { order: words },
    explanation: `الترتيب الصحيح: "${sentence}".`,
  };
}

function listenChoice(vocab: VocabItem[], item: VocabItem, id: string): Exercise {
  const seed = hash(id);
  const wrong = distractors(vocab, item.word, 3);
  const options = seededShuffle([
    { id: 'c', text: item.translation },
    ...wrong.map((d, i) => ({ id: `d${i}`, text: d.translation })),
  ], seed);

  return {
    id, type: 'LISTEN_CHOICE', difficulty: 2, order: 0,
    content: {
      questionText: 'استمع واختر المعنى الصحيح:',
      audioText: item.word,
      options,
    },
    correctAnswer: { selectedOptionIds: ['c'] },
    explanation: `"${item.word}" (${item.transliteration}) = "${item.translation}".`,
  };
}

function listenWrite(item: VocabItem, id: string): Exercise {
  return {
    id, type: 'LISTEN_WRITE', difficulty: 3, order: 0,
    content: {
      questionText: 'استمع واكتب النطق اللاتيني للكلمة:',
      audioText: item.word,
      hint: item.word,
    },
    correctAnswer: { accepted: [item.transliteration, item.transliteration.toLowerCase()] },
    explanation: `"${item.word}" تُكتب "${item.transliteration}".`,
  };
}

function speakWord(item: VocabItem, id: string): Exercise {
  return {
    id, type: 'SPEAK_WORD', difficulty: 3, order: 0,
    content: {
      questionText: 'انطق الكلمة العبرية:',
      targetWord: item.word,
      transliteration: item.transliteration,
      translation: item.translation,
      minAccuracy: 60,
    },
    correctAnswer: { targetText: item.word, minAccuracy: 60 },
    explanation: `انطق: "${item.transliteration}"`,
  };
}

function speakSentence(item: VocabItem, id: string): Exercise {
  const sentence = item.example ?? item.word;
  return {
    id, type: 'SPEAK', difficulty: 3, order: 0,
    content: {
      questionText: 'اقرأ الجملة بصوت عالٍ:',
      targetText: sentence,
      translation: item.exampleAr ?? item.translation,
      minAccuracy: 55,
    },
    correctAnswer: { targetText: sentence, minAccuracy: 55 },
    explanation: `الجملة: "${sentence}"`,
  };
}

function trueFalse(vocab: VocabItem[], item: VocabItem, id: string): Exercise {
  const isTrue = hash(id) % 2 === 0;
  const wrongItem = isTrue ? null : (distractors(vocab, item.word, 1)[0] ?? null);

  return {
    id, type: 'TRUE_FALSE', difficulty: 1, order: 0,
    content: {
      statement: isTrue
        ? `"${item.word}" (${item.transliteration}) تعني "${item.translation}".`
        : `"${item.word}" (${item.transliteration}) تعني "${wrongItem?.translation ?? '...'}".`,
    },
    correctAnswer: { isTrue },
    explanation: `"${item.word}" تعني "${item.translation}".`,
  };
}

function sortGroups(vocab: VocabItem[], id: string): Exercise {
  const seed = hash(id);
  const males = vocab.filter(v => v.gender === 'male');
  const females = vocab.filter(v => v.gender === 'female');
  const picked = seededShuffle([
    ...males.slice(0, 3).map(v => ({ id: v.word, label: `${v.word} (${v.transliteration})`, group: 'male' })),
    ...females.slice(0, 3).map(v => ({ id: v.word, label: `${v.word} (${v.transliteration})`, group: 'female' })),
  ], seed);

  return {
    id, type: 'SORT_GROUPS', difficulty: 3, order: 0,
    content: {
      questionText: 'صنّف الكلمات حسب النوع النحوي:',
      groups: [
        { id: 'male',   label: 'مذكّر (זָכָר)' },
        { id: 'female', label: 'مؤنّث (נְקֵבָה)' },
      ],
      items: picked,
    },
    correctAnswer: { assignments: Object.fromEntries(picked.map(i => [i.id, i.group])) },
    explanation: 'في العبرية، للأسماء نوع نحوي مثل العربية.',
  };
}

function flashcardEx(item: VocabItem, id: string): Exercise {
  return {
    id, type: 'FLASHCARD_EX', difficulty: 1, order: 0,
    content: { front: item.word, back: item.translation, transliteration: item.transliteration },
    correctAnswer: { rated: true },
    explanation: '',
  };
}

function aiConversation(item: VocabItem, id: string): Exercise {
  return {
    id, type: 'AI_CONVERSATION', difficulty: 3, order: 0,
    content: {
      questionText: 'تحدّث مع المعلم الذكي!',
      systemPrompt: `أنت مدرس عبري لطيف تساعد طالباً عربياً يتعلم العبرية في الصف الثالث. ركّز على كلمة "${item.word}" (${item.translation}). اشرح بالعربية وتدرّب بالعبرية. كن بسيطاً وشجّعاً. ردودك قصيرة جداً (جملة أو جملتان).`,
      startMessage: `مرحباً! هل تعرف معنى "${item.word}"؟`,
      vocab: item.word,
      maxTurns: 4,
    },
    correctAnswer: { completed: true },
    explanation: '',
  };
}

// ── Main Generator ────────────────────────────────────────────────────

export function generateExercises(lessonId: string, vocab: VocabItem[]): Exercise[] {
  if (!vocab.length) return [];

  const seed = hash(lessonId);
  const shuffled = seededShuffle(vocab, seed);

  const hasEnoughForPairs = vocab.length >= 4;
  const hasExample = vocab.some(v => v.example);
  const maleCount = vocab.filter(v => v.gender === 'male').length;
  const femaleCount = vocab.filter(v => v.gender === 'female').length;
  const canSortGroups = maleCount >= 2 && femaleCount >= 2;
  const isQuiz = /-(4|8|12|16|20|24)$/.test(lessonId);

  const raw: Exercise[] = [];

  // 1. Start with MCQ (always safe, no audio)
  raw.push(mcq(vocab, shuffled[0 % shuffled.length], `${lessonId}-e1`));

  // 2. Reverse choice
  if (hasEnoughForPairs) {
    raw.push(reverseChoice(vocab, shuffled[1 % shuffled.length], `${lessonId}-e2`));
  } else {
    raw.push(trueFalse(vocab, shuffled[1 % shuffled.length], `${lessonId}-e2`));
  }

  // 3. Tap pairs
  if (hasEnoughForPairs) {
    raw.push(tapPairs(vocab, `${lessonId}-e3`));
  }

  // 4. Fill-blank choice or sort groups
  if (canSortGroups) {
    raw.push(sortGroups(vocab, `${lessonId}-e4`));
  } else {
    raw.push(fillBlankChoice(vocab, shuffled[2 % shuffled.length], `${lessonId}-e4`));
  }

  // 5. Listen choice (first audio, not first position)
  raw.push(listenChoice(vocab, shuffled[3 % shuffled.length], `${lessonId}-e5`));

  // 6. Word order or fill-blank
  if (hasExample) {
    const withExample = vocab.find(v => v.example) ?? shuffled[4 % shuffled.length];
    raw.push(wordOrder(withExample, `${lessonId}-e6`));
  } else {
    raw.push(fillBlankChoice(vocab, shuffled[4 % shuffled.length], `${lessonId}-e6`));
  }

  // 7. True/false
  raw.push(trueFalse(vocab, shuffled[5 % shuffled.length], `${lessonId}-e7`));

  // 8. Speak word
  raw.push(speakWord(shuffled[6 % shuffled.length], `${lessonId}-e8`));

  // Quiz bonus exercises
  if (isQuiz && vocab.length >= 2) {
    raw.push(listenWrite(shuffled[7 % shuffled.length], `${lessonId}-e9`));
    if (hasExample) {
      raw.push(speakSentence(vocab.find(v => v.example) ?? shuffled[0], `${lessonId}-e10`));
    }
    raw.push(aiConversation(shuffled[0], `${lessonId}-e11`));
  }

  return raw.map((e, i) => ({ ...e, order: i + 1 }));
}

// ── addUnit helper ────────────────────────────────────────────────────

export interface UnitSpec {
  subject: string;
  grade: number;
  unit: string;
  title: string;
  vocab: Array<{ word: string; translation: string; transliteration?: string; gender?: 'male' | 'female' }>;
}

export function buildUnitLessons(spec: UnitSpec) {
  const { subject, grade, unit, title, vocab } = spec;
  const baseId = `custom-${subject}-${grade}-${unit.replace(/\s+/g, '-').toLowerCase()}`;

  const fullVocab: VocabItem[] = vocab.map(v => ({
    word: v.word,
    translation: v.translation,
    transliteration: v.transliteration ?? v.word,
    gender: v.gender,
  }));

  // Split vocab across 4 lessons (2 words per lesson min)
  const chunk = Math.max(2, Math.ceil(fullVocab.length / 4));
  const lessons = [];
  for (let i = 0; i < 4; i++) {
    const lessonVocab = fullVocab.slice(i * chunk, (i + 1) * chunk);
    const lessonId = `${baseId}-l${i + 1}`;
    const isQuiz = i === 3;
    lessons.push({
      id: lessonId,
      title: isQuiz ? `بחן את עצמך — ${title}` : `${title} (${i + 1})`,
      order: i + 1,
      unit,
      isQuiz,
      vocab: isQuiz ? fullVocab : lessonVocab,  // quiz covers all vocab
      exercises: generateExercises(lessonId, isQuiz ? fullVocab : lessonVocab),
    });
  }
  return lessons;
}
