const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["super_admin", "sub_admin"],
      required: true
    },

    state: {
      type: String,
      default: "Gujarat"  // since state-based system
    },

    city: {
      type: String,
      default: null  // only required for sub_admin
    },

    isActive: {
      type: Boolean,
      default: true
    },

    officerName: {
      type: String,
      default: null
    },

    officerId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },

    isFirstLogin: {
      type: Boolean,
      default: true
    },

    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
