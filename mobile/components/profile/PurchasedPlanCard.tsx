import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type PurchasedPlanCardProps = {
  title: string;
  type: string;
  trainerName: string;
  purchaseDate: string;
  status: string;
  progress?: number | null;
  onPress?: () => void;
};

export default function PurchasedPlanCard({
  title,
  type,
  trainerName,
  purchaseDate,
  status,
  progress,
  onPress,
}: PurchasedPlanCardProps) {
  const isNutritionPlan = type === "План питания";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons
              name={isNutritionPlan ? "restaurant-outline" : "barbell-outline"}
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.type}>{type}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Тренер: {trainerName}</Text>
          <Text style={styles.meta}>Куплен: {purchaseDate}</Text>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.status}>{status}</Text>
          {progress != null ? (
            <Text style={styles.progressText}>{progress}%</Text>
          ) : null}
        </View>

        {progress != null ? (
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        ) : null}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  card: {
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  type: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  metaRow: {
    gap: 5,
    marginBottom: 16,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  status: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
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
