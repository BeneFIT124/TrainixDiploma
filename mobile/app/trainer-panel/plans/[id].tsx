import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import {
  deleteNutritionPlan,
  deleteWorkoutPlan,
  getPlanById,
  PlanType,
  PublicPlan,
  updateNutritionPlan,
  updateWorkoutPlan,
} from "@/services/planService";

const isPlanType = (type: string): type is PlanType => {
  return type === "workout" || type === "nutrition";
};

export default function TrainerPlanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id || "";
    const [type, ...idParts] = rawId.split("-");
    return {
      type,
      planId: idParts.join("-"),
      rawId,
    };
  }, [id]);

  const loadPlan = useCallback(async () => {
    if (
      !isPlanType(parsed.type) ||
      !parsed.planId ||
      parsed.planId === "undefined"
    ) {
      console.warn("Не удалось открыть план тренера: отсутствует идентификатор", {
        routeParam: parsed.rawId,
        parsed,
      });
      setError("Не удалось открыть план: отсутствует идентификатор плана");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlanById(parsed.type, parsed.planId);
      setPlan(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Не удалось загрузить план"
      );
    } finally {
      setIsLoading(false);
    }
  }, [parsed]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleChangeStatus = async () => {
    if (!plan) {
      return;
    }

    try {
      setIsSaving(true);
      const nextIsActive = !plan.isActive;

      const updatedPlan =
        plan.type === "workout"
          ? await updateWorkoutPlan(plan.id, { isActive: nextIsActive })
          : await updateNutritionPlan(plan.id, { isActive: nextIsActive });

      setPlan({ ...plan, isActive: updatedPlan.isActive });
      Alert.alert("Готово", "Статус плана изменен");
    } catch (saveError) {
      Alert.alert(
        "Ошибка",
        saveError instanceof Error ? saveError.message : "Не удалось изменить план"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!plan) {
      return;
    }

    Alert.alert("Удалить план", "Это действие нельзя отменить.", [
      {
        text: "Отмена",
        style: "cancel",
      },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSaving(true);
            if (plan.type === "workout") {
              await deleteWorkoutPlan(plan.id);
            } else {
              await deleteNutritionPlan(plan.id);
            }
            router.back();
          } catch (deleteError) {
            Alert.alert(
              "Ошибка",
              deleteError instanceof Error
                ? deleteError.message
                : "Не удалось удалить план"
            );
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  const isNutritionPlan = plan?.type === "nutrition";

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

          <View style={styles.headerText}>
            <Text style={styles.screenTitle}>Детали плана</Text>
            <Text style={styles.subtitle}>Просмотр структуры и статуса</Text>
          </View>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем план...</Text>
          </GlassCard>
        ) : error || !plan ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить план</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadPlan} />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.heroCard}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={isNutritionPlan ? "restaurant-outline" : "barbell-outline"}
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.planType}>
                {isNutritionPlan ? "План питания" : "Тренировочный план"}
              </Text>
              <Text style={styles.title}>{plan.title}</Text>

              <View
                style={[
                  styles.statusBadge,
                  plan.isActive ? styles.statusPublished : styles.statusDraft,
                ]}
              >
                <Text style={styles.statusText}>
                  {plan.isActive ? "Опубликован" : "Черновик"}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{plan.price} ₽</Text>
                  <Text style={styles.statLabel}>стоимость</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {isNutritionPlan ? plan.items?.length || 0 : plan.days?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>
                    {isNutritionPlan ? "элементов" : "дней"}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Описание</Text>
              <Text style={styles.description}>
                {plan.description || "Описание пока не добавлено."}
              </Text>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Состав плана</Text>
              {isNutritionPlan ? (
                (plan.items || []).length === 0 ? (
                  <Text style={styles.description}>
                    В этом плане питания пока нет элементов
                  </Text>
                ) : (
                  (plan.items || []).map((item) => (
                    <View key={item._id || item.id} style={styles.planItem}>
                      <Text style={styles.planItemTitle}>
                        {item.food?.name || "Продукт"}
                      </Text>
                      <Text style={styles.planItemMeta}>
                        {item.grams || 0} г • {item.calories || 0} ккал
                      </Text>
                    </View>
                  ))
                )
              ) : (plan.days || []).length === 0 ? (
                <Text style={styles.description}>
                  В этом тренировочном плане пока нет дней
                </Text>
              ) : (
                (plan.days || []).map((day) => (
                  <View key={day.id || day._id} style={styles.planItem}>
                    <Text style={styles.planItemTitle}>{day.title}</Text>
                    <Text style={styles.planItemMeta}>
                      {(day.exercises || []).length} упражнений
                    </Text>
                  </View>
                ))
              )}
            </GlassCard>

            <View style={styles.actions}>
              <AppButton
                title={
                  plan.isActive ? "Снять с публикации" : "Опубликовать план"
                }
                onPress={handleChangeStatus}
                loading={isSaving}
              />

              <AppButton
                title="Удалить план"
                onPress={handleDelete}
                variant="secondary"
              />
            </View>
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
  },
  heroCard: {
    alignItems: "center",
    marginBottom: 16,
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
  planType: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusPublished: {
    backgroundColor: "rgba(94,234,212,0.12)",
    borderColor: "rgba(94,234,212,0.28)",
  },
  statusDraft: {
    backgroundColor: "rgba(250,204,21,0.10)",
    borderColor: "rgba(250,204,21,0.25)",
  },
  statusText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  planItem: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  planItemTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  planItemMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  actions: {
    gap: 12,
    marginTop: 8,
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
