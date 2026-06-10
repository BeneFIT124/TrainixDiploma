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

export function normalizePlan(plan: any, fallbackType?: PlanType): PublicPlan {
  const planId = plan?._id || plan?.id || plan?.planId;
  const type = plan?.type || fallbackType;

  return {
    ...plan,
    id: planId ? String(planId) : "",
    _id: plan?._id ? String(plan._id) : planId ? String(planId) : "",
    type,
    trainerProfile: plan?.trainerProfile || plan?.trainer || null,
    items: plan?.items || plan?.nutritionPlanItems || plan?.workoutPlanItems || [],
    days: plan?.days || plan?.workoutPlanDays || [],
  };
}

export function getPlanRouteId(plan: Pick<PublicPlan, "id" | "_id" | "type">) {
  const planId = plan.id || plan._id;

  if (!planId || planId === "undefined") {
    console.warn("Не удалось открыть план: отсутствует идентификатор плана", {
      plan,
    });
    return null;
  }

  return `${plan.type}-${planId}`;
}

function assertValidPlanRequest(type: PlanType, id: string, context: string) {
  if (!type || !id || id === "undefined") {
    console.warn("Некорректный запрос плана", { context, type, id });
    throw new Error("Не удалось открыть план: отсутствует идентификатор плана");
  }
}

export function getPlans() {
  return apiRequest<any[]>("/plans").then((plans) =>
    plans.map((plan) => normalizePlan(plan))
  );
}

export function getPlanById(type: PlanType, id: string) {
  assertValidPlanRequest(type, id, "getPlanById");
  console.log("Запрос деталей плана", { planType: type, planId: id });

  return apiRequest<any>(`/plans/${type}/${id}`).then((plan) => {
    const normalizedPlan = normalizePlan(plan, type);
    console.log("Детали плана получены", {
      planType: type,
      planId: normalizedPlan.id,
      plan: normalizedPlan,
    });
    return normalizedPlan;
  });
}

export function getTrainerPlans(trainerProfileId: string) {
  if (!trainerProfileId || trainerProfileId === "undefined") {
    console.warn("Некорректный запрос планов тренера", { trainerProfileId });
    throw new Error("Не удалось загрузить планы: отсутствует идентификатор тренера");
  }

  return apiRequest<any[]>(`/plans/trainer/${trainerProfileId}`).then((plans) =>
    plans.map((plan) => normalizePlan(plan))
  );
}

export function purchasePlan(type: PlanType, id: string) {
  assertValidPlanRequest(type, id, "purchasePlan");
  console.log("Покупка плана", { planType: type, planId: id });

  return apiRequest(`/plans/${type}/${id}/purchase`, {
    method: "POST",
  }).then((purchase) => {
    console.log("План куплен", { planType: type, planId: id, purchase });
    return purchase;
  });
}

export function getMyPurchasedPlans() {
  return apiRequest<any[]>("/plans/purchased/my").then((purchases) =>
    purchases.map((purchase) => ({
      ...purchase,
      purchaseId: String(purchase.purchaseId || purchase._id || ""),
      plan: normalizePlan(purchase.plan, purchase.plan?.type),
    }))
  );
}

export function getMyWorkoutPlans() {
  return apiRequest<any[]>("/workout-plans/my").then((plans) =>
    plans.map((plan) => normalizePlan(plan, "workout"))
  );
}

export function getMyNutritionPlans() {
  return apiRequest<any[]>("/nutrition-plans/my").then((plans) =>
    plans.map((plan) => normalizePlan(plan, "nutrition"))
  );
}

export function createWorkoutPlan(data: Record<string, unknown>) {
  return apiRequest<any>("/workout-plans", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((plan) => normalizePlan(plan, "workout"));
}

export function addWorkoutPlanItem(
  planId: string,
  data: {
    exerciseId: string;
    dayNumber: number;
    exerciseOrder: number;
    sets: number;
    reps: number;
    comment?: string | null;
  }
) {
  assertValidPlanRequest("workout", planId, "addWorkoutPlanItem");

  return apiRequest(`/workout-plans/${planId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createNutritionPlan(data: Record<string, unknown>) {
  return apiRequest<any>("/nutrition-plans", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((plan) => normalizePlan(plan, "nutrition"));
}

export function addNutritionPlanItem(
  planId: string,
  data: {
    foodId: string;
    dayNumber: number;
    mealType: string;
    grams: number;
    itemOrder: number;
    comment?: string | null;
  }
) {
  assertValidPlanRequest("nutrition", planId, "addNutritionPlanItem");

  return apiRequest(`/nutrition-plans/${planId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWorkoutPlan(id: string, data: Record<string, unknown>) {
  assertValidPlanRequest("workout", id, "updateWorkoutPlan");

  return apiRequest<any>(`/workout-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((plan) => normalizePlan(plan, "workout"));
}

export function updateNutritionPlan(id: string, data: Record<string, unknown>) {
  assertValidPlanRequest("nutrition", id, "updateNutritionPlan");

  return apiRequest<any>(`/nutrition-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((plan) => normalizePlan(plan, "nutrition"));
}

export function deleteWorkoutPlan(id: string) {
  assertValidPlanRequest("workout", id, "deleteWorkoutPlan");

  return apiRequest<{ message: string }>(`/workout-plans/${id}`, {
    method: "DELETE",
  });
}

export function deleteNutritionPlan(id: string) {
  assertValidPlanRequest("nutrition", id, "deleteNutritionPlan");

  return apiRequest<{ message: string }>(`/nutrition-plans/${id}`, {
    method: "DELETE",
  });
}
