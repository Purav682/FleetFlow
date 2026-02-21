import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  createVehicle,
  listAvailableVehicles,
  listVehicles,
  updateVehicleStatus,
} from "../controllers/vehicleController.js";
import {
  validateCreateVehicle,
  validateUpdateVehicleStatus,
} from "../validators/vehicleValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRoles("Manager", "Dispatcher", "SafetyOfficer", "Analyst"), asyncHandler(listVehicles));
router.post("/", authorizeRoles("Manager", "Dispatcher"), validateCreateVehicle, asyncHandler(createVehicle));
router.put(
  "/:id/status",
  authorizeRoles("Manager", "Dispatcher"),
  validateUpdateVehicleStatus,
  asyncHandler(updateVehicleStatus)
);
router.get("/available", authorizeRoles("Manager", "Dispatcher"), asyncHandler(listAvailableVehicles));

export default router;
