const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { initializeSocket } = require("./config/socket");
const seedSuperAdmin = require("./config/seedSuperAdmin");

// ---------------- APP INIT ----------------
const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ---------------- HEALTH CHECK ROUTE ----------------
app.get("/", (req, res) => {
  res.status(200).send("Backend is LIVE 🚀");
});

// ---------------- ENV VALIDATION ----------------
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const PORT = process.env.PORT;

if (!mongoUri) {
  console.error("Missing MONGO_URI or MONGO_URL");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET");
  process.exit(1);
}

if (!PORT) {
  console.error("Missing PORT (Railway should provide this)");
  process.exit(1);
}

// ---------------- CREATE SERVER ----------------
const server = http.createServer(app);

// ---------------- SOCKET INIT ----------------
const io = initializeSocket(server);
app.set("io", io);

// ---------------- START SERVER AFTER DB ----------------
mongoose.connect(mongoUri)
  .then(async () => {
    console.log("MongoDB connection successful");

    await seedSuperAdmin();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });