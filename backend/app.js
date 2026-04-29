const express = require("express");
const http = require("http");
const { initializeSocket } = require("./config/socket");
const cors = require("cors");
const seedSuperAdmin = require("./config/seedSuperAdmin");
const mongoose = require("mongoose");

require("dotenv").config();

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const missingEnv = [];

if (!mongoUri) {
  missingEnv.push("MONGO_URI or MONGO_URL");
}

if (!process.env.JWT_SECRET) {
  missingEnv.push("JWT_SECRET");
}

if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);

app.use("/uploads", express.static("uploads"));

const crimeRoutes = require("./routes/crimeRoutes");
app.use("/api/crime", crimeRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const subAdminRoutes = require("./routes/subAdminRoutes");

app.use("/api/subadmins", subAdminRoutes);

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(async () => {
    console.log("MongoDB connection successful");

    // Call Super Admin Seeder
    await seedSuperAdmin();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
.catch(err => { 
  console.error("MongoDB connection failed:", err); 
  process.exit(1); 
});



// Routes
// app.get("/", (req, res) => res.send("Root is Working"));
app.get("/", (req, res) => {
  res.status(200).send("Backend is LIVE 🚀");
});


// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io and attach to app
const io = initializeSocket(server);
app.set("io", io);

// Server
// server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
const PORT = process.env.PORT || 8080;
