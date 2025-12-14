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
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  },
  logout: () => {
    set({ user: null, token: null, refreshToken: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
  init: () => {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("user");
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
      localStorage.setItem("user", JSON.stringify(user));
      return next;
    });
  },
}));
