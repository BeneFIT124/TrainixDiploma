import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import PlanCard from "@/components/trainers/PlanCard";

import { COLORS } from "@/constants/colors";
import { getPlans, PublicPlan } from "@/services/planService";

const planTypeLabel = {
  workout: "Тренировочный план",
  nutrition: "План питания",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Базовый",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export default function TrainersScreen() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlans();
      setPlans(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить планы"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Тренеры</Text>
          <Text style={styles.subtitle}>
            Выбирай опубликованные планы тренировок и питания от тренеров.
          </Text>
        </View>

        <GlassCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Каталог планов</Text>
          <Text style={styles.infoText}>
            Здесь отображаются только активные планы из backend. Если список
            пустой, тренеры еще не опубликовали планы.
          </Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Доступные планы</Text>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем планы...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadPlans} />
          </GlassCard>
        ) : plans.length === 0 ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Планов пока нет</Text>
            <Text style={styles.emptyText}>
              Когда тренеры опубликуют планы, они появятся здесь.
            </Text>
          </GlassCard>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={`${plan.type}-${plan.id}`}
              title={plan.title}
              type={planTypeLabel[plan.type]}
              difficulty={
                plan.type === "workout"
                  ? difficultyLabel[plan.difficultyLevel || "beginner"]
                  : "Питание"
              }
              duration={
                plan.durationWeeks
                  ? `${plan.durationWeeks} нед.`
                  : "По рациону"
              }
              price={plan.price}
              onPress={() => router.push(`/plans/${plan.type}-${plan.id}`)}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 130,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
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
