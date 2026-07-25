// Must run AFTER `protect` in the route chain — relies on req.user
// already being set by the auth middleware.
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

export default admin;