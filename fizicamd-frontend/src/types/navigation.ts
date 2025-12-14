export type NavigationVisibility = "PUBLIC" | "STUDENT" | "TEACHER" | "ADMIN";

export interface NavigationItem {
  id: string;
  parentId?: string | null;
  title: string;
  slug: string;
  type: "LINK" | "PAGE" | "SECTION";
  href?: string | null;
  visibility: NavigationVisibility;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  icon?: string | null;
}

export interface NavigationUpsertPayload {
  parentId?: string | null;
  title: string;
  slug: string;
  type: "LINK" | "PAGE" | "SECTION";
  href?: string | null;
  visibility: NavigationVisibility;
  status?: "DRAFT" | "PUBLISHED";
  sortOrder?: number;
  icon?: string | null;
}
