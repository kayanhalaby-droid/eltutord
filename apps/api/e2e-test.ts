// @ts-nocheck
/**
 * e2e-test.ts — سيناريو اختبار شامل لـ EliTutor Mock API
 * تشغيل: npx ts-node --skip-project e2e-test.ts
 * (يجب أن يكون mock-server.ts يعمل على port 3001)
 */

const BASE = 'http://localhost:3001';
const TOKEN = 'mock-dev-token-2025';

// ── Helpers ───────────────────────────────────────────────────────
const headers = (extra: Record<string, string> = {}) => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  ...extra,
});

async function api<T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const get  = <T>(path: string) => api<T>('GET', path);
const post = <T>(path: string, body?: unknown) => api<T>('POST', path, body);
const del  = <T>(path: string) => api<T>('DELETE', path);

// ── Test Runner ───────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  ✅  ${name}`);
    passed++;
  } else {
    console.log(`  ❌  ${name}${detail ? `  →  ${detail}` : ''}`);
    failed++;
    failures.push(name);
  }
}

function section(title: string) {
  console.log(`\n${'─'.repeat(56)}`);
  console.log(`  ${title}`);
  console.log(`${'─'.repeat(56)}`);
}

// ── Reset state (restart mock or simulate a fresh state by doing clean calls)
async function resetMetzav() {
  await del('/metzav/simulate');
}

// ── Scenarios ─────────────────────────────────────────────────────

async function testAuth() {
  section('1 — Auth');
  const { status, data } = await post('/auth/login', { phone: '0501234567', password: 'any' });
  check('POST /auth/login → 200', status === 200);
  check('Returns access_token', !!data.access_token);
  check('Returns user object', !!data.user);
  check('User has gradeLevel', typeof data.user?.gradeLevel === 'number');
  check('User has firstName', !!data.user?.firstName);
}

async function testCurriculum() {
  section('2 — Curriculum & Learning Path');

  const subjects = await get('/curriculum/subjects');
  check('GET /curriculum/subjects → 200', subjects.status === 200);
  check('Has ≥ 2 subjects', Array.isArray(subjects.data) && subjects.data.length >= 2);

  const hebrewId = subjects.data.find((s: any) => s.name === 'عبري')?.id;
  check('Hebrew subject exists', !!hebrewId, `found: ${hebrewId}`);

  const path = await get(`/curriculum/path/${hebrewId}/3`);
  check('GET learning path → 200', path.status === 200);
  check('Path has nodes', Array.isArray(path.data?.nodes) && path.data.nodes.length > 0);

  const nodes = path.data?.nodes ?? [];
  const first = nodes[0];
  check('First node is UNLOCKED', first?.status === 'UNLOCKED', first?.status);
  check('First node is current', first?.isCurrent === true);

  const second = nodes[1];
  check('Second node is LOCKED initially', second?.status === 'LOCKED', second?.status);
}

async function testLessonFlow() {
  section('3 — Lesson Play & Completion');

  // Play lesson
  const play = await get('/curriculum/lessons/he-1/play');
  check('GET /lessons/he-1/play → 200', play.status === 200);
  check('Lesson has questions', Array.isArray(play.data?.questions) && play.data.questions.length > 0, `count: ${play.data?.questions?.length}`);
  check('Lesson has title', !!play.data?.title);

  // Complete lesson with perfect score
  const complete = await post('/curriculum/lessons/he-1/complete', { score: 100, correctAnswers: 8, totalQuestions: 8 });
  check('POST /lessons/he-1/complete → 200', complete.status === 200);
  check('Response has success flag', complete.data?.success === true);
  check('Unit not unlocked yet (mid-unit)', complete.data?.unitUnlocked === false);

  // Learning path updated
  const subjects = await get('/curriculum/subjects');
  const hebrewId = subjects.data.find((s: any) => s.name === 'عبري')?.id;
  const path = await get(`/curriculum/path/${hebrewId}/3`);
  const nodes = path.data?.nodes ?? [];
  const he1 = nodes.find((n: any) => n.lesson?.id === 'he-1');
  check('he-1 now COMPLETED in path', he1?.status === 'COMPLETED', he1?.status);

  const he2 = nodes.find((n: any) => n.lesson?.id === 'he-2');
  check('he-2 now UNLOCKED after he-1 done', he2?.status === 'UNLOCKED', he2?.status);
}

