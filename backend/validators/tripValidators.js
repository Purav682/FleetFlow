import {
  optionalNumber,
  positiveIntParam,
  requiredNumber,
  requiredString,
  validate,
} from "../middleware/validate.js";

export const validateDispatchTrip = validate((req) => ({
  body: {
    vehicle_id: positiveIntParam(req.body?.vehicle_id, "vehicle_id"),
    driver_id: positiveIntParam(req.body?.driver_id, "driver_id"),
    cargo_weight: requiredNumber(req.body?.cargo_weight, "cargo_weight"),
    origin: requiredString(req.body?.origin, "origin"),
    destination: requiredString(req.body?.destination, "destination"),
    odometer_start: optionalNumber(req.body?.odometer_start, "odometer_start"),
  },
}));

export const validateCompleteTrip = validate((req) => ({
  params: { id: positiveIntParam(req.params.id, "id") },
  body: { odometer_end: optionalNumber(req.body?.odometer_end, "odometer_end") },
}));

export const validateCancelTrip = validate((req) => ({
  params: { id: positiveIntParam(req.params.id, "id") },
}));
