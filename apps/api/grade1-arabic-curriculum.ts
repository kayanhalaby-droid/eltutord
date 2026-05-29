/**
 * Grade 1 Arabic Curriculum — Complete question bank
 * 7 phases, 42 lessons, all 23 exercise types
 * All text fully voweled (مُشَكَّل), emoji as visuals, TTS via Web Speech API
 */

function id() { return Math.random().toString(36).slice(2, 10); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mc = (questionText: string, options: string[], correctIndex: number, explanation?: string) => ({
  id: id(), type: 'MULTIPLE_CHOICE',
  content: { questionText, options: options.map((t, i) => ({ id: `o${i}`, text: t })), isMultiSelect: false },
  correctAnswer: { selectedOptionIds: [`o${correctIndex}`] },
  explanation: explanation ?? options[correctIndex],
  difficulty: 1,
});

const tf = (statement: string, isTrue: boolean, explanation?: string) => ({
  id: id(), type: 'TRUE_FALSE',
  content: { statement, isTrue },
  correctAnswer: { isTrue },
  explanation: explanation ?? (isTrue ? 'صَحِيحٌ ✅' : 'خَطَأٌ ❌'),
  difficulty: 1,
});

const imgChoice = (questionText: string, audioText: string, options: Array<{emoji: string; label: string}>, correctIndex: number) => ({
  id: id(), type: 'IMAGE_CHOICE',
  content: { questionText, audioText, options: options.map((o, i) => ({ id: `o${i}`, ...o })) },
  correctAnswer: { selectedOptionId: `o${correctIndex}` },
  explanation: options[correctIndex].label,
  difficulty: 1,
});

const imgMatch = (questionText: string, pairs: Array<{image: string; word: string}>) => ({
  id: id(), type: 'IMAGE_MATCH',
  content: { questionText, pairs: pairs.map((p, i) => ({ id: `p${i}`, ...p })) },
  correctAnswer: { matches: Object.fromEntries(pairs.map((p, i) => [`p${i}`, p.word])) },
  explanation: 'أَحْسَنْتَ! 🌟',
  difficulty: 2,
});

const listenImg = (question: string, audioText: string, options: Array<{emoji: string; label?: string}>, correctIndex: number) => ({
  id: id(), type: 'LISTEN_IMAGE',
  content: { question, audioText, options: options.map((o, i) => ({ id: `o${i}`, ...o })) },
  correctAnswer: { selectedOptionId: `o${correctIndex}` },
  explanation: options[correctIndex].label ?? audioText,
  difficulty: 1,
});

const listenChoice = (audioText: string, options: string[], correctIndex: number) => ({
  id: id(), type: 'LISTEN_CHOICE',
  content: { questionText: 'اسْتَمِعْ وَاخْتَرِ الإِجَابَةَ الصَّحِيحَة', audioText, options: options.map((t, i) => ({ id: `o${i}`, text: t })) },
  correctAnswer: { selectedOptionIds: [`o${correctIndex}`] },
  explanation: options[correctIndex],
  difficulty: 1,
});

const listenWrite = (question: string, audioText: string, correct: string, hint?: string) => ({
  id: id(), type: 'LISTEN_WRITE',
  content: { questionText: question, audioText, hint },
  correctAnswer: { accepted: [correct, correct.replace(/ً|ٌ|ٍ|َ|ُ|ِ|ّ|ْ/g, '')] },
  explanation: correct,
  difficulty: 2,
});

const tapPairs = (questionText: string, pairs: Array<{arabic: string; match: string}>) => ({
  id: id(), type: 'TAP_PAIRS',
  content: { questionText, pairs: pairs.map((p, i) => ({ id: `p${i}`, arabic: p.arabic, hebrew: p.match })) },
  correctAnswer: { matches: Object.fromEntries(pairs.map((p, i) => [`p${i}`, p.match])) },
  explanation: 'أَحْسَنْتَ! 🌟',
  difficulty: 2,
});

const fbChoice = (sentence: string, options: string[], correctIndex: number, emoji?: string) => ({
  id: id(), type: 'FILL_BLANK_CHOICE',
  content: { questionText: 'أَكْمِلِ الفَرَاغَ', sentence, options: options.map((t, i) => ({ id: `o${i}`, text: t })), emoji },
  correctAnswer: { selectedOptionId: `o${correctIndex}` },
  explanation: options[correctIndex],
  difficulty: 2,
});

const wordOrder = (questionText: string, words: string[], correctSentence: string, audio?: string) => ({
  id: id(), type: 'WORD_ORDER',
  content: { questionText, words, correctOrder: correctSentence.split(' '), audio },
  correctAnswer: { order: correctSentence.split(' ') },
  explanation: correctSentence,
  difficulty: 2,
});

const sortGroups = (questionText: string, groups: Array<{label: string; items: string[]}>) => {
  const allItems: Array<{id: string; label: string; group: string}> = [];
  const assignments: Record<string, string> = {};
  groups.forEach((g, gi) => {
    g.items.forEach((item, ii) => {
      const itemId = `item-${gi}-${ii}`;
      allItems.push({ id: itemId, label: item, group: `g${gi}` });
      assignments[itemId] = `g${gi}`;
    });
  });
  return {
    id: id(), type: 'SORT_GROUPS',
    content: { questionText, groups: groups.map((g, i) => ({ id: `g${i}`, label: g.label })), items: allItems },
    correctAnswer: { assignments },
    explanation: 'أَحْسَنْتَ! 🌟',
    difficulty: 2,
  };
};

const flashcard = (front: string, back: string, frontAudio?: string, backAudio?: string) => ({
  id: id(), type: 'FLASHCARD_EX',
  content: { front, back, transliteration: '' },
  correctAnswer: { seen: true },
  explanation: back,
  difficulty: 1,
});

const speak = (word: string, emoji?: string, minAccuracy = 50) => ({
  id: id(), type: 'SPEAK_WORD',
  content: { questionText: 'انْطِقْ هَذِهِ الكَلِمَة', targetWord: word, transliteration: '', translation: emoji ?? '', minAccuracy },
  correctAnswer: { passed: true },
  explanation: 'رَائِعٌ! نُطْقُكَ جَيِّدٌ 🌟',
  difficulty: 2,
});

const readAloud = (text: string, translation: string, minAccuracy = 50) => ({
  id: id(), type: 'READ_ALOUD',
  content: { questionText: 'اقْرَأْ هَذَا بِصَوْتٍ', targetText: text, transliteration: '', translation, minAccuracy },
  correctAnswer: { passed: true },
  explanation: 'رَائِعٌ! 🌟',
  difficulty: 2,
});

const translate = (question: string, source: string, correct: string, options: string[], emoji?: string, hint?: string) => ({
  id: id(), type: 'TRANSLATE',
  content: { question, source, options, correct, emoji, hint, sourceLabel: 'العامية' },
  correctAnswer: { accepted: [correct, correct.replace(/ً|ٌ|ٍ|َ|ُ|ِ|ّ|ْ/g, '')] },
  explanation: correct,
  difficulty: 2,
});

const translateReverse = (question: string, source: string, correct: string, options: string[], emoji?: string) => ({
  id: id(), type: 'TRANSLATE_REVERSE',
  content: { question, source, options, correct, emoji, sourceLabel: 'الفصحى' },
  correctAnswer: { accepted: [correct] },
  explanation: correct,
  difficulty: 2,
});

const dragOrder = (question: string, items: Array<{text: string; order: number}>) => ({
  id: id(), type: 'DRAG_ORDER',
  content: { question, items: items.map((it) => ({ id: `di-${it.order}`, ...it })) },
  correctAnswer: { orderedIds: items.sort((a, b) => a.order - b.order).map((it) => `di-${it.order}`) },
  explanation: 'أَحْسَنْتَ! 🌟',
  difficulty: 2,
});

const comprehension = (text: string, audioText: string, questions: Array<{q: string; options: string[]; correct: number}>) => ({
  id: id(), type: 'READING_COMPREHENSION',
  content: { text, audioText, questions },
  correctAnswer: { answers: questions.map(q => q.correct) },
  explanation: 'أَحْسَنْتَ! فَهَمْتَ النَّصَّ جَيِّداً 🌟',
  difficulty: 3,
});

const aiConv = (scenario: string, systemPrompt: string) => ({
  id: id(), type: 'AI_CONVERSATION',
  content: { questionText: scenario, systemPrompt, startMessage: 'مَرْحَباً!', maxTurns: 4, vocab: '' },
  correctAnswer: { completed: true },
  explanation: 'مُحَادَثَةٌ رَائِعَة! 🌟',
  difficulty: 4,
});

// ─── UNIT 0: الوعي الصوتي ─────────────────────────────────────────────────────
export const UNIT0_LESSONS = [
  {
    id: 'ar1-u0-l1', title: 'تَصْفِيقُ المَقَاطِع', unitId: 'ar1-u0', order: 1, xpReward: 10, estimatedMinutes: 8,
    questions: [
      listenImg('اسْتَمِعْ لِكَلِمَةِ "بَيْتٌ" — كَمْ مَقْطَع؟', 'بَيْتٌ',
        [{ emoji: '1️⃣', label: 'مَقْطَع وَاحِد' }, { emoji: '2️⃣', label: 'مَقْطَعَانِ' }, { emoji: '3️⃣', label: 'ثَلَاثَة' }], 0),
      listenImg('كَمْ مَقْطَعٍ فِي "أَسَدٌ"؟', 'أَسَدٌ',
        [{ emoji: '1️⃣' }, { emoji: '2️⃣' }, { emoji: '3️⃣' }], 1),
      listenImg('كَمْ مَقْطَعٍ فِي "مَدْرَسَةٌ"؟', 'مَدْرَسَةٌ',
        [{ emoji: '2️⃣', label: 'اثْنَانِ' }, { emoji: '3️⃣', label: 'ثَلَاثَة' }, { emoji: '4️⃣', label: 'أَرْبَعَة' }], 1),
      tf('كَلِمَةُ "أُمٌّ" لَهَا مَقْطَعٌ وَاحِدٌ 👩', true, 'صَحِيحٌ! أُمٌّ = مَقْطَع وَاحِد ✅'),
      sortGroups('صَنِّفِ الكَلِمَاتِ حَسَبَ عَدَدِ المَقَاطِع', [
        { label: '1️⃣ مَقْطَع وَاحِد', items: ['بَيْتٌ 🏠', 'أُمٌّ 👩', 'أَبٌ 👨'] },
        { label: '2️⃣ مَقْطَعَانِ', items: ['أَسَدٌ 🦁', 'قَلَمٌ ✏️', 'كِتَابٌ 📚'] },
      ]),
      mc('أَيُّ الكَلِمَاتِ لَهَا 3 مَقَاطِع؟', ['بَيْتٌ 🏠', 'مَدْرَسَةٌ 🏫', 'قِطَّةٌ 🐱', 'أَبٌ 👨'], 1),
      tapPairs('صِلِ الكَلِمَةَ بِعَدَدِ مَقَاطِعِهَا', [
        { arabic: 'أُمٌّ 👩', match: '1️⃣' },
        { arabic: 'أَسَدٌ 🦁', match: '2️⃣' },
        { arabic: 'مَدْرَسَةٌ 🏫', match: '3️⃣' },
      ]),
      flashcard('بَيْتٌ 🏠', 'مَقْطَع وَاحِد'),
    ],
  },
  {
    id: 'ar1-u0-l2', title: 'الأَصْوَاتُ الأُولَى', unitId: 'ar1-u0', order: 2, xpReward: 10, estimatedMinutes: 8,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِصَوْتِ "أَ"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِصَوْتِ أَ',
        [{ emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '✏️', label: 'قَلَمٌ' }, { emoji: '🌙', label: 'قَمَرٌ' }], 0),
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِصَوْتِ "بَ"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِصَوْتِ بَ',
        [{ emoji: '🍌', label: 'مَوْزٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🌹', label: 'وَرْدَةٌ' }], 1),
      listenImg('اسْتَمِعْ وَحَدِّدِ الكَلِمَةَ التِي تَسْمَعُهَا', 'أُمٌّ',
        [{ emoji: '👩', label: 'أُمٌّ' }, { emoji: '👨', label: 'أَبٌ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '👧', label: 'أُخْتٌ' }], 0),
      tf('كَلِمَةُ "كَلْبٌ" تَبْدَأُ بِحَرْفِ "كَ" 🐕', true),
      sortGroups('صَنِّفِ الكَلِمَاتِ حَسَبَ أَوَّلِ حَرْف', [
        { label: 'تَبْدَأُ بِـ أَ', items: ['أَسَدٌ 🦁', 'أُمٌّ 👩', 'أَرْنَبٌ 🐇'] },
        { label: 'تَبْدَأُ بِـ بَ', items: ['بَيْتٌ 🏠', 'بَقَرَةٌ 🐄', 'بَحْرٌ 🌊'] },
      ]),
      mc('مَا الحَرْفُ الأَوَّلُ فِي كَلِمَةِ "فِيلٌ 🐘"؟', ['أَ', 'فَ', 'بَ', 'كَ'], 1),
      listenChoice('كَلْبٌ', ['🐕 كَلْبٌ', '🐱 قِطَّةٌ', '🐟 سَمَكَةٌ', '🐦 عُصْفُورٌ'], 0),
      flashcard('أَ 🌟', 'أَسَدٌ 🦁 — أُمٌّ 👩 — أَرْنَبٌ 🐇'),
    ],
  },
  {
    id: 'ar1-u0-l3', title: 'القَافِيَة — الأَصْوَاتُ المُتَشَابِهَة', unitId: 'ar1-u0', order: 3, xpReward: 10, estimatedMinutes: 8,
    questions: [
      mc('أَيُّ الكَلِمَتَيْنِ تَتَشَابَهَانِ فِي النِّهَايَة؟ 🎵', ['بَيْتٌ — كِتَابٌ', 'بَيْتٌ — لَيْتَ', 'أُمٌّ — أَبٌ', 'قَلَمٌ — سَمَاء'], 1),
      listenImg('اسْتَمِعْ: قِطَّةٌ — أَيُّ كَلِمَةٍ تُشْبِهُهَا فِي النِّهَايَة؟', 'قِطَّةٌ',
        [{ emoji: '🌹', label: 'وَرْدَةٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🎒', label: 'حَقِيبَةٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }], 2),
      tf('كَلِمَتَا "بَيْتٌ" و"لَيْتَ" تَتَشَابَهَانِ فِي الصَّوْتِ الأَخِير', true, 'صَحِيحٌ! كِلَاهُمَا ينتهي بـ "يْتَ"'),
      sortGroups('صَنِّفِ الكَلِمَاتِ فِي مَجْمُوعَاتٍ مُتَقَافِيَة', [
        { label: '🎵 مَجْمُوعَة 1', items: ['بَيْتٌ 🏠', 'لَيْتَ 🌟', 'صَيْفٌ ☀️'] },
        { label: '🎵 مَجْمُوعَة 2', items: ['قَلَمٌ ✏️', 'عَلَمٌ 🚩', 'قَدَمٌ 👣'] },
      ]),
      mc('أَيُّ الكَلِمَاتِ تَتَشَابَهُ مَعَ "أُمٌّ"؟', ['فَمٌّ', 'أَبٌ', 'بَيْتٌ', 'كِتَابٌ'], 0),
      listenChoice('نَجْمٌ', ['نَجْمٌ ⭐ — عَلَمٌ 🚩', 'نَجْمٌ ⭐ — رَسْمٌ 🖼️', 'نَجْمٌ ⭐ — بَيْتٌ 🏠'], 1,),
      tapPairs('صِلِ الكَلِمَةَ بِمَا يُقَافِيهَا', [
        { arabic: 'بَيْتٌ 🏠', match: 'لَيْتَ 🌟' },
        { arabic: 'أُمٌّ 👩', match: 'فَمٌّ 👄' },
        { arabic: 'قَلَمٌ ✏️', match: 'عَلَمٌ 🚩' },
      ]),
      flashcard('القَافِيَة 🎵', 'كَلِمَاتٌ تَنْتَهِي بِنَفْسِ الصَّوْت'),
    ],
  },
];

// ─── UNIT 1: أ، ب، ت، ث، ن ────────────────────────────────────────────────────
export const UNIT1_LESSONS = [
  {
    id: 'ar1-u1-l1', title: 'حَرْفُ أَلِف (أ)', unitId: 'ar1-u1', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ "أ"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ أَلِف',
        [{ emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '✏️', label: 'قَلَمٌ' }, { emoji: '🌊', label: 'بَحْرٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الكَلِمَةَ التِي تَبْدَأُ بِـ "أ"', 'أَرْنَبٌ',
        [{ emoji: '🐇', label: 'أَرْنَبٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🐔', label: 'دَجَاجَةٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🦁', word: 'أَسَدٌ' }, { image: '🐇', word: 'أَرْنَبٌ' },
        { image: '👩', word: 'أُمٌّ' }, { image: '👨', word: 'أَبٌ' },
      ]),
      tf('كَلِمَةُ "أَرْنَبٌ" تَبْدَأُ بِحَرْفِ الأَلِف 🐇', true),
      sortGroups('صَنِّفِ الكَلِمَاتِ: تَبْدَأُ بِـ "أ" أَوْ لَا', [
        { label: 'تَبْدَأُ بِـ أَ ✅', items: ['أَسَدٌ 🦁', 'أُمٌّ 👩', 'أَرْنَبٌ 🐇', 'أَخٌ 👦'] },
        { label: 'لَا تَبْدَأُ بِـ أَ ❌', items: ['بَيْتٌ 🏠', 'قِطَّةٌ 🐱', 'كِتَابٌ 📚'] },
      ]),
      listenWrite('اسْتَمِعْ وَاكْتُبِ الحَرْفَ الأَوَّل', 'أُمٌّ', 'أ', 'الكَلِمَةُ تَبْدَأُ بِـ...'),
      flashcard('أَ', 'أَسَدٌ 🦁\nأُمٌّ 👩\nأَرْنَبٌ 🐇\nأَخٌ 👦'),
      mc('أَيُّ الصُّوَرِ تَبْدَأُ بِحَرْفِ "أ"؟', ['🏠 بَيْتٌ', '🦁 أَسَدٌ', '✏️ قَلَمٌ', '🌊 بَحْرٌ'], 1),
    ],
  },
  {
    id: 'ar1-u1-l2', title: 'حَرْفُ البَاء (ب)', unitId: 'ar1-u1', order: 2, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ "ب"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ البَاء',
        [{ emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🌹', label: 'وَرْدَةٌ' }], 0),
      listenImg('اسْتَمِعْ: أَيُّ كَلِمَةٍ تَسْمَعُهَا؟', 'بَقَرَةٌ',
        [{ emoji: '🐄', label: 'بَقَرَةٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🐟', label: 'سَمَكَةٌ' }, { emoji: '🐦', label: 'عُصْفُورٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🏠', word: 'بَيْتٌ' }, { image: '🐄', word: 'بَقَرَةٌ' },
        { image: '🥚', word: 'بَيْضَةٌ' }, { image: '🌊', word: 'بَحْرٌ' },
      ]),
      tf('حَرْفُ "ب" لَهُ نُقْطَةٌ وَاحِدَةٌ تَحْتَه 🔵', true, 'صَحِيحٌ! حَرْفُ الباء لَهُ نُقْطَة وَاحِدَة تَحْته'),
      tapPairs('صِلِ الحَرْفَ بِالكَلِمَةِ التِي تَبْدَأُ بِه', [
        { arabic: 'أَ', match: 'أَسَدٌ 🦁' },
        { arabic: 'بَ', match: 'بَيْتٌ 🏠' },
        { arabic: 'مَ', match: 'مَاءٌ 💧' },
      ]),
      fbChoice('بَيْتِي ___ وَجَمِيل', ['كَبِيرٌ', 'أَحْمَرُ', 'أَسَدٌ'], 0, '🏠'),
      listenWrite('اسْتَمِعْ وَاكْتُبِ الحَرْفَ الأَوَّل', 'بَقَرَةٌ', 'ب'),
      flashcard('ب', 'بَيْتٌ 🏠\nبَقَرَةٌ 🐄\nبَحْرٌ 🌊\nبَيْضَةٌ 🥚'),
    ],
  },
  {
    id: 'ar1-u1-l3', title: 'حَرْفَا التَّاء وَالثَّاء (ت ث)', unitId: 'ar1-u1', order: 3, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِـ "ت"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ التَّاء',
        [{ emoji: '🍎', label: 'تُفَّاحَةٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🌹', label: 'وَرْدَةٌ' }], 0),
      mc('كَمْ نُقْطَةً فَوْقَ حَرْفِ "ث"؟', ['نُقْطَة وَاحِدَة', 'نُقْطَتَانِ', 'ثَلَاثُ نِقَاط', 'لَا نِقَاط'], 2),
      imgMatch('صِلْ كُلَّ حَرْفٍ بِكَلِمَتِه', [
        { image: 'تَ', word: 'تُفَّاحَةٌ 🍎' }, { image: 'ثَ', word: 'ثَوْبٌ 👕' },
        { image: 'بَ', word: 'بَيْتٌ 🏠' },
      ]),
      tf('"ث" لَهُ نُقْطَتَانِ فَوْقَه', false, 'خَطَأٌ! الثَّاء لَهُ ثَلَاثُ نِقَاط فَوْقَه'),
      sortGroups('صَنِّفِ الكَلِمَاتِ: تَبْدَأُ بِـ ت أَوْ ث', [
        { label: 'تَبْدَأُ بِـ تَ', items: ['تُفَّاحَةٌ 🍎', 'تِمْسَاحٌ 🐊', 'تُرْكِيٌّ 🦃'] },
        { label: 'تَبْدَأُ بِـ ثَ', items: ['ثَوْبٌ 👕', 'ثَعْلَبٌ 🦊', 'ثَلَاثَةٌ 3️⃣'] },
      ]),
      listenImg('اسْتَمِعْ: أَيُّ حَرْفٍ؟', 'تَ',
        [{ emoji: 'أَ' }, { emoji: 'بَ' }, { emoji: 'تَ' }, { emoji: 'ثَ' }], 2),
      tapPairs('صِلِ الحَرْفَ بِعَدَدِ نِقَاطِه', [
        { arabic: 'بَ', match: '1 نُقْطَة' }, { arabic: 'تَ', match: '2 نُقْطَة' }, { arabic: 'ثَ', match: '3 نِقَاط' },
      ]),
      flashcard('ت — ث', 'تُفَّاحَةٌ 🍎 — ثَعْلَبٌ 🦊\nتَ: نُقْطَتَانِ ✦✦\nثَ: ثَلَاثُ نِقَاط ✦✦✦'),
    ],
  },
  {
    id: 'ar1-u1-l4', title: 'حَرْفُ النُّون (ن)', unitId: 'ar1-u1', order: 4, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِـ "ن"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ النُّون',
        [{ emoji: '🌟', label: 'نَجْمٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '✏️', label: 'قَلَمٌ' }], 0),
      listenImg('اسْتَمِعْ وَحَدِّدِ الكَلِمَة', 'نَمِرٌ',
        [{ emoji: '🐯', label: 'نَمِرٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🦊', label: 'ثَعْلَبٌ' }], 0),
      mc('أَيُّ الكَلِمَاتِ تَنْتَهِي بِحَرْفِ "ن"؟', ['أَسَدٌ', 'بَيْتٌ', 'حِصَانٌ', 'قِطَّةٌ'], 2),
      tf('حَرْفُ "ن" لَهُ نُقْطَةٌ فَوْقَه', false, 'خَطَأٌ! النُّون لَهُ نُقْطَة فِي وَسَطِه'),
      sortGroups('صَنِّفِ الكَلِمَاتِ: تَبْدَأُ بِـ ن أَوْ تَنْتَهِي بِـ ن', [
        { label: 'تَبْدَأُ بِـ نَ', items: ['نَجْمٌ ⭐', 'نَمِرٌ 🐯', 'نَهْرٌ 🏞️'] },
        { label: 'تَنْتَهِي بِـ ن', items: ['حِصَانٌ 🐴', 'مِيزَانٌ ⚖️', 'خُبْزٌ 🍞'] },
      ]),
      fbChoice('السَّمَاءُ مَلِيئَةٌ بِالنُّجُومِ ___ لَيْلاً', ['اللَّامِعَة', 'الكَبِيرَة', 'الكَثِيرَة'], 0, '⭐'),
      listenWrite('اسْتَمِعْ وَاكْتُبِ الكَلِمَة', 'نَجْمٌ', 'نجم', 'كَلِمَة تَبْدَأُ بِـ ن'),
      flashcard('ن', 'نَجْمٌ ⭐\nنَمِرٌ 🐯\nنَهْرٌ 🏞️\nنَحْلَةٌ 🐝'),
    ],
  },
  {
    id: 'ar1-u1-l5', title: 'الفَتْحَة وَالكَسْرَة وَالضَّمَّة', unitId: 'ar1-u1', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('مَا اسْمُ الحَرَكَةِ فَوْقَ الحَرْف؟ أَ', ['الكَسْرَة', 'الفَتْحَة', 'الضَّمَّة', 'السُّكُون'], 1),
      mc('مَا اسْمُ الحَرَكَةِ تَحْتَ الحَرْف؟ إِ', ['الفَتْحَة', 'الضَّمَّة', 'الكَسْرَة', 'الشَّدَّة'], 2),
      mc('مَا اسْمُ الحَرَكَةِ التِي تُشْبِهُ الوَاوَ الصَّغِيرَة؟ أُ', ['الفَتْحَة', 'الضَّمَّة', 'الكَسْرَة', 'السُّكُون'], 1),
      listenImg('اسْتَمِعْ وَحَدِّدِ الحَرَكَة', 'بَ',
        [{ emoji: 'بَ', label: 'فَتْحَة' }, { emoji: 'بِ', label: 'كَسْرَة' }, { emoji: 'بُ', label: 'ضَمَّة' }], 0),
      listenImg('اسْتَمِعْ وَحَدِّدِ الحَرَكَة', 'نِ',
        [{ emoji: 'نَ', label: 'فَتْحَة' }, { emoji: 'نِ', label: 'كَسْرَة' }, { emoji: 'نُ', label: 'ضَمَّة' }], 1),
      tapPairs('صِلِ الكَلِمَةَ بِالحَرَكَةِ الصَّحِيحَة', [
        { arabic: 'أَبٌ 👨', match: 'فَتْحَة عَلَى الأَلِف' },
        { arabic: 'بِنْتٌ 👧', match: 'كَسْرَة عَلَى البَاء' },
        { arabic: 'أُمٌّ 👩', match: 'ضَمَّة عَلَى الأَلِف' },
      ]),
      sortGroups('صَنِّفِ الكَلِمَاتِ حَسَبَ حَرَكَةِ حَرْفِهَا الأَوَّل', [
        { label: 'فَتْحَة (أَ)', items: ['أَسَدٌ 🦁', 'أَبٌ 👨', 'أَرْنَبٌ 🐇'] },
        { label: 'كَسْرَة (إِ)', items: ['إِبْرَةٌ 🪡', 'إِصْبَعٌ 👆'] },
        { label: 'ضَمَّة (أُ)', items: ['أُمٌّ 👩', 'أُسْتَاذٌ 👨‍🏫'] },
      ]),
      flashcard('الحَرَكَات', 'فَتْحَة: أَ (فَوْق) ✦\nكَسْرَة: إِ (تَحْت) ✦\nضَمَّة: أُ (وَاو صَغِيرَة) ✦'),
    ],
  },
  {
    id: 'ar1-u1-l6', title: 'السُّكُون وَالشَّدَّة', unitId: 'ar1-u1', order: 6, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('مَاذَا يَعْنِي السُّكُون؟', ['الحَرْفُ مَفْتُوح', 'الحَرْفُ مَكْسُور', 'الحَرْفُ سَاكِن بِلَا صَوْت', 'الحَرْفُ مُشَدَّد'], 2),
      mc('الشَّدَّة تَعْنِي أَنَّ الحَرْفَ...',
        ['يُنْطَقُ مَرَّةً وَاحِدَة', 'يُنْطَقُ مَرَّتَيْن بِقُوَّة', 'لَا يُنْطَق', 'يُنْطَقُ بِصَوْتٍ خَافِت'], 1),
      listenImg('اسْتَمِعْ: أَيُّ كَلِمَةٍ تَحْتَوِي عَلَى الشَّدَّة؟', 'أُمٌّ',
        [{ emoji: '👩', label: 'أُمٌّ (مُشَدَّدَة)' }, { emoji: '👨', label: 'أَبٌ' }, { emoji: '👦', label: 'أَخٌ' }], 0),
      tf('كَلِمَةُ "أُمٌّ" تَحْتَوِي عَلَى شَدَّة 👩', true, 'صَحِيحٌ! المِيم مُشَدَّدَة فِي "أُمٌّ"'),
      tapPairs('صِلِ الكَلِمَةَ بِمَا تَحْتَوِيه', [
        { arabic: 'بَيْتٌ 🏠', match: 'سُكُون' },
        { arabic: 'أُمٌّ 👩', match: 'شَدَّة' },
        { arabic: 'نَجْمٌ ⭐', match: 'تَنْوِين' },
      ]),
      mc('فِي كَلِمَةِ "بَيْتٌ" — حَرْفُ "يْ" عَلَيْهِ...', ['فَتْحَة', 'كَسْرَة', 'سُكُون', 'شَدَّة'], 2),
      listenChoice('أُمٌّ', ['شَدَّة ✅', 'سُكُون ❌', 'تَنْوِين ❌'], 0),
      flashcard('السُّكُون ✦ الشَّدَّة', 'سُكُون: بَيْ ت (الياء سَاكِنَة)\nشَدَّة: أُ مّ (الميم مُضَاعَفَة)'),
    ],
  },
  {
    id: 'ar1-u1-l7', title: 'كَلِمَاتٌ بِأَ، بَ، تَ، ثَ، نَ', unitId: 'ar1-u1', order: 7, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🦁', word: 'أَسَدٌ' }, { image: '🏠', word: 'بَيْتٌ' },
        { image: '🍎', word: 'تُفَّاحَةٌ' }, { image: '⭐', word: 'نَجْمٌ' },
      ]),
      wordOrder('رَتِّبِ الكَلِمَاتِ', ['بَيْتِي', 'هَذَا', 'جَمِيلٌ'], 'هَذَا بَيْتِي جَمِيلٌ'),
      fbChoice('___ أَسَدٌ كَبِيرٌ', ['هَذَا', 'هَذِهِ', 'هِيَ'], 0, '🦁'),
      fbChoice('التُّفَّاحَةُ لَوْنُهَا ___', ['أَحْمَرُ', 'أَزْرَقُ', 'أَصْفَرُ'], 0, '🍎'),
      tf('النَّجْمُ يَظْهَرُ فِي السَّمَاء لَيْلاً ⭐', true),
      sortGroups('صَنِّفِ الكَلِمَاتِ حَسَبَ حَرْفِهَا الأَوَّل', [
        { label: 'أَ', items: ['أَسَدٌ 🦁', 'أُمٌّ 👩', 'أَرْنَبٌ 🐇'] },
        { label: 'بَ', items: ['بَيْتٌ 🏠', 'بَقَرَةٌ 🐄'] },
        { label: 'نَ', items: ['نَجْمٌ ⭐', 'نَمِرٌ 🐯'] },
      ]),
      readAloud('أَنَا أُحِبُّ بَيْتِي', 'أنا أحب بيتي', 55),
      comprehension(
        'أَنَا نَادِيَة.\nعِنْدِي أَبٌ وَأُمٌّ وَأَخٌ.\nبَيْتُنَا كَبِيرٌ وَجَمِيلٌ. 🏠',
        'أَنَا نَادِيَة. عِنْدِي أَبٌ وَأُمٌّ وَأَخٌ. بَيْتُنَا كَبِيرٌ وَجَمِيلٌ.',
        [
          { q: 'مَا اسْمُ البِنْت؟', options: ['نَادِيَة 👧', 'سَارَة 👧', 'مَرْيَم 👧'], correct: 0 },
          { q: 'كَمْ فَرْداً فِي العَائِلَة؟', options: ['اثْنَانِ', 'ثَلَاثَة', 'أَرْبَعَة'], correct: 2 },
        ],
      ),
    ],
  },
];

