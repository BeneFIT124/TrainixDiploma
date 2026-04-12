import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "trainer", "admin"],
      default: "user",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    goal: {
      type: String,
      enum: ["lose_weight", "gain_muscle", "maintain"],
      default: "maintain",
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "sedentary",
    },
    targetCalories: {
      type: Number,
      default: null,
    },
    targetProtein: {
      type: Number,
      default: null,
    },
    targetCarbs: {
      type: Number,
      default: null,
    },
    targetFat: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;