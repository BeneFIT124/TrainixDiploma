import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import ScreenContainer from "@/components/ui/ScreenContainer";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";

import { COLORS } from "@/constants/colors";
import { createReview } from "@/services/reviewService";

export default function CreateReviewScreen() {
  const { purchaseId, trainerProfileId } = useLocalSearchParams();
  const currentPurchaseId = Array.isArray(purchaseId) ? purchaseId[0] : purchaseId;
  const currentTrainerProfileId = Array.isArray(trainerProfileId)
    ? trainerProfileId[0]
    : trainerProfileId;

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPurchaseId || !currentTrainerProfileId) {
      Alert.alert("Ошибка", "Не удалось определить купленный план");
      return;
    }

    if (!text.trim()) {
      Alert.alert("Ошибка", "Напиши текст отзыва");
      return;
    }

    try {
      setIsSaving(true);
      await createReview({
        purchaseId: currentPurchaseId,
        trainerProfileId: currentTrainerProfileId,
        rating,
        text: text.trim(),
      });

      Alert.alert("Отзыв сохранен", "Спасибо за обратную связь", [
        {
          text: "Ок",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить отзыв"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Отзыв о плане</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Оценка</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                onPress={() => setRating(value)}
                style={[
                  styles.ratingButton,
                  rating >= value && styles.ratingButtonActive,
                ]}
              >
                <Ionicons
                  name={rating >= value ? "star" : "star-outline"}
                  size={22}
                  color={rating >= value ? "#061014" : COLORS.primary}
                />
              </Pressable>
            ))}
          </View>

          <AppInput
            label="Текст отзыва"
            placeholder="Что понравилось в плане и работе тренера?"
            value={text}
            onChangeText={setText}
            multiline
          />
        </GlassCard>

        <AppButton
          title="Сохранить отзыв"
          onPress={handleSubmit}
          loading={isSaving}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  card: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  ratingButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    backgroundColor: "rgba(94,234,212,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
