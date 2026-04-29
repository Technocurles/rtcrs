const express = require("express");
const router = express.Router();
const CrimeReport = require("../models/CrimeReport");

const protect = require("../middlewares/authMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { uploadEvidence, handleMulterError } = require("../middlewares/uploadEvidence");

const {
  updateCrimeStatus,
  blockUser,
  getAllReports,
  getReportsByCity,
  getReportById,
  getMyReports,
  getMyReportById,
  getAllCities,
} = require("../controllers/crimeController");

// Import SOS controller
const {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertsByCity,
  getSOSAlertById,
  updateSOSAlertStatus,
  getSOSStats,
  getMySOSAlerts,
} = require("../controllers/sosController");

// Import the actual createCrimeReport from createCrimeReport.js
const { createCrimeReport: createReport } = require("../controllers/createCrimeReport");

// Debug middleware to log incoming request
const debugRequest = (req, res, next) => {
  console.log("=== CRIME ROUTE DEBUG ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("============================");
  next();
};

// 🔹 1️⃣ Citizen → Create Crime Report (with media upload)
router.post(
  "/report",
  debugRequest,
  protect,
  authorizeRoles("citizen"),
  uploadEvidence.array("evidence", 5),
  handleMulterError,
  createReport
);


// 🔹 2️⃣ Citizen → Get My Reports
router.get(
  "/my-reports",
  protect,  
  authorizeRoles("citizen"),
  getMyReports
);


// 🔹 3️⃣ Citizen → Get My Report By ID
router.get(
  "/my-report/:id",
  protect,
  authorizeRoles("citizen"),
  getMyReportById
);


// 🔹 4️⃣ Super Admin → Get All Crime Reports
router.get(
  "/all",
  adminAuth,
  authorizeRoles("super_admin"),
  getAllReports
);

// 🔹 4b️⃣ Super Admin → Get All Cities
router.get(
  "/cities",
  adminAuth,
  authorizeRoles("super_admin"),
  getAllCities
);


// 🔹 5️⃣ Sub Admin → Get Reports By City
router.get(
  "/city",
  adminAuth,
  authorizeRoles("sub_admin"),
  getReportsByCity
);


// 🔹 6️⃣ Public API → Get Public Crime Reports (for Home page map)
// Returns only approved/closed reports with limited fields (no personal info)
// IMPORTANT: This must be before /:id route to avoid conflicts
router.get("/public", async (req, res) => {
  try {
    const { city } = req.query;
    
    // Only get approved or closed reports for public display
    let query = { status: { $in: ["approved", "closed"] } };
    
    // Filter by city if provided
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const reports = await CrimeReport.find(query)
      .select("crimeType city area priority status createdAt location")
      .sort({ createdAt: -1 })
      .limit(500); // Limit for performance

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Public Reports Error:", error);
    res.status(500).json({
      message: "Error fetching reports",
    });
  }
});


// 🔹 7️⃣ Get Single Report (Both Admins)
router.get(
  "/:id",
  adminAuth,
  authorizeRoles("super_admin", "sub_admin"),
  getReportById
);


// 🔹 8️⃣ SubAdmin/SuperAdmin → Update case status
router.put(
  "/:id/status",
  adminAuth,
  authorizeRoles("sub_admin", "super_admin"),
  updateCrimeStatus
);


// 🔹 9️⃣ SuperAdmin → Block User
router.put(
  "/block/:id",
  adminAuth,
  authorizeRoles("super_admin"),
  blockUser
);

// ======================
// SOS Alert Routes
// ======================

// 🔹 1️⃣ Public → Create SOS Alert (can be called by anyone)
router.post(
  "/sos",
  createSOSAlert
);

// 🔹 2️⃣ Super Admin → Get All SOS Alerts
router.get(
  "/sos/all",
  adminAuth,
  authorizeRoles("super_admin"),
  getAllSOSAlerts
);

// 🔹 3️⃣ Sub Admin → Get SOS Alerts by City
router.get(
  "/sos/city",
  adminAuth,
  authorizeRoles("sub_admin"),
  getSOSAlertsByCity
);

// 🔹 4️⃣ Admin → Get Single SOS Alert
router.get(
  "/sos/:id",
  adminAuth,
  authorizeRoles("super_admin", "sub_admin"),
  getSOSAlertById
);

// 🔹 5️⃣ Admin → Update SOS Alert Status
router.put(
  "/sos/:id/status",
  adminAuth,
  authorizeRoles("super_admin", "sub_admin"),
  updateSOSAlertStatus
);

// 🔹 6️⃣ Admin → Get SOS Statistics
router.get(
  "/sos/stats",
  adminAuth,
  authorizeRoles("super_admin", "sub_admin"),
  getSOSStats
);

// 🔹 7️⃣ Citizen → Get My SOS Alerts
router.get(
  "/sos/my-alerts",
  protect,
  authorizeRoles("citizen"),
  getMySOSAlerts
);

module.exports = router;
