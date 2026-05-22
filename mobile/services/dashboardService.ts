import { apiRequest } from "./api";

export type DashboardData = {
  nutrition: {
    consumed: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    targets: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    remaining: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    mealsCount: number;
  };
  todayWorkout: {
    hasWorkout: boolean;
    workoutsCount: number;
    exercisesCount: number;
    setsCount: number;
  };
  lastWorkout: null | {
    id: string;
    title: string;
    date: string;
    status: string;
    exercisesCount: number;
    setsCount: number;
    durationMinutes: number;
  };
  weeklyStats: {
    workoutsCount: number;
    completedWorkoutsCount: number;
    exercisesCount: number;
    setsCount: number;
    repsCount: number;
    totalDuration: number;
    weeklyStreak: number;
  };
};

export function getDashboard() {
  return apiRequest<DashboardData>("/dashboard");
}
