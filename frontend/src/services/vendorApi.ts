import api from "./api";
import { ApiVenue, ApiTimeslot, ApiBooking } from "@/types/api";

export interface VenueStats {
  venueName: string;
  total: string;
  approved: string;
  rejected: string;
  pending: string;
}

export interface MonthStats {
  month: string;
  count: string;
}

export interface HirerStats {
  hirerName: string;
  count: string;
}

export interface VendorStatsResponse {
  bookingsByVenue: VenueStats[];
  bookingsOverTime: MonthStats[];
  bookingsByHirer: HirerStats[];
}

export async function getMyVenues(): Promise<ApiVenue[]> {
  const response = await api.get("/vendor/venues");
  return response.data;
}

export async function createVenue(data: Partial<ApiVenue>): Promise<ApiVenue> {
  const response = await api.post("/vendor/venues", data);
  return response.data;
}

export async function updateVenue(id: number, data: Partial<ApiVenue>): Promise<ApiVenue> {
  const response = await api.put(`/vendor/venues/${id}`, data);
  return response.data;
}

export async function deleteVenue(id: number): Promise<void> {
  await api.delete(`/vendor/venues/${id}`);
}

export async function addTimeslot(venueId: number, startTime: string, endTime: string): Promise<ApiTimeslot> {
  const response = await api.post(`/vendor/venues/${venueId}/timeslots`, { startTime, endTime });
  return response.data;
}

export async function setTimeslotBlocked(timeslotId: number, isBlocked: boolean): Promise<ApiTimeslot> {
  const response = await api.patch(`/vendor/timeslots/${timeslotId}/block`, { isBlocked });
  return response.data;
}

export async function getVendorBookings(): Promise<ApiBooking[]> {
  const response = await api.get("/vendor/bookings");
  return response.data;
}

export async function setBookingStatus(id: number, status: "approved" | "rejected"): Promise<ApiBooking> {
  const response = await api.patch(`/vendor/bookings/${id}/status`, { status });
  return response.data;
}

export async function getVendorStats(): Promise<VendorStatsResponse> {
  const response = await api.get("/vendor/stats");
  return response.data;
}