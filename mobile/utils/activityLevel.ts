const activityLevelLabels: Record<string, string> = {
  sedentary: "Низкая активность",
  light: "Лёгкая активность",
  moderate: "Умеренная активность",
  active: "Высокая активность",
  very_active: "Очень высокая активность",
};

export function getActivityLevelLabel(activityLevel?: string | null) {
  if (!activityLevel) {
    return "—";
  }

  return activityLevelLabels[activityLevel] || activityLevel;
}
