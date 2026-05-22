import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../config/env.js";

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: "30d" });
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

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Заполни все поля" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Заполни все поля" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
