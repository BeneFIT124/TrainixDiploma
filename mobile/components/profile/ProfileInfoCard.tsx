import { StyleSheet, Text } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type ProfileInfoCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function ProfileInfoCard({
  title,
  value,
  subtitle,
}: ProfileInfoCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 110,
    justifyContent: "center",
  },
  value: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
