export interface ArticleDraft {
  id?: string;
  title: string;
  summary: string;
  tags: string[];
  visibility: "PUBLIC" | "STUDENT" | "TEACHER";
  body?: string;
  publishedAt?: string;
}

export interface EventDraft {
  id?: string;
  name: string;
  description: string;
  location: string;
  startAt: string;
  endAt?: string;
  visibility: "PUBLIC" | "STUDENT" | "TEACHER";
}
