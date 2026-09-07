import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { Timeslot } from "../entity/Timeslot";
import { Booking } from "../entity/Booking";
import { Review } from "../entity/Review";

const venueRepo    = () => AppDataSource.getRepository(Venue);
const timeslotRepo = () => AppDataSource.getRepository(Timeslot);
const bookingRepo  = () => AppDataSource.getRepository(Booking);
const reviewRepo   = () => AppDataSource.getRepository(Review);

// GET /api/vendor/venues
export async function listMyVenues(req: Request, res: Response) {
  try {
    const venues = await venueRepo().find({
      where: { vendorId: req.user!.id },
      relations: ["timeslots"],
      order: { createdAt: "DESC" },
    });
    res.json(venues);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch venues" });
  }
}

// POST /api/vendor/venues
export async function createVenue(req: Request, res: Response) {
  try {
    const { name, location, capacity, description, pricePerHour, imageUrl, suitability, isFeatured } = req.body;
    const venue = venueRepo().create({
      name, location, capacity, description, pricePerHour, imageUrl,
      suitability: suitability ?? [],
      isFeatured: isFeatured ?? false,
      vendorId: req.user!.id,
    });
    await venueRepo().save(venue);
    res.status(201).json(venue);
  } catch (e) {
    res.status(500).json({ message: "Failed to create venue" });
  }
}

// PUT /api/vendor/venues/:id
export async function updateVenue(req: Request, res: Response) {
  try {
    const venue = await venueRepo().findOne({
      where: { id: Number(req.params.id), vendorId: req.user!.id },
    });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    const { name, location, capacity, description, pricePerHour, imageUrl, suitability, isFeatured } = req.body;
    Object.assign(venue, { name, location, capacity, description, pricePerHour, imageUrl, suitability, isFeatured });
    await venueRepo().save(venue);
    res.json(venue);
  } catch (e) {
    res.status(500).json({ message: "Failed to update venue" });
  }
}

// DELETE /api/vendor/venues/:id
export async function deleteVenue(req: Request, res: Response) {
  try {
    const venue = await venueRepo().findOne({
      where: { id: Number(req.params.id), vendorId: req.user!.id },
    });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    await venueRepo().remove(venue);
    res.json({ message: "Venue deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete venue" });
  }
}

// POST /api/vendor/venues/:id/timeslots
export async function addTimeslot(req: Request, res: Response) {
  try {
    const venue = await venueRepo().findOne({
      where: { id: Number(req.params.id), vendorId: req.user!.id },
    });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    const { startTime, endTime } = req.body;
    const slot = timeslotRepo().create({ startTime, endTime, isBlocked: false, venueId: venue.id });
    await timeslotRepo().save(slot);
    res.status(201).json(slot);
  } catch (e) {
    res.status(500).json({ message: "Failed to add timeslot" });
  }
}

// PATCH /api/vendor/timeslots/:id/block
export async function setTimeslotBlocked(req: Request, res: Response) {
  try {
    const slot = await timeslotRepo().findOne({
      where: { id: Number(req.params.id) },
      relations: ["venue"],
    });
    if (!slot || slot.venue.vendorId !== req.user!.id)
      return res.status(404).json({ message: "Timeslot not found" });
    slot.isBlocked = req.body.isBlocked ?? !slot.isBlocked;
    await timeslotRepo().save(slot);
    res.json(slot);
  } catch (e) {
    res.status(500).json({ message: "Failed to update timeslot" });
  }
}

