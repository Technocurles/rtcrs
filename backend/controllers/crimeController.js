// controllers/crimeController.js
const CrimeReport = require("../models/CrimeReport");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { getIO } = require("../config/socket");

// ======================
// CITIZEN APIs
// ======================

// Get citizen's own reports
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    let query = { reportedBy: userId };
    if (status) query.status = status;

    const reports = await CrimeReport.find(query)
      .populate("assignedTo", "name officerName")
      .populate("reviewedBy", "name officerName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching your reports",
    });
  }
};

// Get citizen's single report by ID
exports.getMyReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await CrimeReport.findOne({
      _id: id,
      reportedBy: userId,
    })
      .populate("assignedTo", "name officerName")
      .populate("reviewedBy", "name officerName");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching report",
    });
  }
};

// ======================
// ADMIN APIs
// ======================

// Get all crime reports (Super Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const { status, crimeType, priority, city } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType;
    if (priority) query.priority = priority;
    // Filter by city if provided (for super admin to view specific city)
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const reports = await CrimeReport.find(query)
      .populate("reportedBy", "firstName lastName email mobile city")
      .populate("assignedTo", "name officerName")
      .populate("reviewedBy", "name officerName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching reports",
    });
  }
};

// Get all unique cities (Super Admin only)
exports.getAllCities = async (req, res) => {
  try {
    // Predefined list of all Gujarat cities
    const gujaratCities = [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Anand",
      "Kheda",
      "Chhota Udaipur",
      "Dahod",
      "Mahisagar",
      "Bharuch",
      "Narmada",
      "Navsari",
      "Valsad",
      "Dang",
      "Tapi",
      "Rajkot",
      "Jamnagar",
      "Junagadh",
      "Porbandar",
      "Bhavnagar",
      "Amreli",
      "Surendranagar",
      "Morbi",
      "Botad",
      "Devbhumi Dwarka",
      "Gir Somnath",
      "Kutch",
      "Banaskantha",
      "Patan",
      "Mehsana",
      "Sabarkantha",
      "Aravalli",
      "Gandhinagar"
    ];
    
    res.status(200).json({
      success: true,
      count: gujaratCities.length,
      cities: gujaratCities,
    });
  } catch (error) {
    console.error("Get All Cities Error:", error);
    res.status(500).json({
      message: "Error fetching cities",
    });
  }
};

// Get reports by city (Sub Admin)
exports.getReportsByCity = async (req, res) => {
  try {
    const { status, crimeType, priority } = req.query;
    const adminCity = req.admin.city; // From JWT token
    
    // Use case-insensitive regex for city matching
    let query = { city: { $regex: new RegExp(`^${adminCity}$`, 'i') } };
    
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType;
    if (priority) query.priority = priority;

    const reports = await CrimeReport.find(query)
      .populate("reportedBy", "firstName lastName email mobile city")
      .populate("assignedTo", "name officerName")
      .populate("reviewedBy", "name officerName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Reports By City Error:", error);
    res.status(500).json({
      message: "Error fetching reports",
    });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await CrimeReport.findById(id)
      .populate("reportedBy", "firstName lastName email mobile city")
      .populate("assignedTo", "name officerName")
      .populate("reviewedBy", "name officerName");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // For sub-admins, verify they can only view their city's reports (case-insensitive)
    if (req.admin.role === "sub_admin" && 
        report.city.toLowerCase() !== req.admin.city.toLowerCase()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    res.status(500).json({
      message: "Error fetching report",
    });
  }
};

// Update crime report status
exports.updateCrimeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, notes } = req.body;

    const report = await CrimeReport.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // For sub-admins, verify they can only update their city's reports (case-insensitive)
    if (req.admin.role === "sub_admin" && 
        report.city.toLowerCase() !== req.admin.city.toLowerCase()) {
      return res.status(403).json({
        message: "Access denied - can only update reports from your city",
      });
    }

    // Update fields
    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedTo) report.assignedTo = assignedTo;
    if (notes) {
      report.notes = report.notes || [];
      report.notes.push({
        content: notes,
        addedBy: req.admin.id,
        addedAt: new Date(),
      });
    }

    report.reviewedBy = req.admin.id;

    await report.save();

    // Emit real-time notification to the citizen
    const io = getIO();
    if (io) {
      // Notify the specific user
      io.to(`user_${report.reportedBy}`).emit("crimeStatusUpdate", {
        message: `Your crime report status has been updated to: ${status}`,
        reportId: report._id,
        status: status,
      });
    }

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update Crime Status Error:", error);
    res.status(500).json({
      message: "Error updating report",
    });
  }
};

// ======================
// LEGACY FUNCTIONS (for backward compatibility)
// ======================

// Citizen creates a report (legacy - actual implementation in createCrimeReport.js)
exports.createReport = async (req, res) => {
  try {
    res.status(201).json({
      message: "Crime report created successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating report",
    });
  }
};

// Police updates case (legacy)
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      message: `Case ${id} updated successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating case",
    });
  }
};

// Admin blocks user
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      message: `User ${id} blocked successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error blocking user",
    });
  }
};