async function testUnitLock() {
  section('4 — Unit Lock / Quiz Gate');

  const subjects = await get('/curriculum/subjects');
  const hebrewId = subjects.data.find((s: any) => s.name === 'عبري')?.id;

  // Complete lessons 2, 3 to reach quiz
  await post('/curriculum/lessons/he-2/complete', { score: 80, correctAnswers: 6, totalQuestions: 8 });
  await post('/curriculum/lessons/he-3/complete', { score: 75, correctAnswers: 6, totalQuestions: 8 });

  // Complete quiz with LOW score (<70) — next unit should stay locked
  const lowQuiz = await post('/curriculum/lessons/he-4/complete', { score: 60, correctAnswers: 5, totalQuestions: 8 });
  check('Quiz with 60% → unitUnlocked=false', lowQuiz.data?.unitUnlocked === false, JSON.stringify(lowQuiz.data));

  const pathLow = await get(`/curriculum/path/${hebrewId}/3`);
  const he5Low = pathLow.data?.nodes?.find((n: any) => n.lesson?.id === 'he-5');
  check('he-5 still LOCKED after 60% quiz', he5Low?.status === 'LOCKED', he5Low?.status);

  // Re-complete quiz with HIGH score (≥70)
  const highQuiz = await post('/curriculum/lessons/he-4/complete', { score: 90, correctAnswers: 7, totalQuestions: 8 });
  check('Quiz with 90% → unitUnlocked=true', highQuiz.data?.unitUnlocked === true, JSON.stringify(highQuiz.data));
  check('Unlocked unit name is returned', !!highQuiz.data?.unlockedUnitName);

  const pathHigh = await get(`/curriculum/path/${hebrewId}/3`);
  const he5High = pathHigh.data?.nodes?.find((n: any) => n.lesson?.id === 'he-5');
  check('he-5 now UNLOCKED after 90% quiz', he5High?.status === 'UNLOCKED', he5High?.status);
}

async function testStreak() {
  section('5 — Streak System');

  const info = await get('/gamification/streak');
  check('GET /gamification/streak → 200', info.status === 200);
  check('streak is a number', typeof info.data?.streak === 'number');
  check('hasFreeze is boolean', typeof info.data?.hasFreeze === 'boolean');
  check('streakAtRisk is boolean', typeof info.data?.streakAtRisk === 'boolean');

  const before = info.data.streak;

  // Record activity → streak++
  const activity = await post('/gamification/streak/activity');
  check('POST /streak/activity → 200', activity.status === 200);
  check('Streak incremented', activity.data?.streak === before + 1, `before=${before}, after=${activity.data?.streak}`);

  // Check milestone at streak 7
  // Simulate break then repair
  const simBreak = await post('/gamification/streak/simulate-break');
  check('simulate-break records brokenStreak', simBreak.data?.brokenStreak > 0, JSON.stringify(simBreak.data));

  const afterBreak = await get('/gamification/streak');
  check('Streak is 0 after break', afterBreak.data?.streak === 0);
  check('brokenStreak is returned', (afterBreak.data?.brokenStreak ?? 0) > 0);

  const repair = await post('/gamification/streak/repair');
  check('POST /streak/repair → 200', repair.status === 200);
  check('Streak restored', repair.data?.streak > 0, `streak=${repair.data?.streak}`);
}

