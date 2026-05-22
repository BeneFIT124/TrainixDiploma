import { apiRequest } from "./api";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Food = {
  _id: string;
  id?: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category?: string;
};

export type Meal = {
  _id: string;
  id?: string;
  mealType: MealType;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  comment?: string | null;
};

export type MealItem = {
  _id: string;
  meal: string;
  food: Food;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type DailyNutritionSummary = {
  date: string;
  consumed: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
  };
  targets: {
    targetCalories: number;
    targetProtein: number;
    targetFat: number;
    targetCarbs: number;
  };
  remaining: {
    remainingCalories: number;
    remainingProtein: number;
    remainingFat: number;
    remainingCarbs: number;
  };
  mealsCount: number;
};

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export const mealTypeValues: Record<string, MealType> = {
  Завтрак: "breakfast",
  Обед: "lunch",
  Ужин: "dinner",
  Перекус: "snack",
};

export function getFoods() {
  return apiRequest<Food[]>("/foods");
}

export function createFood(data: Omit<Food, "_id">) {
  return apiRequest<Food>("/foods", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMealsByDate(date: string) {
  return apiRequest<Meal[]>(`/meals/by-date?date=${encodeURIComponent(date)}`);
}

export function getMealById(mealId: string) {
  return apiRequest<Meal>(`/meals/${mealId}`);
}

export function getDailyNutritionSummary(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiRequest<DailyNutritionSummary>(`/meals/summary/daily${query}`);
}

export function createMeal(data: {
  mealType: MealType;
  date?: string;
  comment?: string | null;
}) {
  return apiRequest<Meal>("/meals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addMealItem(
  mealId: string,
  data: { foodId: string; grams: number }
) {
  return apiRequest<MealItem>(`/meals/${mealId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMealItems(mealId: string) {
  return apiRequest<MealItem[]>(`/meals/${mealId}/items`);
}

export function deleteMealItem(mealId: string, itemId: string) {
  return apiRequest<{ message: string }>(`/meals/${mealId}/items/${itemId}`, {
    method: "DELETE",
  });
}
