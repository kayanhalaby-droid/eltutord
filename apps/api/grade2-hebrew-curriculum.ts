/**
 * Grade 2 Hebrew Curriculum (עִבְרִית כִּיתָּה בֵּית)
 * Arabic-speaking students aged 7-8 — Hebrew as L2, Pre-A1
 * Based on מְדַבְּרִים בְּעִבְרִית ב | All Hebrew with full ניקוד
 * Gender marked on every word (ז' / נ') | TTS lang: he-IL
 */

function id() { return Math.random().toString(36).slice(2, 10); }

// ─── Helpers ───────────────────────────────────────────────────────────────────
// Instructions in Arabic (student's L1), content in Hebrew (L2 being learned)

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
  explanation: explanation ?? (isTrue ? '✅ נָכוֹן! — صَحِيح' : '❌ לֹא נָכוֹן — خَطَأ'),
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
  explanation: '✅ כָּל הַכָּבוֹד! — أَحْسَنْتَ',
  difficulty: 2,
});

const listenImg = (question: string, audioText: string, options: Array<{emoji: string; label?: string}>, correctIndex: number) => ({
  id: id(), type: 'LISTEN_IMAGE',
  content: { question, audioText, options: options.map((o, i) => ({ id: `o${i}`, ...o })) },
  correctAnswer: { selectedOptionId: `o${correctIndex}` },
  explanation: options[correctIndex].label ?? audioText,
  difficulty: 1,
});

// IMPORTANT: options must be string[] — never pass objects
const listenChoice = (audioText: string, options: string[], correctIndex: number) => ({
  id: id(), type: 'LISTEN_CHOICE',
  content: { questionText: 'הַקְשֵׁב וּבְחַר — استمع واختر', audioText, options: options.map((t, i) => ({ id: `o${i}`, text: t })) },
  correctAnswer: { selectedOptionIds: [`o${correctIndex}`] },
  explanation: options[correctIndex],
  difficulty: 1,
});

const tapPairs = (questionText: string, pairs: Array<{arabic: string; match: string}>) => ({
  id: id(), type: 'TAP_PAIRS',
  content: { questionText, pairs: pairs.map((p, i) => ({ id: `p${i}`, arabic: p.arabic, hebrew: p.match })) },
  correctAnswer: { matches: Object.fromEntries(pairs.map((p, i) => [`p${i}`, p.match])) },
  explanation: '✅ כָּל הַכָּבוֹד!',
  difficulty: 2,
});

const fbChoice = (sentence: string, options: string[], correctIndex: number, emoji?: string) => ({
  id: id(), type: 'FILL_BLANK_CHOICE',
  content: { questionText: 'הַשְׁלֵם אֶת הַמִּשְׁפָּט — أَكْمِلِ الجُمْلَة', sentence, options: options.map((t, i) => ({ id: `o${i}`, text: t })), emoji },
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
    explanation: '✅ כָּל הַכָּבוֹד!',
    difficulty: 2,
  };
};

const flashcard = (front: string, back: string) => ({
  id: id(), type: 'FLASHCARD_EX',
  content: { front, back, transliteration: '' },
  correctAnswer: { seen: true },
  explanation: back,
  difficulty: 1,
});

const speak = (word: string, emoji?: string, minAccuracy = 50) => ({
  id: id(), type: 'SPEAK_WORD',
  content: { questionText: 'אֱמֹר בְּקוֹל — انْطِقِ الكَلِمَة بِالعِبْرِيِّ', targetWord: word, transliteration: '', translation: emoji ?? '', minAccuracy },
  correctAnswer: { passed: true },
  explanation: '✅ נִסִּיתָ! — مُحَاوَلَة رَائِعَة 🌟',
  difficulty: 2,
});

const readAloud = (text: string, translation: string, minAccuracy = 50) => ({
  id: id(), type: 'READ_ALOUD',
  content: { questionText: 'קְרָא בְּקוֹל — اقْرَأْ بِصَوْتٍ', targetText: text, transliteration: '', translation, minAccuracy },
  correctAnswer: { passed: true },
  explanation: '✅ מְצֻיָּן! — رَائِعٌ 🌟',
  difficulty: 2,
});

const dragOrder = (question: string, items: Array<{text: string; order: number}>) => ({
  id: id(), type: 'DRAG_ORDER',
  content: { question, items: items.map((it) => ({ id: `di-${it.order}`, ...it })) },
  correctAnswer: { orderedIds: [...items].sort((a, b) => a.order - b.order).map((it) => `di-${it.order}`) },
  explanation: '✅ כָּל הַכָּבוֹד!',
  difficulty: 2,
});

const comprehension = (text: string, audioText: string, questions: Array<{q: string; options: string[]; correct: number}>) => ({
  id: id(), type: 'READING_COMPREHENSION',
  content: { text, audioText, questions },
  correctAnswer: { answers: questions.map(q => q.correct) },
  explanation: '✅ הֵבַנְתָּ אֶת הַסִּיפּוּר! — فَهَمْتَ النَّصَّ',
  difficulty: 3,
});

const aiConv = (scenario: string, systemPrompt: string) => ({
  id: id(), type: 'AI_CONVERSATION',
  content: { questionText: scenario, systemPrompt, startMessage: 'שָׁלוֹם!', maxTurns: 4, vocab: '' },
  correctAnswer: { completed: true },
  explanation: '✅ שִׂיחָה מְצֻיֶּנֶת! — مُحَادَثَة رَائِعَة',
  difficulty: 4,
});

// Hebrew-specific: Arabic word → Hebrew translation (multiple choice)
const hebTranslate = (question: string, arabic: string, hebrew: string, options: string[], emoji?: string) => ({
  id: id(), type: 'TRANSLATE',
  content: { question, source: arabic, options, correct: hebrew, emoji, hint: '', sourceLabel: 'عربي 🇵🇸' },
  correctAnswer: { accepted: [hebrew, hebrew.replace(/[ְ-ׇ]/g, '')] },
  explanation: `${arabic} = ${hebrew}`,
  difficulty: 2,
});

// ─── UNIT 1: אָלֶף-בֵּית — الحروف العبرية ────────────────────────────────────
export const HEB2_UNIT1_LESSONS = [
  // L1 — Group א-ה
  {
    id: 'hb2-u1-l1', title: 'אָלֶף-בֵּית: א-ה 🐇', unitId: 'hb2-u1', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('אֵיזֶה אוֹת זֶה? 🐇 — أَيُّ حَرْفٍ هَذَا؟', 'אֵיזוֹ אוֹת',
        [{emoji:'א', label:'אָלֶף'},{emoji:'ב', label:'בֵּית'},{emoji:'ג', label:'גִּימֶל'},{emoji:'ד', label:'דָּלֶת'}], 0),
      imgMatch('הַתְאֵם אוֹת לְמִלָּה — صِلِ الحَرْفَ بِالكَلِمَة', [
        {image:'א', word:'אַרְנָב 🐇'}, {image:'ב', word:'בַּיִת 🏠'},
        {image:'ג', word:'גָּמָל 🐪'}, {image:'ד', word:'דָּג 🐟'},
      ]),
      mc('בְּאֵיזֶה אוֹת מַתְחֶלֶת הַמִּלָּה "בַּיִת"? 🏠', ['א','ב','ג','ד'], 1, 'בַּיִת מַתְחֶלֶת בְּ-ב'),
      tapPairs('חַבֵּר אוֹת לְמִלָּה — صِلِ الحَرْفَ بِالكَلِمَة', [
        {arabic:'א', match:'אַרְנָב 🐇'}, {arabic:'ב', match:'בַּיִת 🏠'}, {arabic:'ה', match:'הַר ⛰️'},
      ]),
      listenImg('שְׁמַע וּבְחַר — استمع واختر', 'גָּמָל',
        [{emoji:'🐪', label:'גָּמָל'},{emoji:'🐟', label:'דָּג'},{emoji:'🐇', label:'אַרְנָב'},{emoji:'🏠', label:'בַּיִת'}], 0),
      flashcard('א ב ג ד ה', 'אָלֶף — אַרְנָב 🐇\nבֵּית — בַּיִת 🏠\nגִּימֶל — גָּמָל 🐪\nדָּלֶת — דָּג 🐟\nהֵא — הַר ⛰️'),
      speak('אַרְנָב', '🐇', 45),
    ],
  },
  // L2 — Group ו-י
  {
    id: 'hb2-u1-l2', title: 'אָלֶף-בֵּית: ו-י 🌹', unitId: 'hb2-u1', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('אֵיזֶה אוֹת זֶה? 🌹 — أَيُّ حَرْفٍ هَذَا؟', 'אֵיזוֹ אוֹת',
        [{emoji:'ו', label:'וָו'},{emoji:'ז', label:'זַיִן'},{emoji:'ח', label:'חֵית'},{emoji:'י', label:'יוֹד'}], 0),
      imgMatch('הַתְאֵם אוֹת לְמִלָּה', [
        {image:'ו', word:'וֶרֶד 🌹'}, {image:'ז', word:'זֶבְרָה 🦓'},
        {image:'ח', word:'חָתוּל 🐱'}, {image:'י', word:'יֶלֶד 👦'},
      ]),
      mc('בְּאֵיזֶה אוֹת מַתְחֶלֶת "חָתוּל"? 🐱', ['ו','ז','ח','ט'], 2, 'חָתוּל מַתְחֶלֶת בְּ-ח'),
      tapPairs('חַבֵּר אוֹת לְמִלָּה', [
        {arabic:'ז', match:'זֶבְרָה 🦓'}, {arabic:'ח', match:'חָתוּל 🐱'}, {arabic:'י', match:'יֶלֶד 👦'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'יֶלֶד',
        [{emoji:'👦', label:'יֶלֶד'},{emoji:'🌹', label:'וֶרֶד'},{emoji:'🐱', label:'חָתוּל'},{emoji:'🦓', label:'זֶבְרָה'}], 0),
      sortGroups('סַדֵּר לְקְבוּצוֹת — صَنِّف', [
        {label:'ו-ז', items:['וֶרֶד 🌹','זֶבְרָה 🦓']},
        {label:'ח-י', items:['חָתוּל 🐱','טֶלֶפוֹן 📱','יֶלֶד 👦']},
      ]),
      speak('וֶרֶד', '🌹', 45),
    ],
  },
  // L3 — Group כ-ס
  {
    id: 'hb2-u1-l3', title: 'אָלֶף-בֵּית: כ-ס 🐕', unitId: 'hb2-u1', order: 3, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('אֵיזֶה אוֹת זֶה? 🐕 — أَيُّ حَرْفٍ هَذَا؟', 'אֵיזוֹ אוֹת',
        [{emoji:'כ', label:'כַּף'},{emoji:'ל', label:'לָמֶד'},{emoji:'מ', label:'מֵם'},{emoji:'נ', label:'נוּן'}], 0),
      imgMatch('הַתְאֵם אוֹת לְמִלָּה', [
        {image:'כ', word:'כֶּלֶב 🐕'}, {image:'ל', word:'לֶחֶם 🍞'},
        {image:'מ', word:'מַיִם 💧'}, {image:'ס', word:'סוּס 🐴'},
      ]),
      tapPairs('חַבֵּר אוֹת לְמִלָּה', [
        {arabic:'כ', match:'כֶּלֶב 🐕'}, {arabic:'ל', match:'לֶחֶם 🍞'}, {arabic:'מ', match:'מַיִם 💧'},
      ]),
      tf('הַמִּלָּה "כֶּלֶב" מַתְחֶלֶת בְּאוֹת כ 🐕', true, '✅ נָכוֹן! כ — כֶּלֶב'),
      listenImg('שְׁמַע וּבְחַר', 'סוּס',
        [{emoji:'🐴', label:'סוּס'},{emoji:'🐕', label:'כֶּלֶב'},{emoji:'🍞', label:'לֶחֶם'},{emoji:'💧', label:'מַיִם'}], 0),
      mc('בְּאֵיזֶה אוֹת מַתְחֶלֶת "נָחָשׁ"? 🐍', ['כ','ל','מ','נ'], 3, 'נָחָשׁ — נ'),
      speak('כֶּלֶב', '🐕', 45),
    ],
  },
  // L4 — Group ע-ת
  {
    id: 'hb2-u1-l4', title: 'אָלֶף-בֵּית: ע-ת 🌳', unitId: 'hb2-u1', order: 4, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('אֵיזֶה אוֹת זֶה? 🌳 — أَيُّ حَرْفٍ هَذَا؟', 'אֵיזוֹ אוֹת',
        [{emoji:'ע', label:'עַיִן'},{emoji:'פ', label:'פֵּא'},{emoji:'צ', label:'צָדִי'},{emoji:'ק', label:'קוֹף'}], 0),
      imgMatch('הַתְאֵם אוֹת לְמִלָּה', [
        {image:'ע', word:'עֵץ 🌳'}, {image:'פ', word:'פִּיל 🐘'},
        {image:'ש', word:'שֶׁמֶשׁ ☀️'}, {image:'ת', word:'תַּפּוּחַ 🍎'},
      ]),
      tapPairs('חַבֵּר אוֹת לְמִלָּה', [
        {arabic:'ע', match:'עֵץ 🌳'}, {arabic:'צ', match:'צִפּוֹר 🐦'}, {arabic:'ר', match:'רַכֶּבֶת 🚂'},
      ]),
      mc('בְּאֵיזֶה אוֹת מַתְחֶלֶת "שֶׁמֶשׁ"? ☀️', ['ק','ר','ש','ת'], 2, 'שֶׁמֶשׁ — ש'),
      listenImg('שְׁמַע וּבְחַר', 'תַּפּוּחַ',
        [{emoji:'🍎', label:'תַּפּוּחַ'},{emoji:'🌳', label:'עֵץ'},{emoji:'🐘', label:'פִּיל'},{emoji:'☀️', label:'שֶׁמֶשׁ'}], 0),
      dragOrder('סַדֵּר הָאוֹתִיּוֹת — رَتِّبِ الحُرُوف', [
        {text:'ע עַיִן', order:1},{text:'פ פֵּא', order:2},{text:'צ צָדִי', order:3},{text:'ק קוֹף', order:4},
      ]),
      readAloud('עֵץ, פִּיל, צִפּוֹר, קוֹף, רַכֶּבֶת, שֶׁמֶשׁ, תַּפּוּחַ', 'شجرة، فيل، طائر، قرد، قطار، شمس، تفاحة', 45),
    ],
  },
  // L5 — אוֹתִיּוֹת סוֹפִיּוֹת — حروف النهاية
  {
    id: 'hb2-u1-l5', title: 'אוֹתִיּוֹת סוֹפִיּוֹת כ→ך ✍️', unitId: 'hb2-u1', order: 5, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מָה הָצוּרָה הַסּוֹפִית שֶׁל כ? — ما الشكل الأخير لـ כ؟', ['כ','ך','ם','ן'], 1, 'כ בְּסוֹף מִלָּה = ך'),
      imgMatch('הַתְאֵם אוֹת לְצוּרָה הַסּוֹפִית — صِلِ الحَرْفَ بِشَكْلِه الأَخِير', [
        {image:'כ', word:'ך'}, {image:'מ', word:'ם'}, {image:'נ', word:'ן'}, {image:'פ', word:'ף'},
      ]),
      fbChoice('הַמִּלָּה "מֶלֶ___" — הַשְׁלֵם (מֶלֶךְ = מَلِك)', ['ך','כ','ח'], 0, '👑'),
      tf('הָאוֹת ך מוֹפִיעָה בִּתְחִילַת מִלָּה', false, '❌ לֹא נָכוֹן! ך מוֹפִיעָה רַק בְּסוֹף מִלָּה'),
      sortGroups('הַמִּלָּה מַתְחֶלֶת בְּ... אוֹ מְסַיֶּמֶת בְּ... — في البداية أم النهاية؟', [
        {label:'בִּתְחִילָה (في البداية)', items:['כֶּלֶב 🐕 — כ','נָחָשׁ 🐍 — נ','פִּיל 🐘 — פ']},
        {label:'בְּסוֹף (في النهاية)', items:['מֶלֶךְ 👑 — ך','גַּן 🌸 — ן','אַף 👃 — ף']},
      ]),
      mc('מָה הָצוּרָה הַסּוֹפִית שֶׁל נ?', ['נ','ן','ם','ף'], 1, 'נ בְּסוֹף מִלָּה = ן'),
      flashcard('כ→ך / מ→ם / נ→ן / פ→ף / צ→ץ', 'חמש אותיות סופיות\n5 حروف للنهاية فقط'),
    ],
  },
  // L6 — ניקוד — التشكيل العبري
  {
    id: 'hb2-u1-l6', title: 'נִקּוּד — التشكيل 🎵', unitId: 'hb2-u1', order: 6, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מָה שֵׁם הַנִּיקּוּד ַ (הָרִאשׁוֹן)? — ما اسم هذا التشكيل؟', ['פַּתָּח','קָמָץ','חִירִיק','סֶגוֹל'], 0, 'ַ = פַּתָּח — فتحة'),
      imgMatch('הַתְאֵם נִקּוּד לְשֵׁם — صِلِ التشكيل باسمه', [
        {image:'ַ', word:'פַּתָּח'}, {image:'ָ', word:'קָמָץ'},
        {image:'ִ', word:'חִירִיק'}, {image:'ֶ', word:'סֶגוֹל'},
      ]),
      mc('אֵיזֶה הֶבְדֵּל יֵשׁ בֵּין "בַּ" לְ"בָּ"? — ما الفرق بين بَ وبَا؟', ['אֵין הֶבְדֵּל','פַּתָּח לְעֻמַּת קָמָץ','שְׁנֵיהֶם אוֹ','הֶבְדֵּל בְּאוֹת'], 1, 'ַ = פַּתָּח, ָ = קָמָץ'),
      tf('הַהֶבְרָה "בִּ" יֵשׁ בָּהּ חִירִיק (ִ)', true, '✅ נָכוֹן! ִ תַּחַת הָאוֹת = חִירִיק'),
      tapPairs('חַבֵּר נִקּוּד לְשֵׁם', [
        {arabic:'ַ', match:'פַּתָּח'}, {arabic:'ִ', match:'חִירִיק'}, {arabic:'ֻ', match:'קִיבּוּץ'},
      ]),
      listenImg('שְׁמַע וּבְחַר אֵיזוֹ הֶבְרָה', 'בִּי',
        [{emoji:'בַּ', label:'בַּ (פַּתָּח)'},{emoji:'בִּ', label:'בִּ (חִירִיק)'},{emoji:'בֶּ', label:'בֶּ (סֶגוֹל)'},{emoji:'בָּ', label:'בָּ (קָמָץ)'}], 1),
      flashcard('הַנִּקּוּד הָעִבְרִי — التشكيل العبري',
        'ַ פַּתָּח (فتحة قصيرة)\nָ קָמָץ (فتحة طويلة)\nִ חִירִיק (كسرة)\nֶ סֶגוֹל (ثلاث نقاط)\nֻ קִיבּוּץ (ضمة)'),
    ],
  },
  // L7 — מִלִּים קְצָרוֹת — كلمات قصيرة
  {
    id: 'hb2-u1-l7', title: 'מִלִּים קְצָרוֹת 👁️', unitId: 'hb2-u1', order: 7, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟', 'מָה זֶה',
        [{emoji:'✋', label:'יָד (נ\')'},{emoji:'🦵', label:'רֶגֶל (נ\')'},{emoji:'👁️', label:'עַיִן (נ\')'},{emoji:'👄', label:'פֶּה (ז\')'}], 2),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'✋', word:'יָד'}, {image:'🦵', word:'רֶגֶל'},
        {image:'👁️', word:'עַיִן'}, {image:'👂', word:'אוֹזֶן'},
      ]),
      tapPairs('חַבֵּר מִלָּה עִבְרִית לְתַרְגּוּם — صِلِ العِبْرِيَّة بِالعَرَبِيَّة', [
        {arabic:'יָד ✋', match:'يَد'}, {arabic:'עַיִן 👁️', match:'عَيْن'}, {arabic:'פֶּה 👄', match:'فَم'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'אוֹזֶן',
        [{emoji:'👂', label:'אוֹזֶן'},{emoji:'👁️', label:'עַיִן'},{emoji:'👃', label:'אַף'},{emoji:'👄', label:'פֶּה'}], 0),
      mc('מָה הַמִּגְדָּר (جنس) שֶׁל "יָד"?', ['זָכָר (ז\')', 'נְקֵבָה (נ\')'], 1, 'יָד — נ\' (مؤنث)'),
      speak('עַיִן', '👁️', 45),
      flashcard('מִלִּים לְחֵלְקֵי הַגּוּף', 'יָד (נ\') — يَد ✋\nרֶגֶל (נ\') — رِجْل 🦵\nעַיִן (נ\') — عَيْن 👁️\nאוֹזֶן (נ\') — أُذُن 👂\nפֶּה (ז\') — فَم 👄'),
    ],
  },
  // L8 — צְלִילִים קָשִׁים — الأصوات الصعبة
  {
    id: 'hb2-u1-l8', title: 'צְלִילִים קָשִׁים ח/כ ע/א 🎤', unitId: 'hb2-u1', order: 8, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('בְּעִבְרִית מוֹדֶרְנִית, ח וְ-כ נִשְׁמָעִים אוֹתוֹ דָּבָר — في العبرية الحديثة ح وخ صوت واحد?', ['כֵּן ✅','לֹא ❌'], 0, '✅ כֵּן! בְּעִבְרִית מוֹדֶרְנִית הֵם אוֹתוֹ צְלִיל — نعم، في العبرية الحديثة هما صوت واحد'),
      imgMatch('הַתְאֵם מִלָּה לָאוֹת שֶׁלָּהּ — صِلِ الكَلِمَة بِحَرْفِهَا', [
        {image:'חָתוּל 🐱', word:'ח'}, {image:'כֶּלֶב 🐕', word:'כ'},
        {image:'עֵץ 🌳', word:'ע'}, {image:'אַרְנָב 🐇', word:'א'},
      ]),
      tapPairs('הַמִּלָּה מַתְחֶלֶת בְּ... — الكلمة تبدأ بـ', [
        {arabic:'חָתוּל 🐱', match:'ח (خاء)'}, {arabic:'כֶּלֶב 🐕', match:'כ (كاف)'}, {arabic:'עֵץ 🌳', match:'ע (عين)'},
      ]),
      tf('הָאוֹת ע בְּעִבְרִית נִשְׁמַעַת כְּמוֹ ע בְּעַרְבִית — العين في العبرية مثل العين في العربية?', false, '❌ לֹא! בְּעִבְרִית מוֹדֶרְנִית ע נִשְׁמַעַת כְּמוֹ א — في العبرية الحديثة العين تُنطق مثل الألف'),
      mc('אֵיזֶה אוֹת יֵשׁ בִּשְׁנֵי מִלִּים אֵלֶּה: "צִפּוֹר" וְ-"צָהֹב"? — أي حرف مشترك؟', ['ס','ז','צ','ש'], 2, 'שְׁתֵּיהֶן מַתְחִילוֹת בְּ-צ'),
      speak('חָתוּל', '🐱', 45),
      readAloud('חָתוּל, כֶּלֶב, עֵץ, אַרְנָב, צִפּוֹר, סוּס', 'قطة، كلب، شجرة، أرنب، طائر، حصان', 45),
    ],
  },
  // L9 — שִׁיר אָלֶף-בֵּית — أغنية الأبجدية
  {
    id: 'hb2-u1-l9', title: 'שִׁיר אָלֶף-בֵּית 🎵', unitId: 'hb2-u1', order: 9, xpReward: 20, estimatedMinutes: 12,
    questions: [
      readAloud('אָלֶף-בֵּית, גִּימֶל-דָּלֶת, הֵא וָו זַיִן', 'ألف، بيت، جيمل، دالت، هيه، فاف، زايين', 40),
      fbChoice('אָלֶף ___', ['בֵּית','גִּימֶל','דָּלֶת'], 0, '🔤'),
      dragOrder('סַדֵּר הָאוֹתִיּוֹת בְּסֵדֶר — رَتِّبِ الحُرُوف', [
        {text:'א אָלֶף', order:1},{text:'ב בֵּית', order:2},{text:'ג גִּימֶל', order:3},
        {text:'ד דָּלֶת', order:4},{text:'ה הֵא', order:5},
      ]),
      mc('אֵיזֶה אוֹת בָּאָה אַחֲרֵי ז? — أي حرف بعد ז؟', ['ו','ח','ט','י'], 1, 'ח בָּאָה אַחֲרֵי ז'),
      listenChoice('שִׁין',
        ['שִׁין ש','רֵישׁ ר','קוֹף ק'], 0),
      readAloud('חֵית-טֵית, יוֹד-כַּף, לָמֶד-מֵם-נוּן', 'حيت، طيت، يود، كاف، لامد، ميم، نون', 40),
      speak('שָׁלוֹם', '🇮🇱', 45),
    ],
  },
  // L10 — כִּיתַת מִבְחָן — اختبار الوحدة (12 أسئلة)
  {
    id: 'hb2-u1-l10', title: 'מִבְחָן יְחִידָה 1 ⭐', unitId: 'hb2-u1', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('אֵיזֶה אוֹת זֶה? 🐪', 'אֵיזוֹ אוֹת',
        [{emoji:'ג', label:'גִּימֶל'},{emoji:'ד', label:'דָּלֶת'},{emoji:'ה', label:'הֵא'},{emoji:'ו', label:'וָו'}], 0),
      imgMatch('הַתְאֵם אוֹת לְמִלָּה', [
        {image:'ב', word:'בַּיִת 🏠'}, {image:'כ', word:'כֶּלֶב 🐕'},
        {image:'ש', word:'שֶׁמֶשׁ ☀️'}, {image:'ת', word:'תַּפּוּחַ 🍎'},
      ]),
      mc('מָה הָצוּרָה הַסּוֹפִית שֶׁל מ?', ['מ','ם','ן','ף'], 1, 'מ בְּסוֹף מִלָּה = ם'),
      tapPairs('חַבֵּר אוֹת לְמִלָּה', [
        {arabic:'ע', match:'עֵץ 🌳'}, {arabic:'פ', match:'פִּיל 🐘'}, {arabic:'צ', match:'צִפּוֹר 🐦'},
      ]),
      sortGroups('בִּתְחִילָה אוֹ בְּסוֹף? — بداية أم نهاية؟', [
        {label:'בִּתְחִילָה (في البداية)', items:['כֶּלֶב — כ','מַיִם — מ','נָחָשׁ — נ']},
        {label:'בְּסוֹף (في النهاية)', items:['מֶלֶךְ — ך','יַלְדָּן — ן','אַף — ף']},
      ]),
      tf('הַמִּלָּה "שֶׁמֶשׁ" מַתְחֶלֶת בְּ-ש', true, '✅ נָכוֹן! שֶׁמֶשׁ — ש'),
      mc('מָה שֵׁם הַנִּקּוּד ִ (תַּחַת הָאוֹת)?', ['פַּתָּח','קָמָץ','חִירִיק','סֶגוֹל'], 2, 'ִ = חִירִיק'),
      listenImg('שְׁמַע וּבְחַר', 'רַכֶּבֶת',
        [{emoji:'🚂', label:'רַכֶּבֶת'},{emoji:'🐒', label:'קוֹף'},{emoji:'🐦', label:'צִפּוֹר'},{emoji:'🐘', label:'פִּיל'}], 0),
      fbChoice('הַמִּלָּה "מֶלֶ___" — هَيَّا أَكْمِل!', ['ך','כ','ח'], 0, '👑'),
      dragOrder('סַדֵּר הָאוֹתִיּוֹת', [
        {text:'א', order:1},{text:'ב', order:2},{text:'ג', order:3},{text:'ד', order:4},{text:'ה', order:5},
      ]),
      readAloud('אָלֶף, בֵּית, גִּימֶל, דָּלֶת, הֵא, וָו', 'ألف، بيت، جيمل، دالت، هيه، فاف', 45),
      speak('שֶׁמֶשׁ', '☀️', 45),
    ],
  },
];

