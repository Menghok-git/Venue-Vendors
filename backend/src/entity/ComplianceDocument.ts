import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from "typeorm";
import { User } from "./User";

export type DocumentType =
  | "drivers_license"
  | "public_liability"
  | "business_registration";

//hirer's compliance documents. The "compliance score" a vendor sees =
//completeness of these documents.
@Entity()
export class ComplianceDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "nvarchar", length: 40 })
  type: DocumentType;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  fileName: string | null;

  //only for business_registration documents
  @Column({ type: "nvarchar", length: 30, nullable: true })
  abn: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "hirerId" })
  hirer: User;

  @Column()
  hirerId: number;
}
