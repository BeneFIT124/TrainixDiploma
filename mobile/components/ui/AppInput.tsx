import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { COLORS } from "@/constants/colors";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export default function AppInput({ label, error, style, ...props }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, props.multiline && styles.multiline, error && styles.inputError, style]}
        {...props}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: 6,
    color: COLORS.error,
    fontSize: 13,
  },
});
