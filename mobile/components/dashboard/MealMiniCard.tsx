import { StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type MealMiniCardProps = {
  title: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export default function MealMiniCard({
  title,
  calories,
  protein,
  fat,
  carbs,
}: MealMiniCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.calories}>{calories} ккал</Text>
      </View>

      <View style={styles.macros}>
        <Text style={styles.macro}>Б: {protein} г</Text>
        <Text style={styles.macro}>Ж: {fat} г</Text>
        <Text style={styles.macro}>У: {carbs} г</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  calories: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  macros: {
    flexDirection: "row",
    gap: 12,
  },
  macro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});