// GET /api/vendor/bookings
export async function listVendorBookings(req: Request, res: Response) {
  try {
    const bookings = await bookingRepo()
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.timeslot", "timeslot")
      .leftJoinAndSelect("timeslot.venue", "venue")
      .leftJoinAndSelect("booking.hirer", "hirer")
      .where("venue.vendorId = :vendorId", { vendorId: req.user!.id })
      .orderBy("booking.createdAt", "DESC")
      .getMany();

    const hirerIds = [...new Set(bookings.map(b => b.hirerId))];

    const reputationMap: Record<number, number | null> = {};
    if (hirerIds.length > 0) {
      const rows = await reviewRepo()
        .createQueryBuilder("review")
        .select("review.hirerId", "hirerId")
        .addSelect("AVG(CAST(review.rating AS FLOAT))", "avg")
        .where("review.hirerId IN (:...ids)", { ids: hirerIds })
        .groupBy("review.hirerId")
        .getRawMany();
      rows.forEach((r: any) => {
        reputationMap[r.hirerId] = r.avg != null ? Math.round(r.avg * 10) / 10 : null;
      });
    }

    const result = bookings.map(b => ({
      id: b.id,
      eventName: b.eventName,
      expectedGuests: b.expectedGuests,
      eventDate: b.eventDate,
      status: b.status,
      createdAt: b.createdAt,
      hirerId: b.hirerId,
      timeslotId: b.timeslotId,
      timeslot: b.timeslot ? {
        id: b.timeslot.id,
        startTime: b.timeslot.startTime,
        endTime: b.timeslot.endTime,
        venue: b.timeslot.venue ? {
          id: b.timeslot.venue.id,
          name: b.timeslot.venue.name,
          location: b.timeslot.venue.location,
        } : null,
      } : null,
      hirer: b.hirer ? { id: b.hirer.id, fullName: b.hirer.fullName } : undefined,
      hirerReputation: reputationMap[b.hirerId] ?? null,
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
}

// PATCH /api/vendor/bookings/:id/status
export async function setBookingStatus(req: Request, res: Response) {
  try {
    const booking = await bookingRepo()
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.timeslot", "timeslot")
      .leftJoinAndSelect("timeslot.venue", "venue")
      .where("booking.id = :id", { id: Number(req.params.id) })
      .andWhere("venue.vendorId = :vendorId", { vendorId: req.user!.id })
      .getOne();
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    booking.status = status;
    await bookingRepo().save(booking);
    res.json(booking);
  } catch (e) {
    res.status(500).json({ message: "Failed to update booking status" });
  }
}

// GET /api/vendor/stats
export async function getVendorStats(req: Request, res: Response) {
  try {
    const vendorId = req.user!.id;

    const byVenue = await bookingRepo()
      .createQueryBuilder("booking")
      .leftJoin("booking.timeslot", "timeslot")
      .leftJoin("timeslot.venue", "venue")
      .select("venue.name", "venueName")
      .addSelect("COUNT(booking.id)", "total")
      .addSelect("SUM(CASE WHEN booking.status = 'approved' THEN 1 ELSE 0 END)", "approved")
      .addSelect("SUM(CASE WHEN booking.status = 'rejected' THEN 1 ELSE 0 END)", "rejected")
      .addSelect("SUM(CASE WHEN booking.status = 'pending' THEN 1 ELSE 0 END)", "pending")
      .where("venue.vendorId = :vendorId", { vendorId })
      .groupBy("venue.name")
      .getRawMany();

    const overTime = await bookingRepo()
      .createQueryBuilder("booking")
      .leftJoin("booking.timeslot", "timeslot")
      .leftJoin("timeslot.venue", "venue")
      .select("FORMAT(booking.createdAt, 'yyyy-MM')", "month")
      .addSelect("COUNT(booking.id)", "count")
      .where("venue.vendorId = :vendorId", { vendorId })
      .groupBy("FORMAT(booking.createdAt, 'yyyy-MM')")
      .orderBy("month", "ASC")
      .getRawMany();

    const byHirer = await bookingRepo()
      .createQueryBuilder("booking")
      .leftJoin("booking.timeslot", "timeslot")
      .leftJoin("timeslot.venue", "venue")
      .leftJoin("booking.hirer", "hirer")
      .select("hirer.fullName", "hirerName")
      .addSelect("COUNT(booking.id)", "count")
      .where("venue.vendorId = :vendorId", { vendorId })
      .groupBy("hirer.fullName")
      .orderBy("count", "DESC")
      .getRawMany();

    res.json({
      bookingsByVenue: byVenue,
      bookingsOverTime: overTime,
      bookingsByHirer: byHirer,
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}