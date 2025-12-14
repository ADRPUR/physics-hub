import { http, authHeaders } from "./http";
import type { UserListItem, UserUpsertPayload } from "../types/admin";

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export async function listUsers(
    token: string,
    params?: { search?: string; page?: number; pageSize?: number }
): Promise<Paginated<UserListItem>> {
    const res = await http.get("/admin/users", {
        params,
        headers: authHeaders(token),
    });
    return res.data;
}

export async function createUser(
    token: string,
    payload: UserUpsertPayload
): Promise<{ user: UserListItem }> {
    const res = await http.post("/admin/users", payload, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function updateUser(
    token: string,
    id: string,
    payload: UserUpsertPayload
): Promise<{ user: UserListItem }> {
    const res = await http.put(`/admin/users/${id}`, payload, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function deleteUser(
    token: string,
    id: string
): Promise<{ success: boolean }> {
    const res = await http.delete(`/admin/users/${id}`, {
        headers: authHeaders(token),
    });
    return res.data;
}
