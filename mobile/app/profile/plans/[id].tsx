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
          id: item.exercise?._id || item.exercise?.id || item.exercise,
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
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id || "";
    const [type, ...idParts] = rawId.split("-");
    return {
      type: type as PlanType,
      planId: idParts.join("-"),
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
  }, [parsed.planId, parsed.type]);

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
        Alert.alert("План питания деактивирован");
        return;
      }

      activateNutritionPlan({
        id: plan.id,
        title: plan.title,
        type: "План питания",
        trainerName: getTrainerName(plan),
        days: buildNutritionPlanDays(plan),
      });
      Alert.alert("План питания активирован");
      return;
    }

    if (active) {
      deactivateWorkoutPlan();
      Alert.alert("Тренировочный план деактивирован");
      return;
    }

    activateWorkoutPlan({
      id: plan.id,
      title: plan.title,
      type: "Тренировочный план",
      trainerName: getTrainerName(plan),
      days: buildWorkoutPlanDays(plan),
    });
    Alert.alert("Тренировочный план активирован");
  };

  const isNutritionPlan = plan?.type === "nutrition";

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
              <Text style={styles.description}>
                Элементов в плане: {plan.items?.length || 0}
              </Text>
            </GlassCard>

            <AppButton
              title={active ? "Деактивировать план" : "Активировать план"}
              onPress={handleToggleActivePlan}
              variant={active ? "secondary" : undefined}
              style={styles.activateButton}
            />
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
  activateButton: {
    marginTop: 8,
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