// ─── UNIT 2: שָׁלוֹם — التحية والتعارف ─────────────────────────────────────────
export const HEB2_UNIT2_LESSONS = [
  // L1 — שָׁלוֹם וּלְהִתְרָאוֹת
  {
    id: 'hb2-u2-l1', title: 'שָׁלוֹם! 👋', unitId: 'hb2-u2', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָתַי אוֹמְרִים "בֹּקֶר טוֹב"? — متى نقول صباح الخير؟', 'מָתַי אוֹמְרִים',
        [{emoji:'🌅', label:'בַּבֹּקֶר'},{emoji:'☀️', label:'בַּצָּהֳרַיִם'},{emoji:'🌙', label:'בַּלַּיְלָה'},{emoji:'🌆', label:'בָּעֶרֶב'}], 0),
      imgMatch('הַתְאֵם בְּרָכָה לְמַשְׁמָעוּת — صِلِ التحية بمعناها', [
        {image:'שָׁלוֹם 👋', word:'أهلاً / مع السلامة'}, {image:'בֹּקֶר טוֹב ☀️', word:'صباح الخير'},
        {image:'עֶרֶב טוֹב 🌆', word:'مساء الخير'}, {image:'לַיְלָה טוֹב 🌙', word:'تصبح على خير'},
      ]),
      mc('אֵיזוֹ בְּרָכָה מַתְאִימָה לַבֹּקֶר? — أي تحية للصباح؟', ['לַיְלָה טוֹב 🌙','בֹּקֶר טוֹב ☀️','עֶרֶב טוֹב 🌆','שָׁלוֹם 👋'], 1, 'בֹּקֶר טוֹב = صباح الخير'),
      tapPairs('חַבֵּר בְּרָכָה לְמַשְׁמָעוּת', [
        {arabic:'שָׁלוֹם 👋', match:'أهلاً'}, {arabic:'תּוֹדָה 🙏', match:'شكراً'}, {arabic:'סְלִיחָה 🙇', match:'عفواً/آسف'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'שָׁלוֹם',
        [{emoji:'👋', label:'שָׁלוֹם'},{emoji:'☀️', label:'בֹּקֶר טוֹב'},{emoji:'🌆', label:'עֶרֶב טוֹב'},{emoji:'🌙', label:'לַיְלָה טוֹב'}], 0),
      speak('שָׁלוֹם', '👋', 45),
    ],
  },
  // L2 — בֹּקֶר/צָהֳרַיִם/עֶרֶב/לַיְלָה
  {
    id: 'hb2-u2-l2', title: 'בֹּקֶר, צָהֳרַיִם, עֶרֶב 🌅', unitId: 'hb2-u2', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      sortGroups('סַדֵּר בְּרָכוֹת לְפִי זְמַן הַיּוֹם — صَنِّفِ التحيات حسب الوقت', [
        {label:'בֹּקֶר 🌅', items:['בֹּקֶר טוֹב ☀️']},
        {label:'צָהֳרַיִם ☀️', items:['צָהֳרַיִם טוֹבִים 🌞']},
        {label:'עֶרֶב 🌆', items:['עֶרֶב טוֹב 🌆']},
        {label:'לַיְלָה 🌙', items:['לַיְלָה טוֹב 🌙','שָׁנָה טוֹבָה 💤']},
      ]),
      imgMatch('מָתַי אוֹמְרִים זֹאת? — متى نقول هذا؟', [
        {image:'🌅', word:'בֹּקֶר טוֹב'}, {image:'🌞', word:'צָהֳרַיִם טוֹבִים'},
        {image:'🌆', word:'עֶרֶב טוֹב'}, {image:'🌙', word:'לַיְלָה טוֹב'},
      ]),
      fbChoice('בַּלַּיְלָה אוֹמְרִים: "___"', ['לַיְלָה טוֹב 🌙','בֹּקֶר טוֹב ☀️','צָהֳרַיִם טוֹבִים'], 0, '🌙'),
      listenImg('שְׁמַע וּבְחַר', 'עֶרֶב טוֹב',
        [{emoji:'🌅', label:'בֹּקֶר טוֹב'},{emoji:'🌞', label:'צָהֳרַיִם'},{emoji:'🌆', label:'עֶרֶב טוֹב'},{emoji:'🌙', label:'לַיְלָה טוֹב'}], 2),
      mc('מַה מַשְׁמָעוּת "לַיְלָה טוֹב"? — ما معنى لَيْلَة طَيِّبَة؟', ['صباح الخير','مساء الخير','تصبح على خير','أهلاً'], 2),
      flashcard('בְּרָכוֹת — تحيات', 'בֹּקֶר טוֹב ☀️ — صباح الخير\nצָהֳרַיִם טוֹבִים 🌞 — ظهركم مبارك\nעֶרֶב טוֹב 🌆 — مساء الخير\nלַיְלָה טוֹב 🌙 — تصبح على خير'),
    ],
  },
  // L3 — מַה שִּׁמְךָ/שְּׁמֵךְ?
  {
    id: 'hb2-u2-l3', title: 'מַה שִּׁמְךָ? 👤', unitId: 'hb2-u2', order: 3, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('אֵיזֶה מִשְׁפָּט מַתְאִים לְיַלְדָּה? — أيهما مناسب للبنت؟', ['מַה שִּׁמְךָ? (לְזָכָר)','מַה שְּׁמֵךְ? (לִנְקֵבָה)'], 1, 'לְיַלְדָּה — מַה שְּׁמֵךְ?'),
      tf('אוֹמְרִים "מַה שִּׁמְךָ?" לְיֶלֶד (وَلَد)', true, '✅ נָכוֹן! ךָ = כִּינּוּי לְזָכָר'),
      fbChoice('שְׁמִי אַחְמַד. ___ שִּׁמְךָ? — ما اسمك؟', ['מַה','אֵיפֹה','כַּמָּה'], 0, '👤'),
      wordOrder('סַדֵּר — رَتِّبِ', ['שְׁמִי','אַחְמַד.'], 'שְׁמִי אַחְמַד.'),
      tapPairs('חַבֵּר שְׁאֵלָה לְתְּשׁוּבָה — صِلِ السُّؤَال بالجواب', [
        {arabic:'מַה שִּׁמְךָ? 👦', match:'שְׁמִי אַחְמַד'}, {arabic:'מַה שְּׁמֵךְ? 👧', match:'שְׁמִי מַרְיַם'},
      ]),
      mc('כֵּיצַד אֲנַחְנוּ מֵשִׁיבִים "שְׁמִי..."? — كيف نجيب "اسمي..."؟', ['בֶּן כַּמָּה?','שְׁמִי...','אֵיפֹה?','כַּמָּה?'], 1),
      readAloud('שָׁלוֹם! מַה שִּׁמְךָ? שְׁמִי אַחְמַד. נָעִים מְאֹד!', 'أهلاً! ما اسمك؟ اسمي أحمد. تشرفنا!', 45),
    ],
  },
  // L4 — אֲנִי / אַתָּה / אַתְּ
  {
    id: 'hb2-u2-l4', title: 'אֲנִי, אַתָּה, אַתְּ 👤👤', unitId: 'hb2-u2', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מָה פֵּירוּשׁ "אַתְּ"? — ما معنى أَنْتِ؟', ['أنا','أنت (مذكر)','أنتِ (مؤنث)','هو'], 2, 'אַתְּ = أنتِ (لبنت)'),
      sortGroups('סַדֵּר כִּינּוּיֵי גּוּף — صَنِّفِ الضمائر', [
        {label:'זָכָר ז\' (مذكر)', items:['אֲנִי 👦','אַתָּה 👦','הוּא 👦']},
        {label:'נְקֵבָה נ\' (مؤنث)', items:['אֲנִי 👧','אַתְּ 👧','הִיא 👧']},
      ]),
      fbChoice('___ אוֹהֵב כַּדּוּרֶגֶל (אֲנִי לְזָכָר)', ['אֲנִי 👦','אַתְּ 👧','הִיא 👧'], 0, '⚽'),
      tf('"אַתָּה" מַתְאִים לְיַלְדָּה (بنت)', false, '❌ לֹא! אַתָּה = أنت (لولد), אַתְּ = أنتِ (لبنت)'),
      wordOrder('סַדֵּר — رَتِّبِ', ['אַחְמַד.','אֲנִי'], 'אֲנִי אַחְמַד.'),
      tapPairs('חַבֵּר כִּינּוּי לְמַשְׁמָעוּת', [
        {arabic:'אֲנִי', match:'أنا'}, {arabic:'אַתָּה', match:'أنت (م)'}, {arabic:'אַתְּ', match:'أنتِ (ن)'},
      ]),
      speak('אֲנִי', '👤', 45),
    ],
  },
  // L5 — כֵּן / לֹא (yes/no)
  {
    id: 'hb2-u2-l5', title: 'כֵּן וְלֹא ✅❌', unitId: 'hb2-u2', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('מָה פֵּירוּשׁ "כֵּן"? — ما معنى كيِن؟', ['لا','نعم','ربما','لماذا'], 1, 'כֵּן = نعم'),
      imgMatch('הַתְאֵם לְתַרְגּוּם — صِلِ بالترجمة', [
        {image:'כֵּן ✅', word:'نعم'}, {image:'לֹא ❌', word:'لا'},
        {image:'אוּלַי 🤔', word:'ربما'}, {image:'תּוֹדָה 🙏', word:'شكراً'},
      ]),
      fbChoice('הַכֶּלֶב שֶׁלְּךָ? ___, זֶה הַכֶּלֶב שֶׁלִּי! ✅', ['כֵּן','לֹא','אוּלַי'], 0, '🐕'),
      tf('"לֹא" בְּעִבְרִית פֵּירוּשׁוֹ "نعم" בְּעַרְבִית', false, '❌ לֹא! לֹא = لا, כֵּן = نعم'),
      wordOrder('סַדֵּר — رَتِّبِ', ['כֶּלֶב.','כֵּן,','זֶה'], 'כֵּן, זֶה כֶּלֶב.'),
      mc('כֵּיצַד אוֹמְרִים "لا" בְּעִבְרִית?', ['כֵּן','לֹא','אוּלַי','בְּסֵדֶר'], 1),
      flashcard('כֵּן / לֹא / אוּלַי', 'כֵּן ✅ = نعم\nלֹא ❌ = لا\nאוּלַי 🤔 = ربما\nבְּסֵדֶר 👍 = حسناً'),
    ],
  },
  // L6 — דִּיאָלוֹג: מִי אַתָּה? (AI_CONVERSATION)
  {
    id: 'hb2-u2-l6', title: 'דִּיאָלוֹג: הִכָּרוּת 💬', unitId: 'hb2-u2', order: 6, xpReward: 30, estimatedMinutes: 18,
    questions: [
      readAloud('שָׁלוֹם! מַה שִּׁמְךָ? שְׁמִי אַחְמַד. נָעִים מְאֹד!', 'أهلاً! ما اسمك؟ اسمي أحمد. تشرفنا!', 45),
      comprehension(
        'שָׁלוֹם! אֲנִי נָדְיָה.\nמַה שְּׁמֵךְ?\nשְׁמִי לֵאָה.\nנָעִים מְאֹד, לֵאָה! 🤝',
        'שָׁלוֹם! אֲנִי נָדְיָה. מַה שְּׁמֵךְ? שְׁמִי לֵאָה. נָעִים מְאֹד, לֵאָה!',
        [
          {q:'מַה שֵּׁם הַיַּלְדָּה הָרִאשׁוֹנָה? — ما اسم البنت الأولى؟', options:['לֵאָה','נָדְיָה','מַרְיַם'], correct:1},
          {q:'מַה שֵּׁם הַיַּלְדָּה הַשְּׁנִיָּה? — ما اسم البنت الثانية؟', options:['לֵאָה','נָדְיָה','שָׂרָה'], correct:0},
        ],
      ),
      fbChoice('___ מְאֹד! — تشرفنا', ['נָעִים','שָׁלוֹם','תּוֹדָה'], 0, '🤝'),
      wordOrder('סַדֵּר — رَتِّبِ', ['אַחְמַד.','שְׁמִי'], 'שְׁמִי אַחְמַד.'),
      mc('מַה אוֹמְרִים כְּשֶׁנִּפְגָּשִׁים בְּפַעַם הָרִאשׁוֹנָה? — ماذا نقول عند اللقاء الأول؟', ['לַיְלָה טוֹב','נָעִים מְאֹד','תּוֹדָה','סְלִיחָה'], 1),
      aiConv(
        'הִכָּרוּת בְּעִבְרִית — تعارف بالعبرية',
        'אתה נור, מורה חביב לילד ערבי בן 7 לומד עברית. שוחח איתו בעברית פשוטה עם ניקוד. השתמש רק במילים: שָׁלוֹם, מַה שִּׁמְךָ, שְׁמִי, נָעִים מְאֹד, בֶּן כַּמָּה, כֵּן, לֹא. כל משפט לא יעלה על 5 מילים. התחל: "שָׁלוֹם! מַה שִּׁמְךָ? 😊"',
      ),
    ],
  },
  // L7 — מִסְפָּרִים 1-5
  {
    id: 'hb2-u2-l7', title: 'מִסְפָּרִים 1-5 🔢', unitId: 'hb2-u2', order: 7, xpReward: 22, estimatedMinutes: 14,
    questions: [
      imgChoice('כַּמָּה? — كم؟ 🍎🍎🍎', 'כַּמָּה',
        [{emoji:'שְׁלֹשָׁה', label:'3 שְׁלֹשָׁה'},{emoji:'אַרְבָּעָה', label:'4 אַרְבָּעָה'},{emoji:'חֲמִשָּׁה', label:'5 חֲמִשָּׁה'},{emoji:'שְׁנַיִם', label:'2 שְׁנַיִם'}], 0),
      imgMatch('הַתְאֵם מִסְפָּר לְמִלָּה — صِلِ الرَّقَم بالكلمة', [
        {image:'1️⃣', word:'אֶחָד'}, {image:'2️⃣', word:'שְׁנַיִם'},
        {image:'3️⃣', word:'שְׁלֹשָׁה'}, {image:'4️⃣', word:'אַרְבָּעָה'},
      ]),
      mc('כֵּיצַד אוֹמְרִים "5" בְּעִבְרִית?', ['שְׁלֹשָׁה','אַרְבָּעָה','חֲמִשָּׁה','שְׁנַיִם'], 2, 'חֲמִשָּׁה = 5'),
      listenImg('שְׁמַע וּבְחַר — استمع واختر', 'שְׁנַיִם',
        [{emoji:'1️⃣', label:'אֶחָד'},{emoji:'2️⃣', label:'שְׁנַיִם'},{emoji:'3️⃣', label:'שְׁלֹשָׁה'},{emoji:'4️⃣', label:'אַרְבָּעָה'}], 1),
      tapPairs('חַבֵּר מִסְפָּר לְמִלָּה', [
        {arabic:'1', match:'אֶחָד'}, {arabic:'3', match:'שְׁלֹשָׁה'}, {arabic:'5', match:'חֲמִשָּׁה'},
      ]),
      dragOrder('סַדֵּר מִסְפָּרִים — رَتِّبِ الأَرْقَام', [
        {text:'1️⃣ אֶחָד', order:1},{text:'2️⃣ שְׁנַיִם', order:2},
        {text:'3️⃣ שְׁלֹשָׁה', order:3},{text:'4️⃣ אַרְבָּעָה', order:4},{text:'5️⃣ חֲמִשָּׁה', order:5},
      ]),
      speak('שְׁלֹשָׁה', '3️⃣', 45),
    ],
  },
  // L8 — מִסְפָּרִים 6-10
  {
    id: 'hb2-u2-l8', title: 'מִסְפָּרִים 6-10 🔢', unitId: 'hb2-u2', order: 8, xpReward: 22, estimatedMinutes: 14,
    questions: [
      imgChoice('כַּמָּה כּוֹכָבִים? ⭐⭐⭐⭐⭐⭐⭐', 'כַּמָּה',
        [{emoji:'שִׁשָּׁה', label:'6 שִׁשָּׁה'},{emoji:'שִׁבְעָה', label:'7 שִׁבְעָה'},{emoji:'שְׁמוֹנָה', label:'8 שְׁמוֹנָה'},{emoji:'תִּשְׁעָה', label:'9 תִּשְׁעָה'}], 1),
      imgMatch('הַתְאֵם מִסְפָּר לְמִלָּה', [
        {image:'6️⃣', word:'שִׁשָּׁה'}, {image:'7️⃣', word:'שִׁבְעָה'},
        {image:'8️⃣', word:'שְׁמוֹנָה'}, {image:'9️⃣', word:'תִּשְׁעָה'},
      ]),
      tapPairs('חַבֵּר מִסְפָּר לְמִלָּה', [
        {arabic:'6', match:'שִׁשָּׁה'}, {arabic:'8', match:'שְׁמוֹנָה'}, {arabic:'10', match:'עֲשָׂרָה'},
      ]),
      mc('כֵּיצַד אוֹמְרִים "10" בְּעִבְרִית?', ['שִׁבְעָה','שְׁמוֹנָה','תִּשְׁעָה','עֲשָׂרָה'], 3, 'עֲשָׂרָה = 10'),
      listenImg('שְׁמַע וּבְחַר', 'עֲשָׂרָה',
        [{emoji:'8️⃣', label:'שְׁמוֹנָה'},{emoji:'9️⃣', label:'תִּשְׁעָה'},{emoji:'🔟', label:'עֲשָׂרָה'},{emoji:'7️⃣', label:'שִׁבְעָה'}], 2),
      fbChoice('אֲנִי בֶּן ___ שָׁנִים (7) — عمري 7', ['שִׁבְעָה','שִׁשָּׁה','שְׁמוֹנָה'], 0, '🎂'),
      speak('שִׁבְעָה', '7️⃣', 45),
    ],
  },
  // L9 — קְרִיאַת סִיפּוּר — قصة التعارف
  {
    id: 'hb2-u2-l9', title: 'קְרִיאַת סִיפּוּר: הִכָּרוּת 📖', unitId: 'hb2-u2', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      comprehension(
        'שָׁלוֹם! אֲנִי אַחְמַד.\nאֲנִי בֶּן שֶׁבַע שָׁנִים.\nיֵשׁ לִי חָבֵר. שְׁמוֹ דָּן.\nנָעִים מְאֹד! 🤝',
        'שָׁלוֹם! אֲנִי אַחְמַד. אֲנִי בֶּן שֶׁבַע שָׁנִים. יֵשׁ לִי חָבֵר. שְׁמוֹ דָּן. נָעִים מְאֹד!',
        [
          {q:'מַה שֵּׁם הַיֶּלֶד? — ما اسم الولد؟', options:['דָּן','אַחְמַד','מֹשֶׁה'], correct:1},
          {q:'בֶּן כַּמָּה הוּא? — كم عمره؟', options:['שֵׁשׁ','שֶׁבַע','שְׁמוֹנֶה'], correct:1},
          {q:'מַה שֵּׁם הֶחָבֵר? — ما اسم الصديق؟', options:['דָּן','אַחְמַד','יָשִׁי'], correct:0},
        ],
      ),
      fbChoice('אֲנִי בֶּן ___ שָׁנִים. (7)', ['שֶׁבַע','שֵׁשׁ','שְׁמוֹנֶה'], 0, '🎂'),
      wordOrder('סַדֵּר — رَتِّبِ', ['שְׁמִי','אַחְמַד.','אֲנִי'], 'אֲנִי שְׁמִי אַחְמַד.'),
      readAloud('שָׁלוֹם! אֲנִי אַחְמַד. אֲנִי בֶּן שֶׁבַע. נָעִים מְאֹד!', 'أهلاً! أنا أحمد. عمري سبع سنوات. تشرفنا!', 45),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 2 (12 أسئلة)
  {
    id: 'hb2-u2-l10', title: 'מִבְחָן יְחִידָה 2 ⭐', unitId: 'hb2-u2', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מָתַי אוֹמְרִים "עֶרֶב טוֹב"? — متى نقول مساء الخير؟', 'מָתַי',
        [{emoji:'🌅', label:'בַּבֹּקֶר'},{emoji:'🌞', label:'בַּצָּהֳרַיִם'},{emoji:'🌆', label:'בָּעֶרֶב'},{emoji:'🌙', label:'בַּלַּיְלָה'}], 2),
      imgMatch('הַתְאֵם בְּרָכָה לְמַשְׁמָעוּת', [
        {image:'שָׁלוֹם 👋', word:'أهلاً'}, {image:'בֹּקֶר טוֹב ☀️', word:'صباح الخير'},
        {image:'תּוֹדָה 🙏', word:'شكراً'}, {image:'נָעִים מְאֹד 🤝', word:'تشرفنا'},
      ]),
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְיַלְדָּה? — أيهما صحيح للبنت؟', ['מַה שִּׁמְךָ? (לְזָכָר)','מַה שְּׁמֵךְ? (לִנְקֵבָה)'], 1),
      tapPairs('חַבֵּר מִסְפָּר לְמִלָּה', [
        {arabic:'3', match:'שְׁלֹשָׁה'}, {arabic:'7', match:'שִׁבְעָה'}, {arabic:'10', match:'עֲשָׂרָה'},
      ]),
      sortGroups('סַדֵּר כִּינּוּיֵי גּוּף', [
        {label:'זָכָר (مذكر)', items:['אַתָּה 👦','הוּא 👦']},
        {label:'נְקֵבָה (مؤنث)', items:['אַתְּ 👧','הִיא 👧']},
      ]),
      tf('"לֹא" בְּעִבְרִית פֵּירוּשׁוֹ "نعم"', false, '❌ לֹא! לֹא = لا'),
      wordOrder('סַדֵּר — رَتِّبِ', ['אַחְמַד.','בֶּן','אֲנִי','שֶׁבַע.'], 'אֲנִי אַחְמַד. בֶּן שֶׁבַע.'),
      fbChoice('___ שִּׁמְךָ? שְׁמִי דָּן.', ['מַה','אֵיפֹה','כַּמָּה'], 0, '👤'),
      comprehension(
        'שָׁלוֹם! שְׁמִי לֵאָה.\nאֲנִי בַּת שְׁמוֹנֶה שָׁנִים.\nאֲנִי אוֹהֶבֶת עִבְרִית! 📚',
        'שָׁלוֹם! שְׁמִי לֵאָה. אֲנִי בַּת שְׁמוֹנֶה שָׁנִים. אֲנִי אוֹהֶבֶת עִבְרִית!',
        [
          {q:'מַה שֵּׁם הַיַּלְדָּה?', options:['לֵאָה','נָדְיָה','שָׂרָה'], correct:0},
          {q:'בַּת כַּמָּה הִיא?', options:['שֶׁבַע','שְׁמוֹנֶה','תֵּשַׁע'], correct:1},
        ],
      ),
      listenImg('שְׁמַע וּבְחַר', 'חֲמִשָּׁה',
        [{emoji:'3️⃣', label:'שְׁלֹשָׁה'},{emoji:'4️⃣', label:'אַרְבָּעָה'},{emoji:'5️⃣', label:'חֲמִשָּׁה'},{emoji:'6️⃣', label:'שִׁשָּׁה'}], 2),
      readAloud('שָׁלוֹם! אֲנִי אַחְמַד. אֲנִי בֶּן שֶׁבַע. נָעִים מְאֹד!', 'أهلاً! أنا أحمد. عمري سبع. تشرفنا!', 45),
      speak('נָעִים מְאֹד', '🤝', 45),
    ],
  },
];

