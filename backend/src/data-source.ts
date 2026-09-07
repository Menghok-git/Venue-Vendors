import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entity/User";
import { Venue } from "./entity/Venue";
import { Timeslot } from "./entity/Timeslot";
import { Booking } from "./entity/Booking";
import { Review } from "./entity/Review";
import { ComplianceDocument } from "./entity/ComplianceDocument";

dotenv.config();

//single TypeORM connection used everywhere via AppDataSource.getRepository(...).
export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 1433),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== "false",
  },
  //auto-syncs tables from entities in dev. Turn OFF (DB_SYNCHRONIZE=false) once the schema is stable.
  synchronize: process.env.DB_SYNCHRONIZE !== "false",
  logging: false,
  entities: [User, Venue, Timeslot, Booking, Review, ComplianceDocument],
  migrations: [],
  subscribers: [],
});
