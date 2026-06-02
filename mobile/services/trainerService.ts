import { apiRequest } from "./api";
import { PublicPlan } from "./planService";

export type TrainerProfile = {
  _id: string;
  user:
    | string
    | {
        _id: string;
        id?: string;
        username: string;
        email: string;
        avatarUrl?: string | null;
        role: string;
      };
  bio?: string | null;
  specialization?: string | null;
  experienceYears: number;
  isVerified: boolean;
  ratingAvg: number;
  reviewsCount: number;
  workoutPlans?: PublicPlan[];
  nutritionPlans?: PublicPlan[];
};

export function getMyTrainerProfile() {
  return apiRequest<TrainerProfile>("/trainer-profiles/my");
}

export function getTrainerProfiles() {
  return apiRequest<TrainerProfile[]>("/trainer-profiles");
}

export function getTrainerProfileById(id: string) {
  return apiRequest<TrainerProfile>(`/trainer-profiles/${id}`);
}

export function createTrainerProfile(data: {
  bio?: string;
  specialization?: string;
  experienceYears?: number;
}) {
  return apiRequest<TrainerProfile>("/trainer-profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
