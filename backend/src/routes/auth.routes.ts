import { Router } from "express";
import { body } from "express-validator";
import { handleValidation } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { register, login, me, updateMe } from "../controller/AuthController";
import { STRONG_PASSWORD_REGEX, PASSWORD_RULE_MESSAGE } from "../utils/password";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").matches(STRONG_PASSWORD_REGEX).withMessage(PASSWORD_RULE_MESSAGE),
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("role").optional().isIn(["hirer", "vendor"]).withMessage("Role must be hirer or vendor"),
  ],
  handleValidation,
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidation,
  login,
);

router.get("/me", authenticate, me);
router.put("/me", authenticate, updateMe);

export default router;
