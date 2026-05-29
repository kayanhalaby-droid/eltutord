export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: number;
  xp: number;
  streak: number;
  gems: number;
}

export interface Activity {
  id: string;
  childId: string;
  type: 'lesson' | 'quiz' | 'game';
  subject: string;
  topic: string;
  score: number;
  maxScore: number;
  durationMinutes: number;
  date: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface TodaySummaryData {
  totalActivities: number;
  totalDurationMinutes: number;
  averageScore: number;
  completedLessons: number;
}

export interface WeeklyProgressData {
  date: string;
  activities: number;
  averageScore: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  claimedByChildId: string | null;
  claimedAt: string | null;
  deliveredAt: string | null;
}

export interface ScheduleEvent {
  id: string;
  childId: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  subject: string;
}

export interface WeeklyReportData {
  reportHtml: string;
}

export interface ParentDashboardData {
  children: Child[];
  todaySummary: TodaySummaryData;
  weeklyProgress: WeeklyProgressData[];
  skillRadar: Skill[];
  activities: Activity[];
}