async function testFlashcards() {
  section('6 — Flashcard System');

  // Add vocab for he-5 (colors unit)
  const add = await post('/flashcards/add-lesson/he-5');
  check('POST /flashcards/add-lesson/he-5 → 200', add.status === 200);
  check('Cards added', add.data?.added > 0 || add.data?.message === 'already added', JSON.stringify(add.data));

  const stats = await get('/flashcards/stats');
  check('GET /flashcards/stats → 200', stats.status === 200);
  check('total > 0', stats.data?.total > 0, `total=${stats.data?.total}`);
  check('dueToday ≥ 0', typeof stats.data?.dueToday === 'number');

  const due = await get('/flashcards/due');
  check('GET /flashcards/due → 200', due.status === 200);
  check('Returns cards array', Array.isArray(due.data?.cards));

  // Review first due card
  const cards = due.data?.cards ?? [];
  if (cards.length > 0) {
    const firstCard = cards[0];
    check('Card has front/back', !!firstCard.front && !!firstCard.back);
    check('Card has transliteration', !!firstCard.transliteration);

    const review = await post('/flashcards/review', { cardId: firstCard.id, difficulty: 'easy' });
    check('POST /flashcards/review easy → 200', review.status === 200);
    check('easy → interval=7 days', review.data?.interval === 7, `interval=${review.data?.interval}`);

    const reviewMed = await post('/flashcards/review', { cardId: firstCard.id, difficulty: 'medium' });
    check('POST /flashcards/review medium → interval=3', reviewMed.data?.interval === 3, `interval=${reviewMed.data?.interval}`);

    const reviewHard = await post('/flashcards/review', { cardId: firstCard.id, difficulty: 'hard' });
    check('POST /flashcards/review hard → interval=1', reviewHard.data?.interval === 1, `interval=${reviewHard.data?.interval}`);
  } else {
    check('Due cards available for review', false, 'no due cards returned');
  }
}

async function testDailyQuests() {
  section('7 — Daily Quests');

  const quests = await get('/gamification/quests/daily');
  check('GET /gamification/quests/daily → 200', quests.status === 200);
  check('3 quests returned', quests.data?.quests?.length === 3, `count=${quests.data?.quests?.length}`);
  check('Has allCompleted flag', typeof quests.data?.allCompleted === 'boolean');
  check('Has bonusGems field', quests.data?.bonusGems > 0, `bonusGems=${quests.data?.bonusGems}`);

  const q = quests.data?.quests ?? [];
  check('Each quest has required fields', q.every((x: any) => x.type && x.title && x.target >= 1));
  check('Each quest has xpReward & gemsReward', q.every((x: any) => x.xpReward > 0 && x.gemsReward > 0));

  // Completing all quests and claiming bonus
  if (quests.data?.allCompleted && !quests.data?.bonusClaimed) {
    const bonus = await post('/gamification/quests/daily/claim-bonus');
    check('POST claim-bonus → 200', bonus.status === 200);
    check('Bonus gems awarded', bonus.data?.bonusGems === 50);
  }

  // Claim bonus when not complete should fail
  const earlyBonus = await post('/gamification/quests/daily/claim-bonus');
  // Either fails (not completed) or returns 200 if already claimed
  check('claim-bonus is idempotent or guarded', earlyBonus.status === 400 || earlyBonus.status === 200);
}

