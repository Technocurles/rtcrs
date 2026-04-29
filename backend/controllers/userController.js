const User = require("../models/User");

// ======================
// ADMIN APIs (City-Filtered)
// ======================

// Get users by city (Sub Admin only - filters by their assigned city)
exports.getUsersByCity = async (req, res) => {
  try {
    const adminCity = req.admin.city; // From JWT token
    
    if (!adminCity) {
      return res.status(400).json({
        message: "Admin city not found. Sub-admins must be assigned to a city.",
      });
    }

    // Use case-insensitive regex for city matching
    const query = { 
      "address.city": { $regex: new RegExp(`^${adminCity}$`, 'i') }
    };

    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      city: adminCity,
      users,
    });
  } catch (error) {
    console.error("Get Users By City Error:", error);
    res.status(500).json({
      message: "Error fetching users",
    });
  }
};

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = {};
    if (city) {
      query["address.city"] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      message: "Error fetching users",
    });
  }
};

// ======================
// CITIZEN APIs
// ======================

exports.completeProfile = async (req, res) => {
  try {
    const user = req.user;   // ✅ no need to find again

    user.gender = req.body.gender;
    user.dateOfBirth = req.body.dateOfBirth;

    user.address = {
      houseNo: req.body.houseNo,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
    };

    if (req.file) {
      user.profileImage = req.file.filename;
    }

    user.profileCompleted = true;

    await user.save();

    res.json({ message: "Profile completed", user });

  } catch (error) {
    console.error(error);   // 👈 add this for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// UPDATE PROFILE
// ======================
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;

    // Update basic fields if provided
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.mobile) user.mobile = req.body.mobile;
    if (req.body.gender) user.gender = req.body.gender;
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;

    // Update address if provided
    if (req.body.address) {
      if (req.body.address.houseNo !== undefined) user.address.houseNo = req.body.address.houseNo;
      if (req.body.address.street !== undefined) user.address.street = req.body.address.street;
      if (req.body.address.city !== undefined) user.address.city = req.body.address.city;
      if (req.body.address.state !== undefined) user.address.state = req.body.address.state;
      if (req.body.address.pincode !== undefined) user.address.pincode = req.body.address.pincode;
    }

    // Update profile image if uploaded
    if (req.file) {
      user.profileImage = req.file.path || req.file.filename;
    }

    await user.save();

    res.json({ message: "Profile updated successfully", user });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
