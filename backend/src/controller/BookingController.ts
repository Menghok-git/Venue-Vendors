import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entity/Booking";
import { Timeslot } from "../entity/Timeslot";

//hirer side. every route here already passed requireRole("hirer"),
//so req.user!.id is always the hirer making the call. we scope by it everywhere
//so nobody can read or touch someone else's bookings
const bookingRepo = () => AppDataSource.getRepository(Booking);
const timeslotRepo = () => AppDataSource.getRepository(Timeslot);

//flatten the booking down to the bits the react "my bookings" list shows
//pulls the venue up out of the timeslot so the hirer can see what they booked
function shapeBooking(b: Booking) {
  const slot = b.timeslot;
  const venue = slot?.venue;
  return {
    id: b.id,
    eventName: b.eventName,
    expectedGuests: b.expectedGuests,
    eventDate: b.eventDate,
    status: b.status,
    createdAt: b.createdAt,
    hirerId: b.hirerId,
    timeslotId: b.timeslotId,
    timeslot: slot
      ? {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          venue: venue
            ? { id: venue.id, name: venue.name, location: venue.location }
            : null,
        }
      : null,
  };
}

// POST /api/bookings  hirer requests a booking on a timeslot
export async function createBooking(req: Request, res: Response) {
  const hirerId = req.user!.id;
  const { timeslotId, eventName, expectedGuests, eventDate } = req.body as {
    timeslotId: number; eventName: string; expectedGuests: number; eventDate: string;
  };

  //1. slot has to exist. grab the venue with it so we can check capacity
  const slot = await timeslotRepo().findOne({
    where: { id: timeslotId },
    relations: { venue: true },
  });
  if (!slot) return res.status(404).json({ message: "That timeslot does not exist." });

  //2. vendors block slots (maintenance etc) so those are off limits
  if (slot.isBlocked) {
    return res.status(409).json({ message: "That timeslot is not available." });
  }

  //3. same capacity rule as the original form, now enforced on the server too
  if (expectedGuests > slot.venue.capacity) {
    return res.status(400).json({
      message: `Guest count exceeds the venue capacity of ${slot.venue.capacity}.`,
    });
  }

  //4. stop the same hirer firing off two requests for the same slot
  const dupe = await bookingRepo().findOne({
    where: { hirerId, timeslotId, status: "pending" },
  });
  if (dupe) {
    return res.status(409).json({ message: "You already have a pending request for this slot." });
  }

  //5. all good. save as pending, the vendor approves or rejects later
  const booking = bookingRepo().create({
    hirerId, timeslotId, eventName, expectedGuests, eventDate, status: "pending",
  });
  await bookingRepo().save(booking);

  //read it back with relations so the response matches the /mine shape
  const saved = await bookingRepo().findOne({
    where: { id: booking.id },
    relations: { timeslot: { venue: true } },
  });
  return res.status(201).json(shapeBooking(saved!));
}

// GET /api/bookings/mine  the logged-in hirer's own bookings
export async function listMyBookings(req: Request, res: Response) {
  const bookings = await bookingRepo().find({
    where: { hirerId: req.user!.id },
    relations: { timeslot: { venue: true } },
    order: { createdAt: "DESC" },
  });
  return res.json(bookings.map(shapeBooking));
}

// DELETE /api/bookings/:id  cancel your own pending booking
export async function cancelBooking(req: Request, res: Response) {
  const booking = await bookingRepo().findOne({
    where: { id: Number(req.params.id) },
  });
  if (!booking) return res.status(404).json({ message: "Booking not found." });

  //you can only ever touch your own. blocks a hirer cancelling someone else's
  if (booking.hirerId !== req.user!.id) {
    return res.status(403).json({ message: "That booking is not yours." });
  }

  //once the vendor has actioned it, cancelling no longer makes sense
  if (booking.status !== "pending") {
    return res.status(409).json({ message: "Only pending bookings can be cancelled." });
  }

  await bookingRepo().remove(booking);
  return res.status(204).send();
}