import { apiRequest } from "./api";

export type AuthUser = {
  id: string;
  _id?: string;
  username: string;
  email: string;
  role?: "user" | "trainer" | "admin" | string;
  avatarUrl?: string | null;
  height?: number | null;
  weight?: number | null;
  goal?: "lose_weight" | "gain_muscle" | "maintain";
  activityLevel?: string;
  targetCalories?: number | null;
  targetProtein?: number | null;
  targetCarbs?: number | null;
  targetFat?: number | null;
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export function registerUser(data: RegisterData) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export function loginUser(data: LoginData) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export function getCurrentUser(token?: string | null) {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    token,
  });
}
