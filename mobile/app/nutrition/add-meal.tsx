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
import { SelectedMealFood, useMealBuilderStore } from "@/store/mealBuilderStore";
import {
  addMealItem,
  createMeal,
  mealTypeValues,
  MealType,
} from "@/services/nutritionService";

const mealTypes = ["Завтрак", "Обед", "Ужин", "Перекус"];

export default function AddMealScreen() {
  const { selectedFoods, removeFood, updateGrams, clearMeal } =
    useMealBuilderStore();
  const [selectedMealType, setSelectedMealType] = useState(mealTypes[0]);
  const [isSaving, setIsSaving] = useState(false);

  const calculateFoodMacros = (food: SelectedMealFood) => {
    const multiplier = food.grams / 100;

    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      fat: Math.round(food.fat * multiplier),
      carbs: Math.round(food.carbs * multiplier),
    };
  };

  const totals = selectedFoods.reduce(
    (acc, food) => {
      const macros = calculateFoodMacros(food);

      return {
        calories: acc.calories + macros.calories,
        protein: acc.protein + macros.protein,
        fat: acc.fat + macros.fat,
        carbs: acc.carbs + macros.carbs,
      };
    },
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    }
  );

  const handleSave = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert("Ошибка", "Добавь хотя бы один продукт");
      return;
    }

    const hasInvalidGrams = selectedFoods.some((food) => food.grams <= 0);

    if (hasInvalidGrams) {
      Alert.alert("Ошибка", "Граммовка должна быть больше 0");
      return;
    }

    try {
      setIsSaving(true);

      const meal = await createMeal({
        mealType: (mealTypeValues[selectedMealType] || "breakfast") as MealType,
        date: new Date().toISOString(),
      });

      for (const food of selectedFoods) {
        await addMealItem(meal._id, {
          foodId: food._id || food.id,
          grams: food.grams,
        });
      }

      Alert.alert(
        `${selectedMealType} сохранен`,
        `Калории: ${totals.calories} ккал\nБелки: ${totals.protein} г\nЖиры: ${totals.fat} г\nУглеводы: ${totals.carbs} г`,
        [
          {
            text: "Ок",
            onPress: () => {
              clearMeal();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить прием пищи"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Отмена", "Очистить текущий прием пищи?", [
      {
        text: "Нет",
        style: "cancel",
      },
      {
        text: "Очистить",
        style: "destructive",
        onPress: () => {
          clearMeal();
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
            <Text style={styles.title}>Добавить питание</Text>
            <Text style={styles.subtitle}>Добавь продукты и укажи граммы</Text>
          </View>
        </View>

        <GlassCard style={styles.mealTypeCard}>
          <Text style={styles.mealTypeTitle}>Тип приема пищи</Text>

          <View style={styles.mealTypesGrid}>
            {mealTypes.map((type) => {
              const active = selectedMealType === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedMealType(type)}
                  style={[
                    styles.mealTypeButton,
                    active && styles.mealTypeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      active && styles.mealTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Итого</Text>

          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesValue}>{totals.calories}</Text>
            <Text style={styles.caloriesLabel}>ккал</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.protein} г</Text>
              <Text style={styles.macroLabel}>Белки</Text>
            </View>

            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.fat} г</Text>
              <Text style={styles.macroLabel}>Жиры</Text>
            </View>

            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.carbs} г</Text>
              <Text style={styles.macroLabel}>Углеводы</Text>
            </View>
          </View>

          <AppButton
            title="Добавить продукт"
            onPress={() => router.push("/nutrition/select-food")}
            style={styles.addFoodButton}
          />
        </GlassCard>

        {selectedFoods.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="restaurant-outline"
                size={30}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>Продукты еще не добавлены</Text>
            <Text style={styles.emptyText}>
              Нажми “Добавить продукт”, найди нужную еду и укажи граммовку.
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Продукты приема пищи</Text>

            <GlassCard style={styles.selectedCard}>
              {selectedFoods.map((food) => {
                const macros = calculateFoodMacros(food);

                return (
                  <View key={food.id} style={styles.selectedFood}>
                    <View style={styles.selectedHeader}>
                      <View style={styles.selectedInfo}>
                        <Text style={styles.selectedName}>{food.name}</Text>
                        <Text style={styles.selectedMeta}>
                          {macros.calories} ккал • Б {macros.protein} г • Ж{" "}
                          {macros.fat} г • У {macros.carbs} г
                        </Text>
                      </View>

                      <Pressable onPress={() => removeFood(food.id)}>
                        <Ionicons name="close" size={22} color={COLORS.error} />
                      </Pressable>
                    </View>

                    <View style={styles.gramsRow}>
                      <Text style={styles.gramsLabel}>Граммы</Text>

                      <TextInput
                        value={String(food.grams)}
                        onChangeText={(value) => updateGrams(food.id, value)}
                        keyboardType="decimal-pad"
                        style={styles.gramsInput}
                        placeholder="100"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                );
              })}
            </GlassCard>
          </>
        )}

        <AppButton
          title={
            selectedFoods.length > 0
              ? `Сохранить прием пищи (${selectedFoods.length})`
              : "Сохранить прием пищи"
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
  },
  mealTypeCard: {
    marginBottom: 16,
  },
  mealTypeTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 14,
  },
  mealTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeButton: {
    flexGrow: 1,
    minWidth: "45%",
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealTypeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  mealTypeTextActive: {
    color: "#061014",
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 10,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  caloriesValue: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: "900",
    marginRight: 8,
  },
  caloriesLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 7,
  },
  macrosRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  macroItem: {
    flex: 1,
  },
  macroValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  macroLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  addFoodButton: {
    marginTop: 2,
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
  selectedCard: {
    marginBottom: 24,
  },
  selectedFood: {
    marginBottom: 18,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  selectedMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  gramsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gramsLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  gramsInput: {
    width: 96,
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
  saveButton: {
    marginTop: 12,
  },
});
