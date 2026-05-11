import Exercise from "../models/Exercise.js";

export const createExercise = async (req, res) => {
  try {
    console.log("createExercise called");
    console.log(req.body);

    const {
      name,
      primaryMuscleGroup,
      secondaryMuscleGroups,
      description,
      equipment,
    } = req.body;

    const exercise = await Exercise.create({
      name,
      primaryMuscleGroup,
      secondaryMuscleGroups,
      description: description || null,
      equipment: equipment || null,
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error("createExercise error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getExercises = async (req, res) => {
  try {
    const { primaryMuscleGroup } = req.query;

    const filter = {};

    if (primaryMuscleGroup) {
      filter.primaryMuscleGroup = primaryMuscleGroup;
    }

    const exercises = await Exercise.find(filter).sort({ createdAt: -1 });

    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: "Упражнение не найдено" });
    }

    await exercise.deleteOne();

    res.status(200).json({ message: "Упражнение удалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};