// ─── UNIT 3: הַמִּשְׁפָּחָה — العائلة ────────────────────────────────────────────
export const HEB2_UNIT3_LESSONS = [
  // L1 — אַבָּא וְאִמָּא
  {
    id: 'hb2-u3-l1', title: 'אַבָּא וְאִמָּא 👨‍👩‍👧', unitId: 'hb2-u3', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מִי זֶה? — من هذا؟ 👨', 'מִי זֶה',
        [{emoji:'👨', label:'אַבָּא (ז\')'},{emoji:'👩', label:'אִמָּא (נ\')'},{emoji:'👦', label:'יֶלֶד (ז\')'},{emoji:'👧', label:'יַלְדָּה (נ\')'}], 0),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה — صِلِ الصُّورَة بالكلمة', [
        {image:'👨', word:'אַבָּא'}, {image:'👩', word:'אִמָּא'},
        {image:'👦', word:'יֶלֶד'}, {image:'👧', word:'יַלְדָּה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'אַבָּא 👨', match:'أَبّ'}, {arabic:'אִמָּא 👩', match:'أُمّ'}, {arabic:'מִשְׁפָּחָה 👨‍👩‍👧', match:'عائلة'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'אִמָּא',
        [{emoji:'👨', label:'אַבָּא'},{emoji:'👩', label:'אִמָּא'},{emoji:'👦', label:'יֶלֶד'},{emoji:'👧', label:'יַלְדָּה'}], 1),
      mc('מָה הַמִּגְדָּר שֶׁל "אִמָּא"? — ما جنس كلمة أمّ؟', ['זָכָר (ז\')','נְקֵבָה (נ\')'], 1, 'אִמָּא — נ\' (مؤنث)'),
      flashcard('הַמִּשְׁפָּחָה — العائلة', 'אַבָּא (ז\') — أَبّ 👨\nאִמָּא (נ\') — أُمّ 👩\nיֶלֶד (ז\') — وَلَد 👦\nיַלְדָּה (נ\') — بِنْت 👧\nמִשְׁפָּחָה (נ\') — عائلة 👨‍👩‍👧'),
    ],
  },
  // L2 — אָח וְאָחוֹת
  {
    id: 'hb2-u3-l2', title: 'אָח וְאָחוֹת 👫', unitId: 'hb2-u3', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מִי זֶה? — من هذا؟ 👦', 'מִי זֶה',
        [{emoji:'👦', label:'אָח (ז\')'},{emoji:'👧', label:'אָחוֹת (נ\')'},{emoji:'👨', label:'אַבָּא (ז\')'},{emoji:'👩', label:'אִמָּא (נ\')'}], 0),
      mc('מַה פֵּירוּשׁ "אָחוֹת"? — ما معنى أخت؟', ['أخ','أخت','أم','أب'], 1, 'אָחוֹת = أخت'),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'אָח 👦', match:'أَخ'}, {arabic:'אָחוֹת 👧', match:'أُخْت'},
      ]),
      sortGroups('זָכָר אוֹ נְקֵבָה? — مذكر أم مؤنث؟', [
        {label:'זָכָר ז\' (مذكر)', items:['אַבָּא 👨','אָח 👦','יֶלֶד 👦']},
        {label:'נְקֵבָה נ\' (مؤنث)', items:['אִמָּא 👩','אָחוֹת 👧','יַלְדָּה 👧']},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'אָח',
        [{emoji:'👦', label:'אָח'},{emoji:'👧', label:'אָחוֹת'},{emoji:'👨', label:'אַבָּא'},{emoji:'👩', label:'אִמָּא'}], 0),
      speak('אָחוֹת', '👧', 45),
    ],
  },
  // L3 — סָבָא וְסָבְתָא
  {
    id: 'hb2-u3-l3', title: 'סָבָא וְסָבְתָא 👴👵', unitId: 'hb2-u3', order: 3, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מִי זֶה? — من هذا؟ 👴', 'מִי זֶה',
        [{emoji:'👴', label:'סָבָא (ז\')'},{emoji:'👵', label:'סָבְתָא (נ\')'},{emoji:'👨', label:'אַבָּא (ז\')'},{emoji:'👩', label:'אִמָּא (נ\')'}], 0),
      imgMatch('הַתְאֵם — صِلِ', [
        {image:'👴', word:'סָבָא'}, {image:'👵', word:'סָבְתָא'},
        {image:'👨', word:'אַבָּא'}, {image:'👩', word:'אִמָּא'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'סָבָא 👴', match:'جَدّ'}, {arabic:'סָבְתָא 👵', match:'جَدَّة'},
      ]),
      mc('מַה פֵּירוּשׁ "סָבְתָא"? — ما معنى جدة؟', ['جدّ','جدّة','أب','أم'], 1, 'סָבְתָא = جدّة'),
      listenImg('שְׁמַע וּבְחַר', 'סָבָא',
        [{emoji:'👴', label:'סָבָא'},{emoji:'👵', label:'סָבְתָא'},{emoji:'👨', label:'אַבָּא'},{emoji:'👩', label:'אִמָּא'}], 0),
      flashcard('סָבָא וְסָבְתָא', 'סָבָא (ז\') — جَدّ 👴\nסָבְתָא (נ\') — جَدَّة 👵\nדּוֹד (ז\') — عَمّ/خَال\nדּוֹדָה (נ\') — عَمَّة/خَالَة'),
    ],
  },
  // L4 — יֵשׁ לִי...
  {
    id: 'hb2-u3-l4', title: 'יֵשׁ לִי מִשְׁפָּחָה ❤️', unitId: 'hb2-u3', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "יֵשׁ לִי"? — ما معنى يِيشׁ לִי؟', ['ليس عندي','عندي','أنا','أريد'], 1, 'יֵשׁ לִי = عندي'),
      fbChoice('___ לִי אַבָּא וְאִמָּא. ❤️', ['יֵשׁ','אֵין','אֲנִי'], 0, '❤️'),
      wordOrder('סַדֵּר — رَتِّبِ', ['אָח.','לִי','יֵשׁ'], 'יֵשׁ לִי אָח.'),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'יֵשׁ לִי 👍', match:'عندي'}, {arabic:'אֵין לִי 👎', match:'ليس عندي'},
      ]),
      tf('"אֵין לִי" פֵּירוּשׁוֹ "عندي"', false, '❌ לֹא! אֵין לִי = ليس عندي'),
      readAloud('יֵשׁ לִי אַבָּא וְאִמָּא. יֵשׁ לִי אָח אֶחָד.', 'عندي أبٌ وأمٌّ. عندي أخٌ واحد.', 45),
    ],
  },
  // L5 — זֶה/זֹאת
  {
    id: 'hb2-u3-l5', title: 'זֶה/זֹאת — هَذَا/هَذِهِ 👈', unitId: 'hb2-u3', order: 5, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְ"אַבָּא" (זָכָר)?', ['זֹאת אַבָּא שֶׁלִּי','זֶה אַבָּא שֶׁלִּי'], 1, 'זֶה = هذا (مذكر)'),
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְ"אִמָּא" (נְקֵבָה)?', ['זֶה אִמָּא שֶׁלִּי','זֹאת אִמָּא שֶׁלִּי'], 1, 'זֹאת = هذه (مؤنث)'),
      sortGroups('זֶה אוֹ זֹאת? — هذا أم هذه؟', [
        {label:'זֶה (هذا — مذكر)', items:['אַבָּא 👨','אָח 👦','סָבָא 👴']},
        {label:'זֹאת (هذه — مؤنث)', items:['אִמָּא 👩','אָחוֹת 👧','סָבְתָא 👵']},
      ]),
      fbChoice('___ אִמָּא שֶׁלִּי. (مؤنث)', ['זֹאת','זֶה','הִיא'], 0, '👩'),
      wordOrder('סַדֵּר — رَتِّبِ', ['אַבָּא','שֶׁלִּי.','זֶה'], 'זֶה אַבָּא שֶׁלִּי.'),
      readAloud('זֶה אַבָּא שֶׁלִּי. זֹאת אִמָּא שֶׁלִּי.', 'هذا أبي. هذه أمي.', 45),
    ],
  },
  // L6 — כַּמָּה אַחִים?
  {
    id: 'hb2-u3-l6', title: 'כַּמָּה אַחִים יֵשׁ לְךָ? 🔢', unitId: 'hb2-u3', order: 6, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "כַּמָּה"? — ما معنى كَمَّاه؟', ['من','ماذا','كم','أين'], 2, 'כַּמָּה = كم'),
      fbChoice('___ אַחִים יֵשׁ לְךָ? (كم عندك إخوة؟)', ['כַּמָּה','מָתַי','אֵיפֹה'], 0, '👨‍👩‍👧‍👦'),
      wordOrder('סַדֵּר — رَتِّبِ', ['שְׁנֵי','יֵשׁ','לִי','אַחִים.'], 'יֵשׁ לִי שְׁנֵי אַחִים.'),
      listenImg('שְׁמַע וּבְחַר', 'כַּמָּה',
        [{emoji:'🔢', label:'כַּמָּה (كم)'},{emoji:'❓', label:'מִי (من)'},{emoji:'📍', label:'אֵיפֹה (أين)'},{emoji:'🕐', label:'מָתַי (متى)'}], 0),
      tapPairs('חַבֵּר שְׁאֵלָה לְתְּשׁוּבָה', [
        {arabic:'כַּמָּה אַחִים? 🔢', match:'יֵשׁ לִי שְׁנַיִם'}, {arabic:'מִי זֶה? 👈', match:'זֶה אָח שֶׁלִּי'},
      ]),
      speak('כַּמָּה אַחִים יֵשׁ לְךָ?', '🔢', 45),
    ],
  },
  // L7 — דִּיאָלוֹג
  {
    id: 'hb2-u3-l7', title: 'הַמִּשְׁפָּחָה שֶׁלִּי 💬', unitId: 'hb2-u3', order: 7, xpReward: 25, estimatedMinutes: 15,
    questions: [
      comprehension(
        'שָׁלוֹם! שְׁמִי סָאמִי.\nיֵשׁ לִי אַבָּא, אִמָּא, אָח וְאָחוֹת.\nאֲנִי אוֹהֵב אֶת הַמִּשְׁפָּחָה שֶׁלִּי! ❤️',
        'שָׁלוֹם! שְׁמִי סָאמִי. יֵשׁ לִי אַבָּא, אִמָּא, אָח וְאָחוֹת. אֲנִי אוֹהֵב אֶת הַמִּשְׁפָּחָה שֶׁלִּי!',
        [
          {q:'מַה שֵּׁם הַיֶּלֶד?', options:['דָּן','סָאמִי','יוֹסֵף'], correct:1},
          {q:'כַּמָּה אַחִים יֵשׁ לְסָאמִי?', options:['אֶחָד','שְׁנַיִם','שְׁלֹשָׁה'], correct:0},
        ],
      ),
      fbChoice('___ אָח וְאָחוֹת. (عندي أخ وأخت)', ['יֵשׁ לִי','אֵין לִי','אֲנִי'], 0, '👫'),
      wordOrder('סַדֵּר — رَتِّبِ', ['הַמִּשְׁפָּחָה','אֶת','אוֹהֵב','אֲנִי','שֶׁלִּי!'], 'אֲנִי אוֹהֵב אֶת הַמִּשְׁפָּחָה שֶׁלִּי!'),
      readAloud('יֵשׁ לִי אַבָּא, אִמָּא וְאָחוֹת אַחַת.', 'عندي أبٌ وأمٌّ وأختٌ واحدة.', 45),
    ],
  },
  // L8 — קְרִיאָה
  {
    id: 'hb2-u3-l8', title: 'מִשְׁפָּחָה גְּדוֹלָה 📖', unitId: 'hb2-u3', order: 8, xpReward: 28, estimatedMinutes: 18,
    questions: [
      comprehension(
        'אֲנִי לֵאָה.\nהַמִּשְׁפָּחָה שֶׁלִּי גְּדוֹלָה! 😊\nיֵשׁ לִי אַבָּא, אִמָּא וּשְׁנֵי אַחִים.\nגַּם סָבָא וְסָבְתָא גָּרִים אִתָּנוּ. 👴👵',
        'אֲנִי לֵאָה. הַמִּשְׁפָּחָה שֶׁלִּי גְּדוֹלָה! יֵשׁ לִי אַבָּא, אִמָּא וּשְׁנֵי אַחִים. גַּם סָבָא וְסָבְתָא גָּרִים אִתָּנוּ.',
        [
          {q:'מַה שֵּׁם הַיַּלְדָּה?', options:['שָׂרָה','לֵאָה','נָדְיָה'], correct:1},
          {q:'כַּמָּה אַחִים יֵשׁ לָהּ?', options:['אֶחָד','שְׁנַיִם','שְׁלֹשָׁה'], correct:1},
          {q:'מִי גָּר אִתָּם עוֹד?', options:['דּוֹד','סָבָא וְסָבְתָא','חָבֵר'], correct:1},
        ],
      ),
      mc('מַה פֵּירוּשׁ "גְּדוֹלָה"? — ما معنى كبيرة؟', ['صغيرة','كبيرة','جميلة','حلوة'], 1),
      speak('מִשְׁפָּחָה גְּדוֹלָה', '👨‍👩‍👧‍👦', 45),
    ],
  },
  // L9 — שִׂיחָה עִם בִּינָה מְלָאכוּתִית
  {
    id: 'hb2-u3-l9', title: 'שְׂוֹחֵחַ עַל הַמִּשְׁפָּחָה 🤖', unitId: 'hb2-u3', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      readAloud('יֵשׁ לִי אַבָּא, אִמָּא וְשְׁנֵי אַחִים.', 'عندي أب وأم وأخان.', 45),
      aiConv(
        'שִׂיחָה עַל הַמִּשְׁפָּחָה — حديث عن العائلة',
        'אתה נור, מורה חביב לילד ערבי בן 7 לומד עברית. שאל אותו על המשפחה שלו. השתמש רק במילים: שָׁלוֹם, יֵשׁ לְךָ, אַבָּא, אִמָּא, אָח, אָחוֹת, סָבָא, סָבְתָא, כַּמָּה. כל משפט עד 5 מילים. התחל: "שָׁלוֹם! יֵשׁ לְךָ אַחִים? 😊"',
      ),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 3
  {
    id: 'hb2-u3-l10', title: 'מִבְחָן יְחִידָה 3 ⭐', unitId: 'hb2-u3', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מִי זֶה? 👴', 'מִי זֶה',
        [{emoji:'👴', label:'סָבָא'},{emoji:'👨', label:'אַבָּא'},{emoji:'👦', label:'אָח'},{emoji:'👧', label:'אָחוֹת'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'👨', word:'אַבָּא'}, {image:'👩', word:'אִמָּא'},
        {image:'👴', word:'סָבָא'}, {image:'👵', word:'סָבְתָא'},
      ]),
      mc('מַה פֵּירוּשׁ "אָחוֹת"?', ['أخ','أخت','جدّ','أب'], 1),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'אַבָּא 👨', match:'أَبّ'}, {arabic:'אִמָּא 👩', match:'أُمّ'}, {arabic:'סָבָא 👴', match:'جَدّ'},
      ]),
      sortGroups('זָכָר אוֹ נְקֵבָה?', [
        {label:'זָכָר ז\' (مذكر)', items:['אַבָּא 👨','אָח 👦','סָבָא 👴']},
        {label:'נְקֵבָה נ\' (מؤنث)', items:['אִמָּא 👩','אָחוֹת 👧','סָבְתָא 👵']},
      ]),
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְ"אִמָּא"?', ['זֶה אִמָּא שֶׁלִּי','זֹאת אִמָּא שֶׁלִּי'], 1),
      fbChoice('___ לִי אָח אֶחָד.', ['יֵשׁ','אֵין','זֶה'], 0, '👦'),
      tf('"אֵין לִי" פֵּירוּשׁוֹ "عندي"', false, '❌ אֵין לִי = ليس عندي'),
      wordOrder('סַדֵּר', ['אָחוֹת.','לִי','יֵשׁ'], 'יֵשׁ לִי אָחוֹת.'),
      listenImg('שְׁמַע וּבְחַר', 'אָחוֹת',
        [{emoji:'👧', label:'אָחוֹת'},{emoji:'👦', label:'אָח'},{emoji:'👩', label:'אִמָּא'},{emoji:'👨', label:'אַבָּא'}], 0),
      readAloud('יֵשׁ לִי אַבָּא, אִמָּא וְאָחוֹת אַחַת.', 'عندي أبٌ وأمٌّ وأختٌ واحدة.', 45),
      speak('הַמִּשְׁפָּחָה שֶׁלִּי', '❤️', 45),
    ],
  },
];

