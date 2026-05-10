// server/middlewares/role.middleware.js

// ── Role constants ────────────────────────────────────────────────────────────
// Single source of truth for all role names in the app.
// Use these everywhere instead of raw strings to avoid typos.
export const ROLES = {
  SUPERADMIN: "superadmin",
  TENANT:     "tenant",
  TUTOR:      "tutor",
  STUDENT:    "student",
};

// ── authorizeRoles(...roles) ──────────────────────────────────────────────────
// Original middleware kept for full backward compatibility.
// All existing routes continue to work without any changes.
//
// Usage (existing style — still valid):
//   router.get("/path", authMiddleware, authorizeRoles("superadmin"), handler)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: you do not have permission to access this resource",
        requiredRoles: roles,
        yourRole: req.user?.role ?? null,
      });
    }
    next();
  };
};

// ── authorize(...roles) ───────────────────────────────────────────────────────
// Cleaner shorthand alias — same logic, shorter name.
// This is what new code should use going forward.
//
// Usage (new style):
//   import { authorize } from "../middlewares/role.middleware.js";
//   router.get("/path", authMiddleware, authorize("student"), handler)
//   router.get("/path", authMiddleware, authorize("tutor", "tenant"), handler)
export const authorize = authorizeRoles;

// ── Pre-built single-role shortcuts ──────────────────────────────────────────
// Use when a route is locked to exactly one role.
//
//   router.get("/dashboard", authMiddleware, isSuperAdmin, handler)
export const isSuperAdmin = authorizeRoles(ROLES.SUPERADMIN);
export const isTenant     = authorizeRoles(ROLES.TENANT);
export const isTutor      = authorizeRoles(ROLES.TUTOR);
export const isStudent    = authorizeRoles(ROLES.STUDENT);

// ── hasRole(user, ...roles) — pure helper for controllers ────────────────────
// Replaces bare string checks inside controller logic.
//
// Before:  if (user.role === "student")
// After:   if (hasRole(req.user, ROLES.STUDENT))
//
// Also supports multi-role checks:
//          if (hasRole(req.user, ROLES.TUTOR, ROLES.TENANT))
export const hasRole = (user, ...roles) => {
  return !!(user && roles.includes(user.role));
};
