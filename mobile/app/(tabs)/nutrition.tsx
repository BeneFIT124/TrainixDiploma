import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import AppButton from "@/components/ui/AppButton";
import GlassCard from "@/components/ui/GlassCard";
import NutritionProgressCard from "@/components/nutrition/NutritionProgressCard";
import MealCard from "@/components/nutrition/MealCard";

import { COLORS } from "@/constants/colors";
import { useActivePlanStore } from "@/store/activePlanStore";
import { useMealBuilderStore } from "@/store/mealBuilderStore";
import {
  DailyNutritionSummary,
  getDailyNutritionSummary,
  getMealItems,
  getMealsByDate,
  Meal,
  mealTypeLabels,
} from "@/services/nutritionService";

type MealWithItemsCount = Meal & {
  itemsCount: number;
};

export default function NutritionScreen() {
  const { activeNutritionPlan } = useActivePlanStore();
  const { setMealFromPlanMeal } = useMealBuilderStore();
  const [meals, setMeals] = useState<MealWithItemsCount[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString(), []);

  const loadNutrition = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [mealsData, summaryData] = await Promise.all([
        getMealsByDate(today),
        getDailyNutritionSummary(today),
      ]);

      const mealsWithItemsCount = await Promise.all(
        mealsData.map(async (meal) => {
          try {
            const items = await getMealItems(meal._id);
            return { ...meal, itemsCount: items.length };
          } catch {
            return { ...meal, itemsCount: 0 };
          }
        })
      );

      setMeals(mealsWithItemsCount);
      setSummary(summaryData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить питание"
      );
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadNutrition();
    }, [loadNutrition])
  );

  const handleStartPlanMeal = (meal: any) => {
    setMealFromPlanMeal(meal);
    router.push("/nutrition/add-meal");
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Питание</Text>
          <Text style={styles.subtitle}>
            Следи за калориями и КБЖУ, чтобы двигаться к цели без хаоса.
          </Text>
        </View>

        <AppButton
          title="Добавить прием пищи"
          onPress={() => router.push("/nutrition/add-meal")}
          style={styles.button}
        />

        {activeNutritionPlan && (
          <GlassCard style={styles.activePlanCard}>
            <View style={styles.activePlanHeader}>
              <View style={styles.activePlanInfo}>
                <Text style={styles.activePlanLabel}>
                  Активный план питания
                </Text>
                <Text style={styles.activePlanTitle}>
                  {activeNutritionPlan.title}
                </Text>
                <Text style={styles.activePlanTrainer}>
                  Тренер: {activeNutritionPlan.trainerName}
                </Text>
              </View>

              <View style={styles.activePlanIcon}>
                <Ionicons
                  name="restaurant-outline"
                  size={26}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Text style={styles.planDaysTitle}>Выбери день и прием пищи</Text>

            {activeNutritionPlan.days.map((day) => (
              <View key={day.id} style={styles.planDayBlock}>
                <View style={styles.planDayHeader}>
                  <Text style={styles.planDayTitle}>{day.title}</Text>
                  <Text style={styles.planDayMeta}>
                    {day.meals.length} приемов пищи
                  </Text>
                </View>

                {day.meals.map((meal) => (
                  <Pressable
                    key={meal.id}
                    onPress={() => handleStartPlanMeal(meal)}
                    style={({ pressed }) => [
                      styles.planMealButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.planMealInfo}>
                      <Text style={styles.planMealTitle}>{meal.mealType}</Text>
                      <Text style={styles.planMealMeta}>
                        {meal.foods.length} продуктов
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            ))}
          </GlassCard>
        )}

        <Text style={styles.sectionTitle}>Итоги за день</Text>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем питание...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadNutrition} />
          </GlassCard>
        ) : (
          <>
            <NutritionProgressCard
              label="Калории"
              current={summary?.consumed.totalCalories || 0}
              target={summary?.targets.targetCalories || 0}
              unit="ккал"
            />

            <NutritionProgressCard
              label="Белки"
              current={summary?.consumed.totalProtein || 0}
              target={summary?.targets.targetProtein || 0}
              unit="г"
            />

            <NutritionProgressCard
              label="Жиры"
              current={summary?.consumed.totalFat || 0}
              target={summary?.targets.targetFat || 0}
              unit="г"
            />

            <NutritionProgressCard
              label="Углеводы"
              current={summary?.consumed.totalCarbs || 0}
              target={summary?.targets.targetCarbs || 0}
              unit="г"
            />

            <Text style={styles.sectionTitle}>Приемы пищи</Text>

            {meals.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Питание пока не добавлено</Text>
                <Text style={styles.emptyText}>
                  Добавь первый прием пищи, и дневная сводка обновится.
                </Text>
              </GlassCard>
            ) : (
              meals.map((meal) => (
                <MealCard
                  key={meal._id}
                  title={mealTypeLabels[meal.mealType] || meal.mealType}
                  time={new Date(meal.date).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  calories={Math.round(meal.totalCalories || 0)}
                  protein={Math.round(meal.totalProtein || 0)}
                  fat={Math.round(meal.totalFat || 0)}
                  carbs={Math.round(meal.totalCarbs || 0)}
                  itemsCount={meal.itemsCount}
                  onPress={() => router.push(`/nutrition/${meal._id}`)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 130,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    marginBottom: 16,
  },
  activePlanCard: {
    marginBottom: 24,
  },
  activePlanHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  activePlanInfo: {
    flex: 1,
  },
  activePlanLabel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 5,
  },
  activePlanTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 5,
  },
  activePlanTrainer: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  activePlanIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  planDaysTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  planDayBlock: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  planDayHeader: {
    marginBottom: 10,
  },
  planDayTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  planDayMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  planMealButton: {
    minHeight: 58,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  planMealInfo: {
    flex: 1,
  },
  planMealTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  planMealMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
    marginTop: 4,
  },
  stateCard: {
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
