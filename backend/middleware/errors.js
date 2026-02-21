export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }

  if (error && error.code === "23505") {
    return res.status(409).json({
      error: "Unique constraint violation",
      details: error.detail,
    });
  }

  if (error && error.code === "23503") {
    return res.status(409).json({
      error: "Foreign key constraint violation",
      details: error.detail,
    });
  }

  if (error && error.code === "22P02") {
    return res.status(400).json({
      error: "Invalid input format",
      details: error.message,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
    details: error?.message ?? null,
  });
}
