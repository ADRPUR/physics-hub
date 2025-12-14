import type { ArticleDraft, EventDraft } from "../types/content";
import { authHeaders, http } from "./http";

export async function fetchArticles(token: string) {
  const res = await http.get<{ items: ArticleDraft[] }>("/teacher/articles", {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function createArticle(token: string, payload: ArticleDraft) {
  const res = await http.post<{ article: ArticleDraft }>("/teacher/articles", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function fetchEvents(token: string) {
  const res = await http.get<{ items: EventDraft[] }>("/teacher/events", {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function createEvent(token: string, payload: EventDraft) {
  const res = await http.post<{ event: EventDraft }>("/teacher/events", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}
