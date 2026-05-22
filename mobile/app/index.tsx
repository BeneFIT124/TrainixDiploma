import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/constants/colors";

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    if (!user?.weight || !user?.height || !user?.targetCalories) {
      return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
