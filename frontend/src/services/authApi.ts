import api from "./api";
import { ApiUser, RegisterPayload, LoginPayload, AuthResponse } from "@/types/api";

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  async me(): Promise<ApiUser> {
    const { data } = await api.get<{ user: ApiUser }>("/auth/me");
    return data.user;
  },
  async updateMe(patch: { name?: string; phone?: string; avatarUrl?: string }): Promise<ApiUser> {
    //backend expects fullName; map name -> fullName.
    const body: Record<string, unknown> = { phone: patch.phone, avatarUrl: patch.avatarUrl };
    if (patch.name !== undefined) body.fullName = patch.name;
    const { data } = await api.put<{ user: ApiUser }>("/auth/me", body);
    return data.user;
  },
};
