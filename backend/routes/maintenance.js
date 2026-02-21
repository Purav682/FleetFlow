import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  createMaintenanceLog,
  listMaintenanceLogs,
} from "../controllers/maintenanceController.js";
import { validateCreateMaintenanceLog } from "../validators/maintenanceValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/",
  authorizeRoles("Manager", "SafetyOfficer"),
  validateCreateMaintenanceLog,
  asyncHandler(createMaintenanceLog)
);
router.get("/", authorizeRoles("Manager", "SafetyOfficer", "Analyst"), asyncHandler(listMaintenanceLogs));

export default router;
