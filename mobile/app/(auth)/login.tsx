import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполни email и пароль");
      return;
    }

    try {
      setIsLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Ошибка входа",
        error instanceof Error ? error.message : "Не удалось войти"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={{ paddingTop: 54 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>Trainix</Text>
        <Text style={styles.title}>Вход в аккаунт</Text>
        <Text style={styles.subtitle}>
          Продолжи отслеживать тренировки, питание и прогресс
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <AppInput
          label="Email"
          placeholder="example@mail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppInput
          label="Пароль"
          placeholder="Введите пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppButton
          title="Войти"
          onPress={handleLogin}
          loading={isLoading}
        />

        <Pressable
          onPress={() => router.push("/(auth)/register")}
          style={styles.linkWrapper}
        >
          <Text style={styles.linkText}>
            Нет аккаунта? <Text style={styles.linkAccent}>Создать</Text>
          </Text>
        </Pressable>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 42,
    marginTop: 26,
  },
  logo: {
    color: COLORS.primary,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 44,
    textAlign: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    gap: 4,
  },
  linkWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  linkAccent: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});