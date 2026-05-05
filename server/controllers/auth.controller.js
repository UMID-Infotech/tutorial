// server/controllers/auth.controller.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { Tenant } from "../models/tenant.model.js";
import { User } from "../models/user.model.js";
import { sendTenantMail } from "../services/mail/mail.service.js";
import { MAIL_TYPES } from "../services/mail/mail.constant.js";
import { isIndianMobileNumber } from "../utils/phone.js";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const MAX_FORGOT_PASSWORD_ATTEMPTS = 5;
const FORGOT_PASSWORD_LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Helper: format remaining lock time for human-readable message ────────────
function formatLockRemaining(lockedUntilDate) {
  const remaining = lockedUntilDate - Date.now();
  if (remaining <= 0) return "0 minutes";
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.ceil((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

// ── Register tenant ──────────────────────────────────────────────────────────
export const registerTenant = async (req, res) => {
  try {
    const { tenantName, name, email, password, phone, address } = req.body;

    if (!tenantName || !name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isIndianMobileNumber(phone)) {
      return res.status(400).json({
        message: "Phone must be a valid 10-digit Indian mobile number",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "tenant",
      tenantId: null,
      status: "inactive",
      onlineStatus: false,
    });

    const tenant = await Tenant.create({
      name: tenantName,
      ownerUserId: user._id,
      status: "inactive",
      plan: "free",
      ...(address?.trim() ? { address: address.trim() } : {}),
    });

    user.tenantId = tenant._id;
    await user.save();

    // Mail to admin
    sendTenantMail(MAIL_TYPES.TENANT_REGISTER_ADMIN, user).catch((err) =>
      console.error("Admin Mail Error:", err)
    );

    // Mail to tenant
    sendTenantMail(MAIL_TYPES.TENANT_WELCOME, user);

    return res.status(201).json({
      message: "Registration submitted. Wait for admin approval.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // No user found – return generic invalid credentials (no attempt tracking for unknown emails)
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Rate-limiting only applies to non-superadmin roles
    const isRateLimited = user.role !== "superadmin";

    if (isRateLimited) {
      // Check if currently locked
      if (user.loginLockedUntil && user.loginLockedUntil > Date.now()) {
        const remaining = formatLockRemaining(user.loginLockedUntil);
        return res.status(429).json({
          message: `Account temporarily locked due to too many failed attempts. Try again in ${remaining}.`,
          locked: true,
          lockedUntil: user.loginLockedUntil,
        });
      }

      // If a previous lock has expired, reset counters
      if (user.loginLockedUntil && user.loginLockedUntil <= Date.now()) {
        user.loginAttempts = 0;
        user.loginLockedUntil = null;
      }
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      if (isRateLimited) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          // Lock the account for 24 hours
          user.loginLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
          await user.save();

          return res.status(429).json({
            message:
              "Too many failed login attempts. Your account is locked for 24 hours.",
            locked: true,
            lockedUntil: user.loginLockedUntil,
          });
        }

        await user.save();

        const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.loginAttempts;

        return res.status(400).json({
          message: "Invalid credentials",
          attemptsLeft,
          // Signal the frontend to show the "last attempt" warning toast
          lastAttemptWarning: attemptsLeft === 1,
        });
      }

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ── Password matched ─────────────────────────────────────────────────────

    // Reset login attempt counters on successful login
    if (isRateLimited && user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.loginLockedUntil = null;
    }

    // Tenant validation
    if (user.role !== "superadmin") {
      const tenant = await Tenant.findById(user.tenantId);

      if (!tenant) {
        await user.save(); // save the reset attempt counts first
        return res.status(403).json({
          message: "Tenant not found. Please contact support.",
        });
      }

      if (tenant.status === "inactive") {
        await user.save();
        return res.status(403).json({
          message: "Your account is pending admin approval.",
        });
      }

      if (tenant.status === "blocked") {
        await user.save();
        return res.status(403).json({
          message: "Your account has been blocked.",
        });
      }
    }

    if (user.role === "student" || user.role === "tutor") {
      if (user.status === "inactive") {
        await user.save();
        return res.status(403).json({
          message:
            "Your account is inactive. Please contact your tenant admin.",
        });
      }
    }

    /* MARK USER ONLINE */
    user.onlineStatus = true;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      onlineStatus: false,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist.",
      });
    }

    // Rate-limiting (same pattern as login, only for non-superadmin)
    const isRateLimited = user.role !== "superadmin";

    if (isRateLimited) {
      // Check if currently locked
      if (
        user.forgotPasswordLockedUntil &&
        user.forgotPasswordLockedUntil > Date.now()
      ) {
        const remaining = formatLockRemaining(user.forgotPasswordLockedUntil);
        return res.status(429).json({
          message: `Too many reset attempts. Try again in ${remaining}.`,
          locked: true,
          lockedUntil: user.forgotPasswordLockedUntil,
        });
      }

      // If a previous lock has expired, reset counters
      if (
        user.forgotPasswordLockedUntil &&
        user.forgotPasswordLockedUntil <= Date.now()
      ) {
        user.forgotPasswordAttempts = 0;
        user.forgotPasswordLockedUntil = null;
      }

      user.forgotPasswordAttempts += 1;

      if (user.forgotPasswordAttempts >= MAX_FORGOT_PASSWORD_ATTEMPTS) {
        // Lock for 24 hours
        user.forgotPasswordLockedUntil = new Date(
          Date.now() + FORGOT_PASSWORD_LOCK_DURATION_MS
        );
        await user.save();

        return res.status(429).json({
          message:
            "Too many reset password attempts. This feature is locked for 24 hours.",
          locked: true,
          lockedUntil: user.forgotPasswordLockedUntil,
        });
      }

      await user.save();

      const attemptsLeft =
        MAX_FORGOT_PASSWORD_ATTEMPTS - user.forgotPasswordAttempts;

      // If this is the 4th attempt (1 remaining), include the warning flag
      const lastAttemptWarning = attemptsLeft === 1;

      // Still send the reset email even on the 4th attempt
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await user.save();

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendTenantMail(MAIL_TYPES.PASSWORD_RESET, user, { resetLink });

      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully.",
        attemptsLeft,
        lastAttemptWarning,
      });
    }

    // superadmin – no rate limiting, just send the email
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendTenantMail(MAIL_TYPES.PASSWORD_RESET, user, { resetLink });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.passwordHash = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    // Also clear any login lock so the user can immediately log in after reset
    user.loginAttempts = 0;
    user.loginLockedUntil = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Google Login ─────────────────────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { token, phone, address } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // New user – if phone was not provided, tell the frontend to collect it
      if (!phone || !phone.trim()) {
        return res.status(200).json({
          needsDetails: true,
          message: "Phone number is required to complete registration.",
        });
      }

      user = await User.create({
        name,
        email,
        phone: phone || "",
        profileImage: picture,
        role: "tenant",
        tenantId: null,
        status: "inactive",
        onlineStatus: true,
        passwordHash: Math.random().toString(36),
      });

      const tenant = await Tenant.create({
        name: `${name}'s Organization`,
        ownerUserId: user._id,
        status: "inactive",
        plan: "free",
        ...(address?.trim() ? { address: address.trim() } : {}),
      });

      user.tenantId = tenant._id;
      await user.save();

      sendTenantMail(MAIL_TYPES.TENANT_REGISTER_ADMIN, user).catch((err) =>
        console.error("Admin Mail Error:", err)
      );
      sendTenantMail(MAIL_TYPES.TENANT_WELCOME, user).catch((err) =>
        console.error("Welcome Mail Error:", err)
      );

      return res.status(200).json({
        message:
          "Registration successful! Your account is pending admin approval.",
        token: null,
        userStatus: "inactive",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          status: "inactive",
          profileImage: user.profileImage,
        },
      });
    } else {
      if (user.status === "blocked") {
        return res.status(403).json({
          message: "Your account has been blocked",
        });
      }

      user.onlineStatus = true;
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      await user.save();

      if (user.role !== "superadmin" && user.tenantId) {
        const tenant = await Tenant.findById(user.tenantId);

        if (!tenant) {
          return res.status(403).json({
            message: "Tenant not found. Please contact support.",
          });
        }

        if (tenant.status === "inactive") {
          return res.status(403).json({
            message: "Your account is pending admin approval.",
          });
        }

        if (tenant.status === "blocked") {
          return res.status(403).json({
            message: "Your account has been blocked.",
          });
        }
      }

      if (user.role === "student" || user.role === "tutor") {
        if (user.status === "inactive") {
          return res.status(403).json({
            message:
              "Your account is inactive. Please contact your tenant admin.",
          });
        }
      }
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        status: user.status,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};