// backend/src/controllers/superadmin.controller.js
import { Tenant } from "../models/tenant.model.js";

import { User } from "../models/user.model.js";

// 🔥 Get all tenants
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().populate(
      "ownerUserId",
      "name email status",
    );

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 Approve tenant
export const approveTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.status = "active";
    await tenant.save();

    await User.findByIdAndUpdate(tenant.ownerUserId, {
      status: "active",
    });

    res.json({ message: "Tenant approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 Block tenant
export const blockTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.status = "blocked";
    await tenant.save();

    await User.findByIdAndUpdate(tenant.ownerUserId, {
      status: "blocked",
    });

    res.json({ message: "Tenant blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
