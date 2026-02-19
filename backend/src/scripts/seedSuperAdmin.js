//src/scripts/seedSuperAdmin.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import { User } from "../models/user.model.js";
import { hashPassword } from "../utils/hashPassword.js";

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = "superadmin@gmail.com";
    const password = "Admin@123";

    // Check if already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Superadmin already exists");
      process.exit();
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      name: "Platform Owner",
      email,
      passwordHash,
      role: "superadmin",
      tenantId: null,
    });

    console.log("✅ Superadmin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding superadmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
