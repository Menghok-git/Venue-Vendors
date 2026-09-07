import { Router } from "express";
import { body } from "express-validator";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { handleValidation } from "../middleware/validate.middleware";
import { getReputation, getCandidates, saveCandidates } from "../controller/HirerController";

//hirer-only routes that aren't bookings
const router = Router();
router.use(authenticate, requireRole("hirer"));

router.get("/reputation", getReputation);

router.get("/candidates", getCandidates);
router.put(
  "/candidates",
  [
    body("venueIds").isArray().withMessage("venueIds must be an array."),
    body("venueIds.*").isInt({ gt: 0 }).withMessage("Each venue id must be a positive number."),
  ],
  handleValidation,
  saveCandidates,
);

export default router;