import Meal from "../models/Meal.js";
import Workout from "../models/Workout.js";

export const getMyStatistics = async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayMeals, weeklyWorkouts, monthlyWorkouts, completedWorkouts] =
      await Promise.all([
        Meal.find({
          user: req.user._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        }),
        Workout.countDocuments({
          user: req.user._id,
          workoutDate: { $gte: startOfWeek },
        }),
        Workout.countDocuments({
          user: req.user._id,
          workoutDate: { $gte: startOfMonth },
        }),
        Workout.countDocuments({
          user: req.user._id,
          status: "completed",
        }),
      ]);

    const nutrition = todayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories || 0;
        acc.protein += meal.totalProtein || 0;
        acc.fat += meal.totalFat || 0;
        acc.carbs += meal.totalCarbs || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    res.status(200).json({
      currentWeight: req.user.weight || null,
      weeklyWorkouts,
      monthlyWorkouts,
      completedWorkouts,
      caloriesTarget: req.user.targetCalories || 0,
      proteinTarget: req.user.targetProtein || 0,
      fatTarget: req.user.targetFat || 0,
      carbsTarget: req.user.targetCarbs || 0,
      todayCalories: Number(nutrition.calories.toFixed(2)),
      todayProtein: Number(nutrition.protein.toFixed(2)),
      todayFat: Number(nutrition.fat.toFixed(2)),
      todayCarbs: Number(nutrition.carbs.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
