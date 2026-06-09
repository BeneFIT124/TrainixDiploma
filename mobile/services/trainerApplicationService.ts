import { apiRequest } from "./api";

export type TrainerApplicationData = {
  educationDocumentUrl?: string | null;
  certificateDocumentUrl?: string | null;
  identityDocumentUrl?: string | null;
  comment?: string | null;
};

export type TrainerApplication = TrainerApplicationData & {
  _id: string;
  user: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string | null;
  createdAt: string;
};

export function createTrainerApplication(data: TrainerApplicationData) {
  return apiRequest<TrainerApplication>("/trainer-applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
