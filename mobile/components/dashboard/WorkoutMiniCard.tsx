import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type WorkoutMiniCardProps = {
  title: string;
  date: string;
  duration: number;
  exercisesCount: number;
};

export default function WorkoutMiniCard({
  title,
  date,
  duration,
  exercisesCount,
}: WorkoutMiniCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.iconBox}>
          <Ionicons name="barbell-outline" size={22} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.meta}>{duration} мин</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>{exercisesCount} упражнений</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
  },
});