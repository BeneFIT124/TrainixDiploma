import mongoose from "mongoose";
import dotenv from "dotenv";

import Exercise from "../models/Exercise.js";
import Food from "../models/Food.js";

dotenv.config();

const exercises = [
  {
    name: "Жим штанги лёжа",
    primaryMuscleGroup: "Грудные мышцы",
    secondaryMuscleGroups: ["Трицепс", "Передняя дельта"],
    description: "Базовое упражнение для развития грудных мышц, трицепса и передней дельты.",
    equipment: "Штанга",
  },
  {
    name: "Жим гантелей на наклонной скамье",
    primaryMuscleGroup: "Верх груди",
    secondaryMuscleGroups: ["Плечи", "Трицепс"],
    description: "Упражнение с акцентом на верхнюю часть грудных мышц.",
    equipment: "Гантели",
  },
  {
    name: "Разведение гантелей лёжа",
    primaryMuscleGroup: "Грудные мышцы",
    secondaryMuscleGroups: ["Передняя дельта"],
    description: "Изолирующее упражнение для проработки грудных мышц.",
    equipment: "Гантели",
  },
  {
    name: "Отжимания",
    primaryMuscleGroup: "Грудные мышцы",
    secondaryMuscleGroups: ["Трицепс", "Плечи"],
    description: "Упражнение с собственным весом для груди, рук и плечевого пояса.",
    equipment: "Собственный вес",
  },
  {
    name: "Подтягивания",
    primaryMuscleGroup: "Широчайшие мышцы",
    secondaryMuscleGroups: ["Бицепс", "Спина"],
    description: "Базовое упражнение для развития спины и силы верхней части тела.",
    equipment: "Турник",
  },
  {
    name: "Тяга верхнего блока к груди",
    primaryMuscleGroup: "Широчайшие мышцы",
    secondaryMuscleGroups: ["Бицепс", "Спина"],
    description: "Упражнение для развития широчайших мышц спины.",
    equipment: "Блочный тренажер",
  },
  {
    name: "Тяга горизонтального блока",
    primaryMuscleGroup: "Спина",
    secondaryMuscleGroups: ["Бицепс", "Задняя дельта"],
    description: "Упражнение для развития средней части спины.",
    equipment: "Блочный тренажер",
  },
  {
    name: "Становая тяга",
    primaryMuscleGroup: "Спина",
    secondaryMuscleGroups: ["Поясница", "Ягодицы", "Бицепс бедра"],
    description: "Базовое силовое упражнение для развития спины, ног и корпуса.",
    equipment: "Штанга",
  },
  {
    name: "Приседания со штангой",
    primaryMuscleGroup: "Квадрицепс",
    secondaryMuscleGroups: ["Ягодицы", "Бицепс бедра", "Поясница"],
    description: "Базовое упражнение для развития мышц ног и общей силы.",
    equipment: "Штанга",
  },
  {
    name: "Жим ногами",
    primaryMuscleGroup: "Квадрицепс",
    secondaryMuscleGroups: ["Ягодицы", "Бицепс бедра"],
    description: "Упражнение для тренировки ног в специальном тренажере.",
    equipment: "Тренажер",
  },
  {
    name: "Сгибание ног лёжа",
    primaryMuscleGroup: "Бицепс бедра",
    secondaryMuscleGroups: ["Икры"],
    description: "Изолирующее упражнение для задней поверхности бедра.",
    equipment: "Тренажер",
  },
  {
    name: "Разгибание ног в тренажере",
    primaryMuscleGroup: "Квадрицепс",
    secondaryMuscleGroups: [],
    description: "Изолирующее упражнение для передней поверхности бедра.",
    equipment: "Тренажер",
  },
  {
    name: "Подъём на носки стоя",
    primaryMuscleGroup: "Икры",
    secondaryMuscleGroups: [],
    description: "Упражнение для развития икроножных мышц.",
    equipment: "Тренажер",
  },
  {
    name: "Жим гантелей сидя",
    primaryMuscleGroup: "Плечи",
    secondaryMuscleGroups: ["Трицепс", "Передняя дельта"],
    description: "Упражнение для развития плечевого пояса.",
    equipment: "Гантели",
  },
  {
    name: "Махи гантелями в стороны",
    primaryMuscleGroup: "Средняя дельта",
    secondaryMuscleGroups: ["Плечи"],
    description: "Изолирующее упражнение для средней дельты.",
    equipment: "Гантели",
  },
  {
    name: "Махи гантелями в наклоне",
    primaryMuscleGroup: "Задняя дельта",
    secondaryMuscleGroups: ["Спина"],
    description: "Упражнение для развития задней дельты.",
    equipment: "Гантели",
  },
  {
    name: "Подъём штанги на бицепс",
    primaryMuscleGroup: "Бицепс",
    secondaryMuscleGroups: ["Предплечья"],
    description: "Классическое упражнение для развития бицепса.",
    equipment: "Штанга",
  },
  {
    name: "Подъём гантелей на бицепс",
    primaryMuscleGroup: "Бицепс",
    secondaryMuscleGroups: ["Предплечья"],
    description: "Упражнение для изолированной проработки бицепса.",
    equipment: "Гантели",
  },
  {
    name: "Разгибание рук на блоке",
    primaryMuscleGroup: "Трицепс",
    secondaryMuscleGroups: [],
    description: "Изолирующее упражнение для проработки трицепса.",
    equipment: "Блочный тренажер",
  },
  {
    name: "Французский жим",
    primaryMuscleGroup: "Трицепс",
    secondaryMuscleGroups: ["Предплечья"],
    description: "Упражнение для развития трицепса с акцентом на длинную головку.",
    equipment: "Штанга",
  },
  {
    name: "Скручивания на пресс",
    primaryMuscleGroup: "Пресс",
    secondaryMuscleGroups: [],
    description: "Базовое упражнение для мышц живота.",
    equipment: "Собственный вес",
  },
  {
    name: "Планка",
    primaryMuscleGroup: "Пресс",
    secondaryMuscleGroups: ["Поясница", "Плечи"],
    description: "Статическое упражнение для укрепления мышц корпуса.",
    equipment: "Собственный вес",
  },
  {
    name: "Подъём ног в висе",
    primaryMuscleGroup: "Пресс",
    secondaryMuscleGroups: ["Косые мышцы живота"],
    description: "Упражнение для нижней части пресса и мышц корпуса.",
    equipment: "Турник",
  },
  {
    name: "Беговая дорожка",
    primaryMuscleGroup: "Кардио",
    secondaryMuscleGroups: ["Икры", "Квадрицепс", "Ягодицы"],
    description: "Кардиоупражнение для развития выносливости и расхода калорий.",
    equipment: "Кардиотренажер",
  },
  {
    name: "Велотренажер",
    primaryMuscleGroup: "Кардио",
    secondaryMuscleGroups: ["Квадрицепс", "Икры"],
    description: "Кардиоупражнение для тренировки ног и выносливости.",
    equipment: "Кардиотренажер",
  },
];

