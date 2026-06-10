import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import { useWorkoutBuilderStore } from "@/store/workoutBuilderStore";
import {
  addWorkoutItem,
  addWorkoutSet,
  createWorkout,
  updateWorkout,
} from "@/services/workoutService";

export default function CreateWorkoutScreen() {
  const {
    selectedExercises,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    clearWorkout,
  } = useWorkoutBuilderStore();
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getTotalSets = () => {
    return selectedExercises.reduce(
      (sum, exercise) => sum + exercise.sets.length,
      0
    );
  };

  const validateWorkout = () => {
    if (selectedExercises.length === 0) {
      Alert.alert("Ошибка", "Добавь хотя бы одно упражнение");
      return false;
    }

    if (!title.trim()) {
      Alert.alert("Ошибка", "Укажи название тренировки");
      return false;
    }

    if (durationMinutes.trim()) {
      const duration = Number(durationMinutes.replace(",", "."));

      if (Number.isNaN(duration) || duration < 0) {
        Alert.alert("Ошибка", "Укажи корректную длительность тренировки");
        return false;
      }
    }

    for (const exercise of selectedExercises) {
      for (const set of exercise.sets) {
        const reps = Number(set.reps.replace(",", "."));
        const weight = Number(set.weight.replace(",", "."));

        if (!set.reps.trim() || Number.isNaN(reps) || reps <= 0) {
          Alert.alert(
            "Ошибка",
            `Укажи корректное количество повторений в упражнении «${exercise.name}»`
          );
          return false;
        }

        if (set.weight.trim() && (Number.isNaN(weight) || weight < 0)) {
          Alert.alert(
            "Ошибка",
            `Укажи корректный вес в упражнении «${exercise.name}»`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!validateWorkout()) {
      return;
    }

    try {
      setIsSaving(true);

      const workout = await createWorkout({
        title: title.trim(),
        workoutDate: new Date().toISOString(),
        status: "completed",
      });

      const estimatedDuration = getTotalSets() * 3;
      const savedDuration = durationMinutes.trim()
        ? Number(durationMinutes.replace(",", "."))
        : estimatedDuration;

      for (const [exerciseIndex, exercise] of selectedExercises.entries()) {
        const createdItem = await addWorkoutItem(workout._id, {
          exerciseId: exercise._id || exercise.id,
          exerciseOrder: exerciseIndex + 1,
        });

        for (const [setIndex, set] of exercise.sets.entries()) {
          await addWorkoutSet(createdItem.workoutItem._id, {
            setNumber: setIndex + 1,
            weightKg: set.weight.trim()
              ? Number(set.weight.replace(",", "."))
              : 0,
            reps: Number(set.reps.replace(",", ".")),
          });
        }
      }

      await updateWorkout(workout._id, {
        durationMinutes: savedDuration,
        status: "completed",
      });

      Alert.alert(
        "Тренировка сохранена",
        `Упражнений: ${selectedExercises.length}\nПодходов: ${getTotalSets()}`,
        [
          {
            text: "Ок",
            onPress: () => {
              clearWorkout();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить тренировку"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Отмена тренировки", "Очистить текущую тренировку?", [
      {
        text: "Нет",
        style: "cancel",
      },
      {
        text: "Очистить",
        style: "destructive",
        onPress: () => {
          clearWorkout();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Новая тренировка</Text>
            <Text style={styles.subtitle}>
              Добавь упражнения и настрой подходы
            </Text>
          </View>
        </View>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Итого</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{selectedExercises.length}</Text>
              <Text style={styles.summaryLabel}>упражнений</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{getTotalSets()}</Text>
              <Text style={styles.summaryLabel}>подходов</Text>
            </View>
          </View>

          <AppButton
            title="Добавить упражнение"
            onPress={() => router.push("/workouts/select-exercise")}
          />
        </GlassCard>

        <GlassCard style={styles.formCard}>
          <Text style={styles.summaryTitle}>Детали тренировки</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Название тренировки"
            placeholderTextColor={COLORS.textMuted}
            style={styles.detailInput}
          />

          <TextInput
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            keyboardType="number-pad"
            placeholder={`Длительность, мин. Если пусто: ${getTotalSets() * 3}`}
            placeholderTextColor={COLORS.textMuted}
            style={styles.detailInput}
          />

          <Text style={styles.detailHint}>
            Если длительность не указать, приложение оценит ее как 3 минуты на
            каждый подход.
          </Text>
        </GlassCard>

        {selectedExercises.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="barbell-outline" size={30} color={COLORS.primary} />
            </View>

            <Text style={styles.emptyTitle}>Упражнения еще не добавлены</Text>
            <Text style={styles.emptyText}>
              Нажми “Добавить упражнение”, найди нужное упражнение через поиск
              или фильтр и добавь его в тренировку.
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Упражнения тренировки</Text>

            {selectedExercises.map((exercise) => (
              <GlassCard key={exercise.id} style={styles.exerciseSetupCard}>
                <View style={styles.exerciseSetupHeader}>
                  <View style={styles.exerciseSetupInfo}>
                    <Text style={styles.exerciseSetupName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSetupMeta}>
                      {exercise.muscleGroup || exercise.primaryMuscleGroup || "Не указано"} •{" "}
                      {exercise.equipment || "Не указано"}
                    </Text>
                  </View>

                  <Pressable onPress={() => removeExercise(exercise.id)}>
                    <Ionicons name="close" size={23} color={COLORS.error} />
                  </Pressable>
                </View>

                <View style={styles.setsHeader}>
                  <Text style={styles.setsHeaderText}>Подход</Text>
                  <Text style={styles.setsHeaderText}>Вес, кг</Text>
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
                        updateSet(exercise.id, set.id, "weight", value)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.setInput}
                    />

                    <TextInput
                      value={set.reps}
                      onChangeText={(value) =>
                        updateSet(exercise.id, set.id, "reps", value)
                      }
                      keyboardType="number-pad"
                      placeholder="10"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.setInput}
                    />

                    <Pressable
                      onPress={() => removeSet(exercise.id, set.id)}
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
                  onPress={() => addSet(exercise.id)}
                  style={styles.addSetButton}
                >
                  <Ionicons name="add" size={19} color={COLORS.primary} />
                  <Text style={styles.addSetText}>Добавить подход</Text>
                </Pressable>
              </GlassCard>
            ))}
          </>
        )}

        <AppButton
          title={
            selectedExercises.length > 0
              ? `Сохранить тренировку (${getTotalSets()} подходов)`
              : "Сохранить тренировку"
          }
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        />
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
  summaryCard: {
    marginBottom: 24,
  },
  formCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  detailInput: {
    width: "100%",
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailHint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: "center",
    marginBottom: 22,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 26,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  exerciseSetupCard: {
    marginBottom: 18,
  },
  exerciseSetupHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  exerciseSetupInfo: {
    flex: 1,
  },
  exerciseSetupName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  exerciseSetupMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  setsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
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
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    backgroundColor: "rgba(94,234,212,0.10)",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  addSetText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  saveButton: {
    marginTop: 12,
  },
});
