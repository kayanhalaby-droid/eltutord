export interface DashboardMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersMonth: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  dau: number;
  mau: number;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'ADMIN' | 'STUDENT' | 'PARENT';
  xp: number;
  gems: number;
  streak: number;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSubject {
  id: string;
  name: string;
  gradeLevel: number;
  description?: string;
  order: number;
  lessonCount?: number;
}

export interface AdminLesson {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  order: number;
  type: string;
  durationMin?: number;
  questionCount?: number;
}
