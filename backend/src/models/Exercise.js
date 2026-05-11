import mongoose from "mongoose";

const MUSCLE_GROUPS = [
  "chest",
  "upper_chest",
  "lower_chest",
  "back",
  "lats",
  "traps",
  "lower_back",
  "shoulders",
  "front_delts",
  "middle_delts",
  "rear_delts",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "cardio",
  "full_body",
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
      default: null,
      enum: [
        "trainer",
        "dumbbells",
        "barbell",
        "kettlebell",
        "cable_machine",
        "bodyweight",
        "other",
      ],
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