// ─── UNIT 4: בֵּית הַסֵּפֶר — المدرسة ───────────────────────────────────────────
export const HEB2_UNIT4_LESSONS = [
  // L1 — כֵּלֵי לִימוּד
  {
    id: 'hb2-u4-l1', title: 'כֵּלֵי לִימוּד 🎒', unitId: 'hb2-u4', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ 📚', 'מָה זֶה',
        [{emoji:'📚', label:'סֵפֶר (ז\')'},{emoji:'✏️', label:'עֵט (ז\')'},{emoji:'🎒', label:'תִּיק (ז\')'},{emoji:'📏', label:'סַרְגֵּל (ז\')'}], 0),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'📚', word:'סֵפֶר'}, {image:'✏️', word:'עֵט'},
        {image:'🎒', word:'תִּיק'}, {image:'✂️', word:'מִסְפָּרַיִם'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'סֵפֶר 📚', match:'كِتَاب'}, {arabic:'עֵט ✏️', match:'قَلَم'}, {arabic:'תִּיק 🎒', match:'حَقِيبَة'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'עֵט',
        [{emoji:'📚', label:'סֵפֶר'},{emoji:'✏️', label:'עֵט'},{emoji:'🎒', label:'תִּיק'},{emoji:'📏', label:'סַרְגֵּל'}], 1),
      mc('מָה אָנוּ כּוֹתְבִים אִתּוֹ? — بماذا نكتب؟', ['סֵפֶר 📚','עֵט ✏️','תִּיק 🎒','לוּחַ 🖼️'], 1, 'עֵט = قَلَم'),
      flashcard('כֵּלֵי לִימוּד — أدوات المدرسة', 'סֵפֶר (ז\') — كِتَاب 📚\nעֵט (ז\') — قَلَم ✏️\nתִּיק (ז\') — حَقِيبَة 🎒\nמִחְבֶּרֶת (נ\') — دَفْتَر 📓\nמִסְפָּרַיִם (נ\') — مِقَصّ ✂️'),
    ],
  },
  // L2 — הַכִּיתָּה
  {
    id: 'hb2-u4-l2', title: 'הַכִּיתָּה 🏫', unitId: 'hb2-u4', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ 🖼️', 'מָה זֶה',
        [{emoji:'🖼️', label:'לוּחַ (ז\')'},{emoji:'🏫', label:'בֵּית סֵפֶר (ז\')'},{emoji:'🪑', label:'כִּסֵּא (ז\')'},{emoji:'🪟', label:'חַלּוֹן (ז\')'}], 0),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'🏫', word:'בֵּית סֵפֶר'}, {image:'🖼️', word:'לוּחַ'},
        {image:'🪑', word:'כִּסֵּא'}, {image:'🚪', word:'דֶּלֶת'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'בֵּית סֵפֶר 🏫', match:'مَدْرَسَة'}, {arabic:'כִּיתָּה 📐', match:'صَفّ/فَصْل'}, {arabic:'לוּחַ 🖼️', match:'سَبُّورَة'},
      ]),
      mc('אֵיפֹה לוֹמְדִים? — أين ندرس؟', ['בַּבַּיִת 🏠','בְּבֵית הַסֵּפֶר 🏫','בַּגַּן 🌸','בַּמּוֹסָף'], 1, 'בְּבֵית הַסֵּפֶר'),
      listenImg('שְׁמַע וּבְחַר', 'לוּחַ',
        [{emoji:'🖼️', label:'לוּחַ'},{emoji:'🪑', label:'כִּסֵּא'},{emoji:'🚪', label:'דֶּלֶת'},{emoji:'🏫', label:'בֵּית סֵפֶר'}], 0),
      speak('בֵּית סֵפֶר', '🏫', 45),
    ],
  },
  // L3 — מוֹרֶה / מוֹרָה
  {
    id: 'hb2-u4-l3', title: 'הַמּוֹרֶה וְהַמּוֹרָה 👨‍🏫👩‍🏫', unitId: 'hb2-u4', order: 3, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "מוֹרֶה"? — ما معنى مُعَلِّم؟', ['معلمة','معلم','طالب','طالبة'], 1, 'מוֹרֶה (ז\') = مُعَلِّم'),
      mc('מַה פֵּירוּשׁ "מוֹרָה"? — ما معنى مُعَلِّمَة؟', ['معلم','معلمة','تلميذ','ولد'], 1, 'מוֹרָה (נ\') = مُعَلِّمَة'),
      sortGroups('זָכָר אוֹ נְקֵבָה?', [
        {label:'זָכָר ז\' (مذكر)', items:['מוֹרֶה 👨‍🏫','תַּלְמִיד 👦','חָבֵר 👦']},
        {label:'נְקֵבָה נ\' (مؤنث)', items:['מוֹרָה 👩‍🏫','תַּלְמִידָה 👧','חֲבֵרָה 👧']},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'מוֹרֶה 👨‍🏫', match:'مُعَلِّم'}, {arabic:'מוֹרָה 👩‍🏫', match:'مُعَلِّمَة'}, {arabic:'תַּלְמִיד 👦', match:'تِلْمِيذ'},
      ]),
      fbChoice('הַ___ מְלַמֶּדֶת אוֹתָנוּ עִבְרִית. (مُعَلِّمَة)', ['מוֹרָה','מוֹרֶה','תַּלְמִיד'], 0, '👩‍🏫'),
      speak('מוֹרָה טוֹבָה', '👩‍🏫', 45),
    ],
  },
  // L4 — יֵשׁ לִי תִּיק
  {
    id: 'hb2-u4-l4', title: 'יֵשׁ לִי תִּיק 🎒', unitId: 'hb2-u4', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('כֵּיצַד אוֹמְרִים "عندي كتاب"?', ['יֵשׁ לְךָ סֵפֶר','יֵשׁ לִי סֵפֶר','אֵין לִי סֵפֶר'], 1),
      wordOrder('סַדֵּר — رَتِّبِ', ['עֵט.','לִי','יֵשׁ'], 'יֵשׁ לִי עֵט.'),
      fbChoice('___ לִי מִחְבֶּרֶת חֲדָשָׁה! 📓', ['יֵשׁ','אֵין','אֲנִי'], 0, '📓'),
      tapPairs('חַבֵּר שְׁאֵלָה לְתְּשׁוּבָה', [
        {arabic:'יֵשׁ לְךָ עֵט? ✏️', match:'כֵּן, יֵשׁ לִי'}, {arabic:'יֵשׁ לְךָ סֵפֶר? 📚', match:'לֹא, אֵין לִי'},
      ]),
      tf('"יֵשׁ לִי" = عندي', true, '✅ נָכוֹן! יֵשׁ לִי = عندي'),
      readAloud('יֵשׁ לִי תִּיק, סֵפֶר וְעֵט.', 'عندي حقيبةٌ وكتابٌ وقَلَمٌ.', 45),
    ],
  },
  // L5 — חָבֵר / חֲבֵרָה
  {
    id: 'hb2-u4-l5', title: 'חָבֵר וְחֲבֵרָה 👫', unitId: 'hb2-u4', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('מַה פֵּירוּשׁ "חָבֵר"? — ما معنى صَدِيق؟', ['صديقة','صديق','معلم','ولد'], 1, 'חָבֵר (ז\') = صَدِيق'),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'👦', word:'חָבֵר'}, {image:'👧', word:'חֲבֵרָה'},
        {image:'👨‍🏫', word:'מוֹרֶה'}, {image:'👩‍🏫', word:'מוֹרָה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'חָבֵר 👦', match:'صَدِيق'}, {arabic:'חֲבֵרָה 👧', match:'صَدِيقَة'},
      ]),
      fbChoice('שְׁמִי דָּן. הַ___ שֶׁלִּי שְׁמוֹ יוֹסִי. 👦', ['חָבֵר','חֲבֵרָה','אָח'], 0, '👦'),
      listenImg('שְׁמַע וּבְחַר', 'חָבֵר',
        [{emoji:'👦', label:'חָבֵר'},{emoji:'👧', label:'חֲבֵרָה'},{emoji:'👨‍🏫', label:'מוֹרֶה'},{emoji:'👩‍🏫', label:'מוֹרָה'}], 0),
      speak('חָבֵר טוֹב', '👦', 45),
    ],
  },
  // L6 — בְּבֵית הַסֵּפֶר
  {
    id: 'hb2-u4-l6', title: 'בְּבֵית הַסֵּפֶר 🏫', unitId: 'hb2-u4', order: 6, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה עוֹשִׂים בְּבֵית הַסֵּפֶר? — ماذا نفعل في المدرسة؟', ['نَنَام','نَلْعَب فَقَط','נִלְמַד وَنَكْتُب','نَأْكُل'], 2, 'לוֹמְדִים וְכוֹתְבִים'),
      sortGroups('בְּבֵית הַסֵּפֶר אוֹ בַּבַּיִת?', [
        {label:'בְּבֵית הַסֵּפֶר 🏫', items:['לוֹמְדִים 📚','כּוֹתְבִים ✏️','שׁוֹמְעִים לַמּוֹרֶה 👂']},
        {label:'בַּבַּיִת 🏠', items:['אוֹכְלִים 🍽️','יְשֵׁנִים 😴','מִשְׂחָקִים 🎮']},
      ]),
      wordOrder('סַדֵּר — رَتِّبِ', ['בְּבֵית','לוֹמֵד','אֲנִי','הַסֵּפֶר.'], 'אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר.'),
      fbChoice('אֲנִי ___ בְּבֵית הַסֵּפֶר. (أنا أتعلم)', ['לוֹמֵד','יָשֵׁן','אוֹכֵל'], 0, '🏫'),
      tapPairs('חַבֵּר פְּעֻלָּה לְתַרְגּוּם', [
        {arabic:'לוֹמֵד 📚', match:'يَتَعَلَّم'}, {arabic:'כּוֹתֵב ✏️', match:'يَكْتُب'}, {arabic:'קוֹרֵא 📖', match:'يَقْرَأ'},
      ]),
      readAloud('אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. יֵשׁ לִי מוֹרָה טוֹבָה.', 'أنا أتعلم في المدرسة. عندي معلمة طيبة.', 45),
    ],
  },
  // L7 — דִּיאָלוֹג בַּכִּיתָּה
  {
    id: 'hb2-u4-l7', title: 'דִּיאָלוֹג בַּכִּיתָּה 💬', unitId: 'hb2-u4', order: 7, xpReward: 25, estimatedMinutes: 15,
    questions: [
      comprehension(
        'מוֹרָה: שָׁלוֹם, תַּלְמִידִים!\nתַּלְמִידִים: שָׁלוֹם, מוֹרָה!\nמוֹרָה: פִּתְחוּ אֶת הַסֵּפֶר, עַמּוּד עֶשֶׂר.\nדָּן: אֵין לִי עֵט!\nמוֹרָה: קַח עֵט, דָּן. 😊',
        'מוֹרָה: שָׁלוֹם תַּלְמִידִים! תַּלְמִידִים: שָׁלוֹם מוֹרָה! מוֹרָה: פִּתְחוּ אֶת הַסֵּפֶר עַמּוּד עֶשֶׂר. דָּן: אֵין לִי עֵט! מוֹרָה: קַח עֵט דָּן.',
        [
          {q:'מָה אוֹמֶרֶת הַמּוֹרָה בְּהַתְחָלָה?', options:['לַיְלָה טוֹב','שָׁלוֹם תַּלְמִידִים','בּוֹאוּ נֶאֱכַל'], correct:1},
          {q:'מַה אֵין לְדָּן?', options:['סֵפֶר','תִּיק','עֵט'], correct:2},
        ],
      ),
      fbChoice('___ לִי עֵט! (ليس عندي قلم)', ['אֵין','יֵשׁ','קַח'], 0, '✏️'),
      readAloud('שָׁלוֹם, מוֹרָה! יֵשׁ לִי סֵפֶר וְעֵט.', 'أهلاً أستاذة! عندي كتابٌ وقلمٌ.', 45),
    ],
  },
  // L8 — קְרִיאָה: יוֹם רִאשׁוֹן בַּכִּיתָּה
  {
    id: 'hb2-u4-l8', title: 'יוֹם רִאשׁוֹן בַּכִּיתָּה 📖', unitId: 'hb2-u4', order: 8, xpReward: 28, estimatedMinutes: 18,
    questions: [
      comprehension(
        'הַיּוֹם הַיּוֹם רִאשׁוֹן בְּבֵית הַסֵּפֶר! 🎉\nשְׁמִי רִמָּה. אֲנִי בַּכִּיתָּה ב.\nהַמּוֹרָה שֶׁלִּי שְׁמָהּ מִרְיָם.\nיֵשׁ לִי חֲבֵרָה חֲדָשָׁה — שְׁמָהּ סָנָא. 😊',
        'הַיּוֹם יוֹם רִאשׁוֹן בְּבֵית הַסֵּפֶר! שְׁמִי רִמָּה. אֲנִי בַּכִּיתָּה ב. הַמּוֹרָה שֶׁלִּי שְׁמָהּ מִרְיָם. יֵשׁ לִי חֲבֵרָה חֲדָשָׁה שְׁמָהּ סָנָא.',
        [
          {q:'מַה שֵּׁם הַיַּלְדָּה?', options:['סָנָא','מִרְיָם','רִמָּה'], correct:2},
          {q:'מַה שֵּׁם הַמּוֹרָה?', options:['מִרְיָם','רִמָּה','לֵאָה'], correct:0},
          {q:'מִי הַחֲבֵרָה הַחֲדָשָׁה?', options:['מִרְיָם','סָנָא','נָדְיָה'], correct:1},
        ],
      ),
      mc('מַה פֵּירוּשׁ "חֲדָשָׁה"? — ما معنى جديدة؟', ['قديمة','جديدة','جميلة','كبيرة'], 1),
      speak('יוֹם רִאשׁוֹן בְּבֵית הַסֵּפֶר', '🎉', 45),
    ],
  },
  // L9 — שִׂיחָה: בְּבֵית הַסֵּפֶר
  {
    id: 'hb2-u4-l9', title: 'שְׂוֹחֵחַ עַל בֵּית הַסֵּפֶר 🤖', unitId: 'hb2-u4', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      readAloud('אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. יֵשׁ לִי חָבֵר טוֹב.', 'أنا أتعلم في المدرسة. عندي صديق طيب.', 45),
      aiConv(
        'שִׂיחָה עַל בֵּית הַסֵּפֶר — حديث عن المدرسة',
        'אתה נור, מורה חביב לילד ערבי בן 7 לומד עברית. שאל אותו על בית הספר שלו. השתמש רק במילים: בֵּית סֵפֶר, כִּיתָּה, מוֹרֶה, מוֹרָה, חָבֵר, סֵפֶר, עֵט, יֵשׁ לְךָ, לוֹמֵד. כל משפט עד 5 מילים. התחל: "שָׁלוֹם! אֵיזֶה כִּיתָּה אַתָּה? 😊"',
      ),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 4
  {
    id: 'hb2-u4-l10', title: 'מִבְחָן יְחִידָה 4 ⭐', unitId: 'hb2-u4', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מָה זֶה? 📚', 'מָה זֶה',
        [{emoji:'📚', label:'סֵפֶר'},{emoji:'✏️', label:'עֵט'},{emoji:'🎒', label:'תִּיק'},{emoji:'📏', label:'סַרְגֵּל'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'✏️', word:'עֵט'}, {image:'🎒', word:'תִּיק'},
        {image:'🏫', word:'בֵּית סֵפֶר'}, {image:'🖼️', word:'לוּחַ'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'סֵפֶר 📚', match:'كِتَاب'}, {arabic:'מוֹרָה 👩‍🏫', match:'مُعَلِّمَة'}, {arabic:'חָבֵר 👦', match:'صَدِيق'},
      ]),
      sortGroups('זָכָר אוֹ נְקֵבָה?', [
        {label:'זָכָר ז\' (مذكر)', items:['מוֹרֶה 👨‍🏫','חָבֵר 👦','תַּלְמִיד 👦']},
        {label:'נְקֵבָה נ\' (مؤنث)', items:['מוֹרָה 👩‍🏫','חֲבֵרָה 👧','כִּיתָּה 📐']},
      ]),
      mc('מַה פֵּירוּשׁ "מוֹרֶה"?', ['معلمة','معلم','صديق','تلميذ'], 1),
      fbChoice('___ לִי תִּיק וְסֵפֶר. (عندي)', ['יֵשׁ','אֵין','קַח'], 0, '🎒'),
      tf('"חָבֵר" הוּא נְקֵבָה', false, '❌ חָבֵר — ז\' (مذكر)'),
      wordOrder('סַדֵּר', ['בְּבֵית','לוֹמֵד','אֲנִי','הַסֵּפֶר.'], 'אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר.'),
      listenImg('שְׁמַע וּבְחַר', 'סֵפֶר',
        [{emoji:'📚', label:'סֵפֶר'},{emoji:'✏️', label:'עֵט'},{emoji:'🎒', label:'תִּיק'},{emoji:'📏', label:'סַרְגֵּל'}], 0),
      comprehension(
        'אֲנִי תַּלְמִיד. שְׁמִי יוֹסֵף.\nיֵשׁ לִי תִּיק, סֵפֶר וְעֵט.\nהַמּוֹרֶה שֶׁלִּי נִקְרָא אָמִיר.',
        'אֲנִי תַּלְמִיד. שְׁמִי יוֹסֵף. יֵשׁ לִי תִּיק, סֵפֶר וְעֵט. הַמּוֹרֶה שֶׁלִּי נִקְרָא אָמִיר.',
        [
          {q:'מַה שֵּׁם הַתַּלְמִיד?', options:['אָמִיר','יוֹסֵף','דָּן'], correct:1},
          {q:'מַה שֵּׁם הַמּוֹרֶה?', options:['יוֹסֵף','דָּן','אָמִיר'], correct:2},
        ],
      ),
      speak('יֵשׁ לִי תִּיק', '🎒', 45),
    ],
  },
];

