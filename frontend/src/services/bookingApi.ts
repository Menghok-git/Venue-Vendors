import api from "./api";
import { ApiBooking } from "@/types/api";

// OWNER: YOU (hirer). Wire these once BookingController is implemented on the backend.
export const bookingApi = {
  async create(payload: {
    timeslotId: number; eventName: string; expectedGuests: number; eventDate: string;
  }): Promise<ApiBooking> {
    const { data } = await api.post<ApiBooking>("/bookings", payload);
    return data;
  },
  async mine(): Promise<ApiBooking[]> {
    const { data } = await api.get<ApiBooking[]>("/bookings/mine");
    return data;
  },
  async cancel(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },
};
