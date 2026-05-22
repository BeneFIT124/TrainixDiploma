import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/userService";

const goalLabels = {
  lose_weight: "Похудение",
  gain_muscle: "Набор массы",
  maintain: "Поддержание",
};

const goalValues = {
  Похудение: "lose_weight",
  "Набор массы": "gain_muscle",
  Поддержание: "maintain",
} as const;

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : "");
  const [height, setHeight] = useState(user?.height ? String(user.height) : "");
  const [goal, setGoal] = useState(
    user?.goal ? goalLabels[user.goal] : goalLabels.maintain
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Ошибка", "Имя пользователя не может быть пустым");
      return;
    }

    const weightNumber = weight.trim() ? Number(weight.replace(",", ".")) : null;
    const heightNumber = height.trim() ? Number(height.replace(",", ".")) : null;

    if (weightNumber !== null && (Number.isNaN(weightNumber) || weightNumber <= 0)) {
      Alert.alert("Ошибка", "Укажи корректный вес");
      return;
    }

    if (heightNumber !== null && (Number.isNaN(heightNumber) || heightNumber <= 0)) {
      Alert.alert("Ошибка", "Укажи корректный рост");
      return;
    }

    try {
      setIsLoading(true);

      const updatedUser = await updateProfile({
        username: username.trim(),
        weight: weightNumber,
        height: heightNumber,
        goal: goalValues[goal as keyof typeof goalValues] || "maintain",
      });

      await updateUser(updatedUser);

      Alert.alert("Готово", "Профиль сохранен", [
        {
          text: "Ок",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить профиль"
      );
    } finally {
      setIsLoading(false);
    }
  };

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

          <View>
            <Text style={styles.title}>Редактирование</Text>
            <Text style={styles.subtitle}>Обнови данные профиля</Text>
          </View>
        </View>

        <GlassCard style={styles.card}>
          <AppInput
            label="Имя пользователя"
            placeholder="Введите имя"
            value={username}
            onChangeText={setUsername}
          />

          <AppInput
            label="Вес"
            placeholder="Например, 72.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <AppInput
            label="Рост"
            placeholder="Например, 178"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
          />

          <AppInput
            label="Цель"
            placeholder="Похудение, набор массы или поддержание"
            value={goal}
            onChangeText={setGoal}
          />

          <AppButton
            title="Сохранить изменения"
            onPress={handleSave}
            loading={isLoading}
          />
        </GlassCard>
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
  card: {
    marginBottom: 16,
  },
});
