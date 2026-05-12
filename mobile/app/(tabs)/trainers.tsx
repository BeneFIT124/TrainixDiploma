import { ScrollView, StyleSheet, Text } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

export default function TrainersScreen() {
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Тренеры</Text>
        <Text style={styles.subtitle}>
          Находи тренеров, смотри их планы и покупай программы тренировок.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Каталог тренеров</Text>
          <Text style={styles.cardText}>
            Здесь позже появятся verified-тренеры, рейтинги, отзывы и планы.
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