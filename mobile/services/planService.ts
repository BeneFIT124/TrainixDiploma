import { apiRequest } from "./api";

export type PlanType = "workout" | "nutrition";

export type PublicPlan = {
  id: string;
  _id: string;
  type: PlanType;
  title: string;
  description?: string | null;
  goalType?: string;
  difficultyLevel?: string;
  durationWeeks?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyFat?: number;
  dailyCarbs?: number;
  price: number;
  isActive: boolean;
  trainerProfile?: any;
  items?: any[];
  days?: any[];
  createdAt?: string;
};

export type PurchasedPlan = {
  purchaseId: string;
  purchaseDate: string;
  status: string;
  plan: PublicPlan;
};

export function getPlans() {
  return apiRequest<PublicPlan[]>("/plans");
}

export function getPlanById(type: PlanType, id: string) {
  return apiRequest<PublicPlan>(`/plans/${type}/${id}`);
}

export function getTrainerPlans(trainerProfileId: string) {
  return apiRequest<PublicPlan[]>(`/plans/trainer/${trainerProfileId}`);
}

export function purchasePlan(type: PlanType, id: string) {
  return apiRequest(`/plans/${type}/${id}/purchase`, {
    method: "POST",
  });
}

export function getMyPurchasedPlans() {
  return apiRequest<PurchasedPlan[]>("/plans/purchased/my");
}

export function getMyWorkoutPlans() {
  return apiRequest<PublicPlan[]>("/workout-plans/my");
}

export function getMyNutritionPlans() {
  return apiRequest<PublicPlan[]>("/nutrition-plans/my");
}

export function createWorkoutPlan(data: Record<string, unknown>) {
  return apiRequest<PublicPlan>("/workout-plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createNutritionPlan(data: Record<string, unknown>) {
  return apiRequest<PublicPlan>("/nutrition-plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWorkoutPlan(id: string, data: Record<string, unknown>) {
  return apiRequest<PublicPlan>(`/workout-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateNutritionPlan(id: string, data: Record<string, unknown>) {
  return apiRequest<PublicPlan>(`/nutrition-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteWorkoutPlan(id: string) {
  return apiRequest<{ message: string }>(`/workout-plans/${id}`, {
    method: "DELETE",
  });
}

export function deleteNutritionPlan(id: string) {
  return apiRequest<{ message: string }>(`/nutrition-plans/${id}`, {
    method: "DELETE",
  });
}
