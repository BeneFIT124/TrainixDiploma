import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import WorkoutMiniCard from "@/components/dashboard/WorkoutMiniCard";
import MealMiniCard from "@/components/dashboard/MealMiniCard";

import { COLORS } from "@/constants/colors";
import {
  mockDashboardStats,
  mockMealsToday,
  mockRecentWorkouts,
} from "@/data/mockDashboard";

export default function HomeScreen() {
  const caloriesProgress = Math.round(
    (mockDashboardStats.caloriesToday / mockDashboardStats.caloriesTarget) * 100
  );

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет, Иван</Text>
            <Text style={styles.title}>Сегодняшний прогресс</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>И</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Тренировок"
            value={`${mockDashboardStats.workoutsThisWeek}`}
            subtitle="за неделю"
          />

          <StatCard
            title="Калории"
            value={`${mockDashboardStats.caloriesToday}`}
            subtitle={`${caloriesProgress}% от цели`}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Streak"
            value={`🔥 ${mockDashboardStats.streakDays}`}
            subtitle="дней подряд"
          />

          <StatCard
            title="Вес"
            value={`${mockDashboardStats.weight}`}
            subtitle="кг"
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
            subtitle="Записать приём пищи и КБЖУ"
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
          <Text style={styles.sectionTitle}>Последние тренировки</Text>
          <Text
            style={styles.sectionLink}
            onPress={() => router.push("/(tabs)/workouts")}
          >
            Все
          </Text>
        </View>

        {mockRecentWorkouts.map((workout) => (
          <WorkoutMiniCard
            key={workout.id}
            title={workout.title}
            date={workout.date}
            duration={workout.duration}
            exercisesCount={workout.exercisesCount}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Питание сегодня</Text>
          <Text
            style={styles.sectionLink}
            onPress={() => router.push("/(tabs)/nutrition")}
          >
            Все
          </Text>
        </View>

        {mockMealsToday.map((meal) => (
          <MealMiniCard
            key={meal.id}
            title={meal.title}
            calories={meal.calories}
            protein={meal.protein}
            fat={meal.fat}
            carbs={meal.carbs}
          />
        ))}
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
});