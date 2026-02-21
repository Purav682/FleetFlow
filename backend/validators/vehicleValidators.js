import {
  enumValue,
  optionalNumber,
  positiveIntParam,
  requiredNumber,
  requiredString,
  validate,
} from "../middleware/validate.js";

const allowedVehicleStatuses = ["Available", "OnTrip", "InShop", "Retired", "Retied"];

function normalizeVehicleStatus(status) {
  return status === "Retied" ? "Retired" : status;
}

export const validateCreateVehicle = validate((req) => {
  const status = enumValue(req.body?.status ?? "Available", allowedVehicleStatuses, "status");

  return {
    body: {
      model: requiredString(req.body?.model, "model"),
      license_plate: requiredString(req.body?.license_plate, "license_plate"),
      max_capacity: requiredNumber(req.body?.max_capacity, "max_capacity"),
      odometer: optionalNumber(req.body?.odometer, "odometer") ?? 0,
      status: normalizeVehicleStatus(status),
    },
  };
});

export const validateUpdateVehicleStatus = validate((req) => {
  const status = enumValue(req.body?.status, allowedVehicleStatuses, "status");

  return {
    params: { id: positiveIntParam(req.params.id, "id") },
    body: { status: normalizeVehicleStatus(status) },
  };
});
