// backend/src/routes/superadmin.routes.js

import express from "express";
import {
  getAllTenants,
  approveTenant,
  blockTenant,
} from "../controllers/superadmin.controller.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";
import {allowRoles }from "../middlewares/role.middleware.js";

const router = express.Router();

// Only superadmin can access
router.use(authMiddleware);
router.use(allowRoles("superadmin"));

router.get("/tenants", getAllTenants);
router.patch("/approve/:tenantId", approveTenant);
router.patch("/block/:tenantId", blockTenant);

export default router;
