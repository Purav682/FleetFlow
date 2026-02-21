import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { login, register } from "../controllers/authController.js";
import { validateLogin, validateRegister } from "../validators/authValidators.js";

const router = express.Router();

// Role-based user onboarding for FleetFlow operations, safety, and analytics teams.
router.post("/register", validateRegister, asyncHandler(register));
router.post("/login", validateLogin, asyncHandler(login));

export default router;
