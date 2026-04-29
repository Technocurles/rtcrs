const cityAccess = (req, res, next) => {
  try {
    const requestedCity = req.params.city; // from URL

    // If super admin → allow
    if (req.admin.role === "super_admin") {
      return next();
    }

    // If city admin → allow only their city
    if (req.admin.role === "sub_admin") {
      if (req.admin.city === requestedCity) {
        return next();
      } else {
        return res.status(403).json({ message: "Access denied for this city" });
      }
    }

    res.status(403).json({ message: "Unauthorized role" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = cityAccess;
