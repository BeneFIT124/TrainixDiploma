import { AuthUser } from "./authService";
import { apiRequest } from "./api";

export type UpdateProfileData = Partial<
  Pick<
    AuthUser,
    | "username"
    | "height"
    | "weight"
    | "goal"
    | "activityLevel"
    | "targetCalories"
    | "targetProtein"
    | "targetFat"
    | "targetCarbs"
  >
>;

export function updateProfile(data: UpdateProfileData) {
  return apiRequest<AuthUser>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function becomeTrainerDemo() {
  return apiRequest<AuthUser>("/users/become-trainer-demo", {
    method: "POST",
    body: JSON.stringify({}),
  }).catch(() =>
    apiRequest<AuthUser>("/trainer-profiles/become-demo", {
      method: "POST",
      body: JSON.stringify({}),
    })
  );
}
