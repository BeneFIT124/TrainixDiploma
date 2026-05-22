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
import { Food, getFoods } from "@/services/nutritionService";
import { useMealBuilderStore } from "@/store/mealBuilderStore";

const allFilter = "Все";

export default function SelectFoodScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(allFilter);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedFoods, addFood } = useMealBuilderStore();

  const loadFoods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFoods();
      setFoods(
        data.map((food) => ({
          ...food,
          id: food._id || food.id,
          category: food.category || "Продукты",
        }))
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить продукты"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const foodCategories = useMemo(() => {
    const categories = foods.map((food) => food.category).filter(Boolean) as string[];
    return [allFilter, ...Array.from(new Set(categories))];
  }, [foods]);

  const isAlreadyAdded = (foodId: string) => {
    return selectedFoods.some((food) => food.id === foodId);
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesCategory =
        selectedCategory === allFilter || food.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, selectedCategory]);

  const handleAddFood = (food: Food) => {
    addFood({
      id: food._id || food.id || food.name,
      _id: food._id,
      name: food.name,
      category: food.category || "Продукты",
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
    });
    router.back();
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
            <Text style={styles.title}>Выбор продукта</Text>
            <Text style={styles.subtitle}>
              Найди продукт через поиск или категорию
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск продукта"
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
            <Text style={styles.stateText}>Загружаем продукты...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadFoods} />
          </GlassCard>
        ) : (
          <>
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
                    style={[styles.filterChip, active && styles.filterChipActive]}
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

            <Text style={styles.sectionTitle}>Найдено: {filteredFoods.length}</Text>

            {filteredFoods.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="search-outline" size={30} color={COLORS.primary} />
                <Text style={styles.emptyTitle}>Ничего не найдено</Text>
                <Text style={styles.emptyText}>
                  Попробуй изменить запрос или выбрать другую категорию.
                </Text>
              </GlassCard>
            ) : (
              filteredFoods.map((food) => {
                const foodId = food._id || food.id || food.name;
                const alreadyAdded = isAlreadyAdded(foodId);

                return (
                  <Pressable
                    key={foodId}
                    onPress={() => !alreadyAdded && handleAddFood(food)}
                    style={[
                      styles.foodCard,
                      alreadyAdded && styles.foodCardDisabled,
                    ]}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons
                        name="nutrition-outline"
                        size={22}
                        color={alreadyAdded ? COLORS.textMuted : COLORS.primary}
                      />
                    </View>

                    <View style={styles.foodInfo}>
                      <Text
                        style={[
                          styles.foodName,
                          alreadyAdded && styles.foodNameDisabled,
                        ]}
                      >
                        {food.name}
                      </Text>

                      <Text style={styles.foodMeta}>
                        {food.category || "Продукты"} • {food.calories} ккал / 100 г
                      </Text>

                      <Text style={styles.foodMeta}>
                        Б {food.protein} г • Ж {food.fat} г • У {food.carbs} г
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.addButton,
                        alreadyAdded && styles.addButtonDisabled,
                      ]}
                    >
                      <Ionicons
                        name={alreadyAdded ? "checkmark" : "add"}
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
  foodCard: {
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
  foodCardDisabled: {
    opacity: 0.55,
  },
  foodIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  foodNameDisabled: {
    color: COLORS.textMuted,
  },
  foodMeta: {
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
