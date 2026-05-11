import WorkoutPlan from "../models/WorkoutPlan.js";
import WorkoutPlanItem from "../models/WorkoutPlanItem.js";
import TrainerProfile from "../models/TrainerProfile.js";
import Exercise from "../models/Exercise.js";

export const createWorkoutPlan = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const {
      title,
      description,
      goalType,
      difficultyLevel,
      durationWeeks,
      price,
      isActive,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Название плана обязательно" });
    }

    const workoutPlan = await WorkoutPlan.create({
      trainerProfile: trainerProfile._id,
      title,
      description: description || null,
      goalType: goalType || "maintain",
      difficultyLevel: difficultyLevel || "beginner",
      durationWeeks: durationWeeks || 1,
      price: price || 0,
      isActive: isActive ?? true,
    });

    res.status(201).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWorkoutPlans = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      trainerProfile: trainerProfile._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workoutPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutPlanById = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    res.status(200).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkoutPlan = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    const {
      title,
      description,
      goalType,
      difficultyLevel,
      durationWeeks,
      price,
      isActive,
    } = req.body;

    workoutPlan.title = title ?? workoutPlan.title;
    workoutPlan.description = description ?? workoutPlan.description;
    workoutPlan.goalType = goalType ?? workoutPlan.goalType;
    workoutPlan.difficultyLevel =
      difficultyLevel ?? workoutPlan.difficultyLevel;
    workoutPlan.durationWeeks = durationWeeks ?? workoutPlan.durationWeeks;
    workoutPlan.price = price ?? workoutPlan.price;
    workoutPlan.isActive = isActive ?? workoutPlan.isActive;

    await workoutPlan.save();

    res.status(200).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkoutPlan = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    await WorkoutPlanItem.deleteMany({ workoutPlan: workoutPlan._id });
    await workoutPlan.deleteOne();

    res.status(200).json({ message: "План удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWorkoutPlanItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { exerciseId, dayNumber, exerciseOrder, sets, reps, comment } =
      req.body;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({ message: "Упражнение не найдено" });
    }

    if (!dayNumber || !sets || !reps) {
      return res.status(400).json({
        message: "dayNumber, sets и reps обязательны",
      });
    }

    const item = await WorkoutPlanItem.create({
      workoutPlan: workoutPlan._id,
      exercise: exercise._id,
      dayNumber,
      exerciseOrder: exerciseOrder || 1,
      sets,
      reps,
      comment: comment || null,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutPlanItems = async (req, res) => {
  try {
    const { planId } = req.params;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    const items = await WorkoutPlanItem.find({
      workoutPlan: planId,
    })
      .populate("exercise")
      .sort({ dayNumber: 1, exerciseOrder: 1, createdAt: 1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkoutPlanItem = async (req, res) => {
  try {
    const { planId, itemId } = req.params;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "План не найден" });
    }

    const item = await WorkoutPlanItem.findOne({
      _id: itemId,
      workoutPlan: planId,
    });

    if (!item) {
      return res.status(404).json({ message: "Элемент плана не найден" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Элемент плана удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};