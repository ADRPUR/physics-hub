import type {
  ProfileResponse,
  ProfileUpdateRequest,
  User,
  MeResponse,
} from "../types/user";
import { authHeaders, http } from "./http";

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await http.get("/me", { headers: authHeaders(token) });
  return res.data;
}

export async function fetchProfile(token: string): Promise<ProfileResponse> {
  const res = await http.get("/me/profile", { headers: authHeaders(token) });
  return res.data;
}

export async function updateProfile(
  token: string,
  payload: ProfileUpdateRequest
): Promise<{ user: User }> {
  const res = await http.put("/me/profile", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function deleteMyAccount(token: string) {
  await http.delete("/me", {
    headers: authHeaders(token),
  });
}

export async function uploadAvatar(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await http.post("/media/uploads/avatar", form, {
    headers: {
      ...authHeaders(token),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data as { assetId: string; url: string };
}
