import api from "./api";
import { ApiReputation, RankedVenue } from "@/types/api";

//hirer-only reads that aren't bookings. reputation for now
export const hirerApi = {
  async reputation(): Promise<ApiReputation> {
    const { data } = await api.get<ApiReputation>("/hirer/reputation");
    return data;
  },
  async candidates(): Promise<RankedVenue[]> {
    const { data } = await api.get<RankedVenue[]>("/hirer/candidates");
    return data;
  },
  async saveCandidates(venueIds: number[]): Promise<RankedVenue[]> {
    const { data } = await api.put<RankedVenue[]>("/hirer/candidates", { venueIds });
    return data;
  },
};