import {
  enumValue,
  positiveIntParam,
  requiredDateString,
  requiredNumber,
  requiredString,
  validate,
} from "../middleware/validate.js";

const allowedDriverStatuses = ["OnDuty", "OffDuty", "Suspended"];

export const validateCreateDriver = validate((req) => ({
  body: {
    name: requiredString(req.body?.name, "name"),
    license_type: requiredString(req.body?.license_type, "license_type"),
    license_expiry_date: requiredDateString(req.body?.license_expiry_date, "license_expiry_date"),
    safety_score: req.body?.safety_score == null ? 100 : requiredNumber(req.body.safety_score, "safety_score"),
    status: enumValue(req.body?.status ?? "OnDuty", allowedDriverStatuses, "status"),
  },
}));

export const validateUpdateDriverStatus = validate((req) => ({
  params: { id: positiveIntParam(req.params.id, "id") },
  body: { status: enumValue(req.body?.status, allowedDriverStatuses, "status") },
}));
