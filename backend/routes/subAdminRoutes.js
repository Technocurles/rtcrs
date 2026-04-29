const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");


// ======================
// GET ALL SUB ADMINS
// ======================
router.get("/", async (req, res) => {
  try {
    const subAdmins = await Admin.find({ role: "sub_admin" })
      .select("-password -otp -otpExpiry");

    res.json(subAdmins);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ======================
// DELETE SUB ADMIN
// ======================
router.delete("/:id", async (req, res) => {
  try {

    const subAdmin = await Admin.findOneAndDelete({
      _id: req.params.id,
      role: "sub_admin"
    });

    if (!subAdmin) {
      return res.status(404).json({
        message: "Sub Admin not found"
      });
    }

    res.json({
      message: "Sub Admin deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ======================
// TOGGLE ACTIVE STATUS
// ======================
router.patch("/:id/status", async (req, res) => {
  try {

    const subAdmin = await Admin.findOne({
      _id: req.params.id,
      role: "sub_admin"
    });

    if (!subAdmin) {
      return res.status(404).json({
        message: "Sub Admin not found"
      });
    }

    // Ensure only one active sub_admin per city
    if (!subAdmin.isActive) {
      const existingActive = await Admin.findOne({
        role: "sub_admin",
        city: subAdmin.city,
        state: subAdmin.state,
        isActive: true
      });

      if (existingActive) {
        return res.status(400).json({
          message: "Another active sub-admin exists for this city"
        });
      }
    }

    subAdmin.isActive = !subAdmin.isActive;
    await subAdmin.save();

    res.json({
      message: `Sub Admin ${subAdmin.isActive ? "activated" : "deactivated"} successfully`,
      isActive: subAdmin.isActive
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ======================
// SUB ADMIN ACTIVATION (FIRST LOGIN PASSWORD SET)
// ======================
router.post("/activate", async (req, res) => {
  try {

    const { email, newPassword } = req.body;

    const subAdmin = await Admin.findOne({
      email,
      role: "sub_admin"
    });

    if (!subAdmin) {
      return res.status(404).json({
        message: "Sub Admin not found"
      });
    }

    if (!subAdmin.isFirstLogin) {
      return res.status(400).json({
        message: "Account already activated"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    subAdmin.password = hashedPassword;
    subAdmin.isFirstLogin = false;

    await subAdmin.save();

    res.json({
      message: "Account activated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;