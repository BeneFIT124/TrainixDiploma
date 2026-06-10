import mongoose from "mongoose";
import PlanPurchase from "../models/PlanPurchase.js";
import Review from "../models/Review.js";
import TrainerProfile from "../models/TrainerProfile.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const updateTrainerRating = async (trainerProfileId) => {
  const stats = await Review.aggregate([
    { $match: { trainerProfile: trainerProfileId } },
    {
      $group: {
        _id: "$trainerProfile",
        ratingAvg: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  const ratingAvg = stats[0]?.ratingAvg || 0;
  const reviewsCount = stats[0]?.reviewsCount || 0;

  await TrainerProfile.findByIdAndUpdate(trainerProfileId, {
    ratingAvg: Math.round(ratingAvg * 10) / 10,
    reviewsCount,
  });
};

export const createReview = async (req, res) => {
  try {
    const { purchaseId, trainerProfileId, rating, text } = req.body;

    if (!purchaseId || !trainerProfileId) {
      return res.status(400).json({ message: "Укажи купленный план и тренера" });
    }

    if (!isValidObjectId(purchaseId) || !isValidObjectId(trainerProfileId)) {
      return res.status(400).json({ message: "Некорректный идентификатор плана" });
    }

    const normalizedRating = Number(rating);

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: "Оценка должна быть от 1 до 5" });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Напиши текст отзыва" });
    }

    const purchase = await PlanPurchase.findOne({
      _id: purchaseId,
      user: req.user._id,
      status: "active",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "Оставить отзыв можно только после покупки плана",
      });
    }

    if (String(purchase.trainerProfile) !== String(trainerProfileId)) {
      return res.status(400).json({ message: "План не относится к выбранному тренеру" });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      purchase: purchase._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "Отзыв на этот купленный план уже оставлен",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      trainerProfile: purchase.trainerProfile,
      purchase: purchase._id,
      rating: normalizedRating,
      text: String(text).trim(),
    });

    await updateTrainerRating(purchase.trainerProfile);

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "username avatarUrl"
    );

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Отзыв на этот купленный план уже оставлен",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export const getTrainerReviews = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.trainerProfileId)) {
      return res.status(400).json({ message: "Некорректный идентификатор тренера" });
    }

    const reviews = await Review.find({
      trainerProfile: req.params.trainerProfileId,
    })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
