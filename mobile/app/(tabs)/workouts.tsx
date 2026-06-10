import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import AppButton from "@/components/ui/AppButton";
import GlassCard from "@/components/ui/GlassCard";
import WorkoutCard from "@/components/workouts/WorkoutCard";

import { COLORS } from "@/constants/colors";
import { useActivePlanStore } from "@/store/activePlanStore";
import { useWorkoutBuilderStore } from "@/store/workoutBuilderStore";
import { getWorkoutItems, getWorkouts, Workout } from "@/services/workoutService";
import { useAuth } from "@/contexts/AuthContext";

type WorkoutWithCount = Workout & {
  exercisesCount: number;
};

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const { activeWorkoutPlan } = useActivePlanStore();
  const { setWorkoutFromPlanDay } = useWorkoutBuilderStore();
  const [workouts, setWorkouts] = useState<WorkoutWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?._id || user?.id || null;

  const loadWorkouts = useCallback(async () => {
    if (!userId) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getWorkouts();
      const withCounts = await Promise.all(
        data.map(async (workout) => {
          try {
            const items = await getWorkoutItems(workout._id);
            return { ...workout, exercisesCount: items.length };
          } catch {
            return { ...workout, exercisesCount: 0 };
          }
        })
      );
      setWorkouts(withCounts);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить тренировки"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const workoutStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = workouts.filter((workout) => {
      const workoutDate = new Date(workout.workoutDate);
      return workoutDate >= startOfWeek && workoutDate <= now;
    }).length;

    const lastWorkoutDate = workouts[0]?.workoutDate
      ? new Date(workouts[0].workoutDate).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        })
      : "—";

    return {
      total: workouts.length,
      week: workoutsThisWeek,
      last: lastWorkoutDate,
    };
  }, [workouts]);

  const handleStartPlanDay = (day: any) => {
    setWorkoutFromPlanDay(day);
    router.push("/workouts/create");
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Тренировки</Text>
          <Text style={styles.subtitle}>
            Создавай тренировки, добавляй упражнения и отслеживай силовой
            прогресс.
          </Text>
        </View>

        <AppButton
          title="Начать тренировку"
          onPress={() => router.push("/workouts/create")}
          style={styles.button}
        />

        {activeWorkoutPlan && (
          <GlassCard style={styles.activePlanCard}>
            <View style={styles.activePlanHeader}>
              <View style={styles.activePlanInfo}>
                <Text style={styles.activePlanLabel}>Активный план</Text>
                <Text style={styles.activePlanTitle}>
                  {activeWorkoutPlan.title}
                </Text>
                <Text style={styles.activePlanTrainer}>
                  Тренер: {activeWorkoutPlan.trainerName}
                </Text>
              </View>

              <View style={styles.activePlanIcon}>
                <Ionicons
                  name="flame-outline"
                  size={26}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Text style={styles.planDaysTitle}>Выбери день плана</Text>

            {activeWorkoutPlan.days.length === 0 ? (
              <Text style={styles.planEmptyText}>
                В активном плане пока нет дней
              </Text>
            ) : (
              activeWorkoutPlan.days.map((day) => (
                <Pressable
                  key={day.id}
                  onPress={() => handleStartPlanDay(day)}
                  style={({ pressed }) => [
                    styles.planDayButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.planDayInfo}>
                    <Text style={styles.planDayTitle}>{day.title}</Text>
                    <Text style={styles.planDayMeta}>
                      {day.exercises.length} упражнений
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              ))
            )}
          </GlassCard>
        )}

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{workoutStats.total}</Text>
            <Text style={styles.statLabel}>Тренировок</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{workoutStats.week}</Text>
            <Text style={styles.statLabel}>За неделю</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{workoutStats.last}</Text>
            <Text style={styles.statLabel}>Последняя</Text>
          </GlassCard>
        </View>

        <Text style={styles.sectionTitle}>История тренировок</Text>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем тренировки...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadWorkouts} />
          </GlassCard>
        ) : workouts.length === 0 ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Тренировок пока нет</Text>
            <Text style={styles.emptyText}>
              Начни первую тренировку, и она появится в истории.
            </Text>
          </GlassCard>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard
              key={workout._id}
              title={workout.title}
              date={new Date(workout.workoutDate).toLocaleDateString("ru-RU")}
              duration={workout.durationMinutes || 0}
              exercisesCount={workout.exercisesCount}
              onPress={() => router.push(`/workouts/${workout._id}`)}
            />
          ))
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
  planDayButton: {
    minHeight: 64,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  planDayInfo: {
    flex: 1,
  },
  planDayTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  planDayMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  planEmptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "30%",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
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
