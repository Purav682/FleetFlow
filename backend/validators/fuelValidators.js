import {
  positiveIntParam,
  requiredDateString,
  requiredNumber,
  validate,
} from "../middleware/validate.js";

export const validateCreateFuelLog = validate((req) => ({
  body: {
    trip_id: positiveIntParam(req.body?.trip_id, "trip_id"),
    liters: requiredNumber(req.body?.liters, "liters"),
    cost: requiredNumber(req.body?.cost, "cost"),
    date: req.body?.date ? requiredDateString(req.body.date, "date") : null,
  },
}));

export const validateFuelEntityIdParam = validate((req) => ({
  params: { id: positiveIntParam(req.params.id, "id") },
}));
