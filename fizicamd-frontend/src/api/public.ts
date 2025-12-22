import { http } from "./http";
import type { SearchResponse } from "../types/public";

export async function searchContent(query: string): Promise<SearchResponse> {
  const res = await http.get<SearchResponse>("/public/search", {
    params: { q: query },
  });
  return res.data;
}

export async function recordVisit(payload: { path?: string; referrer?: string }) {
  await http.post("/public/visits", payload);
}

export async function fetchVisitCount(): Promise<{ total: number }> {
  const res = await http.get<{ total: number }>("/public/visits/count");
  return res.data;
}
