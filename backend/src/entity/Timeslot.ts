import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from "typeorm";
import { Venue } from "./Venue";
import { Booking } from "./Booking";

//a bookable availability window on a venue. The vendor can block/unblock it.
@Entity()
export class Timeslot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "datetime2" })
  startTime: Date;

  @Column({ type: "datetime2" })
  endTime: Date;

  //vendor blocks a slot (e.g. maintenance) so hirers cannot book it.
  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Venue, (venue) => venue.timeslots)
  @JoinColumn({ name: "venueId" })
  venue: Venue;

  @Column()
  venueId: number;

  @OneToMany(() => Booking, (booking) => booking.timeslot)
  bookings: Booking[];
}
