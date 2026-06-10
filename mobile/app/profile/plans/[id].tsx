import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import { useActivePlanStore } from "@/store/activePlanStore";
import { getPlanById, PlanType, PublicPlan } from "@/services/planService";

const isPlanType = (type: string): type is PlanType => {
  return type === "workout" || type === "nutrition";
};

const mealTypeLabel: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const getTrainerName = (plan: PublicPlan) => {
  const username = plan.trainerProfile?.user?.username;
  return typeof username === "string" && username.trim() ? username : "Тренер";
};

const buildWorkoutPlanDays = (plan: PublicPlan) => {
  if (Array.isArray(plan.days) && plan.days.length > 0) {
    return plan.days.map((day, index) => ({
      id: String(day.id || day._id || `${plan.id}-day-${index + 1}`),
      title: day.title || `День ${day.dayNumber || index + 1}`,
      exercises: (day.exercises || []).map((exerciseItem: any) => {
        const exercise = exerciseItem.exercise || exerciseItem;
        const exerciseId = exercise?._id || exercise?.id || exerciseItem.exerciseId;

        return {
          id: String(exerciseId || `${plan.id}-${index}-${exerciseItem.name}`),
          name: exercise?.name || exerciseItem.name || "Упражнение",
          muscleGroup:
            exercise?.primaryMuscleGroup ||
            exercise?.muscleGroup ||
            exerciseItem.muscleGroup ||
            "Не указано",
          equipment: exercise?.equipment || exerciseItem.equipment || "Не указано",
          sets: (exerciseItem.sets || []).length
            ? exerciseItem.sets.map((setItem: any, setIndex: number) => ({
                order: setItem.order || setIndex + 1,
                weight: setItem.weight || 0,
                reps: setItem.reps || 10,
              }))
            : Array.from({ length: exerciseItem.setsCount || 1 }, (_, setIndex) => ({
                order: setIndex + 1,
                weight: 0,
                reps: exerciseItem.reps || 10,
              })),
        };
      }),
    }));
  }

  const days = new Map<number, any[]>();

  (plan.items || []).forEach((item) => {
    const dayNumber = item.dayNumber || 1;
    const dayItems = days.get(dayNumber) || [];
    dayItems.push(item);
    days.set(dayNumber, dayItems);
  });

  return Array.from(days.entries())
    .sort(([first], [second]) => first - second)
    .map(([dayNumber, items]) => ({
      id: `${plan.id}-day-${dayNumber}`,
      title: `День ${dayNumber}`,
      exercises: items
        .sort((first, second) => (first.exerciseOrder || 1) - (second.exerciseOrder || 1))
        .map((item) => ({
          id: String(item.exercise?._id || item.exercise?.id || item.exercise),
          name: item.exercise?.name || "Упражнение",
          muscleGroup:
            item.exercise?.primaryMuscleGroup ||
            item.exercise?.muscleGroup ||
            "Не указано",
          equipment: item.exercise?.equipment || "Не указано",
          sets: Array.from({ length: item.sets || 1 }, (_, index) => ({
            order: index + 1,
            weight: 0,
            reps: item.reps || 10,
          })),
        })),
    }));
};

