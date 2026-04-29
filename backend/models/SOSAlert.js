const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema({
  // Alert Type
  alertType: {
    type: String,
    default: "SOS",
    enum: ["SOS"],
  },

  // Priority - Critical for SOS
  priority: {
    type: String,
    default: "critical",
    enum: ["critical"],
  },

  // Status
  status: {
    type: String,
    default: "active",
    enum: ["active", "acknowledged", "responding", "team_dispatched", "resolved", "false_alert"],
  },

  // Officer Response
  officerResponse: {
    type: String,
    enum: ["dispatch_team", "patrol_vehicle", "ambulance", "fire_brigade", "other", null],
    default: null,
  },

  // Dispatched Team Info
  dispatchedTeam: {
    type: String,
    default: "",
  },

  // Response Time (in minutes)
  responseTime: {
    type: Number,
    default: null,
  },

  // User Information (if logged in)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // User Name
  name: {
    type: String,
    default: "Unknown",
  },

  // Phone Number
  phoneNumber: {
    type: String,
    default: "",
  },

  // Location (GeoJSON format)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
    },
  },

  // Latitude and Longitude (for easier access)
  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },

  // City
  city: {
    type: String,
    required: true,
  },

  // Area (optional)
  area: {
    type: String,
    default: "",
  },

  // Address (optional)
  address: {
    type: String,
    default: "",
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
  },

  // Acknowledged by (admin who acknowledged)
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },

  // Acknowledged at
  acknowledgedAt: {
    type: Date,
    default: null,
  },

  // Resolution notes
  resolutionNotes: {
    type: String,
    default: "",
  },

  // Resolved at
  resolvedAt: {
    type: Date,
    default: null,
  },

  // Assigned sub-admin (who should handle this alert)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },

  // City was determined from coordinates (vs provided by client)
  cityFromCoordinates: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for geospatial queries
sosAlertSchema.index({ location: "2dsphere" });

// Index for city-based queries
sosAlertSchema.index({ city: 1, status: 1, createdAt: -1 });

// Index for sorting by timestamp (most recent first)
sosAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SOSAlert", sosAlertSchema);

