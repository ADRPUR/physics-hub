import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/user";
import { http } from "./http";

export async function register(payload: RegisterPayload): Promise<{ id: string }> {
  const res = await http.post("/auth/register", payload);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await http.post("/auth/login", payload);
  return res.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const res = await http.post("/auth/refresh", { refreshToken });
  return res.data;
}

export async function logout(accessToken: string) {
  await http.post(
    "/auth/logout",
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}
