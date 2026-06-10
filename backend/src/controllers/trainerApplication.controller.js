import TrainerApplication from "../models/TrainerApplication.js";
import TrainerProfile from "../models/TrainerProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createTrainerApplication = async (req, res) => {
  try {
    const {
      educationDocumentUrl,
      certificateDocumentUrl,
      identityDocumentUrl,
      comment,
    } = req.body;

    const existingApplication = await TrainerApplication.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "У тебя уже есть активная заявка на тренера",
      });
    }

    const application = await TrainerApplication.create({
      user: req.user._id,
      educationDocumentUrl: educationDocumentUrl || null,
      certificateDocumentUrl: certificateDocumentUrl || null,
      identityDocumentUrl: identityDocumentUrl || null,
      comment: comment || null,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTrainerApplications = async (req, res) => {
  try {
    const applications = await TrainerApplication.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTrainerApplications = async (req, res) => {
  try {
    const applications = await TrainerApplication.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewTrainerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!id || id === "undefined" || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Некорректный идентификатор заявки" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Статус должен быть approved или rejected",
      });
    }

    const application = await TrainerApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "Эта заявка уже рассмотрена",
      });
    }

    application.status = status;
    application.comment = comment ?? application.comment;
    application.reviewedAt = new Date();

    await application.save();

    if (status === "approved") {
      const user = await User.findById(application.user);

      if (user) {
        user.role = "trainer";
        await user.save();
      }

      let trainerProfile = await TrainerProfile.findOne({
        user: application.user,
      });

      if (!trainerProfile) {
        trainerProfile = await TrainerProfile.create({
          user: application.user,
          isVerified: true,
        });
      } else {
        trainerProfile.isVerified = true;
        await trainerProfile.save();
      }
    }

    res.status(200).json({
      message: `Заявка ${status === "approved" ? "одобрена" : "отклонена"}`,
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