// ─── UNIT 2: ج، ح، خ ─────────────────────────────────────────────────────────
export const UNIT2_LESSONS = [
  {
    id: 'ar1-u2-l1', title: 'حَرْفُ الجِيم (ج)', unitId: 'ar1-u2', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِـ "ج"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ الجِيم',
        [{ emoji: '🐪', label: 'جَمَلٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🍎', label: 'تُفَّاحَةٌ' }, { emoji: '⭐', label: 'نَجْمٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصَّحِيح', 'جَمَلٌ',
        [{ emoji: '🐪', label: 'جَمَلٌ' }, { emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐯', label: 'نَمِرٌ' }], 0),
      mc('أَيُّ كَلِمَةٍ تَنْتَهِي بِـ "ج"؟', ['بَيْتٌ', 'دِيكٌ', 'تَاجٌ', 'قَلَمٌ'], 2),
      tf('حَرْفُ "ج" يُشْبِهُ الخُطَّافَ وَلَهُ نُقْطَةٌ دَاخِلَه', true),
      sortGroups('صَنِّفِ الكَلِمَاتِ', [
        { label: 'تَبْدَأُ بِـ جَ', items: ['جَمَلٌ 🐪', 'جَبَلٌ ⛰️', 'جَزِيرَةٌ 🏝️'] },
        { label: 'لَا تَبْدَأُ بِـ جَ', items: ['بَيْتٌ 🏠', 'نَجْمٌ ⭐', 'أَسَدٌ 🦁'] },
      ]),
      fbChoice('الجَمَلُ حَيَوَانٌ ___ يَعِيشُ فِي الصَّحْرَاء', ['كَبِيرٌ', 'صَغِيرٌ', 'أَزْرَقُ'], 0, '🐪'),
      listenWrite('اسْتَمِعْ وَاكْتُبِ الحَرْفَ الأَوَّل', 'جَزِيرَة', 'ج'),
      flashcard('ج', 'جَمَلٌ 🐪\nجَبَلٌ ⛰️\nجَزِيرَةٌ 🏝️\nتَاجٌ 👑'),
    ],
  },
  {
    id: 'ar1-u2-l2', title: 'حَرْفَا الحَاء وَالخَاء (ح خ)', unitId: 'ar1-u2', order: 2, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَا الفَرْقُ بَيْنَ "ح" وَ"خ"؟', ['الشَّكْل', 'النُّقْطَة — خ لَهَا نُقْطَة', 'الصَّوْت فَقَط', 'لَا فَرْق'], 1),
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِـ "ح"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ الحَاء',
        [{ emoji: '🐴', label: 'حِصَانٌ' }, { emoji: '🐪', label: 'جَمَلٌ' }, { emoji: '🦊', label: 'ثَعْلَبٌ' }, { emoji: '🐘', label: 'فِيلٌ' }], 0),
      imgMatch('صِلْ كُلَّ حَرْفٍ بِكَلِمَتِه', [
        { image: 'حَ', word: 'حِصَانٌ 🐴' }, { image: 'خَ', word: 'خَيْمَةٌ ⛺' },
        { image: 'جَ', word: 'جَمَلٌ 🐪' },
      ]),
      tf('"خ" لَهَا نُقْطَةٌ فَوْقَهَا وَ"ح" لَيْسَ لَهَا نُقْطَة', true),
      tapPairs('صِلِ الحَرْفَ بِالكَلِمَة', [
        { arabic: 'ح', match: 'حِصَانٌ 🐴' },
        { arabic: 'خ', match: 'خُبْزٌ 🍞' },
        { arabic: 'ج', match: 'جَمَلٌ 🐪' },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَر', 'خِيَارٌ',
        [{ emoji: '🥒', label: 'خِيَارٌ' }, { emoji: '🥕', label: 'جَزَرٌ' }, { emoji: '🍅', label: 'طَمَاطِم' }], 0),
      fbChoice('الحِصَانُ حَيَوَانٌ ___ يُحِبُّ الجَرْي', ['سَرِيعٌ', 'بَطِيءٌ', 'ضَخْمٌ'], 0, '🐴'),
      flashcard('ح — خ', 'ح: حِصَانٌ 🐴 (بِلَا نُقْطَة)\nخ: خِيَارٌ 🥒 (بِنُقْطَة فَوْق)'),
    ],
  },
];

// ─── UNIT 3: د ذ، ر ز، و ─────────────────────────────────────────────────────
export const UNIT3_LESSONS = [
  {
    id: 'ar1-u3-l1', title: 'حَرْفَا الدَّال وَالذَّال (د ذ)', unitId: 'ar1-u3', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَا الفَرْقُ بَيْنَ "د" وَ"ذ"؟', ['الحَجْم', 'ذَ لَهَا نُقْطَة فَوْقَهَا', 'الشَّكْل كُلِّيّاً', 'لَا فَرْق'], 1),
      imgChoice('أَيُّ الكَلِمَاتِ تَبْدَأُ بِـ "د"؟', 'أَيُّ الكَلِمَاتِ تَبْدَأُ بِحَرْفِ الدَّال',
        [{ emoji: '🐔', label: 'دَجَاجَةٌ' }, { emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🦊', label: 'ثَعْلَبٌ' }, { emoji: '🍎', label: 'تُفَّاحَةٌ' }], 0),
      tf('"ذ" تَبْدَأُ بِهَا كَلِمَةُ "ذِئْبٌ"', true),
      sortGroups('صَنِّفِ الكَلِمَاتِ', [
        { label: 'دَ', items: ['دَجَاجَةٌ 🐔', 'دُبٌّ 🐻', 'دَرَّاجَةٌ 🚲'] },
        { label: 'ذَ', items: ['ذِئْبٌ 🐺', 'ذَهَبٌ 🥇', 'ذِرَاعٌ 💪'] },
      ]),
      tapPairs('صِلِ الحَرْفَ بِالكَلِمَة', [
        { arabic: 'د', match: 'دُبٌّ 🐻' },
        { arabic: 'ذ', match: 'ذِئْبٌ 🐺' },
        { arabic: 'ج', match: 'جَمَلٌ 🐪' },
      ]),
      fbChoice('الدُّبُّ حَيَوَانٌ ___ يُحِبُّ العَسَل', ['كَبِيرٌ', 'صَغِيرٌ', 'سَرِيعٌ'], 0, '🐻'),
      listenWrite('اسْتَمِعْ وَاكْتُبِ الحَرْفَ الأَوَّل', 'ذِئْبٌ', 'ذ'),
      flashcard('د — ذ', 'د: دَجَاجَةٌ 🐔 (بِلَا نُقْطَة)\nذ: ذِئْبٌ 🐺 (بِنُقْطَة فَوْق)'),
    ],
  },
];

// ─── UNIT 4: أَنَا وَعَائِلَتِي ──────────────────────────────────────────────────
export const UNIT4_LESSONS = [
  {
    id: 'ar1-u4-l1', title: 'أَبٌ وَأُمٌّ', unitId: 'ar1-u4', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَنْ هَذَا؟', 'أَبٌ',
        [{ emoji: '👨', label: 'أَبٌ' }, { emoji: '👧', label: 'أُخْتٌ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '👵', label: 'جَدَّةٌ' }], 0),
      imgChoice('مَنْ هَذِهِ؟', 'أُمٌّ',
        [{ emoji: '👩', label: 'أُمٌّ' }, { emoji: '👴', label: 'جَدٌّ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '👧', label: 'أُخْتٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '👨', word: 'أَبٌ' }, { image: '👩', word: 'أُمٌّ' },
        { image: '👴', word: 'جَدٌّ' }, { image: '👵', word: 'جَدَّةٌ' },
      ]),
      mc('مَنْ هُوَ وَالِدُكَ؟', ['أَبِي 👨', 'أَخِي 👦', 'جَدِّي 👴', 'عَمِّي'], 0),
      tf('أَبِي هُوَ وَالِدِي 👨', true, 'صَحِيحٌ! الأَبُ هُوَ الوَالِدُ ✅'),
      tapPairs('صِلِ الكَلِمَةَ بِالصُّورَة', [
        { arabic: 'أَبٌ', match: '👨' },
        { arabic: 'أُمٌّ', match: '👩' },
        { arabic: 'جَدٌّ', match: '👴' },
        { arabic: 'جَدَّةٌ', match: '👵' },
      ]),
      flashcard('أَبٌ 👨 + أُمٌّ 👩', 'هَذَانِ وَالِدَايَ 💙'),
    ],
  },
  {
    id: 'ar1-u4-l2', title: 'أَخٌ وَأُخْتٌ', unitId: 'ar1-u4', order: 2, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَنْ هَذَا؟', 'أَخٌ',
        [{ emoji: '👦', label: 'أَخٌ' }, { emoji: '👧', label: 'أُخْتٌ' }, { emoji: '👨', label: 'أَبٌ' }, { emoji: '👴', label: 'جَدٌّ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَة الصَّحِيحَة', 'أُخْتٌ',
        [{ emoji: '👧', label: 'أُخْتٌ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '👩', label: 'أُمٌّ' }, { emoji: '👵', label: 'جَدَّةٌ' }], 0),
      tapPairs('صِلِ الكَلِمَةَ بِصُورَتِهَا', [
        { arabic: 'أَخٌ', match: '👦' },
        { arabic: 'أُخْتٌ', match: '👧' },
        { arabic: 'أَبٌ', match: '👨' },
        { arabic: 'أُمٌّ', match: '👩' },
      ]),
      mc('مَنْ هِيَ أُخْتُكَ؟', ['بِنْتٌ مِنْ نَفْسِ العَائِلَة 👧', 'وَلَدٌ مِنْ نَفْسِ العَائِلَة 👦', 'أُمِّي 👩', 'جَدَّتِي 👵'], 0),
      fbChoice('عِنْدِي ___ صَغِيرٌ يَلْعَبُ مَعِي', ['أَخٌ 👦', 'جَدٌّ 👴', 'أَبٌ 👨'], 0, '👦'),
      imgMatch('صِلْ كُلَّ شَخْصٍ بِاسْمِه', [
        { image: '👦', word: 'أَخٌ' }, { image: '👧', word: 'أُخْتٌ' },
        { image: '👨', word: 'أَبٌ' }, { image: '👩', word: 'أُمٌّ' },
      ]),
      tf('الأَخُ وَلَدٌ مِنْ نَفْسِ العَائِلَة 👦', true),
    ],
  },
  {
    id: 'ar1-u4-l3', title: 'جَدٌّ وَجَدَّةٌ', unitId: 'ar1-u4', order: 3, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَنْ هُوَ أَبُو أَبِيكَ؟', ['جَدِّي 👴', 'أَخِي 👦', 'عَمِّي', 'أَبِي 👨'], 0),
      imgChoice('مَنْ هَذِهِ؟', 'جَدَّةٌ',
        [{ emoji: '👵', label: 'جَدَّةٌ' }, { emoji: '👩', label: 'أُمٌّ' }, { emoji: '👧', label: 'أُخْتٌ' }, { emoji: '👶', label: 'طِفْلَةٌ' }], 0),
      listenImg('اسْتَمِعْ: مَنْ هَذَا؟', 'جَدٌّ',
        [{ emoji: '👴', label: 'جَدٌّ' }, { emoji: '👨', label: 'أَبٌ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '🧑', label: 'شَابٌّ' }], 0),
      imgMatch('صِلْ كُلَّ شَخْصٍ بِاسْمِه', [
        { image: '👴', word: 'جَدٌّ' }, { image: '👵', word: 'جَدَّةٌ' },
        { image: '👨', word: 'أَبٌ' }, { image: '👩', word: 'أُمٌّ' },
      ]),
      tf('الجَدُّ هُوَ أَبُو الأَب 👴', true, 'صَحِيحٌ! ✅'),
      sortGroups('صَنِّفِ أَفْرَادَ العَائِلَة', [
        { label: 'رِجَالٌ 👨', items: ['أَبٌ 👨', 'أَخٌ 👦', 'جَدٌّ 👴'] },
        { label: 'نِسَاءٌ 👩', items: ['أُمٌّ 👩', 'أُخْتٌ 👧', 'جَدَّةٌ 👵'] },
      ]),
      flashcard('جَدٌّ 👴 + جَدَّةٌ 👵', 'وَالِدَا أَبِي أَوْ أُمِّي 💛'),
    ],
  },
  {
    id: 'ar1-u4-l4', title: 'بَيْتُنَا', unitId: 'ar1-u4', order: 4, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا هَذَا؟', 'بَيْتٌ',
        [{ emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🏫', label: 'مَدْرَسَةٌ' }, { emoji: '🏥', label: 'مُسْتَشْفَى' }, { emoji: '🕌', label: 'مَسْجِدٌ' }], 0),
      fbChoice('بَيْتُنَا ___ وَجَمِيلٌ', ['كَبِيرٌ 🏠', 'صَغِيرٌ', 'حَزِينٌ'], 0, '🏠'),
      wordOrder('رَتِّبِ الكَلِمَاتِ لِتُكَوِّنَ جُمْلَة', ['كَبِيرٌ', 'بَيْتُنَا', 'هَذَا'], 'هَذَا بَيْتُنَا كَبِيرٌ'),
      mc('أَيْنَ تَسْكُنُ العَائِلَةُ؟', ['فِي البَيْتِ 🏠', 'فِي المَدْرَسَة 🏫', 'فِي الحَدِيقَة 🌳', 'فِي المَسْجِد 🕌'], 0),
      tf('نَسْكُنُ فِي بَيْتِنَا مَعَ عَائِلَتِنَا 🏠', true),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَة الصَّحِيحَة', 'بَيْتٌ كَبِيرٌ',
        [{ emoji: '🏠', label: 'بَيْتٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🌳', label: 'شَجَرَةٌ' }, { emoji: '🚗', label: 'سَيَّارَةٌ' }], 0),
    ],
  },
  {
    id: 'ar1-u4-l5', title: 'هَذَا أَبِي', unitId: 'ar1-u4', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      flashcard('هَذَا أَبِي 👨', 'نَقُولُهَا لِنُعَرِّفَ بِالأَب'),
      readAloud('هَذَا أَبِي. هُوَ طَيِّبٌ 👨', 'هَذَا أَبِي هُوَ طَيِّبٌ', 55),
      tf('نَقُولُ "هَذَا أَبِي" وَلَيْسَ "هَذِهِ أَبِي" 👨', true),
      tf('نَقُولُ "هَذِهِ أُمِّي" لِأَنَّ "أُمّ" مُؤَنَّثَة 👩', true),
      mc('كَيْفَ نُقَدِّمُ أُمَّنَا؟', ['هَذِهِ أُمِّي 👩', 'هَذَا أُمِّي', 'هَذَا أَبِي'], 0),
      fbChoice('___ أَبِي. هُوَ مُهَنْدِسٌ 👷', ['هَذَا', 'هَذِهِ', 'هَؤُلَاء'], 0, '👨'),
      speak('هَذَا أَبِي وَهَذِهِ أُمِّي', '👨👩', 50),
    ],
  },
  {
    id: 'ar1-u4-l6', title: 'أُحِبُّ عَائِلَتِي', unitId: 'ar1-u4', order: 6, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('مَاذَا نَقُولُ لِعَائِلَتِنَا؟', ['أُحِبُّكُمْ 💙', 'لَا أُرِيدُكُمْ', 'أَنَا خَائِفٌ', 'اتْرُكُونِي'], 0),
      speak('أُحِبُّ عَائِلَتِي 👨‍👩‍👧‍👦', '💙', 50),
      fbChoice('أَنَا ___ عَائِلَتِي كَثِيراً', ['أُحِبُّ 💙', 'أَكْرَهُ', 'أَخَافُ'], 0, '👨‍👩‍👧‍👦'),
      wordOrder('رَتِّبِ الكَلِمَاتِ', ['عَائِلَتِي', 'أُحِبُّ', 'أَنَا', 'كَثِيراً'], 'أَنَا أُحِبُّ عَائِلَتِي كَثِيراً'),
      listenImg('اسْتَمِعْ: مَا المَشَاعِر؟', 'أُحِبُّ أُمِّي',
        [{ emoji: '💙', label: 'مَحَبَّة' }, { emoji: '😡', label: 'غَضَب' }, { emoji: '😢', label: 'حُزْن' }, { emoji: '😱', label: 'خَوْف' }], 0),
      tf('نُحِبُّ عَائِلَتَنَا لِأَنَّهَا تُحِبُّنَا وَتَهْتَمُّ بِنَا 💙', true),
    ],
  },
  {
    id: 'ar1-u4-l7', title: 'عَائِلَتِي كَبِيرَةٌ', unitId: 'ar1-u4', order: 7, xpReward: 20, estimatedMinutes: 12,
    questions: [
      sortGroups('صَنِّفِ أَفْرَادَ العَائِلَة', [
        { label: 'كِبَارٌ 👨', items: ['أَبٌ 👨', 'أُمٌّ 👩', 'جَدٌّ 👴', 'جَدَّةٌ 👵'] },
        { label: 'صِغَارٌ 👦', items: ['أَخٌ 👦', 'أُخْتٌ 👧'] },
      ]),
      dragOrder('رَتِّبِ العَائِلَةَ مِنَ الأَصْغَرِ إِلَى الأَكْبَر', [
        { text: 'أُخْتٌ صَغِيرَةٌ 👧', order: 1 },
        { text: 'أَخٌ 👦', order: 2 },
        { text: 'أَبٌ 👨', order: 3 },
        { text: 'جَدٌّ 👴', order: 4 },
      ]),
      mc('عَائِلَةٌ كَبِيرَةٌ تَعْنِي؟', ['فِيهَا أَفْرَادٌ كَثِيرُون 👨‍👩‍👧‍👦', 'فِيهَا بَيْتٌ كَبِيرٌ', 'فِيهَا سَيَّارَةٌ كَبِيرَة', 'فِيهَا كَلْبٌ كَبِيرٌ'], 0),
      fbChoice('عَائِلَتِي ___ فِيهَا أَبٌ وَأُمٌّ وَأَخٌ وَأُخْتٌ', ['كَبِيرَةٌ 👨‍👩‍👧‍👦', 'صَغِيرَةٌ', 'حَزِينَةٌ'], 0, '👨‍👩‍👧‍👦'),
      imgMatch('صِلِ العَدَدَ بِأَفْرَادِ العَائِلَة', [
        { image: '1️⃣', word: 'فَرْدٌ وَاحِدٌ' }, { image: '2️⃣', word: 'فَرْدَانِ' },
        { image: '4️⃣', word: 'أَرْبَعَةُ أَفْرَاد' },
      ]),
      tf('عَائِلَتِي تَضُمُّ أَبِي وَأُمِّي وَإِخْوَتِي 👨‍👩‍👧‍👦', true),
    ],
  },
  {
    id: 'ar1-u4-l8', title: 'وَصْفُ العَائِلَةِ', unitId: 'ar1-u4', order: 8, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('كَيْفَ تَصِفُ أَبَاكَ؟', ['أَبِي طَيِّبٌ 👨', 'أَبِي شَجَرَةٌ', 'أَبِي كِتَابٌ', 'أَبِي سَيَّارَةٌ'], 0),
      translate('كَيْفَ نَقُولُ "ماما" بِالفُصْحَى؟', 'مَامَا', 'أُمٌّ', ['أُمٌّ', 'أَبٌ', 'أَخٌ', 'جَدَّةٌ'], '👩'),
      translate('كَيْفَ نَقُولُ "بابا" بِالفُصْحَى؟', 'بَابَا', 'أَبٌ', ['أَبٌ', 'أُمٌّ', 'أَخٌ', 'جَدٌّ'], '👨'),
      fbChoice('أُمِّي ___ وَأُحِبُّهَا كَثِيراً', ['جَمِيلَةٌ 👩', 'كَبِيرَةٌ', 'سَرِيعَةٌ'], 0, '👩'),
      readAloud('عَائِلَتِي سَعِيدَةٌ وَأَنَا سَعِيدٌ مَعَهَا 💙', 'عائلتي سعيدة وأنا سعيد معها', 50),
      wordOrder('رَتِّبِ الجُمْلَة', ['جَمِيلَةٌ', 'أُمِّي', 'طَيِّبَةٌ', 'وَ'], 'أُمِّي جَمِيلَةٌ وَطَيِّبَةٌ'),
    ],
  },
  {
    id: 'ar1-u4-l9', title: 'قِصَّةٌ: يَوْمٌ مَعَ العَائِلَة', unitId: 'ar1-u4', order: 9, xpReward: 30, estimatedMinutes: 15,
    questions: [
      comprehension(
        'أَنَا سَامِي. عِنْدِي أَبٌ وَأُمٌّ وَأُخْتٌ اسْمُهَا لَيْلَى.\nنَعِيشُ فِي بَيْتٍ كَبِيرٍ. أُحِبُّ عَائِلَتِي كَثِيراً. 💙',
        'أَنَا سَامِي. عِنْدِي أَبٌ وَأُمٌّ وَأُخْتٌ اسْمُهَا لَيْلَى. نَعِيشُ فِي بَيْتٍ كَبِيرٍ. أُحِبُّ عَائِلَتِي كَثِيراً.',
        [
          { q: 'مَا اسْمُ الوَلَد؟', options: ['سَامِي', 'مُحَمَّد', 'يُوسُف'], correct: 0 },
          { q: 'مَا اسْمُ أُخْتِه؟', options: ['لَيْلَى', 'سَارَة', 'نُور'], correct: 0 },
          { q: 'كَيْفَ بَيْتُهُم؟', options: ['كَبِيرٌ', 'صَغِيرٌ', 'قَدِيمٌ'], correct: 0 },
        ],
      ),
      imgMatch('مَنْ فِي عَائِلَةِ سَامِي؟', [
        { image: '👨', word: 'أَبٌ' }, { image: '👩', word: 'أُمٌّ' },
        { image: '👧', word: 'أُخْتٌ لَيْلَى' },
      ]),
      wordOrder('رَتِّبِ الجُمْلَة', ['عَائِلَتِي', 'أُحِبُّ', 'كَثِيراً'], 'أُحِبُّ عَائِلَتِي كَثِيراً'),
      speak('أُحِبُّ عَائِلَتِي 💙', '👨‍👩‍👧‍👦', 50),
    ],
  },
  {
    id: 'ar1-u4-l10', title: 'كُوِيزُ الوَحْدَةِ الرَّابِعَة — العَائِلَة', unitId: 'ar1-u4', order: 10, xpReward: 50, estimatedMinutes: 20,
    questions: [
      mc('مَنْ هُوَ وَالِدُكَ؟', ['أَبِي 👨', 'أَخِي 👦', 'جَدِّي 👴', 'عَمِّي'], 0),
      imgChoice('اخْتَرْ صُورَةَ الأُمّ', 'أُمٌّ',
        [{ emoji: '👩', label: 'أُمٌّ' }, { emoji: '👴', label: 'جَدٌّ' }, { emoji: '👦', label: 'أَخٌ' }, { emoji: '👧', label: 'أُخْتٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَر', 'جَدَّةٌ',
        [{ emoji: '👵', label: 'جَدَّةٌ' }, { emoji: '👩', label: 'أُمٌّ' }, { emoji: '👧', label: 'أُخْتٌ' }, { emoji: '🧑', label: 'شَابَّةٌ' }], 0),
      tapPairs('صِلِ الكَلِمَةَ بِصُورَتِهَا', [
        { arabic: 'أَبٌ', match: '👨' },
        { arabic: 'أُمٌّ', match: '👩' },
        { arabic: 'أَخٌ', match: '👦' },
        { arabic: 'أُخْتٌ', match: '👧' },
      ]),
      tf('الجَدَّةُ هِيَ أُمُّ الأُمّ 👵', true),
      imgMatch('صِلْ كُلَّ شَخْصٍ بِاسْمِه', [
        { image: '👴', word: 'جَدٌّ' }, { image: '👵', word: 'جَدَّةٌ' },
        { image: '🏠', word: 'بَيْتٌ' }, { image: '👨‍👩‍👧‍👦', word: 'عَائِلَةٌ' },
      ]),
      fbChoice('أَنَا ___ عَائِلَتِي كَثِيراً', ['أُحِبُّ 💙', 'أَكْرَهُ', 'أَخَافُ'], 0, '💙'),
      wordOrder('رَتِّبِ الجُمْلَة', ['طَيِّبَةٌ', 'أُمِّي', 'جَمِيلَةٌ', 'وَ'], 'أُمِّي طَيِّبَةٌ وَجَمِيلَةٌ'),
      sortGroups('صَنِّفِ أَفْرَادَ العَائِلَة', [
        { label: 'رِجَالٌ 👨', items: ['أَبٌ 👨', 'أَخٌ 👦', 'جَدٌّ 👴'] },
        { label: 'نِسَاءٌ 👩', items: ['أُمٌّ 👩', 'أُخْتٌ 👧', 'جَدَّةٌ 👵'] },
      ]),
      comprehension(
        'بَيْتُنَا كَبِيرٌ. نَعِيشُ فِيهِ مَعَ الجَدِّ وَالجَدَّة.\nنَحْنُ عَائِلَةٌ سَعِيدَةٌ. 🏠💙',
        'بَيْتُنَا كَبِيرٌ. نَعِيشُ فِيهِ مَعَ الجَدِّ وَالجَدَّة. نَحْنُ عَائِلَةٌ سَعِيدَةٌ.',
        [
          { q: 'كَيْفَ بَيْتُهُم؟', options: ['كَبِيرٌ', 'صَغِيرٌ', 'قَدِيمٌ'], correct: 0 },
          { q: 'كَيْفَ العَائِلَة؟', options: ['سَعِيدَةٌ', 'حَزِينَةٌ', 'مَرِيضَةٌ'], correct: 0 },
        ],
      ),
      readAloud('عَائِلَتِي سَعِيدَةٌ. أَنَا سَعِيدٌ مَعَهَا. 💙', 'عائلتي سعيدة أنا سعيد معها', 50),
      speak('أُحِبُّ أَبِي وَأُمِّي 💙', '👨👩', 50),
    ],
  },
];

// ─── UNIT 5: الأَلْوَانُ وَالأَرْقَام ─────────────────────────────────────────────
export const UNIT5_LESSONS = [
  {
    id: 'ar1-u5-l1', title: 'أَلْوَانٌ دَافِئَةٌ', unitId: 'ar1-u5', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا لَوْنُ التُّفَّاحَة؟ 🍎', 'أَحْمَرُ',
        [{ emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🟢', label: 'أَخْضَرُ' }, { emoji: '🟡', label: 'أَصْفَرُ' }], 0),
      imgChoice('مَا لَوْنُ الشَّمْسِ؟ ☀️', 'أَصْفَرُ',
        [{ emoji: '🟡', label: 'أَصْفَرُ' }, { emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🟠', label: 'بُرْتُقَالِيٌّ' }, { emoji: '⬜', label: 'أَبْيَضُ' }], 0),
      tapPairs('صِلِ اللَّوْنَ بِالشَّيء', [
        { arabic: 'أَحْمَرُ 🔴', match: 'تُفَّاحَةٌ 🍎' },
        { arabic: 'أَصْفَرُ 🟡', match: 'شَمْسٌ ☀️' },
        { arabic: 'بُرْتُقَالِيٌّ 🟠', match: 'بُرْتُقَالَةٌ 🍊' },
      ]),
      mc('مَا لَوْنُ المَوْزَة؟ 🍌', ['أَصْفَرُ 🟡', 'أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَخْضَرُ 🟢'], 0),
      fbChoice('التُّفَّاحَةُ ___ اللَّوْن', ['حَمْرَاءُ 🔴', 'زَرْقَاءُ 🔵', 'خَضْرَاءُ 🟢'], 0, '🍎'),
      listenImg('اسْتَمِعْ وَاخْتَرِ اللَّوْن الصَّحِيح', 'أَحْمَرُ',
        [{ emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🟢', label: 'أَخْضَرُ' }, { emoji: '🟡', label: 'أَصْفَرُ' }], 0),
    ],
  },
  {
    id: 'ar1-u5-l2', title: 'أَلْوَانٌ بَارِدَةٌ', unitId: 'ar1-u5', order: 2, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا لَوْنُ السَّمَاء؟ 🌤️', 'أَزْرَقُ',
        [{ emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🟢', label: 'أَخْضَرُ' }, { emoji: '⬛', label: 'أَسْوَدُ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ اللَّوْن', 'أَخْضَرُ',
        [{ emoji: '🟢', label: 'أَخْضَرُ' }, { emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🟡', label: 'أَصْفَرُ' }, { emoji: '🟣', label: 'بَنَفْسَجِيٌّ' }], 0),
      tapPairs('صِلِ اللَّوْنَ بِالشَّيء', [
        { arabic: 'أَزْرَقُ 🔵', match: 'سَمَاءٌ 🌤️' },
        { arabic: 'أَخْضَرُ 🟢', match: 'شَجَرَةٌ 🌳' },
        { arabic: 'بَنَفْسَجِيٌّ 🟣', match: 'عِنَبٌ 🍇' },
      ]),
      mc('مَا لَوْنُ الشَّجَرَة؟ 🌳', ['أَخْضَرُ 🟢', 'أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَبْيَضُ ⬜'], 0),
      fbChoice('السَّمَاءُ ___ اللَّوْن', ['زَرْقَاءُ 🔵', 'حَمْرَاءُ 🔴', 'صَفْرَاءُ 🟡'], 0, '🌤️'),
      sortGroups('صَنِّفِ الأَلْوَان', [
        { label: 'دَافِئَةٌ 🔥', items: ['أَحْمَرُ 🔴', 'أَصْفَرُ 🟡', 'بُرْتُقَالِيٌّ 🟠'] },
        { label: 'بَارِدَةٌ ❄️', items: ['أَزْرَقُ 🔵', 'أَخْضَرُ 🟢', 'بَنَفْسَجِيٌّ 🟣'] },
      ]),
    ],
  },
  {
    id: 'ar1-u5-l3', title: 'لَوْنُ كُلِّ شَيْء', unitId: 'ar1-u5', order: 3, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَا لَوْنُ الثَّلْج؟ ❄️', ['أَبْيَضُ ⬜', 'أَسْوَدُ ⬛', 'أَزْرَقُ 🔵', 'أَحْمَرُ 🔴'], 0),
      mc('مَا لَوْنُ اللَّيْل؟ 🌙', ['أَسْوَدُ ⬛', 'أَبْيَضُ ⬜', 'أَصْفَرُ 🟡', 'أَخْضَرُ 🟢'], 0),
      imgMatch('صِلِ الشَّيءَ بِلَوْنِه', [
        { image: '🍎', word: 'أَحْمَرُ 🔴' }, { image: '🌤️', word: 'أَزْرَقُ 🔵' },
        { image: '🌳', word: 'أَخْضَرُ 🟢' }, { image: '☀️', word: 'أَصْفَرُ 🟡' },
      ]),
      sortGroups('صَنِّفِ الأَشْيَاء حَسَبَ لَوْنِهَا', [
        { label: 'أَحْمَرُ 🔴', items: ['تُفَّاحَةٌ 🍎', 'قَلْبٌ ❤️', 'وَرْدَةٌ 🌹'] },
        { label: 'أَصْفَرُ 🟡', items: ['شَمْسٌ ☀️', 'مَوْزَةٌ 🍌', 'نَجْمَةٌ ⭐'] },
      ]),
      tf('الثَّلْجُ أَبْيَضُ ❄️', true),
      listenChoice('اللَّيْلُ أَسْوَدُ',
        ['أَسْوَدُ ⬛', 'أَبْيَضُ ⬜', 'أَزْرَقُ 🔵', 'أَحْمَرُ 🔴'], 0),
    ],
  },
  {
    id: 'ar1-u5-l4', title: 'أَرْقَامٌ ١–٥', unitId: 'ar1-u5', order: 4, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgMatch('صِلِ الرَّقْمَ بِاسْمِه', [
        { image: '1️⃣', word: 'وَاحِدٌ' }, { image: '2️⃣', word: 'اثْنَانِ' },
        { image: '3️⃣', word: 'ثَلَاثَةٌ' }, { image: '4️⃣', word: 'أَرْبَعَةٌ' },
      ]),
      dragOrder('رَتِّبِ الأَرْقَامَ مِنَ الأَصْغَرِ إِلَى الأَكْبَر', [
        { text: '3️⃣ ثَلَاثَةٌ', order: 3 },
        { text: '1️⃣ وَاحِدٌ', order: 1 },
        { text: '5️⃣ خَمْسَةٌ', order: 5 },
        { text: '2️⃣ اثْنَانِ', order: 2 },
        { text: '4️⃣ أَرْبَعَةٌ', order: 4 },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الرَّقْم الصَّحِيح', 'ثَلَاثَةٌ',
        [{ emoji: '3️⃣', label: 'ثَلَاثَةٌ' }, { emoji: '1️⃣', label: 'وَاحِدٌ' }, { emoji: '5️⃣', label: 'خَمْسَةٌ' }, { emoji: '2️⃣', label: 'اثْنَانِ' }], 0),
      mc('مَا الذِي يَأْتِي بَعْدَ ثَلَاثَة؟', ['أَرْبَعَةٌ 4️⃣', 'خَمْسَةٌ 5️⃣', 'اثْنَانِ 2️⃣', 'وَاحِدٌ 1️⃣'], 0),
      fbChoice('١ + ١ = ___', ['اثْنَانِ 2️⃣', 'ثَلَاثَةٌ 3️⃣', 'وَاحِدٌ 1️⃣'], 0, '➕'),
      flashcard('١ وَاحِدٌ، ٢ اثْنَانِ، ٣ ثَلَاثَةٌ', '٤ أَرْبَعَةٌ، ٥ خَمْسَةٌ'),
    ],
  },
  {
    id: 'ar1-u5-l5', title: 'أَرْقَامٌ ٦–١٠', unitId: 'ar1-u5', order: 5, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا هَذَا الرَّقْم؟ 8️⃣', 'ثَمَانِيَةٌ',
        [{ emoji: '8️⃣', label: 'ثَمَانِيَةٌ' }, { emoji: '6️⃣', label: 'سِتَّةٌ' }, { emoji: '7️⃣', label: 'سَبْعَةٌ' }, { emoji: '9️⃣', label: 'تِسْعَةٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الرَّقْم', 'سِتَّةٌ',
        [{ emoji: '6️⃣', label: 'سِتَّةٌ' }, { emoji: '7️⃣', label: 'سَبْعَةٌ' }, { emoji: '8️⃣', label: 'ثَمَانِيَةٌ' }, { emoji: '9️⃣', label: 'تِسْعَةٌ' }], 0),
      imgMatch('صِلِ الرَّقْمَ بِاسْمِه', [
        { image: '6️⃣', word: 'سِتَّةٌ' }, { image: '7️⃣', word: 'سَبْعَةٌ' },
        { image: '9️⃣', word: 'تِسْعَةٌ' }, { image: '🔟', word: 'عَشَرَةٌ' },
      ]),
      mc('مَا الذِي يَأْتِي بَعْدَ تِسْعَة؟', ['عَشَرَةٌ 🔟', 'ثَمَانِيَةٌ 8️⃣', 'سَبْعَةٌ 7️⃣', 'أَحَدَ عَشَر'], 0),
      tf('عَشَرَةٌ أَكْبَرُ مِنْ خَمْسَة 🔟 > 5️⃣', true),
      dragOrder('رَتِّبِ الأَرْقَامَ مِنَ الأَصْغَرِ إِلَى الأَكْبَر', [
        { text: '9️⃣ تِسْعَةٌ', order: 9 },
        { text: '6️⃣ سِتَّةٌ', order: 6 },
        { text: '🔟 عَشَرَةٌ', order: 10 },
        { text: '7️⃣ سَبْعَةٌ', order: 7 },
      ]),
    ],
  },
  {
    id: 'ar1-u5-l6', title: 'عُدَّ وَاكْتُبْ', unitId: 'ar1-u5', order: 6, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('كَمْ أَصْبُعاً فِي يَدٍ وَاحِدَة؟ 🖐️', ['خَمْسَةٌ 5️⃣', 'أَرْبَعَةٌ 4️⃣', 'سِتَّةٌ 6️⃣', 'ثَلَاثَةٌ 3️⃣'], 0),
      fbChoice('🍎🍎🍎 = ___ تُفَّاحَات', ['ثَلَاثَةٌ 3️⃣', 'اثْنَانِ 2️⃣', 'أَرْبَعَةٌ 4️⃣'], 0, '🍎'),
      fbChoice('✏️✏️ = ___ قَلَمَيْن', ['اثْنَانِ 2️⃣', 'ثَلَاثَةٌ 3️⃣', 'وَاحِدٌ 1️⃣'], 0, '✏️'),
      speak('وَاحِدٌ اثْنَانِ ثَلَاثَةٌ أَرْبَعَةٌ خَمْسَةٌ', '🔢', 50),
      wordOrder('رَتِّبِ الجُمْلَة', ['أَقْلَامٍ', 'ثَلَاثَةُ', 'عِنْدِي'], 'عِنْدِي ثَلَاثَةُ أَقْلَامٍ'),
      tf('اثْنَانِ + اثْنَانِ = أَرْبَعَةٌ ✅', true),
    ],
  },
  {
    id: 'ar1-u5-l7', title: 'لَوْنٌ وَعَدَدٌ مَعاً', unitId: 'ar1-u5', order: 7, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('كَمْ كُرَةً؟ 🔵🔵🔵🔵', ['أَرْبَعَةٌ 4️⃣', 'ثَلَاثَةٌ 3️⃣', 'خَمْسَةٌ 5️⃣', 'اثْنَانِ 2️⃣'], 0),
      wordOrder('رَتِّبِ الجُمْلَة', ['صَفْرَاءَ', 'ثَلَاثُ', 'نُجُومٍ', 'هَذِهِ'], 'هَذِهِ ثَلَاثُ نُجُومٍ صَفْرَاءَ'),
      tf('🔴🔴 = اثْنَتَانِ حَمْرَاوَانِ ✅', true),
      fbChoice('عِنْدِي خَمْسُ كُرَاتٍ ___ اللَّوْن', ['زَرْقَاءُ 🔵', 'أَسْوَدُ ⬛', 'بَيْضَاءُ ⬜'], 0, '🔵'),
      imgMatch('صِلِ العَدَدَ بِالأَشْيَاء', [
        { image: '3️⃣', word: '🌹🌹🌹' }, { image: '2️⃣', word: '⭐⭐' },
        { image: '4️⃣', word: '🍎🍎🍎🍎' },
      ]),
      listenChoice('خَمْسُ نُجُومٍ صَفْرَاء',
        ['خَمْسَةٌ 5️⃣', 'أَرْبَعَةٌ 4️⃣', 'ثَلَاثَةٌ 3️⃣', 'سِتَّةٌ 6️⃣'], 0),
    ],
  },
  {
    id: 'ar1-u5-l8', title: 'الأَرْقَامُ فِي حَيَاتِنَا', unitId: 'ar1-u5', order: 8, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('كَمْ يَوْماً فِي الأُسْبُوع؟', ['سَبْعَةٌ 7️⃣', 'خَمْسَةٌ 5️⃣', 'عَشَرَةٌ 🔟', 'سِتَّةٌ 6️⃣'], 0),
      fbChoice('أَصَابِعُ اليَدَيْنِ ___ أَصْبُع', ['عَشَرَةٌ 🔟', 'خَمْسَةٌ 5️⃣', 'ثَمَانِيَةٌ 8️⃣'], 0, '🙌'),
      readAloud('عِنْدِي خَمْسَةُ أَصَابِعَ فِي كُلِّ يَد 🖐️', 'عندي خمسة أصابع في كل يد', 50),
      tf('أَصَابِعُ اليَدَيْنِ عَشَرَةٌ 🖐️🖐️', true),
      wordOrder('رَتِّبِ الجُمْلَة', ['أَصَابِعَ', 'خَمْسَةُ', 'عِنْدِي', 'يَدٍ', 'فِي كُلِّ'], 'عِنْدِي خَمْسَةُ أَصَابِعَ فِي كُلِّ يَدٍ'),
      imgMatch('صِلِ العَدَدَ بِاسْتِخْدَامِه', [
        { image: '7️⃣', word: 'أَيَّامُ الأُسْبُوع' }, { image: '🔟', word: 'أَصَابِعُ اليَدَيْن' },
        { image: '1️⃣', word: 'شَمْسٌ وَاحِدَةٌ' },
      ]),
    ],
  },
  {
    id: 'ar1-u5-l9', title: 'قِصَّةٌ: الأَلْوَان', unitId: 'ar1-u5', order: 9, xpReward: 30, estimatedMinutes: 15,
    questions: [
      comprehension(
        'الوَرْدَةُ حَمْرَاءُ. السَّمَاءُ زَرْقَاءُ.\nالشَّمْسُ صَفْرَاءُ. العَالَمُ جَمِيلٌ! 🌈',
        'الوَرْدَةُ حَمْرَاءُ. السَّمَاءُ زَرْقَاءُ. الشَّمْسُ صَفْرَاءُ. العَالَمُ جَمِيلٌ!',
        [
          { q: 'مَا لَوْنُ الوَرْدَة؟', options: ['حَمْرَاءُ 🔴', 'زَرْقَاءُ 🔵', 'صَفْرَاءُ 🟡'], correct: 0 },
          { q: 'مَا لَوْنُ السَّمَاء؟', options: ['زَرْقَاءُ 🔵', 'حَمْرَاءُ 🔴', 'خَضْرَاءُ 🟢'], correct: 0 },
          { q: 'كَيْفَ العَالَم؟', options: ['جَمِيلٌ 🌈', 'حَزِينٌ', 'قَبِيحٌ'], correct: 0 },
        ],
      ),
      imgChoice('أَيُّ لَوْنٍ هُوَ لَوْنُ الوَرْدَة؟', 'أَحْمَرُ',
        [{ emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🟢', label: 'أَخْضَرُ' }, { emoji: '🟡', label: 'أَصْفَرُ' }], 0),
      mc('مَا لَوْنُ الشَّمْسِ فِي القِصَّة؟', ['أَصْفَرُ 🟡', 'أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَخْضَرُ 🟢'], 0),
      readAloud('الوَرْدَةُ حَمْرَاءُ وَالسَّمَاءُ زَرْقَاءُ 🌹🌤️', 'الوردة حمراء والسماء زرقاء', 50),
    ],
  },
  {
    id: 'ar1-u5-l10', title: 'كُوِيزُ الوَحْدَةِ الخَامِسَة — الأَلْوَانُ وَالأَرْقَام', unitId: 'ar1-u5', order: 10, xpReward: 50, estimatedMinutes: 20,
    questions: [
      mc('مَا لَوْنُ التُّفَّاحَة؟ 🍎', ['أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَصْفَرُ 🟡', 'أَخْضَرُ 🟢'], 0),
      imgChoice('اخْتَرْ لَوْنَ السَّمَاء', 'أَزْرَقُ',
        [{ emoji: '🔵', label: 'أَزْرَقُ' }, { emoji: '🔴', label: 'أَحْمَرُ' }, { emoji: '🟡', label: 'أَصْفَرُ' }, { emoji: '🟢', label: 'أَخْضَرُ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الرَّقْم الصَّحِيح', 'سَبْعَةٌ',
        [{ emoji: '7️⃣', label: 'سَبْعَةٌ' }, { emoji: '6️⃣', label: 'سِتَّةٌ' }, { emoji: '8️⃣', label: 'ثَمَانِيَةٌ' }, { emoji: '5️⃣', label: 'خَمْسَةٌ' }], 0),
      tapPairs('صِلِ الرَّقْمَ بِاسْمِه', [
        { arabic: '1️⃣', match: 'وَاحِدٌ' },
        { arabic: '5️⃣', match: 'خَمْسَةٌ' },
        { arabic: '🔟', match: 'عَشَرَةٌ' },
      ]),
      sortGroups('صَنِّفِ الأَلْوَان', [
        { label: 'دَافِئَةٌ 🔥', items: ['أَحْمَرُ 🔴', 'أَصْفَرُ 🟡', 'بُرْتُقَالِيٌّ 🟠'] },
        { label: 'بَارِدَةٌ ❄️', items: ['أَزْرَقُ 🔵', 'أَخْضَرُ 🟢', 'بَنَفْسَجِيٌّ 🟣'] },
      ]),
      imgMatch('صِلِ الشَّيءَ بِلَوْنِه', [
        { image: '🌳', word: 'أَخْضَرُ 🟢' }, { image: '❄️', word: 'أَبْيَضُ ⬜' },
        { image: '🌙', word: 'أَسْوَدُ ⬛' }, { image: '☀️', word: 'أَصْفَرُ 🟡' },
      ]),
      fbChoice('🍎🍎🍎🍎 = ___ تُفَّاحَات', ['أَرْبَعَةٌ 4️⃣', 'ثَلَاثَةٌ 3️⃣', 'خَمْسَةٌ 5️⃣'], 0, '🍎'),
      tf('أَصَابِعُ اليَدَيْنِ عَشَرَةٌ 🖐️🖐️', true),
      wordOrder('رَتِّبِ الجُمْلَة', ['صَفْرَاءُ', 'الشَّمْسُ', 'جَمِيلَةٌ', 'وَ'], 'الشَّمْسُ صَفْرَاءُ وَجَمِيلَةٌ'),
      comprehension(
        'أَنَا أُحِبُّ الأَلْوَانَ. لَوْنِي المُفَضَّلُ أَزْرَقُ مِثْلَ السَّمَاء.\nعِنْدِي عَشَرَةُ أَقْلَامٍ مُلَوَّنَة. 🌈',
        'أَنَا أُحِبُّ الأَلْوَانَ. لَوْنِي المُفَضَّلُ أَزْرَقُ مِثْلَ السَّمَاء. عِنْدِي عَشَرَةُ أَقْلَامٍ مُلَوَّنَة.',
        [
          { q: 'مَا اللَّوْنُ المُفَضَّل؟', options: ['أَزْرَقُ 🔵', 'أَحْمَرُ 🔴', 'أَصْفَرُ 🟡'], correct: 0 },
          { q: 'كَمْ قَلَماً عِنْدَه؟', options: ['عَشَرَةٌ 🔟', 'خَمْسَةٌ 5️⃣', 'سَبْعَةٌ 7️⃣'], correct: 0 },
        ],
      ),
      readAloud('أُحِبُّ الأَلْوَانَ وَالأَرْقَامَ 🌈🔢', 'أحب الألوان والأرقام', 50),
      speak('وَاحِدٌ اثْنَانِ ثَلَاثَةٌ أَرْبَعَةٌ خَمْسَةٌ', '🔢', 50),
    ],
  },
];

// ─── UNIT 6: الحَيَوَانَاتُ الحَبِيبَة ────────────────────────────────────────────
export const UNIT6_LESSONS = [
  {
    id: 'ar1-u6-l1', title: 'حَيَوَانَاتُ البَيْت', unitId: 'ar1-u6', order: 1, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا هَذَا الحَيَوَان؟', 'كَلْبٌ',
        [{ emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐘', label: 'فِيلٌ' }], 0),
      imgChoice('مَا هَذَا الحَيَوَان؟', 'قِطَّةٌ',
        [{ emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🐄', label: 'بَقَرَةٌ' }, { emoji: '🐒', label: 'قِرْدٌ' }], 0),
      imgMatch('صِلْ كُلَّ حَيَوَانٍ بِاسْمِه', [
        { image: '🐕', word: 'كَلْبٌ' }, { image: '🐱', word: 'قِطَّةٌ' },
        { image: '🐴', word: 'فَرَسٌ' },
      ]),
      tapPairs('صِلِ الحَيَوَانَ بِصَوْتِه', [
        { arabic: 'كَلْبٌ 🐕', match: 'هَاوْ هَاوْ' },
        { arabic: 'قِطَّةٌ 🐱', match: 'مِيَاوْ' },
      ]),
      mc('أَيُّ الحَيَوَانَاتِ يَعِيشُ فِي البَيْت؟', ['كَلْبٌ 🐕', 'أَسَدٌ 🦁', 'فِيلٌ 🐘', 'قِرْدٌ 🐒'], 0),
      tf('القِطَّةُ حَيَوَانٌ أَلِيفٌ تَعِيشُ مَعَنَا 🐱', true),
    ],
  },
  {
    id: 'ar1-u6-l2', title: 'حَيَوَانَاتُ المَزْرَعَة', unitId: 'ar1-u6', order: 2, xpReward: 15, estimatedMinutes: 10,
    questions: [
      imgChoice('مَا هَذَا الحَيَوَان؟', 'بَقَرَةٌ',
        [{ emoji: '🐄', label: 'بَقَرَةٌ' }, { emoji: '🐔', label: 'دَجَاجَةٌ' }, { emoji: '🐴', label: 'فَرَسٌ' }, { emoji: '🐑', label: 'خَرُوفٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الحَيَوَان الصَّحِيح', 'دَجَاجَةٌ',
        [{ emoji: '🐔', label: 'دَجَاجَةٌ' }, { emoji: '🐄', label: 'بَقَرَةٌ' }, { emoji: '🐴', label: 'فَرَسٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }], 0),
      imgMatch('صِلْ كُلَّ حَيَوَانٍ بِمَا يُعْطِينَا', [
        { image: '🐄', word: 'حَلِيبٌ 🥛' }, { image: '🐔', word: 'بَيْضٌ 🥚' },
        { image: '🐴', word: 'رُكُوبٌ 🏇' },
      ]),
      mc('مَا الحَيَوَانُ الذِي يُعْطِينَا الحَلِيب؟', ['بَقَرَةٌ 🐄', 'دَجَاجَةٌ 🐔', 'فَرَسٌ 🐴', 'كَلْبٌ 🐕'], 0),
      fbChoice('الفَرَسُ يَسْكُنُ فِي ___', ['المَزْرَعَة 🌾', 'الغَابَة 🌿', 'البَيْت 🏠'], 0, '🐴'),
      tf('الدَّجَاجَةُ تَعِيشُ فِي المَزْرَعَة 🐔🌾', true),
    ],
  },
  {
    id: 'ar1-u6-l3', title: 'حَيَوَانَاتُ الغَابَة', unitId: 'ar1-u6', order: 3, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَنْ هُوَ مَلِكُ الحَيَوَانَات؟', ['الأَسَدُ 🦁', 'الفِيلُ 🐘', 'القِرْدُ 🐒', 'الكَلْبُ 🐕'], 0),
      mc('أَيُّ الحَيَوَانَاتِ هُوَ الأَكْبَر؟', ['الفِيلُ 🐘', 'الأَسَدُ 🦁', 'القِرْدُ 🐒', 'السَّمَكَة 🐟'], 0),
      imgChoice('مَا هَذَا الحَيَوَان؟', 'قِرْدٌ',
        [{ emoji: '🐒', label: 'قِرْدٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🐅', label: 'نَمِرٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الحَيَوَان', 'فِيلٌ كَبِيرٌ',
        [{ emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐒', label: 'قِرْدٌ' }, { emoji: '🐅', label: 'نَمِرٌ' }], 0),
      tf('الأَسَدُ حَيَوَانٌ بَرِّيٌّ يَعِيشُ فِي الغَابَة 🦁🌿', true),
      tf('الفِيلُ أَصْغَرُ مِنَ القِطَّة 🐘 🐱', false, 'خَطَأٌ! الفِيلُ أَكْبَرُ بِكَثِير ❌'),
    ],
  },
  {
    id: 'ar1-u6-l4', title: 'أَصْوَاتُ الحَيَوَانَات', unitId: 'ar1-u6', order: 4, xpReward: 15, estimatedMinutes: 10,
    questions: [
      mc('مَا صَوْتُ البَقَرَة؟ 🐄', ['خُوَارٌ 🐄', 'هَاوْ هَاوْ 🐕', 'مِيَاوْ 🐱', 'زَئِيرٌ 🦁'], 0),
      mc('مَا صَوْتُ الأَسَد؟ 🦁', ['زَئِيرٌ 🦁', 'مِيَاوْ 🐱', 'هَاوْ هَاوْ 🐕', 'خُوَارٌ 🐄'], 0),
      tapPairs('صِلِ الحَيَوَانَ بِصَوْتِه', [
        { arabic: 'أَسَدٌ 🦁', match: 'زَئِيرٌ' },
        { arabic: 'بَقَرَةٌ 🐄', match: 'خُوَارٌ' },
        { arabic: 'دَجَاجَةٌ 🐔', match: 'كَوْكَوْ' },
        { arabic: 'فَرَسٌ 🐴', match: 'صَهِيلٌ' },
      ]),
      listenChoice('الكَلْبُ يَقُولُ هَاوْ هَاوْ',
        ['هَاوْ هَاوْ 🐕', 'مِيَاوْ 🐱', 'خُوَارٌ 🐄', 'زَئِيرٌ 🦁'], 0),
      fbChoice('القِطَّةُ تَصِيحُ ___', ['مِيَاوْ 🐱', 'هَاوْ هَاوْ 🐕', 'خُوَارٌ 🐄'], 0, '🐱'),
      imgMatch('صِلِ الحَيَوَانَ بِصَوْتِه', [
        { image: '🦁', word: 'زَئِيرٌ' }, { image: '🐕', word: 'هَاوْ هَاوْ' },
        { image: '🐔', word: 'كَوْكَوْ' },
      ]),
    ],
  },
  {
    id: 'ar1-u6-l5', title: 'أَيْنَ تَسْكُن؟', unitId: 'ar1-u6', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      sortGroups('صَنِّفِ الحَيَوَانَاتِ حَسَبَ مَكَانِ سَكَنِهَا', [
        { label: 'بَيْتٌ 🏠', items: ['كَلْبٌ 🐕', 'قِطَّةٌ 🐱'] },
        { label: 'مَزْرَعَةٌ 🌾', items: ['بَقَرَةٌ 🐄', 'دَجَاجَةٌ 🐔', 'فَرَسٌ 🐴'] },
        { label: 'غَابَةٌ 🌿', items: ['أَسَدٌ 🦁', 'فِيلٌ 🐘', 'قِرْدٌ 🐒'] },
        { label: 'بَحْرٌ 🌊', items: ['سَمَكَةٌ 🐟'] },
      ]),
      mc('أَيْنَ تَسْكُنُ السَّمَكَة؟', ['فِي البَحْر 🌊', 'فِي الغَابَة 🌿', 'فِي البَيْت 🏠', 'فِي المَزْرَعَة 🌾'], 0),
      mc('أَيْنَ يَسْكُنُ الأَسَد؟', ['فِي الغَابَة 🌿', 'فِي البَيْت 🏠', 'فِي البَحْر 🌊', 'فِي المَزْرَعَة 🌾'], 0),
      tf('السَّمَكَةُ تَسْكُنُ فِي البَحْر 🐟🌊', true),
      fbChoice('الأَسَدُ يَسْكُنُ فِي ___', ['الغَابَة 🌿', 'البَيْت 🏠', 'البَحْر 🌊'], 0, '🦁'),
      wordOrder('رَتِّبِ الجُمْلَة', ['الغَابَة', 'فِي', 'الأَسَدُ', 'يَسْكُنُ'], 'الأَسَدُ يَسْكُنُ فِي الغَابَة'),
    ],
  },
  {
    id: 'ar1-u6-l6', title: 'كَبِيرٌ أَوْ صَغِيرٌ؟', unitId: 'ar1-u6', order: 6, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('أَيُّ الحَيَوَانَاتِ الأَكْبَر؟', ['الفِيلُ 🐘', 'القِطَّة 🐱', 'الكَلْب 🐕', 'الدَّجَاجَة 🐔'], 0),
      tf('الفِيلُ أَكْبَرُ مِنَ الكَلْب 🐘 > 🐕', true),
      tf('الكَلْبُ أَكْبَرُ مِنَ الفِيل 🐕 > 🐘', false, 'خَطَأٌ! الفِيلُ أَكْبَرُ بِكَثِير ❌'),
      dragOrder('رَتِّبِ الحَيَوَانَاتِ مِنَ الأَصْغَرِ إِلَى الأَكْبَر', [
        { text: 'قِطَّةٌ 🐱', order: 1 },
        { text: 'كَلْبٌ 🐕', order: 2 },
        { text: 'بَقَرَةٌ 🐄', order: 3 },
        { text: 'فِيلٌ 🐘', order: 4 },
      ]),
      fbChoice('الفِيلُ حَيَوَانٌ ___ جِدَّاً', ['كَبِيرٌ 🐘', 'صَغِيرٌ', 'سَرِيعٌ'], 0, '🐘'),
      imgChoice('أَيُّ الحَيَوَانَاتِ الأَكْبَر؟', 'فِيلٌ',
        [{ emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🐔', label: 'دَجَاجَةٌ' }], 0),
    ],
  },
  {
    id: 'ar1-u6-l7', title: 'أَلِيفٌ أَوْ بَرِّيٌّ؟', unitId: 'ar1-u6', order: 7, xpReward: 20, estimatedMinutes: 12,
    questions: [
      sortGroups('صَنِّفِ الحَيَوَانَاتِ', [
        { label: 'أَلِيفٌ 🏠', items: ['كَلْبٌ 🐕', 'قِطَّةٌ 🐱', 'فَرَسٌ 🐴', 'دَجَاجَةٌ 🐔'] },
        { label: 'بَرِّيٌّ 🌿', items: ['أَسَدٌ 🦁', 'فِيلٌ 🐘', 'قِرْدٌ 🐒', 'سَمَكَةٌ 🐟'] },
      ]),
      fbChoice('الأَسَدُ حَيَوَانٌ ___', ['بَرِّيٌّ 🦁', 'أَلِيفٌ', 'سَرِيعٌ'], 0, '🦁'),
      fbChoice('الكَلْبُ حَيَوَانٌ ___ يَعِيشُ مَعَنَا', ['أَلِيفٌ 🐕', 'بَرِّيٌّ', 'خَطِيرٌ'], 0, '🐕'),
      mc('أَيُّ الحَيَوَانَاتِ لَيْسَ أَلِيفاً؟', ['أَسَدٌ 🦁', 'كَلْبٌ 🐕', 'قِطَّةٌ 🐱', 'فَرَسٌ 🐴'], 0),
      tf('القِرْدُ حَيَوَانٌ أَلِيفٌ يَعِيشُ فِي البَيْت 🐒', false, 'خَطَأٌ! القِرْدُ حَيَوَانٌ بَرِّيٌّ ❌'),
      wordOrder('رَتِّبِ الجُمْلَة', ['أَلِيفٌ', 'الكَلْبُ', 'حَيَوَانٌ'], 'الكَلْبُ حَيَوَانٌ أَلِيفٌ'),
    ],
  },
  {
    id: 'ar1-u6-l8', title: 'الحَيَوَانُ المُفَضَّل', unitId: 'ar1-u6', order: 8, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('أَيُّ الحَيَوَانَاتِ مُفَضَّلٌ عِنْدَكَ؟', ['كَلْبٌ 🐕', 'أَسَدٌ 🦁', 'فِيلٌ 🐘', 'سَمَكَةٌ 🐟'], 0),
      speak('حَيَوَانِي المُفَضَّلُ الكَلْبُ 🐕', '💙', 50),
      translate('كَيْفَ نَقُولُ "حصان" بِالفُصْحَى؟', 'حِصَان', 'فَرَسٌ', ['فَرَسٌ 🐴', 'بَقَرَةٌ 🐄', 'دَجَاجَةٌ 🐔', 'كَلْبٌ 🐕'], '🐴'),
      translate('كَيْفَ نَقُولُ "قطو" بِالفُصْحَى؟', 'قِطُّو', 'قِطَّةٌ', ['قِطَّةٌ 🐱', 'كَلْبٌ 🐕', 'أَسَدٌ 🦁', 'فَرَسٌ 🐴'], '🐱'),
      fbChoice('أَنَا أُحِبُّ ___ كَثِيراً', ['الكَلْبَ 🐕', 'الكِتَابَ 📚', 'البَيْتَ 🏠'], 0, '💙'),
      readAloud('أُحِبُّ الحَيَوَانَاتِ. هِيَ جَمِيلَةٌ 🐾', 'أحب الحيوانات هي جميلة', 50),
    ],
  },
  {
    id: 'ar1-u6-l9', title: 'قِصَّةٌ: فِي حَدِيقَةِ الحَيَوَان', unitId: 'ar1-u6', order: 9, xpReward: 30, estimatedMinutes: 15,
    questions: [
      comprehension(
        'ذَهَبَ سَامِي إِلَى حَدِيقَةِ الحَيَوَان.\nرَأَى فِيلاً كَبِيراً وَقِرْداً مَرِحاً.\nقَالَ سَامِي: أُحِبُّ الحَيَوَانَاتِ! 🦁🐘🐒',
        'ذَهَبَ سَامِي إِلَى حَدِيقَةِ الحَيَوَان. رَأَى فِيلاً كَبِيراً وَقِرْداً مَرِحاً. قَالَ سَامِي: أُحِبُّ الحَيَوَانَاتِ!',
        [
          { q: 'أَيْنَ ذَهَبَ سَامِي؟', options: ['حَدِيقَةُ الحَيَوَان 🦁', 'المَدْرَسَة 🏫', 'البَيْت 🏠'], correct: 0 },
          { q: 'مَاذَا رَأَى سَامِي أَوَّلاً؟', options: ['فِيلاً كَبِيراً 🐘', 'أَسَداً 🦁', 'قِرْداً 🐒'], correct: 0 },
          { q: 'مَاذَا قَالَ سَامِي؟', options: ['أُحِبُّ الحَيَوَانَاتِ 💙', 'أَخَافُ الحَيَوَانَاتِ', 'لَا أُرِيدُ الحَيَوَانَاتِ'], correct: 0 },
        ],
      ),
      imgMatch('مَا الحَيَوَانَاتُ التِي رَآهَا سَامِي؟', [
        { image: '🐘', word: 'فِيلٌ كَبِيرٌ' }, { image: '🐒', word: 'قِرْدٌ مَرِحٌ' },
      ]),
      mc('كَيْفَ كَانَ الفِيلُ فِي القِصَّة؟', ['كَبِيرٌ 🐘', 'صَغِيرٌ', 'سَرِيعٌ', 'خَائِفٌ'], 0),
      speak('أُحِبُّ الحَيَوَانَاتِ 🐾', '💙', 50),
    ],
  },
  {
    id: 'ar1-u6-l10', title: 'كُوِيزُ الوَحْدَةِ السَّادِسَة — الحَيَوَانَات', unitId: 'ar1-u6', order: 10, xpReward: 50, estimatedMinutes: 20,
    questions: [
      mc('مَنْ هُوَ مَلِكُ الحَيَوَانَات؟', ['الأَسَدُ 🦁', 'الفِيلُ 🐘', 'القِرْدُ 🐒', 'الكَلْبُ 🐕'], 0),
      imgChoice('اخْتَرِ الحَيَوَانَ الأَلِيف', 'كَلْبٌ',
        [{ emoji: '🐕', label: 'كَلْبٌ' }, { emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐘', label: 'فِيلٌ' }, { emoji: '🐒', label: 'قِرْدٌ' }], 0),
      listenImg('اسْتَمِعْ وَاخْتَرِ الحَيَوَان', 'بَقَرَةٌ',
        [{ emoji: '🐄', label: 'بَقَرَةٌ' }, { emoji: '🐔', label: 'دَجَاجَةٌ' }, { emoji: '🐴', label: 'فَرَسٌ' }, { emoji: '🐕', label: 'كَلْبٌ' }], 0),
      tapPairs('صِلِ الحَيَوَانَ بِصَوْتِه', [
        { arabic: 'كَلْبٌ 🐕', match: 'هَاوْ هَاوْ' },
        { arabic: 'قِطَّةٌ 🐱', match: 'مِيَاوْ' },
        { arabic: 'أَسَدٌ 🦁', match: 'زَئِيرٌ' },
      ]),
      sortGroups('صَنِّفِ الحَيَوَانَاتِ', [
        { label: 'أَلِيفٌ 🏠', items: ['كَلْبٌ 🐕', 'قِطَّةٌ 🐱', 'فَرَسٌ 🐴'] },
        { label: 'بَرِّيٌّ 🌿', items: ['أَسَدٌ 🦁', 'فِيلٌ 🐘', 'قِرْدٌ 🐒'] },
      ]),
      imgMatch('صِلْ كُلَّ حَيَوَانٍ بِمَكَانِ سَكَنِه', [
        { image: '🐟', word: 'بَحْرٌ 🌊' }, { image: '🦁', word: 'غَابَةٌ 🌿' },
        { image: '🐄', word: 'مَزْرَعَةٌ 🌾' }, { image: '🐕', word: 'بَيْتٌ 🏠' },
      ]),
      tf('الفِيلُ أَكْبَرُ مِنَ الكَلْب 🐘 > 🐕', true),
      fbChoice('الأَسَدُ حَيَوَانٌ ___ يَعِيشُ فِي الغَابَة', ['بَرِّيٌّ 🌿', 'أَلِيفٌ', 'صَغِيرٌ'], 0, '🦁'),
      wordOrder('رَتِّبِ الجُمْلَة', ['الحَيَوَانَاتِ', 'أُحِبُّ', 'أَنَا', 'جَمِيعَ'], 'أَنَا أُحِبُّ جَمِيعَ الحَيَوَانَات'),
      dragOrder('رَتِّبِ الحَيَوَانَاتِ مِنَ الأَصْغَرِ إِلَى الأَكْبَر', [
        { text: 'سَمَكَةٌ 🐟', order: 1 },
        { text: 'قِطَّةٌ 🐱', order: 2 },
        { text: 'كَلْبٌ 🐕', order: 3 },
        { text: 'فِيلٌ 🐘', order: 4 },
      ]),
      comprehension(
        'فِي الغَابَةِ يَعِيشُ الأَسَدُ وَالفِيلُ وَالقِرْد.\nهُمْ حَيَوَانَاتٌ بَرِّيَّة. لَا نُرَبِّيهَا فِي البَيْت. 🌿',
        'فِي الغَابَةِ يَعِيشُ الأَسَدُ وَالفِيلُ وَالقِرْد. هُمْ حَيَوَانَاتٌ بَرِّيَّة. لَا نُرَبِّيهَا فِي البَيْت.',
        [
          { q: 'أَيْنَ تَعِيشُ هَذِهِ الحَيَوَانَات؟', options: ['فِي الغَابَة 🌿', 'فِي البَيْت 🏠', 'فِي البَحْر 🌊'], correct: 0 },
          { q: 'كَيْفَ هَذِهِ الحَيَوَانَات؟', options: ['بَرِّيَّةٌ 🌿', 'أَلِيفَةٌ', 'صَغِيرَةٌ'], correct: 0 },
        ],
      ),
      speak('أُحِبُّ الحَيَوَانَاتِ كُلَّهَا 🐾', '💙', 50),
    ],
  },
];

// ─── UNIT 7: الكَلِمَات الأُولَى (50 كلمة) ─────────────────────────────────────
export const UNIT7_LESSONS = [
  // L1 — المَدْرَسَة 🏫
  {
    id: 'ar1-u7-l1', title: 'أَدَوَاتُ المَدْرَسَة 🏫', unitId: 'ar1-u7', order: 1, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgChoice('مَا هَذَا؟ 📚', 'مَا هَذَا',
        [{ emoji: '📚', label: 'كِتَابٌ' }, { emoji: '✏️', label: 'قَلَمٌ' }, { emoji: '🎒', label: 'حَقِيبَةٌ' }, { emoji: '📋', label: 'سَبُّورَةٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '✏️', word: 'قَلَمٌ' }, { image: '🎒', word: 'حَقِيبَةٌ' },
        { image: '📋', word: 'سَبُّورَةٌ' }, { image: '🗑️', word: 'مَمْحَاةٌ' },
      ]),
      fbChoice('أَكْتُبُ بِالـ ___', ['قَلَمِ ✏️', 'كِتَابِ 📚', 'حَقِيبَةِ 🎒'], 0),
      tf('الكِتَابُ مِنْ أَدَوَاتِ المَدْرَسَة 📚', true, 'صَحِيحٌ! نَقْرَأُ مِنَ الكِتَاب ✅'),
      tf('المَمْحَاةُ تُستَخْدَمُ لِلْكِتَابَة 🗑️', false, 'خَطَأٌ! المَمْحَاةُ لِمَسْحِ الكِتَابَة'),
      wordOrder('رَتِّبِ الجُمْلَة', ['إِلَى', 'أَذْهَبُ', 'أَنَا', 'المَدْرَسَةِ'], 'أَنَا أَذْهَبُ إِلَى المَدْرَسَةِ'),
      flashcard('أَدَوَاتُ المَدْرَسَة 🏫', 'كِتَابٌ 📚 — قَلَمٌ ✏️\nحَقِيبَةٌ 🎒 — سَبُّورَةٌ 📋\nمَمْحَاةٌ 🗑️ — مُعَلِّمَةٌ 👩‍🏫'),
      speak('مَدْرَسَةٌ', '🏫', 50),
    ],
  },
  // L2 — الطَّعَام 🍎
  {
    id: 'ar1-u7-l2', title: 'الطَّعَامُ وَالشَّرَاب 🍎', unitId: 'ar1-u7', order: 2, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgChoice('مَا هَذَا؟ 🍞', 'مَا هَذَا',
        [{ emoji: '🍞', label: 'خُبْزٌ' }, { emoji: '🍎', label: 'تُفَّاحَةٌ' }, { emoji: '🍌', label: 'مَوْزٌ' }, { emoji: '🥛', label: 'حَلِيبٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🥚', word: 'بَيْضَةٌ' }, { image: '💧', word: 'مَاءٌ' },
        { image: '🍚', word: 'أَرُزٌّ' }, { image: '🫘', word: 'تَمْرٌ' },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَةَ الصَّحِيحَة', 'تُفَّاحَةٌ',
        [{ emoji: '🍎', label: 'تُفَّاحَةٌ' }, { emoji: '🍌', label: 'مَوْزٌ' }, { emoji: '🍞', label: 'خُبْزٌ' }, { emoji: '🥛', label: 'حَلِيبٌ' }], 0),
      sortGroups('صَنِّفِ الطَّعَامَ وَالشَّرَاب', [
        { label: 'طَعَامٌ 🍽️', items: ['خُبْزٌ 🍞', 'تُفَّاحَةٌ 🍎', 'مَوْزٌ 🍌', 'أَرُزٌّ 🍚', 'تَمْرٌ 🫘'] },
        { label: 'شَرَابٌ 🥤', items: ['حَلِيبٌ 🥛', 'مَاءٌ 💧'] },
      ]),
      fbChoice('أَشْرَبُ ___ كُلَّ يَوْم', ['مَاءً 💧', 'أَرُزّاً 🍚', 'خُبْزاً 🍞'], 0),
      tf('الحَلِيبُ شَرَابٌ مُفِيدٌ لِلأَطْفَال 🥛', true, 'صَحِيحٌ! الحَلِيبُ يُقَوِّي العِظَام ✅'),
      readAloud('أَكَلْتُ خُبْزاً وَبَيْضَةً وَشَرِبْتُ حَلِيباً', 'أكلت خبزاً وبيضة وشربت حليباً', 50),
    ],
  },
  // L3 — أَجْزَاءُ الجِسْم 👤
  {
    id: 'ar1-u7-l3', title: 'أَجْزَاءُ الجِسْم 👤', unitId: 'ar1-u7', order: 3, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgChoice('مَا هَذَا؟ 👁️', 'مَا هَذَا',
        [{ emoji: '👁️', label: 'عَيْنٌ' }, { emoji: '👂', label: 'أُذُنٌ' }, { emoji: '👃', label: 'أَنْفٌ' }, { emoji: '👄', label: 'فَمٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '👤', word: 'رَأْسٌ' }, { image: '✋', word: 'يَدٌ' },
        { image: '🦵', word: 'رِجْلٌ' }, { image: '❤️', word: 'قَلْبٌ' },
      ]),
      tapPairs('صِلِ العُضْوَ بِوَظِيفَتِه', [
        { arabic: 'عَيْنٌ 👁️', match: 'نَرَى بِهَا' },
        { arabic: 'أُذُنٌ 👂', match: 'نَسْمَعُ بِهَا' },
        { arabic: 'أَنْفٌ 👃', match: 'نَشَمُّ بِهِ' },
      ]),
      fbChoice('نَشَمُّ بِالـ ___', ['أَنْفِ 👃', 'عَيْنِ 👁️', 'يَدِ ✋'], 0),
      tf('اليَدُ تُستَخْدَمُ لِلْمَشْي 🚶', false, 'خَطَأٌ! نَمْشِي بِالرِّجْل وَنَعْمَلُ بِاليَد'),
      wordOrder('رَتِّبِ الجُمْلَة', ['يَدَانِ', 'لِي', 'وَرِجْلَانِ'], 'لِي يَدَانِ وَرِجْلَانِ'),
      speak('رَأْسٌ', '👤', 50),
    ],
  },
  // L4 — الطَّبِيعَة 🌿
  {
    id: 'ar1-u7-l4', title: 'الطَّبِيعَة الجَمِيلَة 🌿', unitId: 'ar1-u7', order: 4, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgChoice('مَا هَذَا؟ ☀️', 'مَا هَذَا',
        [{ emoji: '☀️', label: 'شَمْسٌ' }, { emoji: '🌙', label: 'قَمَرٌ' }, { emoji: '⭐', label: 'نَجْمٌ' }, { emoji: '🌧️', label: 'مَطَرٌ' }], 0),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🌳', word: 'شَجَرَةٌ' }, { image: '🌸', word: 'زَهْرَةٌ' },
        { image: '🌙', word: 'قَمَرٌ' }, { image: '⭐', word: 'نَجْمٌ' },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَةَ الصَّحِيحَة', 'قَمَرٌ',
        [{ emoji: '☀️', label: 'شَمْسٌ' }, { emoji: '🌙', label: 'قَمَرٌ' }, { emoji: '🌧️', label: 'مَطَرٌ' }, { emoji: '⭐', label: 'نَجْمٌ' }], 1),
      fbChoice('فِي اللَّيْلِ نَرَى الـ ___', ['قَمَرَ 🌙', 'شَمْسَ ☀️', 'مَطَرَ 🌧️'], 0),
      tf('الشَّمْسُ تُضِيءُ فِي اللَّيْل ☀️🌙', false, 'خَطَأٌ! الشَّمْسُ تُضِيءُ فِي النَّهَار'),
      sortGroups('صَنِّفْ: نَهَار أَم لَيْل؟', [
        { label: 'نَهَارٌ ☀️', items: ['شَمْسٌ ☀️', 'زَهْرَةٌ 🌸', 'فَرَاشَةٌ 🦋'] },
        { label: 'لَيْلٌ 🌙', items: ['قَمَرٌ 🌙', 'نَجْمٌ ⭐', 'نَوْمٌ 😴'] },
      ]),
      readAloud('الشَّمْسُ تُضِيءُ وَالمَطَرُ يُنَمِّي الأَشْجَار', 'الشمس تضيء والمطر ينمي الأشجار', 50),
    ],
  },
  // L5 — وَسَائِلُ التَّنَقُّل 🚗
  {
    id: 'ar1-u7-l5', title: 'وَسَائِلُ التَّنَقُّل 🚗', unitId: 'ar1-u7', order: 5, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgChoice('مَا هَذَا؟ ✈️', 'مَا هَذَا',
        [{ emoji: '🚗', label: 'سَيَّارَةٌ' }, { emoji: '🚌', label: 'حَافِلَةٌ' }, { emoji: '✈️', label: 'طَائِرَةٌ' }, { emoji: '🚲', label: 'دَرَّاجَةٌ' }], 2),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🚗', word: 'سَيَّارَةٌ' }, { image: '🚌', word: 'حَافِلَةٌ' },
        { image: '🚆', word: 'قِطَارٌ' }, { image: '🚲', word: 'دَرَّاجَةٌ' },
      ]),
      sortGroups('صَنِّفْ وَسَائِلَ التَّنَقُّل', [
        { label: 'بَرِّيَّة 🛣️', items: ['سَيَّارَةٌ 🚗', 'حَافِلَةٌ 🚌', 'قِطَارٌ 🚆', 'دَرَّاجَةٌ 🚲'] },
        { label: 'جَوِّيَّة ✈️', items: ['طَائِرَةٌ ✈️'] },
      ]),
      fbChoice('أَذْهَبُ إِلَى المَدْرَسَةِ بِالـ ___', ['حَافِلَةِ 🚌', 'طَائِرَةِ ✈️', 'قِطَارِ 🚆'], 0),
      tf('الطَّائِرَةُ تَسِيرُ عَلَى الأَرْض ✈️', false, 'خَطَأٌ! الطَّائِرَةُ تَطِيرُ فِي السَّمَاء'),
      tapPairs('صِلِ الوَسِيلَةَ بِمَكَانِ سَيْرِهَا', [
        { arabic: 'سَيَّارَةٌ 🚗', match: 'الطَّرِيق' },
        { arabic: 'طَائِرَةٌ ✈️', match: 'السَّمَاء' },
        { arabic: 'قِطَارٌ 🚆', match: 'القَضِيب' },
      ]),
      speak('سَيَّارَةٌ', '🚗', 50),
    ],
  },
  // L6 — أَفْعَالٌ يَوْمِيَّة 🏃
  {
    id: 'ar1-u7-l6', title: 'أَفْعَالٌ يَوْمِيَّة 🏃', unitId: 'ar1-u7', order: 6, xpReward: 25, estimatedMinutes: 15,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['أَنَا أَكَلَ التُّفَّاحَة', 'أَنَا آكُلُ التُّفَّاحَة 🍎', 'أَنَا يَأْكُلُ التُّفَّاحَة', 'أَنَا تَأْكُلُ التُّفَّاحَة'], 1),
      fbChoice('أَنَا ___ الطَّعَامَ كُلَّ يَوْم', ['آكُلُ 🍽️', 'أَشْرَبُ 🥤', 'أَنَامُ 😴'], 0),
      wordOrder('رَتِّبِ الجُمْلَة', ['اللَّعِبَ', 'أُحِبُّ', 'أَنَا', 'كَثِيراً'], 'أَنَا أُحِبُّ اللَّعِبَ كَثِيراً'),
      tf('نَقُولُ "أَنَا دَرَسَ" بِالعَرَبِيِّ الصَّحِيح', false, 'خَطَأٌ! نَقُولُ "أَنَا أَدْرُسُ"'),
      tapPairs('صِلِ الفِعْلَ بِصُورَتِه', [
        { arabic: 'أَكَلَ 🍽️', match: 'طَعَامٌ' },
        { arabic: 'شَرِبَ 🥤', match: 'مَاءٌ' },
        { arabic: 'نَامَ 😴', match: 'سَرِيرٌ' },
      ]),
      dragOrder('رَتِّبِ يَوْمَكَ مِنَ الصُّبْحِ', [
        { text: '😴 نَوْم', order: 1 }, { text: '🍳 إِفْطَار', order: 2 },
        { text: '🏫 مَدْرَسَة', order: 3 }, { text: '🎮 لَعِب', order: 4 },
      ]),
      readAloud('أَنَا آكُلُ وَأَشْرَبُ وَأَدْرُسُ وَأَلْعَبُ', 'أنا آكل وأشرب وأدرس وألعب', 50),
    ],
  },
  // L7 — مُرَاجَعَة: المَدْرَسَة وَالطَّعَام
  {
    id: 'ar1-u7-l7', title: 'مُرَاجَعَة: المَدْرَسَة وَالطَّعَام 🏫🍎', unitId: 'ar1-u7', order: 7, xpReward: 30, estimatedMinutes: 18,
    questions: [
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '📚', word: 'كِتَابٌ' }, { image: '🍎', word: 'تُفَّاحَةٌ' },
        { image: '✏️', word: 'قَلَمٌ' }, { image: '🥛', word: 'حَلِيبٌ' },
      ]),
      sortGroups('صَنِّفِ الكَلِمَات', [
        { label: 'مَدْرَسَةٌ 🏫', items: ['كِتَابٌ 📚', 'قَلَمٌ ✏️', 'حَقِيبَةٌ 🎒', 'سَبُّورَةٌ 📋'] },
        { label: 'طَعَامٌ 🍽️', items: ['خُبْزٌ 🍞', 'تُفَّاحَةٌ 🍎', 'مَوْزٌ 🍌', 'بَيْضَةٌ 🥚'] },
      ]),
      listenChoice('كِتَابٌ',
        ['كِتَابٌ 📚', 'قَلَمٌ ✏️', 'حَقِيبَةٌ 🎒'], 0),
      fbChoice('أَحْمِلُ ___ إِلَى المَدْرَسَة', ['حَقِيبَتِي 🎒', 'طَعَامِي 🍎', 'سَيَّارَتِي 🚗'], 0),
      tf('المَوْزُ مِنْ أَدَوَاتِ المَدْرَسَة 🍌', false, 'خَطَأٌ! المَوْزُ طَعَامٌ'),
      translateReverse('مَا كَلِمَةُ "قَلَم" بِالعَامِّيَّة؟', 'قَلَمٌ ✏️', 'قلم', ['قلم', 'كتاب', 'حقيبة'], '✏️'),
      dragOrder('رَتِّبِ أَدَوَاتِ المَدْرَسَة مِنَ الأَصْغَرِ', [
        { text: '✏️ قَلَمٌ', order: 1 }, { text: '🗑️ مَمْحَاةٌ', order: 2 },
        { text: '📚 كِتَابٌ', order: 3 }, { text: '🎒 حَقِيبَةٌ', order: 4 },
      ]),
    ],
  },
  // L8 — مُرَاجَعَة: الجِسْم وَالطَّبِيعَة
  {
    id: 'ar1-u7-l8', title: 'مُرَاجَعَة: الجِسْم وَالطَّبِيعَة 👤🌿', unitId: 'ar1-u7', order: 8, xpReward: 30, estimatedMinutes: 18,
    questions: [
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '👁️', word: 'عَيْنٌ' }, { image: '☀️', word: 'شَمْسٌ' },
        { image: '✋', word: 'يَدٌ' }, { image: '🌳', word: 'شَجَرَةٌ' },
      ]),
      sortGroups('صَنِّفِ الكَلِمَات', [
        { label: 'جِسْمٌ 👤', items: ['رَأْسٌ 👤', 'عَيْنٌ 👁️', 'يَدٌ ✋', 'رِجْلٌ 🦵'] },
        { label: 'طَبِيعَةٌ 🌿', items: ['شَمْسٌ ☀️', 'قَمَرٌ 🌙', 'شَجَرَةٌ 🌳', 'زَهْرَةٌ 🌸'] },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَةَ الصَّحِيحَة', 'شَجَرَةٌ',
        [{ emoji: '🌳', label: 'شَجَرَةٌ' }, { emoji: '🌸', label: 'زَهْرَةٌ' }, { emoji: '🌧️', label: 'مَطَرٌ' }, { emoji: '⭐', label: 'نَجْمٌ' }], 0),
      fbChoice('نَرَى بِالـ ___', ['عَيْنِ 👁️', 'أُذُنِ 👂', 'أَنْفِ 👃'], 0),
      tf('الزَّهْرَةُ تَنْمُو بِالمَطَرِ وَالشَّمْس 🌸🌧️☀️', true, 'صَحِيحٌ! الزَّهْرَةُ تَحْتَاجُ الضَّوْءَ وَالمَاء ✅'),
      wordOrder('رَتِّبِ الجُمْلَة', ['جَمِيلَةٌ', 'الطَّبِيعَةُ', 'هَذِهِ'], 'هَذِهِ الطَّبِيعَةُ جَمِيلَةٌ'),
      comprehension(
        'الشَّمْسُ تُضِيءُ النَّهَارَ.\nوَالقَمَرُ يُضِيءُ اللَّيْل.\nالأَشْجَارُ تَنْمُو بِالمَطَر. 🌳🌧️',
        'الشَّمْسُ تُضِيءُ النَّهَارَ. وَالقَمَرُ يُضِيءُ اللَّيْل. الأَشْجَارُ تَنْمُو بِالمَطَر.',
        [
          { q: 'مَاذَا يُضِيءُ اللَّيْل؟', options: ['الشَّمْسُ ☀️', 'القَمَرُ 🌙', 'النَّجْمُ ⭐'], correct: 1 },
          { q: 'مَاذَا تَحْتَاجُ الأَشْجَار؟', options: ['المَطَرَ 🌧️', 'الرِّيحَ 💨', 'الثَّلْجَ ❄️'], correct: 0 },
        ],
      ),
    ],
  },
  // L9 — مُرَاجَعَة: التَّنَقُّل وَالأَفْعَال
  {
    id: 'ar1-u7-l9', title: 'مُرَاجَعَة: التَّنَقُّل وَالأَفْعَال 🚗🏃', unitId: 'ar1-u7', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      imgChoice('أَيُّ وَسِيلَةٍ تَطِيرُ فِي السَّمَاء؟', 'أَيُّ وَسِيلَةٍ تَطِيرُ',
        [{ emoji: '🚗', label: 'سَيَّارَةٌ' }, { emoji: '🚌', label: 'حَافِلَةٌ' }, { emoji: '✈️', label: 'طَائِرَةٌ' }, { emoji: '🚲', label: 'دَرَّاجَةٌ' }], 2),
      sortGroups('صَنِّفِ الوَسَائِلَ وَالأَفْعَال', [
        { label: 'وَسَائِلُ تَنَقُّل 🚗', items: ['سَيَّارَةٌ 🚗', 'حَافِلَةٌ 🚌', 'طَائِرَةٌ ✈️', 'قِطَارٌ 🚆'] },
        { label: 'أَفْعَالٌ يَوْمِيَّة 🏃', items: ['أَكَلَ 🍽️', 'شَرِبَ 💧', 'نَامَ 😴', 'دَرَسَ 📚'] },
      ]),
      fbChoice('أَذْهَبُ إِلَى البَيْتِ بِالـ ___', ['سَيَّارَةِ 🚗', 'طَائِرَةِ ✈️', 'قَلَمِ ✏️'], 0),
      tf('نَقُولُ "أَنَا تَأْكُلُ" بِالعَرَبِيِّ الصَّحِيح', false, 'خَطَأٌ! نَقُولُ "أَنَا آكُلُ"'),
      wordOrder('رَتِّبِ الجُمْلَة', ['الحَافِلَةِ', 'فِي', 'أَجْلِسُ', 'أَنَا'], 'أَنَا أَجْلِسُ فِي الحَافِلَةِ'),
      mc('أَيُّ الأَفْعَالِ يَعْنِي "شَرِبَ"؟', ['أَكَلَ الطَّعَام', 'شَرِبَ الحَلِيبَ 🥛', 'نَامَ فِي السَّرِير', 'دَرَسَ الدَّرْس'], 1),
      readAloud('أَرْكَبُ الحَافِلَةَ إِلَى المَدْرَسَةِ كُلَّ يَوْم', 'أركب الحافلة إلى المدرسة كل يوم', 50),
    ],
  },
  // L10 — اخْتِبَارُ الوَحْدَة 7 (12 أسئلة)
  {
    id: 'ar1-u7-l10', title: 'اخْتِبَارُ الوَحْدَة السَّابِعَة ⭐', unitId: 'ar1-u7', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('مَا هَذَا؟ 🎒', 'مَا هَذَا',
        [{ emoji: '📚', label: 'كِتَابٌ' }, { emoji: '✏️', label: 'قَلَمٌ' }, { emoji: '🎒', label: 'حَقِيبَةٌ' }, { emoji: '📋', label: 'سَبُّورَةٌ' }], 2),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🍎', word: 'تُفَّاحَةٌ' }, { image: '👁️', word: 'عَيْنٌ' },
        { image: '🌳', word: 'شَجَرَةٌ' }, { image: '🚌', word: 'حَافِلَةٌ' },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَةَ', 'نَجْمٌ',
        [{ emoji: '☀️', label: 'شَمْسٌ' }, { emoji: '🌙', label: 'قَمَرٌ' }, { emoji: '⭐', label: 'نَجْمٌ' }, { emoji: '🌧️', label: 'مَطَرٌ' }], 2),
      sortGroups('صَنِّفِ الكَلِمَات', [
        { label: 'جِسْمٌ 👤', items: ['رَأْسٌ 👤', 'يَدٌ ✋', 'رِجْلٌ 🦵'] },
        { label: 'طَعَامٌ 🍽️', items: ['خُبْزٌ 🍞', 'مَوْزٌ 🍌', 'بَيْضَةٌ 🥚'] },
        { label: 'تَنَقُّلٌ 🚗', items: ['سَيَّارَةٌ 🚗', 'طَائِرَةٌ ✈️', 'قِطَارٌ 🚆'] },
      ]),
      fbChoice('أَكْتُبُ بِالـ ___', ['قَلَمِ ✏️', 'كِتَابِ 📚', 'يَدِ ✋'], 0),
      tf('الطَّائِرَةُ وَسِيلَةٌ جَوِّيَّة ✈️', true, 'صَحِيحٌ! الطَّائِرَةُ تَطِيرُ فِي السَّمَاء ✅'),
      wordOrder('رَتِّبِ الجُمْلَة', ['الحَافِلَةِ', 'فِي', 'أَجْلِسُ'], 'أَجْلِسُ فِي الحَافِلَةِ'),
      mc('كَيْفَ نَقُولُ "أَنَا بَكَا" بِشَكْلٍ صَحِيح؟', ['أَنَا بَكَى', 'أَنَا أَبْكِي 😢', 'أَنَا تَبْكِي', 'أَنَا يَبْكِي'], 1),
      tapPairs('صِلِ الكَلِمَةَ بِمَعْنَاهَا', [
        { arabic: 'يَدٌ ✋', match: 'نَعْمَلُ بِهَا' },
        { arabic: 'عَيْنٌ 👁️', match: 'نَرَى بِهَا' },
        { arabic: 'أُذُنٌ 👂', match: 'نَسْمَعُ بِهَا' },
      ]),
      dragOrder('رَتِّبِ وَجْبَاتِ اليَوْم', [
        { text: '🌅 إِفْطَار', order: 1 }, { text: '☀️ غَدَاء', order: 2 },
        { text: '🌙 عَشَاء', order: 3 },
      ]),
      comprehension(
        'أَنَا مَرْيَم.\nأَذْهَبُ لِلْمَدْرَسَةِ بِالحَافِلَة.\nعِنْدِي كِتَابٌ وَقَلَمٌ وَحَقِيبَة.\nآكُلُ تُفَّاحَةً فِي المَدْرَسَة. 🏫🍎',
        'أَنَا مَرْيَم. أَذْهَبُ لِلْمَدْرَسَةِ بِالحَافِلَة. عِنْدِي كِتَابٌ وَقَلَمٌ وَحَقِيبَة. آكُلُ تُفَّاحَةً فِي المَدْرَسَة.',
        [
          { q: 'كَيْفَ تَذْهَبُ مَرْيَمُ لِلْمَدْرَسَة؟', options: ['بِالسَّيَّارَة 🚗', 'بِالحَافِلَة 🚌', 'بِالدَّرَّاجَة 🚲'], correct: 1 },
          { q: 'مَاذَا تَأْكُلُ مَرْيَمُ فِي المَدْرَسَة؟', options: ['مَوْزاً 🍌', 'خُبْزاً 🍞', 'تُفَّاحَةً 🍎'], correct: 2 },
          { q: 'مَا الذِي تَحْمِلُهُ مَرْيَم؟', options: ['كِتَابٌ وَقَلَمٌ وَحَقِيبَة', 'كُرَة وَلُعَب', 'طَعَام وَشَرَاب'], correct: 0 },
        ],
      ),
      readAloud('أَنَا أُحِبُّ المَدْرَسَةَ وَالطَّعَامَ الصِّحِّي', 'أنا أحب المدرسة والطعام الصحي', 55),
    ],
  },
];

// ─── UNIT 8: الجُمَل البَسِيطَة ───────────────────────────────────────────────
export const UNIT8_LESSONS = [
  // L1 — هَذَا / هَذِهِ + اسم
  {
    id: 'ar1-u8-l1', title: 'هَذَا وَهَذِهِ 🏠🐱', unitId: 'ar1-u8', order: 1, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['هَذَا أَسَدٌ 🦁', 'هَذَا أُمٌّ 👩', 'هَذِهِ كِتَابٌ 📚', 'هَذَا بِنْتٌ 👧'], 0),
      fbChoice('___ بَيْتٌ كَبِيرٌ', ['هَذَا', 'هَذِهِ', 'هِيَ'], 0, '🏠'),
      fbChoice('___ قِطَّةٌ صَغِيرَة', ['هَذَا', 'هَذِهِ', 'هُوَ'], 1, '🐱'),
      wordOrder('رَتِّبِ الجُمْلَة', ['كَبِيرٌ', 'هَذَا', 'أَسَدٌ'], 'هَذَا أَسَدٌ كَبِيرٌ'),
      tf('نَقُولُ "هَذَا أُمٌّ" بِالعَرَبِيِّ الصَّحِيح 👩', false, 'خَطَأٌ! نَقُولُ "هَذِهِ أُمٌّ" لِأَنَّ "أُمّ" مُؤَنَّثَة'),
      tapPairs('صِلِ الاسْمَ بِاسْمِ الإِشَارَة', [
        { arabic: 'كِتَابٌ 📚', match: 'هَذَا' },
        { arabic: 'شَجَرَةٌ 🌳', match: 'هَذِهِ' },
        { arabic: 'قَلَمٌ ✏️', match: 'هَذَا' },
      ]),
      readAloud('هَذَا بَيْتِي وَهَذِهِ قِطَّتِي', 'هذا بيتي وهذه قطتي', 55),
    ],
  },
  // L2 — هُوَ / هِيَ + صِفَة
  {
    id: 'ar1-u8-l2', title: 'هُوَ وَهِيَ + صِفَة ✨', unitId: 'ar1-u8', order: 2, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['هُوَ كَبِيرٌ 🦁', 'هِيَ كَبِيرٌ 👩', 'هُوَ جَمِيلَةٌ', 'هِيَ طَوِيلٌ'], 0),
      fbChoice('الأَسَدُ ___ كَبِيرٌ', ['هُوَ', 'هِيَ', 'هَذِهِ'], 0, '🦁'),
      fbChoice('المُعَلِّمَةُ ___ طَيِّبَة', ['هُوَ', 'هِيَ', 'هَذَا'], 1, '👩‍🏫'),
      wordOrder('رَتِّبِ الجُمْلَة', ['جَمِيلَةٌ', 'هِيَ', 'وَطَيِّبَة'], 'هِيَ جَمِيلَةٌ وَطَيِّبَة'),
      tf('نَقُولُ "هِيَ طَوِيلٌ" عَنِ الأُخْت 👧', false, 'خَطَأٌ! نَقُولُ "هِيَ طَوِيلَةٌ" — الصِّفَةُ مُؤَنَّثَة'),
      imgChoice('مَنْ هَذَا؟ هُوَ قَوِيٌّ وَكَبِير', 'مَنْ هَذَا هُوَ قَوِيٌّ وَكَبِير',
        [{ emoji: '🦁', label: 'أَسَدٌ' }, { emoji: '🐱', label: 'قِطَّةٌ' }, { emoji: '🐦', label: 'عُصْفُور' }, { emoji: '🐟', label: 'سَمَكَة' }], 0),
      readAloud('هُوَ طَالِبٌ مُجْتَهِدٌ وَهِيَ طَالِبَةٌ ذَكِيَّة', 'هو طالب مجتهد وهي طالبة ذكية', 55),
    ],
  },
  // L3 — عِنْدِي + اسم
  {
    id: 'ar1-u8-l3', title: 'عِنْدِي + اسْم 🎒', unitId: 'ar1-u8', order: 3, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['عِنْدِي كِتَابٌ 📚', 'عِنْدِي أَكَلَ', 'عِنْدِي جَمِيل', 'عِنْدِي كَبِير'], 0),
      fbChoice('___ ثَلَاثَةُ أَقْلَامٍ', ['عِنْدِي', 'هَذَا', 'أَنَا'], 0, '✏️'),
      wordOrder('رَتِّبِ الجُمْلَة', ['وَأُخْتٌ', 'عِنْدِي', 'أَخٌ'], 'عِنْدِي أَخٌ وَأُخْتٌ'),
      tf('نَقُولُ "عِنْدِي أَكَلَ" بِالعَرَبِيِّ الصَّحِيح', false, 'خَطَأٌ! عِنْدِي + اسْم فَقَط، لَيْسَ فِعْل'),
      tapPairs('كَمِّلِ الجُمْلَة بِـ "عِنْدِي"', [
        { arabic: 'عِنْدِي ...', match: 'كِتَابٌ 📚' },
        { arabic: 'عِنْدَهُ ...', match: 'قَلَمٌ ✏️' },
        { arabic: 'عِنْدَهَا ...', match: 'حَقِيبَةٌ 🎒' },
      ]),
      dragOrder('رَتِّبِ الجُمَلَ مِنَ الأَقَلِّ إِلَى الأَكْثَر', [
        { text: 'عِنْدِي قَلَمٌ وَاحِد ✏️', order: 1 },
        { text: 'عِنْدِي كِتَابَانِ 📚📚', order: 2 },
        { text: 'عِنْدِي ثَلَاثَةُ أَصْدِقَاء 👦👧👦', order: 3 },
      ]),
      readAloud('عِنْدِي أَبٌ وَأُمٌّ وَأَخٌ وَأُخْت', 'عندي أب وأم وأخ وأخت', 55),
    ],
  },
  // L4 — أَنَا + فِعْل
  {
    id: 'ar1-u8-l4', title: 'أَنَا + فِعْل 🏃', unitId: 'ar1-u8', order: 4, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['أَنَا آكُلُ التُّفَّاحَة 🍎', 'أَنَا أَكَلَ', 'أَنَا يَأْكُلُ', 'أَنَا تَأْكُلُ'], 0),
      fbChoice('أَنَا ___ فِي المَدْرَسَة', ['أَدْرُسُ 📚', 'أَكَلَ 🍽️', 'نَامَ 😴'], 0, '🏫'),
      wordOrder('رَتِّبِ الجُمْلَة', ['أُحِبُّ', 'أَنَا', 'وَأَدْرُسُ', 'اللَّعِبَ'], 'أَنَا أُحِبُّ اللَّعِبَ وَأَدْرُسُ'),
      tf('نَقُولُ "أَنَا نَامَ" بِالعَرَبِيِّ الصَّحِيح 😴', false, 'خَطَأٌ! نَقُولُ "أَنَا أَنَامُ"'),
      imgChoice('مَنْ يَلْعَبُ هُنَا؟ 🎮', 'مَنْ يَلْعَبُ',
        [{ emoji: '👦', label: 'وَلَدٌ يَلْعَبُ' }, { emoji: '📚', label: 'وَلَدٌ يَدْرُسُ' }, { emoji: '😴', label: 'وَلَدٌ يَنَامُ' }, { emoji: '🍽️', label: 'وَلَدٌ يَأْكُلُ' }], 0),
      sortGroups('صَنِّفِ الأَفْعَالَ حَسَبَ الوَقْت', [
        { label: 'صَبَاحاً 🌅', items: ['أَصْحُو 😴', 'آكُلُ الإِفْطَار 🍳', 'أَذْهَبُ لِلْمَدْرَسَة 🏫'] },
        { label: 'مَسَاءً 🌙', items: ['أَلْعَبُ 🎮', 'أُذَاكِرُ 📚', 'أَنَامُ 😴'] },
      ]),
      readAloud('أَنَا آكُلُ وَأَشْرَبُ وَأَلْعَبُ وَأَنَامُ', 'أنا آكل وأشرب وألعب وأنام', 55),
    ],
  },
  // L5 — لَيْسَ (نَفْي)
  {
    id: 'ar1-u8-l5', title: 'النَّفْيُ بِـ "لَيْسَ" 🚫', unitId: 'ar1-u8', order: 5, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['الأَسَدُ لَيْسَ قِطَّة 🦁🚫🐱', 'الأَسَدُ لَيْسَ كَبِير', 'هَذَا لَيْسَ أَسَد هُوَ', 'لَيْسَ أَنَا هُنَا'], 0),
      fbChoice('القِطَّةُ ___ كَلْباً 🐱🚫🐕', ['لَيْسَتْ', 'لَيْسَ', 'لَا'], 0),
      wordOrder('رَتِّبِ الجُمْلَة', ['مُعَلِّماً', 'لَيْسَ', 'أَبِي'], 'أَبِي لَيْسَ مُعَلِّماً'),
      tf('نَقُولُ "هَذَا لَيْسَتْ كِتَاباً" 📚🚫', false, 'خَطَأٌ! الكِتَابُ مُذَكَّرٌ فَنَقُولُ "لَيْسَ"'),
      fbChoice('المَوْزُ ___ لَوْنُهُ أَحْمَر 🍌🚫🔴', ['لَيْسَ', 'لَيْسَتْ', 'لَا يَكُون'], 0),
      dragOrder('رَتِّبِ الجُمَلَ مِنَ المُثْبَت إِلَى المَنْفِي', [
        { text: 'هَذَا كَلْبٌ 🐕', order: 1 },
        { text: 'هَذَا لَيْسَ قِطَّة 🚫🐱', order: 2 },
        { text: 'الكَلْبُ لَيْسَ خَطِيراً 🚫⚠️', order: 3 },
      ]),
      readAloud('الأَسَدُ لَيْسَ حَيَوَاناً أَلِيفاً', 'الأسد ليس حيواناً أليفاً', 55),
    ],
  },
  // L6 — أَسْئِلَة: مَنْ؟ مَا؟ أَيْنَ؟
  {
    id: 'ar1-u8-l6', title: 'أَسْئِلَة: مَنْ؟ مَا؟ أَيْنَ؟ ❓', unitId: 'ar1-u8', order: 6, xpReward: 30, estimatedMinutes: 18,
    questions: [
      mc('بِمَاذَا نَسْأَلُ عَنِ الإِنْسَان؟', ['مَنْ؟ 👤', 'مَا؟ ❓', 'أَيْنَ؟ 📍', 'كَيْفَ؟ 🤔'], 0),
      fbChoice('___ هَذَا؟ هُوَ أَبِي 👨', ['مَنْ', 'مَا', 'أَيْنَ'], 0),
      fbChoice('___ هَذَا؟ هَذَا كِتَابٌ 📚', ['مَنْ', 'مَا', 'كَيْفَ'], 1),
      fbChoice('___ المَدْرَسَة؟ هِيَ هُنَاك 🏫', ['مَنْ', 'مَا', 'أَيْنَ'], 2),
      wordOrder('رَتِّبِ السُّؤَال', ['الكَلْبُ؟', 'أَيْنَ'], 'أَيْنَ الكَلْبُ؟'),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'مَنْ هَذَا؟ 👤', match: 'هَذَا أَبِي 👨' },
        { arabic: 'مَا هَذَا؟ ❓', match: 'هَذَا قَلَمٌ ✏️' },
        { arabic: 'أَيْنَ الكِتَاب؟ 📍', match: 'هُوَ فِي الحَقِيبَة 🎒' },
      ]),
      readAloud('مَنْ أَنْتَ؟ أَنَا طَالِبٌ', 'من أنت؟ أنا طالب', 55),
    ],
  },
  // L7 — جُمَل العائلة
  {
    id: 'ar1-u8-l7', title: 'جُمَلُ العَائِلَة 👨‍👩‍👧‍👦', unitId: 'ar1-u8', order: 7, xpReward: 30, estimatedMinutes: 18,
    questions: [
      imgChoice('مَنِ الأُمُّ؟', 'مَنِ الأُمّ',
        [{ emoji: '👩', label: 'أُمٌّ' }, { emoji: '👨', label: 'أَبٌ' }, { emoji: '👴', label: 'جَدٌّ' }, { emoji: '👧', label: 'أُخْتٌ' }], 0),
      fbChoice('أَبِي ___ طَبِيبٌ', ['هُوَ', 'هِيَ', 'أَنَا'], 0, '👨‍⚕️'),
      wordOrder('رَتِّبِ الجُمْلَة', ['أُمِّي', 'أُحِبُّ', 'أَنَا', 'كَثِيراً'], 'أَنَا أُحِبُّ أُمِّي كَثِيراً'),
      tf('الجَدَّةُ هِيَ أُمُّ الأُمِّ 👵', true, 'صَحِيحٌ! الجَدَّةُ تَأْتِي مِنْ جِهَةِ الأُمِّ أَوِ الأَب ✅'),
      mc('مَا الصَّحِيح؟', ['أَخِي هُوَ كَبِيرٌ 👦', 'أَخِي هِيَ كَبِيرٌ', 'أَخِي هُوَ كَبِيرَة', 'أَخِي أَنَا كَبِير'], 0),
      sortGroups('صَنِّفْ أَفْرَادَ العَائِلَة', [
        { label: 'كِبَارٌ 👴👵', items: ['جَدٌّ 👴', 'جَدَّةٌ 👵', 'أَبٌ 👨', 'أُمٌّ 👩'] },
        { label: 'صِغَارٌ 👦👧', items: ['أَخٌ 👦', 'أُخْتٌ 👧'] },
      ]),
      readAloud('عَائِلَتِي صَغِيرَةٌ وَمُحِبَّة', 'عائلتي صغيرة ومحبة', 55),
    ],
  },
  // L8 — جُمَل المَدْرَسَة
  {
    id: 'ar1-u8-l8', title: 'جُمَلُ المَدْرَسَة 🏫', unitId: 'ar1-u8', order: 8, xpReward: 30, estimatedMinutes: 18,
    questions: [
      imgChoice('مَنِ المُعَلِّمَة؟', 'مَنِ المُعَلِّمَة',
        [{ emoji: '👩‍🏫', label: 'مُعَلِّمَةٌ' }, { emoji: '👩‍⚕️', label: 'طَبِيبَةٌ' }, { emoji: '👩‍🍳', label: 'طَبَّاخَة' }, { emoji: '👩‍✈️', label: 'طَيَّارَة' }], 0),
      fbChoice('أَنَا أَدْرُسُ فِي الـ ___', ['فَصْلِ 🏛️', 'بَيْتِ 🏠', 'سَيَّارَةِ 🚗'], 0),
      wordOrder('رَتِّبِ الجُمْلَة', ['مُعَلِّمَتِي', 'أُحِبُّ', 'أَنَا', 'طَيِّبَة'], 'أَنَا أُحِبُّ مُعَلِّمَتِي طَيِّبَة'),
      tf('السَّبُّورَةُ لِلْكِتَابَةِ عَلَيْهَا 📋', true),
      mc('مَاذَا يَفْعَلُ التِّلْمِيذُ فِي المَدْرَسَة؟', ['يَدْرُسُ وَيَتَعَلَّم 📚', 'يَنَامُ 😴', 'يَطْبُخُ 🍳', 'يَقُودُ سَيَّارَة 🚗'], 0),
      comprehension(
        'أَنَا أَحْمَد.\nأَدْرُسُ فِي الفَصْلِ الأَوَّل.\nمُعَلِّمَتِي اسْمُهَا سَمِيرَة.\nهِيَ طَيِّبَةٌ جِدّاً. 👩‍🏫',
        'أَنَا أَحْمَد. أَدْرُسُ فِي الفَصْلِ الأَوَّل. مُعَلِّمَتِي اسْمُهَا سَمِيرَة. هِيَ طَيِّبَةٌ جِدّاً.',
        [
          { q: 'مَا اسْمُ التِّلْمِيذ؟', options: ['سَمِيرَة', 'أَحْمَد', 'مُحَمَّد'], correct: 1 },
          { q: 'كَيْفَ المُعَلِّمَة؟', options: ['صَارِمَة', 'طَيِّبَة', 'مَشْغُولَة'], correct: 1 },
        ],
      ),
      readAloud('أَنَا تِلْمِيذٌ مُجْتَهِدٌ فِي المَدْرَسَة', 'أنا تلميذ مجتهد في المدرسة', 55),
    ],
  },
  // L9 — حِوَارٌ قَصِير
  {
    id: 'ar1-u8-l9', title: 'حِوَارٌ قَصِير 💬', unitId: 'ar1-u8', order: 9, xpReward: 35, estimatedMinutes: 20,
    questions: [
      mc('كَيْفَ نُجِيبُ عَلَى "كَيْفَ حَالُك؟"', ['أَنَا بِخَيْرٍ، شُكْراً 😊', 'أَنَا اسْمِي سَامِي', 'أَنَا فِي المَدْرَسَة', 'أَنَا آكُلُ'], 0),
      fbChoice('مَرْحَباً! ___ اسْمُك؟', ['مَا', 'مَنْ', 'أَيْنَ'], 0),
      wordOrder('رَتِّبِ الحِوَار', ['سَامِي', 'اسْمِي', 'أَنَا'], 'أَنَا اسْمِي سَامِي'),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'كَيْفَ حَالُك؟ 🙂', match: 'أَنَا بِخَيْر' },
        { arabic: 'مَا اسْمُك؟ 👤', match: 'اسْمِي لَيْلَى' },
        { arabic: 'مِنْ أَيْنَ أَنْتَ؟ 📍', match: 'أَنَا مِنَ الجَلِيل' },
      ]),
      tf('نَقُولُ "مَرْحَبَيْن" لِلتَّرْحِيبِ بِشَخْصَيْن', true, 'صَحِيحٌ! مَرْحَبَيْن تَعْنِي أَهْلاً بِكُمَا ✅'),
      comprehension(
        '— مَرْحَباً! مَا اسْمُك؟\n— اسْمِي رَنَا.\n— أَهْلاً رَنَا! مِنْ أَيْنَ أَنْتِ؟\n— أَنَا مِنَ النَّاصِرَة. 🕊️',
        '— مرحباً! ما اسمك؟ — اسمي رنا. — أهلاً رنا! من أين أنتِ؟ — أنا من الناصرة.',
        [
          { q: 'مَا اسْمُ البِنْت؟', options: ['لَيْلَى', 'رَنَا', 'سَارَة'], correct: 1 },
          { q: 'مِنْ أَيْنَ هِيَ؟', options: ['مِنْ حَيْفَا', 'مِنَ النَّاصِرَة', 'مِنَ القُدْس'], correct: 1 },
        ],
      ),
      readAloud('مَرْحَباً! أَنَا بِخَيْرٍ وَأَنْتَ؟', 'مرحباً! أنا بخير وأنت؟', 55),
    ],
  },
  // L10 — اخْتِبَار الوَحْدَة 8 (12 أسئلة)
  {
    id: 'ar1-u8-l10', title: 'اخْتِبَارُ الوَحْدَة الثَّامِنَة ⭐', unitId: 'ar1-u8', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['هَذِهِ أُمٌّ جَمِيلَة 👩', 'هَذَا أُمٌّ جَمِيلَة', 'هَذِهِ أَبٌ كَبِير', 'هَذَا أُخْتٌ صَغِيرَة'], 0),
      fbChoice('___ قِطَّةٌ صَغِيرَة وَجَمِيلَة', ['هَذِهِ', 'هَذَا', 'هُوَ'], 0, '🐱'),
      fbChoice('أَخِي ___ طَوِيلٌ وَقَوِيّ', ['هُوَ', 'هِيَ', 'هَذِهِ'], 0, '👦'),
      wordOrder('رَتِّبِ الجُمْلَة', ['كِتَابٌ', 'عِنْدِي', 'وَقَلَمٌ'], 'عِنْدِي كِتَابٌ وَقَلَمٌ'),
      tf('نَقُولُ "أَنَا آكُلُ" بِالعَرَبِيِّ الصَّحِيح 🍽️', true),
      tf('الفِيلُ لَيْسَ حَيَوَاناً أَلِيفاً 🐘🚫', true, 'صَحِيحٌ! الفِيلُ حَيَوَانٌ بَرِّيٌّ ✅'),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِجُمْلَتِها', [
        { image: '🏠', word: 'هَذَا بَيْتٌ' }, { image: '🐱', word: 'هَذِهِ قِطَّةٌ' },
        { image: '📚', word: 'عِنْدِي كِتَابٌ' }, { image: '👩‍🏫', word: 'هِيَ مُعَلِّمَة' },
      ]),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'مَنْ هَذَا؟ 👤', match: 'هَذَا أَبِي 👨' },
        { arabic: 'مَا هَذَا؟ ❓', match: 'هَذَا قَلَمٌ ✏️' },
        { arabic: 'أَيْنَ الكِتَاب؟ 📍', match: 'فِي الحَقِيبَة 🎒' },
      ]),
      sortGroups('صَنِّفِ الجُمَل', [
        { label: 'إِيجَابِيَّة ✅', items: ['هَذَا كَلْبٌ 🐕', 'عِنْدِي كِتَابٌ 📚', 'هِيَ مُعَلِّمَةٌ 👩‍🏫'] },
        { label: 'نَفِيَّة 🚫', items: ['هَذَا لَيْسَ قِطَّة 🚫🐱', 'أَبِي لَيْسَ مُعَلِّماً 🚫'] },
      ]),
      comprehension(
        'هَذَا بَيْتُنَا.\nهُوَ كَبِيرٌ وَجَمِيل.\nعِنْدَنَا حَدِيقَةٌ خَضْرَاء.\nنَلْعَبُ فِيهَا كُلَّ يَوْم. 🏡🌿',
        'هَذَا بَيْتُنَا. هُوَ كَبِيرٌ وَجَمِيل. عِنْدَنَا حَدِيقَةٌ خَضْرَاء. نَلْعَبُ فِيهَا كُلَّ يَوْم.',
        [
          { q: 'كَيْفَ البَيْت؟', options: ['صَغِيرٌ وَقَدِيم', 'كَبِيرٌ وَجَمِيل', 'بَعِيدٌ وَحَزِين'], correct: 1 },
          { q: 'أَيْنَ يَلْعَبُون؟', options: ['فِي الشَّارِع', 'فِي المَدْرَسَة', 'فِي الحَدِيقَة'], correct: 2 },
          { q: 'مَتَى يَلْعَبُون؟', options: ['كُلَّ يَوْم', 'فِي العُطَل', 'أَحْيَاناً'], correct: 0 },
        ],
      ),
      dragOrder('رَتِّبِ الجُمَلَ مَنْطِقِيّاً', [
        { text: '🌅 أَصْحُو صَبَاحاً', order: 1 },
        { text: '🍳 آكُلُ الإِفْطَار', order: 2 },
        { text: '🏫 أَذْهَبُ لِلْمَدْرَسَة', order: 3 },
        { text: '🌙 أَنَامُ لَيْلاً', order: 4 },
      ]),
      readAloud('أَنَا أُحِبُّ بَيْتِي وَعَائِلَتِي وَمَدْرَسَتِي', 'أنا أحب بيتي وعائلتي ومدرستي', 55),
    ],
  },
];

