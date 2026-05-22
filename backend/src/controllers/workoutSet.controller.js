import Workout from "../models/Workout.js";
import WorkoutItem from "../models/WorkoutItem.js";
import WorkoutSet from "../models/WorkoutSet.js";

export const addWorkoutSet = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { setNumber, reps, weightKg } = req.body;

    if (setNumber == null || reps == null || weightKg == null) {
      return res.status(400).json({
        message: "setNumber, reps и weightKg обязательны",
      });
    }

    const item = await WorkoutItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    const workout = await Workout.findOne({
      _id: item.workout,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(403).json({ message: "Нет доступа к этой тренировке" });
    }

    const workoutSet = await WorkoutSet.create({
      workoutItem: item._id,
      setNumber,
      reps,
      weightKg,
    });

    res.status(201).json(workoutSet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutSets = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await WorkoutItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    const workout = await Workout.findOne({
      _id: item.workout,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(403).json({ message: "Нет доступа к этой тренировке" });
    }

    const sets = await WorkoutSet.find({ workoutItem: itemId }).sort({
      setNumber: 1,
      createdAt: 1,
    });

    res.status(200).json(sets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkoutSet = async (req, res) => {
  try {
    const { itemId, setId } = req.params;
    const { setNumber, reps, weightKg } = req.body;

    const item = await WorkoutItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    const workout = await Workout.findOne({
      _id: item.workout,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(403).json({ message: "Нет доступа к этой тренировке" });
    }

    const set = await WorkoutSet.findOne({
      _id: setId,
      workoutItem: itemId,
    });

    if (!set) {
      return res.status(404).json({ message: "Подход не найден" });
    }

    set.setNumber = setNumber ?? set.setNumber;
    set.reps = reps ?? set.reps;
    set.weightKg = weightKg ?? set.weightKg;

    await set.save();

    res.status(200).json(set);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkoutSet = async (req, res) => {
  try {
    const { itemId, setId } = req.params;

    const item = await WorkoutItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Элемент тренировки не найден" });
    }

    const workout = await Workout.findOne({
      _id: item.workout,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(403).json({ message: "Нет доступа к этой тренировке" });
    }

    const set = await WorkoutSet.findOne({
      _id: setId,
      workoutItem: itemId,
    });

    if (!set) {
      return res.status(404).json({ message: "Подход не найден" });
    }

    await set.deleteOne();

    res.status(200).json({ message: "Подход удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