// ─── UNIT 5: צְבָעִים — الألوان ─────────────────────────────────────────────────
export const HEB2_UNIT5_LESSONS = [
  // L1 — צְבָעִים בְּסִיסִיִּים
  {
    id: 'hb2-u5-l1', title: 'צְבָעִים: אָדֹם כָּחֹל יָרֹק 🎨', unitId: 'hb2-u5', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה הַצֶּבַע? — ما اللون؟ 🔴', 'מָה הַצֶּבַע',
        [{emoji:'🔴', label:'אָדֹם'},{emoji:'🔵', label:'כָּחֹל'},{emoji:'🟢', label:'יָרֹק'},{emoji:'🟡', label:'צָהֹב'}], 0),
      imgMatch('הַתְאֵם צֶבַע לְמִלָּה — صِلِ اللَّوْن بالكلمة', [
        {image:'🔴', word:'אָדֹם'}, {image:'🔵', word:'כָּחֹל'},
        {image:'🟢', word:'יָרֹק'}, {image:'🟡', word:'צָהֹב'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'אָדֹם 🔴', match:'أَحْمَر'}, {arabic:'כָּחֹל 🔵', match:'أَزْرَق'}, {arabic:'יָרֹק 🟢', match:'أَخْضَر'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'כָּחֹל',
        [{emoji:'🔴', label:'אָדֹם'},{emoji:'🔵', label:'כָּחֹל'},{emoji:'🟢', label:'יָרֹק'},{emoji:'🟡', label:'צָהֹב'}], 1),
      mc('מָה צֶבַע הַשֶּׁמֶשׁ? ☀️ — ما لون الشمس؟', ['אָדֹם 🔴','כָּחֹל 🔵','יָרֹק 🟢','צָהֹב 🟡'], 3, 'הַשֶּׁמֶשׁ צְהֻבָּה'),
      flashcard('צְבָעִים — ألوان', 'אָדֹם — أَحْمَر 🔴\nכָּחֹל — أَزْرَق 🔵\nיָרֹק — أَخْضَر 🟢\nצָהֹב — أَصْفَر 🟡'),
    ],
  },
  // L2 — לָבָן שָׁחֹר כָּתֹם
  {
    id: 'hb2-u5-l2', title: 'לָבָן שָׁחֹר כָּתֹם 🖤🤍🟠', unitId: 'hb2-u5', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה הַצֶּבַע? — ما اللون؟ 🟠', 'מָה הַצֶּבַע',
        [{emoji:'🟠', label:'כָּתֹם'},{emoji:'⚫', label:'שָׁחֹר'},{emoji:'⚪', label:'לָבָן'},{emoji:'🟣', label:'סָגֹל'}], 0),
      imgMatch('הַתְאֵם צֶבַע לְמִלָּה', [
        {image:'🟠', word:'כָּתֹם'}, {image:'⚫', word:'שָׁחֹר'},
        {image:'⚪', word:'לָבָן'}, {image:'🟤', word:'חוּם'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'לָבָן ⚪', match:'أَبْيَض'}, {arabic:'שָׁחֹר ⚫', match:'أَسْوَد'}, {arabic:'כָּתֹם 🟠', match:'بُرْتُقَالِي'},
      ]),
      mc('מָה צֶבַע הַשֶּׁלֶג? ❄️ — ما لون الثلج؟', ['שָׁחֹר','לָבָן','כָּחֹל','צָהֹב'], 1, 'הַשֶּׁלֶג לָבָן'),
      listenImg('שְׁמַע וּבְחַר', 'שָׁחֹר',
        [{emoji:'⚫', label:'שָׁחֹר'},{emoji:'⚪', label:'לָבָן'},{emoji:'🟠', label:'כָּתֹם'},{emoji:'🟤', label:'חוּם'}], 0),
      speak('לָבָן וְשָׁחֹר', '⚫⚪', 45),
    ],
  },
  // L3 — וָרֹד סָגֹל חוּם
  {
    id: 'hb2-u5-l3', title: 'וָרֹד סָגֹל חוּם 🌸💜🟤', unitId: 'hb2-u5', order: 3, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה הַצֶּבַע? 🌸', 'מָה הַצֶּבַע',
        [{emoji:'🌸', label:'וָרֹד'},{emoji:'🟣', label:'סָגֹל'},{emoji:'🟤', label:'חוּם'},{emoji:'🔴', label:'אָדֹם'}], 0),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'וָרֹד 🌸', match:'وَرْدِي'}, {arabic:'סָגֹל 🟣', match:'بَنَفْسَجِي'}, {arabic:'חוּם 🟤', match:'بُنِّي'},
      ]),
      sortGroups('סַדֵּר צְבָעִים לְקְבוּצוֹת — صَنِّفِ الألوان', [
        {label:'קָרִים 🌊 (باردة)', items:['כָּחֹל 🔵','יָרֹק 🟢','סָגֹל 🟣']},
        {label:'חַמִּים 🔥 (دافئة)', items:['אָדֹם 🔴','כָּתֹם 🟠','צָהֹב 🟡']},
      ]),
      mc('מָה צֶבַע הַשּׁוֹשַׁנָּה? 🌹 — ما لون الوردة؟', ['כָּחֹל','יָרֹק','אָדֹם','שָׁחֹר'], 2, 'הַשּׁוֹשַׁנָּה אֲדֻמָּה'),
      listenImg('שְׁמַע וּבְחַר', 'סָגֹל',
        [{emoji:'🟣', label:'סָגֹל'},{emoji:'🌸', label:'וָרֹד'},{emoji:'🟤', label:'חוּם'},{emoji:'🔵', label:'כָּחֹל'}], 0),
      flashcard('עוֹד צְבָעִים — مزيد من الألوان', 'וָרֹד — وَرْدِي 🌸\nסָגֹל — بَنَفْسَجِي 🟣\nחוּם — بُنِّي 🟤\nאָפֹר — رَمَادِي 🩶'),
    ],
  },
  // L4 — מָה צֶבַע...?
  {
    id: 'hb2-u5-l4', title: 'מָה צֶבַע...? 🎨', unitId: 'hb2-u5', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מָה צֶבַע הָעֵשֶׂב? 🌿 — ما لون العشب؟', ['אָדֹם','כָּחֹל','יָרֹק','צָהֹב'], 2, 'הָעֵשֶׂב יָרֹק'),
      mc('מָה צֶבַע הַשָּׁמַיִם? ☁️ — ما لون السماء؟', ['אָדֹם','כָּחֹל','יָרֹק','שָׁחֹר'], 1, 'הַשָּׁמַיִם כְּחֻלִּים'),
      fbChoice('הַתַּפּוּחַ 🍎 הוּא בְּצֶבַע ___', ['אָדֹם','כָּחֹל','צָהֹב'], 0, '🍎'),
      wordOrder('סַדֵּר — رَتِّبِ', ['הַסֵּפֶר?','מָה','צֶבַע'], 'מָה צֶבַע הַסֵּפֶר?'),
      tapPairs('הַתְאֵם דָּבָר לְצֶבַע', [
        {arabic:'שֶׁמֶשׁ ☀️', match:'צָהֹב'}, {arabic:'עֵשֶׂב 🌿', match:'יָרֹק'}, {arabic:'שֶׁלֶג ❄️', match:'לָבָן'},
      ]),
      readAloud('מָה צֶבַע הַדֶּגֶל? הַדֶּגֶל כָּחֹל וְלָבָן.', 'ما لون العلم؟ العلم أزرق وأبيض.', 45),
    ],
  },
  // L5 — הַסְכָּמַת מִגְדָּר (gender agreement)
  {
    id: 'hb2-u5-l5', title: 'צֶבַע לְזָכָר וְנְקֵבָה 🔤', unitId: 'hb2-u5', order: 5, xpReward: 25, estimatedMinutes: 15,
    questions: [
      mc('כַּדּוּר אָדֹם — הַצֶּבַע הוּא לְ... — الكرة مذكر، فاللون...', ['זָכָר (مذكر) ✅','נְקֵבָה (مؤنث)'], 0, 'כַּדּוּר = ז\', לָכֵן: כַּדּוּר אָדֹם'),
      mc('שּׁוֹשַׁנָּה אֲדֻמָּה — הַצֶּבַע הוּא לְ...', ['זָכָר (مذكر)','נְקֵבָה (مؤنث) ✅'], 1, 'שּׁוֹשַׁנָּה = נ\', לָכֵן: אֲדֻמָּה (בְּהֵ"א)'),
      sortGroups('כַּדּוּר (ז\') אוֹ שּׁוֹשַׁנָּה (נ\')?', [
        {label:'כַּדּוּר ז\' (مذكر) — ירוק/כחול...', items:['כַּדּוּר יָרֹק 🟢','כַּדּוּר כָּחֹל 🔵','כַּדּוּר אָדֹם 🔴']},
        {label:'שּׁוֹשַׁנָּה נ\' (مؤنث) — ירוקה/כחולה...', items:['שּׁוֹשַׁנָּה יְרֻקָּה 🌿','שּׁוֹשַׁנָּה כְּחֻלָּה 🔵','שּׁוֹשַׁנָּה אֲדֻמָּה 🌹']},
      ]),
      fbChoice('הַשּׁוֹשַׁנָּה אֲדֻמָּ___ (נ\')', ['ה — אֲדֻמָּה','— אָדֹם'], 0, '🌹'),
      tf('אָמְרִים "תַּפּוּחַ אֲדֻמָּה" (תַּפּוּחַ = ז\')', false, '❌ תַּפּוּחַ ז\', לָכֵן: תַּפּוּחַ אָדֹם'),
      flashcard('הַסְכָּמַת מִגְדָּר — توافق الجنس', 'ז\': כַּדּוּר אָדֹם, יָרֹק, כָּחֹל\nנ\': שּׁוֹשַׁנָּה אֲדֻמָּה, יְרֻקָּה, כְּחֻלָּה\n(المؤنث يأخذ ה- في النهاية)'),
    ],
  },
  // L6 — מִשְׂחַק צְבָעִים
  {
    id: 'hb2-u5-l6', title: 'מִשְׂחַק צְבָעִים 🎮', unitId: 'hb2-u5', order: 6, xpReward: 22, estimatedMinutes: 14,
    questions: [
      listenChoice('אָדֹם', ['אָדֹם 🔴','כָּחֹל 🔵','יָרֹק 🟢'], 0),
      listenChoice('צָהֹב', ['אָדֹם 🔴','צָהֹב 🟡','לָבָן ⚪'], 1),
      listenChoice('שָׁחֹר', ['שָׁחֹר ⚫','וָרֹד 🌸','חוּם 🟤'], 0),
      sortGroups('צְבָעִים שֶׁל הַדֶּגֶל הַיִּשְׂרְאֵלִי 🇮🇱', [
        {label:'כֵּן — בַּדֶּגֶל', items:['כָּחֹל 🔵','לָבָן ⚪']},
        {label:'לֹא — לֹא בַּדֶּגֶל', items:['אָדֹם 🔴','יָרֹק 🟢','שָׁחֹר ⚫']},
      ]),
      dragOrder('סַדֵּר צְבָעִים בְּסֵדֶר קֶשֶׁת — رَتِّبِ ألوان قوس قزح', [
        {text:'אָדֹם 🔴', order:1},{text:'כָּתֹם 🟠', order:2},{text:'צָהֹב 🟡', order:3},
        {text:'יָרֹק 🟢', order:4},{text:'כָּחֹל 🔵', order:5},
      ]),
      speak('אֲנִי אוֹהֵב כָּחֹל', '🔵', 45),
    ],
  },
  // L7 — מִסְפָּרִים וּצְבָעִים
  {
    id: 'hb2-u5-l7', title: 'מִסְפָּרִים וּצְבָעִים 🎨🔢', unitId: 'hb2-u5', order: 7, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('כַּמָּה כַּדּוּרִים אֲדֻמִּים? 🔴🔴🔴 — كم كرة حمراء؟', ['שְׁנַיִם','שְׁלֹשָׁה','אַרְבָּעָה'], 1),
      fbChoice('יֵשׁ לִי ___ כַּדּוּרִים כְּחֻלִּים. 🔵🔵 (2)', ['שְׁנַיִם','שְׁלֹשָׁה','אֶחָד'], 0, '🔵🔵'),
      tapPairs('חַבֵּר מִסְפָּר לְצֶבַע', [
        {arabic:'1 🔴', match:'אֶחָד אָדֹם'}, {arabic:'3 🟢', match:'שְׁלֹשָׁה יְרֻקִּים'},
      ]),
      wordOrder('סַדֵּר — رَتِّبِ', ['כְּחֻלִּים.','לִי','שִׁשָּׁה','יֵשׁ','עֵפְרוֹנוֹת'], 'יֵשׁ לִי שִׁשָּׁה עֵפְרוֹנוֹת כְּחֻלִּים.'),
      dragOrder('סַדֵּר 1-5 עִם צְבָעִים', [
        {text:'1 אֶחָד אָדֹם 🔴', order:1},{text:'2 שְׁנַיִם כְּחֻלִּים 🔵', order:2},
        {text:'3 שְׁלֹשָׁה יְרֻקִּים 🟢', order:3},{text:'4 אַרְבָּעָה צְהֻבִּים 🟡', order:4},
      ]),
      readAloud('יֵשׁ לִי חָמֵשׁ עֵפְרוֹנוֹת: אָדֹם, כָּחֹל, יָרֹק, צָהֹב וְכָתֹם.', 'عندي خمسة أقلام: أحمر وأزرق وأخضر وأصفر وبرتقالي.', 45),
    ],
  },
  // L8 — שִׁיר צְבָעִים
  {
    id: 'hb2-u5-l8', title: 'שִׁיר הַצְּבָעִים 🎵', unitId: 'hb2-u5', order: 8, xpReward: 22, estimatedMinutes: 14,
    questions: [
      readAloud('אָדֹם כְּמוֹ תַּפּוּחַ, כָּחֹל כְּמוֹ הַיָּם, יָרֹק כְּמוֹ עֵשֶׂב, צָהֹב כְּמוֹ שֶׁמֶשׁ!', 'أحمر كالتفاحة، أزرق كالبحر، أخضر كالعشب، أصفر كالشمس!', 40),
      mc('מָה כָּחֹל כְּמוֹ...? — ما الأزرق مثل؟', ['הַתַּפּוּחַ','הַיָּם','הָעֵשֶׂב','הַשֶּׁמֶשׁ'], 1),
      fbChoice('יָרֹק כְּמוֹ ___ 🌿', ['עֵשֶׂב','יָם','שֶׁמֶשׁ'], 0, '🌿'),
      dragOrder('סַדֵּר כְּסֵדֶר הַשִּׁיר', [
        {text:'אָדֹם 🍎', order:1},{text:'כָּחֹל 🌊', order:2},{text:'יָרֹק 🌿', order:3},{text:'צָהֹב ☀️', order:4},
      ]),
      speak('אָדֹם כְּמוֹ תַּפּוּחַ', '🍎', 45),
    ],
  },
  // L9 — קְרִיאָה: הַתַּרְמִיל שֶׁלִּי
  {
    id: 'hb2-u5-l9', title: 'הַתַּרְמִיל שֶׁלִּי 📖', unitId: 'hb2-u5', order: 9, xpReward: 28, estimatedMinutes: 18,
    questions: [
      comprehension(
        'הַתַּרְמִיל שֶׁלִּי כָּחֹל. 🎒\nבְּתוֹכוֹ יֵשׁ: סֵפֶר אָדֹם, מִחְבֶּרֶת יְרֻקָּה,\nשִׁשָּׁה עֵפְרוֹנוֹת צְהֻבִּים וּמִסְפָּרַיִם כְּסוּפוֹת. ✂️',
        'הַתַּרְמִיל שֶׁלִּי כָּחֹל. בְּתוֹכוֹ יֵשׁ: סֵפֶר אָדֹם, מִחְבֶּרֶת יְרֻקָּה, שִׁשָּׁה עֵפְרוֹנוֹת צְהֻבִּים וּמִסְפָּרַיִם כְּסוּפוֹת.',
        [
          {q:'מָה צֶבַע הַתַּרְמִיל?', options:['אָדֹם','כָּחֹל','יָרֹק'], correct:1},
          {q:'מָה צֶבַע הַסֵּפֶר?', options:['כָּחֹל','יָרֹק','אָדֹם'], correct:2},
          {q:'כַּמָּה עֵפְרוֹנוֹת יֵשׁ?', options:['חֲמִשָּׁה','שִׁשָּׁה','שִׁבְעָה'], correct:1},
        ],
      ),
      mc('מַה פֵּירוּשׁ "בְּתוֹכוֹ"? — ما معنى "في داخله"؟', ['خارجه','في داخله','فوقه','تحته'], 1),
      speak('הַתַּרְמִיל שֶׁלִּי כָּחֹל', '🎒', 45),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 5
  {
    id: 'hb2-u5-l10', title: 'מִבְחָן יְחִידָה 5 ⭐', unitId: 'hb2-u5', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מָה הַצֶּבַע? 🔴', 'מָה הַצֶּבַע',
        [{emoji:'🔴', label:'אָדֹם'},{emoji:'🔵', label:'כָּחֹל'},{emoji:'🟢', label:'יָרֹק'},{emoji:'🟡', label:'צָהֹב'}], 0),
      imgMatch('הַתְאֵם צֶבַע לְמִלָּה', [
        {image:'🔴', word:'אָדֹם'}, {image:'⚫', word:'שָׁחֹר'},
        {image:'⚪', word:'לָבָן'}, {image:'🟠', word:'כָּתֹם'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'כָּחֹל 🔵', match:'أَزْرَق'}, {arabic:'יָרֹק 🟢', match:'أَخْضَر'}, {arabic:'צָהֹב 🟡', match:'أَصْفَر'},
      ]),
      mc('מָה צֶבַע הָעֵשֶׂב? 🌿', ['אָדֹם','כָּחֹל','יָרֹק','צָהֹב'], 2),
      mc('שּׁוֹשַׁנָּה (נ\') + אָדֹם = ?', ['שּׁוֹשַׁנָּה אָדֹם','שּׁוֹשַׁנָּה אֲדֻמָּה'], 1, 'נ\' → אֲדֻמָּה'),
      fbChoice('הַתַּפּוּחַ ___ (אָדֹם, ז\')', ['אָדֹם','אֲדֻמָּה','כָּחֹל'], 0, '🍎'),
      listenChoice('יָרֹק', ['אָדֹם 🔴','כָּחֹל 🔵','יָרֹק 🟢'], 2),
      sortGroups('חַמִּים אוֹ קָרִים?', [
        {label:'חַמִּים 🔥 (دافئة)', items:['אָדֹם 🔴','כָּתֹם 🟠','צָהֹב 🟡']},
        {label:'קָרִים 🌊 (باردة)', items:['כָּחֹל 🔵','יָרֹק 🟢','סָגֹל 🟣']},
      ]),
      wordOrder('סַדֵּר', ['כָּחֹל.','הַתַּרְמִיל','שֶׁלִּי'], 'הַתַּרְמִיל שֶׁלִּי כָּחֹל.'),
      comprehension(
        'אֲנִי מְצַיֵּר. 🎨\nהַשֶּׁמֶשׁ שֶׁלִּי צְהֻבָּה.\nהָעֵשֶׂב שֶׁלִּי יָרֹק.\nהַשָּׁמַיִם שֶׁלִּי כְּחֻלִּים.',
        'אֲנִי מְצַיֵּר. הַשֶּׁמֶשׁ שֶׁלִּי צְהֻבָּה. הָעֵשֶׂב שֶׁלִּי יָרֹק. הַשָּׁמַיִם שֶׁלִּי כְּחֻלִּים.',
        [
          {q:'מָה צֶבַע הַשֶּׁמֶשׁ?', options:['אָדֹם','צָהֹב','כָּחֹל'], correct:1},
          {q:'מָה צֶבַע הַשָּׁמַיִם?', options:['יָרֹק','צָהֹב','כָּחֹל'], correct:2},
        ],
      ),
      speak('אָדֹם כָּחֹל יָרֹק', '🎨', 45),
    ],
  },
];

