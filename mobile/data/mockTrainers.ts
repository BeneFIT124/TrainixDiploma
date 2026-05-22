export const mockTrainers = [
  {
    id: "1",
    name: "Алексей Морозов",
    specialization: "Набор мышечной массы",
    experienceYears: 6,
    rating: 4.9,
    reviewsCount: 128,
    isVerified: true,
    plansCount: 4,
    priceFrom: 1490,
    avatarLetter: "А",
  },
  {
    id: "2",
    name: "Мария Волкова",
    specialization: "Похудение и питание",
    experienceYears: 4,
    rating: 4.8,
    reviewsCount: 94,
    isVerified: true,
    plansCount: 6,
    priceFrom: 1290,
    avatarLetter: "М",
  },
  {
    id: "3",
    name: "Дмитрий Ковалёв",
    specialization: "Силовые тренировки",
    experienceYears: 8,
    rating: 4.7,
    reviewsCount: 76,
    isVerified: true,
    plansCount: 3,
    priceFrom: 1990,
    avatarLetter: "Д",
  },
];

export const mockTrainerPlans = [
  {
    id: "1",
    title: "Масса за 8 недель",
    type: "Тренировочный план",
    difficulty: "Средний",
    duration: "8 недель",
    price: 1490,
    description:
      "План тренировок для постепенного набора мышечной массы. Подходит для пользователей, которые уже имеют базовый опыт занятий в зале.",
    includes: [
      "4 тренировки в неделю",
      "Упражнения на основные мышечные группы",
      "Рекомендации по прогрессии нагрузки",
      "План по подходам и повторениям",
    ],
  },
  {
    id: "2",
    title: "Питание для набора",
    type: "План питания",
    difficulty: "Базовый",
    duration: "4 недели",
    price: 990,
    description:
      "План питания с ориентиром на набор мышечной массы. Помогает соблюдать калорийность и баланс БЖУ.",
    includes: [
      "Целевые калории на день",
      "Распределение белков, жиров и углеводов",
      "Примеры приемов пищи",
      "Рекомендации по корректировке рациона",
    ],
  },
  {
    id: "3",
    title: "Силовой фундамент",
    type: "Тренировочный план",
    difficulty: "Продвинутый",
    duration: "6 недель",
    price: 1990,
    description:
      "План для развития силовых показателей. Подходит пользователям, которые хотят увеличить рабочие веса в базовых упражнениях.",
    includes: [
      "Фокус на базовые упражнения",
      "Прогрессия рабочих весов",
      "Контроль отдыха между подходами",
      "Отслеживание силовой динамики",
    ],
  },
];