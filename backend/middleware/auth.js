import jwt from "jsonwebtoken";

import { AppError } from "./errors.js";

const DEFAULT_JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

function getJwtSecret() {
  return process.env.JWT_SECRET || "fleetflow-dev-insecure-secret";
}

export function signAccessToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: DEFAULT_JWT_EXPIRES_IN,
    issuer: "fleetflow-api",
  });
}

export function authenticateToken(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Authorization token is required"));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, getJwtSecret(), { issuer: "fleetflow-api" });
    req.auth = decoded;
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    const userRole = req.auth?.role;

    if (!userRole) {
      return next(new AppError(401, "Authentication context missing"));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError(403, "Insufficient role permissions"));
    }

    return next();
  };
}
