import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const {
      height,
      weight,
      goal,
      activityLevel,
      targetCalories,
      targetProtein,
      targetFat,
      targetCarbs,
    } = req.body;

    user.height = height ?? user.height;
    user.weight = weight ?? user.weight;
    user.goal = goal ?? user.goal;
    user.activityLevel = activityLevel ?? user.activityLevel;
    user.targetCalories = targetCalories ?? user.targetCalories;
    user.targetProtein = targetProtein ?? user.targetProtein;
    user.targetFat = targetFat ?? user.targetFat;
    user.targetCarbs = targetCarbs ?? user.targetCarbs;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};