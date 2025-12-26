// Category Types
export type CategoryId =
  | 'career'
  | 'health'
  | 'education'
  | 'personal'
  | 'travel'
  | 'creative'
  | 'social'
  | 'financial'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
}

// Accomplishment Types
export type Priority = 'low' | 'medium' | 'high';

export interface Accomplishment {
  id: string;
  title: string;
  description?: string;
  categoryId: CategoryId;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  priority: Priority;
}

// Wrap Statistics Types
export interface CategoryStat {
  category: Category;
  count: number;
  percentage: number;
}

export interface MonthlyStat {
  month: string;
  monthIndex: number;
  count: number;
  accomplishments: Accomplishment[];
}

export interface StreakInfo {
  longestStreak: number;
  currentStreak: number;
  mostProductiveMonth: string;
  mostProductiveDay: string;
}

export interface FunFact {
  icon: string;
  text: string;
  highlight: string;
}

export interface WrapStats {
  totalAccomplishments: number;
  completedAccomplishments: number;
  completionRate: number;
  categoryBreakdown: CategoryStat[];
  monthlyBreakdown: MonthlyStat[];
  topCategory: CategoryStat | null;
  streaks: StreakInfo;
  funFacts: FunFact[];
}

// Settings Types
export type ThemeColor = 'gold' | 'purple' | 'cyan' | 'magenta' | 'green';

export interface Settings {
  userName: string;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

// Countdown Types
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isNewYear: boolean;
  totalSeconds: number;
}
