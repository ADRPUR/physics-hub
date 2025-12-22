import type {
  ResourceCard,
  ResourceCategory,
  ResourceCategoryPayload,
  ResourceCreatePayload,
  ResourceDetail,
  ResourceListResponse,
} from "../types/resources";
import { authHeaders, http } from "./http";

export async function fetchResourceCategories(): Promise<ResourceCategory[]> {
  const res = await http.get<ResourceCategory[]>("/public/resources/categories");
  return res.data;
}

export async function fetchPublicResources(params?: {
  category?: string;
  limit?: number;
}): Promise<ResourceCard[]> {
  const res = await http.get<ResourceListResponse>("/public/resources", {
    params,
  });
  return res.data.items;
}

export async function fetchPublicResourcesPage(params?: {
  category?: string;
  limit?: number;
  page?: number;
}): Promise<ResourceListResponse> {
  const res = await http.get<ResourceListResponse>("/public/resources", {
    params,
  });
  return res.data;
}

export async function fetchResourceDetail(slug: string): Promise<ResourceDetail> {
  const res = await http.get<ResourceDetail>(`/public/resources/${slug}`);
  return res.data;
}

export async function fetchTeacherResources(token: string): Promise<ResourceCard[]> {
  const res = await http.get<{ items: ResourceCard[] }>("/teacher/resources", {
    headers: authHeaders(token),
  });
  return res.data.items;
}

export async function createResource(token: string, payload: ResourceCreatePayload) {
  const res = await http.post<ResourceDetail>("/teacher/resources", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function fetchTeacherResourceDetail(token: string, id: string) {
  const res = await http.get<ResourceDetail>(`/teacher/resources/${id}`, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function updateResource(token: string, id: string, payload: ResourceCreatePayload) {
  const res = await http.put<ResourceDetail>(`/teacher/resources/${id}`, payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function deleteResource(token: string, id: string) {
  await http.delete(`/teacher/resources/${id}`, {
    headers: authHeaders(token),
  });
}

export async function uploadResourceAsset(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await http.post<{ assetId: string; url: string }>("/media/uploads/resource", form, {
    headers: {
      ...(authHeaders(token) ?? {}),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function createResourceCategory(token: string, payload: ResourceCategoryPayload) {
  const res = await http.post<ResourceCategory>("/teacher/resource-categories", payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function updateResourceCategory(token: string, code: string, payload: ResourceCategoryPayload) {
  const res = await http.put<ResourceCategory>(`/teacher/resource-categories/${code}`, payload, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function deleteResourceCategory(token: string, code: string) {
  await http.delete(`/teacher/resource-categories/${code}`, {
    headers: authHeaders(token),
  });
}

export async function updateResourceCategoryGroup(
  token: string,
  groupLabel: string,
  payload: { label: string; groupOrder?: number }
) {
  const res = await http.put<ResourceCategory[]>(
    `/teacher/resource-categories/groups/${encodeURIComponent(groupLabel)}`,
    payload,
    {
      headers: authHeaders(token),
    }
  );
  return res.data;
}
