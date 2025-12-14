import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

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
