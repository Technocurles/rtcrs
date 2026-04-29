const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    // ===== BASIC REGISTRATION DETAILS =====
    firstName: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-z]{2,30}$/, "First name must contain only letters (2-30 characters)"]
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-z]{2,30}$/, "Last name must contain only letters (2-30 characters)"]
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 4,
        maxlength: 20,
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore"]
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },

    mobile: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"]
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    role: {
        type: String,
        enum: ["citizen", "admin", "police"],
        default: "citizen"
    },

    // ===== PROFILE COMPLETION DETAILS =====
    profileImage: {
        type: String,
        default: ""
    },

    profileCompleted: {
        type: Boolean,
        default: false
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },

    dateOfBirth: {
        type: Date
    },

    address: {
        houseNo: {
            type: String,
            trim: true
        },
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true,
            match: [/^[A-Za-z\s]{2,50}$/, "City must contain only letters"]
        },
        state: {
            type: String,
            trim: true,
            match: [/^[A-Za-z\s]{2,50}$/, "State must contain only letters"]
        },
        pincode: {
            type: String,
            match: [/^\d{6}$/, "Pincode must be 6 digits"]
        }
    },

    // ===== ACCOUNT CONTROL =====
    isVerified: {
        type: Boolean,
        default: false
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    // ===== OTP SYSTEM =====
    otp: {
        type: String,
        match: [/^\d{4,6}$/, "OTP must be 4 to 6 digits"]
    },

    otpExpiry: Date

}, { timestamps: true });


// ===== VIRTUAL FULL NAME =====
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});


module.exports = mongoose.model("User", userSchema);


