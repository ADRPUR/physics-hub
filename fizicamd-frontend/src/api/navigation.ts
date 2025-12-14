import type { NavigationItem, NavigationUpsertPayload } from "../types/navigation";
import { authHeaders, http } from "./http";

export async function fetchNavigation(token: string) {
  const res = await http.get<{ items: NavigationItem[] }>("/admin/navigation", {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function createNavigationItem(token: string, payload: NavigationUpsertPayload) {
  const res = await http.post<{ item: NavigationItem }>("/admin/navigation", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function updateNavigationItem(token: string, id: string, payload: NavigationUpsertPayload) {
  const res = await http.put<{ item: NavigationItem }>(`/admin/navigation/${id}`, payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function deleteNavigationItem(token: string, id: string) {
  await http.delete(`/admin/navigation/${id}`, {
    headers: authHeaders(token),
  });
}

export async function fetchPublicNavigation(): Promise<NavigationItem[]> {
  const res = await http.get<NavigationItem[]>("/navigation/public");
  return res.data;
}
