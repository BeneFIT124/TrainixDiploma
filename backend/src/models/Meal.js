import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;