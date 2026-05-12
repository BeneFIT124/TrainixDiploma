import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import { COLORS } from "@/constants/colors";

export default function NutritionScreen() {
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Питание</Text>
        <Text style={styles.subtitle}>
          Отслеживай калории, белки, жиры и углеводы за день.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>КБЖУ сегодня</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Калории</Text>
            <Text style={styles.value}>0 / 2500</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Белки</Text>
            <Text style={styles.value}>0 / 160 г</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Жиры</Text>
            <Text style={styles.value}>0 / 80 г</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Углеводы</Text>
            <Text style={styles.value}>0 / 300 г</Text>
          </View>
        </GlassCard>

        <AppButton title="Добавить приём пищи" onPress={() => {}} style={styles.button} />
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
    marginBottom: 18,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  value: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  button: {
    marginTop: 2,
  },
});