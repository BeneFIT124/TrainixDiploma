import Meal from "../models/Meal.js";
import MealItem from "../models/MealItem.js";
import Food from "../models/Food.js";

export const createMeal = async (req, res) => {
  try {
    const { mealType, date, comment } = req.body;

    const meal = await Meal.create({
      user: req.user._id,
      mealType,
      date: date || new Date(),
      comment: comment || null,
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user._id }).sort({ date: -1 });

    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMealItem = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { foodId, grams } = req.body;

    const meal = await Meal.findOne({ _id: mealId, user: req.user._id });
    if (!meal) {
      return res.status(404).json({ message: "Прием пищи не найден" });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    const factor = grams / 100;

    const itemCalories = Number((food.calories * factor).toFixed(2));
    const itemProtein = Number((food.protein * factor).toFixed(2));
    const itemFat = Number((food.fat * factor).toFixed(2));
    const itemCarbs = Number((food.carbs * factor).toFixed(2));

    const mealItem = await MealItem.create({
      meal: meal._id,
      food: food._id,
      grams,
      calories: itemCalories,
      protein: itemProtein,
      fat: itemFat,
      carbs: itemCarbs,
    });

    meal.totalCalories = Number((meal.totalCalories + itemCalories).toFixed(2));
    meal.totalProtein = Number((meal.totalProtein + itemProtein).toFixed(2));
    meal.totalFat = Number((meal.totalFat + itemFat).toFixed(2));
    meal.totalCarbs = Number((meal.totalCarbs + itemCarbs).toFixed(2));

    await meal.save();

    res.status(201).json(mealItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMealItems = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOne({ _id: mealId, user: req.user._id });
    if (!meal) {
      return res.status(404).json({ message: "Прием пищи не найден" });
    }

    const items = await MealItem.find({ meal: mealId }).populate("food");

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getDailyNutritionSummary = async (req, res) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const summary = meals.reduce(
      (acc, meal) => {
        acc.totalCalories += meal.totalCalories || 0;
        acc.totalProtein += meal.totalProtein || 0;
        acc.totalFat += meal.totalFat || 0;
        acc.totalCarbs += meal.totalCarbs || 0;
        return acc;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
      }
    );

    const user = req.user;

    const targets = {
      targetCalories: user.targetCalories || 0,
      targetProtein: user.targetProtein || 0,
      targetFat: user.targetFat || 0,
      targetCarbs: user.targetCarbs || 0,
    };

    const remaining = {
      remainingCalories: Number((targets.targetCalories - summary.totalCalories).toFixed(2)),
      remainingProtein: Number((targets.targetProtein - summary.totalProtein).toFixed(2)),
      remainingFat: Number((targets.targetFat - summary.totalFat).toFixed(2)),
      remainingCarbs: Number((targets.targetCarbs - summary.totalCarbs).toFixed(2)),
    };

    res.status(200).json({
      date: startOfDay,
      consumed: {
        totalCalories: Number(summary.totalCalories.toFixed(2)),
        totalProtein: Number(summary.totalProtein.toFixed(2)),
        totalFat: Number(summary.totalFat.toFixed(2)),
        totalCarbs: Number(summary.totalCarbs.toFixed(2)),
      },
      targets,
      remaining,
      mealsCount: meals.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getMealsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Дата обязательна" });
    }

    const targetDate = new Date(date);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: 1 });

    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteMealItem = async (req, res) => {
  try {
    const { mealId, itemId } = req.params;

    const meal = await Meal.findOne({ _id: mealId, user: req.user._id });
    if (!meal) {
      return res.status(404).json({ message: "Прием пищи не найден" });
    }

    const mealItem = await MealItem.findOne({ _id: itemId, meal: mealId });
    if (!mealItem) {
      return res.status(404).json({ message: "Элемент приема пищи не найден" });
    }

    meal.totalCalories = Number((meal.totalCalories - mealItem.calories).toFixed(2));
    meal.totalProtein = Number((meal.totalProtein - mealItem.protein).toFixed(2));
    meal.totalFat = Number((meal.totalFat - mealItem.fat).toFixed(2));
    meal.totalCarbs = Number((meal.totalCarbs - mealItem.carbs).toFixed(2));

    if (meal.totalCalories < 0) meal.totalCalories = 0;
    if (meal.totalProtein < 0) meal.totalProtein = 0;
    if (meal.totalFat < 0) meal.totalFat = 0;
    if (meal.totalCarbs < 0) meal.totalCarbs = 0;

    await meal.save();
    await mealItem.deleteOne();

    res.status(200).json({ message: "Элемент приема пищи удален" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOne({ _id: mealId, user: req.user._id });
    if (!meal) {
      return res.status(404).json({ message: "Прием пищи не найден" });
    }

    await MealItem.deleteMany({ meal: mealId });
    await meal.deleteOne();

    res.status(200).json({ message: "Прием пищи удален" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};