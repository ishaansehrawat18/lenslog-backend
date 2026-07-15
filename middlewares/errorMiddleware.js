// Catches requests to routes that don't exist anywhere in the app
// (e.g. GET /api/nonexistent). Must be registered AFTER all real routes.
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error); // hands off to errorHandler below
};

// Express recognizes this as an error-handling middleware because it
// takes 4 arguments (err, req, res, next) — this MUST be registered
// last, after every other app.use() and route.
export const errorHandler = (err, req, res, next) => {
  // If a controller already set a specific status (e.g. 400, 401, 403,
  // 404) via res.status(...), use that. Otherwise default to 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Mongoose "CastError" happens when an invalid ObjectId is passed
  // (e.g. a malformed post/comment ID in the URL) — treat as 400, not 500.
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // MongoDB duplicate key error (e.g. unique email/username violation)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already in use`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include the stack trace in development — never leak internals in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};