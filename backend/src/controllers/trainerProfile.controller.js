import NutritionPlan from "../models/NutritionPlan.js";
import TrainerProfile from "../models/TrainerProfile.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const serializeWorkoutPlan = (plan, trainerProfile) => ({
  id: plan._id,
  _id: plan._id,
  type: "workout",
  title: plan.title,
  description: plan.description,
  goalType: plan.goalType,
  difficultyLevel: plan.difficultyLevel,
  durationWeeks: plan.durationWeeks,
  price: plan.price,
  isActive: plan.isActive,
  trainerProfile,
  createdAt: plan.createdAt,
});

const serializeNutritionPlan = (plan, trainerProfile) => ({
  id: plan._id,
  _id: plan._id,
  type: "nutrition",
  title: plan.title,
  description: plan.description,
  goalType: plan.goalType,
  dailyCalories: plan.dailyCalories,
  dailyProtein: plan.dailyProtein,
  dailyFat: plan.dailyFat,
  dailyCarbs: plan.dailyCarbs,
  price: plan.price,
  isActive: plan.isActive,
  trainerProfile,
  createdAt: plan.createdAt,
});

const groupPlansByTrainerProfile = (plans) => {
  return plans.reduce((groups, plan) => {
    const key = String(plan.trainerProfile);
    const group = groups.get(key) || [];
    group.push(plan);
    groups.set(key, group);
    return groups;
  }, new Map());
};

const serializeTrainerProfile = (
  profile,
  workoutPlansByTrainer,
  nutritionPlansByTrainer
) => {
  const trainerProfile = profile.toObject();
  const trainerProfileId = String(trainerProfile._id);

  return {
    ...trainerProfile,
    id: trainerProfile._id,
    workoutPlans: (workoutPlansByTrainer.get(trainerProfileId) || []).map((plan) =>
      serializeWorkoutPlan(plan, trainerProfile)
    ),
    nutritionPlans: (nutritionPlansByTrainer.get(trainerProfileId) || []).map(
      (plan) => serializeNutritionPlan(plan, trainerProfile)
    ),
  };
};

const withTrainerPlans = async (profiles) => {
  const trainerProfileIds = profiles.map((profile) => profile._id);

  const [workoutPlans, nutritionPlans] = await Promise.all([
    WorkoutPlan.find({
      trainerProfile: { $in: trainerProfileIds },
      isActive: true,
    }).sort({ createdAt: -1 }),
    NutritionPlan.find({
      trainerProfile: { $in: trainerProfileIds },
      isActive: true,
    }).sort({ createdAt: -1 }),
  ]);

  const workoutPlansByTrainer = groupPlansByTrainerProfile(workoutPlans);
  const nutritionPlansByTrainer = groupPlansByTrainerProfile(nutritionPlans);

  return profiles.map((profile) =>
    serializeTrainerProfile(profile, workoutPlansByTrainer, nutritionPlansByTrainer)
  );
};

export const getTrainerProfiles = async (req, res) => {
  try {
    const profiles = await TrainerProfile.find({ isVerified: true })
      .populate("user", "username email avatarUrl role")
      .sort({ ratingAvg: -1, createdAt: -1 });

    const profilesWithPlans = await withTrainerPlans(profiles);

    res.status(200).json(profilesWithPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrainerProfileById = async (req, res) => {
  try {
    if (
      !req.params.id ||
      req.params.id === "undefined" ||
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({ message: "Некорректный идентификатор тренера" });
    }

    const profile = await TrainerProfile.findOne({
      _id: req.params.id,
      isVerified: true,
    }).populate("user", "username email avatarUrl role");

    if (!profile) {
      return res.status(404).json({ message: "Профиль тренера не найден" });
    }

    const [profileWithPlans] = await withTrainerPlans([profile]);

    res.status(200).json(profileWithPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrainerProfile = async (req, res) => {
  try {
    const { bio, specialization, experienceYears } = req.body;

    const existingProfile = await TrainerProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Профиль тренера уже существует",
      });
    }

    const profile = await TrainerProfile.create({
      user: req.user._id,
      bio: bio || null,
      specialization: specialization || null,
      experienceYears: experienceYears || 0,
      isVerified: req.user.role === "trainer",
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTrainerProfile = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({
      user: req.user._id,
    }).populate("user", "username email avatarUrl role");

    if (!profile) {
      return res.status(404).json({ message: "Профиль тренера не найден" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTrainerProfile = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Профиль тренера не найден" });
    }

    const { bio, specialization, experienceYears } = req.body;

    profile.bio = bio ?? profile.bio;
    profile.specialization = specialization ?? profile.specialization;
    profile.experienceYears = experienceYears ?? profile.experienceYears;

    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
