import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";
import { Exercise } from "@/store/workoutBuilderStore";

export type PlanWorkoutSet = {
  id: string;
  weight: string;
  reps: string;
};

export type PlanWorkoutExercise = Exercise & {
  sets: PlanWorkoutSet[];
};

export type WorkoutPlanDay = {
  id: string;
  title: string;
  exercises: PlanWorkoutExercise[];
};

type WorkoutPlanDayEditorProps = {
  day: WorkoutPlanDay;
  dayIndex: number;
  availableExercises: Exercise[];
  onUpdateDayTitle: (dayId: string, title: string) => void;
  onRemoveDay: (dayId: string) => void;
  onAddExercise: (dayId: string, exercise: Exercise) => void;
  onRemoveExercise: (dayId: string, exerciseId: string) => void;
  onAddSet: (dayId: string, exerciseId: string) => void;
  onRemoveSet: (dayId: string, exerciseId: string, setId: string) => void;
  onUpdateSet: (
    dayId: string,
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: string
  ) => void;
};

const muscleGroups = ["Все", "Грудь", "Спина", "Ноги", "Бицепс", "Трицепс"];

export default function WorkoutPlanDayEditor({
  day,
  dayIndex,
  availableExercises,
  onUpdateDayTitle,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: WorkoutPlanDayEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Все");
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    return availableExercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesMuscleGroup =
        selectedMuscleGroup === "Все" ||
        exercise.muscleGroup === selectedMuscleGroup ||
        exercise.primaryMuscleGroup === selectedMuscleGroup;

      return matchesSearch && matchesMuscleGroup;
    });
  }, [availableExercises, searchQuery, selectedMuscleGroup]);

  const isExerciseAdded = (exerciseId: string) => {
    return day.exercises.some((exercise) => exercise.id === exerciseId);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.dayHeader}>
        <View style={styles.dayNumber}>
          <Text style={styles.dayNumberText}>{dayIndex + 1}</Text>
        </View>

        <View style={styles.dayTitleBox}>
          <Text style={styles.dayLabel}>Тренировочный день</Text>

          <TextInput
            value={day.title}
            onChangeText={(value) => onUpdateDayTitle(day.id, value)}
            placeholder="Например, Грудь и трицепс"
            placeholderTextColor={COLORS.textMuted}
            style={styles.dayTitleInput}
          />
        </View>

        <Pressable onPress={() => onRemoveDay(day.id)}>
          <Ionicons name="trash-outline" size={22} color={COLORS.error} />
        </Pressable>
      </View>

      {day.exercises.length > 0 && (
        <View style={styles.exercisesBlock}>
          {day.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseBlock}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.muscleGroup} • {exercise.equipment}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onRemoveExercise(day.id, exercise.id)}
                >
                  <Ionicons name="close" size={22} color={COLORS.error} />
                </Pressable>
              </View>

              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>Подход</Text>
                <Text style={styles.setsHeaderText}>Вес</Text>
                <Text style={styles.setsHeaderText}>Повт.</Text>
                <View style={styles.removeColumn} />
              </View>

              {exercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>{index + 1}</Text>
                  </View>

                  <TextInput
                    value={set.weight}
                    onChangeText={(value) =>
                      onUpdateSet(day.id, exercise.id, set.id, "weight", value)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.setInput}
                  />

                  <TextInput
                    value={set.reps}
                    onChangeText={(value) =>
                      onUpdateSet(day.id, exercise.id, set.id, "reps", value)
                    }
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.setInput}
                  />

                  <Pressable
                    onPress={() => onRemoveSet(day.id, exercise.id, set.id)}
                    style={styles.removeSetButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={COLORS.error}
                    />
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={() => onAddSet(day.id, exercise.id)}
                style={styles.addSetButton}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={styles.addSetText}>Добавить подход</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => setIsExerciseListOpen((prev) => !prev)}
        style={styles.addExerciseButton}
      >
        <Ionicons name="add" size={20} color={COLORS.primary} />
        <Text style={styles.addExerciseText}>Добавить упражнение</Text>
      </Pressable>

      {isExerciseListOpen && (
        <View style={styles.exercisePicker}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск упражнения"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>

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

          {filteredExercises.map((exercise) => {
            const added = isExerciseAdded(exercise.id);

            return (
              <Pressable
                key={exercise.id}
                disabled={added}
                onPress={() => {
                  onAddExercise(day.id, exercise);
                  setIsExerciseListOpen(false);
                  setSearchQuery("");
                }}
                style={[styles.pickExerciseCard, added && styles.disabledCard]}
              >
                <View style={styles.pickExerciseInfo}>
                  <Text
                    style={[
                      styles.pickExerciseName,
                      added && styles.disabledText,
                    ]}
                  >
                    {exercise.name}
                  </Text>

                  <Text style={styles.pickExerciseMeta}>
                    {exercise.muscleGroup} • {exercise.equipment}
                  </Text>
                </View>

                <Ionicons
                  name={added ? "checkmark" : "add"}
                  size={22}
                  color={added ? COLORS.textMuted : COLORS.primary}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dayNumber: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  dayTitleBox: {
    flex: 1,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  dayTitleInput: {
    minHeight: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    paddingHorizontal: 12,
  },
  exercisesBlock: {
    marginBottom: 14,
  },
  exerciseBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  exerciseMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  setsHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  setsHeaderText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  removeColumn: {
    width: 34,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  setNumber: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  setInput: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: COLORS.text,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
  },
  removeSetButton: {
    width: 34,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(251,113,133,0.10)",
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  addSetButton: {
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    backgroundColor: "rgba(94,234,212,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  addSetText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  addExerciseButton: {
    height: 48,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    backgroundColor: "rgba(94,234,212,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addExerciseText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  exercisePicker: {
    marginTop: 16,
  },
  searchBox: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  filters: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
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
  pickExerciseCard: {
    minHeight: 68,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  disabledCard: {
    opacity: 0.5,
  },
  pickExerciseInfo: {
    flex: 1,
  },
  pickExerciseName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  pickExerciseMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
