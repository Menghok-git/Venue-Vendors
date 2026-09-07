import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from "typeorm";
import { Venue } from "./Venue";
import { Booking } from "./Booking";
import { Review } from "./Review";
import { ComplianceDocument } from "./ComplianceDocument";

//one users table for all three roles. Role-based access is enforced in the
//auth middleware + per-route guards (see middleware/auth.middleware.ts).
export type UserRole = "hirer" | "vendor" | "admin";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "nvarchar", length: 255, unique: true })
  email: string;

  //never returned to the client. Hashed with bcryptjs in AuthController.
  @Column({ type: "nvarchar", length: 255 })
  passwordHash: string;

  @Column({ type: "nvarchar", length: 20 })
  role: UserRole;

  @Column({ type: "nvarchar", length: 150 })
  fullName: string;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  phone: string | null;

  //postgrad-only feature; harmless to keep nullable for UG.
  @Column({ type: "nvarchar", length: 500, nullable: true })
  avatarUrl: string | null;

  //a hirer's chosen venue candidates, in preference order. stored as a simple
  //comma-separated list, same idea as Venue.suitability. null for vendors/admins.
  @Column({ type: "simple-array", nullable: true })
  rankedVenueIds: string[] | null;

  @CreateDateColumn()
  dateJoined: Date;

  @OneToMany(() => Venue, (venue) => venue.vendor)
  venues: Venue[];

  @OneToMany(() => Booking, (booking) => booking.hirer)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.hirer)
  reviewsReceived: Review[];

  @OneToMany(() => ComplianceDocument, (doc) => doc.hirer)
  documents: ComplianceDocument[];
}
