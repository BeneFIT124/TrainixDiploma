import { router } from "expo-router";
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
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";

import { COLORS } from "@/constants/colors";
import { createTrainerApplication } from "@/services/trainerApplicationService";

export default function TrainerApplicationScreen() {
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [education, setEducation] = useState("");
  const [about, setAbout] = useState("");
  const [documentsAdded, setDocumentsAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDocuments = () => {
    setDocumentsAdded(true);

    Alert.alert(
      "Документы добавлены",
      "Файлы добавлены в демо-режиме. Позже здесь будет загрузка документов на сервер."
    );
  };

  const handleSubmit = async () => {
    if (!experience.trim()) {
      Alert.alert("Ошибка", "Укажи опыт работы");
      return;
    }

    if (!specialization.trim()) {
      Alert.alert("Ошибка", "Укажи специализацию");
      return;
    }

    if (!education.trim()) {
      Alert.alert("Ошибка", "Укажи образование или сертификаты");
      return;
    }

    if (!about.trim()) {
      Alert.alert("Ошибка", "Напиши кратко о себе");
      return;
    }

    if (!documentsAdded) {
      Alert.alert("Ошибка", "Добавь документы для проверки");
      return;
    }

    try {
      setIsSubmitting(true);

      await createTrainerApplication({
        educationDocumentUrl: "demo://education-document",
        certificateDocumentUrl: "demo://certificate-document",
        identityDocumentUrl: "demo://identity-document",
        comment: [
          `Опыт: ${experience.trim()}`,
          `Специализация: ${specialization.trim()}`,
          `Образование: ${education.trim()}`,
          `О себе: ${about.trim()}`,
        ].join("\n"),
      });

      Alert.alert(
        "Заявка отправлена",
        "Заявка на получение статуса тренера отправлена на проверку.",
        [
          {
            text: "Ок",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось отправить заявку"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Заявка тренера</Text>
            <Text style={styles.subtitle}>
              Заполни данные для проверки квалификации
            </Text>
          </View>
        </View>

        <GlassCard style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark-outline" size={26} color={COLORS.primary} />
          </View>

          <Text style={styles.infoTitle}>Проверка специалиста</Text>
          <Text style={styles.infoText}>
            Статус тренера выдается после проверки опыта, документов и
            подтверждения квалификации. После одобрения тренер сможет создавать
            и продавать планы тренировок и питания.
          </Text>
        </GlassCard>

        <GlassCard style={styles.formCard}>
          <AppInput
            label="Опыт работы"
            placeholder="Например, 3 года"
            value={experience}
            onChangeText={setExperience}
          />

          <AppInput
            label="Специализация"
            placeholder="Например, набор массы, похудение, силовые"
            value={specialization}
            onChangeText={setSpecialization}
          />

          <AppInput
            label="Образование / сертификаты"
            placeholder="Например, курсы, диплом, сертификаты"
            value={education}
            onChangeText={setEducation}
          />

          <AppInput
            label="О себе"
            placeholder="Кратко опиши свой подход к тренировкам"
            value={about}
            onChangeText={setAbout}
            multiline
            style={styles.multilineInput}
          />
        </GlassCard>

        <Text style={styles.sectionTitle}>Документы</Text>

        <Pressable
          onPress={handleAddDocuments}
          style={[
            styles.documentCard,
            documentsAdded && styles.documentCardActive,
          ]}
        >
          <View style={styles.documentIcon}>
            <Ionicons
              name={documentsAdded ? "checkmark" : "cloud-upload-outline"}
              size={24}
              color={documentsAdded ? "#061014" : COLORS.primary}
            />
          </View>

          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>
              {documentsAdded ? "Документы добавлены" : "Добавить документы"}
            </Text>
            <Text style={styles.documentText}>
              Диплом, сертификаты, подтверждение квалификации
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>

        <GlassCard style={styles.noteCard}>
          <Text style={styles.noteTitle}>После отправки</Text>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Заявка попадет на проверку</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Администратор проверит документы</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              После одобрения пользователь получит роль тренера
            </Text>
          </View>
        </GlassCard>

        <AppButton
          title="Отправить заявку"
          onPress={handleSubmit}
          loading={isSubmitting}
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
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
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
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "rgba(94,234,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,234,212,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    marginBottom: 24,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  documentCard: {
    minHeight: 82,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  documentCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(94,234,212,0.08)",
  },
  documentIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "rgba(94,234,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  documentText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  noteCard: {
    marginBottom: 18,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(94,234,212,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 19,
  },
});
