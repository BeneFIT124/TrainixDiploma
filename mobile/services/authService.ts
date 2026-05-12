import { apiRequest } from "./api";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string;
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
  });
}

export function loginUser(data: LoginData) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<{ user: AuthUser }>("/auth/me", {
    method: "GET",
    token,
  });
}