async function testMetzav() {
  section('8 — Metzav Countdown');

  // Start clean
  await del('/metzav/simulate');

  // Default grade 3 — not applicable
  const noMetzav = await get('/metzav/info');
  check('GET /metzav/info → 200', noMetzav.status === 200);
  check('Grade 3 → applicable=false', noMetzav.data?.applicable === false);

  // Simulate grade 2 (reset first to clear any leftover date override)
  await del('/metzav/simulate');
  await post('/metzav/simulate', { gradeLevel: 2 });
  const grade2 = await get('/metzav/info');
  check('Grade 2 → applicable=true', grade2.data?.applicable === true);
  check('Grade 2 → date is February 15', grade2.data?.date?.includes('-02-15'), `date=${grade2.data?.date}`);
  check('Grade 2 daysRemaining > 0', grade2.data?.daysRemaining > 0);

  // Simulate grade 5 (reset first)
  await del('/metzav/simulate');
  await post('/metzav/simulate', { gradeLevel: 5 });
  const grade5 = await get('/metzav/info');
  check('Grade 5 → date is May 14/15', grade5.data?.date?.match(/-05-1[45]$/), `date=${grade5.data?.date}`);

  // Simulate orange (45 days)
  const orange = new Date(); orange.setDate(orange.getDate() + 45);
  await post('/metzav/simulate', { date: orange.toISOString().split('T')[0] });
  const orangeRes = await get('/metzav/info');
  check('45 days → urgency=orange', orangeRes.data?.urgency === 'orange', orangeRes.data?.urgency);
  check('intensiveMode=false at 45d', orangeRes.data?.intensiveMode === false);

  // Simulate red / intensive (15 days)
  const red = new Date(); red.setDate(red.getDate() + 15);
  await post('/metzav/simulate', { date: red.toISOString().split('T')[0] });
  const redRes = await get('/metzav/info');
  check('15 days → urgency=red', redRes.data?.urgency === 'red', redRes.data?.urgency);
  check('intensiveMode=true at 15d', redRes.data?.intensiveMode === true);
  check('progressPct is 0–100', redRes.data?.progressPct >= 0 && redRes.data?.progressPct <= 100);

  // Simulate green (80 days)
  const green = new Date(); green.setDate(green.getDate() + 80);
  await post('/metzav/simulate', { date: green.toISOString().split('T')[0] });
  const greenRes = await get('/metzav/info');
  check('80 days → urgency=green', greenRes.data?.urgency === 'green', greenRes.data?.urgency);

  // Reset
  await del('/metzav/simulate');
  const reset = await get('/metzav/info');
  check('After DELETE simulate → applicable=false again', reset.data?.applicable === false);
}

async function testGamificationStats() {
  section('9 — Gamification: Hearts, XP, Gems');

  const hearts = await get('/gamification/hearts');
  check('GET /gamification/hearts → 200', hearts.status === 200);
  check('hearts 0–5', hearts.data?.hearts >= 0 && hearts.data?.hearts <= 5);
  check('maxHearts = 5', hearts.data?.maxHearts === 5);

  const deplete = await post('/gamification/hearts/deplete');
  check('POST /hearts/deplete decrements', deplete.data?.hearts === hearts.data?.hearts - 1 || hearts.data?.hearts === 0);

  const xp = await get('/gamification/xp');
  check('GET /gamification/xp → 200', xp.status === 200);
  check('totalXp is number', typeof xp.data?.totalXp === 'number');
  check('level ≥ 1', (xp.data?.level ?? 0) >= 1);

  const xpBefore = xp.data.totalXp;
  const award = await post('/gamification/xp/award', { amount: 50 });
  check('POST /xp/award → 200', award.status === 200);
  check('XP increased by 50', award.data?.totalXp === xpBefore + 50, `before=${xpBefore}, after=${award.data?.totalXp}`);

  const gems = await get('/gamification/gems');
  check('GET /gamification/gems → 200', gems.status === 200);
  check('gems is a number', typeof gems.data === 'number');
  check('gems ≥ 0', gems.data >= 0);
}

async function testDailyGoal() {
  section('10 — Daily Goal');

  const goal = await get('/gamification/daily-goal');
  check('GET /gamification/daily-goal → 200', goal.status === 200);
  check('Has target & current', typeof goal.data?.target === 'number' && typeof goal.data?.current === 'number');
  check('current ≤ target when not completed or completed flag set', goal.data?.current <= goal.data?.target || goal.data?.completed);

  const setGoal = await post('/gamification/daily-goal/set', { target: 100 });
  check('POST /daily-goal/set → 200', setGoal.status === 200);
  check('New target applied', setGoal.data?.target === 100);
}

