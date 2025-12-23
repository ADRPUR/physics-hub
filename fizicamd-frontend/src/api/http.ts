import axios from "axios";
import { translate, type Language } from "../i18n/translations";
import { useAuthStore } from "../store/authStore";
import { notify } from "../utils/notifications";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const LANG_STORAGE_KEY = "fizicamd_language";
let hasShownSessionExpired = false;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export function authHeaders(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const token = useAuthStore.getState().token;
    if (status === 401 && token) {
      useAuthStore.getState().logout();
      if (!hasShownSessionExpired) {
        hasShownSessionExpired = true;
        const storedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
        const lang = storedLang ?? "ro";
        notify({
          message: translate(lang, "authErrors.sessionExpired"),
          severity: "warning",
        });
      }
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
