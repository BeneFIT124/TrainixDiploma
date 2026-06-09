import mongoose from "mongoose";

const MUSCLE_GROUPS = [
  "Грудные мышцы",
  "Верх груди",
  "Низ груди",
  "Спина",
  "Широчайшие мышцы",
  "Трапеции",
  "Поясница",
  "Плечи",
  "Передняя дельта",
  "Средняя дельта",
  "Задняя дельта",
  "Бицепс",
  "Трицепс",
  "Предплечья",
  "Пресс",
  "Косые мышцы живота",
  "Ягодицы",
  "Квадрицепс",
  "Бицепс бедра",
  "Икры",
  "Кардио",
  "Все тело"
];

const EQUIPMENT_TYPES = [
  "Штанга",
  "Гантели",
  "Тренажер",
  "Блочный тренажер",
  "Собственный вес",
  "Скамья",
  "Турник",
  "Брусья",
  "Кроссовер",
  "Кардиотренажер",
  "Гиря",
  "Эспандер",
  "Без оборудования"
];

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    primaryMuscleGroup: {
      type: String,
      required: true,
      enum: MUSCLE_GROUPS,
    },

    secondaryMuscleGroups: {
      type: [String],
      enum: MUSCLE_GROUPS,
      default: [],
      validate: {
        validator: function (groups) {
          return Array.isArray(groups) && groups.length <= 5;
        },
        message: "Можно указать не более 5 дополнительных групп мышц",
      },
    },

    description: {
      type: String,
      default: null,
      maxlength: 1000,
    },

    equipment: {
      type: String,
      default: "Без оборудования",
      enum: EQUIPMENT_TYPES,
    },
  },
  { timestamps: true }
);

exerciseSchema.pre("save", function () {
  if (Array.isArray(this.secondaryMuscleGroups)) {
    this.secondaryMuscleGroups = [...new Set(this.secondaryMuscleGroups)].filter(
      (group) => group !== this.primaryMuscleGroup
    );
  }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;