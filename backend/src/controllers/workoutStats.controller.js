import Workout from "../models/Workout.js";
import WorkoutItem from "../models/WorkoutItem.js";
import WorkoutSet from "../models/WorkoutSet.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getWeeklyWorkoutSummary = async (req, res) => {
  try {
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const workouts = await Workout.find({
      user: req.user._id,
      workoutDate: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const workoutIds = workouts.map((workout) => workout._id);

    const workoutItems = await WorkoutItem.find({
      workout: { $in: workoutIds },
    });

    const workoutItemIds = workoutItems.map((item) => item._id);

    const workoutSets = await WorkoutSet.find({
      workoutItem: { $in: workoutItemIds },
    });

    const totalDuration = workouts.reduce(
      (sum, workout) => sum + (workout.durationMinutes || 0),
      0
    );

    const completedWorkoutsCount = workouts.filter(
      (workout) => workout.status === "completed"
    ).length;

    const totalReps = workoutSets.reduce(
      (sum, set) => sum + (set.reps || 0),
      0
    );

    res.status(200).json({
      period: {
        startOfWeek,
        endOfWeek,
      },
      workoutsCount: workouts.length,
      completedWorkoutsCount,
      totalDuration,
      totalExercises: workoutItems.length,
      totalSets: workoutSets.length,
      totalReps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExerciseProgress = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    if (!exerciseId || exerciseId === "undefined" || !isValidObjectId(exerciseId)) {
      return res.status(400).json({ message: "Некорректный идентификатор упражнения" });
    }

    const workouts = await Workout.find({ user: req.user._id }).select(
      "_id workoutDate title"
    );

    const workoutMap = new Map(
      workouts.map((workout) => [workout._id.toString(), workout])
    );

    const workoutIds = workouts.map((workout) => workout._id);

    const workoutItems = await WorkoutItem.find({
      workout: { $in: workoutIds },
      exercise: exerciseId,
    }).sort({ createdAt: 1 });

    const workoutItemIds = workoutItems.map((item) => item._id);

    const workoutSets = await WorkoutSet.find({
      workoutItem: { $in: workoutItemIds },
    }).sort({ createdAt: 1, setNumber: 1 });

    const workoutItemMap = new Map(
      workoutItems.map((item) => [item._id.toString(), item])
    );

    const progress = workoutSets.map((set) => {
      const item = workoutItemMap.get(set.workoutItem.toString());
      const workout = item ? workoutMap.get(item.workout.toString()) : null;

      return {
        setId: set._id,
        workoutId: workout ? workout._id : null,
        workoutTitle: workout ? workout.title : null,
        workoutDate: workout ? workout.workoutDate : null,
        setNumber: set.setNumber,
        reps: set.reps,
        weightKg: set.weightKg,
      };
    });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
