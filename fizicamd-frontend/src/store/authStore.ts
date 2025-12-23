import { create } from "zustand";
import type { User } from "../types/user";

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  init: () => void;
  updateUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  login: (user, token, refreshToken) => {
    set({ user, token, refreshToken });
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("refreshToken", refreshToken);
  },
  logout: () => {
    set({ user: null, token: null, refreshToken: null });
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
  init: () => {
    try {
      const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
      const refreshToken = sessionStorage.getItem("refreshToken") ?? localStorage.getItem("refreshToken");
      const userStr = sessionStorage.getItem("user") ?? localStorage.getItem("user");
      if (token && localStorage.getItem("token")) {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
      }
      if (refreshToken && localStorage.getItem("refreshToken")) {
        sessionStorage.setItem("refreshToken", refreshToken);
        localStorage.removeItem("refreshToken");
      }
      if (userStr && localStorage.getItem("user")) {
        sessionStorage.setItem("user", userStr);
        localStorage.removeItem("user");
      }
      set({
        user: userStr ? (JSON.parse(userStr) as User) : null,
        token: token ?? null,
        refreshToken: refreshToken ?? null,
      });
    } catch {
      set({ user: null, token: null, refreshToken: null });
    }
  },
  updateUser: (user) => {
    set((state) => {
      const next = { ...state, user };
      sessionStorage.setItem("user", JSON.stringify(user));
      return next;
    });
  },
}));
