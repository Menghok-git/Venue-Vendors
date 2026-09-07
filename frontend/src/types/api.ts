export type UserRole = "hirer" | "vendor" | "admin";

export interface ApiUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  dateJoined: string;
}

export interface ApiTimeslot {
  id: number;
  startTime: string;
  endTime: string;
  isBlocked: boolean;
  venueId: number;
}

export interface ApiVenue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description: string | null;
  pricePerHour: number | null;
  imageUrl: string | null;
  suitability: string[];
  isFeatured: boolean;
  createdAt: string;
  vendorId: number;
  vendor: { id: number; name: string; email: string } | null;
  timeslots?: ApiTimeslot[];
}

export type BookingStatus = "pending" | "approved" | "rejected";
export interface ApiBooking {
  id: number;
  eventName: string;
  expectedGuests: number;
  eventDate: string;
  status: BookingStatus;
  createdAt: string;
  hirerId: number;
  timeslotId: number;
  timeslot?: {
    id: number;
    startTime: string;
    endTime: string;
    venue: { id: number; name: string; location: string } | null;
  } | null;
  // added for vendor booking view
  hirer?: { id: number; fullName: string };
  hirerReputation?: number | null;
}

export interface ApiReview {
  id: number;
  rating: number;
  comment: string | null;
  bookingId: number;
  hirerId: number;
  vendorId: number;
}

export interface ApiReputationEntry {
  venueName: string;
  location: string;
  eventName: string;
  dateOfHire: string;
  rating: number;
}

export interface ApiReputation {
  average: number | null;
  history: ApiReputationEntry[];
}

export interface RankedVenue {
  id: number;
  name: string;
  location: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: "hirer" | "vendor";
}
export interface LoginPayload { email: string; password: string; }
export interface AuthResponse { token: string; user: ApiUser; }