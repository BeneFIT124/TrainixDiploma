import TrainerProfile from "../models/TrainerProfile.js";

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