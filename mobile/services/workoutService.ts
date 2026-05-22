import { apiRequest } from "./api";

export type Exercise = {
  id: string;
  _id?: string;
  name: string;
  primaryMuscleGroup?: string;
  secondaryMuscleGroups?: string[];
  description?: string | null;
  equipment?: string | null;
  muscleGroup?: string;
  defaultSets?: number;
  defaultReps?: number;
};

export type Workout = {
  _id: string;
  id?: string;
  title: string;
  workoutDate: string;
  durationMinutes?: number;
  status: "planned" | "completed";
  comment?: string | null;
};

export type WorkoutItem = {
  _id: string;
  workout: string;
  exercise: Exercise;
  exerciseOrder: number;
  comment?: string | null;
};

export type WorkoutSet = {
  _id: string;
  workoutItem: string;
  setNumber: number;
  reps: number;
  weightKg: number;
};

export function getExercises(primaryMuscleGroup?: string) {
  const query = primaryMuscleGroup
    ? `?primaryMuscleGroup=${encodeURIComponent(primaryMuscleGroup)}`
    : "";

  return apiRequest<Exercise[]>(`/exercises${query}`);
}

export function createExercise(data: Partial<Exercise>) {
  return apiRequest<Exercise>("/exercises", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteExercise(id: string) {
  return apiRequest<{ message: string }>(`/exercises/${id}`, {
    method: "DELETE",
  });
}

export function getWorkouts() {
  return apiRequest<Workout[]>("/workouts");
}

export function getWorkoutById(id: string) {
  return apiRequest<Workout>(`/workouts/${id}`);
}

export function createWorkout(data: {
  title: string;
  workoutDate?: string;
  durationMinutes?: number;
  status?: "planned" | "completed";
  comment?: string | null;
}) {
  return apiRequest<Workout>("/workouts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWorkout(
  id: string,
  data: Partial<Pick<Workout, "title" | "workoutDate" | "durationMinutes" | "status" | "comment">>
) {
  return apiRequest<Workout>(`/workouts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteWorkout(id: string) {
  return apiRequest<{ message: string }>(`/workouts/${id}`, {
    method: "DELETE",
  });
}

export function addWorkoutItem(
  workoutId: string,
  data: { exerciseId: string; exerciseOrder?: number; comment?: string | null }
) {
  return apiRequest<{ workoutItem: WorkoutItem; copiedSets: WorkoutSet[] }>(
    `/workouts/${workoutId}/items`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function getWorkoutItems(workoutId: string) {
  return apiRequest<WorkoutItem[]>(`/workouts/${workoutId}/items`);
}

export function addWorkoutSet(
  itemId: string,
  data: { setNumber: number; reps: number; weightKg: number }
) {
  return apiRequest<WorkoutSet>(`/workout-items/${itemId}/sets`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getWorkoutSets(itemId: string) {
  return apiRequest<WorkoutSet[]>(`/workout-items/${itemId}/sets`);
}

export function getLastExerciseSets(exerciseId: string) {
  return apiRequest<WorkoutSet[]>(`/workouts/exercises/${exerciseId}/last-sets`);
}
