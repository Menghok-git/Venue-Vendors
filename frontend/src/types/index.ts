/**
 * VV shared types (legacy + auth).
 *
 * - `User` and `UserRole` are the live auth types, used by AuthContext.
 * - the rest (Venue, Application, HireHistory, CredibilityDocuments) are the old
 *   A1 localStorage shapes. keeping them around so the existing components still
 *   compile. for anything NEW that's database-backed, import the proper DTOs from
 *   "@/types/api" instead and migrate components over one feature at a time.
 */

export type UserRole = "hirer" | "vendor" | "admin";

export interface CredibilityDocuments {
  licenseFile?: string;
  insuranceFile?: string;
  isBusiness: boolean;
  abnNumber?: string;
  businessCertFile?: string;
  credibilityScore: number;
}

export interface User {
  id?: number;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  dateJoined?: string;
  //legacy/optional (no longer populated from the backend):
  password?: string;
  rankedVenueIds?: number[];
  credibility?: CredibilityDocuments;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  suitability: string;
  isBlocked: boolean;
  blockedFrom?: string;
  blockedTo?: string;
}

export interface Application {
  id: number;
  hirerEmail: string;
  venueId: number;
  eventName: string;
  guestCount: number;
  hirerId: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
  vendorComment?: string;
}

export interface HireHistory {
  hirerEmail: string;
  venueId: number;
  venueName: string;
  location: string;
  eventName: string;
  dateOfHire: string;
  starRating: number;
}
