const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const authorizeRoles = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload");
const { completeProfile, getUsersByCity, getAllUsers, updateProfile } = require("../controllers/userController");


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}


// Email transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, mobile, password } = req.body;

    if (!firstName || !lastName || !username || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with same email, username or mobile",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      mobile,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    let { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    usernameOrEmail = usernameOrEmail.toLowerCase();

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, username: user.username, role: user.role, profileCompleted: user.profileCompleted || false});

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
  from: `"Janrakshak Security" <${process.env.EMAIL}>`,
  to: email,
  replyTo: "no-reply@janrakshak.com",
  subject: "🔐 Reset Your Password - Janrakshak",
  html: `
  <div style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
            
            <!-- Header with Logo -->
            <tr>
              <td style="background:linear-gradient(90deg,#4f46e5,#6366f1);padding:20px;text-align:center;">
                <img src="cid:janrakshaklogo" width="120" style="margin-bottom:10px;" />
                <p style="color:#e0e7ff;margin:0;font-size:14px;">
                  Protecting Communities Digitally
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:25px;">
                <p style="font-size:15px;color:#333;">Hello,</p>
                
                <p style="font-size:14px;color:#555;">
                  We received a request to reset your password for your Janrakshak account.
                </p>

                <div style="margin:25px 0;text-align:center;">
                  <span style="display:inline-block;padding:12px 25px;
                    font-size:26px;font-weight:bold;
                    letter-spacing:6px;
                    background:#f3f4f6;
                    border-radius:8px;
                    color:#111827;">
                    ${otp}
                  </span>
                </div>

                <p style="font-size:13px;color:#444;">
                  ⏳ This OTP is valid for <strong>3 minutes</strong>.
                </p>

                <div style="margin-top:20px;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;">
                  <p style="margin:0;font-size:12px;color:#92400e;">
                    🔒 Never share your OTP with anyone.
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:15px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b7280;">
                  © ${new Date().getFullYear()} Janrakshak. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `,
  attachments: [
    {
      filename: "logo.png",
      path:path.join(__dirname, "..", "assets", "logo.png"),
      cid: "janrakshaklogo" 
    }
  ]
});

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("❌ FULL ERROR:", error);   // 👈 ADD THIS
    res.status(500).json({ message: "Server error" });
  }
});


// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= CHECK USERNAME =================
router.post("/check-username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      return res.json({ message: "Username already taken" });
    }

    res.json({ message: "Username available" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= CHECK EMAIL =================
router.post("/check-email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.json({ message: "Email already registered" });
    }

    res.json({ message: "Email available" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/complete-profile",
  authMiddleware,
  upload.single("profileImage"),
  completeProfile
);

// ================= GET USER PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= UPDATE USER PROFILE =================
router.put("/profile", authMiddleware, upload.single("profileImage"), updateProfile);

// ================= ADMIN APIS (City-Filtered) =================

// Get users by city (Sub Admin only - filters by their assigned city)
router.get(
  "/city",
  adminAuth,
  authorizeRoles("sub_admin"),
  getUsersByCity
);

// Get all users (Super Admin only)
router.get(
  "/all",
  adminAuth,
  authorizeRoles("super_admin"),
  getAllUsers
);

module.exports = router;

