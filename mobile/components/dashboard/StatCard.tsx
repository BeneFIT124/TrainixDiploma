import { StyleSheet, Text, ViewStyle } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  style?: ViewStyle;
};

export default function StatCard({
  title,
  value,
  subtitle,
  style,
}: StatCardProps) {
  return (
    <GlassCard style={[styles.card, style]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    justifyContent: "center",
  },
  value: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});