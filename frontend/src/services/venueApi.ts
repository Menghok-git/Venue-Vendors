import api from "./api";
import { ApiVenue } from "@/types/api";

//shared venue reads (used by the hirer search + browse pages).
export const venueApi = {
  async list(): Promise<ApiVenue[]> {
    const { data } = await api.get<ApiVenue[]>("/venues");
    return data;
  },
  async search(params: {
    name?: string; location?: string; minCapacity?: number; suitability?: string;
  }): Promise<ApiVenue[]> {
    const { data } = await api.get<ApiVenue[]>("/venues/search", { params });
    return data;
  },
  async get(id: number): Promise<ApiVenue> {
    const { data } = await api.get<ApiVenue>(`/venues/${id}`);
    return data;
  },
};
