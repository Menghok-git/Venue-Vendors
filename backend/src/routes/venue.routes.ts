import { Router } from "express";
import { listVenues, getVenue, searchVenues } from "../controller/VenueController";

//hirers browse/search every vendor's venues.
//"/search" is declared BEFORE "/:id" so it isn't swallowed by the param route.
const router = Router();

router.get("/", listVenues);
router.get("/search", searchVenues);
router.get("/:id", getVenue);

export default router;
