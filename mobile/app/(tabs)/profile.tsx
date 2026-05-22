import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { becomeTrainerDemo } from "@/services/userService";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();

  const userInitial = user?.username?.[0]?.toUpperCase() || "П";
  const goalLabel =
    user?.goal === "lose_weight"
      ? "Похудение"
      : user?.goal === "gain_muscle"
        ? "Масса"
        : "Поддержание";

  const handleLogout = async () => {
    Alert.alert("Выход", "Ты точно хочешь выйти из аккаунта?", [
      {
        text: "Отмена",
        style: "cancel",
      },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleBecomeTrainerDemo = async () => {
    try {
      const updatedUser = await becomeTrainerDemo();
      await updateUser(updatedUser);
      Alert.alert("Готово", "Демо-статус тренера включен");
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось включить статус тренера"
      );
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.screenTitle}>Профиль</Text>

        <GlassCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>

          <Text style={styles.name}>{user?.username || "Пользователь"}</Text>
          <Text style={styles.email}>{user?.email || "email не указан"}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="person-outline" size={15} color={COLORS.primary} />
            <Text style={styles.roleText}>
              {user?.role === "trainer" ? "Тренер" : "Пользователь"}
            </Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Параметры</Text>

        <View style={styles.grid}>
          <ProfileInfoCard
            title="Вес"
            value={user?.weight ? `${user.weight}` : "—"}
            subtitle={user?.weight ? "кг" : "не указан"}
          />

          <ProfileInfoCard
            title="Рост"
            value={user?.height ? `${user.height}` : "—"}
            subtitle={user?.height ? "см" : "не указан"}
          />
        </View>

        <View style={styles.grid}>
          <ProfileInfoCard title="Цель" value={goalLabel} subtitle="профиль" />

          <ProfileInfoCard
            title="Активность"
            value={user?.activityLevel || "—"}
            subtitle={user?.activityLevel ? "уровень" : "не указана"}
          />
        </View>

        <GlassCard style={styles.targetCard}>
          <Text style={styles.cardTitle}>Цели по питанию</Text>

          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Калории</Text>
            <Text style={styles.targetValue}>{user?.targetCalories || 0} ккал</Text>
          </View>

          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Белки</Text>
            <Text style={styles.targetValue}>{user?.targetProtein || 0} г</Text>
          </View>

          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Жиры</Text>
            <Text style={styles.targetValue}>{user?.targetFat || 0} г</Text>
          </View>

          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Углеводы</Text>
            <Text style={styles.targetValue}>{user?.targetCarbs || 0} г</Text>
          </View>
        </GlassCard>

        <View style={styles.actions}>
          <AppButton
            title="Мои планы"
            onPress={() => router.push("/profile/plans")}
          />

          <AppButton
            title="Редактировать профиль"
            onPress={() => router.push("/profile/edit")}
            variant="secondary"
          />

          {user?.role === "trainer" || user?.role === "admin" ? null : (
            <AppButton
              title="Демо: стать тренером"
              onPress={handleBecomeTrainerDemo}
            />
          )}

          {user?.role === "trainer" || user?.role === "admin" ? (
            <AppButton
              title="Панель тренера"
              onPress={() => router.push("/trainer-panel")}
              variant="secondary"
            />
          ) : null}

          <AppButton
            title="Выйти из аккаунта"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 130,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#061014",
    fontSize: 36,
    fontWeight: "900",
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  targetCard: {
    marginTop: 10,
    marginBottom: 22,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  targetLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  targetValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  actions: {
    gap: 12,
  },
});
