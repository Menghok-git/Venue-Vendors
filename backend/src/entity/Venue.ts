import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Timeslot } from "./Timeslot";

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "nvarchar", length: 200 })
  name: string;

  @Column({ type: "nvarchar", length: 300 })
  location: string;

  @Column({ type: "int" })
  capacity: number;

  @Column({ type: "nvarchar", length: 2000, nullable: true })
  description: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  pricePerHour: number | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  imageUrl: string | null;

  //"recommended suitability" keywords, e.g. ["wedding","corporate","concert"].
  //stored as a comma-separated list (simple-array). Search filters on this in VenueController.
  @Column({ type: "simple-array", nullable: true })
  suitability: string[];

  //admin can feature/unfeature a venue on the hirer landing page.
  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  //a venue belongs to exactly one vendor (a vendor can own many venues).
  @ManyToOne(() => User, (user) => user.venues)
  @JoinColumn({ name: "vendorId" })
  vendor: User;

  @Column()
  vendorId: number;

  @OneToMany(() => Timeslot, (timeslot) => timeslot.venue)
  timeslots: Timeslot[];
}
