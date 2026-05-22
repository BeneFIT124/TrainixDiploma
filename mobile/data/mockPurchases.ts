export const mockPurchasedPlans = [
  {
    id: "1",
    title: "Масса за 8 недель",
    type: "Тренировочный план",
    trainerName: "Алексей Морозов",
    purchaseDate: "12 мая 2026",
    status: "Активен",
    progress: 25,
    days: [
      {
        id: "1",
        title: "День 1 — Грудь и трицепс",
        exercises: [
          {
            id: "1",
            name: "Жим штанги лёжа",
            muscleGroup: "Грудь",
            equipment: "Штанга",
            sets: [
              { order: 1, weight: 60, reps: 10 },
              { order: 2, weight: 65, reps: 8 },
              { order: 3, weight: 65, reps: 8 },
            ],
          },
          {
            id: "5",
            name: "Французский жим",
            muscleGroup: "Трицепс",
            equipment: "EZ-гриф",
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
            id: "2",
            name: "Тяга верхнего блока",
            muscleGroup: "Спина",
            equipment: "Тренажёр",
            sets: [
              { order: 1, weight: 50, reps: 12 },
              { order: 2, weight: 55, reps: 10 },
              { order: 3, weight: 55, reps: 10 },
            ],
          },
          {
            id: "4",
            name: "Подъём гантелей на бицепс",
            muscleGroup: "Бицепс",
            equipment: "Гантели",
            sets: [
              { order: 1, weight: 12, reps: 12 },
              { order: 2, weight: 14, reps: 10 },
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
    trainerName: "Алексей Морозов",
    purchaseDate: "12 мая 2026",
    status: "Активен",
    progress: 40,
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
                id: "3",
                name: "Овсянка",
                grams: 100,
                calories: 370,
                protein: 13,
                fat: 7,
                carbs: 60,
              },
              {
                id: "4",
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
                id: "1",
                name: "Куриная грудка",
                grams: 180,
                calories: 297,
                protein: 56,
                fat: 6,
                carbs: 0,
              },
              {
                id: "2",
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
      {
        id: "2",
        title: "День 2",
        meals: [
          {
            id: "1",
            mealType: "Завтрак",
            foods: [
              {
                id: "3",
                name: "Овсянка",
                grams: 80,
                calories: 296,
                protein: 10,
                fat: 6,
                carbs: 48,
              },
              {
                id: "4",
                name: "Банан",
                grams: 100,
                calories: 89,
                protein: 1,
                fat: 0,
                carbs: 23,
              },
            ],
          },
          {
            id: "2",
            mealType: "Ужин",
            foods: [
              {
                id: "1",
                name: "Куриная грудка",
                grams: 160,
                calories: 264,
                protein: 50,
                fat: 6,
                carbs: 0,
              },
              {
                id: "2",
                name: "Рис отварной",
                grams: 180,
                calories: 234,
                protein: 5,
                fat: 1,
                carbs: 50,
              },
            ],
          },
        ],
      },
    ],
  },
];