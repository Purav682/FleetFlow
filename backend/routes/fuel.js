import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  createFuelLog,
  getFuelLogsByTrip,
  getFuelLogsByVehicle,
} from "../controllers/fuelController.js";
import {
  validateCreateFuelLog,
  validateFuelEntityIdParam,
} from "../validators/fuelValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorizeRoles("Manager", "Dispatcher"), validateCreateFuelLog, asyncHandler(createFuelLog));
router.get(
  "/vehicle/:id",
  authorizeRoles("Manager", "Dispatcher", "Analyst"),
  validateFuelEntityIdParam,
  asyncHandler(getFuelLogsByVehicle)
);
router.get(
  "/trip/:id",
  authorizeRoles("Manager", "Dispatcher", "Analyst"),
  validateFuelEntityIdParam,
  asyncHandler(getFuelLogsByTrip)
);

export default router;
