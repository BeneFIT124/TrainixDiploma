import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/constants/api";

type ApiOptions = RequestInit & {
  token?: string | null;
  skipAuth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, skipAuth = false, headers, ...rest } = options;
  const authToken =
    token !== undefined
      ? token
      : skipAuth
        ? null
        : await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Ошибка запроса к серверу (${response.status})`
    );
  }

  return data;
}
