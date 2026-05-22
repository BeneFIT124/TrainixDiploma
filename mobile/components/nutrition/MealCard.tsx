import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { COLORS } from "@/constants/colors";

type MealCardProps = {
  title: string;
  time: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  itemsCount: number;
  onPress?: () => void;
};

export default function MealCard({
  title,
  time,
  calories,
  protein,
  fat,
  carbs,
  itemsCount,
  onPress,
}: MealCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="restaurant-outline" size={22} color={COLORS.primary} />
          </View>

          <View style={styles.titleBox}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.time}>
              {time} • {itemsCount} продукта
            </Text>
          </View>

          <Text style={styles.calories}>{calories} ккал</Text>
        </View>

        <View style={styles.macrosRow}>
          <Text style={styles.macro}>Б: {protein} г</Text>
          <Text style={styles.macro}>Ж: {fat} г</Text>
          <Text style={styles.macro}>У: {carbs} г</Text>
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
  titleBox: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  calories: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 14,
  },
  macro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});