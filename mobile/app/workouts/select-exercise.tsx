import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import { Exercise, getExercises, getLastExerciseSets } from "@/services/workoutService";
import { useWorkoutBuilderStore } from "@/store/workoutBuilderStore";

const allFilter = "Все";

export default function SelectExerciseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(allFilter);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { selectedExercises, addExercise } = useWorkoutBuilderStore();

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getExercises();
      setExercises(
        data.map((exercise) => ({
          ...exercise,
          id: exercise._id || exercise.id,
          muscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup,
          equipment: exercise.equipment || "Не указано",
          defaultSets: exercise.defaultSets || 3,
          defaultReps: exercise.defaultReps || 10,
        }))
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить упражнения"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const muscleGroups = useMemo(() => {
    const groups = exercises
      .map((exercise) => exercise.muscleGroup || exercise.primaryMuscleGroup)
      .filter(Boolean) as string[];

    return [allFilter, ...Array.from(new Set(groups))];
  }, [exercises]);

  const isAlreadyAdded = (exerciseId: string) => {
    return selectedExercises.some((exercise) => exercise.id === exerciseId);
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesMuscleGroup =
        selectedMuscleGroup === allFilter ||
        exercise.muscleGroup === selectedMuscleGroup ||
        exercise.primaryMuscleGroup === selectedMuscleGroup;

      return matchesSearch && matchesMuscleGroup;
    });
  }, [exercises, searchQuery, selectedMuscleGroup]);

  const handleAddExercise = async (exercise: Exercise) => {
    try {
      setAddingExerciseId(exercise.id);
      const lastSets = await getLastExerciseSets(exercise._id || exercise.id);

      addExercise({
        ...exercise,
        initialSets:
          lastSets.length > 0
            ? lastSets.map((set) => ({
                id: `${Date.now()}-${exercise.id}-${set.setNumber}`,
                weight: String(set.weightKg ?? 0),
                reps: String(set.reps ?? exercise.defaultReps ?? 10),
              }))
            : undefined,
      });
    } catch {
      addExercise(exercise);
    } finally {
      setAddingExerciseId(null);
      router.back();
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Выбор упражнения</Text>
            <Text style={styles.subtitle}>
              Найди упражнение через поиск или фильтр
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск упражнения"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />

          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем упражнения...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadExercises} />
          </GlassCard>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {muscleGroups.map((group) => {
                const active = selectedMuscleGroup === group;

                return (
                  <Pressable
                    key={group}
                    onPress={() => setSelectedMuscleGroup(group)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {group}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>
              Найдено: {filteredExercises.length}
            </Text>

            {filteredExercises.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="search-outline" size={30} color={COLORS.primary} />
                <Text style={styles.emptyTitle}>Ничего не найдено</Text>
                <Text style={styles.emptyText}>
                  Попробуй изменить запрос или выбрать другую группу мышц.
                </Text>
              </GlassCard>
            ) : (
              filteredExercises.map((exercise) => {
                const alreadyAdded = isAlreadyAdded(exercise.id);
                const isAdding = addingExerciseId === exercise.id;

                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() =>
                      !alreadyAdded && !isAdding && handleAddExercise(exercise)
                    }
                    style={[
                      styles.exerciseCard,
                      alreadyAdded && styles.exerciseCardDisabled,
                    ]}
                  >
                    <View style={styles.exerciseIcon}>
                      <Ionicons
                        name="fitness-outline"
                        size={22}
                        color={alreadyAdded ? COLORS.textMuted : COLORS.primary}
                      />
                    </View>

                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[
                          styles.exerciseName,
                          alreadyAdded && styles.exerciseNameDisabled,
                        ]}
                      >
                        {exercise.name}
                      </Text>

                      <Text style={styles.exerciseMeta}>
                        {exercise.muscleGroup || "Не указано"} •{" "}
                        {exercise.equipment || "Не указано"}
                      </Text>

                      <Text style={styles.exerciseMeta}>
                        {exercise.defaultSets || 3} подхода ×{" "}
                        {exercise.defaultReps || 10} повторений
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.addButton,
                        alreadyAdded && styles.addButtonDisabled,
                      ]}
                    >
                      <Ionicons
                        name={alreadyAdded ? "checkmark" : isAdding ? "time-outline" : "add"}
                        size={22}
                        color={alreadyAdded ? COLORS.textMuted : COLORS.primary}
                      />
                    </View>
                  </Pressable>
                );
              })
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
  searchBox: {
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  filters: {
    gap: 10,
    paddingBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#061014",
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
  emptyCard: {
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 14,
  },
  exerciseCard: {
    minHeight: 88,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseCardDisabled: {
    opacity: 0.55,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  exerciseNameDisabled: {
    color: COLORS.textMuted,
  },
  exerciseMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
