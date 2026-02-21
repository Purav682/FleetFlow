import express from "express";
import { asyncHandler } from "../middleware/errors.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.js";
import {
  cancelTrip,
  completeTrip,
  dispatchTrip,
  listTrips,
} from "../controllers/tripController.js";
import {
  validateCancelTrip,
  validateCompleteTrip,
  validateDispatchTrip,
} from "../validators/tripValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRoles("Manager", "Dispatcher", "Analyst"), asyncHandler(listTrips));
router.post("/dispatch", authorizeRoles("Manager", "Dispatcher"), validateDispatchTrip, asyncHandler(dispatchTrip));
router.put(
  "/:id/complete",
  authorizeRoles("Manager", "Dispatcher"),
  validateCompleteTrip,
  asyncHandler(completeTrip)
);
router.put("/:id/cancel", authorizeRoles("Manager", "Dispatcher"), validateCancelTrip, asyncHandler(cancelTrip));

export default router;
