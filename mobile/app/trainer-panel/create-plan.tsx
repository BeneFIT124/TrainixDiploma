import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import WorkoutPlanDayEditor, {
  PlanWorkoutSet,
  WorkoutPlanDay,
} from "@/components/trainerPanel/WorkoutPlanDayEditor";
import NutritionPlanDayEditor, {
  NutritionPlanDay,
} from "@/components/trainerPanel/NutritionPlanDayEditor";

import { COLORS } from "@/constants/colors";
import { Exercise } from "@/store/workoutBuilderStore";
import { Food } from "@/store/mealBuilderStore";
import {
  createNutritionPlan,
  createWorkoutPlan,
} from "@/services/planService";
import { getFoods } from "@/services/nutritionService";
import { getExercises } from "@/services/workoutService";

const planTypes = ["Тренировочный план", "План питания"];

const createDefaultSets = (exercise: Exercise): PlanWorkoutSet[] => {
  const setsCount = exercise.defaultSets || 3;
  const repsCount = exercise.defaultReps || 10;

  return Array.from({ length: setsCount }, (_, index) => ({
    id: `${Date.now()}-${exercise.id}-${index}`,
    weight: "",
    reps: String(repsCount),
  }));
};

export default function CreateTrainerPlanScreen() {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState("Тренировочный план");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [workoutDays, setWorkoutDays] = useState<WorkoutPlanDay[]>([
    {
      id: `${Date.now()}-workout-day-1`,
      title: "День 1",
      exercises: [],
    },
  ]);

  const [nutritionDays, setNutritionDays] = useState<NutritionPlanDay[]>([
    {
      id: `${Date.now()}-nutrition-day-1`,
      title: "День 1",
      meals: [],
    },
  ]);

  const loadCatalogs = async () => {
    try {
      setIsCatalogLoading(true);
      setCatalogError(null);

      const [exercisesData, foodsData] = await Promise.all([
        getExercises(),
        getFoods(),
      ]);

      setAvailableExercises(
        exercisesData.map((exercise) => ({
          ...exercise,
          id: exercise._id || exercise.id,
          muscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup,
          equipment: exercise.equipment || "Не указано",
          defaultSets: exercise.defaultSets || 3,
          defaultReps: exercise.defaultReps || 10,
        }))
      );

      setAvailableFoods(
        foodsData
          .filter((food) => food._id || food.id)
          .map((food) => ({
            ...food,
            id: food._id || food.id || food.name,
          }))
      );
    } catch (loadError) {
      setCatalogError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить упражнения и продукты"
      );
    } finally {
      setIsCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const addWorkoutDay = () => {
    setWorkoutDays((prev) => [
      ...prev,
      {
        id: `${Date.now()}-workout-day-${prev.length + 1}`,
        title: `День ${prev.length + 1}`,
        exercises: [],
      },
    ]);
  };

  const removeWorkoutDay = (dayId: string) => {
    if (workoutDays.length <= 1) {
      Alert.alert("Ошибка", "В плане должен быть хотя бы один день");
      return;
    }

    setWorkoutDays((prev) => prev.filter((day) => day.id !== dayId));
  };

  const updateWorkoutDayTitle = (dayId: string, newTitle: string) => {
    setWorkoutDays((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, title: newTitle } : day
      )
    );
  };

  const addExerciseToDay = (dayId: string, exercise: Exercise) => {
    setWorkoutDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const alreadyAdded = day.exercises.some(
          (item) => item.id === exercise.id
        );

        if (alreadyAdded) return day;

        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              ...exercise,
              sets: createDefaultSets(exercise),
            },
          ],
        };
      })
    );
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    setWorkoutDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            }
          : day
      )
    );
  };

  const addSetToExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            const lastSet = exercise.sets[exercise.sets.length - 1];

            return {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: `${Date.now()}-${exerciseId}`,
                  weight: lastSet?.weight || "",
                  reps: lastSet?.reps || String(exercise.defaultReps || 10),
                },
              ],
            };
          }),
        };
      })
    );
  };

  const removeSetFromExercise = (
    dayId: string,
    exerciseId: string,
    setId: string
  ) => {
    setWorkoutDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            if (exercise.sets.length <= 1) {
              Alert.alert(
                "Ошибка",
                "У упражнения должен быть хотя бы один подход"
              );
              return exercise;
            }

            return {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            };
          }),
        };
      })
    );
  };

  const updateExerciseSet = (
    dayId: string,
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setWorkoutDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            return {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            };
          }),
        };
      })
    );
  };

  const addNutritionDay = () => {
    setNutritionDays((prev) => [
      ...prev,
      {
        id: `${Date.now()}-nutrition-day-${prev.length + 1}`,
        title: `День ${prev.length + 1}`,
        meals: [],
      },
    ]);
  };

  const removeNutritionDay = (dayId: string) => {
    if (nutritionDays.length <= 1) {
      Alert.alert("Ошибка", "В плане должен быть хотя бы один день");
      return;
    }

    setNutritionDays((prev) => prev.filter((day) => day.id !== dayId));
  };

  const updateNutritionDayTitle = (dayId: string, newTitle: string) => {
    setNutritionDays((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, title: newTitle } : day
      )
    );
  };

  const addMealToDay = (dayId: string, mealType: string) => {
    setNutritionDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const alreadyAdded = day.meals.some(
          (meal) => meal.mealType === mealType
        );

        if (alreadyAdded) return day;

        return {
          ...day,
          meals: [
            ...day.meals,
            {
              id: `${Date.now()}-${mealType}`,
              mealType,
              foods: [],
            },
          ],
        };
      })
    );
  };

  const removeMealFromDay = (dayId: string, mealId: string) => {
    setNutritionDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              meals: day.meals.filter((meal) => meal.id !== mealId),
            }
          : day
      )
    );
  };

  const addFoodToMeal = (dayId: string, mealId: string, food: Food) => {
    setNutritionDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId) return meal;

            const alreadyAdded = meal.foods.some((item) => item.id === food.id);

            if (alreadyAdded) return meal;

            return {
              ...meal,
              foods: [...meal.foods, { ...food, grams: 100 }],
            };
          }),
        };
      })
    );
  };

  const removeFoodFromMeal = (
    dayId: string,
    mealId: string,
    foodId: string
  ) => {
    setNutritionDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          meals: day.meals.map((meal) =>
            meal.id === mealId
              ? {
                  ...meal,
                  foods: meal.foods.filter((food) => food.id !== foodId),
                }
              : meal
          ),
        };
      })
    );
  };

  const updateFoodGrams = (
    dayId: string,
    mealId: string,
    foodId: string,
    gramsValue: string
  ) => {
    const grams = Number(gramsValue.replace(",", "."));

    setNutritionDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId) return meal;

            return {
              ...meal,
              foods: meal.foods.map((food) =>
                food.id === foodId
                  ? {
                      ...food,
                      grams: Number.isNaN(grams) ? 0 : grams,
                    }
                  : food
              ),
            };
          }),
        };
      })
    );
  };

  const calculateFoodMacros = (food: { calories: number; protein: number; fat: number; carbs: number; grams: number }) => {
    const multiplier = food.grams / 100;

    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      fat: Math.round(food.fat * multiplier),
      carbs: Math.round(food.carbs * multiplier),
    };
  };

  const validateBaseInfo = () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Укажи название плана");
      return false;
    }

    if (!duration.trim()) {
      Alert.alert("Ошибка", "Укажи длительность плана");
      return false;
    }

    const priceNumber = Number(price.replace(",", "."));

    if (!price.trim() || Number.isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert("Ошибка", "Укажи корректную стоимость плана");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Ошибка", "Добавь описание плана");
      return false;
    }

    return true;
  };

  // Kept for the next step when plan item editing is wired to real exercises.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateWorkoutPlan = () => {
    for (const day of workoutDays) {
      if (!day.title.trim()) {
        Alert.alert("Ошибка", "Укажи название каждого дня");
        return false;
      }

      if (day.exercises.length === 0) {
        Alert.alert("Ошибка", `Добавь упражнения в день «${day.title}»`);
        return false;
      }

      for (const exercise of day.exercises) {
        for (const set of exercise.sets) {
          const reps = Number(set.reps.replace(",", "."));
          const weight = Number(set.weight.replace(",", "."));

          if (!set.reps.trim() || Number.isNaN(reps) || reps <= 0) {
            Alert.alert(
              "Ошибка",
              `Укажи корректные повторения в упражнении «${exercise.name}»`
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
    }

    return true;
  };

  // Kept for the next step when plan item editing is wired to real foods.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateNutritionPlan = () => {
    for (const day of nutritionDays) {
      if (!day.title.trim()) {
        Alert.alert("Ошибка", "Укажи название каждого дня питания");
        return false;
      }

      if (day.meals.length === 0) {
        Alert.alert("Ошибка", `Добавь приёмы пищи в день «${day.title}»`);
        return false;
      }

      for (const meal of day.meals) {
        if (meal.foods.length === 0) {
          Alert.alert(
            "Ошибка",
            `Добавь продукты в приём пищи «${meal.mealType}»`
          );
          return false;
        }

        for (const food of meal.foods) {
          if (food.grams <= 0) {
            Alert.alert(
              "Ошибка",
              `Укажи корректную граммовку продукта «${food.name}»`
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateBaseInfo()) return;

    const priceNumber = Number(price.replace(",", "."));
    const durationWeeks = Number(duration.replace(",", "."));

    if (selectedType === "Тренировочный план") {
      const workoutPlanPayload = {
        type: selectedType,
        title: title.trim(),
        duration: duration.trim(),
        price: priceNumber,
        description: description.trim(),
        days: workoutDays.map((day, dayIndex) => ({
          order: dayIndex + 1,
          title: day.title.trim(),
          exercises: day.exercises.map((exercise) => ({
            exerciseId: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            sets: exercise.sets.map((set, setIndex) => ({
              order: setIndex + 1,
              weight: set.weight.trim()
                ? Number(set.weight.replace(",", "."))
                : 0,
              reps: Number(set.reps.replace(",", ".")),
            })),
          })),
        })),
      };

      try {
        setIsSaving(true);
        await createWorkoutPlan({
          title: workoutPlanPayload.title,
          description: workoutPlanPayload.description,
          durationWeeks: Number.isNaN(durationWeeks) ? workoutDays.length : durationWeeks,
          price: priceNumber,
          isActive: true,
        });

        Alert.alert(
          "Тренировочный план создан",
          `Дней: ${workoutDays.length}\nСтоимость: ${priceNumber} ₽`,
          [
            {
              text: "Ок",
              onPress: () => router.back(),
            },
          ]
        );
      } catch (error) {
        Alert.alert(
          "Ошибка",
          error instanceof Error ? error.message : "Не удалось создать план"
        );
      } finally {
        setIsSaving(false);
      }

      return;
    }

    const nutritionPlanPayload = {
      type: selectedType,
      title: title.trim(),
      duration: duration.trim(),
      price: priceNumber,
      description: description.trim(),
      days: nutritionDays.map((day, dayIndex) => ({
        order: dayIndex + 1,
        title: day.title.trim(),
        meals: day.meals.map((meal) => ({
          mealType: meal.mealType,
          foods: meal.foods.map((food) => {
            const macros = calculateFoodMacros(food);

            return {
              foodId: food.id,
              name: food.name,
              grams: food.grams,
              calories: macros.calories,
              protein: macros.protein,
              fat: macros.fat,
              carbs: macros.carbs,
            };
          }),
        })),
      })),
    };

    try {
      setIsSaving(true);
      await createNutritionPlan({
        title: nutritionPlanPayload.title,
        description: nutritionPlanPayload.description,
        price: priceNumber,
        isActive: true,
      });

      Alert.alert(
        "План питания создан",
        `Дней: ${nutritionDays.length}\nСтоимость: ${priceNumber} ₽`,
        [
          {
            text: "Ок",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось создать план"
      );
    } finally {
      setIsSaving(false);
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
            <Text style={styles.screenTitle}>Создать план</Text>
            <Text style={styles.subtitle}>
              Создай полноценный план для пользователей
            </Text>
          </View>
        </View>

        <GlassCard style={styles.typeCard}>
          <Text style={styles.cardTitle}>Тип плана</Text>

          <View style={styles.typeGrid}>
            {planTypes.map((type) => {
              const active = selectedType === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[styles.typeButton, active && styles.typeButtonActive]}
                >
                  <Ionicons
                    name={
                      type === "План питания"
                        ? "restaurant-outline"
                        : "barbell-outline"
                    }
                    size={20}
                    color={active ? "#061014" : COLORS.primary}
                  />

                  <Text
                    style={[styles.typeText, active && styles.typeTextActive]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={styles.formCard}>
          <Text style={styles.cardTitle}>Основная информация</Text>

          <AppInput
            label="Название плана"
            placeholder="Например, Масса за 8 недель"
            value={title}
            onChangeText={setTitle}
          />

          <AppInput
            label="Длительность"
            placeholder="Например, 8 недель"
            value={duration}
            onChangeText={setDuration}
          />

          <AppInput
            label="Стоимость"
            placeholder="Например, 1490"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <AppInput
            label="Описание"
            placeholder="Опиши, для кого этот план и что в него входит"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </GlassCard>

        {isCatalogLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем упражнения и продукты...</Text>
          </GlassCard>
        ) : catalogError ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить справочники</Text>
            <Text style={styles.emptyText}>{catalogError}</Text>
            <AppButton title="Повторить" onPress={loadCatalogs} />
          </GlassCard>
        ) : null}

        {!isCatalogLoading && !catalogError && selectedType === "Тренировочный план" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Тренировочные дни</Text>

              <Pressable onPress={addWorkoutDay} style={styles.addSmallButton}>
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={styles.addSmallText}>День</Text>
              </Pressable>
            </View>

            {workoutDays.map((day, index) => (
              <WorkoutPlanDayEditor
                key={day.id}
                day={day}
                dayIndex={index}
                availableExercises={availableExercises}
                onUpdateDayTitle={updateWorkoutDayTitle}
                onRemoveDay={removeWorkoutDay}
                onAddExercise={addExerciseToDay}
                onRemoveExercise={removeExerciseFromDay}
                onAddSet={addSetToExercise}
                onRemoveSet={removeSetFromExercise}
                onUpdateSet={updateExerciseSet}
              />
            ))}
          </>
        ) : !isCatalogLoading && !catalogError ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Дни питания</Text>

              <Pressable onPress={addNutritionDay} style={styles.addSmallButton}>
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={styles.addSmallText}>День</Text>
              </Pressable>
            </View>

            {nutritionDays.map((day, index) => (
              <NutritionPlanDayEditor
                key={day.id}
                day={day}
                dayIndex={index}
                availableFoods={availableFoods}
                onUpdateDayTitle={updateNutritionDayTitle}
                onRemoveDay={removeNutritionDay}
                onAddMeal={addMealToDay}
                onRemoveMeal={removeMealFromDay}
                onAddFood={addFoodToMeal}
                onRemoveFood={removeFoodFromMeal}
                onUpdateFoodGrams={updateFoodGrams}
              />
            ))}
          </>
        ) : null}

        <AppButton
          title="Сохранить план"
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
  screenTitle: {
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
  typeCard: {
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 24,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 14,
  },
  typeGrid: {
    gap: 10,
  },
  typeButton: {
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  typeTextActive: {
    color: "#061014",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },
  addSmallButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    backgroundColor: "rgba(94,234,212,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addSmallText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  stateCard: {
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
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
  saveButton: {
    marginTop: 8,
  },
});
