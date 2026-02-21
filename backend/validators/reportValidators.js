import { positiveIntParam, validate } from "../middleware/validate.js";

export const validateVehicleCostId = validate((req) => ({
  params: { id: positiveIntParam(req.params.id, "id") },
}));

export const validateFuelEfficiencyVehicleId = validate((req) => ({
  params: { vehicleId: positiveIntParam(req.params.vehicleId, "vehicleId") },
}));