// ─── UNIT 9: النُّصُوص القَصِيرَة ────────────────────────────────────────────────────────
export const UNIT9_LESSONS = [
  // L1 — نَصٌّ سَرْدِيّ: عَائِلَتِي
  {
    id: 'ar1-u9-l1', title: 'نَصٌّ: عَائِلَتِي 👨‍👩‍👧', unitId: 'ar1-u9', order: 1, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'أَنَا سَامِي.\nعِنْدِي أَبٌ وَأُمٌّ وَأُخْتٌ اسْمُهَا لَيْلَى.\nنَعِيشُ فِي بَيْتٍ كَبِيرٍ فِي الجَلِيل.\nأُحِبُّ عَائِلَتِي كَثِيراً. 💙',
        'أَنَا سَامِي. عِنْدِي أَبٌ وَأُمٌّ وَأُخْتٌ اسْمُهَا لَيْلَى. نَعِيشُ فِي بَيْتٍ كَبِيرٍ فِي الجَلِيل. أُحِبُّ عَائِلَتِي كَثِيراً.',
        [
          { q: 'مَا اسْمُ الوَلَد؟', options: ['سَامِي', 'مُحَمَّد', 'أَحْمَد'], correct: 0 },
          { q: 'مَا اسْمُ أُخْتِه؟', options: ['سَارَة', 'لَيْلَى', 'نَادِيَة'], correct: 1 },
          { q: 'كَيْفَ بَيْتُهُم؟', options: ['صَغِيرٌ', 'كَبِيرٌ', 'قَدِيمٌ'], correct: 1 },
        ],
      ),
      wordOrder('رَتِّبِ الجُمْلَة', ['عَائِلَتِي', 'أُحِبُّ', 'أَنَا', 'كَثِيراً'], 'أَنَا أُحِبُّ عَائِلَتِي كَثِيراً'),
      fbChoice('نَعِيشُ فِي بَيْتٍ ___', ['كَبِيرٍ 🏠', 'صَغِيرٍ 🏚️', 'قَدِيمٍ 🏛️'], 0),
      tf('سَامِي عِنْدَهُ أَخٌ اسْمُهُ لَيْلَى 👦', false, 'خَطَأٌ! لَيْلَى هِيَ أُخْتُه'),
      readAloud('أُحِبُّ عَائِلَتِي كَثِيراً 💙', 'أحب عائلتي كثيراً', 55),
      speak('عَائِلَتِي', '👨‍👩‍👧', 50),
    ],
  },
  // L2 — نَصٌّ: فِي المَدْرَسَة
  {
    id: 'ar1-u9-l2', title: 'نَصٌّ: فِي المَدْرَسَة 🏫', unitId: 'ar1-u9', order: 2, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'أَذْهَبُ إِلَى المَدْرَسَةِ كُلَّ يَوْم.\nعِنْدِي كِتَابٌ وَقَلَمٌ وَحَقِيبَة.\nأُحِبُّ مُعَلِّمَتِي كَثِيراً.\nأَنَا طَالِبٌ مُجْتَهِد. 🏫📚',
        'أَذْهَبُ إِلَى المَدْرَسَةِ كُلَّ يَوْم. عِنْدِي كِتَابٌ وَقَلَمٌ وَحَقِيبَة. أُحِبُّ مُعَلِّمَتِي كَثِيراً. أَنَا طَالِبٌ مُجْتَهِد.',
        [
          { q: 'مَتَى يَذْهَبُ الطَّالِبُ لِلْمَدْرَسَة؟', options: ['كُلَّ يَوْم', 'أَحْيَاناً', 'فِي العُطَل'], correct: 0 },
          { q: 'مَا الذِي يَحْمِلُهُ مَعَه؟', options: ['كُرَة وَلُعَب', 'كِتَاب وَقَلَم وَحَقِيبَة', 'طَعَام وَمَاء'], correct: 1 },
          { q: 'كَيْفَ الطَّالِب؟', options: ['كَسُول', 'مُجْتَهِد', 'خَجُول'], correct: 1 },
        ],
      ),
      sortGroups('صَنِّفِ أَدَوَاتِ المَدْرَسَة', [
        { label: 'لِلكِتَابَة ✏️', items: ['قَلَمٌ ✏️', 'مَمْحَاةٌ 🗑️', 'مِسْطَرَةٌ 📏'] },
        { label: 'لِلْقِرَاءَة 📚', items: ['كِتَابٌ 📚', 'دَفْتَرٌ 📔'] },
      ]),
      wordOrder('رَتِّبِ الجُمْلَة', ['إِلَى', 'أَذْهَبُ', 'المَدْرَسَةِ', 'كُلَّ', 'يَوْم'], 'أَذْهَبُ إِلَى المَدْرَسَةِ كُلَّ يَوْم'),
      speak('طَالِبٌ مُجْتَهِد', '🏫', 50),
    ],
  },
  // L3 — نَصٌّ: الحَيَوَانَات
  {
    id: 'ar1-u9-l3', title: 'نَصٌّ: الحَيَوَانَات 🐾', unitId: 'ar1-u9', order: 3, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'فِي حَدِيقَتِنَا قِطَّةٌ وَكَلْب.\nالقِطَّةُ اسْمُهَا مِيمِي، وَهِيَ بَيْضَاء.\nالكَلْبُ اسْمُهُ رِيكُو، وَهُوَ بُنِّي.\nهُمَا صَدِيقَانِ وَيَلْعَبَانِ مَعاً. 🐱🐕',
        'فِي حَدِيقَتِنَا قِطَّةٌ وَكَلْب. القِطَّةُ اسْمُهَا مِيمِي، وَهِيَ بَيْضَاء. الكَلْبُ اسْمُهُ رِيكُو، وَهُوَ بُنِّي. هُمَا صَدِيقَانِ وَيَلْعَبَانِ مَعاً.',
        [
          { q: 'مَا اسْمُ القِطَّة؟', options: ['رِيكُو', 'مِيمِي', 'بُبُو'], correct: 1 },
          { q: 'مَا لَوْنُ الكَلْب؟', options: ['أَبْيَض', 'أَسْوَد', 'بُنِّي'], correct: 2 },
          { q: 'كَيْفَ عَلَاقَتُهُمَا؟', options: ['يَتَشَاجَرَان', 'صَدِيقَان', 'خَائِفَان'], correct: 1 },
        ],
      ),
      tapPairs('صِلِ الاسْمَ بِالحَيَوَان', [
        { arabic: 'مِيمِي 🐱', match: 'قِطَّة' },
        { arabic: 'رِيكُو 🐕', match: 'كَلْب' },
      ]),
      fbChoice('مِيمِي قِطَّةٌ ___ اللَّوْن', ['بَيْضَاء', 'سَوْدَاء', 'بُنِّيَّة'], 0, '🐱'),
      readAloud('الكَلْبُ وَالقِطَّةُ صَدِيقَانِ', 'الكلب والقطة صديقان', 55),
    ],
  },
  // L4 — نَصٌّ وَصْفِيّ: الطَّبِيعَة
  {
    id: 'ar1-u9-l4', title: 'نَصٌّ: الطَّبِيعَة الجَمِيلَة 🌿', unitId: 'ar1-u9', order: 4, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'الطَّبِيعَةُ جَمِيلَةٌ وَرَائِعَة.\nفِي النَّهَارِ تُشْرِقُ الشَّمْسُ الذَّهَبِيَّة.\nوَفِي اللَّيْلِ يُضِيءُ القَمَرُ وَالنُّجُوم.\nالمَطَرُ يُنَمِّي الأَشْجَارَ وَالزُّهُور. 🌸🌧️',
        'الطَّبِيعَةُ جَمِيلَةٌ وَرَائِعَة. فِي النَّهَارِ تُشْرِقُ الشَّمْسُ الذَّهَبِيَّة. وَفِي اللَّيْلِ يُضِيءُ القَمَرُ وَالنُّجُوم. المَطَرُ يُنَمِّي الأَشْجَارَ وَالزُّهُور.',
        [
          { q: 'مَاذَا يُشْرِقُ فِي النَّهَار؟', options: ['القَمَرُ 🌙', 'النُّجُومُ ⭐', 'الشَّمْسُ ☀️'], correct: 2 },
          { q: 'مَاذَا يُنَمِّي المَطَر؟', options: ['الحَيَوَانَات', 'الأَشْجَارَ وَالزُّهُور', 'البُيُوت'], correct: 1 },
          { q: 'مَاذَا يُضِيءُ اللَّيْل؟', options: ['الشَّمْس', 'القَمَرُ وَالنُّجُوم', 'المَطَر'], correct: 1 },
        ],
      ),
      sortGroups('صَنِّفْ: نَهَار أَم لَيْل؟', [
        { label: 'نَهَارٌ ☀️', items: ['شَمْسٌ ☀️', 'ضَوْءٌ 💡', 'زُهُورٌ 🌸'] },
        { label: 'لَيْلٌ 🌙', items: ['قَمَرٌ 🌙', 'نُجُومٌ ⭐', 'نَوْمٌ 😴'] },
      ]),
      readAloud('الطَّبِيعَةُ جَمِيلَةٌ وَرَائِعَة', 'الطبيعة جميلة ورائعة', 55),
    ],
  },
  // L5 — حِوَارٌ: فِي المَنْزِل
  {
    id: 'ar1-u9-l5', title: 'حِوَارٌ: فِي المَنْزِل 🏠', unitId: 'ar1-u9', order: 5, xpReward: 45, estimatedMinutes: 22,
    questions: [
      comprehension(
        '— مَرْحَباً يَا مَرْيَم! كَيْفَ حَالُكِ؟\n— أَنَا بِخَيْر، شُكْراً يَا أُمِّي.\n— مَاذَا فَعَلْتِ فِي المَدْرَسَة؟\n— دَرَسْتُ وَرَسَمْتُ وَلَعِبْتُ مَعَ أَصْدِقَائِي. 😊',
        '— مرحباً يا مريم! كيف حالك؟ — أنا بخير، شكراً يا أمي. — ماذا فعلتِ في المدرسة؟ — درستُ ورسمتُ ولعبتُ مع أصدقائي.',
        [
          { q: 'مَنْ يَتَكَلَّم مَعَ مَرْيَم؟', options: ['أَبُوهَا', 'أُمُّهَا', 'مُعَلِّمَتُهَا'], correct: 1 },
          { q: 'مَاذَا فَعَلَتْ مَرْيَمُ فِي المَدْرَسَة؟', options: ['نَامَتْ', 'دَرَسَتْ وَرَسَمَتْ وَلَعِبَتْ', 'أَكَلَتْ فَقَط'], correct: 1 },
          { q: 'كَيْفَ حَالُ مَرْيَم؟', options: ['تَعْبَانَة', 'حَزِينَة', 'بِخَيْر'], correct: 2 },
        ],
      ),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'كَيْفَ حَالُك؟ 🙂', match: 'أَنَا بِخَيْر' },
        { arabic: 'مَاذَا فَعَلْتَ؟ 🤔', match: 'دَرَسْتُ وَلَعِبْتُ' },
        { arabic: 'أَيْنَ كُنْتَ؟ 📍', match: 'فِي المَدْرَسَة' },
      ]),
      fbChoice('أَنَا ___ شُكْراً', ['بِخَيْر،', 'تَعْبَان،', 'حَزِين،'], 0),
      readAloud('أَنَا بِخَيْرٍ وَسَعِيدٌ', 'أنا بخير وسعيد', 55),
    ],
  },
  // L6 — نَصٌّ: يَوْمِي
  {
    id: 'ar1-u9-l6', title: 'نَصٌّ: يَوْمِي 🌅', unitId: 'ar1-u9', order: 6, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'أَصْحُو صَبَاحاً وَأَغْسِلُ وَجْهِي.\nآكُلُ إِفْطَاراً لَذِيذاً مَعَ عَائِلَتِي.\nأَذْهَبُ إِلَى المَدْرَسَةِ بِالحَافِلَة.\nبَعْدَ المَدْرَسَةِ أَلْعَبُ وَأُذَاكِرُ. 🌅🏫',
        'أَصْحُو صَبَاحاً وَأَغْسِلُ وَجْهِي. آكُلُ إِفْطَاراً لَذِيذاً مَعَ عَائِلَتِي. أَذْهَبُ إِلَى المَدْرَسَةِ بِالحَافِلَة. بَعْدَ المَدْرَسَةِ أَلْعَبُ وَأُذَاكِرُ.',
        [
          { q: 'مَاذَا يَفْعَلُ أَوَّلاً؟', options: ['يَذْهَبُ لِلْمَدْرَسَة', 'يَأْكُلُ الإِفْطَار', 'يَصْحُو وَيَغْسِلُ وَجْهَهُ'], correct: 2 },
          { q: 'كَيْفَ يَذْهَبُ لِلْمَدْرَسَة؟', options: ['بِالسَّيَّارَة', 'بِالحَافِلَة', 'مَشْياً'], correct: 1 },
          { q: 'مَاذَا يَفْعَلُ بَعْدَ المَدْرَسَة؟', options: ['يَنَامُ', 'يَلْعَبُ وَيُذَاكِر', 'يُشَاهِدُ التِّلفَاز'], correct: 1 },
        ],
      ),
      dragOrder('رَتِّبِ أَحْدَاثَ اليَوْم', [
        { text: '😴 الاسْتِيقَاظ', order: 1 }, { text: '🍳 الإِفْطَار', order: 2 },
        { text: '🚌 المَدْرَسَة', order: 3 }, { text: '🎮 اللَّعِب', order: 4 }, { text: '😴 النَّوْم', order: 5 },
      ]),
      readAloud('أَصْحُو وَآكُلُ وَأَذْهَبُ لِلْمَدْرَسَة', 'أصحو وآكل وأذهب للمدرسة', 55),
    ],
  },
  // L7 — نَصٌّ: طَعَامِي المُفَضَّل
  {
    id: 'ar1-u9-l7', title: 'نَصٌّ: طَعَامِي المُفَضَّل 🍎', unitId: 'ar1-u9', order: 7, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'أَنَا أُحِبُّ الفَاكِهَة كَثِيراً.\nأُفَضِّلُ التُّفَّاحَةَ الحَمْرَاء وَالمَوْزَ الأَصْفَر.\nأَشْرَبُ حَلِيباً كُلَّ صَبَاح.\nالطَّعَامُ الصِّحِّيُّ يُقَوِّينِي وَيُسْعِدُنِي. 🍎🍌🥛',
        'أَنَا أُحِبُّ الفَاكِهَة كَثِيراً. أُفَضِّلُ التُّفَّاحَةَ الحَمْرَاء وَالمَوْزَ الأَصْفَر. أَشْرَبُ حَلِيباً كُلَّ صَبَاح. الطَّعَامُ الصِّحِّيُّ يُقَوِّينِي وَيُسْعِدُنِي.',
        [
          { q: 'مَا الفَاكِهَةُ المُفَضَّلَة؟', options: ['البُرْتُقَال', 'التُّفَّاحَة وَالمَوْز', 'العِنَب'], correct: 1 },
          { q: 'مَتَى يَشْرَبُ الحَلِيب؟', options: ['مَسَاءً', 'كُلَّ صَبَاح', 'أَحْيَاناً'], correct: 1 },
          { q: 'مَاذَا يَفْعَلُ الطَّعَامُ الصِّحِّي؟', options: ['يُتْعِبُ', 'يُقَوِّي وَيُسْعِد', 'يُنَوِّم'], correct: 1 },
        ],
      ),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🍎', word: 'تُفَّاحَةٌ حَمْرَاء' }, { image: '🍌', word: 'مَوْزٌ أَصْفَر' },
        { image: '🥛', word: 'حَلِيبٌ أَبْيَض' }, { image: '🍊', word: 'بُرْتُقَالٌ' },
      ]),
      readAloud('الطَّعَامُ الصِّحِّيُّ يُقَوِّينِي', 'الطعام الصحي يقويني', 55),
    ],
  },
  // L8 — نَصٌّ: الأَلْوَان فِي حَيَاتِنَا
  {
    id: 'ar1-u9-l8', title: 'نَصٌّ: الأَلْوَان حَوْلَنَا 🌈', unitId: 'ar1-u9', order: 8, xpReward: 40, estimatedMinutes: 20,
    questions: [
      comprehension(
        'الأَلْوَانُ فِي حَيَاتِنَا كَثِيرَة.\nالسَّمَاءُ زَرْقَاء وَالشَّمْسُ صَفْرَاء.\nالعُشْبُ أَخْضَرُ وَالوَرْدَةُ حَمْرَاء.\nأُحِبُّ جَمِيعَ الأَلْوَان! 🌈',
        'الأَلْوَانُ فِي حَيَاتِنَا كَثِيرَة. السَّمَاءُ زَرْقَاء وَالشَّمْسُ صَفْرَاء. العُشْبُ أَخْضَرُ وَالوَرْدَةُ حَمْرَاء. أُحِبُّ جَمِيعَ الأَلْوَان!',
        [
          { q: 'مَا لَوْنُ السَّمَاء؟', options: ['أَخْضَر', 'أَزْرَق', 'أَحْمَر'], correct: 1 },
          { q: 'مَا لَوْنُ العُشْب؟', options: ['أَصْفَر', 'أَزْرَق', 'أَخْضَر'], correct: 2 },
          { q: 'مَا لَوْنُ الوَرْدَة؟', options: ['أَحْمَر', 'أَبْيَض', 'بُنِّي'], correct: 0 },
        ],
      ),
      sortGroups('صَنِّفِ الأَشْيَاءَ حَسَبَ لَوْنِهَا', [
        { label: 'أَزْرَق 🔵', items: ['سَمَاء ☁️', 'بَحْر 🌊', 'قَمِيصٌ 👕'] },
        { label: 'أَخْضَر 🟢', items: ['عُشْب 🌿', 'شَجَرَة 🌳', 'بِطِّيخ 🍉'] },
        { label: 'أَحْمَر 🔴', items: ['تُفَّاحَة 🍎', 'وَرْدَة 🌹', 'قَلْب ❤️'] },
      ]),
      readAloud('أُحِبُّ جَمِيعَ الأَلْوَان 🌈', 'أحب جميع الألوان', 55),
    ],
  },
  // L9 — مُرَاجَعَة النُّصُوص + AI
  {
    id: 'ar1-u9-l9', title: 'مُرَاجَعَة وَمُحَادَثَة 💬', unitId: 'ar1-u9', order: 9, xpReward: 45, estimatedMinutes: 22,
    questions: [
      comprehension(
        'أَنَا يُوسُف مِنَ النَّاصِرَة.\nعِنْدِي أَبٌ طَبِيبٌ وَأُمٌّ مُعَلِّمَة.\nأُحِبُّ الرِّيَاضَةَ وَالرَّسْم.\nحُلْمِي أَنْ أَكُونَ مُهَنْدِساً. 🌟',
        'أَنَا يُوسُف مِنَ النَّاصِرَة. عِنْدِي أَبٌ طَبِيبٌ وَأُمٌّ مُعَلِّمَة. أُحِبُّ الرِّيَاضَةَ وَالرَّسْم. حُلْمِي أَنْ أَكُونَ مُهَنْدِساً.',
        [
          { q: 'مِنْ أَيْنَ يُوسُف؟', options: ['مِنْ حَيْفَا', 'مِنَ النَّاصِرَة', 'مِنَ القُدْس'], correct: 1 },
          { q: 'مَا مِهْنَةُ أَبِيه؟', options: ['مُعَلِّم', 'طَبِيب', 'مُهَنْدِس'], correct: 1 },
          { q: 'مَا حُلْمُ يُوسُف؟', options: ['طَبِيب', 'مُعَلِّم', 'مُهَنْدِس'], correct: 2 },
        ],
      ),
      mc('مَا مِهْنَةُ أُمِّ يُوسُف؟', ['طَبِيبَة 👩‍⚕️', 'مُعَلِّمَة 👩‍🏫', 'مُهَنْدِسَة 👩‍💻', 'مُمَرِّضَة 💉'], 1),
      aiConv(
        'عَرِّفْ نُوراً بِنَفْسِك وَعَائِلَتِك',
        'أنت نور، معلمة لطيفة لطفل في الصف الأول. اسأله عن نفسه وعائلته. استخدم مفردات: اسم، عائلة، أب، أم، بيت، مدرسة. الجمل لا تتجاوز 5 كلمات. ابدأ: "مَرْحَباً! مَنْ أَنْتَ؟ 😊"',
      ),
    ],
  },
  // L10 — اخْتِبَار الوَحْدَة 9 (12 أسئلة)
  {
    id: 'ar1-u9-l10', title: 'اخْتِبَارُ الوَحْدَة التَّاسِعَة ⭐', unitId: 'ar1-u9', order: 10, xpReward: 60, estimatedMinutes: 28,
    questions: [
      comprehension(
        'أَنَا نُورٌ.\nأَسْكُنُ فِي بَيْتٍ جَمِيلٍ مَعَ عَائِلَتِي.\nأَذْهَبُ لِلْمَدْرَسَةِ صَبَاحاً.\nأُحِبُّ الكِتَابَةَ وَالرَّسْم. ✏️🎨',
        'أَنَا نُور. أَسْكُنُ فِي بَيْتٍ جَمِيلٍ مَعَ عَائِلَتِي. أَذْهَبُ لِلْمَدْرَسَةِ صَبَاحاً. أُحِبُّ الكِتَابَةَ وَالرَّسْم.',
        [
          { q: 'أَيْنَ تَسْكُنُ نُور؟', options: ['فِي مَدْرَسَة', 'فِي بَيْتٍ مَعَ عَائِلَتِهَا', 'وَحْدَهَا'], correct: 1 },
          { q: 'مَتَى تَذْهَبُ لِلْمَدْرَسَة؟', options: ['مَسَاءً', 'صَبَاحاً', 'لَيْلاً'], correct: 1 },
          { q: 'مَاذَا تُحِبُّ نُور؟', options: ['اللَّعِب وَالأَكْل', 'الكِتَابَة وَالرَّسْم', 'النَّوْم وَالتَّلفَاز'], correct: 1 },
        ],
      ),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🏫', word: 'مَدْرَسَة' }, { image: '🏠', word: 'بَيْت' },
        { image: '👨‍👩‍👧', word: 'عَائِلَة' }, { image: '✏️', word: 'قَلَم' },
      ]),
      sortGroups('صَنِّفِ الكَلِمَات', [
        { label: 'مَكَان 📍', items: ['بَيْتٌ 🏠', 'مَدْرَسَةٌ 🏫', 'حَدِيقَةٌ 🌳'] },
        { label: 'شَخْص 👤', items: ['أَبٌ 👨', 'أُمٌّ 👩', 'مُعَلِّمَةٌ 👩‍🏫'] },
        { label: 'فِعْل 🏃', items: ['أَذْهَبُ 🚶', 'أَدْرُسُ 📚', 'أَلْعَبُ 🎮'] },
      ]),
      fbChoice('أَذْهَبُ إِلَى المَدْرَسَةِ ___ صَبَاحاً', ['كُلَّ يَوْم', 'أَحْيَاناً', 'نَادِراً'], 0),
      tf('الطَّعَامُ الصِّحِّيُّ يُقَوِّي الجِسْم 💪', true, 'صَحِيحٌ! الطَّعَامُ الجَيِّدُ يُعْطِي طَاقَة ✅'),
      wordOrder('رَتِّبِ الجُمْلَة', ['جَمِيلَة', 'الطَّبِيعَةُ', 'رَائِعَةٌ', 'وَ'], 'الطَّبِيعَةُ جَمِيلَة وَرَائِعَةٌ'),
      mc('مَاذَا يُضِيءُ النَّهَار؟', ['الشَّمْسُ ☀️', 'القَمَرُ 🌙', 'النُّجُومُ ⭐', 'المَصْبَاحُ 💡'], 0),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'كَيْفَ حَالُك؟ 🙂', match: 'أَنَا بِخَيْر' },
        { arabic: 'مِنْ أَيْنَ أَنْتَ؟ 📍', match: 'أَنَا مِنَ الجَلِيل' },
        { arabic: 'مَا اسْمُك؟ 👤', match: 'اسْمِي نُور' },
      ]),
      dragOrder('رَتِّبِ أَحْدَاثَ القِصَّة', [
        { text: '🌅 صَحَا صَبَاحاً', order: 1 }, { text: '🍳 أَكَلَ الإِفْطَار', order: 2 },
        { text: '🚌 رَكِبَ الحَافِلَة', order: 3 }, { text: '🏫 وَصَلَ المَدْرَسَة', order: 4 },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَة', 'مَدْرَسَةٌ',
        [{ emoji: '🏠', label: 'بَيْت' }, { emoji: '🏫', label: 'مَدْرَسَة' }, { emoji: '🌳', label: 'حَدِيقَة' }, { emoji: '🚌', label: 'حَافِلَة' }], 1),
      readAloud('أُحِبُّ عَائِلَتِي وَمَدْرَسَتِي وَطَبِيعَتِي', 'أحب عائلتي ومدرستي وطبيعتي', 55),
      speak('أَنَا سَعِيدٌ', '😊', 55),
    ],
  },
];

