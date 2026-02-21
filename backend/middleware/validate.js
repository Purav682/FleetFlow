import { AppError } from "./errors.js";

export const validate = (validator) => (req, _res, next) => {
  try {
    const validated = validator(req);

    if (validated?.body) {
      req.body = validated.body;
    }

    if (validated?.params) {
      req.params = { ...req.params, ...validated.params };
    }

    if (validated?.query) {
      req.query = { ...req.query, ...validated.query };
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(400, "Validation failed", error?.message));
  }
};

export function requiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, `${fieldName} is required`);
  }
  return value.trim();
}

export function optionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError(400, "Optional value must be a string");
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function requiredEmail(value, fieldName = "email") {
  const email = requiredString(value, fieldName).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(400, `${fieldName} must be a valid email address`);
  }

  return email;
}

export function requiredNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AppError(400, `${fieldName} must be a valid number`);
  }
  return parsed;
}

export function optionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return requiredNumber(value, fieldName);
}

export function requiredDateString(value, fieldName) {
  const text = requiredString(value, fieldName);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }
  return text;
}

export function enumValue(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw new AppError(400, `${fieldName} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

export function positiveIntParam(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, `${fieldName} must be a positive integer`);
  }
  return parsed;
}
