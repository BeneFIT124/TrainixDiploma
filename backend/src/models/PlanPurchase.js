import mongoose from "mongoose";

const planPurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["workout", "nutrition"],
      required: true,
    },
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      default: null,
    },
    nutritionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NutritionPlan",
      default: null,
    },
    trainerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

planPurchaseSchema.index(
  { user: 1, planType: 1, workoutPlan: 1 },
  {
    unique: true,
    partialFilterExpression: { workoutPlan: { $type: "objectId" } },
  }
);

planPurchaseSchema.index(
  { user: 1, planType: 1, nutritionPlan: 1 },
  {
    unique: true,
    partialFilterExpression: { nutritionPlan: { $type: "objectId" } },
  }
);

const PlanPurchase = mongoose.model("PlanPurchase", planPurchaseSchema);

export default PlanPurchase;
