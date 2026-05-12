import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ScreenContainerProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export default function ScreenContainer({
  children,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <LinearGradient
      colors={["#080B12", "#0F172A", "#111827"]}
      style={styles.container}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
});