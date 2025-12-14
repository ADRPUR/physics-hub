import { http } from "./http";
import type { HomepageContent, SearchResponse } from "../types/public";

export async function fetchHomepageContent(): Promise<HomepageContent> {
  const res = await http.get<HomepageContent>("/public/homepage");
  return res.data;
}

export async function searchContent(query: string): Promise<SearchResponse> {
  const res = await http.get<SearchResponse>("/public/search", {
    params: { q: query },
  });
  return res.data;
}
