import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS } from "@/constants/colors";

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <BlurView intensity={35} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    padding: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});