// ─── UNIT 6: גּוּף הָאָדָם — جسم الإنسان ────────────────────────────────────────
export const HEB2_UNIT6_LESSONS = [
  // L1 — הָרֹאשׁ
  {
    id: 'hb2-u6-l1', title: 'הָרֹאשׁ 👤', unitId: 'hb2-u6', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ 👁️', 'מָה זֶה',
        [{emoji:'👁️', label:'עַיִן (נ\')'},{emoji:'👂', label:'אוֹזֶן (נ\')'},{emoji:'👃', label:'אַף (ז\')'},{emoji:'👄', label:'פֶּה (ז\')'}], 0),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'👁️', word:'עַיִן'}, {image:'👂', word:'אוֹזֶן'},
        {image:'👃', word:'אַף'}, {image:'👄', word:'פֶּה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'עַיִן 👁️', match:'عَيْن'}, {arabic:'אוֹזֶן 👂', match:'أُذُن'}, {arabic:'פֶּה 👄', match:'فَم'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'אַף',
        [{emoji:'👁️', label:'עַיִן'},{emoji:'👂', label:'אוֹזֶן'},{emoji:'👃', label:'אַף'},{emoji:'👄', label:'פֶּה'}], 2),
      mc('כַּמָּה עֵינַיִם יֵשׁ לְאָדָם? — كم عيناً للإنسان؟', ['אַחַת','שְׁתַּיִם','שָׁלוֹשׁ'], 1, 'שְׁתַּיִם עֵינַיִם'),
      flashcard('חֵלְקֵי הָרֹאשׁ — أجزاء الرأس', 'רֹאשׁ (ז\') — رَأْس\nעַיִן (נ\') — عَيْن 👁️\nאוֹזֶן (נ\') — أُذُن 👂\nאַף (ז\') — أَنْف 👃\nפֶּה (ז\') — فَم 👄'),
    ],
  },
  // L2 — הַגּוּף
  {
    id: 'hb2-u6-l2', title: 'הַגּוּף 🙋', unitId: 'hb2-u6', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ ✋', 'מָה זֶה',
        [{emoji:'✋', label:'יָד (נ\')'},{emoji:'🦵', label:'רֶגֶל (נ\')'},{emoji:'🦶', label:'כַּף רֶגֶל (נ\')'},{emoji:'💪', label:'זְרוֹעַ (נ\')'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'✋', word:'יָד'}, {image:'🦵', word:'רֶגֶל'},
        {image:'💪', word:'זְרוֹעַ'}, {image:'🫁', word:'בֶּטֶן'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'יָד ✋', match:'يَد'}, {arabic:'רֶגֶל 🦵', match:'رِجْل'}, {arabic:'בֶּטֶן 🫁', match:'بَطْن'},
      ]),
      mc('כַּמָּה יָדַיִם יֵשׁ לְאָדָם? — كم يداً للإنسان؟', ['אַחַת','שְׁתַּיִם','שָׁלוֹשׁ'], 1, 'שְׁתַּיִם יָדַיִם'),
      listenImg('שְׁמַע וּבְחַר', 'רֶגֶל',
        [{emoji:'✋', label:'יָד'},{emoji:'🦵', label:'רֶגֶל'},{emoji:'💪', label:'זְרוֹעַ'},{emoji:'🫁', label:'בֶּטֶן'}], 1),
      speak('יָד וָרֶגֶל', '✋🦵', 45),
    ],
  },
  // L3 — כּוֹאֵב לִי...
  {
    id: 'hb2-u6-l3', title: 'כּוֹאֵב לִי... 🤒', unitId: 'hb2-u6', order: 3, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "כּוֹאֵב לִי הָרֹאשׁ"? — ما معنى يؤلمني رأسي؟', ['رأسي بخير','يؤلمني رأسي','أنا سعيد'], 1, 'כּוֹאֵב לִי = يؤلمني'),
      fbChoice('כּוֹאֵב לִי הַ___. 🤒 (البطن تؤلمني)', ['בֶּטֶן','יָד','אוֹזֶן'], 0, '🤒'),
      tapPairs('חַבֵּר — صِلِ', [
        {arabic:'כּוֹאֵב לִי הָרֹאשׁ 🤕', match:'يؤلمني رأسي'}, {arabic:'כּוֹאֵב לִי הַבֶּטֶן 🤒', match:'يؤلمني بطني'},
      ]),
      wordOrder('סַדֵּר — رَتِّبِ', ['הָרֹאשׁ.','לִי','כּוֹאֵב'], 'כּוֹאֵב לִי הָרֹאשׁ.'),
      tf('"כּוֹאֵב לִי" = أنا بخير', false, '❌ לֹא! כּוֹאֵב לִי = يؤلمني'),
      readAloud('כּוֹאֵב לִי הָרֹאשׁ. אֲנִי לֹא בָּרִיא.', 'يؤلمني رأسي. أنا لستُ بخير.', 45),
    ],
  },
  // L4 — בָּרִיא / חוֹלֶה
  {
    id: 'hb2-u6-l4', title: 'בָּרִיא אוֹ חוֹלֶה? 💊', unitId: 'hb2-u6', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "בָּרִיא"? — ما معنى بَرִיא؟', ['مريض','بخير/صحيح','حزين','جائع'], 1, 'בָּרִיא = بخير/صحيح'),
      sortGroups('בָּרִיא אוֹ חוֹלֶה?', [
        {label:'בָּרִיא 😊 (بخير)', items:['מִתְעַמֵּל 🏃','אוֹכֵל יְרָקוֹת 🥦','יָשֵׁן טוֹב 😴']},
        {label:'חוֹלֶה 🤒 (مريض)', items:['כּוֹאֵב לִי הָרֹאשׁ 🤕','יֵשׁ לִי חֹם 🌡️','אֲנִי עָיֵף 😫']},
      ]),
      fbChoice('אֲנִי ___ ! אֲנִי אוֹכֵל יְרָקוֹת. 😊 (بخير)', ['בָּרִיא','חוֹלֶה','עָיֵף'], 0, '😊'),
      tf('"חוֹלֶה" = بخير', false, '❌ חוֹלֶה = مريض'),
      mc('כֵּיצַד נִשְׁאַר בְּרִיאִים? — كيف نبقى بصحة؟', ['לֹא לִישׁוֹן','לֶאֱכֹל יְרָקוֹת וּפֵרוֹת','לֹא לִשְׁתּוֹת מַיִם'], 1),
      speak('אֲנִי בָּרִיא', '😊', 45),
    ],
  },
  // L5 — אֱמֹר וַעֲשֵׂה (Simon says)
  {
    id: 'hb2-u6-l5', title: 'גַּע בָּ... 🤸', unitId: 'hb2-u6', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('מָה אָמַר נוּר? "גַּע בָּרֹאשׁ!" — ماذا قال نور؟', ['الأنف','الرأس','اليد'], 1, 'גַּע בָּרֹאשׁ = المسّ رأسك'),
      imgMatch('הַתְאֵם פְּקֻדָּה לְחֵלֶק גּוּף', [
        {image:'גַּע בָּרֹאשׁ!', word:'רֹאשׁ 👤'}, {image:'גַּע בָּאַף!', word:'אַף 👃'},
        {image:'גַּע בָּיָד!', word:'יָד ✋'}, {image:'גַּע בָּרֶגֶל!', word:'רֶגֶל 🦵'},
      ]),
      listenChoice('גַּע בָּאוֹזֶן!', ['אוֹזֶן 👂','עַיִן 👁️','פֶּה 👄'], 0),
      fbChoice('גַּע בַּ___! (المسّ فمك)', ['פֶּה','יָד','בֶּטֶן'], 0, '👄'),
      readAloud('גַּע בָּרֹאשׁ! גַּע בָּאַף! גַּע בָּיָד! גַּע בָּרֶגֶל!', 'المسّ رأسك! المسّ أنفك! المسّ يدك! المسّ رجلك!', 40),
      speak('גַּע בָּרֹאשׁ', '👤', 45),
    ],
  },
  // L6 — אֶצֶל הָרוֹפֵא
  {
    id: 'hb2-u6-l6', title: 'אֶצֶל הָרוֹפֵא 🏥', unitId: 'hb2-u6', order: 6, xpReward: 25, estimatedMinutes: 15,
    questions: [
      comprehension(
        'רוֹפֵא: שָׁלוֹם! מָה כּוֹאֵב לְךָ?\nיֶלֶד: כּוֹאֵב לִי הָרֹאשׁ וְהַבֶּטֶן. 🤒\nרוֹפֵא: אַתָּה חוֹלֶה. קַח תְּרוּפָה וּנְוַח. 💊\nיֶלֶד: תּוֹדָה, דּוֹקְטוֹר!',
        'רוֹפֵא: שָׁלוֹם! מָה כּוֹאֵב לְךָ? יֶלֶד: כּוֹאֵב לִי הָרֹאשׁ וְהַבֶּטֶן. רוֹפֵא: אַתָּה חוֹלֶה. קַח תְּרוּפָה וּנְוַח. יֶלֶד: תּוֹדָה דּוֹקְטוֹר!',
        [
          {q:'מַה כּוֹאֵב לַיֶּלֶד?', options:['הָרֶגֶל','הָרֹאשׁ וְהַבֶּטֶן','הָאוֹזֶן'], correct:1},
          {q:'מָה אוֹמֵר הָרוֹפֵא לַיֶּלֶד?', options:['לֵךְ לְבֵית הַסֵּפֶר','קַח תְּרוּפָה','לֶאֱכֹל יְרָקוֹת'], correct:1},
        ],
      ),
      fbChoice('כּוֹאֵב לִי הָ___. 🤒 (الرأس)', ['רֹאשׁ','בֶּטֶן','יָד'], 0, '🤕'),
      speak('כּוֹאֵב לִי הָרֹאשׁ', '🤕', 45),
    ],
  },
  // L7 — שִׁיר הַגּוּף
  {
    id: 'hb2-u6-l7', title: 'שִׁיר הַגּוּף 🎵', unitId: 'hb2-u6', order: 7, xpReward: 22, estimatedMinutes: 14,
    questions: [
      readAloud('רֹאשׁ כָּתֵף בִּרְכַּיִם וְאֶצְבָּעוֹת, עֵינַיִם אָזְנַיִם פֶּה וָאַף!', 'رأسٌ وكتفٌ وركبتانِ وأصابعُ، عيونٌ وآذانٌ وفمٌ وأنفٌ!', 40),
      dragOrder('סַדֵּר כְּסֵדֶר הַשִּׁיר', [
        {text:'רֹאשׁ 👤', order:1},{text:'כָּתֵף 💪', order:2},{text:'בִּרְכַּיִם 🦵', order:3},{text:'אֶצְבָּעוֹת 👆', order:4},
      ]),
      mc('אֵיזֶה אֵיבָר נִמְצָא בָּרֹאשׁ?', ['בִּרְכַּיִם','כָּתֵף','עֵינַיִם','בֶּטֶן'], 2),
      fbChoice('רֹאשׁ ___ בִּרְכַּיִם (كتف)', ['כָּתֵף','בֶּטֶן','יָד'], 0, '💪'),
      speak('רֹאשׁ כָּתֵף בִּרְכַּיִם', '🎵', 45),
    ],
  },
  // L8 — קְרִיאָה: הַגּוּף שֶׁלִּי
  {
    id: 'hb2-u6-l8', title: 'הַגּוּף שֶׁלִּי 📖', unitId: 'hb2-u6', order: 8, xpReward: 28, estimatedMinutes: 18,
    questions: [
      comprehension(
        'יֵשׁ לִי גּוּף בָּרִיא! 💪\nיֵשׁ לִי שְׁתַּיִם עֵינַיִם, שְׁתַּיִם אָזְנַיִם,\nאַף אֶחָד, פֶּה אֶחָד.\nיֵשׁ לִי שְׁתַּיִם יָדַיִם וּשְׁתַּיִם רַגְלַיִם. 🙋',
        'יֵשׁ לִי גּוּף בָּרִיא! יֵשׁ לִי שְׁתַּיִם עֵינַיִם, שְׁתַּיִם אָזְנַיִם, אַף אֶחָד, פֶּה אֶחָד. יֵשׁ לִי שְׁתַּיִם יָדַיִם וּשְׁתַּיִם רַגְלַיִם.',
        [
          {q:'כַּמָּה עֵינַיִם יֵשׁ לִי?', options:['אַחַת','שְׁתַּיִם','שָׁלוֹשׁ'], correct:1},
          {q:'כַּמָּה פֶּה יֵשׁ לִי?', options:['אֶחָד','שְׁנַיִם','שְׁלֹשָׁה'], correct:0},
          {q:'כַּמָּה יָדַיִם יֵשׁ לִי?', options:['אַחַת','שְׁתַּיִם','שָׁלוֹשׁ'], correct:1},
        ],
      ),
      mc('מַה פֵּירוּשׁ "בָּרִיא"? — ما معنى صحيح؟', ['مريض','بخير','حزين'], 1),
      speak('יֵשׁ לִי גּוּף בָּרִיא', '💪', 45),
    ],
  },
  // L9 — שִׂיחָה: אֶצֶל הָרוֹפֵא (AI)
  {
    id: 'hb2-u6-l9', title: 'שְׂוֹחֵחַ עִם הָרוֹפֵא 🤖', unitId: 'hb2-u6', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      readAloud('שָׁלוֹם דּוֹקְטוֹר! כּוֹאֵב לִי הָרֹאשׁ.', 'أهلاً دكتور! يؤلمني رأسي.', 45),
      aiConv(
        'אֶצֶל הָרוֹפֵא — عند الطبيب',
        'אתה נור, רופא חביב לילד ערבי בן 7 לומד עברית. שאל אותו מה כואב לו. השתמש רק במילים: שָׁלוֹם, מָה כּוֹאֵב לְךָ, רֹאשׁ, בֶּטֶן, יָד, רֶגֶל, אוֹזֶן, כּוֹאֵב לִי, בָּרִיא, חוֹלֶה, תּוֹדָה. כל משפט עד 5 מילים. התחל: "שָׁלוֹם! מָה כּוֹאֵב לְךָ? 🤒"',
      ),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 6
  {
    id: 'hb2-u6-l10', title: 'מִבְחָן יְחִידָה 6 ⭐', unitId: 'hb2-u6', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מָה זֶה? 👁️', 'מָה זֶה',
        [{emoji:'👁️', label:'עַיִן'},{emoji:'👂', label:'אוֹזֶן'},{emoji:'👃', label:'אַף'},{emoji:'👄', label:'פֶּה'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'✋', word:'יָד'}, {image:'🦵', word:'רֶגֶל'},
        {image:'👁️', word:'עַיִן'}, {image:'👃', word:'אַף'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'עַיִן 👁️', match:'عَيْن'}, {arabic:'יָד ✋', match:'يَد'}, {arabic:'בֶּטֶן 🫁', match:'بَطْن'},
      ]),
      mc('מַה פֵּירוּשׁ "כּוֹאֵב לִי"? — ما معنى يؤلمني؟', ['أنا بخير','يؤلمني','أنا سعيد'], 1),
      mc('כַּמָּה אָזְנַיִם יֵשׁ לְאָדָם?', ['אַחַת','שְׁתַּיִם','שָׁלוֹשׁ'], 1),
      fbChoice('כּוֹאֵב לִי הָ___. (الرأس)', ['רֹאשׁ','יָד','רֶגֶל'], 0, '🤕'),
      tf('"בָּרִיא" = مريض', false, '❌ בָּרִיא = بخير/صحيح'),
      sortGroups('חֵלְקֵי הָרֹאשׁ אוֹ הַגּוּף?', [
        {label:'הָרֹאשׁ 👤', items:['עַיִן 👁️','אוֹזֶן 👂','אַף 👃','פֶּה 👄']},
        {label:'הַגּוּף 🙋', items:['יָד ✋','רֶגֶל 🦵','בֶּטֶן 🫁']},
      ]),
      wordOrder('סַדֵּר', ['הָרֹאשׁ.','לִי','כּוֹאֵב'], 'כּוֹאֵב לִי הָרֹאשׁ.'),
      comprehension(
        'אֲנִי חוֹלֶה. 🤒\nכּוֹאֵב לִי הָרֹאשׁ.\nאֲנִי שׁוֹתֶה מַיִם וְנָח.',
        'אֲנִי חוֹלֶה. כּוֹאֵב לִי הָרֹאשׁ. אֲנִי שׁוֹתֶה מַיִם וְנָח.',
        [
          {q:'מַה כּוֹאֵב?', options:['הָרֶגֶל','הָרֹאשׁ','הַיָּד'], correct:1},
          {q:'מָה הַיֶּלֶד עוֹשֶׂה?', options:['אוֹכֵל','שׁוֹתֶה מַיִם','מְשַׂחֵק'], correct:1},
        ],
      ),
      speak('אֲנִי בָּרִיא', '😊', 45),
    ],
  },
];

