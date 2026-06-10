import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateKey: {
      type: String,
      required: true,
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

mealSchema.pre("validate", function setDateKey(next) {
  const sourceDate = this.date ? new Date(this.date) : new Date();
  this.dateKey = sourceDate.toISOString().slice(0, 10);
  next();
});

mealSchema.index(
  { user: 1, dateKey: 1, mealType: 1 },
  {
    unique: true,
    partialFilterExpression: { dateKey: { $type: "string" } },
  }
);

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
