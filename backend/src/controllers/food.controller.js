import Food from "../models/Food.js";

export const createFood = async (req, res) => {
  try {
    const { name, calories, protein, fat, carbs } = req.body;

    const food = await Food.create({
      name,
      calories,
      protein,
      fat,
      carbs,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};