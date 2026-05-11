import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema(
  {
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
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
    },
    protein: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const MealItem = mongoose.model("MealItem", mealItemSchema);

export default MealItem;