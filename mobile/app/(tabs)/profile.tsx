import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
  await logout();
  router.replace("/(auth)/login");
};
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Профиль</Text>

        <GlassCard style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>И</Text>
          </View>

          <Text style={styles.name}>{user?.username || "Пользователь"}</Text>
          <Text style={styles.email}>{user?.email || "email не указан"}</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Цели</Text>
          <Text style={styles.cardText}>Набор мышечной массы</Text>
          <Text style={styles.cardText}>2500 ккал / день</Text>
        </GlassCard>

        <AppButton title="Редактировать профиль" onPress={() => {}} />
        <AppButton
  title="Выйти из аккаунта"
  onPress={handleLogout}
  variant="secondary"
/>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#061014",
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 4,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 4,
  },
});