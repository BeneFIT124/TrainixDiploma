import mongoose from "mongoose";

const nutritionPlanItemSchema = new mongoose.Schema(
  {
    nutritionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NutritionPlan",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    grams: {
      type: Number,
      required: true,
      min: 1,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    itemOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
    comment: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const NutritionPlanItem = mongoose.model(
  "NutritionPlanItem",
  nutritionPlanItemSchema
);

export default NutritionPlanItem;