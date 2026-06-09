import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanPurchase",
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ trainerProfile: 1, createdAt: -1 });
reviewSchema.index({ user: 1, purchase: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
