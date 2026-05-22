import { apiRequest } from "./api";

export type TrainerProfile = {
  _id: string;
  user: {
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
};

export function getMyTrainerProfile() {
  return apiRequest<TrainerProfile>("/trainer-profiles/my");
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