const foods = [
  {
    name: "Куриная грудка",
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
    category: "Мясо",
  },
  {
    name: "Говядина",
    calories: 250,
    protein: 26,
    fat: 15,
    carbs: 0,
    category: "Мясо",
  },
  {
    name: "Свинина",
    calories: 242,
    protein: 27,
    fat: 14,
    carbs: 0,
    category: "Мясо",
  },
  {
    name: "Индейка",
    calories: 135,
    protein: 29,
    fat: 1.5,
    carbs: 0,
    category: "Мясо",
  },
  {
    name: "Лосось",
    calories: 208,
    protein: 20,
    fat: 13,
    carbs: 0,
    category: "Рыба",
  },
  {
    name: "Тунец",
    calories: 132,
    protein: 28,
    fat: 1,
    carbs: 0,
    category: "Рыба",
  },
  {
    name: "Яйцо куриное",
    calories: 157,
    protein: 12.7,
    fat: 10.9,
    carbs: 0.7,
    category: "Яйца",
  },
  {
    name: "Творог 5%",
    calories: 121,
    protein: 17,
    fat: 5,
    carbs: 1.8,
    category: "Молочные продукты",
  },
  {
    name: "Молоко 2.5%",
    calories: 52,
    protein: 2.8,
    fat: 2.5,
    carbs: 4.7,
    category: "Молочные продукты",
  },
  {
    name: "Йогурт натуральный",
    calories: 60,
    protein: 4,
    fat: 2.5,
    carbs: 5,
    category: "Молочные продукты",
  },
  {
    name: "Сыр твёрдый",
    calories: 350,
    protein: 25,
    fat: 27,
    carbs: 2,
    category: "Молочные продукты",
  },
  {
    name: "Рис белый",
    calories: 130,
    protein: 2.7,
    fat: 0.3,
    carbs: 28,
    category: "Крупы",
  },
  {
    name: "Гречка",
    calories: 110,
    protein: 3.6,
    fat: 1.1,
    carbs: 21,
    category: "Крупы",
  },
  {
    name: "Овсянка",
    calories: 389,
    protein: 16.9,
    fat: 6.9,
    carbs: 66.3,
    category: "Крупы",
  },
  {
    name: "Макароны",
    calories: 131,
    protein: 5,
    fat: 1.1,
    carbs: 25,
    category: "Крупы",
  },
  {
    name: "Картофель",
    calories: 77,
    protein: 2,
    fat: 0.1,
    carbs: 17,
    category: "Овощи",
  },
  {
    name: "Огурец",
    calories: 15,
    protein: 0.7,
    fat: 0.1,
    carbs: 3.6,
    category: "Овощи",
  },
  {
    name: "Помидор",
    calories: 18,
    protein: 0.9,
    fat: 0.2,
    carbs: 3.9,
    category: "Овощи",
  },
  {
    name: "Брокколи",
    calories: 34,
    protein: 2.8,
    fat: 0.4,
    carbs: 6.6,
    category: "Овощи",
  },
  {
    name: "Банан",
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
    category: "Фрукты",
  },
  {
    name: "Яблоко",
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    category: "Фрукты",
  },
  {
    name: "Апельсин",
    calories: 47,
    protein: 0.9,
    fat: 0.1,
    carbs: 12,
    category: "Фрукты",
  },
  {
    name: "Арахис",
    calories: 567,
    protein: 25.8,
    fat: 49.2,
    carbs: 16.1,
    category: "Орехи",
  },
  {
    name: "Миндаль",
    calories: 579,
    protein: 21.2,
    fat: 49.9,
    carbs: 21.6,
    category: "Орехи",
  },
  {
    name: "Оливковое масло",
    calories: 884,
    protein: 0,
    fat: 100,
    carbs: 0,
    category: "Масла",
  },
];

const seedStaticData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB подключена");

    await Exercise.deleteMany({});
    await Food.deleteMany({});

    await Exercise.insertMany(exercises);
    await Food.insertMany(foods);

    console.log("Упражнения добавлены:", exercises.length);
    console.log("Продукты добавлены:", foods.length);
    console.log("База успешно заполнена");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Ошибка при заполнении базы:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedStaticData();