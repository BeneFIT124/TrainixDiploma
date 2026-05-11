import mongoose from "mongoose";

const workoutSetSchema = new mongoose.Schema(
  {
    workoutItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutItem",
      required: true,
    },
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const WorkoutSet = mongoose.model("WorkoutSet", workoutSetSchema);

export default WorkoutSet;