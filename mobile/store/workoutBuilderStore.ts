import { create } from "zustand";

export type Exercise = {
  id: string;
  _id?: string;
  name: string;
  muscleGroup?: string;
  primaryMuscleGroup?: string;
  equipment?: string | null;
  defaultSets?: number;
  defaultReps?: number;
  initialSets?: WorkoutSet[];
};

export type WorkoutSet = {
  id: string;
  weight: string;
  reps: string;
};

export type SelectedWorkoutExercise = Exercise & {
  sets: WorkoutSet[];
};

type PlanDayForWorkout = {
  title: string;
  exercises: {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    sets: {
      order: number;
      weight: number;
      reps: number;
    }[];
  }[];
};

type WorkoutBuilderStore = {
  selectedExercises: SelectedWorkoutExercise[];

  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;

  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: string
  ) => void;

  setWorkoutFromPlanDay: (day: PlanDayForWorkout) => void;

  clearWorkout: () => void;
  resetWorkoutBuilder: () => void;
};

const createDefaultSets = (exercise: Exercise): WorkoutSet[] => {
  if (exercise.initialSets && exercise.initialSets.length > 0) {
    return exercise.initialSets;
  }

  const setsCount = exercise.defaultSets || 3;
  const repsCount = exercise.defaultReps || 10;

  return Array.from({ length: setsCount }, (_, index) => ({
    id: `${Date.now()}-${exercise.id}-${index}`,
    weight: "",
    reps: String(repsCount),
  }));
};

export const useWorkoutBuilderStore = create<WorkoutBuilderStore>((set, get) => ({
  selectedExercises: [],

  addExercise: (exercise) => {
    const alreadySelected = get().selectedExercises.some(
      (item) => item.id === exercise.id
    );

    if (alreadySelected) {
      return;
    }

    set((state) => ({
      selectedExercises: [
        ...state.selectedExercises,
        {
          ...exercise,
          sets: createDefaultSets(exercise),
        },
      ],
    }));
  },

  removeExercise: (exerciseId) => {
    set((state) => ({
      selectedExercises: state.selectedExercises.filter(
        (exercise) => exercise.id !== exerciseId
      ),
    }));
  },

  addSet: (exerciseId) => {
    set((state) => ({
      selectedExercises: state.selectedExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const lastSet = exercise.sets[exercise.sets.length - 1];

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `${Date.now()}-${exerciseId}`,
              weight: lastSet?.weight || "",
              reps: lastSet?.reps || String(exercise.defaultReps || 10),
            },
          ],
        };
      }),
    }));
  },

  removeSet: (exerciseId, setId) => {
    set((state) => ({
      selectedExercises: state.selectedExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (exercise.sets.length <= 1) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.filter((setItem) => setItem.id !== setId),
        };
      }),
    }));
  },

  updateSet: (exerciseId, setId, field, value) => {
    set((state) => ({
      selectedExercises: state.selectedExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((setItem) =>
            setItem.id === setId
              ? {
                  ...setItem,
                  [field]: value,
                }
              : setItem
          ),
        };
      }),
    }));
  },

  setWorkoutFromPlanDay: (day) => {
    set({
      selectedExercises: day.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup || "Не указано",
        equipment: exercise.equipment || "Не указано",
        defaultSets: exercise.sets.length,
        defaultReps: exercise.sets[0]?.reps || 10,
        sets: exercise.sets.map((setItem) => ({
          id: `${Date.now()}-${exercise.id}-${setItem.order}`,
          weight: String(setItem.weight),
          reps: String(setItem.reps),
        })),
      })),
    });
  },

  clearWorkout: () => {
    set({
      selectedExercises: [],
    });
  },

  resetWorkoutBuilder: () => {
    set({
      selectedExercises: [],
    });
  },
}));
