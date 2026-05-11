import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    workoutDate: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["planned", "completed"],
      default: "planned",
    },
    comment: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;