import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Venue } from "./entity/Venue";
import { Timeslot } from "./entity/Timeslot";
import { Booking } from "./entity/Booking";
import { Review } from "./entity/Review";

//non-destructive seed: demo data to build against, and
//satisfies "manually assign venues to vendors in the DB". Safe to run on the
//shared team DB, it does NOT delete anything; it skips if already seeded.
async function run() {
  await AppDataSource.initialize();
  const users = AppDataSource.getRepository(User);

  if (await users.findOne({ where: { email: "vendor@vv.com" } })) {
    console.log("Seed skipped: demo data already present.");
    await AppDataSource.destroy();
    return;
  }

  const hash = await bcrypt.hash("Passw0rd!", 10);

  await users.save(users.create({ email: "admin@vv.com", passwordHash: hash, role: "admin", fullName: "VV Admin" }));
  const vendor = await users.save(users.create({ email: "vendor@vv.com", passwordHash: hash, role: "vendor", fullName: "Travis Kelce", phone: "0498765432" }));
  const hirer = await users.save(users.create({ email: "hirer@vv.com", passwordHash: hash, role: "hirer", fullName: "Taylor Swift", phone: "0412345678" }));

  const venues = AppDataSource.getRepository(Venue);
  const v1 = await venues.save(venues.create({
    name: "Crown Palladium", location: "Southbank", capacity: 1500,
    description: "Grand ballroom in the heart of Southbank.", pricePerHour: 800,
    suitability: ["corporate", "wedding", "gala"], vendorId: vendor.id,
  }));
  const v2 = await venues.save(venues.create({
    name: "The Timber Yard", location: "Port Melbourne", capacity: 200,
    description: "Industrial-chic warehouse space.", pricePerHour: 300,
    suitability: ["birthday", "dinner", "concert"], vendorId: vendor.id,
  }));

  const slots = AppDataSource.getRepository(Timeslot);
  const today = new Date();
  const at = (dayOffset: number, hour: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const s1 = await slots.save(slots.create({ venueId: v1.id, startTime: at(7, 18), endTime: at(7, 23) }));
  await slots.save(slots.create({ venueId: v1.id, startTime: at(8, 9), endTime: at(8, 13) }));
  await slots.save(slots.create({ venueId: v2.id, startTime: at(10, 19), endTime: at(10, 23) }));

  const bookings = AppDataSource.getRepository(Booking);
  const b1 = await bookings.save(bookings.create({
    eventName: "Annual Gala 2026", expectedGuests: 400,
    eventDate: at(7, 18).toISOString().slice(0, 10), status: "approved",
    hirerId: hirer.id, timeslotId: s1.id,
  }));

  const reviews = AppDataSource.getRepository(Review);
  await reviews.save(reviews.create({
    rating: 5, comment: "Fantastic hirer, left the venue spotless.",
    bookingId: b1.id, hirerId: hirer.id, vendorId: vendor.id,
  }));

  console.log("✅ Seed complete. Demo logins (password: Passw0rd!):");
  console.log("   admin@vv.com  |  vendor@vv.com  |  hirer@vv.com");
  await AppDataSource.destroy();
}

run().catch((e) => { console.error(e); process.exit(1); });
