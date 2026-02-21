import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  createDriver,
  listDrivers,
  listEligibleDrivers,
  updateDriverStatus,
} from "../controllers/driverController.js";
import {
  validateCreateDriver,
  validateUpdateDriverStatus,
} from "../validators/driverValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRoles("Manager", "Dispatcher", "SafetyOfficer", "Analyst"), asyncHandler(listDrivers));
router.post("/", authorizeRoles("Manager", "SafetyOfficer"), validateCreateDriver, asyncHandler(createDriver));
router.put(
  "/:id/status",
  authorizeRoles("Manager", "SafetyOfficer"),
  validateUpdateDriverStatus,
  asyncHandler(updateDriverStatus)
);
router.get(
  "/eligible",
  authorizeRoles("Manager", "Dispatcher", "SafetyOfficer"),
  asyncHandler(listEligibleDrivers)
);

export default router;
