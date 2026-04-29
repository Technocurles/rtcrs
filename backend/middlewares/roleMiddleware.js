
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (normal user route)
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check if admin exists (admin route)
    if (req.admin && allowedRoles.includes(req.admin.role)) {
      return next();
    }

    return res.status(403).json({
      message: "Access denied: insufficient permissions"
    });
  };
};

module.exports = roleMiddleware;