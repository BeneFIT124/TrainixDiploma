import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type TrainerOwnPlanCardProps = {
  title: string;
  type: string;
  price: number;
  salesCount?: number | null;
  status: string;
  onPress?: () => void;
};

export default function TrainerOwnPlanCard({
  title,
  type,
  price,
  salesCount,
  status,
  onPress,
}: TrainerOwnPlanCardProps) {
  const isNutritionPlan = type === "План питания";
  const isPublished = status === "Опубликован";

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

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{price} ₽</Text>
            <Text style={styles.sales}>
              {salesCount == null ? "Продажи не подключены" : `${salesCount} продаж`}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isPublished ? styles.statusPublished : styles.statusDraft,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
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
    marginBottom: 18,
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 3,
  },
  sales: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
  },
  statusPublished: {
    backgroundColor: "rgba(94,234,212,0.12)",
    borderColor: "rgba(94,234,212,0.28)",
  },
  statusDraft: {
    backgroundColor: "rgba(250,204,21,0.10)",
    borderColor: "rgba(250,204,21,0.25)",
  },
  statusText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
});
