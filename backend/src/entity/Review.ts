import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Booking } from "./Booking";

//vendor's rating (0-5) + comment for a hirer after a booking.
//a hirer's "reputation" = average of the ratings in their reviews.
@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  rating: number; // 0-5, validated in the controller

  @Column({ type: "nvarchar", length: 1000, nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.reviews)
  @JoinColumn({ name: "bookingId" })
  booking: Booking;

  @Column()
  bookingId: number;

  //the hirer being reviewed (FK kept directly for easy reputation queries)
  @ManyToOne(() => User, (user) => user.reviewsReceived)
  @JoinColumn({ name: "hirerId" })
  hirer: User;

  @Column()
  hirerId: number;

  //the vendor who wrote the review
  @Column()
  vendorId: number;
}
