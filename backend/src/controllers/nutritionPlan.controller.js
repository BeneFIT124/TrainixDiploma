import NutritionPlan from "../models/NutritionPlan.js";
import NutritionPlanItem from "../models/NutritionPlanItem.js";
import TrainerProfile from "../models/TrainerProfile.js";
import Food from "../models/Food.js";

export const createNutritionPlan = async (req, res) => {
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
      dailyCalories,
      dailyProtein,
      dailyFat,
      dailyCarbs,
      price,
      isActive,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Название плана обязательно" });
    }

    const nutritionPlan = await NutritionPlan.create({
      trainerProfile: trainerProfile._id,
      title,
      description: description || null,
      goalType: goalType || "maintain",
      dailyCalories: dailyCalories || 0,
      dailyProtein: dailyProtein || 0,
      dailyFat: dailyFat || 0,
      dailyCarbs: dailyCarbs || 0,
      price: price || 0,
      isActive: isActive ?? true,
    });

    res.status(201).json(nutritionPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyNutritionPlans = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlans = await NutritionPlan.find({
      trainerProfile: trainerProfile._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(nutritionPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNutritionPlanById = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    res.status(200).json(nutritionPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNutritionPlan = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    const {
      title,
      description,
      goalType,
      dailyCalories,
      dailyProtein,
      dailyFat,
      dailyCarbs,
      price,
      isActive,
    } = req.body;

    nutritionPlan.title = title ?? nutritionPlan.title;
    nutritionPlan.description = description ?? nutritionPlan.description;
    nutritionPlan.goalType = goalType ?? nutritionPlan.goalType;
    nutritionPlan.dailyCalories = dailyCalories ?? nutritionPlan.dailyCalories;
    nutritionPlan.dailyProtein = dailyProtein ?? nutritionPlan.dailyProtein;
    nutritionPlan.dailyFat = dailyFat ?? nutritionPlan.dailyFat;
    nutritionPlan.dailyCarbs = dailyCarbs ?? nutritionPlan.dailyCarbs;
    nutritionPlan.price = price ?? nutritionPlan.price;
    nutritionPlan.isActive = isActive ?? nutritionPlan.isActive;

    await nutritionPlan.save();

    res.status(200).json(nutritionPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNutritionPlan = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: req.params.id,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    await NutritionPlanItem.deleteMany({ nutritionPlan: nutritionPlan._id });
    await nutritionPlan.deleteOne();

    res.status(200).json({ message: "План питания удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNutritionPlanItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { mealType, foodId, grams, itemOrder, comment } = req.body;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    if (!mealType || !foodId || grams == null) {
      return res.status(400).json({
        message: "mealType, foodId и grams обязательны",
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    const factor = grams / 100;

    const calories = Number((food.calories * factor).toFixed(2));
    const protein = Number((food.protein * factor).toFixed(2));
    const fat = Number((food.fat * factor).toFixed(2));
    const carbs = Number((food.carbs * factor).toFixed(2));

    const item = await NutritionPlanItem.create({
      nutritionPlan: nutritionPlan._id,
      mealType,
      food: food._id,
      grams,
      calories,
      protein,
      fat,
      carbs,
      itemOrder: itemOrder || 1,
      comment: comment || null,
    });

    const populatedItem = await NutritionPlanItem.findById(item._id).populate("food");

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNutritionPlanItems = async (req, res) => {
  try {
    const { planId } = req.params;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    const items = await NutritionPlanItem.find({
      nutritionPlan: planId,
    })
      .populate("food")
      .sort({ mealType: 1, itemOrder: 1, createdAt: 1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNutritionPlanItem = async (req, res) => {
  try {
    const { planId, itemId } = req.params;

    const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });

    if (!trainerProfile) {
      return res.status(403).json({
        message: "Профиль тренера не найден",
      });
    }

    const nutritionPlan = await NutritionPlan.findOne({
      _id: planId,
      trainerProfile: trainerProfile._id,
    });

    if (!nutritionPlan) {
      return res.status(404).json({ message: "План питания не найден" });
    }

    const item = await NutritionPlanItem.findOne({
      _id: itemId,
      nutritionPlan: planId,
    });

    if (!item) {
      return res.status(404).json({ message: "Элемент плана питания не найден" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Элемент плана питания удалён" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};