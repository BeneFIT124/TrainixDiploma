import Workout from "../models/Workout.js";
import WorkoutItem from "../models/WorkoutItem.js";
import WorkoutSet from "../models/WorkoutSet.js";
import Exercise from "../models/Exercise.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateObjectId = (id, res, message = "Некорректный идентификатор") => {
  if (!id || id === "undefined" || !isValidObjectId(id)) {
    res.status(400).json({ message });
    return false;
  }

  return true;
};

export const createWorkout = async (req, res) => {
  try {
    const { title, workoutDate, durationMinutes, status, comment } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Название тренировки обязательно" });
    }

    const workout = await Workout.create({
      user: req.user._id,
      title,
      workoutDate: workoutDate || new Date(),
      durationMinutes: durationMinutes || 0,
      status: status || "planned",
      comment: comment || null,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({
      workoutDate: -1,
    });

    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLastExerciseSets = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    if (!validateObjectId(exerciseId, res, "Некорректный идентификатор упражнения")) {
      return;
    }

    const previousItems = await WorkoutItem.find({
      exercise: exerciseId,
    }).sort({ createdAt: -1 });

    for (const item of previousItems) {
      const workout = await Workout.findOne({
        _id: item.workout,
        user: req.user._id,
      });

      if (!workout) {
        continue;
      }

      const sets = await WorkoutSet.find({
        workoutItem: item._id,
      }).sort({ setNumber: 1 });

      if (sets.length > 0) {
        return res.status(200).json(sets);
      }
    }

    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const { title, workoutDate, durationMinutes, status, comment } = req.body;

    workout.title = title ?? workout.title;
    workout.workoutDate = workoutDate ?? workout.workoutDate;
    workout.durationMinutes = durationMinutes ?? workout.durationMinutes;
    workout.status = status ?? workout.status;
    workout.comment = comment ?? workout.comment;

    await workout.save();

    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const items = await WorkoutItem.find({ workout: workout._id }).select("_id");
    const itemIds = items.map((item) => item._id);

    await WorkoutSet.deleteMany({ workoutItem: { $in: itemIds } });
    await WorkoutItem.deleteMany({ workout: workout._id });
    await workout.deleteOne();

    res.status(200).json({ message: "Тренировка удалена" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWorkoutItem = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { exerciseId, exerciseOrder, comment, useLastSets } = req.body;

    if (!validateObjectId(workoutId, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    if (!exerciseId) {
      return res.status(400).json({ message: "exerciseId обязателен" });
    }

    if (!validateObjectId(exerciseId, res, "Некорректный идентификатор упражнения")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({ message: "Упражнение не найдено" });
    }

    const workoutItem = await WorkoutItem.create({
      workout: workout._id,
      exercise: exercise._id,
      exerciseOrder: exerciseOrder || 1,
      comment: comment || null,
    });

    let copiedSets = [];

    if (useLastSets) {
      const previousWorkoutItems = await WorkoutItem.find({
        exercise: exerciseId,
      }).sort({ createdAt: -1 });

      let lastWorkoutItem = null;

      for (const item of previousWorkoutItems) {
        const itemWorkout = await Workout.findOne({
          _id: item.workout,
          user: req.user._id,
        });

        if (itemWorkout && itemWorkout._id.toString() !== workoutId) {
          lastWorkoutItem = item;
          break;
        }
      }

      if (lastWorkoutItem) {
        const lastSets = await WorkoutSet.find({
          workoutItem: lastWorkoutItem._id,
        }).sort({ setNumber: 1 });

        if (lastSets.length > 0) {
          copiedSets = await WorkoutSet.insertMany(
            lastSets.map((set) => ({
              workoutItem: workoutItem._id,
              setNumber: set.setNumber,
              reps: set.reps,
              weightKg: set.weightKg,
            }))
          );
        }
      }
    }

    res.status(201).json({
      workoutItem,
      copiedSets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutItems = async (req, res) => {
  try {
    const { workoutId } = req.params;

    if (!validateObjectId(workoutId, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const items = await WorkoutItem.find({ workout: workoutId })
      .populate("exercise")
      .sort({ exerciseOrder: 1, createdAt: 1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkoutItem = async (req, res) => {
  try {
    const { workoutId, itemId } = req.params;

    if (!validateObjectId(workoutId, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    if (!validateObjectId(itemId, res, "Некорректный идентификатор элемента тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const item = await WorkoutItem.findOne({
      _id: itemId,
      workout: workoutId,
    });

    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    const { exerciseOrder, comment } = req.body;

    item.exerciseOrder = exerciseOrder ?? item.exerciseOrder;
    item.comment = comment ?? item.comment;

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkoutItem = async (req, res) => {
  try {
    const { workoutId, itemId } = req.params;

    if (!validateObjectId(workoutId, res, "Некорректный идентификатор тренировки")) {
      return;
    }

    if (!validateObjectId(itemId, res, "Некорректный идентификатор элемента тренировки")) {
      return;
    }

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Тренировка не найдена" });
    }

    const item = await WorkoutItem.findOne({
      _id: itemId,
      workout: workoutId,
    });

    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    await WorkoutSet.deleteMany({ workoutItem: item._id });
    await item.deleteOne();

    res.status(200).json({ message: "Элемент тренировки удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
