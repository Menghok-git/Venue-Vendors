import { Router } from "express";
import { body } from "express-validator";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import {
  listMyVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  addTimeslot,
  setTimeslotBlocked,
  listVendorBookings,
  setBookingStatus,
  getVendorStats,
} from "../controller/VendorController";

const router = Router();

// Every route in this file requires a logged-in vendor
const guard = [authenticate, requireRole("vendor")];

// Validation for creating or updating a venue
const venueRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("pricePerHour").optional().isFloat({ min: 0 }).withMessage("Price must be 0 or more"),
];

// Validation for adding a timeslot
const timeslotRules = [
  body("startTime").notEmpty().withMessage("Start time is required"),
  body("endTime").notEmpty().withMessage("End time is required"),
];

// Validation for approving or rejecting a booking
const statusRules = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),
];

router.get("/venues", ...guard, listMyVenues);
router.post("/venues", ...guard, ...venueRules, createVenue);
router.put("/venues/:id", ...guard, ...venueRules, updateVenue);
router.delete("/venues/:id", ...guard, deleteVenue);

router.post("/venues/:id/timeslots", ...guard, ...timeslotRules, addTimeslot);
router.patch("/timeslots/:id/block", ...guard, setTimeslotBlocked);

router.get("/bookings", ...guard, listVendorBookings);
router.patch("/bookings/:id/status", ...guard, ...statusRules, setBookingStatus);

router.get("/stats", ...guard, getVendorStats);

export default router;