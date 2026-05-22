import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AuthUser,
  getCurrentUser,
  loginUser,
  registerUser,
  LoginData,
  RegisterData,
} from "@/services/authService";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/constants/api";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (newUser: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    loadAuthData();
  }, []);

  const clearAuthData = async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const loadAuthData = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (savedToken) {
        const currentUser = await getCurrentUser(savedToken);
        await saveAuthData(savedToken, currentUser);
      }
    } catch {
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (newToken: string, newUser: AuthUser) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = async (newUser: AuthUser) => {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    const currentUser = await getCurrentUser(token);
    await updateUser(currentUser);
  };

  const login = async (data: LoginData) => {
    const response = await loginUser(data);
    await saveAuthData(response.token, response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await registerUser(data);
    await saveAuthData(response.token, response.user);
  };

  const logout = async () => {
    await clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        refreshUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }

  return context;
}
