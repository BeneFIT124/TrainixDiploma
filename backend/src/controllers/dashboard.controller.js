import Meal from "../models/Meal.js";
import Workout from "../models/Workout.js";
import WorkoutItem from "../models/WorkoutItem.js";
import WorkoutSet from "../models/WorkoutSet.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // ===== Сегодня =====
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // ===== Неделя =====
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // ===== Питание за сегодня =====
    const todayMeals = await Meal.find({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const nutritionConsumed = todayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories || 0;
        acc.protein += meal.totalProtein || 0;
        acc.fat += meal.totalFat || 0;
        acc.carbs += meal.totalCarbs || 0;
        return acc;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      }
    );

    // ===== Тренировки за сегодня =====
    const todayWorkouts = await Workout.find({
      user: userId,
      workoutDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const todayWorkoutIds = todayWorkouts.map((workout) => workout._id);

    const todayWorkoutItems = await WorkoutItem.find({
      workout: { $in: todayWorkoutIds },
    });

    const todayWorkoutItemIds = todayWorkoutItems.map((item) => item._id);

    const todayWorkoutSets = await WorkoutSet.find({
      workoutItem: { $in: todayWorkoutItemIds },
    });

    // ===== Последняя тренировка =====
    const lastWorkout = await Workout.findOne({ user: userId }).sort({
      workoutDate: -1,
      createdAt: -1,
    });

    let lastWorkoutData = null;

    if (lastWorkout) {
      const lastWorkoutItems = await WorkoutItem.find({
        workout: lastWorkout._id,
      });

      const lastWorkoutItemIds = lastWorkoutItems.map((item) => item._id);

      const lastWorkoutSets = await WorkoutSet.find({
        workoutItem: { $in: lastWorkoutItemIds },
      });

      lastWorkoutData = {
        id: lastWorkout._id,
        title: lastWorkout.title,
        date: lastWorkout.workoutDate,
        status: lastWorkout.status,
        exercisesCount: lastWorkoutItems.length,
        setsCount: lastWorkoutSets.length,
        durationMinutes: lastWorkout.durationMinutes || 0,
      };
    }

    // ===== Недельная статистика =====
    const weeklyWorkouts = await Workout.find({
      user: userId,
      workoutDate: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const weeklyWorkoutIds = weeklyWorkouts.map((workout) => workout._id);

    const weeklyWorkoutItems = await WorkoutItem.find({
      workout: { $in: weeklyWorkoutIds },
    });

    const weeklyWorkoutItemIds = weeklyWorkoutItems.map((item) => item._id);

    const weeklyWorkoutSets = await WorkoutSet.find({
      workoutItem: { $in: weeklyWorkoutItemIds },
    });

    const totalWeeklyReps = weeklyWorkoutSets.reduce(
      (sum, set) => sum + (set.reps || 0),
      0
    );

    const totalWeeklyDuration = weeklyWorkouts.reduce(
      (sum, workout) => sum + (workout.durationMinutes || 0),
      0
    );

    const completedWeeklyWorkouts = weeklyWorkouts.filter(
      (workout) => workout.status === "completed"
    ).length;

    res.status(200).json({
      nutrition: {
        consumed: {
          calories: Number(nutritionConsumed.calories.toFixed(2)),
          protein: Number(nutritionConsumed.protein.toFixed(2)),
          fat: Number(nutritionConsumed.fat.toFixed(2)),
          carbs: Number(nutritionConsumed.carbs.toFixed(2)),
        },
        targets: {
          calories: req.user.targetCalories || 0,
          protein: req.user.targetProtein || 0,
          fat: req.user.targetFat || 0,
          carbs: req.user.targetCarbs || 0,
        },
        remaining: {
          calories: Number(
            ((req.user.targetCalories || 0) - nutritionConsumed.calories).toFixed(2)
          ),
          protein: Number(
            ((req.user.targetProtein || 0) - nutritionConsumed.protein).toFixed(2)
          ),
          fat: Number(
            ((req.user.targetFat || 0) - nutritionConsumed.fat).toFixed(2)
          ),
          carbs: Number(
            ((req.user.targetCarbs || 0) - nutritionConsumed.carbs).toFixed(2)
          ),
        },
        mealsCount: todayMeals.length,
      },

      todayWorkout: {
        hasWorkout: todayWorkouts.length > 0,
        workoutsCount: todayWorkouts.length,
        exercisesCount: todayWorkoutItems.length,
        setsCount: todayWorkoutSets.length,
      },

      lastWorkout: lastWorkoutData,

      weeklyStats: {
        period: {
          startOfWeek,
          endOfWeek,
        },
        workoutsCount: weeklyWorkouts.length,
        completedWorkoutsCount: completedWeeklyWorkouts,
        exercisesCount: weeklyWorkoutItems.length,
        setsCount: weeklyWorkoutSets.length,
        repsCount: totalWeeklyReps,
        totalDuration: totalWeeklyDuration,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};