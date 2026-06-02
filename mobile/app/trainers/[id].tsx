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
import PlanCard from "@/components/trainers/PlanCard";

import { COLORS } from "@/constants/colors";
import {
  getPlans,
  getTrainerPlans as getTrainerPublicPlans,
  PublicPlan,
} from "@/services/planService";
import {
  getTrainerProfileById,
  TrainerProfile,
} from "@/services/trainerService";

const planTypeLabel = {
  workout: "Тренировочный план",
  nutrition: "План питания",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Базовый",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const getPlanTrainerProfile = (plan: PublicPlan) => {
  return typeof plan.trainerProfile === "object" && plan.trainerProfile
    ? plan.trainerProfile
    : null;
};

const getPlanTrainerId = (plan: PublicPlan) => {
  const profile = getPlanTrainerProfile(plan);
  return String(profile?._id || profile?.id || plan.trainerProfile || "");
};

const getTrainerUser = (trainer: TrainerProfile | null) => {
  return typeof trainer?.user === "object" && trainer.user ? trainer.user : null;
};

const getTrainerEmbeddedPlans = (trainer: TrainerProfile | null) => [
  ...(trainer?.workoutPlans || []),
  ...(trainer?.nutritionPlans || []),
];

const buildTrainerFromPlan = (
  trainerId: string,
  plans: PublicPlan[]
): TrainerProfile | null => {
  const plan = plans.find((item) => getPlanTrainerId(item) === trainerId);
  const profile = plan ? getPlanTrainerProfile(plan) : null;

  if (!profile) {
    return null;
  }

  return {
    _id: String(profile._id || profile.id || trainerId),
    user:
      typeof profile.user === "object" && profile.user
        ? profile.user
        : {
            _id: String(profile.user || trainerId),
            username: "Тренер",
            email: "",
            role: "trainer",
          },
    bio: profile.bio || null,
    specialization: profile.specialization || "Фитнес",
    experienceYears: profile.experienceYears || 0,
    isVerified: profile.isVerified ?? true,
    ratingAvg: profile.ratingAvg || 0,
    reviewsCount: profile.reviewsCount || 0,
    workoutPlans: plans.filter((item) => item.type === "workout"),
    nutritionPlans: plans.filter((item) => item.type === "nutrition"),
  };
};

export default function TrainerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const trainerId = Array.isArray(id) ? id[0] : id;

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrainer = useCallback(async () => {
    if (!trainerId) {
      setError("Профиль тренера не найден");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [trainerResult, trainerPlansResult] = await Promise.allSettled([
        getTrainerProfileById(String(trainerId)),
        getTrainerPublicPlans(String(trainerId)),
      ]);

      let trainerData =
        trainerResult.status === "fulfilled" ? trainerResult.value : null;
      let trainerPlans =
        trainerPlansResult.status === "fulfilled" ? trainerPlansResult.value : [];
      const embeddedPlans = getTrainerEmbeddedPlans(trainerData);

      if (trainerPlans.length === 0 && embeddedPlans.length > 0) {
        trainerPlans = embeddedPlans;
      }

      if (!trainerData || trainerPlans.length === 0) {
        try {
          const plansData = await getPlans();
          const plansFromCatalog = plansData.filter(
            (plan) => getPlanTrainerId(plan) === String(trainerId)
          );

          if (!trainerData) {
            trainerData = buildTrainerFromPlan(String(trainerId), plansFromCatalog);
          }

          if (trainerPlans.length === 0) {
            trainerPlans = plansFromCatalog;
          }
        } catch (catalogError) {
          if (!trainerData) {
            throw catalogError;
          }
        }
      }

      if (!trainerData) {
        setError("Профиль тренера не найден");
      }

      setTrainer(trainerData);
      setPlans(trainerPlans);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить профиль тренера"
      );
    } finally {
      setIsLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    loadTrainer();
  }, [loadTrainer]);

  const user = getTrainerUser(trainer);
  const trainerName = user?.username || "Тренер";
  const prices = plans.map((plan) => plan.price).filter((price) => price > 0);
  const priceFrom = prices.length > 0 ? Math.min(...prices) : 0;

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

          <Text style={styles.headerTitle}>Профиль тренера</Text>
        </View>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем тренера...</Text>
          </GlassCard>
        ) : error || !trainer ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось открыть тренера</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadTrainer} />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {trainerName[0]?.toUpperCase() || "Т"}
                </Text>
              </View>

              <View style={styles.nameRow}>
                <Text style={styles.name}>{trainerName}</Text>
                {trainer.isVerified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.primary}
                  />
                ) : null}
              </View>

              <Text style={styles.specialization}>
                {trainer.specialization || "Фитнес"}
              </Text>

              {trainer.bio ? <Text style={styles.bio}>{trainer.bio}</Text> : null}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {trainer.experienceYears || 0}
                  </Text>
                  <Text style={styles.statLabel}>лет опыта</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>★ {trainer.ratingAvg || 0}</Text>
                  <Text style={styles.statLabel}>
                    {trainer.reviewsCount || 0} отзывов
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{plans.length}</Text>
                  <Text style={styles.statLabel}>планов</Text>
                </View>
              </View>

              {priceFrom > 0 ? (
                <Text style={styles.price}>Планы от {priceFrom} ₽</Text>
              ) : null}
            </GlassCard>

            <Text style={styles.sectionTitle}>Планы тренера</Text>

            {plans.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Планов пока нет</Text>
                <Text style={styles.emptyText}>
                  Этот тренер еще не опубликовал активные планы.
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
                    plan.durationWeeks ? `${plan.durationWeeks} нед.` : "По рациону"
                  }
                  price={plan.price}
                  trainerName={trainerName}
                  onPress={() => router.push(`/plans/${plan.type}-${plan.id}`)}
                />
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
  profileCard: {
    alignItems: "center",
    marginBottom: 22,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#061014",
    fontSize: 32,
    fontWeight: "900",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  name: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  specialization: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
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
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  price: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
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
