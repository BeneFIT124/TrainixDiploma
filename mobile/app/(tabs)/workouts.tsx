import { ScrollView, StyleSheet, Text } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";

export default function WorkoutsScreen() {
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Тренировки</Text>
        <Text style={styles.subtitle}>
          Создавай тренировки, добавляй упражнения и отслеживай силовой прогресс.
        </Text>

        <AppButton title="Начать тренировку" onPress={() => {}} style={styles.button} />

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Пока тренировок нет</Text>
          <Text style={styles.cardText}>
            После создания тренировки здесь появится история занятий.
          </Text>
        </GlassCard>
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
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    marginBottom: 18,
  },
  card: {
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
    lineHeight: 22,
  },
});