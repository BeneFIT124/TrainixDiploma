import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/constants/api";

type ApiOptions = RequestInit & {
  token?: string | null;
  skipAuth?: boolean;
};

const API_TIMEOUT_MS = 25000;
const GET_RETRY_ATTEMPTS = 2;

const buildUrl = (endpoint: string) => {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${normalizedBaseUrl}${normalizedEndpoint}`;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isNetworkError = (error: unknown) => {
  return (
    error instanceof TypeError ||
    (error instanceof Error && error.name === "AbortError")
  );
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

  if (!skipAuth && !authToken) {
    throw new Error("Требуется авторизация. Войди в аккаунт и повтори запрос.");
  }

  const method = (rest.method || "GET").toUpperCase();
  const attempts = method === "GET" ? GET_RETRY_ATTEMPTS : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(buildUrl(endpoint), {
        ...rest,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(headers || {}),
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Ошибка запроса к серверу (${response.status})`
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      if (attempt >= attempts || !isNetworkError(error)) {
        break;
      }

      await wait(700 * attempt);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (isNetworkError(lastError)) {
    throw new Error(
      "Не удалось подключиться к серверу. Проверь интернет и повтори запрос."
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Не удалось выполнить запрос к серверу");
}
