// TypeScript types for GymTracker RN

// Workout Types
export type WorkoutType = "push" | "pull" | "legs" | "custom";
export type WorkoutVariation = 1 | 2;
export type CycleDay =
  | "push1"
  | "pull1"
  | "legs1"
  | "push2"
  | "pull2"
  | "legs2";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type SetPerformance = "easy" | "hard" | "failed";

export type WeightTrend = "increasing" | "decreasing" | "stable";

export type ConfidenceLevel = "low" | "medium" | "high";

// Exercise Database Entry
export interface ExerciseDatabaseEntry {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: Difficulty;
  category: string;
}

// Previous Set History for comparison
export interface SetHistory {
  weight: number;
  reps: number;
  isCompleted: boolean;
  completedAt: string;
  cycleOccurrence: number; // which cycle iteration was this from
}

// Core Models
export interface WorkoutPlan {
  id: string;
  name: string;
  type: WorkoutType;
  variation: WorkoutVariation;
  cycleDay: CycleDay;
  cycleOrder: number; // 0-5 for position in week (Push1=0, Pull1=1, etc.)
  createdAt: string;
  lastCompletedAt: string | null;
  cycleOccurrence: number; // which week/cycle this is
  notes: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  orderIndex: number;
  notes: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  workoutPlanId: string;
  sets: ExerciseSet[];
  previousSetHistory?: SetHistory[]; // previous week's performance for comparison
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
  completedAt: string | null;
  wasEasy: boolean;
  wasHard: boolean;
  failed: boolean;
  exerciseId: string;
  isFromSeed?: boolean; // true if set was created by seed, prevents deletion
}

// Smart Suggestion
export interface WeightSuggestion {
  suggestedWeight: number;
  confidence: ConfidenceLevel;
  trend: WeightTrend;
  reasoning: string;
  changeAmount: number;
  recommendation: string;
}

// AI Coach
export interface WeeklyRecommendation {
  id: string;
  type: "frequency" | "exercise" | "recovery" | "achievement";
  title: string;
  description: string;
  action: string;
  priority: "low" | "medium" | "high";
  category: string;
}

export interface WeeklySummary {
  totalWorkouts: number;
  previousWeekWorkouts: number;
  volumeChange: number;
  newPersonalRecords: number;
  streakDays: number;
  consistencyScore: number;
}

// App Settings
export interface AppSettings {
  defaultRestTime: number;
  enableVibration: boolean;
  enableSound: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
}
