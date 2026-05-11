import mongoose from "mongoose";

const workoutPlanSchema = new mongoose.Schema(
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
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    durationWeeks: {
      type: Number,
      default: 1,
      min: 1,
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

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;