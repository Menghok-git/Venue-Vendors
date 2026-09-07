import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { handleValidation } from "../middleware/validate.middleware";
import { createBooking, listMyBookings, cancelBooking } from "../controller/BookingController";

//every route here is hirer-only
const router = Router();
router.use(authenticate, requireRole("hirer"));

//same rules the react form checks, enforced again here so the server never trusts the body on its own
router.post(
  "/",
  [
    body("timeslotId").isInt({ gt: 0 }).withMessage("Please pick a venue timeslot."),
    body("eventName").trim().isLength({ min: 3 }).withMessage("Event name must be at least 3 characters."),
    body("expectedGuests").isInt({ gt: 0 }).withMessage("Guest count must be a positive number."),
    body("eventDate")
      .isISO8601().withMessage("A valid event date is required.")
      .custom((value) => new Date(value) > new Date()).withMessage("Event date must be in the future."),
  ],
  handleValidation,
  createBooking,
);

router.get("/mine", listMyBookings);

//make sure the :id in the url is a real number before it reaches the controller
router.delete(
  "/:id",
  [param("id").isInt({ gt: 0 }).withMessage("Invalid booking id.")],
  handleValidation,
  cancelBooking,
);

export default router;