import { apiRequest } from "./api";

export type StatisticsData = {
  currentWeight: number | null;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  completedWorkouts: number;
  caloriesTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbsTarget: number;
  todayCalories: number;
  todayProtein: number;
  todayFat: number;
  todayCarbs: number;
};

export function getMyStatistics() {
  return apiRequest<StatisticsData>("/statistics/me");
}
