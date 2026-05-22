import { create } from "zustand";

export type Food = {
  id: string;
  _id?: string;
  name: string;
  category?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type SelectedMealFood = Food & {
  grams: number;
};

type PlanMealForNutrition = {
  mealType: string;
  foods: {
    id: string;
    name: string;
    grams: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    category?: string;
  }[];
};

type MealBuilderStore = {
  selectedMealType: string;
  selectedFoods: SelectedMealFood[];

  setSelectedMealType: (mealType: string) => void;
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  updateGrams: (foodId: string, gramsValue: string) => void;
  setMealFromPlanMeal: (meal: PlanMealForNutrition) => void;
  clearMeal: () => void;
};

export const useMealBuilderStore = create<MealBuilderStore>((set, get) => ({
  selectedMealType: "Завтрак",
  selectedFoods: [],

  setSelectedMealType: (mealType) => {
    set({
      selectedMealType: mealType,
    });
  },

  addFood: (food) => {
    const alreadySelected = get().selectedFoods.some(
      (item) => item.id === food.id
    );

    if (alreadySelected) {
      return;
    }

    set((state) => ({
      selectedFoods: [...state.selectedFoods, { ...food, grams: 100 }],
    }));
  },

  removeFood: (foodId) => {
    set((state) => ({
      selectedFoods: state.selectedFoods.filter((food) => food.id !== foodId),
    }));
  },

  updateGrams: (foodId, gramsValue) => {
    const grams = Number(gramsValue.replace(",", "."));

    set((state) => ({
      selectedFoods: state.selectedFoods.map((food) =>
        food.id === foodId
          ? {
              ...food,
              grams: Number.isNaN(grams) ? 0 : grams,
            }
          : food
      ),
    }));
  },

  setMealFromPlanMeal: (meal) => {
    set({
      selectedMealType: meal.mealType,
      selectedFoods: meal.foods.map((food) => ({
        id: food.id,
        name: food.name,
        category: food.category || "Из плана",
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        grams: food.grams,
      })),
    });
  },

  clearMeal: () => {
    set({
      selectedMealType: "Завтрак",
      selectedFoods: [],
    });
  },
}));