// ─── UNIT 10: التَّقْيِيم النِّهَائِي ─────────────────────────────────────────────────────
export const UNIT10_LESSONS = [
  // L1 — اخْتِبَار الحُرُوف وَالمُفْرَدَات
  {
    id: 'ar1-u10-l1', title: 'اخْتِبَار: الحُرُوف وَالمُفْرَدَات 🔤', unitId: 'ar1-u10', order: 1, xpReward: 80, estimatedMinutes: 25,
    questions: [
      mc('كَمْ حَرْفاً فِي اللُّغَةِ العَرَبِيَّة؟', ['٢٤', '٢٦', '٢٨', '٣٠'], 2),
      mc('أَيُّ الحُرُوفِ لَهُ نُقْطَتَانِ فَوْقَه؟', ['ب', 'ت', 'ث', 'ج'], 1),
      mc('مَا اسْمُ الحَرَكَةِ تَحْتَ الحَرْف (إِ)؟', ['فَتْحَة', 'ضَمَّة', 'كَسْرَة', 'سُكُون'], 2),
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🦁', word: 'أَسَدٌ' }, { image: '🐕', word: 'كَلْبٌ' },
        { image: '👨', word: 'أَبٌ' }, { image: '🏠', word: 'بَيْتٌ' },
      ]),
      sortGroups('صَنِّفِ الكَلِمَاتِ', [
        { label: 'حَيَوَانَاتٌ 🐾', items: ['أَسَدٌ 🦁', 'كَلْبٌ 🐕', 'قِطَّةٌ 🐱'] },
        { label: 'عَائِلَة 👨‍👩‍👧', items: ['أَبٌ 👨', 'أُمٌّ 👩', 'أَخٌ 👦'] },
        { label: 'أَلْوَان 🌈', items: ['أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَصْفَرُ 🟡'] },
      ]),
      tapPairs('صِلِ العُضْوَ بِوَظِيفَتِه', [
        { arabic: 'عَيْنٌ 👁️', match: 'نَرَى' },
        { arabic: 'أُذُنٌ 👂', match: 'نَسْمَعُ' },
        { arabic: 'أَنْفٌ 👃', match: 'نَشَمُّ' },
      ]),
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَة', 'حَافِلَةٌ',
        [{ emoji: '🚗', label: 'سَيَّارَة' }, { emoji: '🚌', label: 'حَافِلَة' }, { emoji: '✈️', label: 'طَائِرَة' }, { emoji: '🚲', label: 'دَرَّاجَة' }], 1),
      dragOrder('رَتِّبِ الأَرْقَامَ مِنَ الأَصْغَرِ لِلْأَكْبَر', [
        { text: '3️⃣ ثَلَاثَة', order: 3 }, { text: '1️⃣ وَاحِد', order: 1 },
        { text: '5️⃣ خَمْسَة', order: 5 }, { text: '2️⃣ اثْنَان', order: 2 },
        { text: '4️⃣ أَرْبَعَة', order: 4 },
      ]),
      tf('الطَّائِرَةُ وَسِيلَةٌ جَوِّيَّة ✈️', true, 'صَحِيحٌ! تَطِيرُ فِي السَّمَاء ✅'),
      readAloud('أَنَا أَعْرِفُ حُرُوفَ اللُّغَةِ العَرَبِيَّة', 'أنا أعرف حروف اللغة العربية', 55),
      speak('لُغَتِي العَرَبِيَّة', '🌟', 55),
    ],
  },
  // L2 — اخْتِبَار: الجُمَل وَالنُّصُوص
  {
    id: 'ar1-u10-l2', title: 'اخْتِبَار: الجُمَل وَالنُّصُوص 📝', unitId: 'ar1-u10', order: 2, xpReward: 80, estimatedMinutes: 25,
    questions: [
      mc('أَيُّ الجُمَلِ صَحِيحَة؟', ['هَذِهِ أُمٌّ كَرِيمَة 👩', 'هَذَا أُمٌّ كَرِيمَة', 'هَذِهِ أَبٌ طَيِّب', 'هَذَا بِنْتٌ جَمِيلَة'], 0),
      fbChoice('أَخِي ___ طَوِيلٌ وَقَوِيّ', ['هُوَ', 'هِيَ', 'أَنَا'], 0, '👦'),
      wordOrder('رَتِّبِ الجُمْلَة', ['كِتَابٌ', 'وَقَلَمٌ', 'عِنْدِي', 'وَحَقِيبَة'], 'عِنْدِي كِتَابٌ وَقَلَمٌ وَحَقِيبَة'),
      tf('نَقُولُ "هَذِهِ أُمٌّ" لِأَنَّ "أُمّ" مُؤَنَّثَة 👩', true),
      comprehension(
        'أَنَا لَيْلَى مِنَ القُدْس.\nأُحِبُّ الأَلْوَانَ وَالرَّسْم.\nلَوْنِي المُفَضَّلُ أَزْرَقُ مِثْلَ السَّمَاء.\nأُرِيدُ أَنْ أَكُونَ رَسَّامَة. 🎨',
        'أَنَا لَيْلَى مِنَ القُدْس. أُحِبُّ الأَلْوَانَ وَالرَّسْم. لَوْنِي المُفَضَّلُ أَزْرَقُ مِثْلَ السَّمَاء. أُرِيدُ أَنْ أَكُونَ رَسَّامَة.',
        [
          { q: 'مِنْ أَيْنَ لَيْلَى؟', options: ['مِنَ النَّاصِرَة', 'مِنَ القُدْس', 'مِنْ حَيْفَا'], correct: 1 },
          { q: 'مَا لَوْنُهَا المُفَضَّل؟', options: ['أَحْمَرُ 🔴', 'أَزْرَقُ 🔵', 'أَصْفَرُ 🟡'], correct: 1 },
          { q: 'مَاذَا تُرِيدُ أَنْ تَكُون؟', options: ['مُعَلِّمَة', 'طَبِيبَة', 'رَسَّامَة'], correct: 2 },
        ],
      ),
      sortGroups('صَنِّفِ الجُمَل', [
        { label: 'إِيجَابِيَّة ✅', items: ['هَذَا بَيْتٌ 🏠', 'عِنْدِي كِتَابٌ 📚', 'هِيَ مُعَلِّمَةٌ 👩‍🏫'] },
        { label: 'نَفِيَّة 🚫', items: ['الأَسَدُ لَيْسَ أَلِيفاً 🦁', 'هَذَا لَيْسَ قَلَماً'] },
      ]),
      tapPairs('صِلِ السُّؤَالَ بِجَوَابِه', [
        { arabic: 'مَنْ هَذَا؟ 👤', match: 'هَذَا أَبِي' },
        { arabic: 'مَا هَذَا؟ ❓', match: 'هَذَا كِتَابٌ' },
        { arabic: 'أَيْنَ بَيْتُك؟ 🏠', match: 'بَيْتِي فِي الجَلِيل' },
      ]),
      listenChoice('عِنْدِي',
        ['عِنْدِي 🤲', 'هَذَا 👆', 'لَيْسَ 🚫'], 0),
      readAloud('أَنَا أُحِبُّ اللُّغَةَ العَرَبِيَّة', 'أنا أحب اللغة العربية', 55),
      speak('أَنَا أَتَكَلَّمُ عَرَبِيّاً', '💬', 55),
    ],
  },
  // L3 — الاخْتِبَار النِّهَائِي الشَّامِل (12 أسئلة)
  {
    id: 'ar1-u10-l3', title: 'الاخْتِبَارُ النِّهَائِيُّ 🏆', unitId: 'ar1-u10', order: 3, xpReward: 150, estimatedMinutes: 35,
    questions: [
      // حروف
      mc('مَا اسْمُ الحَرَكَةِ فَوْقَ الحَرْف (بَ)؟', ['كَسْرَة', 'فَتْحَة', 'ضَمَّة', 'سُكُون'], 1),
      // صور ومفردات
      imgMatch('صِلْ كُلَّ صُورَةٍ بِاسْمِهَا', [
        { image: '🍎', word: 'تُفَّاحَةٌ' }, { image: '🚌', word: 'حَافِلَةٌ' },
        { image: '👁️', word: 'عَيْنٌ' }, { image: '🌳', word: 'شَجَرَةٌ' },
      ]),
      // تصنيف شامل
      sortGroups('صَنِّفِ الكَلِمَات', [
        { label: 'طَعَامٌ 🍽️', items: ['خُبْزٌ 🍞', 'تُفَّاحَةٌ 🍎', 'حَلِيبٌ 🥛'] },
        { label: 'طَبِيعَةٌ 🌿', items: ['شَمْسٌ ☀️', 'قَمَرٌ 🌙', 'شَجَرَةٌ 🌳'] },
        { label: 'جِسْمٌ 👤', items: ['رَأْسٌ 👤', 'يَدٌ ✋', 'رِجْلٌ 🦵'] },
      ]),
      // استماع
      listenImg('اسْتَمِعْ وَاخْتَرِ الصُّورَة', 'زَهْرَةٌ',
        [{ emoji: '🌸', label: 'زَهْرَة' }, { emoji: '🌳', label: 'شَجَرَة' }, { emoji: '🌧️', label: 'مَطَر' }, { emoji: '⭐', label: 'نَجْم' }], 0),
      // جملة
      fbChoice('___ قِطَّةٌ صَغِيرَةٌ وَجَمِيلَة', ['هَذِهِ', 'هَذَا', 'هُوَ'], 0, '🐱'),
      tf('نَقُولُ "أَنَا آكُلُ" بِالعَرَبِيِّ الصَّحِيح 🍽️', true),
      // ترتيب
      wordOrder('رَتِّبِ الجُمْلَة', ['أَنَا', 'اللُّغَةَ', 'أُحِبُّ', 'العَرَبِيَّة'], 'أَنَا أُحِبُّ اللُّغَةَ العَرَبِيَّة'),
      // نص استيعابي
      comprehension(
        'أَنَا رِيمٌ، طَالِبَةٌ فِي الصَّفِّ الأَوَّل.\nأُحِبُّ اللُّغَةَ العَرَبِيَّةَ وَالرِّيَاضِيَّات.\nعِنْدِي أَصْدِقَاءُ كَثِيرُون.\nسَأَكُونُ طَبِيبَةً فِي المُسْتَقْبَل. 🌟',
        'أَنَا رِيمٌ، طَالِبَةٌ فِي الصَّفِّ الأَوَّل. أُحِبُّ اللُّغَةَ العَرَبِيَّةَ وَالرِّيَاضِيَّات. عِنْدِي أَصْدِقَاءُ كَثِيرُون. سَأَكُونُ طَبِيبَةً فِي المُسْتَقْبَل.',
        [
          { q: 'فِي أَيِّ صَفٍّ رِيم؟', options: ['الثَّانِي', 'الأَوَّل', 'الثَّالِث'], correct: 1 },
          { q: 'مَا الذِي تُحِبُّه رِيم؟', options: ['الرَّسْم وَالمُوسِيقَى', 'العَرَبِيَّة وَالرِّيَاضِيَّات', 'الرِّيَاضَة وَالطَّبْخ'], correct: 1 },
          { q: 'مَاذَا تُرِيدُ أَنْ تَكُون؟', options: ['مُعَلِّمَة', 'مُهَنْدِسَة', 'طَبِيبَة'], correct: 2 },
        ],
      ),
      // ربط
      tapPairs('صِلِ الكَلِمَةَ بِنَقِيضِهَا', [
        { arabic: 'كَبِيرٌ 🏠', match: 'صَغِيرٌ 🏚️' },
        { arabic: 'نَهَارٌ ☀️', match: 'لَيْلٌ 🌙' },
        { arabic: 'طَوِيلٌ 📏', match: 'قَصِيرٌ' },
      ]),
      // ترتيب أحداث
      dragOrder('رَتِّبِ يَوْمَ الطَّالِب', [
        { text: '🌅 الاسْتِيقَاظ', order: 1 }, { text: '🍳 الإِفْطَار', order: 2 },
        { text: '🏫 المَدْرَسَة', order: 3 }, { text: '📚 المُذَاكَرَة', order: 4 }, { text: '😴 النَّوْم', order: 5 },
      ]),
      readAloud('أَنَا أُحِبُّ اللُّغَةَ العَرَبِيَّةَ وَأَتَعَلَّمُهَا كُلَّ يَوْم', 'أنا أحب اللغة العربية وأتعلمها كل يوم', 55),
      speak('اللُّغَةُ العَرَبِيَّةُ لُغَتِي 🌟', '🏆', 55),
    ],
  },
];

