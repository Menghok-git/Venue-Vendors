import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";

//shared READ endpoints (hirers see all venues from all vendors).
//the hirer-search filter lives here
const venueRepo = () => AppDataSource.getRepository(Venue);

function publicVenue(v: Venue) {
  const vendor = v.vendor
    ? { id: v.vendor.id, name: v.vendor.fullName, email: v.vendor.email }
    : null;
  return { ...v, vendor };
}

// GET /api/venues
export async function listVenues(_req: Request, res: Response) {
  const venues = await venueRepo().find({ relations: { vendor: true, timeslots: true } });
  return res.json(venues.map(publicVenue));
}

// GET /api/venues/search?name=&location=&minCapacity=&suitability=
export async function searchVenues(req: Request, res: Response) {
  const { name, location, minCapacity, suitability } = req.query as Record<string, string>;
  let venues = await venueRepo().find({ relations: { vendor: true, timeslots: true } });

  if (name) venues = venues.filter((v) => v.name.toLowerCase().includes(name.toLowerCase()));
  if (location) venues = venues.filter((v) => v.location.toLowerCase().includes(location.toLowerCase()));
  if (minCapacity) venues = venues.filter((v) => v.capacity >= Number(minCapacity));
  if (suitability) {
    const want = suitability.toLowerCase();
    venues = venues.filter((v) => (v.suitability ?? []).some((s) => s.toLowerCase().includes(want)));
  }
  return res.json(venues.map(publicVenue));
}

// GET /api/venues/:id
export async function getVenue(req: Request, res: Response) {
  const venue = await venueRepo().findOne({
    where: { id: Number(req.params.id) },
    relations: { vendor: true, timeslots: true },
  });
  if (!venue) return res.status(404).json({ message: "Venue not found" });
  return res.json(publicVenue(venue));
}
