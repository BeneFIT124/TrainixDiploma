import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";
import {
  getWorkoutById,
  getWorkoutItems,
  getWorkoutSets,
  Workout,
  WorkoutItem,
  WorkoutSet,
} from "@/services/workoutService";

type WorkoutItemWithSets = WorkoutItem & {
  sets: WorkoutSet[];
};

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams();
  const workoutId = Array.isArray(id) ? id[0] : id;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [items, setItems] = useState<WorkoutItemWithSets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkout = useCallback(async () => {
    if (!workoutId) {
      setError("Тренировка не найдена");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [workoutData, workoutItems] = await Promise.all([
        getWorkoutById(workoutId),
        getWorkoutItems(workoutId),
      ]);

      const itemsWithSets = await Promise.all(
        workoutItems.map(async (item) => ({
          ...item,
          sets: await getWorkoutSets(item._id),
        }))
      );

      setWorkout(workoutData);
      setItems(itemsWithSets);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить тренировку"
      );
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const totalSets = items.reduce((sum, item) => sum + item.sets.length, 0);
  const displayDuration = workout?.durationMinutes || totalSets * 3;

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

          <Text style={styles.headerTitle}>Тренировка</Text>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем тренировку...</Text>
          </GlassCard>
        ) : error || !workout ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить тренировку</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadWorkout} />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.heroCard}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="barbell-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>{workout.title}</Text>
              <Text style={styles.date}>
                {new Date(workout.workoutDate).toLocaleDateString("ru-RU")}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {displayDuration}
                  </Text>
                  <Text style={styles.statLabel}>минут</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{items.length}</Text>
                  <Text style={styles.statLabel}>упражнений</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalSets}</Text>
                  <Text style={styles.statLabel}>подходов</Text>
                </View>
              </View>
            </GlassCard>

            <Text style={styles.sectionTitle}>Упражнения</Text>

            {items.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Упражнений нет</Text>
                <Text style={styles.emptyText}>
                  В этой тренировке пока нет упражнений.
                </Text>
              </GlassCard>
            ) : (
              items.map((item) => (
                <GlassCard key={item._id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{item.exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {item.exercise.primaryMuscleGroup ||
                      item.exercise.muscleGroup ||
                      "Группа не указана"}
                  </Text>

                  {item.sets.map((set) => (
                    <View key={set._id} style={styles.setRow}>
                      <Text style={styles.setNumber}>Подход {set.setNumber}</Text>
                      <Text style={styles.setValue}>
                        {set.weightKg} кг × {set.reps} повт.
                      </Text>
                    </View>
                  ))}
                </GlassCard>
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
    marginBottom: 22,
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
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 18,
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  exerciseCard: {
    marginBottom: 14,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  exerciseMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setNumber: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  setValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
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
