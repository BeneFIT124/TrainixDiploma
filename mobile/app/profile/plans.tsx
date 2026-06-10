import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import PurchasedPlanCard from "@/components/profile/PurchasedPlanCard";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyPurchasedPlans,
  getPlanRouteId,
  PurchasedPlan,
} from "@/services/planService";

const getTrainerName = (purchase: PurchasedPlan) => {
  const username = purchase.plan.trainerProfile?.user?.username;
  return typeof username === "string" && username.trim() ? username : "Тренер";
};

const planTypeLabel = {
  workout: "Тренировочный план",
  nutrition: "План питания",
};

export default function MyPlansScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PurchasedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?._id || user?.id || null;

  const loadPlans = useCallback(async () => {
    if (!userId) {
      setPlans([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyPurchasedPlans();
      setPlans(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить купленные планы"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

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
            <Text style={styles.title}>Мои планы</Text>
            <Text style={styles.subtitle}>
              Купленные программы тренировок и питания
            </Text>
          </View>
        </View>

        <GlassCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Доступные планы</Text>
          <Text style={styles.infoText}>
            После покупки планы остаются доступными здесь.
          </Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Купленные планы</Text>

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
            <Text style={styles.emptyTitle}>Купленных планов пока нет</Text>
            <Text style={styles.emptyText}>
              Купи план в каталоге, и он появится в этом разделе.
            </Text>
          </GlassCard>
        ) : (
          plans.map((purchase) => (
            <PurchasedPlanCard
              key={purchase.purchaseId}
              title={purchase.plan.title}
              type={planTypeLabel[purchase.plan.type]}
              trainerName={getTrainerName(purchase)}
              purchaseDate={new Date(purchase.purchaseDate).toLocaleDateString(
                "ru-RU"
              )}
              status={purchase.status === "active" ? "Активен" : purchase.status}
              onPress={() => {
                const routeId = getPlanRouteId(purchase.plan);
                console.log("Переход к купленному плану", {
                  purchase,
                  routeId,
                });

                if (routeId) {
                  router.push({
                    pathname: "/profile/plans/[id]",
                    params: {
                      id: routeId,
                      purchaseId: purchase.purchaseId,
                    },
                  });
                }
              }}
            />
          ))
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
