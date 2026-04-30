const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { initializeSocket } = require("./config/socket");
const seedSuperAdmin = require("./config/seedSuperAdmin");

// ---------------- APP INIT ----------------
const app = express();

// ---------------- TRUST PROXY (IMPORTANT FOR RAILWAY) ----------------
app.set("trust proxy", 1);

// ---------------- MIDDLEWARE ----------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------- HEALTH CHECK (RAILWAY TEST) ----------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "RTCRS Backend is LIVE 🚀",
    time: new Date().toISOString()
  });
});

// ---------------- ROUTES ----------------
const userRoutes = require("./routes/userRoutes");
const crimeRoutes = require("./routes/crimeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subAdminRoutes = require("./routes/subAdminRoutes");

app.use("/api", userRoutes);
app.use("/api/crime", crimeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subadmins", subAdminRoutes);

app.use("/uploads", express.static("uploads"));

// ---------------- ENV ----------------
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

// ---------------- HARD CHECKS ----------------
if (!mongoUri) {
  console.error("❌ MongoDB URI missing");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

// ---------------- SERVER ----------------
const server = http.createServer(app);

// ---------------- SOCKET ----------------
let io;
try {
  io = initializeSocket(server);
  app.set("io", io);
  console.log("✅ Socket initialized");
} catch (err) {
  console.error("⚠️ Socket init failed:", err.message);
}

// ---------------- START FUNCTION ----------------
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected");

    await seedSuperAdmin();
    console.log("✅ Super admin seeded");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();