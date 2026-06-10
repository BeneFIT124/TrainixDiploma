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
import { getPlanById, PlanType, PublicPlan, purchasePlan } from "@/services/planService";

const isPlanType = (type: string): type is PlanType => {
  return type === "workout" || type === "nutrition";
};

const getTrainerName = (plan: PublicPlan) => {
  const username = plan.trainerProfile?.user?.username;
  return typeof username === "string" && username.trim() ? username : "Тренер";
};

const planTypeLabel = {
  workout: "Тренировочный план",
  nutrition: "План питания",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Базовый",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export default function PlanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id || "";
    const [type, ...idParts] = rawId.split("-");
    const planId = idParts.join("-");

    return {
      type,
      planId,
      rawId,
    };
  }, [id]);

  const loadPlan = useCallback(async () => {
    if (
      !isPlanType(parsed.type) ||
      !parsed.planId ||
      parsed.planId === "undefined"
    ) {
      console.warn("Не удалось открыть план: отсутствует идентификатор плана", {
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

  const handlePurchase = async () => {
    if (!plan) {
      return;
    }

    Alert.alert(
      "Покупка плана",
      `Ты хочешь купить план «${plan.title}» за ${plan.price} ₽?`,
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Купить",
          onPress: async () => {
            try {
              setIsPurchasing(true);
              await purchasePlan(plan.type, plan.id);
              Alert.alert("План куплен", "План доступен в разделе профиля.", [
                {
                  text: "Ок",
                  onPress: () => router.push("/profile/plans"),
                },
              ]);
            } catch (purchaseError) {
              Alert.alert(
                "Ошибка",
                purchaseError instanceof Error
                  ? purchaseError.message
                  : "Не удалось купить план"
              );
            } finally {
              setIsPurchasing(false);
            }
          },
        },
      ]
    );
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

          <Text style={styles.headerTitle}>Детали плана</Text>
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

              <Text style={styles.planType}>{planTypeLabel[plan.type]}</Text>
              <Text style={styles.title}>{plan.title}</Text>
              <Text style={styles.trainer}>Тренер: {getTrainerName(plan)}</Text>

              <View style={styles.badgesRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {isNutritionPlan
                      ? "Питание"
                      : difficultyLabel[plan.difficultyLevel || "beginner"]}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {plan.durationWeeks ? `${plan.durationWeeks} нед.` : "Рацион"}
                  </Text>
                </View>
              </View>

              <Text style={styles.price}>{plan.price} ₽</Text>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Описание</Text>
              <Text style={styles.description}>
                {plan.description || "Описание пока не добавлено."}
              </Text>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Что входит</Text>
              <Text style={styles.description}>
                {isNutritionPlan
                ? "План питания, целевые калории и список продуктов по приемам пищи."
                : "Тренировочный план, упражнения и параметры подходов."}
              </Text>

              {isNutritionPlan ? (
                <>
                  <View style={styles.nutritionTargets}>
                    <Text style={styles.targetText}>
                      Калории: {plan.dailyCalories || 0} ккал
                    </Text>
                    <Text style={styles.targetText}>
                      Б: {plan.dailyProtein || 0} г • Ж: {plan.dailyFat || 0} г • У:{" "}
                      {plan.dailyCarbs || 0} г
                    </Text>
                  </View>

                  {(plan.items || []).length === 0 ? (
                    <Text style={styles.description}>
                      В этом плане питания пока нет элементов
                    </Text>
                  ) : (
                    (plan.items || []).map((item) => (
                      <View key={item._id || item.id} style={styles.planItem}>
                        <Text style={styles.planItemTitle}>
                          {item.food?.name || "Продукт"}
                        </Text>
                        <Text style={styles.planItemMeta}>
                          {item.grams || 0} г • {item.calories || 0} ккал
                        </Text>
                      </View>
                    ))
                  )}
                </>
              ) : (plan.days || []).length === 0 ? (
                <Text style={styles.description}>
                  В этом тренировочном плане пока нет дней
                </Text>
              ) : (
                (plan.days || []).map((day) => (
                  <View key={day.id || day._id} style={styles.planDay}>
                    <Text style={styles.planDayTitle}>{day.title}</Text>
                    {(day.exercises || []).map((exerciseItem: any, index: number) => (
                      <Text
                        key={`${day.id || day._id}-${exerciseItem.exercise?._id || index}`}
                        style={styles.planExerciseText}
                      >
                        {index + 1}. {exerciseItem.exercise?.name || "Упражнение"} —{" "}
                        {exerciseItem.setsCount || exerciseItem.sets || 1}x
                        {exerciseItem.reps || 10}
                      </Text>
                    ))}
                  </View>
                ))
              )}
            </GlassCard>

            <AppButton
              title="Купить план"
              onPress={handlePurchase}
              loading={isPurchasing}
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
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  trainer: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  price: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "900",
  },
  card: {
    marginBottom: 16,
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
  nutritionTargets: {
    gap: 5,
    marginBottom: 12,
  },
  targetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  planItem: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
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
  planDay: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  planDayTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  planExerciseText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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
