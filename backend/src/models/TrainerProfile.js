import mongoose from "mongoose";

const trainerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    specialization: {
      type: String,
      default: null,
      maxlength: 255,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const TrainerProfile = mongoose.model("TrainerProfile", trainerProfileSchema);

export default TrainerProfile;