export type ResourceBlockType = "TEXT" | "LINK" | "IMAGE" | "PDF" | "FORMULA";

export interface ResourceCategory {
  code: string;
  label: string;
  group: string;
  sortOrder: number;
  groupOrder: number;
}

export interface ResourceCategoryPayload {
  label: string;
  group: string;
  sortOrder?: number;
  groupOrder?: number;
}

export type ResourceStatus = "DRAFT" | "PUBLISHED";

export interface ResourceBlock {
  type: ResourceBlockType;
  text?: string | null;
  url?: string | null;
  assetId?: string | null;
  mediaUrl?: string | null;
  caption?: string | null;
  title?: string | null;
}

export interface ResourceCard {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: ResourceCategory;
  avatarUrl?: string | null;
  tags: string[];
  authorName: string;
  publishedAt?: string | null;
  status?: ResourceStatus;
}

export interface ResourceDetail extends ResourceCard {
  avatarAssetId?: string | null;
  blocks: ResourceBlock[];
}

export interface ResourceListResponse {
  items: ResourceCard[];
  total: number;
  page: number;
  size: number;
}

export interface ResourceCreatePayload {
  categoryCode: string;
  title: string;
  summary: string;
  avatarAssetId?: string;
  tags: string[];
  blocks: ResourceBlockInput[];
  status?: ResourceStatus;
}

export interface ResourceBlockInput {
  type: ResourceBlockType;
  text?: string;
  url?: string;
  assetId?: string;
  caption?: string;
  title?: string;
  mediaUrl?: string;
}
