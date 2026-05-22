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
import { useMemo, useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/userService";

type Goal = "lose_weight" | "gain_muscle" | "maintain";

const goals: { value: Goal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "lose_weight", label: "Похудение", icon: "trending-down-outline" },
  { value: "maintain", label: "Поддержание", icon: "remove-outline" },
  { value: "gain_muscle", label: "Набор массы", icon: "trending-up-outline" },
];

const calculateTargets = (weight: number, goal: Goal) => {
  const calories = Math.round(
    weight * (goal === "lose_weight" ? 25 : goal === "gain_muscle" ? 35 : 30)
  );
  const protein = Math.round(weight * 1.8);
  const fat = Math.round(weight * 0.9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, fat, carbs };
};

export default function OnboardingScreen() {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [isSaving, setIsSaving] = useState(false);

  const weightNumber = Number(weight.replace(",", "."));
  const heightNumber = Number(height.replace(",", "."));
  const targets = useMemo(
    () => calculateTargets(Number.isNaN(weightNumber) ? 0 : weightNumber, goal),
    [goal, weightNumber]
  );

  const handleNext = () => {
    if (step === 1 && (!weight.trim() || Number.isNaN(weightNumber) || weightNumber <= 0)) {
      Alert.alert("Ошибка", "Укажи корректный вес");
      return;
    }

    if (step === 2 && (!height.trim() || Number.isNaN(heightNumber) || heightNumber <= 0)) {
      Alert.alert("Ошибка", "Укажи корректный рост");
      return;
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const handleFinish = async () => {
    try {
      setIsSaving(true);

      const updatedUser = await updateProfile({
        weight: weightNumber,
        height: heightNumber,
        goal,
        targetCalories: targets.calories,
        targetProtein: targets.protein,
        targetFat: targets.fat,
        targetCarbs: targets.carbs,
      });

      await updateUser(updatedUser);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить данные"
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
          <Text style={styles.logo}>Trainix</Text>
          <Text style={styles.title}>Добро пожаловать</Text>
          <Text style={styles.subtitle}>
            Настроим базовые цели, чтобы питание и статистика считались под тебя.
          </Text>
        </View>

        <View style={styles.stepsRow}>
          {[1, 2, 3, 4].map((item) => (
            <View
              key={item}
              style={[styles.stepDot, item <= step && styles.stepDotActive]}
            />
          ))}
        </View>

        <GlassCard style={styles.card}>
          {step === 1 ? (
            <>
              <Text style={styles.cardTitle}>Твой вес</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="Например, 72.5"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
              <AppButton title="Дальше" onPress={handleNext} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={styles.cardTitle}>Твой рост</Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                placeholder="Например, 178"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
              <AppButton title="Дальше" onPress={handleNext} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Text style={styles.cardTitle}>Цель</Text>
              <View style={styles.goalList}>
                {goals.map((item) => {
                  const active = goal === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setGoal(item.value)}
                      style={[styles.goalButton, active && styles.goalButtonActive]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={active ? "#061014" : COLORS.primary}
                      />
                      <Text
                        style={[styles.goalText, active && styles.goalTextActive]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <AppButton title="Посчитать" onPress={handleNext} />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Text style={styles.cardTitle}>Дневная норма</Text>
              <View style={styles.targetsGrid}>
                <Target label="Калории" value={targets.calories} unit="ккал" />
                <Target label="Белки" value={targets.protein} unit="г" />
                <Target label="Жиры" value={targets.fat} unit="г" />
                <Target label="Углеводы" value={targets.carbs} unit="г" />
              </View>
              <AppButton
                title="Сохранить"
                onPress={handleFinish}
                loading={isSaving}
              />
            </>
          ) : null}
        </GlassCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function Target({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.targetItem}>
      <Text style={styles.targetValue}>{value}</Text>
      <Text style={styles.targetLabel}>
        {label}, {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 80,
  },
  header: {
    marginTop: 36,
    marginBottom: 28,
  },
  logo: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 34,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  stepDot: {
    flex: 1,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  card: {
    gap: 16,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  input: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
  },
  goalList: {
    gap: 10,
  },
  goalButton: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  goalButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  goalTextActive: {
    color: "#061014",
  },
  targetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  targetItem: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  targetValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  targetLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
});