// ─── UNIT 7: אֹכֶל — الطعام ─────────────────────────────────────────────────────
export const HEB2_UNIT7_LESSONS = [
  // L1 — אֹכֶל לַבֹּקֶר
  {
    id: 'hb2-u7-l1', title: 'אֹכֶל לַבֹּקֶר 🍳', unitId: 'hb2-u7', order: 1, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ 🍞', 'מָה זֶה',
        [{emoji:'🍞', label:'לֶחֶם (ז\')'},{emoji:'🥛', label:'חָלָב (ז\')'},{emoji:'🥚', label:'בֵּיצָה (נ\')'},{emoji:'🧀', label:'גְּבִינָה (נ\')'}], 0),
      imgMatch('הַתְאֵם תְּמוּנָה לְמִלָּה', [
        {image:'🍞', word:'לֶחֶם'}, {image:'🥛', word:'חָלָב'},
        {image:'🥚', word:'בֵּיצָה'}, {image:'🧀', word:'גְּבִינָה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'לֶחֶם 🍞', match:'خُبْز'}, {arabic:'חָלָב 🥛', match:'حَلِيب'}, {arabic:'בֵּיצָה 🥚', match:'بَيْضَة'},
      ]),
      listenImg('שְׁמַע וּבְחַר', 'גְּבִינָה',
        [{emoji:'🍞', label:'לֶחֶם'},{emoji:'🥛', label:'חָלָב'},{emoji:'🥚', label:'בֵּיצָה'},{emoji:'🧀', label:'גְּבִינָה'}], 3),
      mc('מַה שׁוֹתִים לַבֹּקֶר? — ماذا نشرب في الصباح؟', ['לֶחֶם 🍞','חָלָב 🥛','בֵּיצָה 🥚'], 1, 'שׁוֹתִים חָלָב'),
      flashcard('אֹכֶל לַבֹּקֶר — وجبة الصباح', 'לֶחֶם (ז\') — خُبْز 🍞\nחָלָב (ז\') — حَلِيب 🥛\nבֵּיצָה (נ\') — بَيْضَة 🥚\nגְּבִינָה (נ\') — جُبْنَة 🧀\nדְּבַשׁ (ז\') — عَسَل 🍯'),
    ],
  },
  // L2 — פֵּרוֹת וִירָקוֹת
  {
    id: 'hb2-u7-l2', title: 'פֵּרוֹת וִירָקוֹת 🍎🥕', unitId: 'hb2-u7', order: 2, xpReward: 20, estimatedMinutes: 12,
    questions: [
      imgChoice('מָה זֶה? — ما هذا؟ 🍎', 'מָה זֶה',
        [{emoji:'🍎', label:'תַּפּוּחַ (ז\')'},{emoji:'🍌', label:'בָּנָנָה (נ\')'},{emoji:'🍊', label:'תַּפּוּז (ז\')'},{emoji:'🍇', label:'עֲנָבִים (ז\' רבות)'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'🍎', word:'תַּפּוּחַ'}, {image:'🍌', word:'בָּנָנָה'},
        {image:'🥕', word:'גֶּזֶר'}, {image:'🍅', word:'עַגְבָנִיָּה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'תַּפּוּחַ 🍎', match:'تُفَّاحَة'}, {arabic:'בָּנָנָה 🍌', match:'مَوْزَة'}, {arabic:'גֶּזֶר 🥕', match:'جَزَرَة'},
      ]),
      sortGroups('פֵּרוֹת אוֹ יְרָקוֹת? — فواكه أم خضروات؟', [
        {label:'פֵּרוֹת 🍎 (فواكه)', items:['תַּפּוּחַ 🍎','בָּנָנָה 🍌','תַּפּוּז 🍊']},
        {label:'יְרָקוֹת 🥕 (خضروات)', items:['גֶּזֶר 🥕','עַגְבָנִיָּה 🍅','מְלָפֵפוֹן 🥒']},
      ]),
      mc('מָה אָדֹם וְעָגֹל? — ما الأحمر الدائري؟', ['בָּנָנָה 🍌','תַּפּוּחַ 🍎','גֶּזֶר 🥕'], 1, 'תַּפּוּחַ אָדֹם'),
      speak('תַּפּוּחַ וּבָנָנָה', '🍎🍌', 45),
    ],
  },
  // L3 — אֲנִי אוֹכֵל/אוֹכֶלֶת
  {
    id: 'hb2-u7-l3', title: 'אֲנִי אוֹכֵל/אוֹכֶלֶת 🍽️', unitId: 'hb2-u7', order: 3, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('אֵיזֶה צוּרָה מַתְאִימָה לְיֶלֶד (ז\')?', ['אוֹכֶלֶת','אוֹכֵל'], 1, 'ז\' → אוֹכֵל'),
      mc('אֵיזֶה צוּרָה מַתְאִימָה לְיַלְדָּה (נ\')?', ['אוֹכֵל','אוֹכֶלֶת'], 1, 'נ\' → אוֹכֶלֶת'),
      fbChoice('אֲנִי ___ לֶחֶם. (ז\')', ['אוֹכֵל','אוֹכֶלֶת','שׁוֹתֶה'], 0, '🍞'),
      sortGroups('זָכָר אוֹ נְקֵבָה?', [
        {label:'זָכָר ז\' (مذكر)', items:['אוֹכֵל 🍽️','שׁוֹתֶה 🥛','לוֹמֵד 📚']},
        {label:'נְקֵבָה נ\' (مؤنث)', items:['אוֹכֶלֶת 🍽️','שׁוֹתָה 🥛','לוֹמֶדֶת 📚']},
      ]),
      wordOrder('סַדֵּר — رَتِّبِ', ['תַּפּוּחַ.','אוֹכֵל','אֲנִי'], 'אֲנִי אוֹכֵל תַּפּוּחַ.'),
      readAloud('אֲנִי אוֹכֵל לֶחֶם וְגְּבִינָה. אֲנִי שׁוֹתֶה חָלָב.', 'أنا آكل خبزاً وجبنةً. أنا أشرب حليباً.', 45),
    ],
  },
  // L4 — אֲנִי אוֹהֵב/אוֹהֶבֶת
  {
    id: 'hb2-u7-l4', title: 'אֲנִי אוֹהֵב... ❤️', unitId: 'hb2-u7', order: 4, xpReward: 22, estimatedMinutes: 14,
    questions: [
      mc('מַה פֵּירוּשׁ "אוֹהֵב"? — ما معنى أُحِبّ؟', ['أكره','أحبّ','آكل','أشرب'], 1, 'אוֹהֵב = أحبّ'),
      fbChoice('אֲנִי ___ שׁוֹקוֹלָד! 🍫 (ז\')', ['אוֹהֵב','אוֹהֶבֶת','אוֹכֵל'], 0, '🍫'),
      wordOrder('סַדֵּר — رَتِّبِ', ['בָּנָנוֹת!','אוֹהֶבֶת','אֲנִי'], 'אֲנִי אוֹהֶבֶת בָּנָנוֹת!'),
      tapPairs('חַבֵּר שְׁאֵלָה לְתְּשׁוּבָה', [
        {arabic:'מָה אַתָּה אוֹהֵב? 🍎', match:'אֲנִי אוֹהֵב תַּפּוּחִים'}, {arabic:'מָה אַתְּ אוֹהֶבֶת? 🍫', match:'אֲנִי אוֹהֶבֶת שׁוֹקוֹלָד'},
      ]),
      tf('"אוֹהֶבֶת" הוּא לְזָכָר', false, '❌ אוֹהֶבֶת — לִנְקֵבָה'),
      speak('אֲנִי אוֹהֵב תַּפּוּחַ', '🍎', 45),
    ],
  },
  // L5 — אַתָּה רָעֵב?
  {
    id: 'hb2-u7-l5', title: 'אַתָּה רָעֵב? 🤤', unitId: 'hb2-u7', order: 5, xpReward: 20, estimatedMinutes: 12,
    questions: [
      mc('מַה פֵּירוּשׁ "רָעֵב"? — ما معنى جائع؟', ['عطشان','جائع','نائم','بخير'], 1, 'רָעֵב = جائع'),
      mc('מַה פֵּירוּשׁ "צָמֵא"? — ما معنى عطشان؟', ['جائع','عطشان','تعبان','سعيد'], 1, 'צָמֵא = عطشان'),
      fbChoice('אֲנִי ___ ! אֲנִי רוֹצֶה לֶחֶם. 🍞 (جائع، مذكر)', ['רָעֵב','צָמֵא','עָיֵף'], 0, '🤤'),
      tapPairs('חַבֵּר מִלָּה לְתַרְגּוּם', [
        {arabic:'רָעֵב 🤤', match:'جائع'}, {arabic:'צָמֵא 💧', match:'عطشان'}, {arabic:'שָׂבֵעַ 😊', match:'شبعان'},
      ]),
      wordOrder('סַדֵּר — رَتِّبِ', ['רוֹצֶה','אֲנִי','מַיִם.','צָמֵא!','אֲנִי'], 'אֲנִי צָמֵא! אֲנִי רוֹצֶה מַיִם.'),
      speak('אֲנִי רָעֵב', '🤤', 45),
    ],
  },
  // L6 — בְּמִסְעָדָה
  {
    id: 'hb2-u7-l6', title: 'בְּמִסְעָדָה 🍽️', unitId: 'hb2-u7', order: 6, xpReward: 25, estimatedMinutes: 15,
    questions: [
      comprehension(
        'מֶלְצַר: שָׁלוֹם! מָה תִּרְצוּ לֶאֱכֹל?\nיֶלֶד: אֲנִי רוֹצֶה פִּיצָּה! 🍕\nיַלְדָּה: אֲנִי רוֹצָה סָלָט. 🥗\nמֶלְצַר: בְּבַקָּשָׁה! תֵּהָנוּ! 😊',
        'מֶלְצַר: שָׁלוֹם! מָה תִּרְצוּ לֶאֱכֹל? יֶלֶד: אֲנִי רוֹצֶה פִּיצָּה! יַלְדָּה: אֲנִי רוֹצָה סָלָט. מֶלְצַר: בְּבַקָּשָׁה! תֵּהָנוּ!',
        [
          {q:'מָה הַיֶּלֶד רוֹצֶה?', options:['סָלָט','פִּיצָּה','לֶחֶם'], correct:1},
          {q:'מָה הַיַּלְדָּה רוֹצָה?', options:['פִּיצָּה','לֶחֶם','סָלָט'], correct:2},
        ],
      ),
      fbChoice('אֲנִי ___ פִּיצָּה! (ז\', أريد)', ['רוֹצֶה','רוֹצָה','אוֹכֵל'], 0, '🍕'),
      readAloud('שָׁלוֹם! אֲנִי רוֹצֶה פִּיצָּה וּמַיִם, בְּבַקָּשָׁה.', 'أهلاً! أريد بيتزا وماءً، من فضلك.', 45),
    ],
  },
  // L7 — מָה אוֹכְלִים?
  {
    id: 'hb2-u7-l7', title: 'אֹכֶל בְּרִיא 🥦', unitId: 'hb2-u7', order: 7, xpReward: 22, estimatedMinutes: 14,
    questions: [
      sortGroups('אֹכֶל בָּרִיא אוֹ לֹא בָּרִיא? — صحي أم غير صحي؟', [
        {label:'בָּרִיא 💚 (صحي)', items:['תַּפּוּחַ 🍎','גֶּזֶר 🥕','חָלָב 🥛','עַגְבָנִיָּה 🍅']},
        {label:'לֹא בָּרִיא 🔴 (غير صحي)', items:['שׁוֹקוֹלָד 🍫','עוּגָה 🍰','צ\'יפְּס 🍟']},
      ]),
      mc('אֵיזֶה אֹכֶל עוֹזֵר לָנוּ לִגְדּוֹל? — أي طعام يساعدنا على النمو؟', ['שׁוֹקוֹלָד','עוּגָה','יְרָקוֹת וּפֵרוֹת'], 2),
      fbChoice('אֲנִי אוֹכֵל יְרָקוֹת כִּי אֲנִי רוֹצֶה לִהְיוֹת ___ . (بخير)', ['בָּרִיא','חוֹלֶה','עָיֵף'], 0, '💪'),
      tapPairs('חַבֵּר אֹכֶל לְקְבוּצָה', [
        {arabic:'תַּפּוּחַ 🍎', match:'פֶּרִי (فاكهة)'}, {arabic:'גֶּזֶר 🥕', match:'יֶרֶק (خضار)'}, {arabic:'חָלָב 🥛', match:'שְׁתִיָּה (شراب)'},
      ]),
      readAloud('אֲנִי אוֹכֵל תַּפּוּחַ וְגֶּזֶר. אֲנִי שׁוֹתֶה חָלָב.', 'آكل تفاحة وجزرة. أشرب حليباً.', 45),
    ],
  },
  // L8 — קְרִיאָה: ארוּחַת הַמִּשְׁפָּחָה
  {
    id: 'hb2-u7-l8', title: 'אֲרוּחַת הַמִּשְׁפָּחָה 📖', unitId: 'hb2-u7', order: 8, xpReward: 28, estimatedMinutes: 18,
    questions: [
      comprehension(
        'הַיּוֹם אֲרוּחַת עֶרֶב בַּמִּשְׁפָּחָה. 🍽️\nאַבָּא אוֹכֵל אֹרֶז וְעוֹף.\nאִמָּא אוֹכֶלֶת סָלָט.\nאֲנִי אוֹכֵל לֶחֶם וּגְּבִינָה.\nכֻּלָּם שׁוֹתִים מַיִם. 💧',
        'הַיּוֹם אֲרוּחַת עֶרֶב בַּמִּשְׁפָּחָה. אַבָּא אוֹכֵל אֹרֶז וְעוֹף. אִמָּא אוֹכֶלֶת סָלָט. אֲנִי אוֹכֵל לֶחֶם וּגְּבִינָה. כֻּלָּם שׁוֹתִים מַיִם.',
        [
          {q:'מָה אַבָּא אוֹכֵל?', options:['סָלָט','לֶחֶם','אֹרֶז וְעוֹף'], correct:2},
          {q:'מָה אִמָּא אוֹכֶלֶת?', options:['סָלָט','לֶחֶם','עוֹף'], correct:0},
          {q:'מָה כֻּלָּם שׁוֹתִים?', options:['חָלָב','מַיִם','מִיץ'], correct:1},
        ],
      ),
      mc('מַה פֵּירוּשׁ "אֲרוּחַת עֶרֶב"? — ما معنى وجبة العشاء؟', ['وجبة الصباح','وجبة الغداء','وجبة العشاء'], 2),
      speak('אֲרוּחַת עֶרֶב טְעִימָה', '🍽️', 45),
    ],
  },
  // L9 — שִׂיחָה: מָה אַתָּה אוֹהֵב לֶאֱכֹל?
  {
    id: 'hb2-u7-l9', title: 'שְׂוֹחֵחַ עַל אֹכֶל 🤖', unitId: 'hb2-u7', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      readAloud('אֲנִי אוֹהֵב תַּפּוּחַ וְשׁוֹקוֹלָד. אֲנִי לֹא אוֹהֵב גֶּזֶר.', 'أحبّ التفاحَ والشوكولاتةَ. لا أحبّ الجزرَ.', 45),
      aiConv(
        'שִׂיחָה עַל אֹכֶל — حديث عن الطعام',
        'אתה נור, מורה חביב לילד ערבי בן 7 לומד עברית. שאל אותו מה הוא אוהב לאכול. השתמש רק במילים: מָה, אוֹהֵב, לֶאֱכֹל, לִשְׁתּוֹת, תַּפּוּחַ, לֶחֶם, חָלָב, שׁוֹקוֹלָד, יָרָקוֹת, בָּנָנָה, רָעֵב, כֵּן, לֹא. כל משפט עד 5 מילים. התחל: "שָׁלוֹם! אַתָּה רָעֵב? 🤤"',
      ),
    ],
  },
  // L10 — מִבְחָן יְחִידָה 7
  {
    id: 'hb2-u7-l10', title: 'מִבְחָן יְחִידָה 7 ⭐', unitId: 'hb2-u7', order: 10, xpReward: 50, estimatedMinutes: 25,
    questions: [
      imgChoice('מָה זֶה? 🍞', 'מָה זֶה',
        [{emoji:'🍞', label:'לֶחֶם'},{emoji:'🥛', label:'חָלָב'},{emoji:'🥚', label:'בֵּיצָה'},{emoji:'🧀', label:'גְּבִינָה'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'🍎', word:'תַּפּוּחַ'}, {image:'🥕', word:'גֶּזֶר'},
        {image:'🍌', word:'בָּנָנָה'}, {image:'🍅', word:'עַגְבָנִיָּה'},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'לֶחֶם 🍞', match:'خُبْز'}, {arabic:'חָלָב 🥛', match:'حَلِيب'}, {arabic:'תַּפּוּחַ 🍎', match:'تُفَّاحَة'},
      ]),
      sortGroups('פֵּרוֹת אוֹ יְרָקוֹת?', [
        {label:'פֵּרוֹת 🍎 (فواكه)', items:['תַּפּוּחַ 🍎','בָּנָנָה 🍌','תַּפּוּז 🍊']},
        {label:'יְרָקוֹת 🥕 (خضروات)', items:['גֶּזֶר 🥕','עַגְבָנִיָּה 🍅','מְלָפֵפוֹן 🥒']},
      ]),
      mc('מַה פֵּירוּשׁ "רָעֵב"?', ['عطشان','جائع','تعبان'], 1),
      fbChoice('אֲנִי ___ תַּפּוּחַ. (ז\', أحبّ)', ['אוֹהֵב','אוֹהֶבֶת','אוֹכֵל'], 0, '🍎'),
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְיַלְדָּה?', ['אֲנִי אוֹכֵל','אֲנִי אוֹכֶלֶת'], 1, 'נ\' → אוֹכֶלֶת'),
      wordOrder('סַדֵּר', ['חָלָב.','שׁוֹתֶה','אֲנִי'], 'אֲנִי שׁוֹתֶה חָלָב.'),
      listenImg('שְׁמַע וּבְחַר', 'בֵּיצָה',
        [{emoji:'🍞', label:'לֶחֶם'},{emoji:'🥚', label:'בֵּיצָה'},{emoji:'🧀', label:'גְּבִינָה'},{emoji:'🥛', label:'חָלָב'}], 1),
      comprehension(
        'אֲנִי רָעֵב. 🤤\nאֲנִי אוֹכֵל לֶחֶם וּגְּבִינָה.\nאֲנִי שׁוֹתֶה חָלָב.\nעַכְשָׁו אֲנִי שָׂבֵעַ! 😊',
        'אֲנִי רָעֵב. אֲנִי אוֹכֵל לֶחֶם וּגְּבִינָה. אֲנִי שׁוֹתֶה חָלָב. עַכְשָׁו אֲנִי שָׂבֵעַ!',
        [
          {q:'מָה הַיֶּלֶד אוֹכֵל?', options:['סָלָט','לֶחֶם וּגְּבִינָה','תַּפּוּחַ'], correct:1},
          {q:'מָה הוּא שׁוֹתֶה?', options:['מַיִם','מִיץ','חָלָב'], correct:2},
        ],
      ),
      speak('אֲנִי אוֹהֵב אֹכֶל טָעִים', '🍽️', 45),
    ],
  },
];

