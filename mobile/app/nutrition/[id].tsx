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
  getMealById,
  getMealItems,
  Meal,
  MealItem,
  mealTypeLabels,
} from "@/services/nutritionService";

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams();
  const mealId = Array.isArray(id) ? id[0] : id;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [items, setItems] = useState<MealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeal = useCallback(async () => {
    if (!mealId) {
      setError("Прием пищи не найден");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [mealData, itemData] = await Promise.all([
        getMealById(mealId),
        getMealItems(mealId),
      ]);

      setMeal(mealData);
      setItems(itemData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить прием пищи"
      );
    } finally {
      setIsLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    loadMeal();
  }, [loadMeal]);

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

          <Text style={styles.headerTitle}>Прием пищи</Text>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем прием пищи...</Text>
          </GlassCard>
        ) : error || !meal ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось открыть прием пищи</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadMeal} />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.heroCard}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="restaurant-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>
                {mealTypeLabels[meal.mealType] || meal.mealType}
              </Text>
              <Text style={styles.date}>
                {new Date(meal.date).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(meal.totalCalories || 0)}
                  </Text>
                  <Text style={styles.statLabel}>ккал</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{items.length}</Text>
                  <Text style={styles.statLabel}>продуктов</Text>
                </View>
              </View>
            </GlassCard>

            <Text style={styles.sectionTitle}>Продукты</Text>

            {items.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Продуктов нет</Text>
                <Text style={styles.emptyText}>
                  В этом приеме пищи пока нет добавленных продуктов.
                </Text>
              </GlassCard>
            ) : (
              items.map((item) => (
                <GlassCard key={item._id} style={styles.foodCard}>
                  <View style={styles.foodHeader}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{item.food.name}</Text>
                      <Text style={styles.foodMeta}>{item.grams} г</Text>
                    </View>

                    <Text style={styles.foodCalories}>
                      {Math.round(item.calories)} ккал
                    </Text>
                  </View>

                  <View style={styles.macrosRow}>
                    <Text style={styles.macro}>Б: {Math.round(item.protein)} г</Text>
                    <Text style={styles.macro}>Ж: {Math.round(item.fat)} г</Text>
                    <Text style={styles.macro}>У: {Math.round(item.carbs)} г</Text>
                  </View>
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
  foodCard: {
    marginBottom: 14,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  foodMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  foodCalories: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 14,
  },
  macro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
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
