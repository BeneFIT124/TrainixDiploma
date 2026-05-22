import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type TrainerCardProps = {
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  plansCount: number;
  priceFrom: number;
  avatarLetter: string;
  onPress?: () => void;
};

export default function TrainerCard({
  name,
  specialization,
  experienceYears,
  rating,
  reviewsCount,
  isVerified,
  plansCount,
  priceFrom,
  avatarLetter,
  onPress,
}: TrainerCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>

              {isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              )}
            </View>

            <Text style={styles.specialization}>{specialization}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{experienceYears}</Text>
            <Text style={styles.metaLabel}>лет опыта</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>★ {rating}</Text>
            <Text style={styles.metaLabel}>{reviewsCount} отзывов</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{plansCount}</Text>
            <Text style={styles.metaLabel}>планов</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>от {priceFrom} ₽</Text>
          <Text style={styles.badge}>Verified</Text>
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#061014",
    fontSize: 24,
    fontWeight: "900",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    flexShrink: 1,
  },
  specialization: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  metaItem: {
    flex: 1,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  metaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  badge: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
  },
});