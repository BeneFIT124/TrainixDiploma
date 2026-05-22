import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import TrainerOwnPlanCard from "@/components/trainers/TrainerOwnPlanCard";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyNutritionPlans,
  getMyWorkoutPlans,
  PublicPlan,
} from "@/services/planService";

const planTypeLabel = {
  workout: "Тренировочный план",
  nutrition: "План питания",
};

export default function TrainerPanelScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManagePlans = user?.role === "trainer" || user?.role === "admin";

  const loadPlans = useCallback(async () => {
    if (!canManagePlans) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [workoutPlans, nutritionPlans] = await Promise.all([
        getMyWorkoutPlans(),
        getMyNutritionPlans(),
      ]);
      setPlans([
        ...workoutPlans.map((plan) => ({ ...plan, type: "workout" as const })),
        ...nutritionPlans.map((plan) => ({ ...plan, type: "nutrition" as const })),
      ]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить планы"
      );
    } finally {
      setIsLoading(false);
    }
  }, [canManagePlans]);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  const stats = useMemo(
    () => ({
      plansCount: plans.length,
      salesCount: "—",
      income: "—",
      rating: "—",
    }),
    [plans]
  );

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

          <View style={styles.headerText}>
            <Text style={styles.title}>Панель тренера</Text>
            <Text style={styles.subtitle}>
              Управление планами и публикацией материалов
            </Text>
          </View>
        </View>

        {!canManagePlans ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Доступ только для тренера</Text>
            <Text style={styles.emptyText}>
              Обычный пользователь не может создавать и редактировать планы.
            </Text>
            <AppButton
              title="Стать тренером"
              onPress={() => router.push("/trainer-application")}
            />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="briefcase-outline" size={26} color={COLORS.primary} />
              </View>

              <Text style={styles.infoTitle}>Тренерский кабинет</Text>
              <Text style={styles.infoText}>
                Здесь тренер может создавать тренировочные планы и планы питания.
              </Text>
            </GlassCard>

            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statValue}>{stats.plansCount}</Text>
                <Text style={styles.statLabel}>планов</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <Text style={styles.statValue}>{stats.salesCount}</Text>
                <Text style={styles.statLabel}>продаж</Text>
              </GlassCard>
            </View>

            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statValue}>{stats.income}</Text>
                <Text style={styles.statLabel}>доход</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <Text style={styles.statValue}>{stats.rating}</Text>
                <Text style={styles.statLabel}>рейтинг</Text>
              </GlassCard>
            </View>

            <AppButton
              title="Создать план"
              onPress={() => router.push("/trainer-panel/create-plan")}
              style={styles.createButton}
            />

            <Text style={styles.sectionTitle}>Мои планы</Text>

            {isLoading ? (
              <GlassCard style={styles.stateCard}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.stateText}>Загружаем планы...</Text>
              </GlassCard>
            ) : error ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <AppButton title="Повторить" onPress={loadPlans} />
              </GlassCard>
            ) : plans.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Планов пока нет</Text>
                <Text style={styles.emptyText}>
                  Создай первый план, чтобы он появился в панели.
                </Text>
              </GlassCard>
            ) : (
              plans.map((plan) => (
                <TrainerOwnPlanCard
                  key={`${plan.type}-${plan.id}`}
                  title={plan.title}
                  type={planTypeLabel[plan.type]}
                  price={plan.price}
                  status={plan.isActive ? "Опубликован" : "Черновик"}
                  onPress={() => router.push(`/trainer-panel/plans/${plan.type}-${plan.id}`)}
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
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
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
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 110,
    justifyContent: "center",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  createButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
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