const buildNutritionPlanDays = (plan: PublicPlan) => {
  if (Array.isArray(plan.days) && plan.days.length > 0) {
    return plan.days.map((day, dayIndex) => ({
      id: String(day.id || day._id || `${plan.id}-nutrition-day-${dayIndex + 1}`),
      title: day.title || `День ${day.dayNumber || dayIndex + 1}`,
      meals: (day.meals || []).map((meal: any, mealIndex: number) => ({
        id: String(meal.id || meal._id || `${plan.id}-meal-${mealIndex + 1}`),
        mealType: mealTypeLabel[meal.mealType] || meal.mealType || "Прием пищи",
        foods: (meal.foods || []).map((foodItem: any) => {
          const food = foodItem.food || foodItem;

          return {
            id: String(food?._id || food?.id || foodItem.foodId || foodItem.id),
            name: food?.name || foodItem.name || "Продукт",
            grams: foodItem.grams || 0,
            calories: foodItem.calories || 0,
            protein: foodItem.protein || 0,
            fat: foodItem.fat || 0,
            carbs: foodItem.carbs || 0,
          };
        }),
      })),
    }));
  }

  const meals = new Map<string, any[]>();

  (plan.items || []).forEach((item) => {
    const mealType = item.mealType || "snack";
    const mealItems = meals.get(mealType) || [];
    mealItems.push(item);
    meals.set(mealType, mealItems);
  });

  return [
    {
      id: `${plan.id}-day-1`,
      title: "Рацион",
      meals: Array.from(meals.entries()).map(([mealType, items]) => ({
        id: `${plan.id}-${mealType}`,
        mealType: mealTypeLabel[mealType] || mealType,
        foods: items
          .sort((first, second) => (first.itemOrder || 1) - (second.itemOrder || 1))
          .map((item) => ({
            id: item.food?._id || item.food?.id || item.food,
            name: item.food?.name || "Продукт",
            grams: item.grams || 0,
            calories: item.calories || 0,
            protein: item.protein || 0,
            fat: item.fat || 0,
            carbs: item.carbs || 0,
          })),
      })),
    },
  ];
};

