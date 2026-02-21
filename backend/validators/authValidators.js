import { AppError } from "../middleware/errors.js";
import {
  enumValue,
  optionalString,
  requiredEmail,
  requiredString,
  validate,
} from "../middleware/validate.js";

const allowedRoles = ["Manager", "Dispatcher", "SafetyOfficer", "Analyst"];

export const validateRegister = validate((req) => {
  const password = requiredString(req.body?.password, "password");
  if (password.length < 8) {
    throw new AppError(400, "password must be at least 8 characters long");
  }

  return {
    body: {
      name: requiredString(req.body?.name, "name"),
      email: requiredEmail(req.body?.email, "email"),
      password,
      role: enumValue(req.body?.role, allowedRoles, "role"),
      department: optionalString(req.body?.department),
      region: optionalString(req.body?.region),
      hub_location: optionalString(req.body?.hub_location),
      certification_id: optionalString(req.body?.certification_id),
      finance_unit: optionalString(req.body?.finance_unit),
    },
  };
});

export const validateLogin = validate((req) => ({
  body: {
    email: requiredEmail(req.body?.email, "email"),
    password: requiredString(req.body?.password, "password"),
  },
}));
