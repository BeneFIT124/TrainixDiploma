import mongoose from "mongoose";

const workoutPlanItemSchema = new mongoose.Schema(
  {
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    exerciseOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: Number,
      required: true,
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

const WorkoutPlanItem = mongoose.model("WorkoutPlanItem", workoutPlanItemSchema);

export default WorkoutPlanItem;