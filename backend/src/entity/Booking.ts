import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Timeslot } from "./Timeslot";
import { Review } from "./Review";

export type BookingStatus = "pending" | "approved" | "rejected";

//a hirer's request to book a timeslot for an event. Vendor approves/rejects (CR).
@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "nvarchar", length: 200 })
  eventName: string;

  @Column({ type: "int" })
  expectedGuests: number;

  @Column({ type: "date" })
  eventDate: string;

  @Column({ type: "nvarchar", length: 20, default: "pending" })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: "hirerId" })
  hirer: User;

  @Column()
  hirerId: number;

  @ManyToOne(() => Timeslot, (timeslot) => timeslot.bookings)
  @JoinColumn({ name: "timeslotId" })
  timeslot: Timeslot;

  @Column()
  timeslotId: number;

  @OneToMany(() => Review, (review) => review.booking)
  reviews: Review[];
}
