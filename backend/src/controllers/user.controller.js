import User from "../models/User.js";
import TrainerProfile from "../models/TrainerProfile.js";

const calculateNutritionTargets = (weight, goal) => {
  const caloriesMultiplier =
    goal === "lose_weight" ? 25 : goal === "gain_muscle" ? 35 : 30;
  const targetCalories = Math.round(weight * caloriesMultiplier);
  const targetProtein = Math.round(weight * 1.8);
  const targetFat = Math.round(weight * 0.9);
  const targetCarbs = Math.max(
    0,
    Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4)
  );

  return {
    targetCalories,
    targetProtein,
    targetFat,
    targetCarbs,
  };
};

const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  height: user.height,
  weight: user.weight,
  goal: user.goal,
  activityLevel: user.activityLevel,
  targetCalories: user.targetCalories,
  targetProtein: user.targetProtein,
  targetCarbs: user.targetCarbs,
  targetFat: user.targetFat,
  createdAt: user.createdAt,
});

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const {
      username,
      height,
      weight,
      goal,
      activityLevel,
      targetCalories,
      targetProtein,
      targetFat,
      targetCarbs,
    } = req.body;

    user.username = username ?? user.username;
    user.height = height ?? user.height;
    user.weight = weight ?? user.weight;
    user.goal = goal ?? user.goal;
    user.activityLevel = activityLevel ?? user.activityLevel;
    user.targetCalories = targetCalories ?? user.targetCalories;
    user.targetProtein = targetProtein ?? user.targetProtein;
    user.targetFat = targetFat ?? user.targetFat;
    user.targetCarbs = targetCarbs ?? user.targetCarbs;

    if (user.weight && user.goal && targetCalories == null) {
      const targets = calculateNutritionTargets(user.weight, user.goal);
      user.targetCalories = targets.targetCalories;
      user.targetProtein = targetProtein ?? targets.targetProtein;
      user.targetFat = targetFat ?? targets.targetFat;
      user.targetCarbs = targetCarbs ?? targets.targetCarbs;
    }

    await user.save();

    res.status(200).json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const becomeTrainerDemo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user.role !== "trainer" && user.role !== "admin") {
      user.role = "trainer";
      await user.save();
    }

    await TrainerProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          isVerified: true,
        },
        $setOnInsert: {
          user: user._id,
          bio: "Демо-тренер Trainix",
          specialization: "Фитнес",
          experienceYears: 0,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
