//backend/src/middlewares/tenant.middleware.js

export const tenantIsolation = (req, res, next) => {
  const { role, tenantId } = req.user;

  // Super admin should NEVER access tenant data
  if (role === "superadmin") {
    return res
      .status(403)
      .json({ message: "Super admin cannot access tenant resources" });
  }

  if (!tenantId) {
    return res
      .status(400)
      .json({ message: "Tenant context missing" });
  }

  // Attach tenantId for controllers to use
  req.tenantId = tenantId;

  next();
};
