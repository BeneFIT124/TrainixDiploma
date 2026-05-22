import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type PlanCardProps = {
  title: string;
  type: string;
  difficulty: string;
  duration: string;
  price: number;
  onPress?: () => void;
};

export default function PlanCard({
  title,
  type,
  difficulty,
  duration,
  price,
  onPress,
}: PlanCardProps) {
  const iconName =
    type === "План питания" ? "restaurant-outline" : "barbell-outline";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name={iconName} size={22} color={COLORS.primary} />
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.type}>{type}</Text>
          </View>

          <Text style={styles.price}>{price} ₽</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{difficulty}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{duration}</Text>
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
    marginBottom: 12,
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
  price: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
  },
});