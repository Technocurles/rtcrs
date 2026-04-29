const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    fileSize: {
      type: Number, // stored in bytes
      required: true,
    },
  },
  { _id: false }
);

const crimeReportSchema = new mongoose.Schema(
  {
    // 🔹 Unique Report ID for tracking
    reportId: {
      type: String,
      unique: true,
    },

    // 🔹 Reporter - Reference to User (for future updates if needed)
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Reporter Info Snapshot - Captured at time of reporting (won't change if user edits profile)
    // Note: reporterInfo is optional to allow anonymous reports
    reporterInfo: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      city: {
        type: String,
      },
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // 🔹 Crime Details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    crimeType: {
      type: String,
      required: true,
    },

    // 🔹 Date of Crime (when the crime occurred)
    dateOfCrime: {
      type: Date,
      required: true,
    },

    // 🔹 Approximate Time of Crime
    approxTimeOfCrime: {
      type: String,
      required: true,
    },

    // 🔹 Incident Date (legacy field - keeping for compatibility)
    date: {
      type: Date,
    },

    // 🔹 Location (Administrative)
    division: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      index: true, // for sub-admin filtering
    },

    area: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    // 🔹 Live Location (GeoJSON format) - Now Optional
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

    // 🔹 Evidence Files (max 5 files controlled in controller)
    evidence: {
      type: [evidenceSchema],
      validate: [arrayLimit, "Maximum 5 files allowed"],
      default: [],
    },

    // 🔹 Status Workflow
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "closed",
      ],
      default: "pending",
      index: true,
    },

    // 🔹 Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // 🔹 Optional Metadata
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique reportId before saving
// Note: In Mongoose 5+, async middleware doesn't need to call next() explicitly
crimeReportSchema.pre('save', async function() {
  if (!this.reportId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.reportId = `CR${year}${month}${random}`;
  }
});

// 🔥 Geo index for map & radius queries
crimeReportSchema.index({ location: "2dsphere" });

// 🔥 Compound index for dashboard filtering
crimeReportSchema.index({ city: 1, status: 1, createdAt: -1 });

// 🔹 Evidence file limit validator
function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("CrimeReport", crimeReportSchema);
