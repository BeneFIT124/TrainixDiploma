import { apiRequest } from "./api";

export type Review = {
  _id: string;
  rating: number;
  text: string;
  createdAt: string;
  user?: {
    _id: string;
    username: string;
    avatarUrl?: string | null;
  };
  trainerProfile: string;
  purchase: string;
};

export function createReview(data: {
  purchaseId: string;
  trainerProfileId: string;
  rating: number;
  text: string;
}) {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getTrainerReviews(trainerProfileId: string) {
  return apiRequest<Review[]>(`/reviews/trainer/${trainerProfileId}`);
}
