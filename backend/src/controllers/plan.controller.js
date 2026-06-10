import mongoose from "mongoose";
import NutritionPlan from "../models/NutritionPlan.js";
import NutritionPlanItem from "../models/NutritionPlanItem.js";
import PlanPurchase from "../models/PlanPurchase.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import WorkoutPlanItem from "../models/WorkoutPlanItem.js";

const trainerProfilePopulate = {
  path: "trainerProfile",
  populate: { path: "user", select: "username email avatarUrl role" },
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validatePlanRequest = (type, id, res) => {
  if (!["workout", "nutrition"].includes(type)) {
    res.status(400).json({ message: "Некорректный тип плана" });
    return false;
  }

  if (!id || id === "undefined" || !isValidObjectId(id)) {
    res.status(400).json({ message: "Некорректный идентификатор плана" });
    return false;
  }

  return true;
};

const buildWorkoutPlanDays = (plan, items = []) => {
  const days = items.reduce((groups, item) => {
    const dayNumber = item.dayNumber || 1;
    const dayItems = groups.get(dayNumber) || [];
    dayItems.push(item);
    groups.set(dayNumber, dayItems);
    return groups;
  }, new Map());

  return Array.from(days.entries())
    .sort(([first], [second]) => first - second)
    .map(([dayNumber, dayItems]) => ({
      id: `${plan._id}-day-${dayNumber}`,
      dayNumber,
      title: `День ${dayNumber}`,
      exercises: dayItems
        .sort((first, second) => (first.exerciseOrder || 1) - (second.exerciseOrder || 1))
        .map((item) => ({
          exercise: item.exercise,
          exerciseOrder: item.exerciseOrder,
          setsCount: item.sets,
          reps: item.reps,
          comment: item.comment,
        })),
    }));
};

const buildNutritionPlanDays = (plan, items = []) => {
  const meals = items.reduce((groups, item) => {
    const mealType = item.mealType || "snack";
    const mealItems = groups.get(mealType) || [];
    mealItems.push(item);
    groups.set(mealType, mealItems);
    return groups;
  }, new Map());

  return [
    {
      id: `${plan._id}-day-1`,
      dayNumber: 1,
      title: "Рацион",
      meals: Array.from(meals.entries()).map(([mealType, mealItems]) => ({
        id: `${plan._id}-${mealType}`,
        mealType,
        foods: mealItems
          .sort((first, second) => (first.itemOrder || 1) - (second.itemOrder || 1))
          .map((item) => ({
            food: item.food,
            grams: item.grams,
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            itemOrder: item.itemOrder,
            comment: item.comment,
          })),
      })),
    },
  ];
};

const serializeWorkoutPlan = (plan, items = []) => ({
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
  trainerProfile: plan.trainerProfile,
  items,
  days: buildWorkoutPlanDays(plan, items),
  createdAt: plan.createdAt,
});

const serializeNutritionPlan = (plan, items = []) => ({
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
  trainerProfile: plan.trainerProfile,
  items,
  nutritionPlanItems: items,
  days: buildNutritionPlanDays(plan, items),
  createdAt: plan.createdAt,
});

export const getPlans = async (req, res) => {
  try {
    const [workoutPlans, nutritionPlans] = await Promise.all([
      WorkoutPlan.find({ isActive: true })
        .populate(trainerProfilePopulate)
        .sort({ createdAt: -1 }),
      NutritionPlan.find({ isActive: true })
        .populate(trainerProfilePopulate)
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json([
      ...workoutPlans.map((plan) => serializeWorkoutPlan(plan)),
      ...nutritionPlans.map((plan) => serializeNutritionPlan(plan)),
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!validatePlanRequest(type, id, res)) {
      return;
    }

    if (type === "workout") {
      const plan = await WorkoutPlan.findById(id).populate(trainerProfilePopulate);

      if (!plan) {
        return res.status(404).json({ message: "План не найден" });
      }

      const items = await WorkoutPlanItem.find({ workoutPlan: plan._id })
        .populate("exercise")
        .sort({ dayNumber: 1, exerciseOrder: 1, createdAt: 1 });

      return res.status(200).json(serializeWorkoutPlan(plan, items));
    }

    if (type === "nutrition") {
      const plan = await NutritionPlan.findById(id).populate(trainerProfilePopulate);

      if (!plan) {
        return res.status(404).json({ message: "План не найден" });
      }

      const items = await NutritionPlanItem.find({ nutritionPlan: plan._id })
        .populate("food")
        .sort({ mealType: 1, itemOrder: 1, createdAt: 1 });

      return res.status(200).json(serializeNutritionPlan(plan, items));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrainerPlans = async (req, res) => {
  try {
    const { trainerProfileId } = req.params;

    if (
      !trainerProfileId ||
      trainerProfileId === "undefined" ||
      !isValidObjectId(trainerProfileId)
    ) {
      return res.status(400).json({
        message: "Некорректный идентификатор тренера",
      });
    }

    const [workoutPlans, nutritionPlans] = await Promise.all([
      WorkoutPlan.find({ trainerProfile: trainerProfileId, isActive: true })
        .populate(trainerProfilePopulate)
        .sort({
          createdAt: -1,
        }),
      NutritionPlan.find({
        trainerProfile: trainerProfileId,
        isActive: true,
      })
        .populate(trainerProfilePopulate)
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json([
      ...workoutPlans.map((plan) => serializeWorkoutPlan(plan)),
      ...nutritionPlans.map((plan) => serializeNutritionPlan(plan)),
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const purchasePlan = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!validatePlanRequest(type, id, res)) {
      return;
    }

    const plan =
      type === "workout"
        ? await WorkoutPlan.findOne({ _id: id, isActive: true })
        : type === "nutrition"
          ? await NutritionPlan.findOne({ _id: id, isActive: true })
          : null;

    if (!plan) {
      return res.status(404).json({ message: "План не найден" });
    }

    const query = {
      user: req.user._id,
      planType: type,
      ...(type === "workout"
        ? { workoutPlan: plan._id }
        : { nutritionPlan: plan._id }),
    };

    const existingPurchase = await PlanPurchase.findOne(query);

    if (existingPurchase) {
      return res.status(200).json(existingPurchase);
    }

    const purchase = await PlanPurchase.create({
      ...query,
      trainerProfile: plan.trainerProfile,
      price: plan.price || 0,
      status: "active",
    });

    res.status(201).json(purchase);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "План уже куплен" });
    }

    res.status(500).json({ message: error.message });
  }
};

export const getMyPurchasedPlans = async (req, res) => {
  try {
    const purchases = await PlanPurchase.find({
      user: req.user._id,
      status: "active",
    })
      .populate({
        path: "workoutPlan",
        populate: trainerProfilePopulate,
      })
      .populate({
        path: "nutritionPlan",
        populate: trainerProfilePopulate,
      })
      .sort({ createdAt: -1 });

    res.status(200).json(
      purchases
        .map((purchase) => {
          if (purchase.planType === "workout" && purchase.workoutPlan) {
            return {
              purchaseId: purchase._id,
              purchaseDate: purchase.createdAt,
              status: purchase.status,
              plan: serializeWorkoutPlan(purchase.workoutPlan),
            };
          }

          if (purchase.planType === "nutrition" && purchase.nutritionPlan) {
            return {
              purchaseId: purchase._id,
              purchaseDate: purchase.createdAt,
              status: purchase.status,
              plan: serializeNutritionPlan(purchase.nutritionPlan),
            };
          }

          return null;
        })
        .filter(Boolean)
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
