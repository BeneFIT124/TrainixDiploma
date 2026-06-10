import { create } from "zustand";

export type ActivePlanExerciseSet = {
  order: number;
  weight: number;
  reps: number;
};

export type ActivePlanExercise = {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  sets: ActivePlanExerciseSet[];
};

export type ActiveWorkoutPlanDay = {
  id: string;
  title: string;
  exercises: ActivePlanExercise[];
};

export type ActivePlanFood = {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type ActivePlanMeal = {
  id: string;
  mealType: string;
  foods: ActivePlanFood[];
};

export type ActiveNutritionPlanDay = {
  id: string;
  title: string;
  meals: ActivePlanMeal[];
};

export type ActivePurchasedWorkoutPlan = {
  id: string;
  title: string;
  type: "Тренировочный план";
  trainerName: string;
  days: ActiveWorkoutPlanDay[];
};

export type ActivePurchasedNutritionPlan = {
  id: string;
  title: string;
  type: "План питания";
  trainerName: string;
  days: ActiveNutritionPlanDay[];
};

type ActivePlanStore = {
  activeWorkoutPlan: ActivePurchasedWorkoutPlan | null;
  activeNutritionPlan: ActivePurchasedNutritionPlan | null;

  activateWorkoutPlan: (plan: ActivePurchasedWorkoutPlan) => void;
  deactivateWorkoutPlan: () => void;

  activateNutritionPlan: (plan: ActivePurchasedNutritionPlan) => void;
  deactivateNutritionPlan: () => void;

  isWorkoutPlanActive: (planId: string) => boolean;
  isNutritionPlanActive: (planId: string) => boolean;
  resetActivePlans: () => void;
};

export const useActivePlanStore = create<ActivePlanStore>((set, get) => ({
  activeWorkoutPlan: null,
  activeNutritionPlan: null,

  activateWorkoutPlan: (plan) => {
    set({
      activeWorkoutPlan: plan,
    });
  },

  deactivateWorkoutPlan: () => {
    set({
      activeWorkoutPlan: null,
    });
  },

  activateNutritionPlan: (plan) => {
    set({
      activeNutritionPlan: plan,
    });
  },

  deactivateNutritionPlan: () => {
    set({
      activeNutritionPlan: null,
    });
  },

  isWorkoutPlanActive: (planId) => {
    return get().activeWorkoutPlan?.id === planId;
  },

  isNutritionPlanActive: (planId) => {
    return get().activeNutritionPlan?.id === planId;
  },

  resetActivePlans: () => {
    set({
      activeWorkoutPlan: null,
      activeNutritionPlan: null,
    });
  },
}));