export default function PurchasedPlanDetailsScreen() {
  const { id, purchaseId } = useLocalSearchParams();
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id || "";
    const [type, ...idParts] = rawId.split("-");
    return {
      type,
      planId: idParts.join("-"),
      rawId,
    };
  }, [id]);

  const {
    activateWorkoutPlan,
    deactivateWorkoutPlan,
    activateNutritionPlan,
    deactivateNutritionPlan,
    isWorkoutPlanActive,
    isNutritionPlanActive,
  } = useActivePlanStore();

  const loadPlan = useCallback(async () => {
    if (
      !isPlanType(parsed.type) ||
      !parsed.planId ||
      parsed.planId === "undefined"
    ) {
      console.warn("Не удалось открыть купленный план: отсутствует идентификатор", {
        routeParam: parsed.rawId,
        parsed,
      });
      setError("Не удалось открыть план: отсутствует идентификатор плана");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlanById(parsed.type, parsed.planId);
      setPlan(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Не удалось загрузить план"
      );
    } finally {
      setIsLoading(false);
    }
  }, [parsed]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const active = plan
    ? plan.type === "nutrition"
      ? isNutritionPlanActive(plan.id)
      : isWorkoutPlanActive(plan.id)
    : false;

  const handleToggleActivePlan = () => {
    if (!plan) {
      return;
    }

    if (plan.type === "nutrition") {
      if (active) {
        deactivateNutritionPlan();
        console.log("План питания деактивирован", { planType: plan.type, planId: plan.id, plan });
        Alert.alert("План питания деактивирован");
        return;
      }

      const nextPlan = {
        id: plan.id,
        title: plan.title,
        type: "План питания" as const,
        trainerName: getTrainerName(plan),
        days: buildNutritionPlanDays(plan),
      };
      console.log("План питания активирован", { planType: plan.type, planId: plan.id, plan: nextPlan });
      activateNutritionPlan({
        ...nextPlan,
      });
      Alert.alert("План питания активирован");
      return;
    }

    if (active) {
      deactivateWorkoutPlan();
      console.log("Тренировочный план деактивирован", { planType: plan.type, planId: plan.id, plan });
      Alert.alert("Тренировочный план деактивирован");
      return;
    }

    const nextPlan = {
      id: plan.id,
      title: plan.title,
      type: "Тренировочный план" as const,
      trainerName: getTrainerName(plan),
      days: buildWorkoutPlanDays(plan),
    };
    console.log("Тренировочный план активирован", { planType: plan.type, planId: plan.id, plan: nextPlan });
    activateWorkoutPlan(nextPlan);
    Alert.alert("Тренировочный план активирован");
  };

  const isNutritionPlan = plan?.type === "nutrition";
  const currentPurchaseId = Array.isArray(purchaseId) ? purchaseId[0] : purchaseId;
  const trainerProfileId = plan
    ? String(plan.trainerProfile?._id || plan.trainerProfile?.id || "")
    : "";

  const renderPurchasedNutritionPlan = () => {
    if (!plan) return null;

    const days = buildNutritionPlanDays(plan);
    const hasData = days.some((day) => day.meals.length > 0);

    if (!hasData) {
      return <Text style={styles.description}>В этом плане пока нет данных.</Text>;
    }

    return days.map((day) => (
      <View key={day.id} style={styles.planItem}>
        <Text style={styles.planItemTitle}>{day.title}</Text>
        {day.meals.map((meal: any) => (
          <View key={meal.id} style={styles.planMealBlock}>
            <Text style={styles.planMealTitle}>{meal.mealType}</Text>
            {meal.foods.length === 0 ? (
              <Text style={styles.planItemMeta}>Продуктов пока нет</Text>
            ) : (
              meal.foods.map((food: any) => (
                <Text key={food.id} style={styles.planItemMeta}>
                  {food.name} - {food.grams} г, {Math.round(food.calories)} ккал,
                  Б {Math.round(food.protein)} г, Ж {Math.round(food.fat)} г,
                  У {Math.round(food.carbs)} г
                </Text>
              ))
            )}
          </View>
        ))}
      </View>
    ));
  };

  const renderPurchasedWorkoutPlan = () => {
    if (!plan) return null;

    const days = buildWorkoutPlanDays(plan);
    const hasData = days.some((day) => day.exercises.length > 0);

    if (!hasData) {
      return <Text style={styles.description}>В этом плане пока нет данных.</Text>;
    }

    return days.map((day) => (
      <View key={day.id} style={styles.planItem}>
        <Text style={styles.planItemTitle}>{day.title}</Text>
        {day.exercises.map((exercise: any, exerciseIndex: number) => (
          <View key={exercise.id} style={styles.planMealBlock}>
            <Text style={styles.planMealTitle}>
              {exerciseIndex + 1}. {exercise.name}
            </Text>
            <Text style={styles.planItemMeta}>
              {exercise.muscleGroup} • {exercise.equipment}
            </Text>
            {exercise.sets.map((set: any) => (
              <Text key={`${exercise.id}-${set.order}`} style={styles.planItemMeta}>
                Подход {set.order}: {set.reps} повт.
                {set.weight ? `, ${set.weight} кг` : ""}
              </Text>
            ))}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Купленный план</Text>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем план...</Text>
          </GlassCard>
        ) : error || !plan ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить план</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadPlan} />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.heroCard}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={isNutritionPlan ? "restaurant-outline" : "barbell-outline"}
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.planType}>
                {isNutritionPlan ? "План питания" : "Тренировочный план"}
              </Text>
              <Text style={styles.title}>{plan.title}</Text>
              <Text style={styles.trainer}>Тренер: {getTrainerName(plan)}</Text>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Как использовать</Text>
              <Text style={styles.description}>
                Купленный план используется как ориентир. После активации он
                появится в соответствующем разделе приложения.
              </Text>
              {isNutritionPlan
                ? renderPurchasedNutritionPlan()
                : renderPurchasedWorkoutPlan()}
            </GlassCard>

            <AppButton
              title={active ? "Деактивировать план" : "Активировать план"}
              onPress={handleToggleActivePlan}
              variant={active ? "secondary" : undefined}
              style={styles.activateButton}
            />

            {currentPurchaseId && trainerProfileId ? (
              <AppButton
                title="Оставить отзыв"
                onPress={() =>
                  router.push({
                    pathname: "/reviews/create",
                    params: {
                      purchaseId: currentPurchaseId,
                      trainerProfileId,
                    },
                  })
                }
                variant="secondary"
                style={styles.reviewButton}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  heroCard: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  planType: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  trainer: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  card: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  planItem: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
  },
  planItemTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  planItemMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  planMealBlock: {
    marginTop: 10,
    gap: 5,
  },
  planMealTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  activateButton: {
    marginTop: 8,
  },
  reviewButton: {
    marginTop: 12,
  },
  stateCard: {
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
});
