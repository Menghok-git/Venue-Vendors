import { Router } from "express";
import authRoutes from "./auth.routes";
import venueRoutes from "./venue.routes";
import vendorRoutes from "./vendor.routes";
import bookingRoutes from "./booking.routes";
import hirerRoutes from "./hirer.routes";

//single mount point. index.ts is touched by both teammates, so coordinate edits
//here via a quick PR rather than committing straight to main.
const router = Router();

router.use("/auth", authRoutes);       
router.use("/venues", venueRoutes);     
router.use("/vendor", vendorRoutes);    
router.use("/bookings", bookingRoutes); 
router.use("/hirer", hirerRoutes);

export default router;
