import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import WorkoutMiniCard from "@/components/dashboard/WorkoutMiniCard";
import MealMiniCard from "@/components/dashboard/MealMiniCard";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardData, getDashboard } from "@/services/dashboardService";

export default function HomeScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && (!user.weight || !user.height || !user.targetCalories)) {
      router.replace("/onboarding");
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDashboard();
      setDashboard(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить главную страницу"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const caloriesProgress =
    dashboard?.nutrition.targets.calories && dashboard.nutrition.targets.calories > 0
      ? Math.round(
          (dashboard.nutrition.consumed.calories /
            dashboard.nutrition.targets.calories) *
            100
        )
      : 0;

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Привет, {user?.username || "пользователь"}
            </Text>
            <Text style={styles.title}>Сегодняшний прогресс</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || "П"}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем данные...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadDashboard} />
          </GlassCard>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                title="Тренировок"
                value={`${dashboard?.weeklyStats.workoutsCount || 0}`}
                subtitle="за неделю"
              />

              <StatCard
                title="Калории"
                value={`${Math.round(dashboard?.nutrition.consumed.calories || 0)}`}
                subtitle={`${caloriesProgress}% от цели`}
              />
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                title="Streak"
                value={`${dashboard?.weeklyStats.weeklyStreak || 0}`}
                subtitle="недель подряд"
              />

              <StatCard
                title="Вес"
                value={user?.weight ? `${user.weight}` : "—"}
                subtitle={user?.weight ? "кг" : "не указан"}
              />
            </View>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Быстрые действия</Text>

              <QuickActionCard
                title="Начать тренировку"
                subtitle="Добавить упражнения и подходы"
                icon="barbell-outline"
                onPress={() => router.push("/(tabs)/workouts")}
              />

              <QuickActionCard
                title="Добавить питание"
                subtitle="Записать прием пищи и КБЖУ"
                icon="restaurant-outline"
                onPress={() => router.push("/(tabs)/nutrition")}
              />

              <QuickActionCard
                title="Найти тренера"
                subtitle="Посмотреть тренеров и планы"
                icon="people-outline"
                onPress={() => router.push("/(tabs)/trainers")}
              />
            </GlassCard>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Последняя тренировка</Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(tabs)/workouts")}
              >
                Все
              </Text>
            </View>

            {dashboard?.lastWorkout ? (
              <WorkoutMiniCard
                title={dashboard.lastWorkout.title}
                date={new Date(dashboard.lastWorkout.date).toLocaleDateString(
                  "ru-RU"
                )}
                duration={dashboard.lastWorkout.durationMinutes}
                exercisesCount={dashboard.lastWorkout.exercisesCount}
              />
            ) : (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Тренировок пока нет</Text>
                <Text style={styles.emptyText}>
                  Создай первую тренировку, чтобы увидеть прогресс.
                </Text>
              </GlassCard>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Питание сегодня</Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(tabs)/nutrition")}
              >
                Все
              </Text>
            </View>

            <MealMiniCard
              title="Итого за день"
              calories={Math.round(dashboard?.nutrition.consumed.calories || 0)}
              protein={Math.round(dashboard?.nutrition.consumed.protein || 0)}
              fat={Math.round(dashboard?.nutrition.consumed.fat || 0)}
              carbs={Math.round(dashboard?.nutrition.consumed.carbs || 0)}
            />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  greeting: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#061014",
    fontSize: 24,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  sectionCard: {
    marginTop: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
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
