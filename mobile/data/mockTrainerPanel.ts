export const mockTrainerStats = {
  plansCount: 5,
  salesCount: 38,
  income: 54200,
  rating: 4.9,
};

export const mockTrainerOwnPlans = [
  {
    id: "1",
    title: "Масса за 8 недель",
    type: "Тренировочный план",
    price: 1490,
    salesCount: 18,
    status: "Опубликован",
    description:
      "Тренировочный план для постепенного набора мышечной массы с акцентом на базовые упражнения и прогрессию нагрузки.",
    days: [
      {
        id: "1",
        title: "День 1 — Грудь и трицепс",
        exercises: [
          {
            id: "1",
            name: "Жим штанги лёжа",
            sets: [
              { order: 1, weight: 60, reps: 10 },
              { order: 2, weight: 65, reps: 8 },
              { order: 3, weight: 65, reps: 8 },
            ],
          },
          {
            id: "2",
            name: "Французский жим",
            sets: [
              { order: 1, weight: 25, reps: 12 },
              { order: 2, weight: 25, reps: 10 },
            ],
          },
        ],
      },
      {
        id: "2",
        title: "День 2 — Спина и бицепс",
        exercises: [
          {
            id: "3",
            name: "Тяга верхнего блока",
            sets: [
              { order: 1, weight: 50, reps: 12 },
              { order: 2, weight: 55, reps: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Питание для набора",
    type: "План питания",
    price: 990,
    salesCount: 12,
    status: "Опубликован",
    description:
      "План питания для набора мышечной массы с распределением калорий и КБЖУ по основным приёмам пищи.",
    days: [
      {
        id: "1",
        title: "День 1",
        meals: [
          {
            id: "1",
            mealType: "Завтрак",
            foods: [
              {
                id: "1",
                name: "Овсянка",
                grams: 100,
                calories: 370,
                protein: 13,
                fat: 7,
                carbs: 60,
              },
              {
                id: "2",
                name: "Банан",
                grams: 120,
                calories: 107,
                protein: 1,
                fat: 0,
                carbs: 28,
              },
            ],
          },
          {
            id: "2",
            mealType: "Обед",
            foods: [
              {
                id: "3",
                name: "Куриная грудка",
                grams: 180,
                calories: 297,
                protein: 56,
                fat: 6,
                carbs: 0,
              },
              {
                id: "4",
                name: "Рис отварной",
                grams: 200,
                calories: 260,
                protein: 5,
                fat: 1,
                carbs: 56,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Силовой фундамент",
    type: "Тренировочный план",
    price: 1990,
    salesCount: 8,
    status: "Черновик",
    description:
      "План для развития силовых показателей. Подходит пользователям с базовым опытом тренировок.",
    days: [
      {
        id: "1",
        title: "День 1 — База",
        exercises: [
          {
            id: "1",
            name: "Приседания со штангой",
            sets: [
              { order: 1, weight: 70, reps: 8 },
              { order: 2, weight: 80, reps: 6 },
            ],
          },
        ],
      },
    ],
  },
];