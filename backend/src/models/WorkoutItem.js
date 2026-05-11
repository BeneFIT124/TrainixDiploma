import mongoose from "mongoose";

const workoutItemSchema = new mongoose.Schema(
  {
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    exerciseOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
    comment: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const WorkoutItem = mongoose.model("WorkoutItem", workoutItemSchema);

export default WorkoutItem;