const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: "super_admin" });

    if (existingAdmin) {
      console.log("✅ Super Admin already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("super123", 10);

    // Create super admin
    const superAdmin = new Admin({
      name: "State Super Admin",
      email: "superadmin@janrakshak.in",
      password: hashedPassword,
      role: "super_admin",
      state: "Gujarat",
      city: null,
      officerName: "State Commissioner",
      officerId: "GJ-SUPER-001"
    });

    await superAdmin.save();

    console.log("🔥 Super Admin created successfully");
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
  }
};

module.exports = seedSuperAdmin;
