const SOSAlert = require("../models/SOSAlert");
const Admin = require("../models/Admin");
const { getIO } = require("../config/socket");
const { getCityFromCoordinates } = require("../utils/cityBoundaries");

// Helper function to normalize city name for consistent room matching
// Uses Title Case: "surat" -> "Surat", "AHMEDABAD" -> "Ahmedabad"
const normalizeCity = (cityName) => {
  if (!cityName) return null;
  // Convert to lowercase first, then capitalize first letter of each word
  return cityName.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

// ======================
// PUBLIC/CITIZEN APIs
// ======================

// Create SOS Alert (can be called by logged in users or anonymously)
exports.createSOSAlert = async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      phoneNumber, 
      latitude, 
      longitude, 
      city: clientCity, 
      area, 
      address 
    } = req.body;

    // Validate required fields - latitude and longitude are required
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Determine city from coordinates (location-based routing)
    let determinedCity = clientCity; // Use client-provided city as fallback
    let cityFromCoords = false;
    
    // Try to determine city from coordinates
    if (latitude && longitude) {
      const cityFromCoordsResult = getCityFromCoordinates(latitude, longitude);
      if (cityFromCoordsResult) {
        determinedCity = cityFromCoordsResult;
        cityFromCoords = true;

      } else if (!clientCity) {
        // No city from coordinates and no client city provided
        return res.status(400).json({
          success: false,
          message: "Unable to determine city from coordinates. Please provide city parameter.",
        });
      }
    }

    // Find the sub-admin responsible for this city
    let subAdmin = null;
    const normalizedCity = normalizeCity(determinedCity);
    
    try {
      subAdmin = await Admin.findOne({
        role: "sub_admin",
        city: { $regex: new RegExp(`^${normalizedCity}$`, 'i') },
        isActive: true
      });
      
      if (subAdmin) {

      } else {

      }
    } catch (dbError) {
      // Continue without sub-admin - super admin will still receive the alert
    }

    // Create the SOS alert
    const sosAlert = new SOSAlert({
      alertType: "SOS",
      priority: "critical",
      status: "active",
      userId: userId || null,
      name: name || "Unknown",
      phoneNumber: phoneNumber || "",
      latitude,
      longitude,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      city: determinedCity,
      area: area || "",
      address: address || "",
      timestamp: new Date(),
      // New fields for location-based routing
      assignedTo: subAdmin ? subAdmin._id : null,
      cityFromCoordinates: cityFromCoords,
    });

    await sosAlert.save();

    // Prepare alert data for emission
    const alertData = {
      _id: sosAlert._id,
      alertType: sosAlert.alertType,
      priority: sosAlert.priority,
      name: sosAlert.name,
      phoneNumber: sosAlert.phoneNumber,
      city: sosAlert.city,
      area: sosAlert.area,
      latitude: sosAlert.latitude,
      longitude: sosAlert.longitude,
      timestamp: sosAlert.timestamp,
    };

    // Emit real-time notification to admins
    const io = getIO();
    if (io) {
      // 1. Always notify super admin (all SOS alerts)
      io.to("super_admin").emit("newSOSAlert", {
        message: "New SOS Alert received!",
        alert: alertData,
      });


      // 2. Send ONLY to the specific sub-admin responsible for this city
      // This ensures ONLY the assigned sub-admin receives the alert via their unique room
      // IMPORTANT: Do NOT emit to city_${city} room - that would broadcast to ALL sub-admins in that city
      if (subAdmin) {
        io.to(`subadmin_${subAdmin._id}`).emit("newSOSAlert", {
          message: `New SOS Alert in your jurisdiction (${determinedCity})!`,
          alert: alertData,
          assignedTo: {
            adminId: subAdmin._id,
            adminName: subAdmin.name,
            city: subAdmin.city
          }
        });

      }

      // NOTE: City room emission removed for strict SOS routing
      // Each sub-admin only receives alerts via their unique subadmin_${id} room
    }

    res.status(201).json({
      success: true,
      message: "SOS Alert sent successfully. Authorities have been notified.",
      alert: sosAlert,
      routing: {
        city: determinedCity,
        subAdminFound: !!subAdmin,
        subAdminName: subAdmin ? subAdmin.name : null,
        subAdminId: subAdmin ? subAdmin._id : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ======================
// ADMIN APIs
// ======================

// Get all SOS alerts (Super Admin)
exports.getAllSOSAlerts = async (req, res) => {
  try {
    const { status, city } = req.query;

    let query = {};
    if (status) query.status = status;
    if (city) query.city = { $regex: new RegExp(`^${city}$`, 'i') };

    const alerts = await SOSAlert.find(query)
      .populate("userId", "firstName lastName email mobile")
      .populate("acknowledgedBy", "name officerName")
      .populate("assignedTo", "name officerName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get SOS alerts by city (Sub Admin)
exports.getSOSAlertsByCity = async (req, res) => {
  try {
    const adminCity = req.admin.city;
    const { status } = req.query;

    let query = { city: { $regex: new RegExp(`^${adminCity}$`, 'i') } };
    if (status) query.status = status;

    const alerts = await SOSAlert.find(query)
      .populate("userId", "firstName lastName email mobile")
      .populate("acknowledgedBy", "name officerName")
      .populate("assignedTo", "name officerName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get single SOS alert by ID
exports.getSOSAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await SOSAlert.findById(id)
      .populate("userId", "firstName lastName email mobile city")
      .populate("acknowledgedBy", "name officerName");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "SOS Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Update SOS alert status
exports.updateSOSAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, officerResponse, dispatchedTeam } = req.body;

    const alert = await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "SOS Alert not found",
      });
    }

    // SECURITY: Verify city ownership for sub-admins
    // Only allow sub-admin to handle SOS alerts that belong to their assigned city
    if (req.admin.role === "sub_admin") {
      const adminCity = normalizeCity(req.admin.city);
      const alertCity = normalizeCity(alert.city);
      
      if (adminCity !== alertCity) {
        console.log(`[SECURITY] Sub-admin ${req.admin.id} (${adminCity}) attempted to handle SOS ${id} from ${alertCity}`);
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only handle SOS alerts from your assigned city.",
          details: {
            yourCity: adminCity,
            sosCity: alertCity
          }
        });
      }
    }

    // Store previous status for response time calculation
    const previousStatus = alert.status;

    // Update status
    if (status) {
      alert.status = status;
      
      if (status === "acknowledged") {
        alert.acknowledgedBy = req.admin.id;
        alert.acknowledgedAt = new Date();
      } else if (status === "responding") {
        // Team is responding
        if (officerResponse) {
          alert.officerResponse = officerResponse;
        }
      } else if (status === "team_dispatched") {
        // Team has been dispatched
        if (officerResponse) {
          alert.officerResponse = officerResponse;
        }
        if (dispatchedTeam) {
          alert.dispatchedTeam = dispatchedTeam;
        }
      } else if (status === "resolved") {
        alert.resolvedAt = new Date();
        // Calculate response time in minutes
        if (alert.acknowledgedAt) {
          alert.responseTime = Math.round((new Date() - alert.acknowledgedAt) / 60000);
        }
        if (resolutionNotes) {
          alert.resolutionNotes = resolutionNotes;
        }
      } else if (status === "false_alert") {
        // Mark as false alert
        alert.resolvedAt = new Date();
        if (resolutionNotes) {
          alert.resolutionNotes = resolutionNotes;
        }
      }
    }

    await alert.save();

    // Emit real-time update to citizens if needed
    const io = getIO();
    if (io && alert.userId) {
      io.to(`user_${alert.userId}`).emit("sosStatusUpdate", {
        message: `Your SOS alert status has been updated to: ${status}`,
        alertId: alert._id,
        status: status,
      });
    }

    res.status(200).json({
      success: true,
      message: "SOS Alert updated successfully",
      alert,
    });
  } catch (error) {
    console.error("Update SOS Alert Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating SOS alert",
    });
  }
};

// Get SOS alert statistics
exports.getSOSStats = async (req, res) => {
  try {
    const adminCity = req.admin?.city;
    
    let query = {};
    
    // If sub-admin, only get alerts for their city
    if (adminCity) {
      query.city = { $regex: new RegExp(`^${adminCity}$`, 'i') };
    }

    const stats = await SOSAlert.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAlerts = await SOSAlert.countDocuments(query);
    const activeAlerts = await SOSAlert.countDocuments({ ...query, status: "active" });

    res.status(200).json({
      success: true,
      stats: {
        total: totalAlerts,
        active: activeAlerts,
        byStatus: stats,
      },
    });
  } catch (error) {
    console.error("Get SOS Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching SOS statistics",
    });
  }
};

// ======================
// CITIZEN APIs
// ======================

// Get citizen's own SOS alerts
exports.getMySOSAlerts = async (req, res) => {
  try {
    // Get user ID from the authenticated request (set by the protect middleware)
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view your SOS alerts",
      });
    }

    const alerts = await SOSAlert.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get My SOS Alerts Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your SOS alerts",
    });
  }
};