// ─── UNIT 8: סִיכּוּם — المراجعة الشاملة ────────────────────────────────────────
export const HEB2_UNIT8_LESSONS = [
  // L1 — חֲזָרָה: מִשְׁפָּחָה וּבֵית הַסֵּפֶר
  {
    id: 'hb2-u8-l1', title: 'חֲזָרָה: מִשְׁפָּחָה וּבֵית הַסֵּפֶר 🔄', unitId: 'hb2-u8', order: 1, xpReward: 25, estimatedMinutes: 15,
    questions: [
      sortGroups('מִשְׁפָּחָה אוֹ בֵּית הַסֵּפֶר?', [
        {label:'מִשְׁפָּחָה 👨‍👩‍👧 (عائلة)', items:['אַבָּא 👨','אִמָּא 👩','אָח 👦','סָבָא 👴']},
        {label:'בֵּית הַסֵּפֶר 🏫 (مدرسة)', items:['מוֹרָה 👩‍🏫','סֵפֶר 📚','כִּיתָּה 📐','עֵט ✏️']},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'אַבָּא 👨', match:'أَبّ'}, {arabic:'מוֹרֶה 👨‍🏫', match:'مُعَلِّم'}, {arabic:'סֵפֶר 📚', match:'كِتَاب'},
      ]),
      mc('מִי מְלַמֵּד בְּבֵית הַסֵּפֶר? — من يُعلِّم في المدرسة؟', ['אַבָּא','מוֹרֶה/מוֹרָה','חָבֵר'], 1),
      fbChoice('זֹאת ___ שֶׁלִּי. 👩 (أمي)', ['אִמָּא','אַבָּא','מוֹרָה'], 0, '👩'),
      wordOrder('סַדֵּר', ['בְּבֵית','לוֹמֵד','אֲנִי','הַסֵּפֶר.'], 'אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר.'),
      readAloud('יֵשׁ לִי מִשְׁפָּחָה וְחֲבֵרִים. אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר.', 'عندي عائلة وأصدقاء. أنا أتعلم في المدرسة.', 45),
    ],
  },
  // L2 — חֲזָרָה: צְבָעִים וּמִסְפָּרִים
  {
    id: 'hb2-u8-l2', title: 'חֲזָרָה: צְבָעִים וּמִסְפָּרִים 🎨🔢', unitId: 'hb2-u8', order: 2, xpReward: 25, estimatedMinutes: 15,
    questions: [
      imgMatch('צֶבַע לְמִלָּה', [
        {image:'🔴', word:'אָדֹם'}, {image:'🔵', word:'כָּחֹל'},
        {image:'🟢', word:'יָרֹק'}, {image:'🟡', word:'צָהֹב'},
      ]),
      imgMatch('מִסְפָּר לְמִלָּה', [
        {image:'1️⃣', word:'אֶחָד'}, {image:'5️⃣', word:'חֲמִשָּׁה'},
        {image:'7️⃣', word:'שִׁבְעָה'}, {image:'🔟', word:'עֲשָׂרָה'},
      ]),
      tapPairs('חַבֵּר מִסְפָּר לְמִלָּה', [
        {arabic:'3', match:'שְׁלֹשָׁה'}, {arabic:'6', match:'שִׁשָּׁה'}, {arabic:'9', match:'תִּשְׁעָה'},
      ]),
      mc('מָה צֶבַע הַשֶּׁמֶשׁ? ☀️', ['אָדֹם','כָּחֹל','צָהֹב','יָרֹק'], 2),
      fbChoice('יֵשׁ לִי ___ עֵפְרוֹנוֹת כְּחֻלִּים. 🔵🔵🔵 (3)', ['שְׁלֹשָׁה','אַרְבָּעָה','שְׁנַיִם'], 0, '🔵🔵🔵'),
      dragOrder('סַדֵּר מִסְפָּרִים', [
        {text:'1️⃣', order:1},{text:'3️⃣', order:3},{text:'5️⃣', order:5},{text:'7️⃣', order:7},{text:'10️⃣', order:10},
      ]),
    ],
  },
  // L3 — חֲזָרָה: גּוּף וְאֹכֶל
  {
    id: 'hb2-u8-l3', title: 'חֲזָרָה: גּוּף וְאֹכֶל 🙋🍎', unitId: 'hb2-u8', order: 3, xpReward: 25, estimatedMinutes: 15,
    questions: [
      sortGroups('גּוּף אוֹ אֹכֶל?', [
        {label:'גּוּף 🙋 (جسم)', items:['עַיִן 👁️','יָד ✋','רֶגֶל 🦵','אַף 👃']},
        {label:'אֹכֶל 🍽️ (طعام)', items:['לֶחֶם 🍞','תַּפּוּחַ 🍎','חָלָב 🥛','גֶּזֶר 🥕']},
      ]),
      tapPairs('חַבֵּר עִבְרִית לְעַרְבִית', [
        {arabic:'עַיִן 👁️', match:'عَيْن'}, {arabic:'לֶחֶם 🍞', match:'خُبْز'}, {arabic:'תַּפּוּחַ 🍎', match:'تُفَّاحَة'},
      ]),
      mc('מַה פֵּירוּשׁ "כּוֹאֵב לִי"?', ['أنا سعيد','يؤلمني','أنا بخير'], 1),
      fbChoice('אֲנִי ___ תַּפּוּחַ. (أحبّ، مذكر)', ['אוֹהֵב','אוֹהֶבֶת','אוֹכֵל'], 0, '🍎'),
      wordOrder('סַדֵּר', ['הַבֶּטֶן.','לִי','כּוֹאֵב'], 'כּוֹאֵב לִי הַבֶּטֶן.'),
      readAloud('כּוֹאֵב לִי הָרֹאשׁ. אֲנִי שׁוֹתֶה מַיִם וְנָח.', 'يؤلمني رأسي. أنا أشرب ماءً وأستريح.', 45),
    ],
  },
  // L4 — חֲזָרָה: מִשְׁפָּטִים שְׁלֵמִים
  {
    id: 'hb2-u8-l4', title: 'מִשְׁפָּטִים שְׁלֵמִים 💬', unitId: 'hb2-u8', order: 4, xpReward: 25, estimatedMinutes: 15,
    questions: [
      comprehension(
        'שְׁמִי יוּסֻף. אֲנִי בֶּן שֶׁבַע. 👦\nיֵשׁ לִי מִשְׁפָּחָה גְּדוֹלָה: אַבָּא, אִמָּא, שְׁנֵי אַחִים וְאָחוֹת אַחַת.\nאֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. הַמּוֹרֶה שֶׁלִּי שְׁמוֹ אָמִיר.\nאֲנִי אוֹהֵב תַּפּוּחִים וְחָלָב. 🍎🥛',
        'שְׁמִי יוּסֻף. אֲנִי בֶּן שֶׁבַע. יֵשׁ לִי מִשְׁפָּחָה גְּדוֹלָה: אַבָּא, אִמָּא, שְׁנֵי אַחִים וְאָחוֹת אַחַת. אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. הַמּוֹרֶה שֶׁלִּי שְׁמוֹ אָמִיר. אֲנִי אוֹהֵב תַּפּוּחִים וְחָלָב.',
        [
          {q:'בֶּן כַּמָּה יוּסֻף?', options:['שֵׁשׁ','שֶׁבַע','שְׁמוֹנֶה'], correct:1},
          {q:'כַּמָּה אַחִים יֵשׁ לוֹ?', options:['אֶחָד','שְׁנַיִם','שְׁלֹשָׁה'], correct:1},
          {q:'מַה הוּא אוֹהֵב לֶאֱכֹל?', options:['גֶּזֶר','לֶחֶם','תַּפּוּחִים'], correct:2},
        ],
      ),
      wordOrder('סַדֵּר', ['שֶׁבַע.','בֶּן','אֲנִי'], 'אֲנִי בֶּן שֶׁבַע.'),
      speak('שְׁמִי... אֲנִי בֶּן...', '👤', 45),
    ],
  },
  // L5 — מִשְׂחַק חֲזָרָה
  {
    id: 'hb2-u8-l5', title: 'מִשְׂחַק חֲזָרָה 🎮', unitId: 'hb2-u8', order: 5, xpReward: 25, estimatedMinutes: 15,
    questions: [
      listenChoice('בֹּקֶר טוֹב', ['לַיְלָה טוֹב 🌙','בֹּקֶר טוֹב ☀️','עֶרֶב טוֹב 🌆'], 1),
      listenChoice('כָּחֹל', ['אָדֹם 🔴','כָּחֹל 🔵','יָרֹק 🟢'], 1),
      listenChoice('שִׁבְעָה', ['שִׁשָּׁה 6️⃣','שִׁבְעָה 7️⃣','שְׁמוֹנָה 8️⃣'], 1),
      listenChoice('אִמָּא', ['אַבָּא 👨','אָח 👦','אִמָּא 👩'], 2),
      listenChoice('תַּפּוּחַ', ['לֶחֶם 🍞','תַּפּוּחַ 🍎','גֶּזֶר 🥕'], 1),
      listenChoice('עַיִן', ['יָד ✋','רֶגֶל 🦵','עַיִן 👁️'], 2),
    ],
  },
  // L6 — שִׂיחָה כְּלָלִית (AI)
  {
    id: 'hb2-u8-l6', title: 'שִׂיחָה כְּלָלִית 🤖', unitId: 'hb2-u8', order: 6, xpReward: 35, estimatedMinutes: 20,
    questions: [
      readAloud('שָׁלוֹם! שְׁמִי אַחְמַד. אֲנִי בֶּן שֶׁבַע. יֵשׁ לִי מִשְׁפָּחָה גְּדוֹלָה. אֲנִי לוֹמֵד עִבְרִית!', 'أهلاً! اسمي أحمد. عمري سبع. عندي عائلة كبيرة. أنا أتعلم العبرية!', 45),
      aiConv(
        'שִׂיחָה חוֹפְשִׁית — محادثة حرة',
        'אתה נור, מורה חביב לילד ערבי בן 7 לומד עברית. שוחח איתו בנושאים שלמד: שלום, שם, גיל, משפחה, בית ספר, צבעים, גוף, אוכל. השתמש רק במילים שלמד. כל משפט עד 6 מילים. התחל: "שָׁלוֹם! מַה שִּׁמְךָ? 😊"',
      ),
    ],
  },
  // L7 — קְרִיאַת סִיכּוּם
  {
    id: 'hb2-u8-l7', title: 'קְרִיאַת סִיכּוּם 📖', unitId: 'hb2-u8', order: 7, xpReward: 30, estimatedMinutes: 18,
    questions: [
      comprehension(
        'שָׁלוֹם! אֲנִי סָנָא. 👧\nאֲנִי בַּת שֶׁבַע. אֲנִי לוֹמֶדֶת בְּכִיתָּה ב.\nיֵשׁ לִי אַבָּא, אִמָּא וְאָח אֶחָד.\nהַצֶּבַע הַמְּעֻדָּף שֶׁלִּי הוּא וָרֹד. 🌸\nאֲנִי אוֹהֶבֶת תַּפּוּחִים וְשׁוֹקוֹלָד.\nכּוֹאֵב לִי לִפְעָמִים הָרֹאשׁ — אָז אֲנִי נָחָה. 😴',
        'שָׁלוֹם! אֲנִי סָנָא. אֲנִי בַּת שֶׁבַע. אֲנִי לוֹמֶדֶת בְּכִיתָּה ב. יֵשׁ לִי אַבָּא, אִמָּא וְאָח אֶחָד. הַצֶּבַע הַמְּעֻדָּף שֶׁלִּי הוּא וָרֹד. אֲנִי אוֹהֶבֶת תַּפּוּחִים וְשׁוֹקוֹלָד. כּוֹאֵב לִי לִפְעָמִים הָרֹאשׁ — אָז אֲנִי נָחָה.',
        [
          {q:'מַה שֵּׁם הַיַּלְדָּה?', options:['לֵאָה','סָנָא','מִרְיָם'], correct:1},
          {q:'כַּמָּה אַחִים יֵשׁ לָהּ?', options:['אֶחָד','שְׁנַיִם','אֵין'], correct:0},
          {q:'מָה הַצֶּבַע הַמְּעֻדָּף שֶׁלָּהּ?', options:['כָּחֹל','אָדֹם','וָרֹד'], correct:2},
          {q:'מַה כּוֹאֵב לָהּ לִפְעָמִים?', options:['הַבֶּטֶן','הָרֹאשׁ','הַיָּד'], correct:1},
        ],
      ),
      speak('אֲנִי אוֹהֶבֶת עִבְרִית', '📚', 45),
    ],
  },
  // L8 — מִשְׂחַק מִלִּים
  {
    id: 'hb2-u8-l8', title: 'מִשְׂחַק מִלִּים 🎯', unitId: 'hb2-u8', order: 8, xpReward: 30, estimatedMinutes: 18,
    questions: [
      tapPairs('חַבֵּר הַכֹּל — صِلِ كل شيء', [
        {arabic:'שָׁלוֹם 👋', match:'أهلاً'}, {arabic:'תּוֹדָה 🙏', match:'شكراً'}, {arabic:'כֵּן ✅', match:'نعم'},
      ]),
      tapPairs('חַבֵּר', [
        {arabic:'אַבָּא 👨', match:'أَبّ'}, {arabic:'מוֹרָה 👩‍🏫', match:'مُعَلِّمَة'}, {arabic:'חָבֵר 👦', match:'صَدِيق'},
      ]),
      tapPairs('חַבֵּר', [
        {arabic:'אָדֹם 🔴', match:'أَحْمَر'}, {arabic:'יָרֹק 🟢', match:'أَخْضَر'}, {arabic:'צָהֹב 🟡', match:'أَصْفَر'},
      ]),
      tapPairs('חַבֵּר', [
        {arabic:'עַיִן 👁️', match:'عَيْن'}, {arabic:'יָד ✋', match:'يَد'}, {arabic:'לֶחֶם 🍞', match:'خُبْز'},
      ]),
      dragOrder('סַדֵּר מִסְפָּרִים 1-10', [
        {text:'1️⃣ אֶחָד', order:1},{text:'2️⃣ שְׁנַיִם', order:2},{text:'3️⃣ שְׁלֹשָׁה', order:3},
        {text:'5️⃣ חֲמִשָּׁה', order:5},{text:'10️⃣ עֲשָׂרָה', order:10},
      ]),
      readAloud('שָׁלוֹם! שְׁמִי... אֲנִי בֶּן/בַּת... יֵשׁ לִי מִשְׁפָּחָה. אֲנִי לוֹמֵד עִבְרִית!', 'أهلاً! اسمي... عمري... عندي عائلة. أتعلم العبرية!', 45),
    ],
  },
  // L9 — הֲכָנָה לַמִּבְחָן
  {
    id: 'hb2-u8-l9', title: 'הֲכָנָה לַמִּבְחָן הַסּוֹפִי 📝', unitId: 'hb2-u8', order: 9, xpReward: 30, estimatedMinutes: 18,
    questions: [
      sortGroups('סַדֵּר לְנוֹשְׂאִים', [
        {label:'תְּחוּמִים (مواضيع)', items:['מִשְׁפָּחָה 👨‍👩‍👧','בֵּית הַסֵּפֶר 🏫','צְבָעִים 🎨','גּוּף 🙋','אֹכֶל 🍽️']},
      ]),
      mc('אֵיזֶה נוֹשֵׂא לָמַדְנוּ בְּיְחִידָה 1?', ['הַמִּשְׁפָּחָה','אָלֶף-בֵּית','הַגּוּף'], 1, 'יְחִידָה 1 = אָלֶף-בֵּית'),
      mc('אֵיזֶה נוֹשֵׂא לָמַדְנוּ בְּיְחִידָה 3?', ['צְבָעִים','הַמִּשְׁפָּחָה','אֹכֶל'], 1, 'יְחִידָה 3 = הַמִּשְׁפָּחָה'),
      flashcard('כָּל מַה שֶּׁלָּמַדְנוּ — كل ما تعلمناه',
        '1. אָלֶף-בֵּית 🔤\n2. שָׁלוֹם וְהַכָּרוּת 👋\n3. הַמִּשְׁפָּחָה 👨‍👩‍👧\n4. בֵּית הַסֵּפֶר 🏫\n5. צְבָעִים 🎨\n6. הַגּוּף 🙋\n7. אֹכֶל 🍽️'),
      readAloud('אֲנִי מוּכָן לַמִּבְחָן! אֲנִי יוֹדֵעַ עִבְרִית! 🌟', 'أنا مستعد للامتحان! أنا أعرف العبرية!', 45),
      speak('אֲנִי יוֹדֵעַ עִבְרִית', '🌟', 45),
    ],
  },
  // L10 — מִבְחָן סוֹפִי (12 questions)
  {
    id: 'hb2-u8-l10', title: 'מִבְחָן סוֹפִי 🏆', unitId: 'hb2-u8', order: 10, xpReward: 100, estimatedMinutes: 30,
    questions: [
      imgChoice('מִי זֶה? 👨', 'מִי זֶה',
        [{emoji:'👨', label:'אַבָּא'},{emoji:'👩', label:'אִמָּא'},{emoji:'👴', label:'סָבָא'},{emoji:'👵', label:'סָבְתָא'}], 0),
      imgMatch('הַתְאֵם', [
        {image:'📚', word:'סֵפֶר'}, {image:'🔴', word:'אָדֹם'},
        {image:'👁️', word:'עַיִן'}, {image:'🍎', word:'תַּפּוּחַ'},
      ]),
      tapPairs('חַבֵּר הַכֹּל', [
        {arabic:'שָׁלוֹם 👋', match:'أهلاً'}, {arabic:'תּוֹדָה 🙏', match:'شكراً'}, {arabic:'כֵּן ✅', match:'نعم'},
      ]),
      mc('אֵיזֶה מִשְׁפָּט נָכוֹן לְיַלְדָּה?', ['אֲנִי אוֹכֵל','אֲנִי אוֹכֶלֶת'], 1, 'נ\' → אוֹכֶלֶת'),
      sortGroups('פֵּרוֹת, יְרָקוֹת אוֹ חֵלְקֵי גּוּף?', [
        {label:'פֵּרוֹת 🍎', items:['תַּפּוּחַ 🍎','בָּנָנָה 🍌']},
        {label:'יְרָקוֹת 🥕', items:['גֶּזֶר 🥕','עַגְבָנִיָּה 🍅']},
        {label:'גּוּף 🙋', items:['יָד ✋','עַיִן 👁️']},
      ]),
      mc('מַה פֵּירוּשׁ "כּוֹאֵב לִי"?', ['أنا سعيد','يؤلمني','عندي'], 1),
      fbChoice('הַשָּׁמַיִם הֵם בְּצֶבַע ___. ☁️', ['כָּחֹל','אָדֹם','יָרֹק'], 0, '☁️'),
      wordOrder('סַדֵּר', ['אֶת','אוֹהֵב','אֲנִי','הַמִּשְׁפָּחָה','שֶׁלִּי.'], 'אֲנִי אוֹהֵב אֶת הַמִּשְׁפָּחָה שֶׁלִּי.'),
      comprehension(
        'שָׁלוֹם! שְׁמִי אַחְמַד. אֲנִי בֶּן שֶׁבַע.\nיֵשׁ לִי אַבָּא, אִמָּא וְאָחוֹת אַחַת.\nאֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. אֲנִי אוֹהֵב עִבְרִית! 🌟',
        'שָׁלוֹם! שְׁמִי אַחְמַד. אֲנִי בֶּן שֶׁבַע. יֵשׁ לִי אַבָּא, אִמָּא וְאָחוֹת אַחַת. אֲנִי לוֹמֵד בְּבֵית הַסֵּפֶר. אֲנִי אוֹהֵב עִבְרִית!',
        [
          {q:'מַה שֵּׁם הַיֶּלֶד?', options:['יוֹסֵף','אַחְמַד','דָּן'], correct:1},
          {q:'כַּמָּה אַחְיוֹת יֵשׁ לוֹ?', options:['אַחַת','שְׁתַּיִם','אֵין'], correct:0},
        ],
      ),
      dragOrder('סַדֵּר מִסְפָּרִים', [
        {text:'שְׁנַיִם 2️⃣', order:2},{text:'אַרְבָּעָה 4️⃣', order:4},
        {text:'שִׁשָּׁה 6️⃣', order:6},{text:'שְׁמוֹנָה 8️⃣', order:8},{text:'עֲשָׂרָה 🔟', order:10},
      ]),
      listenChoice('אָחוֹת', ['אָח 👦','אָחוֹת 👧','אִמָּא 👩'], 1),
      readAloud('שָׁלוֹם! אֲנִי לָמַדְתִּי עִבְרִית! תּוֹדָה רַבָּה! 🏆', 'أهلاً! لقد تعلمتُ العبرية! شكراً جزيلاً!', 45),
    ],
  },
];
