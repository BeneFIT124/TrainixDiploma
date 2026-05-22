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
import { Food } from "@/store/mealBuilderStore";

const availableFoods: Food[] = [];

export type PlanMealFood = Food & {
  grams: number;
};

export type PlanMeal = {
  id: string;
  mealType: string;
  foods: PlanMealFood[];
};

export type NutritionPlanDay = {
  id: string;
  title: string;
  meals: PlanMeal[];
};

type NutritionPlanDayEditorProps = {
  day: NutritionPlanDay;
  dayIndex: number;
  onUpdateDayTitle: (dayId: string, title: string) => void;
  onRemoveDay: (dayId: string) => void;
  onAddMeal: (dayId: string, mealType: string) => void;
  onRemoveMeal: (dayId: string, mealId: string) => void;
  onAddFood: (dayId: string, mealId: string, food: Food) => void;
  onRemoveFood: (dayId: string, mealId: string, foodId: string) => void;
  onUpdateFoodGrams: (
    dayId: string,
    mealId: string,
    foodId: string,
    gramsValue: string
  ) => void;
};

const mealTypes = ["Завтрак", "Обед", "Ужин", "Перекус"];
const foodCategories = ["Все", "Мясо", "Крупы", "Фрукты"];

export default function NutritionPlanDayEditor({
  day,
  dayIndex,
  onUpdateDayTitle,
  onRemoveDay,
  onAddMeal,
  onRemoveMeal,
  onAddFood,
  onRemoveFood,
  onUpdateFoodGrams,
}: NutritionPlanDayEditorProps) {
  const [openedMealId, setOpenedMealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredFoods = useMemo(() => {
    return availableFoods.filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesCategory =
        selectedCategory === "Все" || food.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const existingMealTypes = day.meals.map((meal) => meal.mealType);

  const calculateFoodMacros = (food: PlanMealFood) => {
    const multiplier = food.grams / 100;

    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      fat: Math.round(food.fat * multiplier),
      carbs: Math.round(food.carbs * multiplier),
    };
  };

  const calculateMealTotals = (meal: PlanMeal) => {
    return meal.foods.reduce(
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
  };

  const calculateDayTotals = () => {
    return day.meals.reduce(
      (acc, meal) => {
        const totals = calculateMealTotals(meal);

        return {
          calories: acc.calories + totals.calories,
          protein: acc.protein + totals.protein,
          fat: acc.fat + totals.fat,
          carbs: acc.carbs + totals.carbs,
        };
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      }
    );
  };

  const dayTotals = calculateDayTotals();

  const isFoodAdded = (meal: PlanMeal, foodId: string) => {
    return meal.foods.some((food) => food.id === foodId);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.dayHeader}>
        <View style={styles.dayNumber}>
          <Text style={styles.dayNumberText}>{dayIndex + 1}</Text>
        </View>

        <View style={styles.dayTitleBox}>
          <Text style={styles.dayLabel}>День питания</Text>

          <TextInput
            value={day.title}
            onChangeText={(value) => onUpdateDayTitle(day.id, value)}
            placeholder="Например, День 1"
            placeholderTextColor={COLORS.textMuted}
            style={styles.dayTitleInput}
          />
        </View>

        <Pressable onPress={() => onRemoveDay(day.id)}>
          <Ionicons name="trash-outline" size={22} color={COLORS.error} />
        </Pressable>
      </View>

      <View style={styles.dayTotals}>
        <Text style={styles.dayTotalsTitle}>Итого за день</Text>

        <View style={styles.dayTotalsRow}>
          <Text style={styles.dayTotalValue}>{dayTotals.calories} ккал</Text>
          <Text style={styles.dayTotalMacro}>Б {dayTotals.protein} г</Text>
          <Text style={styles.dayTotalMacro}>Ж {dayTotals.fat} г</Text>
          <Text style={styles.dayTotalMacro}>У {dayTotals.carbs} г</Text>
        </View>
      </View>

      <Text style={styles.blockTitle}>Приёмы пищи</Text>

      <View style={styles.mealTypesGrid}>
        {mealTypes.map((type) => {
          const disabled = existingMealTypes.includes(type);

          return (
            <Pressable
              key={type}
              disabled={disabled}
              onPress={() => onAddMeal(day.id, type)}
              style={[
                styles.mealTypeButton,
                disabled && styles.mealTypeButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.mealTypeText,
                  disabled && styles.mealTypeTextDisabled,
                ]}
              >
                {type}
              </Text>

              {disabled && <Text style={styles.disabledLabel}>добавлен</Text>}
            </Pressable>
          );
        })}
      </View>

      {day.meals.map((meal) => {
        const mealTotals = calculateMealTotals(meal);
        const isPickerOpen = openedMealId === meal.id;

        return (
          <View key={meal.id} style={styles.mealBlock}>
            <View style={styles.mealHeader}>
              <View style={styles.mealIcon}>
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.mealInfo}>
                <Text style={styles.mealTitle}>{meal.mealType}</Text>
                <Text style={styles.mealMeta}>
                  {mealTotals.calories} ккал • Б {mealTotals.protein} г • Ж{" "}
                  {mealTotals.fat} г • У {mealTotals.carbs} г
                </Text>
              </View>

              <Pressable onPress={() => onRemoveMeal(day.id, meal.id)}>
                <Ionicons name="close" size={22} color={COLORS.error} />
              </Pressable>
            </View>

            {meal.foods.length > 0 && (
              <View style={styles.foodsBlock}>
                {meal.foods.map((food) => {
                  const macros = calculateFoodMacros(food);

                  return (
                    <View key={food.id} style={styles.foodRow}>
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodMeta}>
                          {macros.calories} ккал • Б {macros.protein} г • Ж{" "}
                          {macros.fat} г • У {macros.carbs} г
                        </Text>
                      </View>

                      <TextInput
                        value={String(food.grams)}
                        onChangeText={(value) =>
                          onUpdateFoodGrams(day.id, meal.id, food.id, value)
                        }
                        keyboardType="decimal-pad"
                        placeholder="100"
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.gramsInput}
                      />

                      <Pressable
                        onPress={() => onRemoveFood(day.id, meal.id, food.id)}
                        style={styles.removeFoodButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={COLORS.error}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable
              onPress={() => {
                setOpenedMealId(isPickerOpen ? null : meal.id);
                setSearchQuery("");
              }}
              style={styles.addFoodButton}
            >
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.addFoodText}>Добавить продукт</Text>
            </Pressable>

            {isPickerOpen && (
              <View style={styles.foodPicker}>
                <View style={styles.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={COLORS.textMuted}
                  />

                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Поиск продукта"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.searchInput}
                  />
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filters}
                >
                  {foodCategories.map((category) => {
                    const active = selectedCategory === category;

                    return (
                      <Pressable
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        style={[
                          styles.filterChip,
                          active && styles.filterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterText,
                            active && styles.filterTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {filteredFoods.map((food) => {
                  const added = isFoodAdded(meal, food.id);

                  return (
                    <Pressable
                      key={food.id}
                      disabled={added}
                      onPress={() => {
                        onAddFood(day.id, meal.id, food);
                        setOpenedMealId(null);
                        setSearchQuery("");
                      }}
                      style={[
                        styles.pickFoodCard,
                        added && styles.disabledCard,
                      ]}
                    >
                      <View style={styles.pickFoodInfo}>
                        <Text
                          style={[
                            styles.pickFoodName,
                            added && styles.disabledText,
                          ]}
                        >
                          {food.name}
                        </Text>

                        <Text style={styles.pickFoodMeta}>
                          {food.category} • {food.calories} ккал / 100 г
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
          </View>
        );
      })}
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
  dayTotals: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    marginBottom: 18,
  },
  dayTotalsTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  dayTotalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayTotalValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  dayTotalMacro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  blockTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  mealTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  mealTypeButton: {
    flexGrow: 1,
    minWidth: "45%",
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  mealTypeButtonDisabled: {
    opacity: 0.45,
  },
  mealTypeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  mealTypeTextDisabled: {
    color: COLORS.textMuted,
  },
  disabledLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  mealBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  mealIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  mealMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  foodsBlock: {
    marginBottom: 12,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },
  foodMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  gramsInput: {
    width: 74,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: COLORS.text,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
  },
  removeFoodButton: {
    width: 34,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(251,113,133,0.10)",
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  addFoodButton: {
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
  addFoodText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  foodPicker: {
    marginTop: 14,
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
  pickFoodCard: {
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
  pickFoodInfo: {
    flex: 1,
  },
  pickFoodName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  pickFoodMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