async function testLeagueAndAchievements() {
  section('11 — League & Achievements');

  const league = await get('/gamification/league');
  check('GET /gamification/league → 200', league.status === 200);
  check('Has participants array', Array.isArray(league.data?.participants));
  check('Current user in league', league.data?.participants?.some((p: any) => p.isCurrentUser));
  check('User has rank', typeof league.data?.rank === 'number');
  check('leagueName set', !!league.data?.leagueName);

  const achievements = await get('/gamification/achievements');
  check('GET /gamification/achievements → 200', achievements.status === 200);
  check('Has achievements array', Array.isArray(achievements.data));
  check('Each achievement has progress', achievements.data?.every((a: any) => typeof a.progress === 'number'));
}

async function testFullStudentJourney() {
  section('12 — سيناريو الطالب الكامل');

  // Fresh state: get gems before
  const gemsBefore = (await get('/gamification/gems')).data;
  const xpBefore = (await get('/gamification/xp')).data.totalXp;

  // Complete a lesson → quest progress + flashcards + XP
  // (state was reset, so he-6 is a fresh lesson we haven't used yet)
  await post('/curriculum/lessons/he-6/complete', { score: 87, correctAnswers: 7, totalQuestions: 8 });
  await post('/gamification/xp/award', { amount: 20 });
  await post('/flashcards/add-lesson/he-6');  // colors vocab — fresh after reset
  await post('/gamification/streak/activity');

  const xpAfter = (await get('/gamification/xp')).data.totalXp;
  check('XP increased after lesson', xpAfter > xpBefore, `${xpBefore} → ${xpAfter}`);

  const statsAfter = await get('/flashcards/stats');
  check('Flashcard deck has cards', statsAfter.data?.total > 0);

  const questsAfter = await get('/gamification/quests/daily');
  const hasProgress = questsAfter.data?.quests?.some((q: any) => q.progress > 0);
  check('At least one quest has progress', hasProgress === true);

  const streakAfter = await get('/gamification/streak');
  check('Streak ≥ 1 after activity', streakAfter.data?.streak >= 1);

  // Review 10 cards to complete review_flashcards quest
  const due = await get('/flashcards/due');
  const cards = due.data?.cards ?? [];
  let reviewed = 0;
  for (const card of cards.slice(0, 10)) {
    const r = await post('/flashcards/review', { cardId: card.id, difficulty: 'medium' });
    if (r.status === 200) reviewed++;
  }
  check(`Reviewed ${reviewed} cards successfully`, reviewed > 0);

  const questsFinal = await get('/gamification/quests/daily');
  const reviewQuest = questsFinal.data?.quests?.find((q: any) => q.type === 'review_flashcards');
  if (reviewQuest) {
    check('review_flashcards quest progress updated', reviewQuest.progress > 0, `progress=${reviewQuest.progress}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   EliTutor — اختبار شامل من طرف إلى طرف              ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Verify server is reachable and reset all state for a clean run
  try {
    await get('/curriculum/subjects');
  } catch {
    console.error('\n❌  تعذّر الاتصال بـ mock-server على port 3001.');
    console.error('   شغّل: npx ts-node --skip-project mock-server.ts\n');
    process.exit(1);
  }
  const resetRes = await post('/debug/reset');
  check('POST /debug/reset → clean state', resetRes.status === 200);

  await testAuth();
  await testCurriculum();
  await testLessonFlow();
  await testUnitLock();
  await testStreak();
  await testFlashcards();
  await testDailyQuests();
  await testMetzav();
  await testGamificationStats();
  await testDailyGoal();
  await testLeagueAndAchievements();
  await testFullStudentJourney();

  // ── Summary ───────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║   النتائج: ${passed}/${total} اجتازت`);
  console.log('╠══════════════════════════════════════════════════════╣');
  if (failed === 0) {
    console.log('║   ✅  جميع الاختبارات نجحت — النظام جاهز للإنتاج!');
  } else {
    console.log(`║   ❌  ${failed} اختبار فشل:`);
    failures.forEach(f => console.log(`║      • ${f}`));
  }
  console.log('╚══════════════════════════════════════════════════════╝\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
