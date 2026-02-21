import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  getDashboardReport,
  getFuelEfficiencyReport,
  getVehicleCostReport,
} from "../controllers/reportController.js";
import {
  validateFuelEfficiencyVehicleId,
  validateVehicleCostId,
} from "../validators/reportValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/dashboard", authorizeRoles("Manager", "Analyst", "SafetyOfficer"), asyncHandler(getDashboardReport));
router.get(
  "/vehicle-cost/:id",
  authorizeRoles("Manager", "Analyst"),
  validateVehicleCostId,
  asyncHandler(getVehicleCostReport)
);
router.get(
  "/fuel-efficiency/:vehicleId",
  authorizeRoles("Manager", "Analyst"),
  validateFuelEfficiencyVehicleId,
  asyncHandler(getFuelEfficiencyReport)
);

export default router;
