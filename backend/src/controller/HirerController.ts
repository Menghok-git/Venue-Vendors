import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Review } from "../entity/Review";
import { In } from "typeorm";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";

//hirer-only stuff that isn't bookings: reputation (the star ratings vendors leave
//them) and venue candidates (their chosen venues + preference order). everything
//is scoped to req.user!.id so a hirer only ever touches their own.
const reviewRepo = () => AppDataSource.getRepository(Review);
const userRepo = () => AppDataSource.getRepository(User);
const venueRepo = () => AppDataSource.getRepository(Venue);

//the column stores strings ("1,2"), so turn it back into a clean number[].
function readRankedIds(u: User): number[] {
  return (u.rankedVenueIds ?? [])
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n > 0);
}

//load the given venue ids and hand them back in the SAME order as the ids list,
//so the hirer's ranking is preserved. only the bits the ranking UI needs.
async function venuesInOrder(ids: number[]) {
  if (ids.length === 0) return [];
  const found = await venueRepo().find({ where: { id: In(ids) } });
  return ids
    .map((id) => found.find((v) => v.id === id))
    .filter((v): v is Venue => !!v)
    .map((v) => ({ id: v.id, name: v.name, location: v.location }));
}

// GET /api/hirer/reputation  the logged-in hirer's rating history
export async function getReputation(req: Request, res: Response) {
  //walk review -> booking -> timeslot -> venue so each row knows where and what
  //the rating was for, all in one query.
  const reviews = await reviewRepo().find({
    where: { hirerId: req.user!.id },
    relations: { booking: { timeslot: { venue: true } } },
    order: { createdAt: "DESC" },
  });

  const history = reviews.map((r) => {
    const venue = r.booking?.timeslot?.venue;
    return {
      venueName: venue?.name ?? "Unknown venue",
      location: venue?.location ?? "",
      eventName: r.booking?.eventName ?? "",
      dateOfHire: r.booking?.eventDate ?? "",
      rating: r.rating,
    };
  });

  //average across every rating, or null if they've never been reviewed.
  const average = history.length
    ? Number((history.reduce((sum, h) => sum + h.rating, 0) / history.length).toFixed(1))
    : null;

  return res.json({ average, history });
}

// GET /api/hirer/candidates  the hirer's chosen venues, in ranked order
export async function getCandidates(req: Request, res: Response) {
  const user = await userRepo().findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json(await venuesInOrder(readRankedIds(user)));
}

// PUT /api/hirer/candidates  save the chosen venues and their order
export async function saveCandidates(req: Request, res: Response) {
  const { venueIds } = req.body as { venueIds: number[] };

  //1. keep only ids that are real venues, so a stale id can't poison the list.
  const realVenues = await venueRepo().find({ where: { id: In(venueIds.length ? venueIds : [0]) } });
  const realIds = new Set(realVenues.map((v) => v.id));
  const cleaned = venueIds.filter((id) => realIds.has(id));

  //2. store the ordered list on the hirer (simple-array saves them as strings).
  const user = await userRepo().findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: "User not found." });
  user.rankedVenueIds = cleaned.map((id) => String(id));
  await userRepo().save(user);

  return res.json(await venuesInOrder(cleaned));
}