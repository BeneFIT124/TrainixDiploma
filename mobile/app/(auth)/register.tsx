import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";

export default function RegisterScreen() {
  const { register } = useAuth();
const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPersonalDataAccepted, setIsPersonalDataAccepted] = useState(false);

  const handleRegister = async () => {
  if (!username.trim() || !email.trim() || !password.trim()) {
    Alert.alert("Ошибка", "Заполни все поля");
    return;
  }

  if (password.length < 6) {
    Alert.alert("Ошибка", "Пароль должен быть минимум 6 символов");
    return;
  }

  if (!isPersonalDataAccepted) {
    Alert.alert(
      "Ошибка",
      "Необходимо дать согласие на обработку персональных данных"
    );
    return;
  }

  try {
    setIsLoading(true);

    await register({
      username: username.trim(),
      email: email.trim(),
      password,
    });

    router.replace("/(tabs)");
  } catch (error) {
    Alert.alert(
      "Ошибка регистрации",
      error instanceof Error ? error.message : "Не удалось создать аккаунт"
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <ScreenContainer contentStyle={styles.screenContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Trainix</Text>
          <Text style={styles.title}>Создание аккаунта</Text>
          <Text style={styles.subtitle}>
            Создай профиль, чтобы сохранять тренировки и питание
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <AppInput
            label="Имя пользователя"
            placeholder="Например, ivan"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

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
            placeholder="Минимум 6 символов"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setIsPersonalDataAccepted((prev) => !prev)}
          >
            <View
              style={[
                styles.checkbox,
                isPersonalDataAccepted && styles.checkboxActive,
              ]}
            >
              {isPersonalDataAccepted && (
                <Ionicons name="checkmark" size={16} color="#061014" />
              )}
            </View>

            <Text style={styles.checkboxText}>
              Я даю согласие на обработку персональных данных
            </Text>
          </Pressable>

          <AppButton title="Зарегистрироваться" onPress={handleRegister} loading={isLoading} />

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={styles.linkWrapper}
          >
            <Text style={styles.linkText}>
              Уже есть аккаунт? <Text style={styles.linkAccent}>Войти</Text>
            </Text>
          </Pressable>
        </GlassCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
  paddingTop: 52,
},
scrollContent: {
  paddingBottom: 90,
},
  header: {
  marginBottom: 24,
},

logo: {
  color: COLORS.primary,
  fontSize: 22,
  fontWeight: "900",
  marginBottom: 44,
},

title: {
  color: COLORS.text,
  fontSize: 30,
  fontWeight: "800",
  marginBottom: 8,
},

subtitle: {
  color: COLORS.textSecondary,
  fontSize: 15,
  lineHeight: 21,
},
  card: {
    gap: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  linkWrapper: {
    marginTop: 18,
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