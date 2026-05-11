import mongoose from "mongoose";

const nutritionPlanSchema = new mongoose.Schema(
  {
    trainerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    goalType: {
      type: String,
      enum: ["lose_weight", "gain_muscle", "maintain"],
      default: "maintain",
    },
    dailyCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyProtein: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyFat: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyCarbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const NutritionPlan = mongoose.model("NutritionPlan", nutritionPlanSchema);

export default NutritionPlan;