// ─── Full curriculum export ───────────────────────────────────────────────────
export const GRADE1_ARABIC = {
  subject: 'عربي',
  gradeLevel: 1,
  units: [
    { id: 'ar1-u0', title: 'الوَعِي الصَّوْتِي — قَبْلَ الحُرُوف', order: 0, lessons: UNIT0_LESSONS },
    { id: 'ar1-u1', title: 'الحُرُوف: أ، ب، ت، ث، ن', order: 1, lessons: UNIT1_LESSONS },
    { id: 'ar1-u2', title: 'الحُرُوف: ج، ح، خ', order: 2, lessons: UNIT2_LESSONS },
    { id: 'ar1-u3', title: 'الحُرُوف: د ذ، ر ز، و', order: 3, lessons: UNIT3_LESSONS },
    { id: 'ar1-u4', title: 'أَنَا وَعَائِلَتِي 👨‍👩‍👧‍👦', order: 4, lessons: UNIT4_LESSONS },
    { id: 'ar1-u5', title: 'الأَلْوَانُ وَالأَرْقَام 🌈🔢', order: 5, lessons: UNIT5_LESSONS },
    { id: 'ar1-u6', title: 'الحَيَوَانَاتُ الحَبِيبَة 🐾', order: 6, lessons: UNIT6_LESSONS },
    { id: 'ar1-u7', title: 'الكَلِمَات الأُولَى — ٥٠ كَلِمَة', order: 7, lessons: UNIT7_LESSONS },
    { id: 'ar1-u8', title: 'الجُمَل البَسِيطَة', order: 8, lessons: UNIT8_LESSONS },
    { id: 'ar1-u9', title: 'النُّصُوص القَصِيرَة', order: 9, lessons: UNIT9_LESSONS },
    { id: 'ar1-u10', title: 'التَّقْيِيم النِّهَائِي', order: 10, lessons: UNIT10_LESSONS },
  ],
};
