import {
  optionalNumber,
  positiveIntParam,
  requiredDateString,
  requiredString,
  validate,
} from "../middleware/validate.js";

export const validateCreateMaintenanceLog = validate((req) => ({
  body: {
    vehicle_id: positiveIntParam(req.body?.vehicle_id, "vehicle_id"),
    service_type: requiredString(req.body?.service_type, "service_type"),
    cost: optionalNumber(req.body?.cost, "cost") ?? 0,
    service_date: req.body?.service_date ? requiredDateString(req.body.service_date, "service_date") : null,
    notes: req.body?.notes ?? null,
  },
}));
