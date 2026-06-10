import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import PlanCard from "@/components/trainers/PlanCard";
import TrainerCard from "@/components/trainers/TrainerCard";

import { COLORS } from "@/constants/colors";
import { getPlanRouteId, getPlans, PublicPlan } from "@/services/planService";
import { getTrainerProfiles, TrainerProfile } from "@/services/trainerService";

const getPlanTrainerProfile = (plan: PublicPlan) => {
  return typeof plan.trainerProfile === "object" && plan.trainerProfile
    ? plan.trainerProfile
    : null;
};

const getTrainerUser = (trainer: TrainerProfile) => {
  return typeof trainer.user === "object" && trainer.user ? trainer.user : null;
};

const getTrainerName = (trainer: TrainerProfile) => {
  return getTrainerUser(trainer)?.username || "Тренер";
};

const getTrainerEmbeddedPlans = (trainer: TrainerProfile) => [
  ...(trainer.workoutPlans || []),
  ...(trainer.nutritionPlans || []),
];

const getPlanTrainerId = (plan: PublicPlan) => {
  const profile = getPlanTrainerProfile(plan);
  return String(profile?._id || profile?.id || plan.trainerProfile || "");
};

const getPlanTrainerName = (
  plan: PublicPlan,
  trainersData: TrainerProfile[]
) => {
  const profile = getPlanTrainerProfile(plan);
  const user = typeof profile?.user === "object" ? profile.user : null;

  if (user?.username) {
    return user.username;
  }

  const trainer = trainersData.find(
    (item) => String(item._id) === getPlanTrainerId(plan)
  );

  return trainer ? getTrainerName(trainer) : undefined;
};

const buildTrainersFromPlans = (plansData: PublicPlan[]): TrainerProfile[] => {
  const profiles = new Map<string, TrainerProfile>();

  plansData.forEach((plan) => {
    const profile = getPlanTrainerProfile(plan);
    const profileId = profile?._id || profile?.id;

    if (!profileId) {
      return;
    }

    const profileKey = String(profileId);
    const existingProfile = profiles.get(profileKey);

    if (existingProfile) {
      if (plan.type === "workout") {
        existingProfile.workoutPlans = [
          ...(existingProfile.workoutPlans || []),
          plan,
        ];
      } else {
        existingProfile.nutritionPlans = [
          ...(existingProfile.nutritionPlans || []),
          plan,
        ];
      }
      return;
    }

    profiles.set(profileKey, {
      _id: String(profileId),
      user:
        typeof profile.user === "object" && profile.user
          ? profile.user
          : {
              _id: String(profile.user || profileId),
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
      workoutPlans: plan.type === "workout" ? [plan] : [],
      nutritionPlans: plan.type === "nutrition" ? [plan] : [],
    });
  });

  return Array.from(profiles.values());
};

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
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [plansResult, trainersResult] = await Promise.allSettled([
        getPlans(),
        getTrainerProfiles(),
      ]);

      if (plansResult.status === "rejected" && trainersResult.status === "rejected") {
        throw plansResult.reason || trainersResult.reason;
      }

      const plansData =
        plansResult.status === "fulfilled" ? plansResult.value : [];
      const trainersData =
        trainersResult.status === "fulfilled" ? trainersResult.value : [];
      const embeddedPlans = trainersData.flatMap(getTrainerEmbeddedPlans);
      const nextPlans = plansData.length > 0 ? plansData : embeddedPlans;

      setTrainers(
        trainersData.length > 0 ? trainersData : buildTrainersFromPlans(nextPlans)
      );
      setPlans(nextPlans);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить тренеров и планы"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getTrainerCatalogPlans = (trainer: TrainerProfile) => {
    const embeddedPlans = getTrainerEmbeddedPlans(trainer);

    if (embeddedPlans.length > 0) {
      return embeddedPlans;
    }

    return plans.filter((plan) => getPlanTrainerId(plan) === String(trainer._id));
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Тренеры</Text>
          <Text style={styles.subtitle}>
            Выбирай тренера или опубликованный план тренировок и питания.
          </Text>
        </View>

        <GlassCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Каталог тренеров</Text>
          <Text style={styles.infoText}>
            Здесь отображаются подтвержденные тренеры и их активные планы из backend.
          </Text>
        </GlassCard>

        {isLoading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем тренеров...</Text>
          </GlassCard>
        ) : error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Не удалось загрузить данные</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <AppButton title="Повторить" onPress={loadData} />
          </GlassCard>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Тренеры</Text>

            {trainers.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Тренеров пока нет</Text>
                <Text style={styles.emptyText}>
                  Когда тренеры подтвердят профиль, они появятся здесь.
                </Text>
              </GlassCard>
            ) : (
              trainers.map((trainer) => {
                const trainerPlans = getTrainerCatalogPlans(trainer);
                const prices = trainerPlans
                  .map((plan) => plan.price)
                  .filter((price) => price > 0);
                const priceFrom = prices.length > 0 ? Math.min(...prices) : 0;
                const name = getTrainerName(trainer);

                return (
                  <TrainerCard
                    key={trainer._id}
                    name={name}
                    specialization={trainer.specialization || "Фитнес"}
                    experienceYears={trainer.experienceYears || 0}
                    rating={trainer.ratingAvg || 0}
                    reviewsCount={trainer.reviewsCount || 0}
                    isVerified={trainer.isVerified}
                    plansCount={trainerPlans.length}
                    priceFrom={priceFrom}
                    avatarLetter={name[0]?.toUpperCase() || "Т"}
                    onPress={() => router.push(`/trainers/${trainer._id}`)}
                  />
                );
              })
            )}

            <Text style={styles.sectionTitle}>Доступные планы</Text>

            {plans.length === 0 ? (
              <GlassCard style={styles.stateCard}>
                <Text style={styles.emptyTitle}>Планов пока нет</Text>
                <Text style={styles.emptyText}>
                  Когда тренеры опубликуют планы, они появятся здесь.
                </Text>
              </GlassCard>
            ) : (
              plans.map((plan) => (
                <PlanCard
                  key={`${plan.type}-${plan.id || plan._id}`}
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
                  trainerName={getPlanTrainerName(plan, trainers)}
                  onPress={() => {
                    const routeId = getPlanRouteId(plan);
                    console.log("Переход к деталям плана из каталога", {
                      plan,
                      routeId,
                    });

                    if (routeId) {
                      router.push(`/plans/${routeId}`);
                    }
                  }}
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
