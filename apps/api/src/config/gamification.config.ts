export const GamificationConfig = {
  hearts: {
    initialHearts: 5,
    maxHearts: 5,
    regenerationTimeMinutes: 30,
    regenerationIntervalMs: 30 * 60 * 1000,
  },
  streaks: {
    freezeCostGems: 200,
    maxFreezes: 2,
  },
  xp: {
    xpPerCorrectAnswer: 10,
    xpPerLessonCompletion: 50,
    xpPerQuizCompletion: 100,
    xpPerDailyLogin: 5,
    xpPerAchievement: 200,
    xpPerStreakMilestone: { 7: 50, 30: 150, 100: 500 } as Record<number, number>,
    levelingCurve: [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000, 13000],
  },
  gems: {
    gemsPerLessonCompletion: 5,
    gemsPerQuizCompletion: 10,
    gemsPerDailyLogin: 2,
    gemsPerAchievement: 20,
    gemsPerLevelUp: 50,
    costStreakFreeze: 200,
    costHeartRefill: 100,
  },
  leagues: {
    leagueTiers: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'],
    leagueSize: 50,
    promotionThreshold: 0.2,
    demotionThreshold: 0.3,
    resetDayOfWeek: 0,
    resetHour: 23,
    resetMinute: 59,
  },
};
