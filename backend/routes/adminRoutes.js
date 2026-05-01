const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const adminAuth = require("../middlewares/adminAuth");
const authorizeRoles = require("../middlewares/roleMiddleware");


// ======================
// GET CURRENT ADMIN INFO (From JWT Token)
// ======================
router.get("/me", adminAuth, async (req, res) => {
  try {
    // req.admin is set by the adminAuth middleware from JWT token
    const adminId = req.admin.id;
    
    const admin = await Admin.findById(adminId).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json({
      _id: admin._id,
      name: admin.name,
      officerName: admin.officerName,
      email: admin.email,
      role: admin.role,
      city: admin.city,
      state: admin.state,
      officerId: admin.officerId,
      isActive: admin.isActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});


// ======================
// CREATE SUB ADMIN (Only Super Admin Should Use This Route)
// ======================
router.post("/create", adminAuth, authorizeRoles("super_admin"), async (req, res) => {
  try {
    const {
      name,
      officerName,
      email,
      password,
      role,
      state,
      city,
      officerId,
      isActive
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    if (!["super_admin", "sub_admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    if (role === "sub_admin" && !city) {
      return res.status(400).json({
        message: "City is required for sub admin"
      });
    }

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    if (officerId) {
      const existingOfficer = await Admin.findOne({ officerId });
      if (existingOfficer) {
        return res.status(400).json({
          message: "Officer ID already exists"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      officerName,
      email,
      password: hashedPassword,
      role,
      state,
      city: role === "sub_admin" ? city : null,
      officerId,
      isFirstLogin: role === "sub_admin" ? true : false, // 🔥 Super admin skips activation
      isActive: typeof isActive === "boolean" ? isActive : true
    });

    await newAdmin.save();

    res.status(201).json({
      message: `${role} created successfully`,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        city: newAdmin.city
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});


// ======================
// ADMIN LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found"
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: "Admin account is deactivated"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // // 🔥 ONLY sub_admin requires activation
    // if (admin.role === "sub_admin" && admin.isFirstLogin) {
    //   return res.status(403).json({
    //     message: "Account not activated. Please activate first."
    //   });
    // }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        city: admin.city,
        officerName: admin.officerName
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: admin.role,
      city: admin.city,
      _id: admin._id  // Return admin ID for unique socket connection
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/stats", adminAuth, async (req, res) => {
  try {
    const AdminModel = require("../models/Admin");
    const UserModel = require("../models/User");
    const CrimeReportModel = require("../models/CrimeReport");

    const activeAdminsCount = await AdminModel.countDocuments({role: "sub_admin", isActive: true});
    const usersCount = await UserModel.countDocuments({});
    const casesCount = await CrimeReportModel.countDocuments({});
    const casesByCity = await CrimeReportModel.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      activeAdminsCount,
      usersCount,
      casesCount,
      casesByCity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

module.exports = router;

