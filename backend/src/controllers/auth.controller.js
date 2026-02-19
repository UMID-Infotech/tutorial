//backend/src/controllers/auth.controller.js
import { User } from "../models/user.model.js";
import { Tenant } from "../models/tenant.model.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";

// ===============================
// TENANT REGISTRATION
// ===============================
export const register = async (req, res) => {
  try {
    const { name, email, password, tuitionName } = req.body;

    if (!name || !email || !password || !tuitionName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Step 1: Create User (without tenantId first)
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "tenant",
    });

    // Step 2: Create Tenant
    const tenant = await Tenant.create({
      name: tuitionName,
      ownerUserId: user._id,
    });

    // Step 3: Update user with tenantId
    user.tenantId = tenant._id;
    await user.save();

    // Step 4: Generate token
    const token = generateToken(user);

    return res.status(201).json({
      message: "Tenant registered successfully",
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// LOGIN (COMMON FOR ALL ROLES)
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is not yet activated!" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
