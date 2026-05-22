import { StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type NutritionProgressCardProps = {
  label: string;
  current: number;
  target: number;
  unit: string;
};

export default function NutritionProgressCard({
  label,
  current,
  target,
  unit,
}: NutritionProgressCardProps) {
  const progress = Math.min(current / target, 1);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {current} / {target} {unit}
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
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
    marginBottom: 12,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  value: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  progressBackground: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.primary,
  },
});