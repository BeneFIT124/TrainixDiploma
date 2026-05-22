import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import foodRoutes from "./routes/food.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import workoutSetRoutes from "./routes/workoutSet.routes.js";
import workoutStatsRoutes from "./routes/workoutStats.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import trainerProfileRoutes from "./routes/trainerProfile.routes.js";
import trainerApplicationRoutes from "./routes/trainerApplication.routes.js";
import workoutPlanRoutes from "./routes/workoutPlan.routes.js";
import nutritionPlanRoutes from "./routes/nutritionPlan.routes.js";
import planRoutes from "./routes/plan.routes.js";
import statisticsRoutes from "./routes/statistics.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/workout-items", workoutSetRoutes);
app.use("/api/workout-stats", workoutStatsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trainer-profiles", trainerProfileRoutes);
app.use("/api/trainer-applications", trainerApplicationRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/nutrition-plans", nutritionPlanRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/statistics", statisticsRoutes);

export default app;
