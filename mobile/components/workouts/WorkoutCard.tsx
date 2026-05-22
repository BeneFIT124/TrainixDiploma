import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type WorkoutCardProps = {
  title: string;
  date: string;
  duration: number;
  exercisesCount: number;
  calories?: number | null;
  onPress?: () => void;
};

export default function WorkoutCard({
  title,
  date,
  duration,
  exercisesCount,
  calories,
  onPress,
}: WorkoutCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="barbell-outline" size={22} color={COLORS.primary} />
          </View>

          <View style={styles.titleBox}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{duration}</Text>
            <Text style={styles.metaLabel}>мин</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{exercisesCount}</Text>
            <Text style={styles.metaLabel}>упр.</Text>
          </View>

          {calories != null ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{calories}</Text>
              <Text style={styles.metaLabel}>ккал</Text>
            </View>
          ) : null}
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
  titleBox: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flex: 1,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  metaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
